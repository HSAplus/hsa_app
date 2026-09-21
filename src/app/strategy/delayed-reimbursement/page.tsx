import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ShieldCheck,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { graph, article, breadcrumbs } from "@/lib/seo/structured-data";

const jsonLd = graph(
  article({
    path: "/strategy/delayed-reimbursement",
    headline: "The Delayed Reimbursement Strategy for HSAs",
    description:
      "Pay medical bills out of pocket, keep the receipts, and let your HSA compound tax-free. There is no IRS deadline to reimburse yourself — which makes an unclaimed receipt a standing right to withdraw tax-free, whenever you choose.",
  }),
  // Two levels, not three. There is no /strategy index page, so a
  // "Strategy" crumb would have to reuse this page's own URL — and a
  // BreadcrumbList with two items pointing at the same place is invalid.
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "Delayed Reimbursement Strategy", path: "/strategy/delayed-reimbursement" },
  ]),
);

export const metadata: Metadata = {
  alternates: { canonical: "https://hsa.plus/strategy/delayed-reimbursement" },
  title: "The Delayed HSA Reimbursement Strategy | HSA Plus",
  description:
    "Learn how the delayed HSA reimbursement strategy works. Pay medical bills out of pocket today, let your funds compound tax-free in index funds, and reimburse yourself decades later.",
  openGraph: {
    title: "The Delayed HSA Reimbursement Strategy | HSA Plus",
    description:
      "Pay medical bills out of pocket today, let your HSA compound tax-free, and reimburse yourself tax-free years later. The complete guide to the shoebox strategy.",
    url: "https://hsa.plus/strategy/delayed-reimbursement",
    siteName: "HSA Plus",
    images: [
      {
        url: "/og-image.jpg",
        width: 1920,
        height: 1080,
        alt: "HSA Plus: The Delayed Reimbursement Strategy",
      },
    ],
  },
};

export default function DelayedReimbursementPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav */}
      <header className="border-b border-[#E2E8F0]/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-base font-bold tracking-tight text-[#0C1220] dark:text-foreground">
              HSA Plus
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/calculator">
              <Button variant="ghost" size="sm" className="text-[13px] text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground">
                Calculator
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-accent font-semibold">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-muted-foreground mb-6">
          <Link href="/" className="hover:text-[#059669] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span>Strategy</span>
          <span>/</span>
          <span className="text-[#0C1220] dark:text-foreground font-medium">
            Delayed Reimbursements
          </span>
        </div>

        {/* Hero Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#059669]/20 bg-[#059669]/[0.04] px-4 py-1.5 mb-5">
            <TrendingUp className="h-3.5 w-3.5 text-[#059669]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#059669] font-medium">
              Tax Strategy Guide
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#0C1220] dark:text-white leading-[1.1]">
            The Delayed HSA Reimbursement Strategy
          </h1>
          <p className="mt-4 text-lg text-[#64748B] dark:text-slate-300 leading-relaxed">
            How paying for medical expenses with a credit card today and saving the receipts allows your HSA balance to compound into tens of thousands of dollars in tax-free wealth.
          </p>
        </div>

        {/* Article Body */}
        <div className="space-y-10 text-[15px] sm:text-base leading-relaxed text-[#475569] dark:text-slate-300">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-[#0C1220] dark:text-white mb-4">
              What is the Delayed Reimbursement Strategy?
            </h2>
            <p>
              Most people treat their Health Savings Account (HSA) like a debit card: they visit the doctor, swipe their HSA card, and immediately drain their balance. While this saves you from paying taxes on that medical expense, it robs you of the most valuable feature of an HSA: <strong>tax-free compound growth</strong>.
            </p>
            <p className="mt-3">
              Under <strong>IRS Notice 2004-50 (Q&amp;A 39)</strong>, there is no deadline by which you must reimburse yourself for an eligible medical expense. As long as your HSA was established before the expense occurred, you can reimburse yourself 5, 10, or 20 years later.
            </p>
            <p className="mt-3">
              This strategy, often referred to as the &quot;shoebox strategy,&quot; involves paying for medical expenses out of pocket today with cash or a regular credit card, keeping the itemized receipts safe, and leaving the money inside your HSA invested in low-cost index funds.
            </p>
          </section>

          {/* Section 2: The Math */}
          <section className="rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card p-6 sm:p-8 shadow-surface">
            <h3 className="text-xl font-bold text-[#0C1220] dark:text-white mb-3">
              The Math: How a $340 Receipt Turns Into $1,316
            </h3>
            <p className="text-sm sm:text-[15px] text-[#64748B] dark:text-slate-300 leading-relaxed mb-6">
              Assume you have a $340 doctor bill today. Here is what happens when you compare immediate reimbursement vs. the delayed strategy:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                  Immediate Reimbursement
                </p>
                <p className="text-2xl font-bold font-mono text-[#0C1220] dark:text-white mb-2">
                  $0 Growth
                </p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  You withdraw $340 immediately from your HSA. The money leaves the account and stops compounding permanently.
                </p>
              </div>

              <div className="rounded-xl border border-[#059669]/30 dark:border-[#059669]/40 bg-[#059669]/[0.03] dark:bg-[#059669]/10 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-[#34d399] mb-1">
                  Delayed Strategy (20 Years @ 7%)
                </p>
                <p className="text-2xl font-bold font-mono text-[#059669] dark:text-[#34d399] mb-2">
                  +$976 Tax-Free
                </p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Your $340 remains invested and grows into $1,316. In year 20, you withdraw your $340 tax-free. The $976 profit stays invested.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: The 3 IRS Rules */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-[#0C1220] dark:text-white mb-4">
              The 3 Strict IRS Rules You Must Follow
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "1. The HSA must be established before the expense occurs",
                  desc: "You cannot reimburse medical expenses incurred prior to the formal creation date of your HSA account. Once the account is open, all subsequent expenses qualify forever.",
                },
                {
                  title: "2. The expense must be a qualified medical expense",
                  desc: "Under IRC Section 213(d), the expense must be for medical care, dental, vision, prescription drugs, or qualified medical equipment. Cosmetic or non-qualifying expenses are subject to penalties.",
                },
                {
                  title: "3. You must keep itemized documentation",
                  desc: "The IRS does not accept bank statements or credit card receipts alone. You need an itemized bill or Explanation of Benefits (EOB) showing the date, patient name, medical service, and dollar amount.",
                },
              ].map((rule) => (
                <div key={rule.title} className="flex items-start gap-3.5">
                  <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-[#0C1220] dark:text-foreground">
                      {rule.title}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-muted-foreground mt-0.5">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: The 7-Year Trap */}
          <section className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span>The 7-Year Audit Trap</span>
            </div>
            <p className="text-sm sm:text-[15px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
              Many people believe the IRS 7-year audit retention window starts on the date of the doctor visit. <strong>This is false.</strong>
            </p>
            <p className="mt-2 text-sm sm:text-[15px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
              The 7-year audit clock begins in the tax year you claim the <em>distribution</em>. If you incur an expense in 2026 and reimburse yourself in 2046, you must keep that receipt until <strong>2053</strong>. Thermal paper receipts fade in 18 months, which is why digital cloud backup with audit verification is critical.
            </p>
          </section>

          {/* Section 5: How HSA Plus Helps */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-[#0C1220] dark:text-white mb-4">
              How HSA Plus Automates the Strategy
            </h2>
            <p>
              HSA Plus was built specifically to manage the delayed reimbursement workflow:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "Instant AI receipt scanning to extract amounts, dates, and providers",
                "IRS audit-readiness scoring to confirm all required fields are present",
                "Automatic 7-year retention tracking from the date of future reimbursement",
                "Growth projections showing the future value of your unreimbursed portfolio",
                "One-click claim submission when you finally decide to cash out",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm sm:text-[15px]">
                  <ShieldCheck className="h-4 w-4 text-[#059669] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA Box */}
          <div className="mt-12 rounded-2xl border border-[#059669]/20 bg-gradient-to-br from-[#059669]/[0.04] to-[#34d399]/[0.08] dark:from-[#059669]/10 dark:to-[#34d399]/10 p-8 text-center">
            <h3 className="text-2xl font-bold text-[#0C1220] dark:text-white">
              See what your receipts could earn
            </h3>
            <p className="mt-2 text-sm text-[#64748B] dark:text-slate-300 max-w-md mx-auto">
              Use our free interactive growth calculator to see how much tax-free wealth your unreimbursed medical bills can generate over 10, 20, or 30 years.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/calculator">
                <Button size="lg" className="shadow-accent font-semibold">
                  <Calculator className="h-4 w-4 mr-2" />
                  Open free calculator
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="font-semibold">
                  Start tracking free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-border bg-white dark:bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8] dark:text-muted-foreground">
            <Logo size={22} />
            <span>&copy; {new Date().getFullYear()} HSA Plus &middot; Tax-free wealth, made simple.</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] font-medium text-[#94A3B8] dark:text-muted-foreground">
            <Link href="/hsa-providers" className="hover:text-[#64748B] dark:hover:text-foreground">HSA Providers</Link>
            <Link href="/calculator" className="hover:text-[#64748B] dark:hover:text-foreground">Calculator</Link>
            <Link href="/pricing" className="hover:text-[#64748B] dark:hover:text-foreground">Pricing</Link>
            <Link href="/vs/spreadsheets" className="hover:text-[#64748B] dark:hover:text-foreground">HSA Plus vs Spreadsheets</Link>
            <Link href="/privacy" className="hover:text-[#64748B] dark:hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
