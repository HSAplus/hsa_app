"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { signout } from "@/app/auth/actions";
import {
  getExpenses,
  getDashboardStats,
  deleteExpense,
  markAsReimbursed,
  getClaims,
  getExpenseCount,
  getHsaConnection,
} from "@/app/dashboard/actions";
import type { Expense, DashboardStats, Profile, HsaConnectionPublic } from "@/lib/types";
import type { Claim } from "@/lib/claims/types";
import { getPlanLimits, getPlanType, isPlusUser } from "@/lib/plans";
import { computeNotifications } from "@/lib/notifications";
import { NotificationBell } from "./notification-bell";
import { Sparkles } from "lucide-react";
import { StatsCards } from "./stats-cards";
import { ExpenseTable } from "./expense-table";
import { PlaidImportsPanel } from "./plaid-imports-panel";
import { OnboardingDialog } from "./onboarding-dialog";
import { GrowthProjection } from "./growth-projection";
import { ExpenseTemplates } from "./expense-templates";
import { ReimbursementOptimizer } from "./reimbursement-optimizer";
import { TaxSummary } from "./tax-summary";
import { IrsLimitsTable } from "./irs-limits-table";
import { ScenarioComparison } from "./scenario-comparison";
import { SubmitClaimDialog } from "./submit-claim-dialog";
import { ClaimsList } from "./claims-list";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Plus, RefreshCw, UserCog, Calculator, KeyRound, Lock, Receipt, TrendingUp, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardShellProps {
  user: User;
  profile: Profile | null;
}

export function DashboardShell({ user, profile }: DashboardShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimExpense, setClaimExpense] = useState<Expense | null>(null);
  const [expenseCount, setExpenseCount] = useState(0);
  const [hsaConnection, setHsaConnection] = useState<HsaConnectionPublic | null>(null);

  const planType = getPlanType(profile);
  const planLimits = getPlanLimits(planType);
  const isPlus = isPlusUser(profile);
  const atExpenseLimit = !isPlus && expenseCount >= planLimits.maxExpenses;

  const VALID_TABS = ["expenses", "strategy", "tax"] as const;
  type TabValue = (typeof VALID_TABS)[number];
  const rawTab = searchParams.get("tab");
  const activeTab: TabValue = VALID_TABS.includes(rawTab as TabValue)
    ? (rawTab as TabValue)
    : "expenses";

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesData, statsData, claimsData, count, hsaConn] = await Promise.all([
        getExpenses(),
        getDashboardStats(),
        getClaims(),
        getExpenseCount(),
        getHsaConnection(),
      ]);
      setExpenses(expensesData);
      setStats(statsData);
      setClaims(claimsData);
      setExpenseCount(count);
      setHsaConnection(hsaConn);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success("Welcome to HSA Plus! All premium features are now unlocked.", {
        duration: 5000,
      });
      const params = new URLSearchParams(searchParams.toString());
      params.delete("upgraded");
      const qs = params.toString();
      router.replace(qs ? `/dashboard?${qs}` : "/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

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

  const handleSubmitClaim = (expense: Expense) => {
    setClaimExpense(expense);
    setClaimDialogOpen(true);
  };

  const notifications = useMemo(
    () =>
      computeNotifications({
        stats,
        profile,
        claims,
        expenses,
        hsaConnection,
        expenseCount,
        planLimits,
        isPlus,
      }),
    [stats, profile, claims, expenses, hsaConnection, expenseCount, planLimits, isPlus],
  );

  const claimExpenseIds = new Set(claims.map((c) => c.expense_id));

  const hasInFlightClaims = useMemo(
    () =>
      claims.some((c) =>
        ["draft", "submitted", "processing"].includes(c.status),
      ),
    [claims],
  );

  const profileName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "";

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : user.email
      ? user.email.substring(0, 2).toUpperCase()
      : "U";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* First-login onboarding popup */}
      <OnboardingDialog profile={profile} onComplete={loadData} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="HSA Plus" width={56} height={37} className="rounded-lg" />
            <span className="text-base font-semibold tracking-tight text-foreground">HSA Plus</span>
            {isPlus ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500/15 to-emerald-400/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-2.5 w-2.5" />
                Plus
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Free
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="text-muted-foreground h-8 px-2.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <NotificationBell notifications={notifications} />

            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground h-8 hidden sm:inline-flex"
            >
              <Link href="/calculator">
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Calculator
              </Link>
            </Button>

            {atExpenseLimit ? (
              <Button size="sm" variant="outline" disabled className="opacity-60">
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                {planLimits.maxExpenses}/{planLimits.maxExpenses} expenses
              </Button>
            ) : (
              <Button size="sm" asChild className="max-sm:px-2.5">
                <Link
                  href="/dashboard/expenses/new"
                  className="inline-flex items-center gap-1.5"
                  aria-label={
                    !isPlus
                      ? `Add expense, ${expenseCount} of ${planLimits.maxExpenses} used`
                      : "Add expense"
                  }
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    Add expense{!isPlus && ` (${expenseCount}/${planLimits.maxExpenses})`}
                  </span>
                </Link>
              </Button>
            )}

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
          <h1 className="text-2xl tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your medical expenses and HSA reimbursements
          </p>
        </div>

        <StatsCards stats={stats} loading={loading} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
          <TabsList
            variant="line"
            className="w-full min-w-0 justify-start gap-0 border-b border-border pb-0 overflow-x-auto no-scrollbar flex-nowrap"
          >
            <TabsTrigger value="expenses" className="shrink-0">
              <Receipt className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="strategy" className="shrink-0">
              <TrendingUp className="h-4 w-4" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="tax" className="shrink-0">
              <FileText className="h-4 w-4" />
              Tax &amp; Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            {isPlus && (
              <div className="mt-6 mb-6">
                <PlaidImportsPanel
                  expenses={expenses}
                  onChanged={loadData}
                />
              </div>
            )}
            <div className="mt-6">
              <ExpenseTable
                expenses={expenses}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkReimbursed={handleMarkReimbursed}
                onSubmitClaim={handleSubmitClaim}
                claimExpenseIds={claimExpenseIds}
                isPlus={isPlus}
              />
            </div>
            <div className="mt-8 hidden md:block space-y-8">
              <ClaimsList claims={claims} expenses={expenses} loading={loading} />
              <ExpenseTemplates />
            </div>
            <div className="mt-6 md:hidden rounded-xl border border-border bg-card px-2 shadow-sm">
              <Accordion
                type="single"
                collapsible
                {...(hasInFlightClaims ? { defaultValue: "claims" } : {})}
              >
                <AccordionItem value="claims" className="border-0">
                  <AccordionTrigger className="px-3 py-3 text-foreground hover:no-underline">
                    Claims &amp; submissions
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-3">
                    <ClaimsList claims={claims} expenses={expenses} loading={loading} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="templates" className="border-0 border-t border-border">
                  <AccordionTrigger className="px-3 py-3 text-foreground hover:no-underline">
                    Expense templates
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-3">
                    <ExpenseTemplates />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="strategy">
            <div className="mt-6 hidden md:block space-y-8">
              <ReimbursementOptimizer expenses={expenses} profile={profile} isPlus={isPlus} />
              <GrowthProjection profile={profile} loading={loading} />
              <ScenarioComparison profile={profile} isPlus={isPlus} />
            </div>
            <div className="mt-6 md:hidden rounded-xl border border-border bg-card px-2 shadow-sm">
              <Accordion type="single" collapsible defaultValue="optimizer">
                <AccordionItem value="optimizer" className="border-0">
                  <AccordionTrigger className="px-3 py-3 text-foreground hover:no-underline">
                    Reimbursement optimizer
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-3">
                    <ReimbursementOptimizer expenses={expenses} profile={profile} isPlus={isPlus} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="growth" className="border-0 border-t border-border">
                  <AccordionTrigger className="px-3 py-3 text-foreground hover:no-underline">
                    Growth projection
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-3">
                    <GrowthProjection profile={profile} loading={loading} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="scenario" className="border-0 border-t border-border">
                  <AccordionTrigger className="px-3 py-3 text-foreground hover:no-underline">
                    Scenario comparison
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-3">
                    <ScenarioComparison profile={profile} isPlus={isPlus} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="tax">
            <div className="mt-6 hidden md:block space-y-8">
              <TaxSummary expenses={expenses} />
              <IrsLimitsTable />
            </div>
            <div className="mt-6 md:hidden rounded-xl border border-border bg-card px-2 shadow-sm">
              <Accordion type="single" collapsible defaultValue="summary">
                <AccordionItem value="summary" className="border-0">
                  <AccordionTrigger className="px-3 py-3 text-foreground hover:no-underline">
                    Tax summary
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-3">
                    <TaxSummary expenses={expenses} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="irs" className="border-0 border-t border-border">
                  <AccordionTrigger className="px-3 py-3 text-foreground hover:no-underline">
                    IRS limits &amp; reference
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-3">
                    <IrsLimitsTable />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>

        {!isPlus && (
          <div className="mt-8 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 p-6 text-center">
            <Sparkles className="h-6 w-6 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-foreground">Upgrade to HSA Plus</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Unlimited expenses, Plaid sync, automated claims, family management, and more &mdash; $5/mo or $48/yr
            </p>
          </div>
        )}
      </main>

      <SubmitClaimDialog
        expense={claimExpense}
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        savedAdminId={(profile as (Profile & { hsa_administrator_id: string | null }) | null)?.hsa_administrator_id ?? null}
        onSubmitted={loadData}
        isPlus={isPlus}
      />
    </div>
  );
}
