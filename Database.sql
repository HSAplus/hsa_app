-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.claims (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  expense_id uuid NOT NULL UNIQUE,
  administrator_id text NOT NULL,
  submission_tier text NOT NULL CHECK (submission_tier = ANY (ARRAY['api'::text, 'email'::text, 'fax'::text, 'portal'::text])),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'processing'::text, 'approved'::text, 'denied'::text, 'reimbursed'::text])),
  submitted_at timestamp with time zone,
  submitted_via text,
  external_claim_id text,
  fax_confirmation_id text,
  email_message_id text,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  document_urls ARRAY NOT NULL DEFAULT '{}'::text[],
  generated_pdf_url text,
  denial_reason text,
  reimbursed_amount numeric,
  reimbursed_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT claims_pkey PRIMARY KEY (id),
  CONSTRAINT claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT claims_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id),
  CONSTRAINT claims_administrator_id_fkey FOREIGN KEY (administrator_id) REFERENCES public.hsa_administrators(id)
);
CREATE TABLE public.dependents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  relationship text NOT NULL CHECK (relationship = ANY (ARRAY['spouse'::text, 'dependent_child'::text, 'domestic_partner'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dependents_pkey PRIMARY KEY (id),
  CONSTRAINT dependents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.expense_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  amount numeric NOT NULL,
  provider text NOT NULL DEFAULT ''::text,
  patient_name text NOT NULL DEFAULT ''::text,
  patient_relationship text NOT NULL DEFAULT 'self'::text CHECK (patient_relationship = ANY (ARRAY['self'::text, 'spouse'::text, 'dependent_child'::text, 'domestic_partner'::text])),
  account_type text NOT NULL DEFAULT 'hsa'::text CHECK (account_type = ANY (ARRAY['hsa'::text, 'lpfsa'::text, 'hcfsa'::text])),
  category text NOT NULL DEFAULT 'medical'::text CHECK (category = ANY (ARRAY['medical'::text, 'dental'::text, 'vision'::text, 'prescription'::text, 'mental_health'::text, 'hearing'::text, 'preventive_care'::text, 'other'::text])),
  expense_type text NOT NULL DEFAULT ''::text,
  payment_method text NOT NULL DEFAULT 'credit_card'::text,
  frequency text NOT NULL DEFAULT 'monthly'::text CHECK (frequency = ANY (ARRAY['weekly'::text, 'monthly'::text, 'quarterly'::text, 'annually'::text, 'as_needed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expense_templates_pkey PRIMARY KEY (id),
  CONSTRAINT expense_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  date_of_service date NOT NULL,
  date_of_service_end date,
  provider text NOT NULL DEFAULT ''::text,
  patient_name text NOT NULL DEFAULT ''::text,
  patient_relationship text NOT NULL DEFAULT 'self'::text CHECK (patient_relationship = ANY (ARRAY['self'::text, 'spouse'::text, 'dependent_child'::text, 'domestic_partner'::text])),
  account_type text NOT NULL DEFAULT 'hsa'::text CHECK (account_type = ANY (ARRAY['hsa'::text, 'lpfsa'::text, 'hcfsa'::text])),
  category text NOT NULL DEFAULT 'medical'::text CHECK (category = ANY (ARRAY['medical'::text, 'dental'::text, 'vision'::text, 'prescription'::text, 'mental_health'::text, 'hearing'::text, 'preventive_care'::text, 'other'::text])),
  expense_type text NOT NULL DEFAULT ''::text,
  reimbursed boolean NOT NULL DEFAULT false,
  reimbursed_date date,
  reimbursed_amount numeric,
  claim_type text NOT NULL DEFAULT 'new'::text CHECK (claim_type = ANY (ARRAY['new'::text, 'resubmission'::text, 'appeal'::text])),
  payment_method text NOT NULL DEFAULT 'credit_card'::text,
  notes text,
  tax_year integer NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  audit_ready boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  receipt_urls ARRAY NOT NULL DEFAULT '{}'::text[],
  eob_urls ARRAY NOT NULL DEFAULT '{}'::text[],
  invoice_urls ARRAY NOT NULL DEFAULT '{}'::text[],
  credit_card_statement_urls ARRAY NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.hsa_administrators (
  id text NOT NULL,
  name text NOT NULL,
  submission_tier text NOT NULL CHECK (submission_tier = ANY (ARRAY['api'::text, 'email'::text, 'fax'::text, 'portal'::text])),
  fax_number text,
  email_address text,
  portal_url text,
  api_base_url text,
  form_template_id text,
  mailing_address text,
  market_share_pct numeric,
  logo_url text,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT hsa_administrators_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hsa_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plaid_item_id text NOT NULL,
  plaid_access_token text NOT NULL,
  institution_name text NOT NULL DEFAULT ''::text,
  institution_id text NOT NULL DEFAULT ''::text,
  account_id text,
  account_name text,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hsa_connections_pkey PRIMARY KEY (id),
  CONSTRAINT hsa_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text NOT NULL DEFAULT ''::text,
  last_name text NOT NULL DEFAULT ''::text,
  date_of_birth date,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expected_annual_return numeric NOT NULL DEFAULT 7.00,
  time_horizon_years integer NOT NULL DEFAULT 20,
  middle_name text NOT NULL DEFAULT ''::text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  current_hsa_balance numeric NOT NULL DEFAULT 0.00,
  annual_contribution numeric NOT NULL DEFAULT 4150.00,
  federal_tax_bracket numeric NOT NULL DEFAULT 22.0,
  state_tax_rate numeric NOT NULL DEFAULT 5.0,
  coverage_type text NOT NULL DEFAULT 'individual'::text,
  contribution_increase_rate numeric NOT NULL DEFAULT 0.00,
  email_digest_enabled boolean NOT NULL DEFAULT false,
  email_digest_frequency text NOT NULL DEFAULT 'monthly'::text CHECK (email_digest_frequency = ANY (ARRAY['weekly'::text, 'monthly'::text])),
  hsa_administrator_id text,
  plan_type text NOT NULL DEFAULT 'free'::text CHECK (plan_type = ANY (ARRAY['free'::text, 'plus'::text])),
  subscription_status text NOT NULL DEFAULT 'inactive'::text CHECK (subscription_status = ANY (ARRAY['inactive'::text, 'trialing'::text, 'active'::text, 'past_due'::text, 'canceled'::text])),
  stripe_customer_id text,
  stripe_subscription_id text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_hsa_administrator_id_fkey FOREIGN KEY (hsa_administrator_id) REFERENCES public.hsa_administrators(id)
);

-- Plaid sync + plaid_transactions: mirror supabase/migrations/plaid_sync_transactions.sql
ALTER TABLE public.hsa_connections ADD COLUMN IF NOT EXISTS transactions_cursor text;
ALTER TABLE public.hsa_connections ADD COLUMN IF NOT EXISTS last_transactions_sync_at timestamptz;
ALTER TABLE public.hsa_connections ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'ok'
  CHECK (sync_status IN ('ok', 'error', 'login_required'));
ALTER TABLE public.hsa_connections ADD COLUMN IF NOT EXISTS sync_error text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plaid_inbound_ytd decimal(12,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_plaid_contribution_sync_at timestamptz;
CREATE TABLE IF NOT EXISTS public.plaid_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plaid_transaction_id text NOT NULL,
  account_id text,
  amount decimal(12,2) NOT NULL,
  iso_currency_code text NOT NULL DEFAULT 'USD',
  date date NOT NULL,
  name text NOT NULL DEFAULT '',
  merchant_name text,
  pending boolean NOT NULL DEFAULT false,
  reconciliation_status text NOT NULL DEFAULT 'unmatched'
    CHECK (reconciliation_status IN ('unmatched', 'matched', 'ignored', 'discrepancy')),
  matched_expense_id uuid REFERENCES public.expenses(id) ON DELETE SET NULL,
  raw jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, plaid_transaction_id)
);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_user_date ON public.plaid_transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_status ON public.plaid_transactions (user_id, reconciliation_status);
-- RLS policies for plaid_transactions: see supabase/migrations/plaid_sync_transactions.sql