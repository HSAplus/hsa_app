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

  const cardClass =
    "group rounded-xl border border-[#E2E8F0] bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200";

  return (
    <div>
      {/* Narrow phones: horizontal snap scroll — all metrics without tall stack */}
      <div
        className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 no-scrollbar scroll-pl-0"
        aria-label="Dashboard statistics"
      >
        {cards.map((card) => (
          <div
            key={card.title}
            className={`min-w-[min(100%,17.5rem)] max-w-[85vw] snap-center shrink-0 p-4 ${cardClass}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-medium text-[#64748B]">{card.title}</p>
              <div className="rounded-lg p-1.5 bg-gradient-to-br from-[#059669] to-[#34d399]">
                <card.icon className="h-3 w-3 text-white" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-[#F1F5F9]" />
            ) : (
              <>
                <p className="text-xl font-semibold font-mono tabular-nums text-[#0C1220]">
                  {card.value}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-3">{card.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="sm:hidden text-[11px] text-center text-[#94A3B8] -mt-0.5 mb-3">Swipe for more stats</p>

      {/* sm+: multi-column grid */}
      <div className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className={`p-5 ${cardClass}`}>
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
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#0C1220]">
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
    </div>
  );
}
