-- Migration: Add first_name, last_name, date_of_birth to profiles table
-- Run this in Supabase SQL Editor if the profiles table already exists

-- Add new columns
alter table public.profiles add column if not exists first_name text not null default '';
alter table public.profiles add column if not exists last_name text not null default '';
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists updated_at timestamptz default now() not null;

-- Add insert policy (was missing)
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Update the trigger to extract names from metadata on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile row (extract name from metadata if available, e.g. Google OAuth)
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', split_part(coalesce(new.raw_user_meta_data ->> 'full_name', ''), ' ', 1), ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', nullif(substring(coalesce(new.raw_user_meta_data ->> 'full_name', '') from position(' ' in coalesce(new.raw_user_meta_data ->> 'full_name', '')) + 1), ''), '')
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
