import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SavingsCalculator } from "@/components/dashboard/savings-calculator/savings-calculator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Free HSA Compound Growth & Tax Calculator | HSA Plus",
  description:
    "Calculate your HSA investment growth over 5, 10, 20, or 30 years. See how much tax-free wealth you gain by delaying reimbursements with our free interactive calculator.",
  openGraph: {
    title: "Free HSA Compound Growth & Tax Calculator | HSA Plus",
    description:
      "Calculate your HSA investment growth over 5, 10, 20, or 30 years. See how much tax-free wealth you gain by delaying reimbursements.",
    url: "https://hsa.plus/calculator",
    siteName: "HSA Plus",
    images: [
      {
        url: "/og-image.jpg",
        width: 1920,
        height: 1080,
        alt: "HSA Plus: Free HSA Compound Growth & Tax Calculator",
      },
    ],
  },
};

export default async function CalculatorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0]/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="HSA Plus" width={56} height={37} className="rounded-lg" />
              <span className="text-base font-semibold tracking-tight text-[#0C1220] dark:text-foreground">
                HSA Plus
              </span>
            </Link>
            <span className="text-[#E2E8F0] dark:text-border">/</span>
            <span className="text-sm font-medium text-[#64748B] dark:text-muted-foreground">
              Calculator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="sm" asChild className="text-[13px] text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground h-8">
                <Link href="/dashboard">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[13px] text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground h-8">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-accent font-semibold h-8 text-xs">
                    Get started free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0C1220] dark:text-foreground">
            HSA Savings Calculator
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] dark:text-muted-foreground mt-1">
            Project how your HSA can grow tax-free over time. Adjust contributions, returns, and time horizons.
          </p>
        </div>

        <SavingsCalculator />
      </main>
    </div>
  );
}
