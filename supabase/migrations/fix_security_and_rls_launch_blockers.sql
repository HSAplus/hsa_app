-- ==============================================================================
-- Migration: fix_security_and_rls_launch_blockers.sql
-- Resolves: CRIT-1, CRIT-2, HIGH-3, PERF-1
-- ==============================================================================

-- 1. CRIT-1 & HIGH-3: Secure hsa-documents storage bucket
-- Make bucket private and enforce file size and MIME type limits at the storage layer
update storage.buckets
set public = false,
    file_size_limit = 10485760, -- 10MB
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'application/pdf'
    ]
where id = 'hsa-documents';

-- Drop unauthenticated public read policy
drop policy if exists "Public can read hsa-documents" on storage.objects;

-- Ensure user-scoped storage policies exist
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can view their own documents'
  ) then
    create policy "Users can view their own documents"
      on storage.objects for select
      using (
        bucket_id = 'hsa-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their own documents'
  ) then
    create policy "Users can upload their own documents"
      on storage.objects for insert
      with check (
        bucket_id = 'hsa-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update their own documents'
  ) then
    create policy "Users can update their own documents"
      on storage.objects for update
      using (
        bucket_id = 'hsa-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their own documents'
  ) then
    create policy "Users can delete their own documents"
      on storage.objects for delete
      using (
        bucket_id = 'hsa-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- 2. CRIT-2: Enable RLS on claims and hsa_administrators

-- Ensure hsa_administrators table exists and has RLS enabled
create table if not exists public.hsa_administrators (
  id text primary key,
  name text not null,
  submission_tier text not null check (submission_tier in ('api', 'email', 'fax', 'portal')),
  fax_number text,
  email_address text,
  portal_url text,
  api_base_url text,
  form_template_id text,
  mailing_address text,
  market_share_pct numeric,
  logo_url text,
  active boolean not null default true
);

alter table public.hsa_administrators enable row level security;

drop policy if exists "Authenticated users can read hsa_administrators" on public.hsa_administrators;
drop policy if exists "Users can read hsa_administrators" on public.hsa_administrators;
drop policy if exists "Anyone can read administrators" on public.hsa_administrators;

create policy "Authenticated users can read hsa_administrators"
  on public.hsa_administrators
  for select
  using (auth.role() = 'authenticated');

-- Ensure claims table exists and has RLS enabled
create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_id uuid not null unique references public.expenses(id) on delete cascade,
  administrator_id text not null references public.hsa_administrators(id),
  submission_tier text not null check (submission_tier in ('api', 'email', 'fax', 'portal')),
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

drop policy if exists "Users can view own claims" on public.claims;
drop policy if exists "Users can insert own claims" on public.claims;
drop policy if exists "Users can update own claims" on public.claims;
drop policy if exists "Users can delete own claims" on public.claims;

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

-- 3. PERF-1: Create index on profiles.stripe_customer_id to avoid sequential scans on Stripe webhooks
create index if not exists idx_profiles_stripe_customer_id
  on public.profiles (stripe_customer_id);
