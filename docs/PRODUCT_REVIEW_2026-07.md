# HSA Plus — Product & Financial-Domain Review

**Date:** July 12, 2026
**Reviewers:** Technical Product Manager review + Investment/Financial-domain review
**Scope:** Full codebase at commit `602155c` (main)

---

## Executive Summary

HSA Plus is a well-architected app (Next.js 16 + Supabase + Plaid + Stripe + Claude receipt scanning) with strong feature breadth. However, the review found **3 critical security issues** — most notably that **medical receipts (PHI) are stored in a publicly readable bucket** and the **`claims` table appears to have no row-level security** — plus several financial-calculation defects that overstate projections, and high-value feature gaps (no over-contribution warning despite the app already syncing contribution data).

**Priority order:** fix the security issues first (P0), then the financial correctness bugs (P1), then ship the over-contribution monitor as the next feature — it's the highest user-value item and the data for it already exists.

---

## 1. Critical Security Issues (P0)

### SEC-1: Medical receipts stored in a public storage bucket
- `supabase/schema.sql` creates the `hsa-documents` bucket with `public = true` and adds a "Public can read hsa-documents" policy (schema.sql:257–261).
- `uploadFile` in `src/app/dashboard/actions.ts:426` returns `getPublicUrl(...)` — anyone with (or who guesses/leaks) a URL can read users' receipts, EOBs, and invoices. These contain names, providers, diagnoses — effectively PHI.
- **Fix:** make the bucket private, serve documents via short-lived signed URLs (`createSignedUrl`), and migrate stored `*_urls` columns from public URLs to storage paths.

### SEC-2: No RLS on `claims` (and `hsa_administrators`) tables
- `Database.sql` defines `public.claims` (holding participant name, DOB, provider, amounts in `form_data`), but **no `ENABLE ROW LEVEL SECURITY` or policy exists for it anywhere** in `supabase/schema.sql` or `supabase/migrations/`. All other user tables have RLS.
- If RLS is genuinely off in production, any authenticated user can read/modify every user's claims through the PostgREST API with the publishable key.
- **Fix:** verify in Supabase dashboard immediately; add `alter table public.claims enable row level security` + standard `auth.uid() = user_id` policies to a migration. Add read-only policy for `hsa_administrators`.

### SEC-3: Cron endpoints fail open when `CRON_SECRET` is unset
- Both `/api/plaid/sync/route.ts:14` and `/api/digest/route.ts:14` use `if (cronSecret && authHeader !== ...)` — if the env var is missing, **anyone can trigger** full Plaid syncs (API cost, data churn) or mass email sends.
- The plaid sync response also leaks internal `user_id`s in its `errors` array.
- **Fix:** fail closed (`if (!cronSecret || authHeader !== ...) return 401`), and strip user IDs from responses.

---

## 2. High-Priority Bugs (P1)

### BUG-1: SSRF in receipt scanning endpoint
`/api/receipts/scan` accepts an arbitrary `imageUrl` and the server fetches it (`src/lib/receipt-scanner.ts:98`). An authenticated Plus user can make the server request internal/cloud-metadata URLs, with response contents exfiltrated via Claude output/error messages. Also no rate limiting on an expensive Claude Vision call. **Fix:** only accept paths inside the user's own `hsa-documents` folder (or the raw file), and rate-limit.

### BUG-2: No server-side input validation on server actions (mass assignment)
- `addExpense` inserts `{ user_id: user.id, ...formData }` (`actions.ts:329`) — a crafted `formData.user_id` overrides the authenticated ID (RLS is the only backstop). Zod is a dependency but is never used server-side.
- `updateClaimStatus` accepts any `status` string; `markAsReimbursed` accepts negative or greater-than-expense amounts, which corrupts `pendingReimbursement` math.
- **Fix:** validate every server-action payload with Zod schemas; whitelist fields explicitly; clamp reimbursed amount to `0..expense.amount`.

### BUG-3: Catch-up contribution eligibility is off by up to a year (IRS rule error)
`isCatchUpEligible`/`getContributionLimit` (`src/lib/hsa-constants.ts:41–65`) compute exact age today. IRS rule: you're catch-up eligible for the **whole tax year in which you turn 55**. A user turning 55 in December is told their limit is $1,000 lower than it actually is for most of the year. **Fix:** compare `taxYear - birthYear >= 55`.

### BUG-4: Growth projection ignores expense age — overstates "extra growth"
`calculateExpectedReturn` (`src/lib/types.ts:399`) compounds **every** unreimbursed expense for the full time horizon, but its own docstring describes subtracting years already elapsed since `date_of_service`. A 6-year-old expense and yesterday's expense project identically. For a product whose pitch is precision, projections are systematically overstated. **Fix:** implement the documented logic (`remainingYears = max(0, horizon - yearsSinceService)`) — or fix the docstring and label the number clearly as "if invested for N more years."

### BUG-5: Email digest cron never runs and ignores plan gating
- `vercel.json` has a cron for `/api/plaid/sync` only — **no cron entry for `/api/digest`**, so the shipped digest feature silently never fires in production.
- The digest route also selects on `email_digest_enabled` alone, without checking `plan_type` — downgraded users keep receiving a Plus-only feature (the in-app `sendTestDigest` gates it; the cron doesn't).

### BUG-6: Plaid sync data-quality issues
- `plaidInboundYtd` stays `null` when the year has zero transactions instead of `0` (`plaid-sync.ts:131–138`) — "contributions YTD" shows as unknown rather than $0.
- `current_hsa_balance` is overwritten with the Plaid **cash** balance; most HSAs split cash vs. invested funds, so users with investments see their balance drop after connecting. Manual balance is silently clobbered on every sync.
- Reconnecting (`connectHsaAccount` upsert on `user_id`) replaces the access token without calling `removeItem` on the old Plaid item → orphaned billable items at Plaid.

### BUG-7: Subscription state edge cases
- `isPlusUser` checks `plan_type` only, never `subscription_status` — a `past_due` user keeps full access indefinitely (may be intended; should be an explicit policy).
- Webhook has no idempotency handling; concurrent checkouts can create duplicate Stripe customers (`checkout/route.ts:36` read-then-write race).

### BUG-8: `submitClaim` deletes denied claims
`submission.ts:117` hard-deletes a denied claim before resubmitting — destroying claim history in a product whose core promise is **audit readiness**. Also `.single()` on the existing-claim lookup throws if duplicates ever exist. **Fix:** keep denied claims; link resubmissions.

---

## 3. Minor Issues (P2)

| # | Issue | Location |
|---|-------|----------|
| M-1 | `DEFAULT_CALCULATOR_INPUTS.annualContribution = 4150` — the 2024 limit, stale in 2026 ($4,400). Derive from `HSA_LIMITS[currentYear]`. | `hsa-constants.ts:31` |
| M-2 | `HSA_LIMITS` silently falls back to 2026 values in 2027+; no warning or update path. | `hsa-constants.ts:46` |
| M-3 | Retention alert counts from tax year, not filing year (+1) — fires a year early (conservative but mislabeled). | `types.ts:376` |
| M-4 | Digest "Top expenses" is first-5-by-date, not top-by-amount. | `digest/route.ts:144`, `actions.ts:884` |
| M-5 | `getExpenses` is unbounded — no pagination; dashboard loads every row forever. | `actions.ts:219` |
| M-6 | Raw DB error messages returned to the UI from server actions. | throughout `actions.ts` |
| M-7 | Sequential Plaid sync loop risks Vercel function timeout as connections grow. | `api/plaid/sync/route.ts:45` |
| M-8 | No tests and no CI — zero test framework in `package.json` for an app doing money math. | `package.json` |
| M-9 | Free users' `email_digest_enabled` stays true after downgrade (data-level gating gap). | schema/webhook |
| M-10 | Receipt scanner uses hardcoded `claude-sonnet-4-20250514`; newer models available. | `receipt-scanner.ts:184` |

---

## 4. Feature Opportunities

### Financial-domain features (investment-analyst review)

**F-1: Over-contribution monitor (highest value, data already exists).** The app already syncs `plaid_inbound_ytd` and knows the user's IRS limit (coverage type, age). Nothing compares them. Over-contributing triggers a **6% excise tax every year the excess remains** — warning users is exactly the kind of proactive value that justifies Plus. Include employer-contribution input, family/catch-up awareness, and the last-month rule caveat.

**F-2: Cash vs. invested balance split + real return tracking.** Track the two HSA components separately (fixes BUG-6's clobbering) and compute *actual* ARR/CAGR from balance snapshots instead of only a user-assumed 7%. This is the difference between a projection toy and an investment dashboard.

**F-3: FICA savings in the calculator.** Payroll HSA contributions also avoid 7.65% FICA — the current calculator (`use-savings-projection.ts`) understates the HSA advantage, the product's core sales pitch.

**F-4: State-tax correctness — CA/NJ.** California and New Jersey do not recognize HSA deductions; for those users the calculator's state-tax savings are pure fiction. Add a state selector with a no-deduction flag.

**F-5: "Shoebox" audit report export.** One-click PDF bundling all unreimbursed expenses + attached documents per tax year — the retirement-reimbursement strategy artifact. Complements existing CSV export.

**F-6: Age-65/Medicare planning.** Model contribution stop at Medicare enrollment, the 65+ penalty-free (but taxed) non-medical withdrawal rule, and Form 8889 helper output at tax time.

**F-7: Auto-match reconciliation suggestions.** `plaid_transactions` vs. `expenses` matching by amount ± date window; today matching is fully manual.

### Product/PM features

**F-8: Multiple HSA/FSA connections.** `hsa_connections.user_id` is UNIQUE — one linked account per user, but the product explicitly supports HSA + LPFSA + HCFSA, which usually live at different custodians.

**F-9: Account deletion & data export.** A PHI-adjacent app has no self-service delete/export path — a privacy-compliance requirement (and table stakes for paid consumer fintech).

**F-10: Error monitoring.** No Sentry/observability; cron failures are invisible except in Vercel logs.

---

## 5. Suggested Sequencing

| Phase | Contents |
|-------|----------|
| **Phase 1 — Lockdown (this sprint)** | SEC-1, SEC-2, SEC-3, BUG-1, BUG-2 |
| **Phase 2 — Correctness** | BUG-3, BUG-4, BUG-5, BUG-6, M-1, M-8 (test harness for the money math) |
| **Phase 3 — Flagship feature** | F-1 over-contribution monitor, F-2 balance split |
| **Phase 4 — Growth** | F-3–F-7, remaining P2s |

All items above have been filed in Jira with matching IDs in the issue summaries.
