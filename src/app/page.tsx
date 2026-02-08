import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Users,
  Wallet,
  Receipt,
  Clock,
  ChevronRight,
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={64}
              height={42}
              className="rounded-lg"
            />
            <span className="text-base font-semibold tracking-tight">
              HSA Plus
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-gray-500 dark:text-gray-400">
            <a
              href="#features"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#growth"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Growth
            </a>
            <a
              href="#how-it-works"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              How It Works
            </a>
            <Link
              href="/calculator"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Calculator
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-[13px] text-gray-600 dark:text-gray-400"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white text-[13px] rounded-lg px-4"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-gray-950 dark:to-gray-950" />
        <div className="relative container mx-auto px-6 pt-24 pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-3.5 py-1 text-[13px] font-medium text-emerald-700 dark:text-emerald-400 mb-8">
              <Shield className="h-3.5 w-3.5" />
              HSA + LPFSA + HCFSA management
            </p>
            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] text-gray-900 dark:text-white">
              Your HSA deserves
              <br />
              <span className="text-emerald-600 dark:text-emerald-400">
                a smarter strategy
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
              Track medical expenses, project investment growth, manage family
              dependents, and stay IRS audit-ready. One app for your entire
              HSA strategy.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 text-[15px] shadow-lg shadow-emerald-600/20"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 h-12 text-[15px] border-gray-200 dark:border-gray-700"
                >
                  Try the calculator
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-20 mx-auto max-w-2xl">
            <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
              {[
                { value: "3", label: "Account types supported" },
                { value: "7 yr", label: "Retention tracking" },
                { value: "100%", label: "Audit-ready records" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-4 py-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature pillars */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Everything in one place
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Built for the HSA power user who pays out-of-pocket and lets
            their investments compound tax-free.
          </p>
        </div>

        {/* Three main pillars */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Pillar 1 - Expense Tracking */}
          <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-8 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6">
              <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Expense tracking &amp; compliance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Log every medical expense with full documentation. Auto-computed
              audit readiness ensures you always have what the IRS requires.
            </p>
            <ul className="space-y-3">
              {[
                "Multiple document uploads per expense",
                "Auto audit-readiness scoring",
                "Reimbursement status & date tracking",
                "7-year retention alerts",
                "Eligible expense verification",
                "Category and expense type tagging",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 2 - Investment & Tax */}
          <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-8 hover:border-blue-200 dark:hover:border-blue-800/60 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-6">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Investment growth &amp; tax optimization
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              See how your HSA balance grows over time. Configure your
              investment parameters and tax brackets for precise projections.
            </p>
            <ul className="space-y-3">
              {[
                "Balance & contribution tracking",
                "Expected return projections",
                "Interactive growth charts",
                "Federal & state tax bracket settings",
                "Savings calculator (no sign-up needed)",
                "Unreimbursed expense growth tracking",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 3 - Family & Accounts */}
          <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-8 hover:border-violet-200 dark:hover:border-violet-800/60 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-6">
              <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Family &amp; multi-account management
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Track expenses for your entire family across HSA, LPFSA, and
              HCFSA accounts with per-patient and per-account breakdowns.
            </p>
            <ul className="space-y-3">
              {[
                "Spouse, children & domestic partner profiles",
                "Patient-level expense attribution",
                "HSA, LPFSA, and HCFSA support",
                "Per-account balance breakdowns",
                "Guided 3-step onboarding",
                "Secure profile & settings management",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400"
                >
                  <CheckCircle2 className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Growth section */}
      <section
        id="growth"
        className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/30"
      >
        <div className="container mx-auto px-6 py-24">
          <div className="mx-auto max-w-5xl grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                Investment Growth
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Let your HSA compound
                <br />
                while you wait
              </h2>
              <p className="mt-5 text-gray-500 dark:text-gray-400 leading-relaxed">
                The HSA triple tax advantage is most powerful when you delay
                reimbursements. HSA Plus helps you track every dollar and
                project exactly how much your patience is worth.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                {[
                  {
                    icon: TrendingUp,
                    title: "Growth projections",
                    desc: "Interactive charts with custom time horizons and return rates",
                  },
                  {
                    icon: Calculator,
                    title: "Tax savings",
                    desc: "See exact savings based on your federal and state brackets",
                  },
                  {
                    icon: Wallet,
                    title: "Balance tracking",
                    desc: "Monitor contributions, growth, and expected returns",
                  },
                  {
                    icon: Clock,
                    title: "Long-term strategy",
                    desc: "Plan 20+ years ahead with configurable parameters",
                  },
                ].map((item) => (
                  <div key={item.title}>
                    <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth visual */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Projected balance
                </p>
                <span className="text-xs text-gray-400">
                  $4,150/yr &middot; 7% return
                </span>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "5 years", amount: "$24,200", pct: 14 },
                  { label: "10 years", amount: "$57,800", pct: 34 },
                  { label: "15 years", amount: "$104,600", pct: 61 },
                  { label: "20 years", amount: "$172,400", pct: 100 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs text-gray-400">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                        {row.amount}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Contributions</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white tabular-nums">
                    $83,000
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Growth</p>
                  <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +$89,400
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
            <Calculator className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            See your numbers before you sign up
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Our free HSA Savings Calculator projects your balance growth and tax
            savings. No account needed.
          </p>
          <div className="mt-8">
            <Link href="/calculator">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl h-12 px-8 text-[15px] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Open calculator
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/30"
      >
        <div className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Up and running in minutes
            </h2>
          </div>

          <div className="mx-auto max-w-4xl grid gap-px sm:grid-cols-2 lg:grid-cols-4 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Sign up and complete the guided onboarding: personal info, dependents, and HSA investment settings.",
                icon: ShieldCheck,
              },
              {
                step: "02",
                title: "Log expenses",
                desc: "Record each medical expense with provider, amount, category, patient, and account type.",
                icon: FileText,
              },
              {
                step: "03",
                title: "Upload documents",
                desc: "Attach receipts, EOBs, invoices, and statements. Audit readiness is checked automatically.",
                icon: Receipt,
              },
              {
                step: "04",
                title: "Grow & reimburse",
                desc: "Let your HSA investments grow. Reimburse yourself anytime — even years later — and track every dollar.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white dark:bg-gray-900 p-6 lg:p-8"
              >
                <span className="text-xs font-semibold text-gray-300 dark:text-gray-600 tabular-nums">
                  {item.step}
                </span>
                <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-4 mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IRS Compliance */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-8">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  IRS recordkeeping rules you should know
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  {[
                    {
                      bold: "You bear the burden of proof",
                      rest: " — unlike FSAs, HSAs allow any purchase. The IRS expects you to verify eligibility.",
                    },
                    {
                      bold: "20% penalty + income tax",
                      rest: " on any HSA distribution you can\u2019t prove was a qualified medical expense.",
                    },
                    {
                      bold: "Keep records for 7+ years",
                      rest: " — your tax return stays open for audit for 7 years after filing.",
                    },
                    {
                      bold: "No expiration on reimbursement",
                      rest: " — you can reimburse yourself in 2026 for a 2010 expense, as long as you have documentation.",
                    },
                  ].map((item) => (
                    <div key={item.bold} className="flex gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p>
                        <strong className="text-gray-900 dark:text-white font-medium">
                          {item.bold}
                        </strong>
                        {item.rest}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-800/40 text-xs text-gray-400">
                  Source:{" "}
                  <a
                    href="https://www.hrmorning.com/articles/hsa-requirements-receipts-recordkeeping/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    HRMorning — HSA Requirements: Receipts and Recordkeeping
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/30">
        <div className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Start building tax-free wealth
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Set up in minutes with guided onboarding. Track expenses, manage
            dependents, and project your HSA growth.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 text-[15px] shadow-lg shadow-emerald-600/20"
              >
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-xl px-8 h-12 text-[15px] text-gray-500"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={32}
              height={21}
              className="rounded"
            />
            <span>
              &copy; {new Date().getFullYear()} HSA Plus
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-gray-400">
            <Link
              href="/calculator"
              className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Calculator
            </Link>
            <Link
              href="/login"
              className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
