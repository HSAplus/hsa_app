import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  FileSpreadsheet,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "HSA Plus vs Spreadsheets | Why Google Sheets Fails for HSA Tracking",
  description:
    "Compare tracking HSA receipts in Excel or Google Sheets vs HSA Plus. Learn why spreadsheets fail IRS audit requirements, risk broken links, and lack automated retention tracking.",
  openGraph: {
    title: "HSA Plus vs Spreadsheets | Why Google Sheets Fails for HSA Tracking",
    description:
      "Tracking HSA receipts in Excel or Google Sheets? See why spreadsheets create severe audit risks and how HSA Plus automates your receipt storage.",
    url: "https://hsa.plus/vs/spreadsheets",
    siteName: "HSA Plus",
    images: [
      {
        url: "/og-image.jpg",
        width: 1920,
        height: 1080,
        alt: "HSA Plus vs Spreadsheets Comparison",
      },
    ],
  },
};

const COMPARISON_POINTS = [
  {
    feature: "Secure cloud document storage",
    sheet: "Manual Google Drive / Dropbox folders",
    hsaPlus: "Encrypted, dedicated receipt vault",
    plusBetter: true,
  },
  {
    feature: "Broken link & file deletion risk",
    sheet: "High (accidental folder moves, expired links)",
    hsaPlus: "Zero (immutable storage tied to DB records)",
    plusBetter: true,
  },
  {
    feature: "IRS audit-readiness validation",
    sheet: false,
    hsaPlus: "Automatic checklist for required IRS fields",
    plusBetter: true,
  },
  {
    feature: "7-year retention tracking",
    sheet: false,
    hsaPlus: "Automated countdown from reimbursement tax year",
    plusBetter: true,
  },
  {
    feature: "AI receipt OCR scanning",
    sheet: false,
    hsaPlus: "Automatic extraction of date, merchant, and cost",
    plusBetter: true,
  },
  {
    feature: "Compound investment projections",
    sheet: "Complex manual formulas",
    hsaPlus: "Real-time growth modeling at your target return rate",
    plusBetter: true,
  },
  {
    feature: "One-click claim submission",
    sheet: false,
    hsaPlus: "Pre-filled PDF claim forms for your custodian",
    plusBetter: true,
  },
  {
    feature: "Family & multi-account attribution",
    sheet: "Messy custom columns",
    hsaPlus: "Built-in profiles for spouse and children",
    plusBetter: true,
  },
  {
    feature: "Cost to get started",
    sheet: "Free",
    hsaPlus: "Free forever (up to 10 expenses)",
    plusBetter: false,
  },
];

export default function VsSpreadsheetsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-background">
      {/* Nav */}
      <header className="border-b border-[#E2E8F0]/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={56}
              height={37}
              className="rounded-lg"
            />
            <span className="text-base font-bold tracking-tight text-[#0C1220] dark:text-foreground">
              HSA Plus
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-[13px] text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground">
                Pricing
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
      <main className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-muted-foreground mb-6">
          <Link href="/" className="hover:text-[#059669] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span>Comparisons</span>
          <span>/</span>
          <span className="text-[#0C1220] dark:text-foreground font-medium">
            vs Spreadsheets
          </span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-1.5 mb-5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300 font-semibold">
              Product Comparison
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#0C1220] dark:text-white leading-[1.1]">
            HSA Plus vs. Spreadsheets
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] dark:text-slate-300 leading-relaxed">
            Google Sheets and Excel are great for budgets, but using them to track medical receipts for 20 years creates serious audit risks. Here is why purpose-built software wins.
          </p>
        </div>

        {/* The 3 Core Problems of Spreadsheets */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 p-6">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mb-3" />
            <h2 className="text-base font-bold text-[#0C1220] dark:text-white mb-2">
              The Broken Link Trap
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
              Google Drive links in spreadsheets break when folders are moved, permissions change, or accounts are reorganized over 10 to 20 years.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 p-6">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mb-3" />
            <h2 className="text-base font-bold text-[#0C1220] dark:text-white mb-2">
              No Audit Validation
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
              A spreadsheet cannot check whether your receipt contains the four items required by the IRS: date, provider, service description, and amount.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 p-6">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mb-3" />
            <h2 className="text-base font-bold text-[#0C1220] dark:text-white mb-2">
              Manual Friction
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
              Typing every receipt, date, and amount by hand leads to abandoned tracking after just a few months of medical bills.
            </p>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card overflow-hidden shadow-surface mb-16">
          <div className="grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1.2fr_1fr_1fr] items-center px-6 py-4 border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/50 font-semibold text-xs uppercase tracking-wider">
            <span className="text-[#64748B] dark:text-muted-foreground">Capability</span>
            <span className="text-[#64748B] dark:text-muted-foreground text-center">Spreadsheets</span>
            <span className="text-[#059669] dark:text-[#34d399] text-center font-bold">HSA Plus</span>
          </div>

          {COMPARISON_POINTS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1.2fr_1fr_1fr] items-center px-6 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-muted/20 ${
                i < COMPARISON_POINTS.length - 1
                  ? "border-b border-[#E2E8F0]/60 dark:border-border/40"
                  : ""
              } ${i % 2 === 0 ? "" : "bg-[#FAFAF8] dark:bg-muted/10"}`}
            >
              <span className="text-sm font-medium text-[#0C1220] dark:text-foreground pr-2">
                {row.feature}
              </span>

              {/* Spreadsheet Column */}
              <div className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 text-center px-2">
                {typeof row.sheet === "boolean" ? (
                  row.sheet ? (
                    <Check className="h-4 w-4 text-[#059669] mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-[#CBD5E1] dark:text-slate-600 mx-auto" />
                  )
                ) : (
                  row.sheet
                )}
              </div>

              {/* HSA Plus Column */}
              <div className="text-xs sm:text-sm font-semibold text-[#059669] dark:text-[#34d399] text-center px-2">
                {typeof row.hsaPlus === "boolean" ? (
                  row.hsaPlus ? (
                    <Check className="h-4 w-4 text-[#059669] dark:text-[#34d399] mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-[#CBD5E1] mx-auto" />
                  )
                ) : (
                  row.hsaPlus
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl border border-[#059669]/20 bg-gradient-to-br from-[#059669]/[0.04] to-[#34d399]/[0.08] dark:from-[#059669]/10 dark:to-[#34d399]/10 p-8 sm:p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] shadow-accent mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0C1220] dark:text-white">
            Upgrade from your spreadsheet in 2 minutes
          </h3>
          <p className="mt-3 text-sm sm:text-base text-[#64748B] dark:text-slate-300 max-w-lg mx-auto">
            Start for free with up to 10 expenses. You can export your data to CSV at any time, so you never lose control of your records.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="shadow-accent font-semibold px-8">
                Get started free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="font-semibold">
                View all features
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-border bg-white dark:bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8] dark:text-muted-foreground">
            <Image src="/logo.png" alt="HSA Plus" width={28} height={18} className="rounded" />
            <span>&copy; {new Date().getFullYear()} HSA Plus &middot; Tax-free wealth, made simple.</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] font-medium text-[#94A3B8] dark:text-muted-foreground">
            <Link href="/calculator" className="hover:text-[#64748B] dark:hover:text-foreground">Calculator</Link>
            <Link href="/pricing" className="hover:text-[#64748B] dark:hover:text-foreground">Pricing</Link>
            <Link href="/strategy/delayed-reimbursement" className="hover:text-[#64748B] dark:hover:text-foreground">Delayed Reimbursement Strategy</Link>
            <Link href="/privacy" className="hover:text-[#64748B] dark:hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
