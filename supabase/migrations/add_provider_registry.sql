-- ============================================================================
-- HSA Provider Registry
-- ============================================================================
-- Turns public.hsa_administrators from a handful of hardcoded claim-routing
-- targets into the canonical registry of every HSA provider we know about
-- (800+ rows), which serves two jobs at once:
--
--   1. Claim routing  — the small set of providers we can actually submit to
--   2. Public content — /hsa-providers hub + researched per-provider pages
--
-- The two jobs want different columns, so they are grouped below as
-- REGISTRY (populated for all 800) and EDITORIAL (populated for the ~20 we
-- have actually researched). has_guide is the switch between them: only rows
-- with has_guide = true get a generated page.
--
-- The DB is the source of truth. scripts/export-providers.mjs writes a
-- committed JSON snapshot so git history carries the "what changed, when"
-- audit trail; that file is generated and must never be hand-edited.
-- ============================================================================

-- ────────────────────────────────────────────────
-- 1. Submission tiers: add 'mail' and 'self_directed'
-- ────────────────────────────────────────────────
-- 'self_directed' exists because the single largest provider by market share
-- (Fidelity, ~24%) has no claim to submit at all — the accountholder moves
-- their own money out of their own custodial account. Modeling that as
-- 'portal' would be wrong: there is no adjudication, no documentation
-- requirement, and no claim status to track. Any code branching on
-- submission_tier must treat 'self_directed' as "no claim object exists."
--
-- 'mail' was previously collapsed into 'portal', which hid the fact that
-- turnaround is measured in weeks rather than days.
--
-- The enum is duplicated as a check constraint on two tables. Both must move
-- together or inserts into claims will fail for the new tiers.

alter table public.hsa_administrators
  drop constraint if exists hsa_administrators_submission_tier_check;

alter table public.hsa_administrators
  add constraint hsa_administrators_submission_tier_check
  check (submission_tier in ('api', 'email', 'fax', 'portal', 'mail', 'self_directed'));

alter table public.claims
  drop constraint if exists claims_submission_tier_check;

alter table public.claims
  add constraint claims_submission_tier_check
  check (submission_tier in ('api', 'email', 'fax', 'portal', 'mail', 'self_directed'));

-- ────────────────────────────────────────────────
-- 2. REGISTRY columns — populated for all providers
-- ────────────────────────────────────────────────

alter table public.hsa_administrators
  add column if not exists legal_name text,
  add column if not exists aliases text[] not null default '{}'::text[],

  -- Providers rename and get acquired constantly (PayFlex became Inspira
  -- Financial on 2024-01-01). Users search for, and have paperwork under, the
  -- old name for years afterward, so former names are first-class search keys
  -- rather than trivia.
  add column if not exists former_names text[] not null default '{}'::text[],

  add column if not exists org_type text,
  add column if not exists website_url text,
  add column if not exists support_phone text,
  add column if not exists hq_state text,

  -- "Custodian" (holds the money, files the 1099-SA/5498-SA) and
  -- "administrator" (adjudicates claims) are distinct roles that the same
  -- name may or may not fill. Via Benefits administers but does not custody;
  -- Fidelity custodies but does not adjudicate. Collapsing these into one
  -- "provider" concept is what makes provider comparison articles wrong.
  add column if not exists is_custodian boolean not null default false,
  add column if not exists is_administrator boolean not null default false,

  -- What this provider administers, not what our product supports. HRA is
  -- present here deliberately: Via Benefits' HRA documentation rules differ
  -- from its HSA rules, and the registry has to be able to say so even while
  -- expenses.account_type remains ('hsa','lpfsa','hcfsa'). See note at foot.
  add column if not exists account_types text[] not null default '{hsa}'::text[],

  add column if not exists accounts_count bigint,

  -- Provenance — where the row came from and when a human last looked at it.
  add column if not exists data_source text,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

-- ────────────────────────────────────────────────
-- 2a. Public URL slug
-- ────────────────────────────────────────────────
-- The public path segment is a separate column, NOT `id`.
--
-- An earlier draft of this migration constrained `id` itself to kebab-case and
-- failed on the rows already in the table. Normalizing those ids was not an
-- option: claims.administrator_id and profiles.hsa_administrator_id are
-- foreign keys to them and neither declares ON UPDATE CASCADE, so renaming
-- would either be rejected outright or strand somebody's claim history.
--
-- Separating the two turns out to be the better design regardless. `id` is an
-- internal key that must never move because rows point at it; `slug` is a
-- public URL that we may well want to change — a provider renames, or a slug
-- reads badly in search results — and changing it should cost a redirect, not
-- a data migration.

-- Mirrors slugify() in scripts/import-providers.mjs. The two must agree, or a
-- row imported from a file gets a different URL than the same row backfilled
-- here.
create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both '-' from
      regexp_replace(
        regexp_replace(lower(coalesce(value, '')), '&', ' and ', 'g'),
        '[^a-z0-9]+', '-', 'g'
      )
    ),
    ''
  );
$$;

alter table public.hsa_administrators
  add column if not exists slug text;

-- Backfill. Prefers the display name over the id, because the name is what a
-- reader would search for. row_number() disambiguates collisions — two rows
-- named "Optum Bank" would otherwise both want the same slug and the unique
-- index below would reject the whole migration.
with candidates as (
  select
    id,
    coalesce(public.slugify(name), public.slugify(id), 'provider') as base
  from public.hsa_administrators
  where slug is null
),
numbered as (
  select
    id,
    base,
    row_number() over (partition by base order by id) as rn
  from candidates
)
update public.hsa_administrators a
set slug = case when n.rn = 1 then n.base else n.base || '-' || n.rn end
from numbered n
where a.id = n.id;

alter table public.hsa_administrators
  alter column slug set not null;

create unique index if not exists idx_hsa_administrators_slug
  on public.hsa_administrators (slug);

alter table public.hsa_administrators
  drop constraint if exists hsa_administrators_slug_format_check;

alter table public.hsa_administrators
  add constraint hsa_administrators_slug_format_check
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.hsa_administrators
  drop constraint if exists hsa_administrators_org_type_check;

alter table public.hsa_administrators
  add constraint hsa_administrators_org_type_check
  check (org_type is null or org_type in (
    'bank',
    'credit_union',
    'non_bank_custodian',
    'tpa',                 -- third-party administrator
    'health_plan',
    'investment_platform',
    'payroll_benefits',
    'other'
  ));

-- ────────────────────────────────────────────────
-- 3. SUBMISSION columns — how a claim actually reaches them
-- ────────────────────────────────────────────────

alter table public.hsa_administrators
  add column if not exists claim_form_url text,

  -- The finding that breaks the original per-administrator routing model:
  -- at Via Benefits and Inspira the fax number and mailing address are set
  -- per *employer plan*, not per administrator. A single stored fax_number is
  -- therefore wrong for most of their book. When this is true, the columns
  -- above are at best a default and the UI must ask the user to confirm the
  -- destination from their own plan documents before anything is sent.
  add column if not exists routing_varies_by_employer boolean not null default false,

  -- Whether supporting documentation must accompany the submission. This is
  -- not uniform even within one provider: Via Benefits requires it for HRA
  -- and not for HSA.
  add column if not exists docs_required text,

  -- Gate for the email adapter. Defaults to false on purpose: unencrypted
  -- email is not a HIPAA-compliant channel for PHI, and research found no
  -- major administrator publishing a claims intake address that accepts it.
  -- A row must be explicitly, individually verified before this flips true.
  add column if not exists accepts_email_phi boolean not null default false,

  add column if not exists submission_notes text;

alter table public.hsa_administrators
  drop constraint if exists hsa_administrators_docs_required_check;

alter table public.hsa_administrators
  add constraint hsa_administrators_docs_required_check
  check (docs_required is null or docs_required in (
    'none',            -- self-directed; nothing is submitted
    'always',
    'varies',          -- differs by account type or employer plan
    'over_threshold'   -- only above a dollar amount
  ));

-- ────────────────────────────────────────────────
-- 4. EDITORIAL columns — populated only for researched providers
-- ────────────────────────────────────────────────

alter table public.hsa_administrators
  -- The switch. generateStaticParams selects on this, so a provider gets a
  -- page only once someone has researched it. The other ~780 rows exist as
  -- registry data and hub-page listings without generating thin pages.
  add column if not exists has_guide boolean not null default false,

  add column if not exists guide_summary text,
  add column if not exists guide_body text,

  -- [{ "url": ..., "title": ..., "accessed": "YYYY-MM-DD" }]
  -- Every factual claim on a published guide page needs a citation. If a
  -- provider ever disputes what we wrote, this plus the git history of the
  -- exported snapshot is the record of what we said and what we based it on.
  add column if not exists sources jsonb not null default '[]'::jsonb,

  add column if not exists last_reviewed date;

alter table public.hsa_administrators
  drop constraint if exists hsa_administrators_guide_ready_check;

-- A guide cannot be published without a summary and a review date. This is
-- the constraint that stops an unreviewed row from becoming a public page.
alter table public.hsa_administrators
  add constraint hsa_administrators_guide_ready_check
  check (
    has_guide = false
    or (guide_summary is not null and last_reviewed is not null)
  );

alter table public.hsa_administrators
  drop constraint if exists hsa_administrators_sources_is_array_check;

alter table public.hsa_administrators
  add constraint hsa_administrators_sources_is_array_check
  check (jsonb_typeof(sources) = 'array');

-- ────────────────────────────────────────────────
-- 5. Row maintenance: updated_at and slug
-- ────────────────────────────────────────────────
-- updated_at is what the exporter stamps into the snapshot and what tells us
-- whether a row is stale, so it cannot depend on the caller remembering to
-- set it.
--
-- slug is NOT NULL, so deriving it here keeps a plain
-- `insert into hsa_administrators (id, name, submission_tier) ...` working —
-- the shape anyone adding a provider by hand in the SQL editor will reach for.

create or replace function public.maintain_hsa_administrator_row()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- Drop the older single-purpose trigger if a previous run of this migration
-- created it.
drop trigger if exists trg_hsa_administrators_updated_at on public.hsa_administrators;
drop function if exists public.touch_hsa_administrators_updated_at();

drop trigger if exists trg_hsa_administrators_maintain on public.hsa_administrators;

create trigger trg_hsa_administrators_maintain
  before insert or update on public.hsa_administrators
  for each row
  execute function public.maintain_hsa_administrator_row();

-- ────────────────────────────────────────────────
-- 6. Indexes
-- ────────────────────────────────────────────────

-- generateStaticParams and the "researched providers" rail. Partial, because
-- the true rows are a ~2% slice of the table.
create index if not exists idx_hsa_administrators_has_guide
  on public.hsa_administrators (slug)
  where has_guide = true;

create index if not exists idx_hsa_administrators_active
  on public.hsa_administrators (active)
  where active = true;

create index if not exists idx_hsa_administrators_org_type
  on public.hsa_administrators (org_type);

-- Typeahead for the provider picker. 800 rows must never be shipped to the
-- client, so the picker queries server-side on every keystroke; trigram
-- indexes keep that an index scan instead of 800 sequential ILIKEs.
create extension if not exists pg_trgm;

create index if not exists idx_hsa_administrators_name_trgm
  on public.hsa_administrators using gin (name gin_trgm_ops);

-- Users type the old name ("PayFlex") or a colloquial one ("Optum"), so
-- aliases and former names are searched alongside the canonical name.
create index if not exists idx_hsa_administrators_aliases
  on public.hsa_administrators using gin (aliases);

create index if not exists idx_hsa_administrators_former_names
  on public.hsa_administrators using gin (former_names);

-- ────────────────────────────────────────────────
-- 7. Public read access
-- ────────────────────────────────────────────────
-- /hsa-providers is a marketing route rendered for logged-out visitors, so it
-- needs anonymous read — but the table also carries our internal routing
-- configuration (api_base_url, form_template_id, submission_notes), which has
-- no business being served to the public internet via PostgREST.
--
-- RLS is row-level and cannot express "these columns only", so the public
-- surface is a view over the safe columns. The view is SECURITY DEFINER
-- (security_invoker = off) precisely so that it, and not an anon policy on
-- the base table, is the only anonymous path in. Supabase's linter flags
-- SECURITY DEFINER views by default; here it is the mechanism, not an
-- oversight. The base table keeps its authenticated-only policy untouched.

create or replace view public.hsa_providers_public
with (security_invoker = off)
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
  'Public-safe projection of hsa_administrators for /hsa-providers. Excludes internal routing config (api_base_url, form_template_id, fax_number, email_address, mailing_address, submission_notes). SECURITY DEFINER is intentional — it provides the column-level restriction that RLS cannot.';

-- ────────────────────────────────────────────────
-- 8. Column documentation
-- ────────────────────────────────────────────────

comment on column public.hsa_administrators.id is
  'Internal key. Referenced by claims.administrator_id and profiles.hsa_administrator_id with no ON UPDATE CASCADE, so it must never change. The public URL is slug, not this.';
comment on column public.hsa_administrators.slug is
  'Public path segment at /hsa-providers/[slug]. Separate from id so a URL can be changed for SEO, or when a provider renames, at the cost of a redirect rather than a data migration.';
comment on column public.hsa_administrators.former_names is
  'Prior names, e.g. Inspira Financial carries {PayFlex}. Searched alongside name — users hold paperwork under the old name for years.';
comment on column public.hsa_administrators.is_custodian is
  'Holds the funds and files 1099-SA/5498-SA. Distinct from is_administrator; a provider may be either, both, or (rarely) neither.';
comment on column public.hsa_administrators.account_types is
  'Account types this provider administers. Describes the provider, NOT our product scope — expenses.account_type is the product-scope enum and does not include hra.';
comment on column public.hsa_administrators.routing_varies_by_employer is
  'When true, fax_number/mailing_address are per-employer-plan and any stored value is only a default. The submission UI must have the user confirm the destination before sending.';
comment on column public.hsa_administrators.accepts_email_phi is
  'Defaults false. Unencrypted email is not HIPAA-compliant for PHI; requires per-row verification of a published claims intake address before enabling.';
comment on column public.hsa_administrators.has_guide is
  'Gates page generation. generateStaticParams selects only rows where this is true, so unresearched registry rows never become thin pages.';
comment on column public.hsa_administrators.sources is
  'Array of {url, title, accessed}. Required backing for published guide claims.';
comment on column public.hsa_administrators.last_reviewed is
  'Date a human last verified this row against the provider. Required when has_guide is true.';

-- ============================================================================
-- Open item, deliberately NOT changed here
-- ============================================================================
-- expenses.account_type and expense_templates.account_type remain
-- ('hsa','lpfsa','hcfsa'). Adding 'hra' is a product scope decision, not a
-- schema cleanup, and it would need corresponding work in the expense form,
-- eligibility rules, and the tax-year logic. account_types above lets the
-- registry describe HRA-administering providers accurately in the meantime.
-- ============================================================================
