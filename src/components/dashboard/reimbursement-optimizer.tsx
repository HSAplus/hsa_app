"use client";

import { useMemo, useState } from "react";
import type { Expense, Profile } from "@/lib/types";
import { formatCurrency } from "@/lib/hsa-constants";
import {
  TrendingUp,
  Clock,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReimbursementOptimizerProps {
  expenses: Expense[];
  profile: Profile | null;
}

interface AnalyzedExpense {
  expense: Expense;
  yearsInvested: number;
  remainingYears: number;
  currentValue: number;
  futureValue: number;
  potentialGrowth: number;
  growthPercent: number;
}

function analyzeExpense(
  expense: Expense,
  annualReturn: number,
  timeHorizonYears: number
): AnalyzedExpense {
  const rate = annualReturn / 100;
  const now = new Date();
  const serviceDate = new Date(expense.date_of_service + "T00:00:00");
  const yearsInvested = Math.max(
    0,
    (now.getTime() - serviceDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const remainingYears = Math.max(0, timeHorizonYears - yearsInvested);

  // Current value = how much the amount has grown since it was paid out-of-pocket
  const currentValue = expense.amount * Math.pow(1 + rate, yearsInvested);
  // Future value = total value at end of time horizon
  const futureValue = expense.amount * Math.pow(1 + rate, timeHorizonYears);
  // Additional growth if we keep delaying
  const potentialGrowth = futureValue - currentValue;
  const growthPercent =
    currentValue > 0 ? ((futureValue - currentValue) / currentValue) * 100 : 0;

  return {
    expense,
    yearsInvested,
    remainingYears,
    currentValue,
    futureValue,
    potentialGrowth,
    growthPercent,
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReimbursementOptimizer({
  expenses,
  profile,
}: ReimbursementOptimizerProps) {
  const [expanded, setExpanded] = useState(false);

  const annualReturn = profile?.expected_annual_return ?? 7;
  const timeHorizonYears = profile?.time_horizon_years ?? 20;

  const analyzed = useMemo(() => {
    const unreimbursed = expenses.filter((e) => !e.reimbursed);
    return unreimbursed
      .map((e) => analyzeExpense(e, annualReturn, timeHorizonYears))
      .sort((a, b) => b.potentialGrowth - a.potentialGrowth);
  }, [expenses, annualReturn, timeHorizonYears]);

  const totals = useMemo(() => {
    const totalPending = analyzed.reduce(
      (sum, a) => sum + a.expense.amount,
      0
    );
    const totalCurrentValue = analyzed.reduce(
      (sum, a) => sum + a.currentValue,
      0
    );
    const totalFutureValue = analyzed.reduce(
      (sum, a) => sum + a.futureValue,
      0
    );
    const totalPotentialGrowth = analyzed.reduce(
      (sum, a) => sum + a.potentialGrowth,
      0
    );
    return {
      totalPending,
      totalCurrentValue,
      totalFutureValue,
      totalPotentialGrowth,
    };
  }, [analyzed]);

  // Insights
  const insights = useMemo(() => {
    const tips: string[] = [];
    if (analyzed.length === 0) {
      return ["No unreimbursed expenses yet. Track expenses to see reimbursement strategies."];
    }

    const avgYearsInvested =
      analyzed.reduce((s, a) => s + a.yearsInvested, 0) / analyzed.length;

    if (totals.totalPotentialGrowth > 500) {
      tips.push(
        `Delaying reimbursement could earn ${formatCurrency(totals.totalPotentialGrowth)} more in tax-free growth over the remaining ${Math.round(timeHorizonYears - avgYearsInvested)} years.`
      );
    }

    const bigTicket = analyzed.find((a) => a.expense.amount >= 1000);
    if (bigTicket) {
      tips.push(
        `Your largest unreimbursed expense (${formatCurrency(bigTicket.expense.amount)} — ${bigTicket.expense.description}) could grow to ${formatCurrency(bigTicket.futureValue)} by year ${timeHorizonYears}.`
      );
    }

    const oldestWithGrowth = analyzed.find((a) => a.yearsInvested >= 3);
    if (oldestWithGrowth) {
      tips.push(
        `"${oldestWithGrowth.expense.description}" has been invested for ${oldestWithGrowth.yearsInvested.toFixed(1)} years and has already grown by ${formatCurrency(oldestWithGrowth.currentValue - oldestWithGrowth.expense.amount)}.`
      );
    }

    if (tips.length === 0) {
      tips.push(
        `Your ${analyzed.length} unreimbursed expense${analyzed.length !== 1 ? "s" : ""} totaling ${formatCurrency(totals.totalPending)} could grow to ${formatCurrency(totals.totalFutureValue)} over ${timeHorizonYears} years.`
      );
    }

    return tips;
  }, [analyzed, totals, timeHorizonYears]);

  const displayItems = expanded ? analyzed : analyzed.slice(0, 5);

  if (analyzed.length === 0) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-amber-500 to-orange-400">
              <Lightbulb className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#0F172A] font-sans">
              Reimbursement Strategy
            </h2>
          </div>
        </div>
        <div className="px-6 py-10 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 text-[#E2E8F0]" />
          <p className="text-sm text-[#64748B]">No unreimbursed expenses</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Add out-of-pocket expenses to see growth strategies
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-amber-500 to-orange-400">
              <Lightbulb className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#0F172A] font-sans">
              Reimbursement Strategy
            </h2>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">
            {annualReturn}% return &middot; {timeHorizonYears} yr horizon
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-100/50">
        {insights.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 py-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-amber-800 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 divide-x divide-[#F1F5F9] border-b border-[#F1F5F9]">
        <div className="px-4 py-3">
          <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono mb-0.5">
            Pending
          </p>
          <p className="text-base font-semibold tabular-nums font-mono text-[#0F172A]">
            {formatCurrency(totals.totalPending)}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono mb-0.5">
            Current Value
          </p>
          <p className="text-base font-semibold tabular-nums font-mono text-[#0F172A]">
            {formatCurrency(totals.totalCurrentValue)}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono mb-0.5">
            Future Value
          </p>
          <p className="text-base font-semibold tabular-nums font-mono text-[#059669]">
            {formatCurrency(totals.totalFutureValue)}
          </p>
        </div>
      </div>

      {/* Expense list */}
      <div className="divide-y divide-[#F1F5F9]">
        {displayItems.map((item) => (
          <div
            key={item.expense.id}
            className="px-6 py-3 hover:bg-[#FAFAFA] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#0F172A] truncate">
                    {item.expense.description}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 bg-[#F1F5F9] text-[#64748B] flex-shrink-0"
                  >
                    {item.expense.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.expense.date_of_service)}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.yearsInvested.toFixed(1)} yrs invested
                  </span>
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {item.expense.provider}
                  </span>
                </div>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-sm font-semibold font-mono tabular-nums text-[#0F172A]">
                  {formatCurrency(item.expense.amount)}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <TrendingUp className="h-3 w-3 text-[#059669]" />
                  <span className="text-[11px] font-mono font-medium text-[#059669]">
                    +{formatCurrency(item.potentialGrowth)}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-[#94A3B8]">
                  {formatCurrency(item.expense.amount)} → {formatCurrency(item.futureValue)}
                </span>
                <span className="text-[10px] font-mono text-[#059669]">
                  +{item.growthPercent.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#059669] to-[#34d399] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (item.currentValue / item.futureValue) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more/less */}
      {analyzed.length > 5 && (
        <div className="px-6 py-2 border-t border-[#F1F5F9]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors w-full justify-center py-1"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Show {analyzed.length - 5} more{" "}
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
