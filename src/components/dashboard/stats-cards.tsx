"use client";

import type { DashboardStats } from "@/lib/types";
import { DollarSign, TrendingUp, Clock, Wallet, Sprout, PiggyBank } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: "HSA Balance",
      value: `$${stats.currentHsaBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: "Current account balance",
      icon: PiggyBank,
    },
    {
      title: "Total Out-of-Pocket",
      value: `$${stats.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: `${stats.expenseCount} expense${stats.expenseCount !== 1 ? "s" : ""} tracked`,
      icon: DollarSign,
    },
    {
      title: "Reimbursed",
      value: `$${stats.totalReimbursed.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: "Claimed from HSA / LPFSA / HCFSA",
      icon: TrendingUp,
    },
    {
      title: "Pending",
      value: `$${stats.pendingReimbursement.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: "Available to reimburse later",
      icon: Clock,
    },
    {
      title: "By Account",
      value: `$${stats.byAccount.hsa.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: `HSA $${stats.byAccount.hsa.toFixed(0)} · LPFSA $${stats.byAccount.lpfsa.toFixed(0)} · HCFSA $${stats.byAccount.hcfsa.toFixed(0)}`,
      icon: Wallet,
    },
    {
      title: "Expected Return",
      value: `$${stats.expectedReturn.extraGrowth.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      description: `${stats.expectedReturn.annualReturn}% return · ${stats.expectedReturn.timeHorizonYears} yr horizon`,
      icon: Sprout,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-medium text-[#64748B]">
              {card.title}
            </p>
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-[#059669] to-[#34d399]">
              <card.icon className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-28 animate-pulse rounded bg-[#F1F5F9]" />
          ) : (
            <>
              <p className="text-2xl font-semibold font-mono tabular-nums text-[#0F172A]">
                {card.value}
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                {card.description}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
