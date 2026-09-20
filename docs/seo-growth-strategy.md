# SEO Growth Strategy

## Overview

Two fronts: technical/on-page quick wins (mostly shipped — see status below), and programmatic SEO (pSEO), which is the larger, unbuilt opportunity. This doc is the starting point for whoever picks up the pSEO work next.

---

## Front 1: Technical & On-Page (status)

| Item | Status |
|---|---|
| `robots.txt` | Shipped — allows marketing routes, disallows `/dashboard`, `/api`, auth routes |
| `sitemap.ts` | Shipped — public routes only (`/`, `/pricing`, `/calculator`, `/privacy`, `/vs/spreadsheets`, `/strategy/delayed-reimbursement`) |
| Search Console | `hsa.plus` verified as a Domain property, sitemap submitted (Status: Success) |
| Google site verification meta tag | Wired into `layout.tsx`, gated behind `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (optional, unused unless the meta-tag verification path is needed instead of DNS) |

---

## Front 2: Programmatic SEO (not started)

The HSA space has high-volume, low-competition, high-intent search queries. Rather than manual blog posts, generate static pages with `generateStaticParams`.

### A. "Is [Item] HSA Eligible?" directory — `/eligible/[item]`

**The opportunity**: queries like "is sunscreen HSA eligible" (~75k/mo), "are massages HSA eligible" (~40k/mo), "are prescription sunglasses HSA eligible" (~30k/mo), "is cold medicine HSA eligible" (CARES Act OTC rules). Highest volume-to-effort ratio of the three — do this first.

**Page contents per item**:
- Yes / No / With Letter of Medical Necessity (LOMN) badge
- Exact IRS rule citation (Pub 502 / CARES Act / One Big Beautiful Bill Act)
- Required receipt documentation for an audit
- CTA into HSA Plus ("Bought sunscreen out of pocket? Save your receipt and let your money compound tax-free.")

**Target dataset size**: 300–500 items, sourced from IRS Publication 502.

**Content-accuracy risk — read before building the dataset**: a wrong "Yes, eligible" on a public page is a real tax-penalty risk for anyone who trusts it and gets audited. Pub 502 is prose and explicitly non-exhaustive; there is no official IRS list to draw from mechanically. **The yes/no/LOMN call for each item needs a human review pass against Pub 502 before publishing** — this is not something to generate at scale from a model's general knowledge without that review.

**Researched (2026-09-20): no shortcut via a third-party API exists.**
- No free/open-source HSA/FSA eligibility API exists. Checked.
- **SIGIS/IIAS Eligible Product List** — the industry-standard list card networks use to auto-approve purchases at checkout — is the closest thing to "official," but:
  - Requires SIGIS membership. Tiers: **IV $100/yr** (Merchants & Manufacturers only), III $750/yr, II $5,000 one-time + $3,750/yr, I $125,000 + $10,000 + $7,500/yr (all higher tiers add POS Vendors, Payment Providers, Gateways, Processors, Networks, Plan Administrators, Issuer Processors). **HSA Plus doesn't cleanly fit any listed member category** — we're not a merchant, manufacturer, POS vendor, payment processor/gateway/network, TPA, or issuer processor. Membership fit would need confirming directly with SIGIS before paying anything.
  - Even if joined: **the EPL is keyed by UPC/SKU barcode**, built for "does this exact retail product auto-approve at checkout," not "is the category 'massage therapy' eligible." It solves a different problem than this directory needs, even at the cheapest tier.
  - **Conclusion: build and maintain our own dataset, same as every competitor already ranking for these queries** (e.g. Reimbursable.com, SavingWiser.com — both free consumer directories built on Pub 502, no licensable API). There is no vendor or free source to shortcut this with.

**Suggested next step**: seed set of ~20–30 well-known items first (reviewable in one pass), validate the route/template/data-schema pattern, then scale to 300–500 once the pattern and review workflow are proven.

### B. HSA Administrator guides — `/guides/[administrator]` or `/integrations/[administrator]`

**The opportunity**: `hsa_administrators` table already exists in the schema (Fidelity, HealthEquity, Optum Bank, HSA Bank, Lively, WEX, etc.). Search queries like "how to submit a manual claim on HealthEquity," "does Fidelity HSA store receipts," "Optum Bank HSA receipt rules for IRS audit."

**Page contents**: how each administrator handles claims, their limits, whether they store receipts long-term (most don't), and HSA Plus positioned as the permanent shoebox layer on top of them.

**Dependency**: accuracy here depends on the `hsa_administrators` data already in the schema being current — worth an audit pass before generating pages from it.

### C. Comparison pages — `/vs/[alternative]`

Already have the pattern (`src/app/vs/spreadsheets/page.tsx`). Straightforward to extend:
- `/vs/shoebox-method` — physical paper receipts vs. digital encrypted cloud storage
- `/vs/google-drive` — why Google Drive/Dropbox fails for HSA tracking without metadata & IRS retention tracking

Lowest effort of the three since the route pattern and page structure already exist — good candidate to interleave with (A) rather than doing strictly last.

---

## Suggested build order

1. **A** (eligibility directory) — seed set of 20–30 items, validate the pattern
2. **C** (comparison pages) — cheap, reuses existing pattern, can interleave with (A)
3. **A** scaled to 300–500 items, after the review workflow from step 1 is proven
4. **B** (administrator guides) — after an accuracy pass on the `hsa_administrators` table data
