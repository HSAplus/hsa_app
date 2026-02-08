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
  ArrowUpRight,
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ─── Nav ─── */}
      <header className="border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={56}
              height={37}
              className="rounded-lg"
            />
            <span className="text-base font-semibold tracking-tight font-sans">
              HSA Plus
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-[#64748B]">
            <a href="#features" className="hover:text-[#0F172A] transition-colors">
              Features
            </a>
            <a href="#growth" className="hover:text-[#0F172A] transition-colors">
              Growth
            </a>
            <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">
              How It Works
            </a>
            <Link href="/calculator" className="hover:text-[#0F172A] transition-colors">
              Calculator
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[13px] text-[#64748B]">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Radial glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#059669]/[0.06] rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#34d399]/[0.04] rounded-full blur-[120px] translate-y-1/2" />

        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            {/* Text */}
            <div>
              {/* Section label */}
              <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/30 bg-[#059669]/5 px-5 py-2 mb-8">
                <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse-dot" />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#059669]">
                  HSA + LPFSA + HCFSA
                </span>
              </div>

              <h1 className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] font-normal leading-[1.05] tracking-[-0.02em] text-[#0F172A]">
                Your HSA deserves a{" "}
                <span className="relative inline-block">
                  <span className="gradient-text">smarter strategy</span>
                  <span className="absolute bottom-[-0.25rem] md:bottom-[-0.5rem] left-0 h-3 md:h-4 w-full rounded-sm bg-gradient-to-r from-[#059669]/15 to-[#34d399]/10" />
                </span>
              </h1>

              <p className="mt-7 text-lg text-[#64748B] leading-relaxed max-w-lg">
                Track medical expenses, sync your HSA balance, compare what-if
                scenarios, and get weekly or monthly email digests. One app for
                your entire HSA strategy.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/calculator">
                  <Button variant="outline" size="lg">
                    Try the calculator
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Graphic */}
            <div className="hidden lg:block relative" aria-hidden="true">
              <div className="relative w-full aspect-square max-w-md ml-auto">
                {/* Rotating dashed ring */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#059669]/20 animate-rotate-slow" />

                {/* Central gradient circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-[#059669] to-[#34d399] shadow-accent-lg" />

                {/* Floating card 1 */}
                <div className="absolute top-8 right-8 bg-white rounded-xl border border-[#E2E8F0] shadow-lg p-4 w-48 animate-float">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-[#0F172A]">Growth</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#0F172A]">$172,400</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">20yr projected</p>
                </div>

                {/* Floating card 2 */}
                <div className="absolute bottom-12 left-4 bg-white rounded-xl border border-[#E2E8F0] shadow-lg p-4 w-44 animate-float-delayed">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-[#0F172A]">Audit Ready</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#059669]">100%</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">All records verified</p>
                </div>

                {/* Decorative dot grid */}
                <div className="absolute bottom-4 right-20 grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#059669]/20" />
                  ))}
                </div>

                {/* Corner accent block */}
                <div className="absolute top-0 left-12 w-12 h-12 rounded-lg bg-[#059669] shadow-accent rotate-12" />
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-20 mx-auto max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E2E8F0]">
              {[
                { value: "3", label: "Account types supported" },
                { value: "7 yr", label: "Retention tracking" },
                { value: "100%", label: "Audit-ready records" },
                { value: "Sync", label: "HSA balance via Plaid" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-4 py-2">
                  <p className="text-2xl font-bold font-mono text-[#0F172A]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            {/* Section label badge */}
            <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/30 bg-[#059669]/5 px-5 py-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse-dot" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#059669]">
                Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.15] tracking-tight text-[#0F172A]">
              Everything in{" "}
              <span className="gradient-text">one place</span>
            </h2>
            <p className="mt-5 text-[#64748B] text-lg max-w-lg mx-auto leading-relaxed">
              Built for the HSA power user who pays out-of-pocket and lets
              their investments compound tax-free.
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Pillar 1 - Featured with gradient border */}
            <div className="rounded-2xl bg-gradient-to-br from-[#059669] via-[#34d399] to-[#059669] p-[2px]">
              <div className="h-full rounded-[calc(16px-2px)] bg-white p-8">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center mb-6">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2 font-sans">
                  Expense tracking &amp; compliance
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                  Log every medical expense with full documentation. Auto-computed
                  audit readiness ensures you always have what the IRS requires.
                </p>
                <ul className="space-y-3">
                  {[
                    "Multiple document uploads per expense",
                    "Auto audit-readiness scoring",
                    "Reimbursement status & date tracking",
                    "7-year retention alerts",
                    "Recurring expense templates",
                    "Annual tax summary & CSV export",
                    "Category and expense type tagging",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569]">
                      <CheckCircle2 className="h-4 w-4 text-[#059669] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:shadow-xl hover:border-[#059669]/20">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2 font-sans">
                Investment growth &amp; tax optimization
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                See how your HSA balance grows over time. Configure your
                investment parameters and tax brackets for precise projections.
              </p>
              <ul className="space-y-3">
                {[
                  "Balance & contribution tracking",
                  "Reimbursement strategy optimizer",
                  "What-if scenario comparison (up to 4)",
                  "HSA balance sync via Plaid",
                  "Expected return & contribution increase",
                  "Savings calculator (no sign-up needed)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569]">
                    <CheckCircle2 className="h-4 w-4 text-[#059669] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:shadow-xl hover:border-[#059669]/20">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2 font-sans">
                Family &amp; multi-account management
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                Track expenses for your entire family across HSA, LPFSA, and
                HCFSA accounts with per-patient and per-account breakdowns.
              </p>
              <ul className="space-y-3">
                {[
                  "Spouse, children & domestic partner profiles",
                  "Patient-level expense attribution",
                  "HSA, LPFSA, and HCFSA support",
                  "IRS contribution limits table (multi-year)",
                  "55+ catch-up contribution support",
                  "Weekly or monthly email digest",
                  "Secure profile & settings management",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569]">
                    <CheckCircle2 className="h-4 w-4 text-[#059669] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Growth (Inverted Section) ─── */}
      <section id="growth" className="relative bg-[#0F172A] text-white overflow-hidden">
        {/* Dot pattern texture */}
        <div className="absolute inset-0 dot-pattern" />
        {/* Radial glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#059669]/[0.06] rounded-full blur-[150px] translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#34d399]/[0.04] rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />

        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-44">
          <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              {/* Section label */}
              <div className="inline-flex items-center gap-3 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-5 py-2 mb-6">
                <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse-dot" />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#34d399]">
                  Investment Growth
                </span>
              </div>

              <h2 className="text-3xl sm:text-[3.25rem] leading-[1.15] tracking-tight">
                Let your HSA compound{" "}
                <span className="gradient-text">while you wait</span>
              </h2>
              <p className="mt-5 text-white/70 text-lg leading-relaxed max-w-lg">
                The HSA triple tax advantage is most powerful when you delay
                reimbursements. HSA Plus helps you track every dollar and
                project exactly how much your patience is worth.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-8">
                {[
                  {
                    icon: TrendingUp,
                    title: "Growth projections",
                    desc: "Charts with milestones, contribution increase, and time horizon",
                  },
                  {
                    icon: Calculator,
                    title: "What-if scenarios",
                    desc: "Compare up to 4 scenarios side-by-side with different assumptions",
                  },
                  {
                    icon: Wallet,
                    title: "Balance sync",
                    desc: "Connect your HSA via Plaid and keep your balance up to date",
                  },
                  {
                    icon: Clock,
                    title: "Reimbursement strategy",
                    desc: "See which expenses have the most growth potential if you wait",
                  },
                ].map((item) => (
                  <div key={item.title}>
                    <item.icon className="h-5 w-5 text-[#34d399] mb-2.5" />
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-white/50 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth visual */}
            <div className="rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  Projected balance
                </p>
                <span className="text-xs font-mono text-white/40">
                  $4,150/yr &middot; 7% return
                </span>
              </div>
              <div className="p-6 space-y-5">
                {[
                  { label: "5 years", amount: "$24,200", pct: 14 },
                  { label: "10 years", amount: "$57,800", pct: 34 },
                  { label: "15 years", amount: "$104,600", pct: 61 },
                  { label: "20 years", amount: "$172,400", pct: 100 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs text-white/40">{row.label}</span>
                      <span className="text-sm font-semibold font-mono text-white tabular-nums">
                        {row.amount}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#059669] to-[#34d399]"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-white/[0.04] grid grid-cols-2 gap-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-white/40">Contributions</p>
                  <p className="text-base font-semibold font-mono text-white tabular-nums">
                    $83,000
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Growth</p>
                  <p className="text-base font-semibold font-mono text-[#34d399] tabular-nums">
                    +$89,400
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Calculator CTA ─── */}
      <section className="py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] mb-6 shadow-accent">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-[2.5rem] leading-[1.15] tracking-tight text-[#0F172A]">
              See your numbers before you sign up
            </h2>
            <p className="mt-5 text-[#64748B] text-lg max-w-md mx-auto leading-relaxed">
              Our free HSA Savings Calculator projects your balance growth and tax
              savings. No account needed.
            </p>
            <div className="mt-8">
              <Link href="/calculator">
                <Button variant="outline" size="lg" className="group">
                  Open calculator
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="bg-[#F1F5F9] py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/30 bg-[#059669]/5 px-5 py-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse-dot" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#059669]">
                How It Works
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.15] tracking-tight text-[#0F172A]">
              Up and running in{" "}
              <span className="gradient-text">minutes</span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="mx-auto max-w-4xl">
            {/* Desktop horizontal */}
            <div className="hidden md:grid grid-cols-4 gap-0 relative">
              {/* Connecting line */}
              <div className="absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-[2px] bg-gradient-to-r from-[#059669] to-[#34d399]" />

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
                  desc: "Let your HSA investments grow. Reimburse yourself anytime and track every dollar.",
                  icon: TrendingUp,
                },
              ].map((item, i) => (
                <div key={item.step} className="relative text-center px-4">
                  {/* Step number circle */}
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#059669] to-[#34d399] text-white text-sm font-bold font-mono shadow-accent mb-5 relative z-10">
                    {item.step}
                  </div>
                  {/* Arrow connector (between steps) */}
                  {i < 3 && (
                    <div className="absolute top-[15px] -right-2 z-20">
                      <ArrowRight className="h-3.5 w-3.5 text-[#059669]" />
                    </div>
                  )}
                  <item.icon className="h-5 w-5 text-[#059669] mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-2 font-sans">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile vertical */}
            <div className="md:hidden space-y-8">
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
                  desc: "Let your HSA investments grow. Reimburse yourself anytime and track every dollar.",
                  icon: TrendingUp,
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#059669] to-[#34d399] text-white text-sm font-bold font-mono flex items-center justify-center shadow-accent shrink-0">
                      {item.step}
                    </div>
                    <div className="w-[2px] flex-1 bg-gradient-to-b from-[#059669]/40 to-transparent mt-2" />
                  </div>
                  <div className="pb-4">
                    <item.icon className="h-5 w-5 text-[#059669] mb-2" />
                    <h3 className="text-sm font-semibold text-[#0F172A] mb-1.5 font-sans">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── IRS Compliance ─── */}
      <section className="py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 shadow-md">
              <div className="flex gap-5">
                <div className="shrink-0">
                  <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-4 font-sans text-lg">
                    IRS recordkeeping rules you should know
                  </h3>
                  <div className="space-y-3.5 text-sm text-[#475569]">
                    {[
                      {
                        bold: "You bear the burden of proof",
                        rest: " \u2014 unlike FSAs, HSAs allow any purchase. The IRS expects you to verify eligibility.",
                      },
                      {
                        bold: "20% penalty + income tax",
                        rest: " on any HSA distribution you can\u2019t prove was a qualified medical expense.",
                      },
                      {
                        bold: "Keep records for 7+ years",
                        rest: " \u2014 your tax return stays open for audit for 7 years after filing.",
                      },
                      {
                        bold: "No expiration on reimbursement",
                        rest: " \u2014 you can reimburse yourself in 2026 for a 2010 expense, as long as you have documentation.",
                      },
                    ].map((item) => (
                      <div key={item.bold} className="flex gap-3">
                        <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <p>
                          <strong className="text-[#0F172A] font-medium">
                            {item.bold}
                          </strong>
                          {item.rest}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 pt-5 border-t border-amber-200/60 text-xs text-[#94A3B8]">
                    Source:{" "}
                    <a
                      href="https://www.hrmorning.com/articles/hsa-requirements-receipts-recordkeeping/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#64748B]"
                    >
                      HRMorning &mdash; HSA Requirements: Receipts and Recordkeeping
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA (Inverted) ─── */}
      <section className="relative bg-[#0F172A] text-white overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#059669]/[0.05] rounded-full blur-[150px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36 text-center">
          <h2 className="text-3xl sm:text-[3.25rem] leading-[1.15] tracking-tight">
            Start building{" "}
            <span className="gradient-text">tax-free wealth</span>
          </h2>
          <p className="mt-5 text-white/60 text-lg max-w-md mx-auto leading-relaxed">
            Set up in minutes. Sync your HSA, track expenses, compare scenarios,
            and get weekly or monthly email digests.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="group">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="text-white/60 hover:text-white hover:bg-white/10">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={28}
              height={18}
              className="rounded"
            />
            <span>
              &copy; {new Date().getFullYear()} HSA Plus
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-[#94A3B8]">
            <Link href="/calculator" className="hover:text-[#64748B] transition-colors">
              Calculator
            </Link>
            <Link href="/login" className="hover:text-[#64748B] transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[#64748B] transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
