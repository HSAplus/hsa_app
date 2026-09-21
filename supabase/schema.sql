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
  -- Stored as arrays to support multiple documents per type
  eob_urls text[] not null default '{}',
  invoice_urls text[] not null default '{}',
  receipt_urls text[] not null default '{}',
  credit_card_statement_urls text[] not null default '{}',

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
    array_length(new.receipt_urls, 1) is not null and array_length(new.receipt_urls, 1) > 0 and
    (
      (array_length(new.eob_urls, 1) is not null and array_length(new.eob_urls, 1) > 0) or
      (array_length(new.invoice_urls, 1) is not null and array_length(new.invoice_urls, 1) > 0)
    )
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_compute_audit_ready
  before insert or update on public.expenses
  for each row
  execute function public.compute_audit_ready();

-- 6. Create user profiles table (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  first_name text not null default '',
  middle_name text not null default '',
  last_name text not null default '',
  date_of_birth date,
  current_hsa_balance decimal(12,2) not null default 0.00,
  annual_contribution decimal(10,2) not null default 4150.00,
  expected_annual_return decimal(5,2) not null default 7.00,
  time_horizon_years integer not null default 20,
  federal_tax_bracket decimal(4,1) not null default 22.0,
  state_tax_rate decimal(4,1) not null default 5.0,
  coverage_type text not null default 'individual',
  contribution_increase_rate decimal(5,2) not null default 0.00,
  email_digest_enabled boolean not null default false,
  email_digest_frequency text not null default 'monthly'
    check (email_digest_frequency in ('weekly', 'monthly')),
  onboarding_completed boolean not null default false,
  -- Signup attribution (nullable: NULL means "unknown," true for every
  -- pre-existing user). See src/lib/attribution.ts for channel derivation.
  signup_channel text
    check (signup_channel in ('direct', 'organic_search', 'social', 'referral', 'paid', 'internal')),
  signup_referrer_host text,
  signup_landing_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  signup_attributed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Once signup attribution is set, silently discard attempts to change it via
-- this policy so a user can't overwrite their own attribution through the API.
-- Not a security boundary (this is analytics, not access control).
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
$$ language plpgsql
  -- Deliberately NOT security definer: it only copies old values over new
  -- ones, so it needs no elevation. pg_temp last so a temp table cannot
  -- shadow a relation name.
  set search_path = public, pg_temp;

create trigger trg_protect_signup_attribution
  before update on public.profiles
  for each row
  execute function public.protect_signup_attribution();

-- 6b. Create dependents table (spouse, children, etc.)
create table if not exists public.dependents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  relationship text not null
    check (relationship in ('spouse', 'dependent_child', 'domestic_partner')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.dependents enable row level security;

create policy "Users can view their own dependents"
  on public.dependents for select using (auth.uid() = user_id);

create policy "Users can insert their own dependents"
  on public.dependents for insert with check (auth.uid() = user_id);

create policy "Users can update their own dependents"
  on public.dependents for update using (auth.uid() = user_id);

create policy "Users can delete their own dependents"
  on public.dependents for delete using (auth.uid() = user_id);

create index if not exists idx_dependents_user_id on public.dependents(user_id);

-- 7. Auto-create profile + storage folders on signup
-- This trigger fires when a new user is inserted into auth.users.
-- It creates a profile row and initializes the user's document folder
-- structure in the hsa-documents bucket with a .keep placeholder.
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
  -- This ensures the folder structure exists before the user uploads
  insert into storage.objects (bucket_id, name, owner, metadata)
  values
    ('hsa-documents', new.id || '/receipt/.keep', new.id, '{"placeholder":true}'::jsonb),
    ('hsa-documents', new.id || '/eob/.keep', new.id, '{"placeholder":true}'::jsonb),
    ('hsa-documents', new.id || '/invoice/.keep', new.id, '{"placeholder":true}'::jsonb),
    ('hsa-documents', new.id || '/cc-statement/.keep', new.id, '{"placeholder":true}'::jsonb)
  on conflict do nothing;

  return new;
end;
$$ language plpgsql
  security definer
  -- The highest-privilege trigger in the system: runs as the definer on
  -- every signup and writes to public.profiles and storage.objects. Pinned
  -- so the unqualified calls above resolve predictably; pg_temp last so a
  -- temp table cannot shadow a relation name.
  set search_path = public, pg_temp;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 8. Create the hsa-documents storage bucket for file uploads
-- Documents are stored per-user: {user_id}/{folder}/{timestamp}-{filename}
-- Folders: receipt, eob, invoice, cc-statement
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hsa-documents',
  'hsa-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'application/pdf'];

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

-- ────────────────────────────────────────────────
-- Expense Templates
-- ────────────────────────────────────────────────

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
  on public.expense_templates for select using (auth.uid() = user_id);
create policy "Users can insert own templates"
  on public.expense_templates for insert with check (auth.uid() = user_id);
create policy "Users can update own templates"
  on public.expense_templates for update using (auth.uid() = user_id);
create policy "Users can delete own templates"
  on public.expense_templates for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- HSA Connections (Plaid)
-- ────────────────────────────────────────────────

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
  on public.hsa_connections for select using (auth.uid() = user_id);
create policy "Users can insert own connections"
  on public.hsa_connections for insert with check (auth.uid() = user_id);
create policy "Users can update own connections"
  on public.hsa_connections for update using (auth.uid() = user_id);
create policy "Users can delete own connections"
  on public.hsa_connections for delete using (auth.uid() = user_id);

-- Plaid sync extensions + imported transactions (see migrations/plaid_sync_transactions.sql)
alter table public.hsa_connections add column if not exists transactions_cursor text;
alter table public.hsa_connections add column if not exists last_transactions_sync_at timestamptz;
alter table public.hsa_connections add column if not exists sync_status text not null default 'ok'
  check (sync_status in ('ok', 'error', 'login_required'));
alter table public.hsa_connections add column if not exists sync_error text;

alter table public.profiles add column if not exists plaid_inbound_ytd decimal(12,2);
alter table public.profiles add column if not exists last_plaid_contribution_sync_at timestamptz;

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

-- ────────────────────────────────────────────────
-- HSA Administrators & Claims
-- ────────────────────────────────────────────────

-- Canonical registry of every HSA provider we know about (800+ rows), serving
-- both claim routing and the public /hsa-providers content. See
-- supabase/migrations/add_provider_registry.sql for the reasoning behind each
-- column group; has_guide is the switch between "registry row" and
-- "published page".
create table if not exists public.hsa_administrators (
  -- Internal key. claims.administrator_id and profiles.hsa_administrator_id
  -- reference it with no ON UPDATE CASCADE, so it must never change.
  id text primary key,
  -- Public path segment at /hsa-providers/[slug]. Separate from id so a URL
  -- can change for SEO, or when a provider renames, at the cost of a redirect
  -- rather than a data migration. Backfilled and auto-derived by the trigger
  -- below, so a hand-written insert can omit it.
  slug text not null
    constraint hsa_administrators_slug_format_check
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,

  -- 'self_directed' covers providers like Fidelity where no claim exists —
  -- the accountholder withdraws from their own custodial account. Duplicated
  -- as a check on public.claims; the two must move together.
  submission_tier text not null
    check (submission_tier in ('api', 'email', 'fax', 'portal', 'mail', 'self_directed')),

  -- Internal routing config — excluded from the public view
  fax_number text,
  email_address text,
  api_base_url text,
  form_template_id text,
  mailing_address text,
  submission_notes text,

  -- Registry
  legal_name text,
  aliases text[] not null default '{}'::text[],
  former_names text[] not null default '{}'::text[],  -- e.g. Inspira: {PayFlex}
  org_type text check (org_type is null or org_type in (
    'bank', 'credit_union', 'non_bank_custodian', 'tpa',
    'health_plan', 'investment_platform', 'payroll_benefits', 'other')),
  website_url text,
  portal_url text,
  support_phone text,
  hq_state text,
  is_custodian boolean not null default false,      -- holds funds, files 1099-SA
  is_administrator boolean not null default false,  -- adjudicates claims
  account_types text[] not null default '{hsa}'::text[],  -- describes the provider, not our scope
  market_share_pct numeric,
  accounts_count bigint,
  logo_url text,
  active boolean not null default true,

  -- Submission
  claim_form_url text,
  routing_varies_by_employer boolean not null default false,
  docs_required text check (docs_required is null or docs_required in (
    'none', 'always', 'varies', 'over_threshold')),
  accepts_email_phi boolean not null default false,  -- unencrypted email is not HIPAA-compliant for PHI

  -- Editorial (populated only for researched providers)
  has_guide boolean not null default false,
  guide_summary text,
  guide_body text,
  sources jsonb not null default '[]'::jsonb,
  last_reviewed date,

  -- Provenance
  data_source text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint hsa_administrators_sources_is_array_check
    check (jsonb_typeof(sources) = 'array'),
  -- A row cannot become a public page without a summary and a review date
  constraint hsa_administrators_guide_ready_check
    check (has_guide = false
           or (guide_summary is not null and last_reviewed is not null))
);

-- Mirrored in scripts/import-providers.mjs; the two must agree or the same
-- provider gets a different URL depending on how it entered the table.
-- unaccent() is the part that keeps them agreeing — the JS side strips
-- combining marks after NFKD normalization.
create extension if not exists unaccent;

-- STABLE, not IMMUTABLE: unaccent() depends on a reloadable dictionary. Only
-- called from a trigger, never an index expression, so stable costs nothing.
create or replace function public.slugify(value text)
returns text
language sql
stable
as $$
  select nullif(
    trim(both '-' from
      regexp_replace(
        regexp_replace(
          lower(unaccent(coalesce(value, ''))),
          '&', ' and ', 'g'
        ),
        '[^a-z0-9]+', '-', 'g'
      )
    ),
    ''
  );
$$;

create or replace function public.maintain_hsa_administrator_row()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.slug is null then
    new.slug := coalesce(
      public.slugify(new.name),
      public.slugify(new.id),
      'provider'
    );
  end if;

  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_hsa_administrators_maintain on public.hsa_administrators;

create trigger trg_hsa_administrators_maintain
  before insert or update on public.hsa_administrators
  for each row
  execute function public.maintain_hsa_administrator_row();

create unique index if not exists idx_hsa_administrators_slug
  on public.hsa_administrators (slug);
create index if not exists idx_hsa_administrators_has_guide
  on public.hsa_administrators (slug) where has_guide = true;
create index if not exists idx_hsa_administrators_active
  on public.hsa_administrators (active) where active = true;
create index if not exists idx_hsa_administrators_org_type
  on public.hsa_administrators (org_type);

-- Typeahead: 800 rows are never shipped to the client, so the picker queries
-- server-side per keystroke and needs these to stay index scans.
create extension if not exists pg_trgm;
create index if not exists idx_hsa_administrators_name_trgm
  on public.hsa_administrators using gin (name gin_trgm_ops);
create index if not exists idx_hsa_administrators_aliases
  on public.hsa_administrators using gin (aliases);
create index if not exists idx_hsa_administrators_former_names
  on public.hsa_administrators using gin (former_names);

alter table public.hsa_administrators enable row level security;

create policy "Authenticated users can read hsa_administrators"
  on public.hsa_administrators
  for select
  using (auth.role() = 'authenticated');

-- /hsa-providers is a logged-out marketing route, so it needs anonymous read —
-- but the table also holds internal routing config. RLS is row-level and
-- cannot express "these columns only", so the public surface is this view.
-- SECURITY DEFINER (security_invoker = off) is the mechanism, not an
-- oversight: it is what lets the base table keep its authenticated-only
-- policy while anon reads the safe projection.
create or replace view public.hsa_providers_public
with (security_invoker = off)
as
select
  id, slug, name, legal_name, aliases, former_names, org_type,
  website_url, portal_url, support_phone, hq_state,
  is_custodian, is_administrator, account_types,
  market_share_pct, accounts_count, logo_url,
  submission_tier, claim_form_url, routing_varies_by_employer, docs_required,
  has_guide, guide_summary, guide_body, sources, last_reviewed, updated_at
from public.hsa_administrators
where active = true;

revoke all on public.hsa_providers_public from public;
grant select on public.hsa_providers_public to anon, authenticated;

create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_id uuid not null unique references public.expenses(id) on delete cascade,
  administrator_id text not null references public.hsa_administrators(id),
  -- Must stay in sync with the matching check on hsa_administrators
  submission_tier text not null
    check (submission_tier in ('api', 'email', 'fax', 'portal', 'mail', 'self_directed')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'processing', 'approved', 'denied', 'reimbursed')),
  submitted_at timestamp with time zone,
  submitted_via text,
  external_claim_id text,
  fax_confirmation_id text,
  email_message_id text,
  form_data jsonb not null default '{}'::jsonb,
  document_urls text[] not null default '{}'::text[],
  generated_pdf_url text,
  denial_reason text,
  reimbursed_amount numeric,
  reimbursed_date date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.claims enable row level security;

create policy "Users can view own claims"
  on public.claims for select
  using (auth.uid() = user_id);

create policy "Users can insert own claims"
  on public.claims for insert
  with check (auth.uid() = user_id);

create policy "Users can update own claims"
  on public.claims for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own claims"
  on public.claims for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- Performance Indexes
-- ────────────────────────────────────────────────

create index if not exists idx_profiles_stripe_customer_id
  on public.profiles (stripe_customer_id);

