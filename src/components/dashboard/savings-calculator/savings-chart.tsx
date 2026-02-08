"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ProjectionPoint } from "./use-savings-projection";
import { formatCurrency } from "@/lib/hsa-constants";

interface SavingsChartProps {
  data: ProjectionPoint[];
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
      <p className="text-xs font-medium font-mono text-[#94A3B8] mb-2">
        Year {label}
      </p>
      <div className="space-y-1">
        {balance && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#059669]" />
            <span className="text-xs text-[#64748B]">HSA Balance:</span>
            <span className="text-xs font-mono font-semibold ml-auto text-[#0F172A]">
              {formatCurrency(balance.value)}
            </span>
          </div>
        )}
        {contributions && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs text-[#64748B]">Contributions:</span>
            <span className="text-xs font-mono font-semibold ml-auto text-[#0F172A]">
              {formatCurrency(contributions.value)}
            </span>
          </div>
        )}
        {balance && contributions && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5F9]">
            <div className="h-2 w-2 rounded-full bg-[#34d399]" />
            <span className="text-xs text-[#64748B]">Growth:</span>
            <span className="text-xs font-mono font-semibold ml-auto text-[#059669]">
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

export function SavingsChart({ data }: SavingsChartProps) {
  const labelInterval = data.length <= 10 ? 1 : data.length <= 20 ? 2 : 5;

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradientBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradientContributions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.02} />
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
              opacity: 0.4,
            }}
          />
          <Area
            type="monotone"
            dataKey="totalContributions"
            stroke="rgb(59, 130, 246)"
            fill="url(#gradientContributions)"
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
            fill="url(#gradientBalance)"
            strokeWidth={2.5}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
            name="HSA Balance"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
