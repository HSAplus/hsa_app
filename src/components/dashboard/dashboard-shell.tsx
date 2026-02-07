"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { signout } from "@/app/auth/actions";
import {
  getExpenses,
  getDashboardStats,
  deleteExpense,
  markAsReimbursed,
} from "@/app/dashboard/actions";
import type { Expense, DashboardStats } from "@/lib/types";
import { StatsCards } from "./stats-cards";
import { ExpenseTable } from "./expense-table";
import { AddExpenseDialog } from "./add-expense-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, LogOut, Plus, RefreshCw } from "lucide-react";
import { Toaster, toast } from "sonner";

interface DashboardShellProps {
  user: User;
}

export function DashboardShell({ user }: DashboardShellProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalReimbursed: 0,
    pendingReimbursement: 0,
    expenseCount: 0,
    byAccount: { hsa: 0, lpfsa: 0, hcfsa: 0 },
    auditReadiness: { total: 0, ready: 0, missing: 0 },
    retentionAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingExpense(null);
  };

  const handleSaved = () => {
    handleDialogClose();
    loadData();
    toast.success(editingExpense ? "Expense updated" : "Expense added");
  };

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-1.5">
              <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-lg font-bold">HSA Tracker</span>
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
              size="sm"
              onClick={() => {
                setEditingExpense(null);
                setDialogOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
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
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">HSA Account</p>
                  </div>
                </div>
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

      <AddExpenseDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSaved={handleSaved}
        expense={editingExpense}
      />
    </div>
  );
}
