"use client";

import { useMemo } from "react";
import type { Profile } from "@/lib/types";
import { formatCurrency } from "@/lib/hsa-constants";
import { useSavingsProjection } from "./savings-calculator/use-savings-projection";
import { TrendingUp, PiggyBank, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { ProjectionPoint } from "./savings-calculator/use-savings-projection";

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
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-lg">
      <p className="text-[11px] font-medium font-mono text-[#94A3B8] mb-2">
        Year {label}
      </p>
      <div className="space-y-1.5">
        {balance && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            <span className="text-[11px] text-[#64748B]">Balance</span>
            <span className="text-[11px] font-medium tabular-nums font-mono text-[#0F172A] ml-auto">
              {formatCurrency(balance.value)}
            </span>
          </div>
        )}
        {contributions && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-[11px] text-[#64748B]">Contributions</span>
            <span className="text-[11px] font-medium tabular-nums font-mono text-[#0F172A] ml-auto">
              {formatCurrency(contributions.value)}
            </span>
          </div>
        )}
        {balance && contributions && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5F9]">
            <div className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
            <span className="text-[11px] text-[#64748B]">Growth</span>
            <span className="text-[11px] font-medium tabular-nums font-mono text-[#059669] ml-auto">
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

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

function MilestoneLabel({
  viewBox,
  point,
}: {
  viewBox?: { x?: number; y?: number };
  point: ProjectionPoint;
}) {
  if (!viewBox?.x) return null;
  const x = viewBox.x;

  return (
    <g>
      <text
        x={x}
        y={10}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill="#64748B"
        fontFamily="ui-monospace, monospace"
      >
        Yr {point.year}
      </text>
      <text
        x={x}
        y={24}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill="#059669"
        fontFamily="ui-monospace, monospace"
      >
        +{formatCompact(point.totalGrowth)}
      </text>
    </g>
  );
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

  const timeHorizon = projectionData.length > 0 ? projectionData[projectionData.length - 1].year : 0;
  const quadrantInterval = Math.max(1, Math.round(timeHorizon / 4));
  const milestones = [1, 2, 3, 4]
    .map((n) => projectionData.find((p) => p.year === quadrantInterval * n))
    .filter((p): p is ProjectionPoint => p != null && p.year < timeHorizon);

  const summaryCards = [
    {
      label: "Projected Balance",
      value: summary.projectedBalance,
      icon: TrendingUp,
    },
    {
      label: "Tax Savings",
      value: summary.totalTaxSavings,
      icon: PiggyBank,
    },
    {
      label: "Investment Growth",
      value: summary.totalGrowth,
      icon: Sparkles,
    },
  ];

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-[#F1F5F9] mb-6" />
        <div className="h-[300px] animate-pulse rounded bg-[#F8FAFC]" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[#F8FAFC]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0F172A] font-sans">
            Growth Projection
          </h2>
          <span className="text-xs font-mono text-[#94A3B8]">
            {inputs.expectedReturn}% return &middot; {inputs.timeHorizon} yrs &middot; {formatCurrency(inputs.annualContribution)}/yr
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pt-6">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectionData}
              margin={{ top: 32, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashGradientBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="dashGradientContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={labelInterval}
                stroke="#94A3B8"
              />
              <YAxis
                tickFormatter={formatYAxisTick}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
                stroke="#94A3B8"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#059669",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                  opacity: 0.3,
                }}
              />
              <Area
                type="monotone"
                dataKey="totalContributions"
                stroke="rgb(147, 197, 253)"
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
                stroke="#059669"
                fill="url(#dashGradientBalance)"
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
                name="HSA Balance"
              />
              {milestones.map((point) => (
                <ReferenceLine
                  key={point.year}
                  x={point.label}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={<MilestoneLabel point={point} />}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 divide-x divide-[#F1F5F9] border-t border-[#F1F5F9]">
        {summaryCards.map((card) => (
          <div key={card.label} className="px-6 py-4">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="rounded p-0.5 bg-gradient-to-br from-[#059669] to-[#34d399]">
                <card.icon className="h-3 w-3 text-white" />
              </div>
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">
                {card.label}
              </p>
            </div>
            <p className="text-lg font-semibold tabular-nums font-mono text-[#0F172A]">
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
