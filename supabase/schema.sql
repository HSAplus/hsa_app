-- HSA Expense Tracker - Supabase Database Setup
-- Based on ViaBenefits HSA Quickstart Guide, Reimbursement Request Form,
-- HSA Eligible Expense List, and LPFSA/HCFSA Cheat Sheet specifications.
-- Run this SQL in the Supabase SQL Editor (https://app.supabase.com → SQL Editor)

-- 1. Create the expenses table
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Core expense fields (per ViaBenefits Reimbursement Request Form)
  description text not null,
  amount decimal(10,2) not null,
  date_of_service date not null,
  date_of_service_end date,              -- service date range (from ViaBenefits form)
  provider text not null default '',

  -- Patient info (per ViaBenefits Reimbursement Request Form)
  patient_name text not null default '',
  patient_relationship text not null default 'self'
    check (patient_relationship in ('self', 'spouse', 'dependent_child', 'domestic_partner')),

  -- Account & category (per HSA/LPFSA/HCFSA cheat sheet)
  account_type text not null default 'hsa'
    check (account_type in ('hsa', 'lpfsa', 'hcfsa')),
  category text not null default 'medical'
    check (category in ('medical', 'dental', 'vision', 'prescription', 'mental_health', 'hearing', 'preventive_care', 'other')),
  expense_type text not null default '',  -- specific eligible expense (e.g., "Acupuncture", "Contact lenses")

  -- Reimbursement tracking (the core HSA strategy: mark "N" until you claim)
  reimbursed boolean not null default false,
  reimbursed_date date,
  reimbursed_amount decimal(10,2),

  -- Claim type (per ViaBenefits Reimbursement Request Form)
  claim_type text not null default 'new'
    check (claim_type in ('new', 'resubmission', 'appeal')),

  -- Payment details
  payment_method text not null default 'credit_card',

  -- Notes
  notes text,

  -- Document links (per ViaBenefits: EOB, Invoice/Bill, Receipt, CC Statement)
  -- EOB = "first line of proof that the expense was medical and legitimate"
  -- Invoice/Bill = "comes directly from the provider, detailing the services and cost"
  -- Receipt / CC Statement = "proof you paid out-of-pocket"
  eob_url text,
  invoice_url text,
  receipt_url text,
  credit_card_statement_url text,

  -- IRS Audit Readiness (per HRMorning: 20% penalty + income tax on unproven purchases)
  -- https://www.hrmorning.com/articles/hsa-requirements-receipts-recordkeeping/
  -- Tax returns remain open for 7 years; keep records at least that long.
  tax_year integer not null default extract(year from current_date),
  audit_ready boolean not null default false,  -- computed flag: all required docs attached

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.expenses enable row level security;

-- 3. Create policies so users can only access their own data
create policy "Users can view their own expenses"
  on public.expenses
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on public.expenses
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses
  for delete
  using (auth.uid() = user_id);

-- 4. Create indexes for faster queries
create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_expenses_date on public.expenses(date_of_service desc);
create index if not exists idx_expenses_account_type on public.expenses(account_type);
create index if not exists idx_expenses_reimbursed on public.expenses(reimbursed);
create index if not exists idx_expenses_tax_year on public.expenses(tax_year);

-- 5. Auto-compute audit_ready flag on insert/update
-- Per HRMorning: need receipt + (EOB or invoice) to prove eligibility in an audit.
create or replace function public.compute_audit_ready()
returns trigger as $$
begin
  new.audit_ready := (
    new.receipt_url is not null and new.receipt_url != '' and
    (
      (new.eob_url is not null and new.eob_url != '') or
      (new.invoice_url is not null and new.invoice_url != '')
    )
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_compute_audit_ready
  before insert or update on public.expenses
  for each row
  execute function public.compute_audit_ready();

-- 6. Create the hsa-documents storage bucket for file uploads
-- Documents are stored per-user: {user_id}/{folder}/{timestamp}-{filename}
-- Folders: receipt, eob, invoice, cc-statement
insert into storage.buckets (id, name, public)
values ('hsa-documents', 'hsa-documents', true)
on conflict (id) do nothing;

-- 7. Storage policies — users can only manage files in their own folder
create policy "Users can upload their own documents"
  on storage.objects
  for insert
  with check (
    bucket_id = 'hsa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own documents"
  on storage.objects
  for select
  using (
    bucket_id = 'hsa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own documents"
  on storage.objects
  for update
  using (
    bucket_id = 'hsa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own documents"
  on storage.objects
  for delete
  using (
    bucket_id = 'hsa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 8. Allow public read access so uploaded doc URLs work (bucket is public)
create policy "Public can read hsa-documents"
  on storage.objects
  for select
  using (bucket_id = 'hsa-documents');
