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
      contributionIncreaseRate,
      expectedReturn,
      timeHorizon,
      taxBracket,
      stateTaxRate,
    } = inputs;

    const rate = expectedReturn / 100;
    const increaseRate = (contributionIncreaseRate ?? 0) / 100;
    const combinedTaxRate = (taxBracket + stateTaxRate) / 100;
    const capitalGainsRate = 0.15;
    const currentYear = new Date().getFullYear();

    const projectionData: ProjectionPoint[] = [];

    // HSA: pre-tax contributions, tax-free growth, tax-free qualified withdrawals
    let hsaBalance = initialBalance;

    // Taxable: post-tax contributions, growth taxed annually at cap gains
    let taxableBalance = initialBalance;

    let cumulativeContributions = initialBalance;
    let cumulativeTaxSavings = 0;

    for (let y = 0; y <= timeHorizon; y++) {
      // Contribution for this year grows by the increase rate each year
      const yearContribution = y === 0 ? 0 : annualContribution * Math.pow(1 + increaseRate, y - 1);
      if (y > 0) {
        cumulativeContributions += yearContribution;
        cumulativeTaxSavings += yearContribution * combinedTaxRate;
      }

      projectionData.push({
        year: y,
        label: `${currentYear + y}`,
        balance: Math.round(hsaBalance),
        totalContributions: Math.round(cumulativeContributions),
        totalGrowth: Math.round(hsaBalance - cumulativeContributions),
        taxSavingsCumulative: Math.round(cumulativeTaxSavings),
        taxableEquivalent: Math.round(taxableBalance),
      });

      // Grow for next year
      const nextYearContribution = annualContribution * Math.pow(1 + increaseRate, y);
      hsaBalance = hsaBalance * (1 + rate) + nextYearContribution;
      // Taxable: growth taxed annually
      const taxableContribution = nextYearContribution * (1 - combinedTaxRate);
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
