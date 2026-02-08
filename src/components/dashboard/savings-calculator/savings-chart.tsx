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

export function SavingsChart({ data }: SavingsChartProps) {
  // Show every Nth label to avoid crowding
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
              <stop
                offset="5%"
                stopColor="rgb(16, 185, 129)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="rgb(16, 185, 129)"
                stopOpacity={0.02}
              />
            </linearGradient>
            <linearGradient
              id="gradientContributions"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity={0.12}
              />
              <stop
                offset="95%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            opacity={0.07}
          />
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
            stroke="rgb(16, 185, 129)"
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
