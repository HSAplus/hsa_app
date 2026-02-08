"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  type CalculatorInputs,
  FEDERAL_TAX_BRACKETS,
  HSA_LIMITS,
} from "@/lib/hsa-constants";

interface CalculatorInputsProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export function CalculatorInputsPanel({
  inputs,
  onChange,
}: CalculatorInputsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCatchUp, setIsCatchUp] = useState(false);

  const currentYear = new Date().getFullYear() as keyof typeof HSA_LIMITS;
  const limits = HSA_LIMITS[currentYear] ?? HSA_LIMITS[2026];
  const contributionMax = limits.family + (isCatchUp ? limits.catchUp55 : 0);

  const update = (key: keyof CalculatorInputs, value: number) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="space-y-5">
      {/* Initial Balance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-[#64748B]">
            Current HSA Balance
          </Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">
              $
            </span>
            <Input
              type="number"
              value={inputs.initialBalance}
              onChange={(e) =>
                update(
                  "initialBalance",
                  Math.max(0, Math.min(500_000, Number(e.target.value) || 0))
                )
              }
              className="h-7 w-24 pl-5 text-xs text-right font-mono"
            />
          </div>
        </div>
        <Slider
          value={[inputs.initialBalance]}
          onValueChange={([v]) => update("initialBalance", v)}
          min={0}
          max={100_000}
          step={500}
        />
      </div>

      {/* Annual Contribution */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-medium text-[#64748B]">
              Annual Contribution
            </Label>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-[#059669]/10 text-[#059669] border border-[#059669]/20"
            >
              Max ${contributionMax.toLocaleString()}
            </Badge>
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">
              $
            </span>
            <Input
              type="number"
              value={inputs.annualContribution}
              onChange={(e) =>
                update(
                  "annualContribution",
                  Math.max(
                    0,
                    Math.min(
                      contributionMax,
                      Number(e.target.value) || 0
                    )
                  )
                )
              }
              className="h-7 w-24 pl-5 text-xs text-right font-mono"
              />
          </div>
        </div>
        <Slider
          value={[inputs.annualContribution]}
          onValueChange={([v]) => update("annualContribution", v)}
          min={0}
          max={contributionMax}
          step={50}
        />
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isCatchUp}
            onChange={(e) => {
              setIsCatchUp(e.target.checked);
              const newMax = limits.family + (e.target.checked ? limits.catchUp55 : 0);
              if (inputs.annualContribution > newMax) {
                update("annualContribution", newMax);
              }
            }}
            className="h-3 w-3 rounded border-[#E2E8F0] text-[#059669] focus:ring-[#059669]"
          />
          <span className="text-[10px] text-[#64748B]">Age 55+ catch-up (+${limits.catchUp55.toLocaleString()})</span>
        </label>
      </div>

      {/* Expected Return */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-[#64748B]">
            Expected Annual Return
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={inputs.expectedReturn}
              onChange={(e) =>
                update(
                  "expectedReturn",
                  Math.max(0, Math.min(15, Number(e.target.value) || 0))
                )
              }
              className="h-7 w-16 text-xs text-right font-mono pr-5"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">
              %
            </span>
          </div>
        </div>
        <Slider
          value={[inputs.expectedReturn]}
          onValueChange={([v]) => update("expectedReturn", v)}
          min={0}
          max={15}
          step={0.5}
        />
      </div>

      {/* Time Horizon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-[#64748B]">
            Time Horizon
          </Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={inputs.timeHorizon}
              onChange={(e) =>
                update(
                  "timeHorizon",
                  Math.max(1, Math.min(40, Number(e.target.value) || 1))
                )
              }
              className="h-7 w-14 text-xs text-right font-mono"
            />
            <span className="text-xs text-[#94A3B8]">yrs</span>
          </div>
        </div>
        <Slider
          value={[inputs.timeHorizon]}
          onValueChange={([v]) => update("timeHorizon", v)}
          min={1}
          max={40}
          step={1}
        />
      </div>

      {/* Advanced Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors w-full"
      >
        {showAdvanced ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Tax Settings
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-1">
          {/* Federal Tax Bracket */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-[#64748B]">
                Federal Tax Bracket
              </Label>
              <select
                value={inputs.taxBracket}
                onChange={(e) =>
                  update("taxBracket", Number(e.target.value))
                }
                className="h-7 rounded-lg border border-[#E2E8F0] bg-transparent px-2 text-xs font-mono"
              >
                {FEDERAL_TAX_BRACKETS.map((b) => (
                  <option key={b} value={b}>
                    {b}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State Tax Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-[#64748B]">
                State Tax Rate
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={inputs.stateTaxRate}
                  onChange={(e) =>
                    update(
                      "stateTaxRate",
                      Math.max(0, Math.min(13, Number(e.target.value) || 0))
                    )
                  }
                  className="h-7 w-16 text-xs text-right font-mono pr-5"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">
                  %
                </span>
              </div>
            </div>
            <Slider
              value={[inputs.stateTaxRate]}
              onValueChange={([v]) => update("stateTaxRate", v)}
              min={0}
              max={13}
              step={0.5}
            />
          </div>
        </div>
      )}
    </div>
  );
}
