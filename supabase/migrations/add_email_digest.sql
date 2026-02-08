-- Add email digest preferences to profiles
alter table public.profiles
  add column if not exists email_digest_enabled boolean not null default false,
  add column if not exists email_digest_frequency text not null default 'monthly'
    check (email_digest_frequency in ('weekly', 'monthly'));
