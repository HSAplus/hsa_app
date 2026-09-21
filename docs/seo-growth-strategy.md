# SEO Growth Strategy

## Overview

Two fronts: technical/on-page quick wins (mostly shipped — see status below), and programmatic SEO (pSEO), which is the larger, unbuilt opportunity. This doc is the starting point for whoever picks up the pSEO work next.

---

## Front 1: Technical & On-Page (status)

| Item | Status |
|---|---|
| `robots.txt` | Shipped — allows marketing routes, disallows `/dashboard`, `/api`, auth routes |
| `sitemap.ts` | Shipped — public routes plus every published provider guide, sourced from the same query `generateStaticParams` uses so it can't advertise a 404 |
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

### B. HSA provider guides — `/hsa-providers` — **BUILT**

Shipped as a pillar-and-spoke directory. Full detail in [provider-registry.md](./provider-registry.md); the SEO-relevant decisions:

- **`/hsa-providers`** — hub listing all 800+ providers, server-rendered with a client-side filter. One page with 800 rows is not 800 pages, so there's no thin-content exposure here.
- **`/hsa-providers/[slug]`** — spokes, generated **only** for providers where `has_guide = true` (currently five: Fidelity, Via Benefits, Inspira, HealthEquity, Optum Bank). The other ~780 appear on the hub but never get a page. This is the whole guard against the doorway-page failure mode, and it's enforced by a DB constraint rather than by discipline: `has_guide = true` requires both `guide_summary` and `last_reviewed`.
- **`/api/hsa-providers`** — the registry as public JSON, explicitly allowed in `robots.txt`. No free, licensable HSA provider dataset exists, so publishing ours is link bait that costs nothing to maintain.

**What makes the guides rank rather than just exist**: they answer a question the providers' own sites answer badly. Fidelity has no claims process at all (you withdraw from your own account); Via Benefits and Inspira set submission routing per *employer plan*, so every generic "the fax number is X" answer on the internet is wrong for most readers. Each guide carries sources and a visible `last_reviewed` date.

**Maintenance is the real cost**: Inspira was PayFlex until 1 January 2024. Guides need re-verifying before they age past roughly six months, and `former_names` is indexed and searchable because people hold paperwork under the old name for years.

**To scale past five**: research a provider, add it to `supabase/seed/providers_researched.sql` with sources, re-run the seed, `npm run export:providers`, commit. Prioritize by `market_share_pct`.

### C. Comparison pages — `/vs/[alternative]`

Already have the pattern (`src/app/vs/spreadsheets/page.tsx`). Straightforward to extend:
- `/vs/shoebox-method` — physical paper receipts vs. digital encrypted cloud storage
- `/vs/google-drive` — why Google Drive/Dropbox fails for HSA tracking without metadata & IRS retention tracking

Lowest effort of the three since the route pattern and page structure already exist — good candidate to interleave with (A) rather than doing strictly last.

---

## Suggested build order

1. ~~**B** (provider guides)~~ — **built**. Pattern proven: DB-backed registry, hand-researched subset, `has_guide` gating page generation.
2. **A** (eligibility directory) — seed set of 20–30 items. Reuse B's pattern directly: registry table, a `reviewed` flag gating `generateStaticParams`, sources and a review date per item. The accuracy risk is higher here than it was for providers — a wrong "Yes, eligible" is a tax-penalty risk for whoever trusts it — so the review gate matters more, not less.
3. **C** (comparison pages) — cheap, reuses the existing `/vs/` pattern, can interleave with (A)
4. **A** scaled to 300–500 items, once the review workflow from step 2 is proven
5. **B** scaled past five providers, prioritized by `market_share_pct`
