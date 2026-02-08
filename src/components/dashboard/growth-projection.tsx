"use client";

import { useMemo } from "react";
import type { Profile } from "@/lib/types";
import { formatCurrency } from "@/lib/hsa-constants";
import { useSavingsProjection } from "./savings-calculator/use-savings-projection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PiggyBank, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GrowthProjectionProps {
  profile: Profile | null;
  loading: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const balance = payload.find((p) => p.dataKey === "balance");
  const contributions = payload.find(
    (p) => p.dataKey === "totalContributions"
  );

  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-card-foreground">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Year {label}
      </p>
      <div className="space-y-1">
        {balance && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs">HSA Balance:</span>
            <span className="text-xs font-mono font-semibold ml-auto">
              {formatCurrency(balance.value)}
            </span>
          </div>
        )}
        {contributions && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs">Contributions:</span>
            <span className="text-xs font-mono font-semibold ml-auto">
              {formatCurrency(contributions.value)}
            </span>
          </div>
        )}
        {balance && contributions && (
          <div className="flex items-center gap-2 pt-1 border-t">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs">Growth:</span>
            <span className="text-xs font-mono font-semibold ml-auto text-emerald-600 dark:text-emerald-400">
              {formatCurrency(balance.value - contributions.value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatYAxisTick(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

export function GrowthProjection({ profile, loading }: GrowthProjectionProps) {
  const inputs = useMemo(
    () => ({
      initialBalance: profile?.current_hsa_balance ?? 0,
      annualContribution: profile?.annual_contribution ?? 4150,
      expectedReturn: profile?.expected_annual_return ?? 7,
      timeHorizon: profile?.time_horizon_years ?? 20,
      taxBracket: profile?.federal_tax_bracket ?? 22,
      stateTaxRate: profile?.state_tax_rate ?? 5,
    }),
    [profile]
  );

  const { projectionData, summary } = useSavingsProjection(inputs);

  const labelInterval =
    projectionData.length <= 10
      ? 1
      : projectionData.length <= 20
        ? 2
        : 5;

  const summaryCards = [
    {
      label: "Projected Balance",
      value: summary.projectedBalance,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "Tax Savings",
      value: summary.totalTaxSavings,
      icon: PiggyBank,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Investment Growth",
      value: summary.totalGrowth,
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Growth Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Growth Projection</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {inputs.expectedReturn}% annual return over {inputs.timeHorizon} years with {formatCurrency(inputs.annualContribution)}/yr contribution
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectionData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashGradientBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="dashGradientContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.07} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={labelInterval}
                stroke="currentColor"
                opacity={0.4}
              />
              <YAxis
                tickFormatter={formatYAxisTick}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
                stroke="currentColor"
                opacity={0.4}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "rgb(16, 185, 129)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                  opacity: 0.4,
                }}
              />
              <Area
                type="monotone"
                dataKey="totalContributions"
                stroke="rgb(59, 130, 246)"
                fill="url(#dashGradientContributions)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
                name="Contributions Only"
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="rgb(16, 185, 129)"
                fill="url(#dashGradientBalance)"
                strokeWidth={2.5}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
                name="HSA Balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`flex items-center gap-3 rounded-xl border p-4 ${card.bg} ${card.border}`}
            >
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold font-mono">
                  {formatCurrency(card.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
