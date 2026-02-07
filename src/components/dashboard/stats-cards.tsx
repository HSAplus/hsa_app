"use client";

import type { DashboardStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, Wallet, ShieldCheck, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const auditPct =
    stats.auditReadiness.total > 0
      ? Math.round((stats.auditReadiness.ready / stats.auditReadiness.total) * 100)
      : 100;

  const cards = [
    {
      title: "Total Out-of-Pocket",
      value: `$${stats.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: `${stats.expenseCount} expense${stats.expenseCount !== 1 ? "s" : ""} tracked`,
      icon: DollarSign,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Reimbursed (Y)",
      value: `$${stats.totalReimbursed.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: "Total claimed from HSA/LPFSA/HCFSA",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Pending (N)",
      value: `$${stats.pendingReimbursement.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: "Available to reimburse later — let HSA grow!",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "By Account",
      value: `$${stats.byAccount.hsa.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: `HSA $${stats.byAccount.hsa.toFixed(0)} · LPFSA $${stats.byAccount.lpfsa.toFixed(0)} · HCFSA $${stats.byAccount.hcfsa.toFixed(0)}`,
      icon: Wallet,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "IRS Audit Readiness",
      value: `${auditPct}%`,
      description:
        stats.auditReadiness.missing > 0
          ? `${stats.auditReadiness.missing} expense${stats.auditReadiness.missing !== 1 ? "s" : ""} missing docs — 20% penalty risk`
          : "All expenses have required documentation",
      icon: ShieldCheck,
      color:
        auditPct === 100
          ? "text-emerald-600 dark:text-emerald-400"
          : auditPct >= 75
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400",
      bg:
        auditPct === 100
          ? "bg-emerald-100 dark:bg-emerald-900/30"
          : auditPct >= 75
            ? "bg-amber-100 dark:bg-amber-900/30"
            : "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "7-Year Retention",
      value: stats.retentionAlerts > 0 ? `${stats.retentionAlerts} alert${stats.retentionAlerts !== 1 ? "s" : ""}` : "All clear",
      description:
        stats.retentionAlerts > 0
          ? "Expenses nearing 7-year IRS retention limit"
          : "Keep records for 7 years per IRS rules",
      icon: AlertTriangle,
      color:
        stats.retentionAlerts > 0
          ? "text-orange-600 dark:text-orange-400"
          : "text-emerald-600 dark:text-emerald-400",
      bg:
        stats.retentionAlerts > 0
          ? "bg-orange-100 dark:bg-orange-900/30"
          : "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
