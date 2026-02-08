"use client";

import { useMemo } from "react";
import type { CalculatorInputs } from "@/lib/hsa-constants";

export interface ProjectionPoint {
  year: number;
  label: string;
  balance: number;
  totalContributions: number;
  totalGrowth: number;
  taxSavingsCumulative: number;
  taxableEquivalent: number;
}

export interface ProjectionSummary {
  projectedBalance: number;
  totalContributed: number;
  totalGrowth: number;
  totalTaxSavings: number;
  hsaAdvantage: number;
}

export function useSavingsProjection(inputs: CalculatorInputs) {
  return useMemo(() => {
    const {
      initialBalance,
      annualContribution,
      expectedReturn,
      timeHorizon,
      taxBracket,
      stateTaxRate,
    } = inputs;

    const rate = expectedReturn / 100;
    const combinedTaxRate = (taxBracket + stateTaxRate) / 100;
    const capitalGainsRate = 0.15;
    const currentYear = new Date().getFullYear();

    const projectionData: ProjectionPoint[] = [];

    // HSA: pre-tax contributions, tax-free growth, tax-free qualified withdrawals
    let hsaBalance = initialBalance;

    // Taxable: post-tax contributions, growth taxed annually at cap gains
    let taxableBalance = initialBalance;
    const taxableContribution = annualContribution * (1 - combinedTaxRate);

    for (let y = 0; y <= timeHorizon; y++) {
      const totalContributions = initialBalance + annualContribution * y;
      const taxSavingsCumulative = annualContribution * combinedTaxRate * y;

      projectionData.push({
        year: y,
        label: `${currentYear + y}`,
        balance: Math.round(hsaBalance),
        totalContributions: Math.round(totalContributions),
        totalGrowth: Math.round(hsaBalance - totalContributions),
        taxSavingsCumulative: Math.round(taxSavingsCumulative),
        taxableEquivalent: Math.round(taxableBalance),
      });

      // Grow for next year
      hsaBalance = hsaBalance * (1 + rate) + annualContribution;
      // Taxable: growth taxed annually
      const taxableGrowth = taxableBalance * rate;
      const afterTaxGrowth = taxableGrowth * (1 - capitalGainsRate);
      taxableBalance = taxableBalance + afterTaxGrowth + taxableContribution;
    }

    const last = projectionData[projectionData.length - 1];
    const summary: ProjectionSummary = {
      projectedBalance: last.balance,
      totalContributed: last.totalContributions,
      totalGrowth: last.totalGrowth,
      totalTaxSavings: last.taxSavingsCumulative,
      hsaAdvantage: last.balance - last.taxableEquivalent,
    };

    return { projectionData, summary };
  }, [inputs]);
}
