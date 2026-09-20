"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PlanType } from "@/lib/types";

interface PricingContentProps {
  planType: PlanType;
  isLoggedIn: boolean;
}

interface FeatureCategory {
  category: string;
  items: {
    name: string;
    free: string | boolean;
    plus: string | boolean;
  }[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    category: "Receipts & Document Storage",
    items: [
      { name: "Expenses tracked", free: "Up to 10", plus: "Unlimited" },
      { name: "Receipt & document uploads", free: "5 per expense", plus: "Unlimited" },
      { name: "IRS audit-readiness check", free: true, plus: true },
      { name: "AI receipt scanning", free: false, plus: true },
      { name: "CSV data export", free: true, plus: true },
    ],
  },
  {
    category: "Growth & Tax Optimization",
    items: [
      { name: "Investment growth projections", free: "2 scenarios", plus: "4 custom scenarios" },
      { name: "Federal and state tax bracket modeling", free: true, plus: true },
      { name: "Reimbursement optimizer", free: "Summary only", plus: "Full per-expense breakdown" },
    ],
  },
  {
    category: "Automation & Claims",
    items: [
      { name: "Plaid bank sync", free: false, plus: true },
      { name: "Automated claim submission", free: false, plus: true },
      { name: "Email digests and audit reminders", free: false, plus: true },
    ],
  },
  {
    category: "Accounts & Family",
    items: [
      { name: "Supported account types", free: "HSA only", plus: "HSA, LPFSA, and HCFSA" },
      { name: "Family and dependent profiles", free: false, plus: "Unlimited" },
      { name: "Expense attribution by family member", free: false, plus: true },
    ],
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-[#059669] dark:text-[#34d399]" />;
  }
  if (value === false) {
    return <X className="h-4 w-4 text-[#CBD5E1] dark:text-slate-600" />;
  }
  return (
    <span className="text-sm font-medium text-[#475569] dark:text-slate-300">{value}</span>
  );
}

export function PricingContent({ planType, isLoggedIn }: PricingContentProps) {
  const [interval, setInterval] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const isPlus = planType === "plus";

  const price = interval === "monthly" ? "$5" : "$4";
  const period = interval === "monthly" ? "/mo" : "/mo";
  const billedLabel =
    interval === "annual" ? "Billed $48/year (save 20%)" : "Billed monthly";

  async function handleCheckout() {
    if (!isLoggedIn) {
      window.location.href = "/signup";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-background">
      {/* Nav */}
      <header className="border-b border-[#E2E8F0]/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-base font-bold tracking-tight text-[#0C1220] dark:text-foreground">
              HSA Plus
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-[13px] font-medium text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[13px] font-medium text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-accent font-semibold">
                    Get started free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-[#059669]/[0.04] rounded-full blur-[200px] -translate-y-1/2" />

        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-10 md:pt-24 md:pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-300">
              Simple, transparent pricing
            </span>
          </div>

          <h1 className="text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] font-normal leading-[1.08] tracking-[-0.025em] text-[#0C1220] dark:text-white">
            Free forever.{" "}
            <span className="gradient-text">Plus when you&apos;re ready.</span>
          </h1>
          <p className="mt-4 text-lg text-[#64748B] dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Start free with 10 expenses and full audit readiness. Upgrade to Plus whenever you want unlimited receipt storage, family tracking, and automated claims.
          </p>
        </div>
      </section>

      {/* Interval Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center rounded-full border border-[#E2E8F0] dark:border-border bg-white dark:bg-card p-1 shadow-sm">
          <button
            onClick={() => setInterval("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              interval === "monthly"
                ? "bg-[#0C1220] dark:bg-[#059669] text-white shadow-sm"
                : "text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
              interval === "annual"
                ? "bg-[#0C1220] dark:bg-[#059669] text-white shadow-sm"
                : "text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground"
            }`}
          >
            Annual
            <span className="rounded-full bg-[#059669] dark:bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card p-8 shadow-surface flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-[#64748B] dark:text-muted-foreground uppercase tracking-wider mb-1">
                Free
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold font-mono text-[#0C1220] dark:text-foreground">
                  $0
                </span>
                <span className="text-sm text-[#94A3B8] dark:text-muted-foreground">/forever</span>
              </div>
              <p className="text-sm text-[#64748B] dark:text-muted-foreground mb-6">
                Core receipt tracking, audit readiness checks, and basic growth projections.
              </p>

              <ul className="space-y-2.5 mb-8">
                {[
                  "Up to 10 expenses with 5 uploads each",
                  "IRS audit readiness scoring & 7-year alerts",
                  "Growth projections with 2 scenarios",
                  "CSV data export anytime",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569] dark:text-slate-300">
                    <Check className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {isLoggedIn && !isPlus ? (
              <div className="rounded-xl border border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/40 py-3 text-center text-sm font-medium text-[#64748B] dark:text-muted-foreground">
                Current plan
              </div>
            ) : !isLoggedIn ? (
              <Link href="/signup">
                <Button variant="outline" className="w-full font-semibold">
                  Get started free
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Plus */}
          <div className="relative rounded-2xl border-2 border-amber-400/50 dark:border-amber-400/40 bg-gradient-to-br from-white to-amber-50/40 dark:from-card dark:to-amber-950/20 p-8 shadow-surface-lg flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-[11px] font-bold text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                Plus
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold font-mono text-[#0C1220] dark:text-foreground">
                  {price}
                </span>
                <span className="text-sm text-[#94A3B8] dark:text-muted-foreground">{period}</span>
              </div>
              <p className="text-sm text-[#64748B] dark:text-muted-foreground mb-6">{billedLabel}</p>

              <ul className="space-y-2.5 mb-8">
                {[
                  "Unlimited expenses & document uploads",
                  "AI receipt scanning & Plaid account sync",
                  "Automated claim submission & reimbursement forms",
                  "Spouse & dependent profiles with attribution",
                  "HSA, LPFSA & HCFSA multi-account support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569] dark:text-slate-300">
                    <Check className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {isPlus ? (
              <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 py-3 text-center text-sm font-semibold text-amber-700 dark:text-amber-300">
                Current plan
              </div>
            ) : (
              <Button
                className="w-full shadow-accent font-semibold"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Upgrade to Plus
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[#0C1220] dark:text-foreground">
              Compare plan features
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">
              Everything you need to know about what is included in each plan
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card overflow-hidden shadow-surface">
            {/* Table Column Headers */}
            <div className="grid grid-cols-[1fr_110px_110px] md:grid-cols-[1fr_150px_150px] items-center px-6 py-4 border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/50">
              <span className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground uppercase tracking-wider">
                Feature
              </span>
              <span className="text-xs font-semibold text-[#0C1220] dark:text-foreground uppercase tracking-wider text-center">
                Free
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-center">
                Plus
              </span>
            </div>

            {/* Categorized Sections */}
            {FEATURE_CATEGORIES.map((section, sIndex) => (
              <div key={section.category}>
                {/* Category Header Row */}
                <div className="px-6 py-2.5 bg-[#F1F5F9]/80 dark:bg-muted/30 border-y border-[#E2E8F0]/80 dark:border-border/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-[#34d399]">
                    {section.category}
                  </span>
                </div>

                {/* Section Items */}
                {section.items.map((item, i) => (
                  <div
                    key={item.name}
                    className={`grid grid-cols-[1fr_110px_110px] md:grid-cols-[1fr_150px_150px] items-center px-6 py-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-muted/20 ${
                      i < section.items.length - 1
                        ? "border-b border-[#E2E8F0]/60 dark:border-border/40"
                        : sIndex < FEATURE_CATEGORIES.length - 1
                        ? ""
                        : ""
                    }`}
                  >
                    <span className="text-sm text-[#334155] dark:text-slate-300">
                      {item.name}
                    </span>
                    <div className="flex justify-center">
                      <FeatureValue value={item.free} />
                    </div>
                    <div className="flex justify-center">
                      <FeatureValue value={item.plus} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        {!isPlus && (
          <div className="mt-14 text-center">
            <Button
              size="lg"
              className="shadow-accent font-semibold px-8 h-12 text-base"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isLoggedIn
                    ? "Upgrade to Plus"
                    : "Get started free"}
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-[#94A3B8] dark:text-muted-foreground">
              Cancel anytime. No long-term commitment.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-border bg-white dark:bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8] dark:text-muted-foreground">
            <Logo size={22} />
            <span>
              &copy; {new Date().getFullYear()} HSA Plus &middot; Tax-free
              wealth, made simple.
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] font-medium text-[#94A3B8] dark:text-muted-foreground">
            <Link
              href="/calculator"
              className="hover:text-[#64748B] dark:hover:text-foreground transition-colors"
            >
              Calculator
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#64748B] dark:hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/login"
              className="hover:text-[#64748B] dark:hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
