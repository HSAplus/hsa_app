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

  const update = (key: keyof CalculatorInputs, value: number) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="space-y-5">
      {/* Initial Balance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
            Current HSA Balance
          </Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
            <Label className="text-xs font-medium text-muted-foreground">
              Annual Contribution
            </Label>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            >
              Max ${HSA_LIMITS[2025].family.toLocaleString()}
            </Badge>
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
                      HSA_LIMITS[2025].family,
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
          max={HSA_LIMITS[2025].family}
          step={50}
        />
      </div>

      {/* Expected Return */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
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
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
          <Label className="text-xs font-medium text-muted-foreground">
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
            <span className="text-xs text-muted-foreground">yrs</span>
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
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
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
              <Label className="text-xs font-medium text-muted-foreground">
                Federal Tax Bracket
              </Label>
              <select
                value={inputs.taxBracket}
                onChange={(e) =>
                  update("taxBracket", Number(e.target.value))
                }
                className="h-7 rounded-md border border-input bg-transparent px-2 text-xs font-mono"
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
              <Label className="text-xs font-medium text-muted-foreground">
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
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
