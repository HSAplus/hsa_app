"use client";

import { motion, useMotionValueEvent } from "framer-motion";
import { TrendingUp, PiggyBank, Sparkles } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { formatCurrency } from "@/lib/hsa-constants";
import type { ProjectionSummary as ProjectionSummaryType } from "./use-savings-projection";
import { useState } from "react";

interface ProjectionSummaryProps {
  summary: ProjectionSummaryType;
}

function AnimatedValue({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const motionValue = useAnimatedNumber(value, formatCurrency);
  const [display, setDisplay] = useState(formatCurrency(value));

  useMotionValueEvent(motionValue, "change", (latest) => {
    setDisplay(latest);
  });

  return <span className={className}>{display}</span>;
}

export function ProjectionSummary({ summary }: ProjectionSummaryProps) {
  const cards = [
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

  return (
    <div className="space-y-2">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9]">
            <div className="rounded-lg p-2 bg-gradient-to-br from-[#059669] to-[#34d399]">
              <card.icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#94A3B8]">{card.label}</p>
              <AnimatedValue
                value={card.value}
                className="text-lg font-bold font-mono"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
