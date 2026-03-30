<p align="center">
  <img src="docs/assets/logo-dark.png" alt="HSA Plus" width="480" />
</p>

<p align="center">
  <strong>Your HSA strategy, simplified.</strong><br />
  Track medical expenses, project investment growth, manage family dependents, and stay IRS audit-ready.
</p>

<p align="center">
  <a href="https://hsa.plus">hsa.plus</a>
</p>

---

HSA Plus is a full-stack web application for managing Health Savings Accounts, Limited Purpose FSAs (LPFSA), and Health Care FSAs (HCFSA). It helps users track medical expenses, maintain IRS audit-ready documentation, model investment growth, and optimize reimbursement timing to maximize the HSA triple tax advantage.

---

## Features

### Expense Tracking & Compliance

- Log medical expenses with provider, amount, date, category, patient, and account type
- **AI receipt scanning** — upload or photograph a receipt and auto-populate all expense fields via Claude vision (Plus)
- Upload multiple documents per expense (receipts, EOBs, invoices, credit card statements)
- Auto-computed audit-readiness scoring based on IRS requirements
- Reimbursement status and date tracking
- 7-year retention alerts for document lifecycle management
- Eligible expense verification
- Category and expense type tagging
- Expense templates for quick entry of recurring costs
- Annual tax summary with per-year CSV export

### Claims & Reimbursement

- Submit claims directly from eligible expenses
- Claims tracking with status and submission channel
- Reimbursement optimizer — see which unreimbursed expenses have the most growth potential
- Mark expenses as reimbursed with date and amount

### Investment Growth & Tax Optimization

- Interactive growth charts with milestones and contribution projections
- What-if scenario comparison (up to 4 side-by-side)
- Federal and state tax bracket settings for precise tax savings projections
- Balance and contribution tracking with expected return monitoring
- Unreimbursed expense growth tracking
- Standalone savings calculator with HSA vs. taxable comparison

### Family & Multi-Account Management

- Dependent profiles for spouse, children, and domestic partners
- Per-patient expense attribution
- HSA, LPFSA, and HCFSA account type support
- Per-account balance breakdowns
- Guided 3-step onboarding
- Secure profile and settings management

---

## Tech Stack

| Layer              | Technology                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) (App Router, Server Actions)            |
| **Language**       | TypeScript                                                                 |
| **UI**             | React 19, Tailwind CSS 4, Radix UI, shadcn/ui, Framer Motion              |
| **Charts**         | Recharts                                                                   |
| **Forms**          | React Hook Form + Zod validation                                          |
| **Auth & Database**| [Supabase](https://supabase.com/) (Auth, Postgres, Storage)               |
| **AI**             | [Anthropic Claude](https://anthropic.com/) (receipt scanning via vision API) |
| **Email**          | [Resend](https://resend.com/) (transactional email + scheduled digests)   |
| **Hosting**        | [Vercel](https://vercel.com/) via GitHub deployment                       |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page (marketing)
│   ├── layout.tsx                      # Root layout with metadata
│   ├── login/                          # Login page
│   ├── signup/                         # Signup page
│   ├── forgot-password/                # Password reset request
│   ├── reset-password/                 # Password reset form
│   ├── calculator/                     # Standalone savings calculator
│   ├── privacy/                        # Privacy policy
│   ├── auth/
│   │   ├── actions.ts                  # Auth server actions (login, signup, etc.)
│   │   └── callback/route.ts           # OAuth/email code exchange
│   ├── dashboard/
│   │   ├── page.tsx                    # Main dashboard
│   │   ├── actions.ts                  # Dashboard server actions
│   │   ├── expenses/new/               # Create expense
│   │   ├── expenses/[id]/edit/         # Edit expense
│   │   ├── profile/                    # Profile & HSA settings
│   │   └── login-settings/             # Email/password management
│   └── api/
│       ├── digest/route.ts             # Cron endpoint for email digests
│       └── receipts/scan/route.ts      # AI receipt scanning endpoint (Plus)
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   ├── dashboard/                      # Dashboard components (stats, expenses, growth,
│   │                                   #   scenarios, tax summary, claims, templates, etc.)
│   │   └── savings-calculator/         # Calculator inputs, chart, and projections
│   └── auth/                           # Auth components (Google sign-in, etc.)
├── lib/
│   ├── supabase/                       # Supabase client (browser, server, middleware)
│   ├── receipt-scanner.ts               # AI receipt extraction via Claude vision
│   ├── plaid.ts                        # Plaid client configuration (not yet enabled)
│   ├── resend.ts                       # Resend email client
│   ├── types.ts                        # Shared TypeScript types
│   ├── hsa-constants.ts                # IRS limits, tax brackets, calculator logic
│   └── email-templates/                # HTML email templates for digests
├── hooks/                              # Custom React hooks
└── middleware.ts                       # Auth middleware (route protection)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com/) project
- (Optional) [Resend](https://resend.com/) account for email digests

### Installation

```bash
git clone https://github.com/nirmaldesai/hsa_app.git
cd hsa_app
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (optional — for email digests)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Anthropic Claude (optional — for AI receipt scanning)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Cron protection (optional)
CRON_SECRET=your_cron_secret
```

### Development

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## Authentication

HSA Plus uses Supabase Auth with two sign-in methods:

- **Email + password** — with email confirmation, password reset, and account settings
- **Google OAuth** — one-click sign-in via Google

Session management is handled through SSR cookies with automatic refresh via Next.js middleware. All routes except the landing page, auth pages, and the calculator are protected.

---

## Key Integrations

### Supabase

- **Auth**: User registration, login, OAuth, password reset
- **Database**: Postgres with 7 tables — see [Database Schema](#database-schema)
- **Storage**: `hsa-documents` bucket for receipt and document uploads

### Plaid (planned — not yet enabled)

Scaffolding exists for HSA balance sync via Plaid Link (`src/lib/plaid.ts`, `src/components/dashboard/hsa-connection.tsx`), but the integration is not currently active in production.

### Anthropic Claude

- Powers the **AI receipt scanning** feature for Plus subscribers
- Receives only the receipt image — no user PII is sent
- Extracts provider, amount, date, description, category, expense type, and payment method
- Returns per-field confidence scores (high / medium / low) for review UX
- API route at `/api/receipts/scan` handles auth, Plus gating, and server-side processing

### Resend

- Sends HTML email digests (weekly or monthly, user-configurable)
- Digest endpoint at `/api/digest` can be triggered via cron with optional `CRON_SECRET` protection

---

## Database Schema

The app uses Supabase Postgres with 7 tables. Full schema is in [`Database.sql`](Database.sql).

| Table | Purpose |
| ----- | ------- |
| `profiles` | User settings — name, DOB, HSA balance, contribution, return rate, tax brackets, coverage type, digest preferences, plan/subscription status |
| `expenses` | Medical expenses with provider, patient, category, account type, reimbursement status, audit readiness, tax year, and document URLs (receipts, EOBs, invoices, statements) |
| `dependents` | Family members (spouse, dependent child, domestic partner) linked to a user |
| `expense_templates` | Reusable expense shortcuts with pre-filled fields and frequency |
| `claims` | Claim submissions tied to an expense and HSA administrator, with status lifecycle (draft → submitted → processing → approved/denied → reimbursed) |
| `hsa_administrators` | Reference table of HSA custodians with submission tiers (API, email, fax, portal) and contact details |
| `hsa_connections` | Plaid-linked HSA accounts (not yet enabled in production) |

All user-owned tables enforce row-level security (RLS) scoped to `auth.uid() = user_id`. The `profiles` table is keyed directly to `auth.users(id)` and auto-created via a database trigger on signup.

---

## IRS Contribution Limits

The app includes built-in IRS HSA contribution limits from 2014 through 2026:

| Year | Individual | Family  | 55+ Catch-Up |
| ---- | ---------- | ------- | ------------ |
| 2024 | $4,150     | $8,300  | +$1,000      |
| 2025 | $4,300     | $8,550  | +$1,000      |
| 2026 | $4,400     | $8,750  | +$1,000      |

---

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start development server   |
| `npm run build` | Production build           |
| `npm start`     | Start production server    |
| `npm run lint`  | Run ESLint                 |

---

## Design

HSA Plus follows the **Verdant Precision** design philosophy — organic vitality meets clinical exactness. The visual language is built on a constrained emerald palette ranging from deep forest shadow to bright leaf-light, grounded by near-black. Form follows the logic of crystalline growth: faceted and angular where necessary, but never cold. Rounded elements exist only where they soften critical junctions.

The plus sign and intersection are treated as structural geometry representing accumulation, addition, and the power of compounding. Typography is architectural — it carries weight without shouting and occupies space with authority. Negative space is deliberate, providing the oxygen that allows each element to breathe.

<p align="center">
  <img src="docs/assets/icon.png" alt="HSA Plus Icon" width="128" />
</p>

Full design philosophy: [`docs/design-philosophy.md`](docs/design-philosophy.md)

---

## License

Private project. All rights reserved.
