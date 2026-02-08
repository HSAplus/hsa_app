"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { signout } from "@/app/auth/actions";
import {
  getExpenses,
  getDashboardStats,
  deleteExpense,
  markAsReimbursed,
} from "@/app/dashboard/actions";
import type { Expense, DashboardStats, Profile } from "@/lib/types";
import { StatsCards } from "./stats-cards";
import { ExpenseTable } from "./expense-table";
import { OnboardingDialog } from "./onboarding-dialog";
import { GrowthProjection } from "./growth-projection";
import { ExpenseTemplates } from "./expense-templates";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Plus, RefreshCw, UserCog, Calculator, KeyRound } from "lucide-react";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import Link from "next/link";

interface DashboardShellProps {
  user: User;
  profile: Profile | null;
}

export function DashboardShell({ user, profile }: DashboardShellProps) {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    currentHsaBalance: 0,
    totalExpenses: 0,
    totalReimbursed: 0,
    pendingReimbursement: 0,
    expenseCount: 0,
    byAccount: { hsa: 0, lpfsa: 0, hcfsa: 0 },
    auditReadiness: { total: 0, ready: 0, missing: 0 },
    retentionAlerts: 0,
    expectedReturn: { projectedValue: 0, extraGrowth: 0, annualReturn: 7, timeHorizonYears: 20 },
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesData, statsData] = await Promise.all([
        getExpenses(),
        getDashboardStats(),
      ]);
      setExpenses(expensesData);
      setStats(statsData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    const result = await deleteExpense(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Expense deleted");
      loadData();
    }
  };

  const handleMarkReimbursed = async (id: string, amount: number) => {
    const result = await markAsReimbursed(id, amount);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Marked as reimbursed");
      loadData();
    }
  };

  const handleEdit = (expense: Expense) => {
    router.push(`/dashboard/expenses/${expense.id}/edit`);
  };

  const profileName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "";

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : user.email
      ? user.email.substring(0, 2).toUpperCase()
      : "U";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Toaster richColors position="top-right" />

      {/* First-login onboarding popup */}
      <OnboardingDialog profile={profile} onComplete={loadData} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="HSA Plus" width={56} height={37} className="rounded-lg" />
            <span className="text-base font-semibold tracking-tight">HSA Plus</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="text-[#64748B] h-8 px-2.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#64748B] h-8 hidden sm:inline-flex"
            >
              <Link href="/calculator">
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Calculator
              </Link>
            </Button>

            <Button
              size="sm"
              asChild
            >
              <Link href="/dashboard/expenses/new">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add expense
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-[#059669] to-[#34d399] text-white text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    {profileName && (
                      <p className="text-sm font-medium">{profileName}</p>
                    )}
                    <p className={`text-xs ${profileName ? "text-muted-foreground" : "text-sm font-medium"}`}>{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <UserCog className="mr-2 h-4 w-4" />
                    Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/login-settings" className="cursor-pointer">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Login settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link href="/calculator" className="cursor-pointer">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signout()}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl tracking-tight text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Track your medical expenses and HSA reimbursements
          </p>
        </div>

        <StatsCards stats={stats} loading={loading} />

        <div className="mt-8">
          <ExpenseTable
            expenses={expenses}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkReimbursed={handleMarkReimbursed}
          />
        </div>

        <div className="mt-8">
          <ExpenseTemplates />
        </div>

        <div className="mt-8">
          <GrowthProjection profile={profile} loading={loading} />
        </div>
      </main>
    </div>
  );
}
