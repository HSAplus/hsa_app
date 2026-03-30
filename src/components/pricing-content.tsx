"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { PlanType } from "@/lib/types";

interface PricingContentProps {
  planType: PlanType;
  isLoggedIn: boolean;
}

const FEATURES: {
  name: string;
  free: string | boolean;
  plus: string | boolean;
}[] = [
  { name: "Expense tracking", free: "10 expenses", plus: "Unlimited" },
  { name: "Document uploads per expense", free: "5", plus: "Unlimited" },
  { name: "Audit-readiness scoring", free: true, plus: true },
  { name: "7-year retention alerts", free: true, plus: true },
  { name: "Eligible expense verification", free: true, plus: true },
  { name: "Category & expense type tagging", free: true, plus: true },
  { name: "CSV export", free: true, plus: true },
  { name: "Savings calculator", free: true, plus: true },
  { name: "Interactive growth chart", free: true, plus: true },
  { name: "What-if scenarios", free: "2", plus: "4" },
  { name: "Reimbursement optimizer", free: "Summary only", plus: "Full per-expense analysis" },
  { name: "Tax bracket settings", free: true, plus: true },
  { name: "Contribution increase modeling", free: false, plus: true },
  { name: "HSA account tracking", free: true, plus: true },
  { name: "LPFSA / HCFSA accounts", free: false, plus: true },
  { name: "Plaid balance sync", free: false, plus: true },
  { name: "Manual balance entry", free: true, plus: true },
  { name: "Track reimbursement status", free: true, plus: true },
  { name: "Automated claim submission", free: false, plus: true },
  { name: "Pre-filled reimbursement forms", free: false, plus: true },
  { name: "Claim status tracking", free: false, plus: true },
  { name: "Self expense tracking", free: true, plus: true },
  { name: "Dependent profiles", free: false, plus: true },
  { name: "Per-patient attribution", free: false, plus: true },
  { name: "AI receipt scanning", free: false, plus: true },
  { name: "Email digest (weekly/monthly)", free: false, plus: true },
  { name: "Retention deadline alerts", free: true, plus: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-[#059669]" />;
  }
  if (value === false) {
    return <X className="h-4 w-4 text-[#CBD5E1]" />;
  }
  return (
    <span className="text-sm text-[#475569]">{value}</span>
  );
}

export function PricingContent({ planType, isLoggedIn }: PricingContentProps) {
  const [interval, setInterval] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const isPlus = planType === "plus";

  const price = interval === "monthly" ? "$5" : "$4";
  const period = interval === "monthly" ? "/mo" : "/mo";
  const billedLabel =
    interval === "annual" ? "Billed $48/year" : "Billed monthly";

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
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <header className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
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
          </Link>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-[13px] font-medium text-[#64748B]">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[13px] font-medium text-[#64748B]">
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
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[12px] font-semibold text-amber-700">
              Simple, transparent pricing
            </span>
          </div>

          <h1 className="text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] font-normal leading-[1.08] tracking-[-0.025em] text-[#0C1220]">
            Free forever.{" "}
            <span className="gradient-text">Plus when you&apos;re ready.</span>
          </h1>
          <p className="mt-4 text-lg text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Start with 10 expenses for free. Upgrade to Plus for unlimited
            tracking, family dependents, AI scanning, and more.
          </p>
        </div>
      </section>

      {/* Interval Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
          <button
            onClick={() => setInterval("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              interval === "monthly"
                ? "bg-[#0C1220] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#0C1220]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
              interval === "annual"
                ? "bg-[#0C1220] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#0C1220]"
            }`}
          >
            Annual
            <span className="rounded-full bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Free
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold font-mono text-[#0C1220]">
                $0
              </span>
              <span className="text-sm text-[#94A3B8]">/forever</span>
            </div>
            <p className="text-sm text-[#64748B] mb-6">
              Track up to 10 expenses with full audit readiness.
            </p>

            {isLoggedIn && !isPlus ? (
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 text-center text-sm font-medium text-[#64748B]">
                Current plan
              </div>
            ) : !isLoggedIn ? (
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Get started free
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Plus */}
          <div className="relative rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-white to-amber-50/30 p-8 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-[11px] font-bold text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </span>
            </div>

            <p className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-1">
              Plus
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold font-mono text-[#0C1220]">
                {price}
              </span>
              <span className="text-sm text-[#94A3B8]">{period}</span>
            </div>
            <p className="text-sm text-[#64748B] mb-6">{billedLabel}</p>

            {isPlus ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 py-3 text-center text-sm font-semibold text-amber-700">
                Current plan
              </div>
            ) : (
              <Button
                className="w-full shadow-accent"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Upgrade to Plus
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-[#0C1220] text-center mb-8">
            Feature comparison
          </h2>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] items-center px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Feature
              </span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider text-center">
                Free
              </span>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider text-center">
                Plus
              </span>
            </div>

            {/* Rows */}
            {FEATURES.map((feature, i) => (
              <div
                key={feature.name}
                className={`grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] items-center px-6 py-3.5 ${
                  i < FEATURES.length - 1 ? "border-b border-[#E2E8F0]/60" : ""
                } ${i % 2 === 0 ? "" : "bg-[#FAFAF8]"}`}
              >
                <span className="text-sm text-[#475569]">{feature.name}</span>
                <div className="flex justify-center">
                  <FeatureValue value={feature.free} />
                </div>
                <div className="flex justify-center">
                  <FeatureValue value={feature.plus} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        {!isPlus && (
          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="shadow-accent font-semibold"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {isLoggedIn
                    ? "Upgrade to Plus"
                    : "Get started free"}
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-[#94A3B8]">
              Cancel anytime. No long-term commitment.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
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
              &copy; {new Date().getFullYear()} HSA Plus &middot; Tax-free
              wealth, made simple.
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] font-medium text-[#94A3B8]">
            <Link
              href="/calculator"
              className="hover:text-[#64748B] transition-colors"
            >
              Calculator
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#64748B] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/login"
              className="hover:text-[#64748B] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
