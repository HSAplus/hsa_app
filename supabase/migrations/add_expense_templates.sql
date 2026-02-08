-- Create expense_templates table for recurring expense patterns
create table if not exists public.expense_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text not null default '',
  amount decimal(10,2) not null,
  provider text not null default '',
  patient_name text not null default '',
  patient_relationship text not null default 'self'
    check (patient_relationship in ('self', 'spouse', 'dependent_child', 'domestic_partner')),
  account_type text not null default 'hsa'
    check (account_type in ('hsa', 'lpfsa', 'hcfsa')),
  category text not null default 'medical'
    check (category in ('medical', 'dental', 'vision', 'prescription', 'mental_health', 'hearing', 'preventive_care', 'other')),
  expense_type text not null default '',
  payment_method text not null default 'credit_card',
  frequency text not null default 'monthly'
    check (frequency in ('weekly', 'monthly', 'quarterly', 'annually', 'as_needed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.expense_templates enable row level security;

create policy "Users can view own templates"
  on public.expense_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.expense_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.expense_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.expense_templates for delete
  using (auth.uid() = user_id);
