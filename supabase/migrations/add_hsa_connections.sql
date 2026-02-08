-- Create hsa_connections table for Plaid HSA provider integration
create table if not exists public.hsa_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plaid_item_id text not null,
  plaid_access_token text not null,
  institution_name text not null default '',
  institution_id text not null default '',
  account_id text,
  account_name text,
  last_synced_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id)
);

alter table public.hsa_connections enable row level security;

create policy "Users can view own connections"
  on public.hsa_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert own connections"
  on public.hsa_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own connections"
  on public.hsa_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete own connections"
  on public.hsa_connections for delete
  using (auth.uid() = user_id);
