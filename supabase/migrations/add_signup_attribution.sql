-- Migration: Add signup attribution columns to profiles table
-- Run this in Supabase SQL Editor if the profiles table already exists

-- All columns are nullable with no default: NULL means "unknown," which is
-- true for every pre-existing user and for any signup where attribution
-- capture failed (private browsing, blocked storage, etc).
alter table public.profiles add column if not exists signup_channel text;
alter table public.profiles add column if not exists signup_referrer_host text;
alter table public.profiles add column if not exists signup_landing_path text;
alter table public.profiles add column if not exists utm_source text;
alter table public.profiles add column if not exists utm_medium text;
alter table public.profiles add column if not exists utm_campaign text;
alter table public.profiles add column if not exists utm_term text;
alter table public.profiles add column if not exists utm_content text;
alter table public.profiles add column if not exists signup_attributed_at timestamptz;

-- Constrain signup_channel to the values deriveChannel() in src/lib/attribution.ts
-- can produce, so a typo in the derivation logic fails loudly at write time.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_signup_channel_check'
  ) then
    alter table public.profiles
      add constraint profiles_signup_channel_check
      check (signup_channel in ('direct', 'organic_search', 'social', 'referral', 'paid', 'internal'));
  end if;
end $$;

-- Update the signup trigger to read attribution off raw_user_meta_data,
-- the same way it already reads first_name/last_name.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile row (extract name from metadata if available, e.g. Google OAuth)
  insert into public.profiles (
    id, email, first_name, last_name,
    signup_channel, signup_referrer_host, signup_landing_path,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    signup_attributed_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', split_part(coalesce(new.raw_user_meta_data ->> 'full_name', ''), ' ', 1), ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', nullif(substring(coalesce(new.raw_user_meta_data ->> 'full_name', '') from position(' ' in coalesce(new.raw_user_meta_data ->> 'full_name', '')) + 1), ''), ''),
    new.raw_user_meta_data ->> 'signup_channel',
    new.raw_user_meta_data ->> 'signup_referrer_host',
    new.raw_user_meta_data ->> 'signup_landing_path',
    new.raw_user_meta_data ->> 'utm_source',
    new.raw_user_meta_data ->> 'utm_medium',
    new.raw_user_meta_data ->> 'utm_campaign',
    new.raw_user_meta_data ->> 'utm_term',
    new.raw_user_meta_data ->> 'utm_content',
    case when new.raw_user_meta_data ->> 'signup_channel' is not null then now() else null end
  );

  -- Initialize storage folders with a .keep placeholder
  insert into storage.objects (bucket_id, name, owner, metadata)
  values
    ('hsa-documents', new.id || '/receipt/.keep', new.id, '{"placeholder":true}'::jsonb),
    ('hsa-documents', new.id || '/eob/.keep', new.id, '{"placeholder":true}'::jsonb),
    ('hsa-documents', new.id || '/invoice/.keep', new.id, '{"placeholder":true}'::jsonb),
    ('hsa-documents', new.id || '/cc-statement/.keep', new.id, '{"placeholder":true}'::jsonb)
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Prevent a user from overwriting their own attribution via the "update own
-- profile" policy once it has been set. Not a security boundary (this is
-- analytics, not access control) but keeps the data trustworthy.
create or replace function public.protect_signup_attribution()
returns trigger as $$
begin
  if old.signup_attributed_at is not null then
    new.signup_channel := old.signup_channel;
    new.signup_referrer_host := old.signup_referrer_host;
    new.signup_landing_path := old.signup_landing_path;
    new.utm_source := old.utm_source;
    new.utm_medium := old.utm_medium;
    new.utm_campaign := old.utm_campaign;
    new.utm_term := old.utm_term;
    new.utm_content := old.utm_content;
    new.signup_attributed_at := old.signup_attributed_at;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_protect_signup_attribution on public.profiles;
create trigger trg_protect_signup_attribution
  before update on public.profiles
  for each row
  execute function public.protect_signup_attribution();
