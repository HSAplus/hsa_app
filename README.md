# HSA Expense Tracker

A modern web application to track your Health Savings Account (HSA) expenses, reimbursements, and store receipts/EOBs/invoices. Built with the strategy of paying medical bills with your credit card, documenting everything, and reimbursing yourself from your HSA when you're ready — letting your HSA investments grow tax-free.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Backend/Auth**: Supabase (Auth + Database + Row Level Security)
- **Deployment**: Vercel via GitHub
- **Icons**: Lucide React

## Features

- 🔐 **Authentication**: Email/password sign up and sign in via Supabase Auth
- 📊 **Dashboard**: Overview stats (total expenses, reimbursed, pending)
- 📝 **Expense Tracking**: Add, edit, and delete medical expenses
- 🏷️ **Categories**: Medical, Dental, Vision, Prescription, Mental Health, Other
- ✅ **Reimbursement Status**: Mark as Y/N with date and amount tracking
- 📎 **Document Links**: Store links to EOB, Invoice/Bill, and Receipt/Credit Card Statement
- 🔍 **Search & Filter**: Search by description/provider, filter by category and status
- 📱 **Responsive**: Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hsa_app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** and run the SQL from `supabase/schema.sql`
3. Go to **Settings → API** and copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Copy the env template and add your Supabase credentials:

```bash
# Edit .env.local with your values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Deploy to Vercel

1. Push to GitHub
2. Import your repo on [Vercel](https://vercel.com)
3. Add the environment variables in the Vercel dashboard
4. Deploy!

## Database Schema

The `expenses` table includes:

| Column | Type | Description |
|--------|------|-------------|
| description | text | Brief note of the service or item |
| amount | decimal | The total you paid out-of-pocket |
| date_of_service | date | When the service was provided |
| provider | text | Doctor/provider name |
| category | text | medical, dental, vision, prescription, mental_health, other |
| reimbursed | boolean | Mark "N" until you take the money from HSA; then update to "Y" |
| reimbursed_date | date | Date of reimbursement |
| reimbursed_amount | decimal | Amount reimbursed |
| payment_method | text | credit_card, debit_card, hsa_card, cash, check, other |
| receipt_urls | text[] | Links to Receipt documents (multiple supported) |
| eob_urls | text[] | Links to Explanation of Benefits documents |
| invoice_urls | text[] | Links to Invoice/Bill documents |
| credit_card_statement_urls | text[] | Links to Credit Card Statement documents |
| notes | text | Additional notes |

## License

MIT
