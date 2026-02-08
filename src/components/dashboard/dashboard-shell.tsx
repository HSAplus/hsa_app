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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Plus, RefreshCw, UserCog, Calculator } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Toaster richColors position="top-right" />

      {/* First-login onboarding popup */}
      <OnboardingDialog profile={profile} onComplete={loadData} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="HSA Plus" width={72} height={48} className="rounded-lg" />
            <span className="text-lg font-bold">HSA Plus</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Link>
            </Button>

            <Button
              size="sm"
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Link href="/dashboard/expenses/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
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
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <UserCog className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signout()}
                  className="text-destructive cursor-pointer"
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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
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
      </main>
    </div>
  );
}
