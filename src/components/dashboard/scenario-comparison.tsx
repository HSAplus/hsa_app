"use client";

import { useState, useMemo, useCallback } from "react";
import type { Profile } from "@/lib/types";
import type { CalculatorInputs } from "@/lib/hsa-constants";
import { formatCurrency } from "@/lib/hsa-constants";
import { useSavingsProjection } from "./savings-calculator/use-savings-projection";
import {
  GitCompareArrows,
  Plus,
  Trash2,
  TrendingUp,
  PiggyBank,
  Sparkles,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface ScenarioComparisonProps {
  profile: Profile | null;
}

interface Scenario {
  id: string;
  name: string;
  color: string;
  inputs: CalculatorInputs;
}

const SCENARIO_COLORS = [
  { bg: "bg-[#059669]", text: "text-[#059669]", light: "bg-[#059669]/10", hex: "#059669" },
  { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10", hex: "#3b82f6" },
  { bg: "bg-purple-500", text: "text-purple-500", light: "bg-purple-500/10", hex: "#a855f7" },
  { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-500/10", hex: "#f97316" },
];

function ScenarioCard({
  scenario,
  colorIdx,
  onUpdate,
  onRemove,
  onDuplicate,
  canRemove,
}: {
  scenario: Scenario;
  colorIdx: number;
  onUpdate: (id: string, inputs: Partial<CalculatorInputs>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  canRemove: boolean;
}) {
  const color = SCENARIO_COLORS[colorIdx % SCENARIO_COLORS.length];
  const { summary } = useSavingsProjection(scenario.inputs);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
      {/* Color bar + header */}
      <div className={`h-1.5 ${color.bg}`} />
      <div className="px-4 py-3 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`h-2.5 w-2.5 rounded-full ${color.bg} flex-shrink-0`} />
            <input
              type="text"
              value={scenario.name}
              onChange={(e) =>
                onUpdate(scenario.id, { ...scenario.inputs } as Partial<CalculatorInputs> & { __name?: string })
              }
              className="text-sm font-semibold text-[#0F172A] bg-transparent border-none outline-none truncate w-full"
              readOnly
            />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#94A3B8] hover:text-[#64748B]"
              onClick={() => onDuplicate(scenario.id)}
              title="Duplicate scenario"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {canRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[#94A3B8] hover:text-red-500"
                onClick={() => onRemove(scenario.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Balance
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[11px]">$</span>
              <Input
                type="number"
                min="0"
                step="1000"
                value={scenario.inputs.initialBalance}
                onChange={(e) =>
                  onUpdate(scenario.id, {
                    initialBalance: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-7 text-[12px] pl-5 font-mono"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Contribution/yr
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[11px]">$</span>
              <Input
                type="number"
                min="0"
                step="100"
                value={scenario.inputs.annualContribution}
                onChange={(e) =>
                  onUpdate(scenario.id, {
                    annualContribution: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-7 text-[12px] pl-5 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Annual Return
            </Label>
            <span className="text-[11px] font-mono font-semibold text-[#0F172A]">
              {scenario.inputs.expectedReturn}%
            </span>
          </div>
          <Slider
            value={[scenario.inputs.expectedReturn]}
            onValueChange={([v]) =>
              onUpdate(scenario.id, { expectedReturn: v })
            }
            min={1}
            max={15}
            step={0.5}
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Time Horizon
            </Label>
            <span className="text-[11px] font-mono font-semibold text-[#0F172A]">
              {scenario.inputs.timeHorizon} yrs
            </span>
          </div>
          <Slider
            value={[scenario.inputs.timeHorizon]}
            onValueChange={([v]) =>
              onUpdate(scenario.id, { timeHorizon: v })
            }
            min={1}
            max={50}
            step={1}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Federal Bracket
            </Label>
            <div className="relative mt-1">
              <Input
                type="number"
                min="0"
                max="37"
                step="1"
                value={scenario.inputs.taxBracket}
                onChange={(e) =>
                  onUpdate(scenario.id, {
                    taxBracket: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-7 text-[12px] pr-5 font-mono"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[11px]">%</span>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Contrib. Increase
            </Label>
            <div className="relative mt-1">
              <Input
                type="number"
                min="0"
                max="20"
                step="1"
                value={scenario.inputs.contributionIncreaseRate}
                onChange={(e) =>
                  onUpdate(scenario.id, {
                    contributionIncreaseRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-7 text-[12px] pr-6 font-mono"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[11px]">%/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748B] flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Projected Balance
            </span>
            <span className={`text-sm font-semibold font-mono tabular-nums ${color.text}`}>
              {formatCurrency(summary.projectedBalance)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748B] flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Investment Growth
            </span>
            <span className="text-[12px] font-medium font-mono tabular-nums text-[#059669]">
              {formatCurrency(summary.totalGrowth)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748B] flex items-center gap-1">
              <PiggyBank className="h-3 w-3" /> Tax Savings
            </span>
            <span className="text-[12px] font-medium font-mono tabular-nums text-[#0F172A]">
              {formatCurrency(summary.totalTaxSavings)}
            </span>
          </div>
          <div className="pt-1 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#64748B]">
                HSA Advantage
              </span>
              <span className={`text-sm font-bold font-mono tabular-nums ${color.text}`}>
                +{formatCurrency(summary.hsaAdvantage)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScenarioComparison({ profile }: ScenarioComparisonProps) {
  const baseInputs: CalculatorInputs = useMemo(
    () => ({
      initialBalance: profile?.current_hsa_balance ?? 0,
      annualContribution: profile?.annual_contribution ?? 4150,
      contributionIncreaseRate: profile?.contribution_increase_rate ?? 0,
      expectedReturn: profile?.expected_annual_return ?? 7,
      timeHorizon: profile?.time_horizon_years ?? 20,
      taxBracket: profile?.federal_tax_bracket ?? 22,
      stateTaxRate: profile?.state_tax_rate ?? 5,
    }),
    [profile]
  );

  const [scenarios, setScenarios] = useState<Scenario[]>(() => [
    {
      id: "base",
      name: "Current Plan",
      color: SCENARIO_COLORS[0].hex,
      inputs: baseInputs,
    },
    {
      id: "aggressive",
      name: "Aggressive Growth",
      color: SCENARIO_COLORS[1].hex,
      inputs: {
        ...baseInputs,
        expectedReturn: 10,
        timeHorizon: 30,
      },
    },
  ]);

  const handleUpdate = useCallback(
    (id: string, partialInputs: Partial<CalculatorInputs>) => {
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, inputs: { ...s.inputs, ...partialInputs } } : s
        )
      );
    },
    []
  );

  const handleRemove = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleDuplicate = useCallback(
    (id: string) => {
      setScenarios((prev) => {
        if (prev.length >= 4) return prev;
        const source = prev.find((s) => s.id === id);
        if (!source) return prev;
        const newId = `scenario-${Date.now()}`;
        return [
          ...prev,
          {
            id: newId,
            name: `${source.name} (copy)`,
            color: SCENARIO_COLORS[prev.length % SCENARIO_COLORS.length].hex,
            inputs: { ...source.inputs },
          },
        ];
      });
    },
    []
  );

  const handleAdd = useCallback(() => {
    setScenarios((prev) => {
      if (prev.length >= 4) return prev;
      const newId = `scenario-${Date.now()}`;
      const names = ["Conservative", "Moderate", "Aggressive Growth", "Max Contribution"];
      const name = names[prev.length] ?? `Scenario ${prev.length + 1}`;
      return [
        ...prev,
        {
          id: newId,
          name,
          color: SCENARIO_COLORS[prev.length % SCENARIO_COLORS.length].hex,
          inputs: { ...baseInputs },
        },
      ];
    });
  }, [baseInputs]);

  // Comparison summary
  const summaries = useMemo(() => {
    return scenarios.map((s) => {
      // Quick inline projection for comparison
      const rate = s.inputs.expectedReturn / 100;
      const increaseRate = (s.inputs.contributionIncreaseRate ?? 0) / 100;
      let balance = s.inputs.initialBalance;
      for (let y = 0; y < s.inputs.timeHorizon; y++) {
        const contribution = s.inputs.annualContribution * Math.pow(1 + increaseRate, y);
        balance = balance * (1 + rate) + contribution;
      }
      return { id: s.id, name: s.name, balance: Math.round(balance) };
    });
  }, [scenarios]);

  const maxBalance = Math.max(...summaries.map((s) => s.balance), 1);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-indigo-500 to-blue-400">
              <GitCompareArrows className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#0F172A] font-sans">
              What-if Scenarios
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {scenarios.length}/4 scenarios
            </Badge>
            {scenarios.length < 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdd}
                className="h-7 text-[11px] px-2.5"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add scenario
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Visual comparison bar */}
      <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider mb-3">
          Projected Balance Comparison
        </p>
        <div className="space-y-2">
          {summaries.map((s, i) => {
            const color = SCENARIO_COLORS[i % SCENARIO_COLORS.length];
            const pct = (s.balance / maxBalance) * 100;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0">
                  <span className={`text-[11px] font-medium ${color.text}`}>
                    {s.name}
                  </span>
                </div>
                <div className="flex-1 h-5 bg-[#F1F5F9] rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${color.bg} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[12px] font-mono font-semibold tabular-nums text-[#0F172A] w-24 text-right">
                  {formatCurrency(s.balance)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario cards grid */}
      <div className="p-4">
        <div
          className={`grid gap-4 ${
            scenarios.length === 1
              ? "grid-cols-1 max-w-md"
              : scenarios.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : scenarios.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {scenarios.map((scenario, i) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              colorIdx={i}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              onDuplicate={handleDuplicate}
              canRemove={scenarios.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
