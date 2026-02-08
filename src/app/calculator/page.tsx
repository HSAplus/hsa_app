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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="HSA Plus" width={72} height={48} className="rounded-lg" />
              <span className="text-lg font-bold">HSA Plus</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Calculator</span>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">HSA Savings Calculator</h1>
          <p className="text-muted-foreground mt-1">
            Project how your HSA can grow tax-free over time
          </p>
        </div>

        <SavingsCalculator />
      </main>
    </div>
  );
}
