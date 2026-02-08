-- Add coverage_type and contribution_increase_rate columns to profiles
alter table public.profiles
  add column if not exists coverage_type text not null default 'individual';

alter table public.profiles
  add column if not exists contribution_increase_rate decimal(5,2) not null default 0.00;
