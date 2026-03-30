# HSA Plus Pricing Tiers

## Overview

HSA Plus uses a freemium model. All users start on the **Free** tier. The **Plus** tier ($5/month or $48/year) unlocks automation and advanced features.

Plan logic is centralized in `src/lib/plans.ts`. The `plan_type` column on the `profiles` table determines each user's tier.

---

## Feature Comparison

| Feature | Free | Plus ($5/mo) |
|---|---|---|
| **Expense Tracking** | 10 expenses | Unlimited |
| **Document uploads per expense** | 5 | Unlimited |
| **Audit-readiness scoring** | Yes | Yes |
| **7-year retention alerts** | Yes | Yes |
| **Eligible expense verification** | Yes | Yes |
| **Category & expense type tagging** | Yes | Yes |
| **CSV export** | Yes | Yes |
| **Savings calculator** | Yes | Yes |
| **Interactive growth chart** | Yes | Yes |
| **What-if scenarios** | 2 | 4 |
| **Reimbursement optimizer** | Summary only | Full per-expense analysis |
| **Tax bracket settings** | Yes | Yes |
| **Contribution increase modeling** | No | Yes |
| **HSA account tracking** | Yes | Yes |
| **LPFSA / HCFSA accounts** | No | Yes |
| **Plaid balance sync** | No | Yes |
| **Manual balance entry** | Yes | Yes |
| **Track reimbursement status** | Yes | Yes |
| **Automated claim submission** | No | Yes |
| **Pre-filled reimbursement forms** | No | Yes |
| **Claim status tracking** | No | Yes |
| **Self expense tracking** | Yes | Yes |
| **Dependent profiles** | No | Yes |
| **Per-patient attribution** | No | Yes |
| **Email digest (weekly/monthly)** | No | Yes |
| **Retention deadline alerts** | Yes | Yes |

---

## Database Schema

The `profiles` table has four columns for plan management:

```sql
plan_type            text NOT NULL DEFAULT 'free'     -- 'free' | 'plus'
subscription_status  text NOT NULL DEFAULT 'inactive' -- 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
stripe_customer_id   text                             -- Stripe customer ID (set after checkout)
stripe_subscription_id text                           -- Stripe subscription ID (set after checkout)
```

The `plan_type` field is the authoritative source for feature gating. `subscription_status` tracks Stripe lifecycle state and will be updated by webhooks once Stripe is integrated.

---

## Architecture

### Plan Configuration — `src/lib/plans.ts`

Single source of truth for all plan limits and feature flags:

```typescript
PLAN_LIMITS.free.maxExpenses          // 10
PLAN_LIMITS.free.maxUploadsPerExpense // 5
PLAN_LIMITS.free.maxScenarios        // 2
PLAN_LIMITS.free.allowDependents     // false
PLAN_LIMITS.free.allowPlaid          // false
PLAN_LIMITS.free.allowClaimSubmission // false
PLAN_LIMITS.free.allowEmailDigest    // false
PLAN_LIMITS.free.allowContributionIncrease // false
PLAN_LIMITS.free.allowMultiAccount   // false (LPFSA/HCFSA)
PLAN_LIMITS.free.optimizerFull       // false
```

Helper functions:

- `getPlanLimits(planType)` — returns the limits object for a given plan
- `isPlusUser(profile)` — boolean check
- `getPlanType(profile)` — returns `'free'` or `'plus'`, defaults to `'free'` if profile is null

### Server-Side Gating — `src/app/dashboard/actions.ts`

Plan checks are enforced in server actions before any mutation:

| Action | Gate |
|---|---|
| `addExpense` | Expense count < 10 for free; rejects non-HSA account types for free |
| `addDependent` | Blocked for free |
| `createPlaidLinkToken` | Blocked for free |
| `connectHsaAccount` | Blocked for free |
| `sendTestDigest` | Blocked for free |
| `submitClaimAction` | Blocked for free |

Each returns a descriptive error message that the UI can display.

### Client-Side Gating

UI components receive `isPlus` or derive plan limits from the profile and conditionally render features or upgrade CTAs.

| Component | Gated Behavior |
|---|---|
| `dashboard-shell.tsx` | Plan badge in header, expense count on Add button, disables Add at limit |
| `scenario-comparison.tsx` | 2-scenario cap with upgrade badge |
| `file-upload.tsx` | `maxFiles` prop, blocks at 5 per expense for free |
| `expense-form-page.tsx` | Disables LPFSA/HCFSA in account selector |
| `reimbursement-optimizer.tsx` | Hides per-expense breakdown, shows upgrade CTA |
| `profile-form.tsx` | Gates dependents, contribution increase slider, email digest |
| `hsa-connection.tsx` | Shows upgrade badge instead of Plaid connect button |
| `submit-claim-dialog.tsx` | Shows upgrade block instead of claim workflow |

### Upgrade UI Components — `src/components/ui/upgrade-badge.tsx`

Two reusable components for gated features:

- `<UpgradeBadge message="..." />` — small inline badge for headers and buttons
- `<UpgradeBlock feature="..." description="..." />` — card-style CTA that replaces gated sections

---

## Stripe Integration (Not Yet Implemented)

The database columns (`stripe_customer_id`, `stripe_subscription_id`, `subscription_status`) are scaffolded. When Stripe is added, the implementation should include:

1. **Stripe Products**: Two price objects — $5/month and $48/year (20% discount)
2. **Checkout route**: `/api/stripe/checkout` to create Stripe Checkout sessions
3. **Webhook handler**: `/api/stripe/webhook` to handle `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events — updating `plan_type` and `subscription_status` on the profile
4. **Billing portal**: Link to Stripe Customer Portal for subscription management
5. **Trial**: Optional 14-day free trial of Plus for new sign-ups

The `plan_type` column should be flipped to `'plus'` when a subscription becomes active and back to `'free'` when it's canceled or expires.

---

## Adding New Gated Features

1. Add a new boolean or numeric field to the `PlanLimits` interface in `src/lib/plans.ts`
2. Set the free and plus values in `PLAN_LIMITS`
3. Add server-side enforcement in the relevant action in `dashboard/actions.ts`
4. Add client-side gating in the relevant component using `planLimits` or `isPlus`
5. Use `<UpgradeBadge>` or `<UpgradeBlock>` for the upgrade prompt
