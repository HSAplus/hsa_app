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
        "bg-gradient-to-r from-[#059669] to-[#34d399]",
    },
    {
      label: "Taxable Brokerage",
      sublabel: `Post-tax contributions, ${inputs.taxBracket + inputs.stateTaxRate}% taxed growth`,
      value: last.taxableEquivalent,
      barColor:
        "bg-gradient-to-r from-[#94A3B8] to-[#CBD5E1]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Info text */}
      <p className="text-sm text-[#64748B]">
        Comparison after{" "}
        <span className="font-semibold text-[#0F172A]">
          {inputs.timeHorizon} years
        </span>{" "}
        contributing{" "}
        <span className="font-semibold text-[#0F172A]">
          {formatCurrency(inputs.annualContribution)}/yr
        </span>{" "}
        at{" "}
        <span className="font-semibold text-[#0F172A]">
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
                <span className="text-sm font-medium text-[#0F172A]">{row.label}</span>
                <p className="text-[11px] text-[#94A3B8]">
                  {row.sublabel}
                </p>
              </div>
              <span className="text-sm font-mono font-bold text-[#0F172A]">
                {formatCurrency(row.value)}
              </span>
            </div>
            <div className="h-4 rounded-full bg-[#F1F5F9] overflow-hidden">
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
        className="rounded-xl p-[2px] bg-gradient-to-br from-[#059669] to-[#34d399] animate-pulse-glow"
      >
        <div className="rounded-[calc(12px-2px)] bg-white p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                HSA Triple-Tax Advantage
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">
                You keep more by using your HSA as an investment vehicle
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono gradient-text">
                +{formatCurrency(summary.hsaAdvantage)}
              </p>
              <Badge className="bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-xs mt-1">
                +{advantagePct}% more
              </Badge>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9] grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-[#94A3B8]">
                Tax-free contributions
              </p>
              <p className="text-sm font-mono font-semibold text-[#0F172A]">
                {formatCurrency(summary.totalTaxSavings)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8]">
                Tax-free growth
              </p>
              <p className="text-sm font-mono font-semibold text-[#0F172A]">
                {formatCurrency(summary.totalGrowth)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
