import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Shield,
  FileText,
  DollarSign,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Nav */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-1.5">
              <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-lg font-bold">HSA Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border bg-white dark:bg-gray-900 px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <Shield className="mr-2 h-4 w-4 text-emerald-600" />
            Secure HSA expense management
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Track Your{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              HSA Expenses
            </span>{" "}
            The Smart Way
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop losing track of medical expenses. Pay with your credit card,
            document everything, and reimburse yourself from your HSA when
            you&apos;re ready — letting your HSA investments grow tax-free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8"
              >
                Start Tracking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Document Everything",
              description:
                "Store links to EOBs, invoices, bills, and credit card statements — all in one place.",
            },
            {
              icon: DollarSign,
              title: "Track Reimbursements",
              description:
                'Mark expenses as "N" until you take the HSA reimbursement, then update to "Y" with the date.',
            },
            {
              icon: Shield,
              title: "Tax-Ready Records",
              description:
                "Keep qualified medical expenses organized for tax time with full audit trail.",
            },
            {
              icon: ShieldCheck,
              title: "IRS Audit Readiness",
              description:
                "Real-time audit score per expense. Avoid the 20% penalty + income tax on unproven HSA purchases.",
            },
            {
              icon: AlertTriangle,
              title: "7-Year Retention Alerts",
              description:
                "IRS keeps tax returns open for 7 years. Get alerts when records approach the retention limit.",
            },
            {
              icon: Heart,
              title: "Eligible Expense Database",
              description:
                "Built-in HSA-eligible expense list from ViaBenefits. Verify eligibility before you claim.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3 w-fit">
                <feature.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="mx-auto max-w-2xl space-y-6">
          {[
            "Medical bill comes in — pay with your credit card (not HSA debit card)",
            "Log the expense: description, amount, provider, and category",
            "Upload or link your receipt, EOB, invoice, and credit card statement",
            "The app auto-checks IRS audit readiness: receipt + (EOB or invoice) = ✓",
            'Mark reimbursed as "N" — let your HSA investments grow tax-free!',
            'When ready, reimburse yourself from HSA and update the status to "Y"',
            "Keep records for 7+ years per IRS rules — the app tracks retention for you",
          ].map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 h-8 w-8 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-muted-foreground pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IRS Compliance Callout */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Did You Know? IRS HSA Recordkeeping Rules
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>You</strong> are responsible for verifying eligibility — unlike
                    FSAs, HSAs allow any purchase. The burden of proof is on you.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>20% penalty + income tax</strong> on any HSA purchase you
                    can&apos;t prove was a qualified medical expense during an IRS audit.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Keep records for 7+ years</strong> — your tax return stays
                    open for audit for 7 years after filing.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Retroactive reimbursement</strong> — you can reimburse yourself
                    in 2026 for an expense from 2010, as long as you have the receipt.
                  </span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2 border-t border-amber-200 dark:border-amber-800">
                Source:{" "}
                <a
                  href="https://www.hrmorning.com/articles/hsa-requirements-receipts-recordkeeping/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-700"
                >
                  HRMorning — Little-Known HSA Requirements: Receipts and Recordkeeping
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} HSA Expense Tracker. Built for smart
            HSA management.
          </p>
        </div>
      </footer>
    </div>
  );
}
