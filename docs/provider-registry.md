# HSA Provider Registry

How the 800+ HSA provider records are stored, updated, audited, and turned into public pages.

## The short version

The **database is the source of truth**. `data/providers.generated.json` is a committed snapshot whose only job is to give the registry a version-controlled history. Never edit it by hand.

```
provider list (CSV/JSON)
        │  npm run import:providers <file>
        ▼
public.hsa_administrators  ◄── source of truth
        │
        ├─ public.hsa_providers_public (view)  ──► /hsa-providers, /api/hsa-providers
        │
        └─ npm run export:providers  ──► data/providers.generated.json  ──► git history
```

## Why both a database and a repo file

They answer different questions, and neither one answers both.

| | Database | `providers.generated.json` |
|---|---|---|
| Live edits without a deploy | Yes | No |
| Serves 800 rows without shipping them to the client | Yes | No |
| "When did this row last change?" | Yes — `updated_at` | Yes |
| "What did this row say six months ago?" | No | Yes — `git log` |
| "Who changed it and why?" | No | Yes — commit author and message |

That last row is the one that matters. If a provider ever disputes something published on a guide page, the defence is a dated record of what we said and what we based it on. `updated_at` tells you a row changed; only git tells you what it changed *from*.

The critical design point is that the snapshot is **derived, not maintained**. A hand-kept second copy would drift the first time someone edited a row in Supabase, and drift is silent. A generated one cannot drift — its worst failure mode is staleness, and staleness is visible from the commit date.

## Registry rows vs. published pages

Only a small subset of providers gets a page. `has_guide` is the switch.

|  | Registry row (~800) | Published guide (~5–20) |
|---|---|---|
| `has_guide` | `false` | `true` |
| Source | bulk import | hand research |
| Appears on `/hsa-providers` hub | Yes | Yes |
| Has its own page | **No** | Yes |
| In `generateStaticParams` | No | Yes |

800 auto-generated pages saying little more than a provider's name is a textbook thin-content problem, and Google treats it as one. The hub page listing all 800 is fine — one page with 800 rows is not 800 pages.

A database constraint enforces this rather than relying on discipline: `has_guide = true` requires both `guide_summary` and `last_reviewed` to be set.

## Operations

### One-time setup

Run in the Supabase SQL Editor, in order:

1. `supabase/migrations/add_provider_registry.sql`
2. `supabase/seed/providers_researched.sql`

Both are idempotent and safe to re-run.

### Credentials

The scripts read `.env.local.hosted` (gitignored) via `scripts/load-env.mjs`, so `npm run export:providers` works the same from bash, PowerShell or cmd without shell-specific env-var syntax.

**Real environment variables always win**, so this is inert in CI and on Vercel.

It is deliberately *not* `.env.local`. That file points `npm run dev` at a local Supabase, and pointing local development at production would mean a stray dev action writes real user data.

| Script | Needs |
|---|---|
| `export:providers` | URL + anon key (the view is granted to `anon`) |
| `import:providers` | URL + **service role key** |

The service role key is required for writes because `hsa_administrators` has a read-only RLS policy and no write policy. It is marked Sensitive in Vercel and **cannot be read back** — `vercel env pull` returns an empty string for it. Get it from Supabase → Project Settings → API, paste it into `.env.local.hosted` for the import, then remove it.

### Importing a provider list

```bash
npm run import:providers path/to/providers.csv -- --dry-run   # validate first
npm run import:providers path/to/providers.csv
# then re-run supabase/seed/providers_researched.sql            # see below
npm run export:providers                                       # refresh the snapshot
git add data/providers.generated.json && git commit
```

**Always dry-run first.** It validates every row and writes nothing.

**Re-run the seed afterwards.** A bulk list and a researched guide will disagree — hsasearch calls Fidelity "Fidelity Investments" and puts it in RI; our seed calls it "Fidelity", in MA, `investment_platform`. For a provider with a published guide the researched values win, and re-running the idempotent seed is how you re-assert them.

#### What the importer will and won't overwrite

| | Behaviour |
|---|---|
| `id` | **Never changed** on an existing provider. Looked up by slug and sent back unchanged. |
| Synthesized defaults (`submission_tier`, `data_source`) | Only applied to genuinely new rows. On an existing row the current value is sent back. |
| Empty cells | Genuinely skipped — rows are grouped by key signature so an omitted column is absent from the `INSERT`, not `NULL`. |
| Editorial columns | Rejected from input files entirely. |
| Values the file does supply | Overwritten. That is the point of an import. |

These are not incidental: the first real run of this script broke all three of the first four rows above. See **Two ways an import can quietly destroy data** below.

#### Input format

`name` is the only required column. Everything else is optional; anything unrecognized is reported and ignored.

Accepted columns: `id`, `name`, `legal_name`, `aliases`, `former_names`, `org_type`, `website_url`, `portal_url`, `support_phone`, `hq_state`, `is_custodian`, `is_administrator`, `account_types`, `market_share_pct`, `accounts_count`, `logo_url`, `submission_tier`, `claim_form_url`, `routing_varies_by_employer`, `docs_required`, `fax_number`, `email_address`, `mailing_address`, `api_base_url`, `form_template_id`, `submission_notes`, `data_source`, `active`.

- **Arrays** (`aliases`, `former_names`, `account_types`) — semicolon or pipe delimited, or a JSON array. **Not comma delimited**: provider legal names contain commas.
- **Booleans** — `true/false`, `yes/no`, `y/n`, `1/0`, any case.
- **Empty cells are skipped, not written as NULL.** This is deliberate: an import must not be able to blank a value a human curated in the database.
- **`slug`** is the URL and is generated from `name` if absent. Supply it explicitly when you care about the URL, or when the provider already exists.
- **`id`** is the internal key. It defaults to the slug for new providers and should be left alone for existing ones — rows are matched on `slug`, so an existing provider keeps whatever id it already had.

#### Two things to watch

**Slug collisions with providers already in the table.** `"Optum Bank, Inc."` slugifies to `optum-bank-inc`, but the seed uses `optum-bank` — importing it would create a duplicate provider rather than updating the existing one. Set `slug` explicitly in your source file for any provider already present, including `fidelity`, `via-benefits`, `inspira-financial`, `healthequity` and `optum-bank`.

Check what's there first:

```sql
select id, slug, name from public.hsa_administrators order by name;
```

The importer catches duplicates *within* a file and refuses to run, but it cannot know that two different slugs mean the same company.

**Editorial columns are rejected.** `has_guide`, `guide_summary`, `guide_body`, `sources`, `last_reviewed` and `accepts_email_phi` are never written by the importer, even if present in the file. They are reviewed content; a re-import must not be able to blank them or silently republish something unreviewed. Edit `supabase/seed/providers_researched.sql` instead.

### Deactivating a provider

Set `active = false`. Don't delete: `claims.administrator_id` is a foreign key, and deleting a provider someone has filed a claim against would break their history. Inactive rows disappear from `hsa_providers_public` automatically.

## Two ways an import can quietly destroy data

Both of these happened on the first real run of `import:providers`, against production, and both are now fixed. They are recorded because the failure modes are not obvious and the fixes look like noise if you don't know what they're for.

### 1. An upsert on a non-primary key rewrites the primary key

`upsert(rows, { onConflict: "slug" })` looks like it updates matching rows in place. It does — but PostgREST updates **every column in the payload**, including `id`. So a row whose slug already existed had its `id` rewritten to whatever the file generated.

`claims.administrator_id` and `profiles.hsa_administrator_id` reference that id with no `ON UPDATE CASCADE`, so this either fails mid-batch with a foreign key error or succeeds and silently repoints a key. Both occurred: `bofa` became `bank-of-america` because nothing referenced it, and the batch containing HSA Bank aborted because a profile did.

The fix looks up existing ids by slug and sends them back unchanged.

### 2. A missing key in a batch writes NULL, it doesn't skip the column

The importer's own docs said "empty cells are skipped, not written as NULL." That was true per row and false per request: PostgREST builds one `INSERT` whose column list is the **union of keys across the batch**, so a row that omitted a key got `NULL` written into it.

Three curated providers had `org_type` nulled this way, and Fidelity's `submission_tier` went from `self_directed` to `portal` — which is to say the largest provider by market share silently acquired a claims process it does not have.

The fix groups rows by key signature so each request has a uniform column list, plus tracking which values the script synthesized versus read from the file.

One wrinkle worth knowing if you touch this: for a `NOT NULL` column with no default — `submission_tier` — omitting it is not enough. Postgres validates the `INSERT` tuple before resolving the conflict, so an omitted column fails the whole batch even when every row is destined for `DO UPDATE`. The current value has to be read and sent back.

### What made this recoverable

`data/providers.generated.json` was committed before the import, so diffing the live table against it produced an exact list of the 23 fields that changed and what they had been. That is the entire argument for the snapshot, and it paid for itself the first time it was tested.

## Schema notes

### `id` vs `slug`

Two separate columns, deliberately.

- **`id`** — internal key. `claims.administrator_id` and `profiles.hsa_administrator_id` are foreign keys to it, and neither declares `ON UPDATE CASCADE`, so **it must never change**. Rows added by hand before this registry existed have ids in whatever format their author chose; those stay as they are.
- **`slug`** — the public path segment at `/hsa-providers/[slug]`. Unique, kebab-case, auto-derived from `name` by a trigger when omitted.

The first draft of the migration constrained `id` itself to kebab-case and was rejected by Postgres: `check constraint "hsa_administrators_id_slug_check" is violated by some row`. Normalizing those ids wasn't an option — it would have either failed on the foreign keys or stranded existing claim history.

Splitting them turned out to be the better design regardless. A public URL is something you may well want to change — a provider renames, or a slug reads badly in search results — and changing it should cost a redirect, not a data migration.

**Everything matches on `slug`**: the seed's `on conflict`, the importer's upsert, and the page queries. Matching on `id` would insert a second "HealthEquity" beside an existing `health_equity` row, orphaned from the claims pointing at the original.

### `submission_tier`

| Tier | Meaning |
|---|---|
| `self_directed` | **No claim exists.** The accountholder withdraws from their own custodial account. |
| `api` | Programmatic submission (Alegeus). |
| `fax` | The standard automatable channel. |
| `portal` | User submits through the provider's own site; we generate the form. |
| `mail` | Paper. Same mechanics as `portal`, much slower. |
| `email` | Gated behind `accepts_email_phi`, which is `false` everywhere. See below. |

`self_directed` exists because the largest provider by market share (Fidelity, ~24%) has no claims process at all. Modeling it as `portal` would be wrong — there is no adjudication, no documentation requirement, and no claim status. `submitClaim()` returns before creating a claim row for these providers.

The enum is duplicated as a check constraint on `hsa_administrators` and `claims`. **Both must move together** or inserts will fail.

### `is_custodian` vs `is_administrator`

Distinct roles that the same name may or may not fill:

- **Custodian** — holds the funds, files 1099-SA/5498-SA. Fidelity is this and nothing else.
- **Administrator** — adjudicates claims. Via Benefits is this and nothing else.
- HealthEquity, Inspira and Optum Bank are both.

Collapsing these into one "provider" concept is what makes most provider comparison content wrong.

### `routing_varies_by_employer`

At Via Benefits and Inspira, the fax number and mailing address are assigned **per employer plan**, not per administrator. A single stored value is wrong for most of their book.

When this is `true`, any stored routing is at best a default, and the submission UI must have the user confirm the destination from their own plan documents. A plausible-looking wrong fax number sends someone's PHI to a stranger's machine — worse than having no default at all.

### `accepts_email_phi`

Defaults to `false` and is `false` on every row today.

Unencrypted email is not a HIPAA-compliant channel for PHI, and research found no major administrator publishing a claims intake address that accepts it. The email adapter checks this flag before sending — the check lives in the adapter rather than at the call site because that is the last point before data leaves our infrastructure.

**Consequence worth stating plainly: fax is currently the only automatable submission channel.** That makes the unset `WESTFAX_*` environment variables the real blocker for claim automation, not anything in this schema.

### `account_types` is not product scope

`account_types` on a provider describes **what that provider administers** — it includes `hra` because Via Benefits' HRA documentation rules differ from its HSA rules and the registry has to be able to say so.

It is unrelated to `expenses.account_type`, which remains `('hsa', 'lpfsa', 'hcfsa')`. Adding `hra` there is a product decision requiring work in the expense form, eligibility rules and tax-year logic — **still open**.

### Public read access

`/hsa-providers` is a logged-out marketing route, so it needs anonymous read. But the table also holds internal claim-routing configuration that has no business being served to the public internet via PostgREST.

RLS is row-level, but Postgres has a separate native mechanism for the column half — `GRANT SELECT (col, ...) ON table TO role`. Anon access is therefore **two independent layers on the base table**:

| Layer | Enforces |
|---|---|
| RLS policy `"Anyone can read active providers"` | anon sees only rows where `active = true` |
| Column `GRANT` to `anon` | anon sees only the public columns |

Withheld from anon: `fax_number`, `email_address`, `mailing_address`, `api_base_url`, `form_template_id`, `submission_notes`, `accepts_email_phi`, `data_source`. Querying one of those as anon is a permission error, not a filtered result.

`hsa_providers_public` is `security_invoker = on`, so it runs as whoever queries it and both layers apply. **The view is a convenience, not a security boundary** — a stable name and fixed column list for the app.

That distinction is the whole point. An earlier version made the view `SECURITY DEFINER`, which Supabase's linter flags as CRITICAL and was right to: such a view bypasses the base table's RLS entirely, so the view's own `WHERE` clause becomes the only thing between anon and every row and column. One careless `create or replace view` would leak internal routing config, from a definition nobody reviews as security-critical. Now getting the view wrong leaks nothing, because anon holds no privilege on the withheld columns.

Verify as anon:

```sql
select count(*) from public.hsa_providers_public;   -- works
select fax_number from public.hsa_administrators;   -- permission denied
```

## Maintenance

Guides carry a `last_reviewed` date and are displayed with it. Provider details change — Inspira was PayFlex until 1 January 2024 — so re-verify before a guide ages past roughly six months.

Re-verification means editing `supabase/seed/providers_researched.sql`, re-running it, bumping `last_reviewed`, then `npm run export:providers` and committing. The commit is the record that the review happened.

## Related

- [SEO growth strategy](./seo-growth-strategy.md) — where provider guides fit in the wider pSEO plan
