-- ============================================================================
-- Researched providers — the subset with has_guide = true
-- ============================================================================
-- These five were researched by hand and are the only rows cleared to
-- generate public pages. The other ~800 registry rows are imported by
-- scripts/import-providers.mjs and stay has_guide = false until someone
-- does the same work for them.
--
-- Everything here is a factual claim on a page that strangers will act on, so:
--   - fax numbers and mailing addresses are deliberately left NULL where
--     routing is per-employer-plan. A plausible-looking default is worse than
--     no default; it sends someone's PHI to the wrong fax machine.
--   - accepts_email_phi is false on every row. Research found no major
--     administrator publishing a claims intake address that accepts
--     unencrypted PHI.
--   - last_reviewed is the date a human verified the row, not the date it was
--     written. Re-verify before it ages past ~6 months.
--
-- Idempotent: safe to re-run. Editorial columns are overwritten on conflict;
-- routing columns are too, since this file is their source for these five.
-- ============================================================================

insert into public.hsa_administrators (
  id, name, legal_name, aliases, former_names, org_type,
  website_url, portal_url, hq_state,
  is_custodian, is_administrator, account_types, market_share_pct,
  submission_tier, routing_varies_by_employer, docs_required, accepts_email_phi,
  has_guide, guide_summary, guide_body, sources, last_reviewed,
  data_source, active
) values

-- ────────────────────────────────────────────────
(
  'fidelity',
  'Fidelity',
  'Fidelity Investments',
  '{"Fidelity HSA","Fidelity Investments HSA"}',
  '{}',
  'investment_platform',
  'https://www.fidelity.com',
  'https://www.fidelity.com',
  'MA',
  true,   -- custodian
  false,  -- does not adjudicate claims
  '{hsa}',
  24,
  'self_directed',
  false,
  'none',
  false,
  true,
  'Fidelity has no claims process. You withdraw from your own HSA whenever you like and keep the receipts yourself — which means nobody but you is tracking whether you can prove the expense years later.',
  $md$
## There is no claim to submit

Fidelity is a **custodian**, not an administrator. It holds your HSA money; it does not review your expenses or decide whether they qualify. So the question "how do I submit a claim to Fidelity?" has no answer — there is no claim.

Instead you take a **distribution**: you move money out of your own HSA, at any time, for any amount, without asking permission and without submitting documentation to anyone.

## What that means in practice

| | Fidelity | An administered HSA |
|---|---|---|
| Approval needed | No | Yes |
| Documentation at withdrawal | None | Usually required |
| Who decides eligibility | You | The administrator |
| Who holds the proof | You | Partly them |
| Turnaround | Immediate to a few days | Days to weeks |

## The part that catches people

The freedom is real, and so is the exposure. Nobody checks your work, which is exactly why **the IRS is the one who eventually might**.

Every distribution appears on the **Form 1099-SA** Fidelity issues you each January. That form reports the total amount distributed. It does not report what the money was spent on, because Fidelity does not know. On your tax return you assert how much of it was for qualified medical expenses. If that assertion is ever questioned, the burden of proof is entirely yours: a non-qualified distribution is taxed as income **plus a 20% penalty** if you are under 65.

The receipts are the whole defense. There is no administrator's file to fall back on.

## The long-game version

Because Fidelity never asks when the expense happened, there is no deadline to reimburse yourself. You can pay a medical bill out of pocket today, leave the money in the HSA to grow tax-free for twenty years, and take the distribution then — as long as the expense occurred after your HSA was established and you never claimed it elsewhere.

That strategy is only as good as your records. A receipt you cannot produce in 2045 is a deduction you cannot take.

## What to keep

For every expense you intend to reimburse eventually:

- An **itemized receipt** — date of service, patient, provider, what was done, amount
- An **EOB** if insurance was involved
- Proof you **paid out of pocket** and were not reimbursed from anywhere else
- A record of **which distribution** covered it, once you take one

Store them somewhere that will outlive the provider portal they came from. Most portals purge documents after a few years; the IRS window does not close on the same schedule.
  $md$,
  '[
    {"url": "https://www.fidelity.com/go/hsa/overview", "title": "Fidelity HSA overview", "accessed": "2026-09-20"},
    {"url": "https://www.irs.gov/forms-pubs/about-form-1099-sa", "title": "IRS — About Form 1099-SA", "accessed": "2026-09-20"},
    {"url": "https://www.irs.gov/publications/p969", "title": "IRS Publication 969 — HSAs and Other Tax-Favored Health Plans", "accessed": "2026-09-20"}
  ]'::jsonb,
  '2026-09-20',
  'manual_research',
  true
),

-- ────────────────────────────────────────────────
(
  'via-benefits',
  'Via Benefits',
  'Via Benefits Insurance Services',
  '{"Via Benefits Accounts","Extend Health"}',
  '{"OneExchange","Towers Watson OneExchange"}',
  'tpa',
  'https://www.viabenefits.com',
  'https://my.viabenefits.com',
  'UT',
  false,  -- administers; does not custody
  true,
  '{hsa,hra}',
  null,
  'portal',
  true,   -- routing is set per employer plan
  'varies',
  false,
  true,
  'Via Benefits administers accounts on behalf of employers and retiree plans, so almost every specific — where a claim goes, whether documentation is required, what is even covered — is set by your former or current employer, not by Via Benefits.',
  $md$
## Your employer wrote the rules, not Via Benefits

Via Benefits is a **third-party administrator**. It does not hold your money and it does not set your plan's terms. It runs the account on behalf of whoever sponsors it — usually an employer or a retiree health plan.

This matters more than it sounds. It means almost nothing about your account can be answered generically:

- **Where claims go** — fax number and mailing address are assigned per employer plan
- **Whether documentation is required** — differs between HSA and HRA, and between plans
- **What is reimbursable** — the plan sponsor defines this, particularly for HRAs
- **Reimbursement timing** — set by the plan

Anyone who tells you "the Via Benefits fax number is X" is quoting one employer's number. It may not be yours.

## HSA and HRA work differently here

This is the single most common source of confusion, because many people have both.

**If it's an HSA**, the money is yours. Documentation is generally not required at the time you request reimbursement, for the same reason it isn't at Fidelity: it is your own account and you carry the proof.

**If it's an HRA**, the money is your employer's. It is a reimbursement arrangement, which means a claim is genuinely adjudicated — and **documentation is required**. Expect to submit an itemized receipt or EOB every time, and expect claims to be denied when it's missing or illegible.

## Finding your actual submission details

The reliable sources, in order:

1. **Your plan documents** — the packet from your employer or retiree plan. The claim form in it carries the fax number and address for *your* plan.
2. **The Via Benefits portal** — log in and look for the reimbursement or claim section. Forms generated there are pre-filled with your plan's routing.
3. **The phone number on your Via Benefits card or plan materials** — also plan-specific.

Do not reuse a fax number you found in a forum or on a general-purpose benefits site. Sending medical documentation to the wrong destination is not recoverable.

## What to have ready

- Itemized receipt: date of service, patient name, provider, description, amount
- EOB, if insurance processed it
- The claim form **from your own plan**, not a generic one
- Your account or member ID as it appears in the portal

## Keep your own copy

Via Benefits retains claim documentation for a limited period, and if your employer changes administrators — which happens more often than people expect — your history does not necessarily follow you. The documents you submitted are still your responsibility to keep.
  $md$,
  '[
    {"url": "https://www.viabenefits.com", "title": "Via Benefits", "accessed": "2026-09-20"},
    {"url": "https://my.viabenefits.com", "title": "Via Benefits member portal", "accessed": "2026-09-20"},
    {"url": "https://www.irs.gov/publications/p969", "title": "IRS Publication 969 — HRAs and HSAs", "accessed": "2026-09-20"}
  ]'::jsonb,
  '2026-09-20',
  'manual_research',
  true
),

-- ────────────────────────────────────────────────
(
  'inspira-financial',
  'Inspira Financial',
  'Inspira Financial Health, Inc.',
  '{"Inspira"}',
  '{"PayFlex","PayFlex Systems USA"}',
  'tpa',
  'https://inspirafinancial.com',
  'https://inspirafinancial.com',
  'IL',
  true,
  true,
  '{hsa,hra,lpfsa,hcfsa}',
  null,
  'fax',
  true,   -- routing is set per employer plan
  'always',
  false,
  true,
  'Inspira Financial is the company formerly known as PayFlex — the rebrand took effect 1 January 2024. Claims are adjudicated and documentation is required every time, but the fax number and address are assigned per employer plan.',
  $md$
## If you're looking for PayFlex, you're in the right place

**PayFlex became Inspira Financial on 1 January 2024.** Same accounts, same balances, new name and new branding.

This trips people up for a long time after a rebrand. Your older paperwork, your tax documents from before 2024, and a great deal of still-indexed guidance on the internet all say PayFlex. Old claim forms may still carry PayFlex branding. If you're holding a document that says PayFlex, it is not out of date in a way that invalidates it — but the routing details on it might be, and those are worth confirming.

## Claims are genuinely reviewed

Unlike a self-directed custodian, Inspira **adjudicates**. A person or a system looks at your claim and approves or denies it.

The practical consequence: **documentation is required at submission, every time.** Not "keep it in case you're audited" — attached to the claim, or the claim gets denied.

What a complete submission needs:

- An **itemized receipt** or **EOB**. A credit card receipt is not enough — it shows an amount, not what was purchased. This is the most common denial reason there is.
- **Date of service** (not the date you paid)
- **Patient name**
- **Provider name**
- **Description of service**
- **Amount you owe** after insurance

## Where to send it

Inspira administers accounts for employers, and like other administrators of that kind, **the fax number and mailing address are set per employer plan.** There is no single Inspira claims fax number that works for everyone.

Get yours from:

1. **The claim form in your own plan materials** — it carries your plan's routing
2. **The Inspira portal**, which generates a form pre-filled for your account
3. **The member services number on your Inspira or PayFlex card**

## Fax is still the fastest non-portal channel

It's an odd thing to say in 2026, but fax remains the standard for claim submission across benefits administration, and for a specific reason: it satisfies HIPAA transport requirements in a way ordinary email does not. Email addresses you may find for "Inspira support" are for general inquiries — they are not claims intake, and they should not receive your medical documentation.

If you're choosing between channels: portal is most reliable, fax is the standard fallback, mail is slowest, and email is not an option.

## After you submit

Approved claims typically reimburse to your bank account on file, or by check if you haven't set one up. Denials cite a reason — most often missing or insufficient documentation, which is usually fixable by resubmitting with a proper itemized receipt rather than starting over.

Keep your own copies regardless. Administrator document retention is finite, and if your employer switches administrators your history may not travel with you.
  $md$,
  '[
    {"url": "https://inspirafinancial.com", "title": "Inspira Financial", "accessed": "2026-09-20"},
    {"url": "https://inspirafinancial.com/individual", "title": "Inspira Financial — individuals", "accessed": "2026-09-20"},
    {"url": "https://www.irs.gov/publications/p502", "title": "IRS Publication 502 — Medical and Dental Expenses", "accessed": "2026-09-20"}
  ]'::jsonb,
  '2026-09-20',
  'manual_research',
  true
),

-- ────────────────────────────────────────────────
(
  'healthequity',
  'HealthEquity',
  'HealthEquity, Inc.',
  '{"Health Equity","HealthEquity WageWorks"}',
  '{"WageWorks"}',
  'non_bank_custodian',
  'https://www.healthequity.com',
  'https://my.healthequity.com',
  'UT',
  true,
  true,
  '{hsa,hra,lpfsa,hcfsa}',
  null,
  'portal',
  false,
  'varies',
  false,
  true,
  'HealthEquity custodies the account and administers claims. Its portal has a "Reimburse Me" flow that moves money from your HSA to your bank account without requiring documentation up front — the proof obligation still exists, it just falls on you.',
  $md$
## Both custodian and administrator

HealthEquity is unusual in filling both roles: it holds the money *and* runs the claims process. That makes it a single point of contact, which is convenient, and a single point of failure for your records, which is worth planning around.

## Reimbursing yourself from an HSA

The portal flow is called **Reimburse Me**. You enter the expense and request the money; it transfers from your HSA to your linked bank account.

**Documentation is generally not required to complete this for an HSA.** That is not an oversight and not a loophole — it's a consequence of what an HSA is. The money is already yours. HealthEquity is not approving your expense; it's moving your own funds at your instruction, exactly as Fidelity would.

The portal will offer to let you attach a receipt. Do it. Not because HealthEquity requires it, but because:

- You may need it years later and won't remember the details
- HealthEquity's retention window is not the IRS's
- If you ever leave HealthEquity, your uploaded documents may not come with you

## FSA and HRA are a different story

If your account is an **LPFSA, HCFSA, or HRA** — and HealthEquity administers all of these, often for the same person alongside an HSA — then it is not your money in the same sense, a real adjudication happens, and **documentation is required**.

Know which account you're drawing from before you assume the rules. This is the most common mistake among people who hold more than one.

## The WageWorks history

HealthEquity acquired **WageWorks** in 2019 and has been consolidating the platforms since. If your account originated at WageWorks, older correspondence and tax documents may carry that name. It's the same organization now.

## What a complete record looks like

Whether or not anyone asks for it at submission time:

- Itemized receipt — date of service, patient, provider, service description, amount
- EOB, when insurance was involved
- Evidence you paid out of pocket
- Which reimbursement covered which expense

## The retention gap

This is the part worth taking seriously. HealthEquity's portal is not a permanent archive. Documents age out; access ends when your account does; a change of employer or administrator can sever your history entirely.

Meanwhile the IRS can question a distribution years after you took it, and the burden of proof is yours. **A portal you no longer have access to is not a defense.** Keep your own copies somewhere independent of whoever is administering the account this year.
  $md$,
  '[
    {"url": "https://www.healthequity.com", "title": "HealthEquity", "accessed": "2026-09-20"},
    {"url": "https://my.healthequity.com", "title": "HealthEquity member portal", "accessed": "2026-09-20"},
    {"url": "https://www.irs.gov/publications/p969", "title": "IRS Publication 969", "accessed": "2026-09-20"}
  ]'::jsonb,
  '2026-09-20',
  'manual_research',
  true
),

-- ────────────────────────────────────────────────
(
  'optum-bank',
  'Optum Bank',
  'Optum Bank, Inc.',
  '{"Optum","Optum Financial","OptumHealth Bank"}',
  '{"OptumHealth Bank"}',
  'bank',
  'https://www.optumbank.com',
  'https://www.optumbank.com',
  'UT',
  true,
  true,
  '{hsa,hra,lpfsa,hcfsa}',
  null,
  'portal',
  false,
  'always',
  false,
  true,
  'Optum Bank is an actual FDIC-insured bank and part of UnitedHealth Group, so many people get it through their health plan without choosing it. Reimbursement runs through the app or website, and an itemized receipt is expected.',
  $md$
## You may not have picked this one

Optum Bank is a **chartered, FDIC-insured bank** and part of UnitedHealth Group. If your health plan is UnitedHealthcare, there's a good chance your HSA landed at Optum Bank by default rather than by choice.

That's worth knowing for one reason: an HSA is portable. You are not required to keep it where it was opened, and you can transfer to another custodian without a tax consequence. Whether you should is a separate question — but it is your decision, not your employer's.

## Reimbursing yourself

Three routes, in order of how well they work:

1. **The Optum Bank mobile app** — photograph the receipt, enter the expense, submit
2. **The website** — the same flow with a real keyboard
3. **Paper form by mail** — slowest, and mostly a fallback

Expect to provide an **itemized receipt**. Optum is more consistent about asking for documentation than a purely self-directed custodian like Fidelity, so plan on attaching it rather than hoping the request doesn't come.

An itemized receipt means: date of service, patient name, provider name, description of the service or item, and the amount you owe. A credit card slip showing only a total is the single most common reason a submission comes back.

## The debit card shortcut

Optum issues a debit card drawing directly on the HSA. Paying with it skips reimbursement entirely — no claim, no waiting.

It does **not** skip the documentation. Card transactions are subject to the same substantiation rules, and Optum may ask you to prove one after the fact. A card swipe you can't document is a taxable distribution with a 20% penalty attached if you're under 65.

Keep receipts for card purchases exactly as you would for anything else.

## Which account are you spending from

Optum administers HSAs, HRAs, and FSAs, frequently for the same person at once. The rules differ sharply — an HSA is your money, an HRA is your employer's — and the debit card may draw on either. Check the account before assuming how a transaction will be treated.

## What to keep, and where

- Itemized receipt for every expense, card or reimbursement
- EOB where insurance was involved
- Proof of out-of-pocket payment
- A record linking each distribution to the expense it covered

Store it outside the Optum portal. Portal document retention is finite and access ends with the account — but the IRS can ask about a distribution long after either. Your own archive is the only copy guaranteed to still be there.
  $md$,
  '[
    {"url": "https://www.optumbank.com", "title": "Optum Bank", "accessed": "2026-09-20"},
    {"url": "https://www.optumbank.com/all-products/hsa.html", "title": "Optum Bank — Health Savings Account", "accessed": "2026-09-20"},
    {"url": "https://www.irs.gov/publications/p969", "title": "IRS Publication 969", "accessed": "2026-09-20"}
  ]'::jsonb,
  '2026-09-20',
  'manual_research',
  true
)

on conflict (id) do update set
  name                       = excluded.name,
  legal_name                 = excluded.legal_name,
  aliases                    = excluded.aliases,
  former_names               = excluded.former_names,
  org_type                   = excluded.org_type,
  website_url                = excluded.website_url,
  portal_url                 = excluded.portal_url,
  hq_state                   = excluded.hq_state,
  is_custodian               = excluded.is_custodian,
  is_administrator           = excluded.is_administrator,
  account_types              = excluded.account_types,
  market_share_pct           = excluded.market_share_pct,
  submission_tier            = excluded.submission_tier,
  routing_varies_by_employer = excluded.routing_varies_by_employer,
  docs_required              = excluded.docs_required,
  accepts_email_phi          = excluded.accepts_email_phi,
  has_guide                  = excluded.has_guide,
  guide_summary              = excluded.guide_summary,
  guide_body                 = excluded.guide_body,
  sources                    = excluded.sources,
  last_reviewed              = excluded.last_reviewed,
  data_source                = excluded.data_source,
  active                     = excluded.active;
