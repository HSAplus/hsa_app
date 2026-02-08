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
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Tax Savings",
      value: summary.totalTaxSavings,
      icon: PiggyBank,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Investment Growth",
      value: summary.totalGrowth,
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
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
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">{card.label}</p>
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
