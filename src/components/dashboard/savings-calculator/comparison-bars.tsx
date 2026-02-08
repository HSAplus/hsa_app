"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/hsa-constants";
import type { ProjectionPoint, ProjectionSummary } from "./use-savings-projection";
import type { CalculatorInputs } from "@/lib/hsa-constants";

interface ComparisonBarsProps {
  projectionData: ProjectionPoint[];
  summary: ProjectionSummary;
  inputs: CalculatorInputs;
}

export function ComparisonBars({
  projectionData,
  summary,
  inputs,
}: ComparisonBarsProps) {
  const last = projectionData[projectionData.length - 1];
  if (!last) return null;

  const maxValue = Math.max(last.balance, last.taxableEquivalent, 1);
  const advantagePct =
    last.taxableEquivalent > 0
      ? Math.round(
          ((last.balance - last.taxableEquivalent) / last.taxableEquivalent) *
            100
        )
      : 0;

  const rows = [
    {
      label: "HSA Account",
      sublabel: "Tax-free contributions, growth & withdrawals",
      value: last.balance,
      barColor:
        "bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400",
    },
    {
      label: "Taxable Brokerage",
      sublabel: `Post-tax contributions, ${inputs.taxBracket + inputs.stateTaxRate}% taxed growth`,
      value: last.taxableEquivalent,
      barColor:
        "bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Info text */}
      <p className="text-sm text-muted-foreground">
        Comparison after{" "}
        <span className="font-semibold text-foreground">
          {inputs.timeHorizon} years
        </span>{" "}
        contributing{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(inputs.annualContribution)}/yr
        </span>{" "}
        at{" "}
        <span className="font-semibold text-foreground">
          {inputs.expectedReturn}% return
        </span>
      </p>

      {/* Bars */}
      <div className="space-y-6">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="space-y-2"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-sm font-medium">{row.label}</span>
                <p className="text-[11px] text-muted-foreground">
                  {row.sublabel}
                </p>
              </div>
              <span className="text-sm font-mono font-bold">
                {formatCurrency(row.value)}
              </span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${row.barColor}`}
                style={{
                  width: `${(row.value / maxValue) * 100}%`,
                  transition:
                    "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advantage highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-5 animate-pulse-glow"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              HSA Triple-Tax Advantage
            </p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
              You keep more by using your HSA as an investment vehicle
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              +{formatCurrency(summary.hsaAdvantage)}
            </p>
            <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs mt-1">
              +{advantagePct}% more
            </Badge>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60">
              Tax-free contributions
            </p>
            <p className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(summary.totalTaxSavings)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60">
              Tax-free growth
            </p>
            <p className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(summary.totalGrowth)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
