# HSA Plus

**Your HSA deserves a smarter strategy.**

HSA Plus is a full-stack web application for managing Health Savings Accounts, Limited Purpose FSAs (LPFSA), and Health Care FSAs (HCFSA). It helps users track medical expenses, maintain IRS audit-ready documentation, model investment growth, and optimize reimbursement timing to maximize the HSA triple tax advantage.

**Live at [hsa.plus](https://hsa.plus)**

---

## Features

### Expense Tracking & Compliance

- Log medical expenses with provider, amount, date, category, patient, and account type
- Upload multiple documents per expense (receipts, EOBs, invoices, credit card statements)
- Auto-computed audit-readiness scoring based on IRS requirements
- Reimbursement status and date tracking
- 7-year retention alerts for document lifecycle management
- Eligible expense verification
- Category and expense type tagging

### Investment Growth & Tax Optimization

- Interactive growth charts with custom time horizons and return rates
- Federal and state tax bracket settings for precise tax savings projections
- Balance and contribution tracking with expected return monitoring
- Unreimbursed expense growth tracking
- Standalone savings calculator (available at `/calculator`, no sign-up needed)

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
| **Bank Linking**   | [Plaid](https://plaid.com/) (Auth + Balance products)                     |
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
│       └── digest/route.ts             # Cron endpoint for email digests
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   ├── dashboard/                      # Dashboard-specific components
│   └── auth/                           # Auth components (Google sign-in, etc.)
├── lib/
│   ├── supabase/                       # Supabase client (browser, server, middleware)
│   ├── plaid.ts                        # Plaid client configuration
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
- (Optional) [Plaid](https://plaid.com/) developer account for bank linking
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

# Plaid (optional — for HSA balance sync)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# Resend (optional — for email digests)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

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
- **Database**: Postgres tables for profiles, expenses, dependents, expense templates, and HSA connections
- **Storage**: `hsa-documents` bucket for receipt and document uploads

### Plaid

- Links HSA accounts via Plaid Link
- Syncs real-time account balances
- Supports connect/disconnect lifecycle

### Resend

- Sends HTML email digests (weekly or monthly, user-configurable)
- Digest endpoint at `/api/digest` can be triggered via cron with optional `CRON_SECRET` protection

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

## License

Private project. All rights reserved.
