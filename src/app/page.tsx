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
  TrendingUp,
  Calculator,
  Users,
  Receipt,
  Clock,
  ChevronRight,
  Lock,
  Eye,
  BarChart3,
  CircleDollarSign,
  AlertCircle,
  Zap,
} from "lucide-react";
import { MobileNav } from "@/components/landing/mobile-nav";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] touch-manipulation [-webkit-tap-highlight-color:transparent]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* ─── Nav ─── */}
      <header className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={56}
              height={37}
              className="rounded-lg"
            />
            <span className="text-base font-bold tracking-tight">
              HSA Plus
            </span>
          </div>
          <nav
            className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#64748B]"
            aria-label="Primary"
          >
            <a
              href="#features"
              className="rounded-sm hover:text-[#0C1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/50 focus-visible:ring-offset-2"
            >
              Features
            </a>
            <a
              href="#growth"
              className="rounded-sm hover:text-[#0C1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/50 focus-visible:ring-offset-2"
            >
              Growth
            </a>
            <a
              href="#how-it-works"
              className="rounded-sm hover:text-[#0C1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/50 focus-visible:ring-offset-2"
            >
              How It Works
            </a>
            <Link
              href="/pricing"
              className="rounded-sm hover:text-[#0C1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/50 focus-visible:ring-offset-2"
            >
              Pricing
            </Link>
            <Link
              href="/calculator"
              className="rounded-sm hover:text-[#0C1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/50 focus-visible:ring-offset-2"
            >
              Calculator
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/50 focus-visible:ring-offset-2"
            >
              <Button variant="ghost" size="sm" className="text-[13px] font-medium text-[#64748B]">
                Sign in
              </Button>
            </Link>
            <Link
              href="/signup"
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/50 focus-visible:ring-offset-2"
            >
              <Button size="sm" className="shadow-accent font-semibold">
                Get started free
              </Button>
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="main-content">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-[#059669]/[0.04] rounded-full blur-[200px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#34d399]/[0.03] rounded-full blur-[150px] translate-y-1/2" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/20 bg-[#059669]/[0.04] px-4 py-1.5 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse-dot" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#059669] font-medium">
                HSA + LPFSA + HCFSA
              </span>
            </div>

            <h1 className="text-balance text-[2.75rem] sm:text-[3.75rem] lg:text-[4.75rem] font-normal leading-[1.02] tracking-[-0.025em] text-[#0C1220]">
              Turn medical expenses into{" "}
              <span className="relative inline-block">
                <span className="gradient-text">tax-free wealth</span>
                <span className="absolute bottom-0 left-0 h-3 md:h-4 w-full rounded-sm bg-gradient-to-r from-[#059669]/12 to-[#34d399]/8" />
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[#64748B] leading-relaxed max-w-xl">
              Track expenses, project investment growth, manage family
              dependents, and stay IRS audit-ready. The only app built for the
              HSA power user.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-3 animate-fade-up-delay-1">
              <Link href="/signup">
                <Button size="lg" className="group shadow-accent text-[15px] font-semibold h-12 px-7">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button variant="outline" size="lg" className="text-[15px] h-12 px-7">
                  Try the calculator
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-[#94A3B8] animate-fade-up-delay-2">
              Free forever. No credit card required.
            </p>
          </div>

          {/* ─── Product Preview ─── */}
          <div className="mt-16 md:mt-20 animate-fade-up-delay-2">
            <div
              className="relative rounded-2xl border border-[#E2E8F0] bg-white shadow-surface-lg overflow-hidden"
              aria-hidden="true"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="h-6 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] flex items-center px-3">
                    <Lock className="h-3 w-3 text-[#94A3B8] mr-2" />
                    <span className="text-[11px] text-[#94A3B8]">hsaplus.app/dashboard</span>
                  </div>
                </div>
              </div>
              {/* Dashboard mockup */}
              <div className="p-6 md:p-8 bg-[#FAFAF8]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "HSA Balance", value: "$47,280", change: "+12.4%", color: "text-[#059669]" },
                    { label: "Unreimbursed", value: "$18,640", change: "Tax-free", color: "text-[#059669]" },
                    { label: "This Year", value: "$3,420", change: "8 expenses", color: "text-[#64748B]" },
                    { label: "Audit Score", value: "100%", change: "All verified", color: "text-[#059669]" },
                  ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                      <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider">{card.label}</p>
                      <p className="text-xl font-bold font-mono text-[#0C1220] mt-1">{card.value}</p>
                      <p className={`text-[11px] font-medium mt-0.5 ${card.color}`}>{card.change}</p>
                    </div>
                  ))}
                </div>
                {/* Growth chart mockup */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-[#0C1220]">Investment Growth</p>
                    <span className="text-[11px] font-mono text-[#94A3B8]">20-year projection</span>
                  </div>
                  <div className="flex items-end gap-1 h-24" aria-hidden="true">
                    {[12, 18, 22, 28, 32, 38, 42, 50, 56, 62, 68, 75, 82, 88, 95, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#059669] to-[#34d399] opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-[#94A3B8]">Today</span>
                    <span className="text-[10px] font-semibold text-[#059669]">$172,400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Stats Strip ─── */}
          <div className="mt-16 animate-fade-up-delay-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-[#E2E8F0]">
              {[
                { value: "$172K", label: "20-year projected growth" },
                { value: "20%", label: "Penalty avoided with proper records" },
                { value: "7 yrs", label: "Of records, organized automatically" },
                { value: "$0", label: "Cost to get started" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-6">
                  <p className="text-3xl md:text-4xl font-bold font-mono text-[#0C1220] tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs text-[#64748B] leading-snug">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem Agitation ─── */}
      <section className="relative bg-[#0C1220] text-white overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#059669]/[0.04] rounded-full blur-[200px] -translate-y-1/2" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-[2.75rem] leading-[1.15] tracking-tight">
              Most HSA holders are{" "}
              <span className="gradient-text">leaving money on the table</span>
            </h2>
            <p className="mt-4 text-white/50 text-base max-w-lg mx-auto leading-relaxed">
              The HSA is the most powerful tax-advantaged account in the U.S. tax code.
              Almost nobody uses it correctly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: CircleDollarSign,
                stat: "Only 9%",
                desc: "of HSA holders invest their balance. The rest leave it in cash, missing years of tax-free compound growth.",
              },
              {
                icon: AlertCircle,
                stat: "20% penalty",
                desc: "plus income tax on any HSA distribution you can\u2019t prove was a qualified medical expense. Records matter.",
              },
              {
                icon: BarChart3,
                stat: "$89,400",
                desc: "in potential tax-free growth over 20 years on max contributions at 7% returns. That\u2019s free money most people miss.",
              },
            ].map((item) => (
              <div key={item.stat} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-7 backdrop-blur-sm">
                <item.icon className="h-5 w-5 text-[#34d399] mb-4" />
                <p className="text-2xl font-bold font-mono text-white mb-2">{item.stat}</p>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="scroll-mt-24 py-24 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/20 bg-[#059669]/[0.04] px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse-dot" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#059669] font-medium">
                Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.1] tracking-tight text-[#0C1220]">
              Everything in{" "}
              <span className="gradient-text">one place</span>
            </h2>
            <p className="mt-4 text-[#64748B] text-lg max-w-lg mx-auto leading-relaxed">
              Built for the HSA power user who pays out-of-pocket and lets
              their investments compound tax-free.
            </p>
          </div>

          {/* Asymmetric feature grid */}
          <div className="grid gap-5 lg:grid-cols-5">
            {/* Feature 1 — Expense Tracking (wide) */}
            <div className="lg:col-span-3 group rounded-2xl bg-gradient-to-br from-[#059669] via-[#34d399] to-[#059669] p-[1.5px]">
              <div className="h-full rounded-[calc(16px-1.5px)] bg-white p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center mb-5">
                      <Receipt className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0C1220] mb-2">
                      Expense tracking &amp; compliance
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed mb-5">
                      Log every medical expense with full documentation. Auto-computed
                      audit readiness ensures you always have what the IRS requires.
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        "Multiple document uploads per expense",
                        "Auto audit-readiness scoring",
                        "7-year retention alerts",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-[#475569]">
                          <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Mini mockup */}
                  <div className="hidden md:block w-52 shrink-0">
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFAF8] p-4 shadow-surface">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-[#059669]" />
                        <span className="text-[10px] font-semibold text-[#059669]">Audit Ready</span>
                      </div>
                      {[
                        { name: "Dr. Smith Visit", status: true },
                        { name: "Prescription Rx", status: true },
                        { name: "Lab Work", status: true },
                      ].map((row) => (
                        <div key={row.name} className="flex items-center justify-between py-1.5 border-t border-[#E2E8F0]/60">
                          <span className="text-[10px] text-[#64748B]">{row.name}</span>
                          <CheckCircle2 className="h-3 w-3 text-[#059669]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 — Family (narrow) */}
            <div className="lg:col-span-2 group rounded-2xl border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:shadow-surface-lg hover:border-[#059669]/15">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0C1220] mb-2">
                Family &amp; multi-account
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed mb-5">
                Track expenses for your entire family across HSA, LPFSA, and
                HCFSA accounts.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Spouse, children & partner profiles",
                  "Patient-level expense attribution",
                  "Per-account balance breakdowns",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#475569]">
                    <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 — Investment Growth (full width) */}
            <div className="lg:col-span-5 group rounded-2xl border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:shadow-surface-lg hover:border-[#059669]/15">
              <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
                <div>
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0C1220] mb-2">
                    Investment growth &amp; tax optimization
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed mb-5">
                    See how your HSA balance grows over time. Configure investment
                    parameters and tax brackets for precise projections.
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      "Interactive growth charts with custom parameters",
                      "Federal & state tax bracket settings",
                      "Savings calculator — no sign-up needed",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-[#475569]">
                        <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Growth bars inline */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFAF8] p-6 shadow-surface">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-[#0C1220]">Projected Balance</span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">$4,150/yr &middot; 7% return</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "5 years", amount: "$24,200", pct: 14 },
                      { label: "10 years", amount: "$57,800", pct: 34 },
                      { label: "15 years", amount: "$104,600", pct: 61 },
                      { label: "20 years", amount: "$172,400", pct: 100 },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-[11px] text-[#94A3B8]">{row.label}</span>
                          <span className="text-sm font-bold font-mono text-[#0C1220] tabular-nums">
                            {row.amount}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#E2E8F0]">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#059669] to-[#34d399]"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Growth / Triple Tax Advantage ─── */}
      <section id="growth" className="scroll-mt-24 relative bg-[#0C1220] text-white overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#059669]/[0.05] rounded-full blur-[180px] translate-x-1/4 -translate-y-1/4" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#34d399]/20 bg-[#34d399]/10 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse-dot" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#34d399] font-medium">
                The Triple Tax Advantage
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.1] tracking-tight">
              Let your HSA compound{" "}
              <span className="gradient-text">while you wait</span>
            </h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
              The HSA triple tax advantage is most powerful when you delay
              reimbursements. HSA Plus helps you track every dollar and
              project exactly how much your patience is worth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Tax-free contributions",
                desc: "Every dollar you contribute reduces your taxable income. At a 32% bracket, $4,150 saves you $1,328 in taxes.",
                icon: Zap,
              },
              {
                step: "2",
                title: "Tax-free growth",
                desc: "Your investments grow without capital gains tax. At 7% returns, that\u2019s $89,400 in tax-free growth over 20 years.",
                icon: TrendingUp,
              },
              {
                step: "3",
                title: "Tax-free withdrawals",
                desc: "Reimburse yourself for qualified expenses anytime \u2014 even decades later. Zero taxes on the way out.",
                icon: CircleDollarSign,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] mb-5">
                  <item.icon className="h-6 w-6 text-[#34d399]" />
                </div>
                <p className="font-mono text-[11px] text-[#34d399] uppercase tracking-widest mb-2">Step {item.step}</p>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 mx-auto max-w-2xl rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-xs text-white/40 mb-1">Your contributions over 20 years</p>
                <p className="text-3xl font-bold font-mono text-white tabular-nums">$83,000</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Tax-free growth earned</p>
                <p className="text-3xl font-bold font-mono text-[#34d399] tabular-nums">+$89,400</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Calculator CTA ─── */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 md:p-12 shadow-surface-lg text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] mb-6 shadow-accent">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-[2.5rem] leading-[1.1] tracking-tight text-[#0C1220]">
                See your numbers before you sign up
              </h2>
              <p className="mt-4 text-[#64748B] text-base max-w-md mx-auto leading-relaxed">
                At $4,150/yr with a 7% return, your HSA could grow to{" "}
                <span className="font-bold font-mono text-[#059669]">$172,400</span>{" "}
                in 20 years. Run your own scenario.
              </p>
              <p className="mt-2 text-xs text-[#94A3B8]">
                No account needed. See your numbers in 30 seconds.
              </p>
              <div className="mt-8">
                <Link href="/calculator">
                  <Button size="lg" className="group shadow-accent text-[15px] font-semibold h-12 px-7">
                    Open the calculator
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing (teaser → /pricing) ─── */}
      <section id="pricing" className="scroll-mt-24 py-24 md:py-36 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12 md:mb-14">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/20 bg-[#059669]/[0.04] px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse-dot" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#059669] font-medium">
                Pricing
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.1] tracking-tight text-[#0C1220]">
              Free to start.{" "}
              <span className="gradient-text">Plus when you&apos;re ready.</span>
            </h2>
            <p className="mt-4 text-[#64748B] text-lg max-w-xl mx-auto leading-relaxed">
              Same app everyone uses in the dashboard — pick the tier that matches how you track expenses and reimbursements.
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-surface">
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-1">Free</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold font-mono text-[#0C1220]">$0</span>
                <span className="text-sm text-[#94A3B8]">forever</span>
              </div>
              <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
                Core HSA tracking and audit readiness — ideal for getting organized.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Up to 10 expenses · 5 uploads each",
                  "Audit scoring, retention alerts, CSV export",
                  "Growth charts & 2 what-if scenarios",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569]">
                    <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button variant="outline" className="w-full font-semibold">
                  Start free
                </Button>
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-[#F59E0B]/40 bg-gradient-to-br from-white to-amber-50/40 p-8 shadow-surface-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  Most popular
                </span>
              </div>
              <p className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-1">Plus</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold font-mono text-[#0C1220]">$5</span>
                <span className="text-sm text-[#94A3B8]">/mo</span>
              </div>
              <p className="text-sm text-[#64748B] mb-6">
                or <span className="font-mono font-medium text-[#0C1220]">$48/year</span> (save 20%)
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Unlimited expenses & uploads",
                  "Dependents, LPFSA/HCFSA, 4 scenarios",
                  "AI receipt scanning, claims, Plaid, digests",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569]">
                    <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block">
                <Button className="w-full shadow-accent font-semibold">
                  Compare plans &amp; upgrade
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-[#94A3B8]">
            Full side-by-side feature list, annual billing, and checkout on the{" "}
            <Link
              href="/pricing"
              className="font-medium text-[#059669] hover:underline underline-offset-2"
            >
              pricing page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="scroll-mt-24 bg-[#F1F5F9] py-24 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/20 bg-[#059669]/[0.04] px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse-dot" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#059669] font-medium">
                How It Works
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.1] tracking-tight text-[#0C1220]">
              Up and running in{" "}
              <span className="gradient-text">minutes</span>
            </h2>
          </div>

          <div className="mx-auto max-w-4xl grid md:grid-cols-3 gap-8 md:gap-0 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-[2px] bg-gradient-to-r from-[#059669] to-[#34d399]" />

            {[
              {
                step: "01",
                title: "Set up your account",
                desc: "Sign up and complete guided onboarding: personal info, dependents, HSA investment settings, and your first expense.",
                icon: ShieldCheck,
              },
              {
                step: "02",
                title: "Upload documentation",
                desc: "Attach receipts, EOBs, invoices, and statements. Audit readiness is scored automatically for every expense.",
                icon: FileText,
              },
              {
                step: "03",
                title: "Grow and reimburse",
                desc: "Let your HSA investments compound tax-free. Reimburse yourself anytime \u2014 even years later \u2014 and track every dollar.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center px-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#059669] to-[#34d399] text-white font-bold font-mono shadow-accent mb-5 relative z-10 text-lg">
                  {item.step}
                </div>
                <item.icon className="h-5 w-5 text-[#059669] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0C1220] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IRS Compliance (Trust-focused) ─── */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              {/* Left: Content */}
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-[#059669]/20 bg-[#059669]/[0.04] px-4 py-1.5 mb-6">
                  <Shield className="h-3.5 w-3.5 text-[#059669]" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#059669] font-medium">
                    IRS Compliance
                  </span>
                </div>
                <h2 className="text-2xl sm:text-[2.5rem] leading-[1.1] tracking-tight text-[#0C1220] mb-4">
                  Built for IRS{" "}
                  <span className="gradient-text">peace of mind</span>
                </h2>
                <p className="text-[#64748B] text-base leading-relaxed mb-6">
                  HSA Plus automatically tracks your audit readiness so you
                  never have to worry about penalties.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      bold: "You bear the burden of proof",
                      rest: " \u2014 unlike FSAs, the IRS expects you to verify eligibility for every HSA expense.",
                    },
                    {
                      bold: "20% penalty + income tax",
                      rest: " on any distribution you can\u2019t prove was a qualified medical expense.",
                    },
                    {
                      bold: "Keep records for 7+ years",
                      rest: " \u2014 your tax return stays open for audit for 7 years after filing.",
                    },
                    {
                      bold: "No expiration on reimbursement",
                      rest: " \u2014 reimburse yourself in 2026 for a 2010 expense, as long as you have documentation.",
                    },
                  ].map((item) => (
                    <div key={item.bold} className="flex gap-3">
                      <CheckCircle2 className="h-4 w-4 text-[#059669] mt-0.5 shrink-0" />
                      <p className="text-sm text-[#475569]">
                        <strong className="text-[#0C1220] font-semibold">
                          {item.bold}
                        </strong>
                        {item.rest}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Visual */}
              <div className="flex justify-center">
                <div className="rounded-2xl border border-[#059669]/15 bg-[#059669]/[0.03] p-8 text-center w-full max-w-xs">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] shadow-accent-lg mb-4">
                    <ShieldCheck className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-4xl font-bold font-mono text-[#059669]">100%</p>
                  <p className="text-sm font-semibold text-[#0C1220] mt-1">Audit Ready</p>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Every expense scored automatically. Missing docs flagged instantly.
                  </p>
                  <div className="mt-5 pt-5 border-t border-[#059669]/10 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-lg font-bold font-mono text-[#0C1220]">7 yr</p>
                      <p className="text-[10px] text-[#64748B]">Retention tracking</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-mono text-[#0C1220]">3</p>
                      <p className="text-[10px] text-[#64748B]">Account types</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Signals ─── */}
      <section className="border-y border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Lock, title: "Bank-level encryption", desc: "Your data is encrypted at rest and in transit" },
              { icon: Eye, title: "Your data stays yours", desc: "We never sell or share your information" },
              { icon: Shield, title: "SOC 2 infrastructure", desc: "Hosted on Supabase with enterprise security" },
              { icon: Clock, title: "Free forever", desc: "No hidden fees. No credit card required." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E2E8F0] shadow-sm mb-3">
                  <item.icon className="h-4.5 w-4.5 text-[#059669]" />
                </div>
                <p className="text-sm font-semibold text-[#0C1220]">{item.title}</p>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative bg-[#0C1220] text-white overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#059669]/[0.04] rounded-full blur-[200px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-40 text-center">
          <h2 className="text-3xl sm:text-[3.5rem] leading-[1.08] tracking-tight max-w-2xl mx-auto">
            Start tracking your HSA{" "}
            <span className="gradient-text">in under 2 minutes</span>
          </h2>
          <p className="mt-5 text-white/50 text-lg max-w-md mx-auto leading-relaxed">
            Free forever. No credit card required. Guided onboarding gets you
            set up in minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="group shadow-accent text-base font-semibold min-h-11 px-8 sm:min-h-12">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="text-white/50 hover:text-white hover:bg-white/10 min-h-11 px-8 sm:min-h-12">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={28}
              height={18}
              className="rounded"
            />
            <span>
              &copy; {new Date().getFullYear()} HSA Plus &middot; Tax-free wealth, made simple.
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] font-medium text-[#94A3B8]">
            <Link
              href="/calculator"
              className="rounded-sm hover:text-[#64748B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 focus-visible:ring-offset-2"
            >
              Calculator
            </Link>
            <Link
              href="/pricing"
              className="rounded-sm hover:text-[#64748B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 focus-visible:ring-offset-2"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="rounded-sm hover:text-[#64748B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 focus-visible:ring-offset-2"
            >
              Privacy
            </Link>
            <Link
              href="/login"
              className="rounded-sm hover:text-[#64748B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
