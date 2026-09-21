-- ============================================================================
-- Replace the SECURITY DEFINER provider view with column-level grants
-- ============================================================================
-- add_provider_registry.sql made public.hsa_providers_public a SECURITY
-- DEFINER view (security_invoker = off) and argued that this was necessary
-- because "RLS is row-level and cannot express 'these columns only'".
--
-- The first half is true; the conclusion was wrong. Postgres has a native
-- mechanism for exactly this — GRANT SELECT (col, col, ...) ON table TO role —
-- and it does not require handing anon a view that runs with the owner's
-- privileges. Supabase's linter flags SECURITY DEFINER views as CRITICAL, and
-- in this case it is right to.
--
-- Why the old shape was worse, concretely: a SECURITY DEFINER view bypasses
-- the base table's RLS entirely, so the view's own WHERE clause becomes the
-- only thing standing between anon and every row and column of
-- hsa_administrators. One careless `create or replace view` that drops the
-- `where active = true`, or adds a column back, silently exposes internal
-- claim-routing configuration to the public internet. The security boundary
-- lives in a definition nobody reviews as security-critical.
--
-- After this migration the boundary is enforced by the database in two
-- independent layers, and the view is merely a convenient projection:
--
--   1. RLS policy  — anon may read rows where active = true
--   2. Column GRANT — anon may read only the public columns, and this holds
--                     even for a direct PostgREST query against the table
--
-- Defense in depth: getting the view wrong no longer leaks anything, because
-- anon simply has no privilege on the withheld columns.
-- ============================================================================

-- ────────────────────────────────────────────────
-- 1. Row access for anon
-- ────────────────────────────────────────────────
-- The existing policy is `using (auth.role() = 'authenticated')` with no TO
-- clause, so it evaluates false for anon and is left untouched — authenticated
-- users keep full-row, full-column access for claim routing.

drop policy if exists "Anyone can read active providers" on public.hsa_administrators;

create policy "Anyone can read active providers"
  on public.hsa_administrators
  for select
  to anon
  using (active = true);

-- ────────────────────────────────────────────────
-- 2. Column access for anon
-- ────────────────────────────────────────────────
-- Supabase grants anon SELECT on every table in public by default, so the
-- blanket grant must be revoked before the column-scoped one means anything.
-- Revoking is safe: until the policy above existed, anon matched no rows.

revoke select on public.hsa_administrators from anon;

-- The withheld columns are the internal claim-routing configuration:
--   fax_number, email_address, mailing_address, api_base_url,
--   form_template_id, submission_notes, accepts_email_phi, data_source
-- A direct query for any of these as anon is now a permission error, not a
-- filtered result.
grant select (
  id,
  slug,
  name,
  legal_name,
  aliases,
  former_names,
  org_type,
  website_url,
  portal_url,
  support_phone,
  hq_state,
  is_custodian,
  is_administrator,
  account_types,
  market_share_pct,
  accounts_count,
  logo_url,
  submission_tier,
  claim_form_url,
  routing_varies_by_employer,
  docs_required,
  has_guide,
  guide_summary,
  guide_body,
  sources,
  last_reviewed,
  active,            -- needed by the RLS policy's own USING clause
  updated_at
) on public.hsa_administrators to anon;

-- ────────────────────────────────────────────────
-- 3. The view becomes an ordinary, invoker-rights view
-- ────────────────────────────────────────────────
-- security_invoker = on means it now runs as whoever queries it, so the RLS
-- policy and column grants above apply. It is a convenience — a stable name
-- and a fixed column list for the app to query — and no longer a security
-- boundary.

create or replace view public.hsa_providers_public
with (security_invoker = on)
as
select
  id,
  slug,
  name,
  legal_name,
  aliases,
  former_names,
  org_type,
  website_url,
  portal_url,
  support_phone,
  hq_state,
  is_custodian,
  is_administrator,
  account_types,
  market_share_pct,
  accounts_count,
  logo_url,
  submission_tier,
  claim_form_url,
  routing_varies_by_employer,
  docs_required,
  has_guide,
  guide_summary,
  guide_body,
  sources,
  last_reviewed,
  updated_at
from public.hsa_administrators
where active = true;

revoke all on public.hsa_providers_public from public;
grant select on public.hsa_providers_public to anon, authenticated;

comment on view public.hsa_providers_public is
  'Public projection of hsa_administrators for /hsa-providers. security_invoker = on, so the caller''s RLS and column grants apply — this view is a convenience, not a security boundary. Anon access is enforced by the "Anyone can read active providers" policy plus column-level GRANTs on the base table.';

-- ============================================================================
-- Verify — NOT from the SQL Editor
-- ============================================================================
-- The Supabase SQL Editor runs as postgres, a superuser, which bypasses both
-- RLS and column grants. Running the checks below there returns every column
-- happily and proves nothing. It is the single easiest way to convince
-- yourself this migration failed when it did not, or worse, that it worked
-- when it did not.
--
-- Test as anon, over PostgREST, with the anon key:
--
--   curl -s "$SUPABASE_URL/rest/v1/hsa_providers_public?select=slug" \
--     -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--   # -> 200, rows
--
--   curl -s "$SUPABASE_URL/rest/v1/hsa_administrators?select=fax_number" \
--     -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--   # -> 401 {"message":"permission denied for table hsa_administrators"}
--
-- Verified 2026-09-20: fax_number, email_address, api_base_url,
-- accepts_email_phi and select=* are all denied to anon; the view and the
-- public columns return 200.
-- ============================================================================
