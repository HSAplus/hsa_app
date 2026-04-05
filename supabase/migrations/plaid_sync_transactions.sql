-- Plaid recurring sync + imported transactions for reconciliation

-- hsa_connections: sync state
alter table public.hsa_connections add column if not exists transactions_cursor text;
alter table public.hsa_connections add column if not exists last_transactions_sync_at timestamptz;
alter table public.hsa_connections add column if not exists sync_status text not null default 'ok'
  check (sync_status in ('ok', 'error', 'login_required'));
alter table public.hsa_connections add column if not exists sync_error text;

-- profiles: heuristic inbound deposits (Plaid depository: negative amount = credit)
alter table public.profiles add column if not exists plaid_inbound_ytd decimal(12,2);
alter table public.profiles add column if not exists last_plaid_contribution_sync_at timestamptz;

-- Imported Plaid transactions (reconciliation against manual expenses)
create table if not exists public.plaid_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plaid_transaction_id text not null,
  account_id text,
  amount decimal(12,2) not null,
  iso_currency_code text not null default 'USD',
  date date not null,
  name text not null default '',
  merchant_name text,
  pending boolean not null default false,
  reconciliation_status text not null default 'unmatched'
    check (reconciliation_status in ('unmatched', 'matched', 'ignored', 'discrepancy')),
  matched_expense_id uuid references public.expenses(id) on delete set null,
  raw jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, plaid_transaction_id)
);

create index if not exists idx_plaid_transactions_user_date
  on public.plaid_transactions (user_id, date desc);
create index if not exists idx_plaid_transactions_status
  on public.plaid_transactions (user_id, reconciliation_status);

alter table public.plaid_transactions enable row level security;

create policy "Users can view own plaid transactions"
  on public.plaid_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own plaid transactions"
  on public.plaid_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own plaid transactions"
  on public.plaid_transactions for update using (auth.uid() = user_id);
create policy "Users can delete own plaid transactions"
  on public.plaid_transactions for delete using (auth.uid() = user_id);
