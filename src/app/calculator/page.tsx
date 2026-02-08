import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SavingsCalculator } from "@/components/dashboard/savings-calculator/savings-calculator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function CalculatorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="HSA Plus" width={56} height={37} className="rounded-lg" />
              <span className="text-base font-semibold tracking-tight">HSA Plus</span>
            </Link>
            <span className="text-[#E2E8F0]">/</span>
            <span className="text-sm font-medium text-[#64748B]">Calculator</span>
          </div>

          <Button variant="ghost" size="sm" asChild className="text-[13px] text-[#64748B] h-8">
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl tracking-tight text-[#0F172A]">
            HSA Savings Calculator
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Project how your HSA can grow tax-free over time
          </p>
        </div>

        <SavingsCalculator />
      </main>
    </div>
  );
}
