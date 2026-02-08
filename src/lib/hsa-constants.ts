export const HSA_LIMITS = {
  2024: { individual: 4_150, family: 8_300, catchUp55: 1_000 },
  2025: { individual: 4_300, family: 8_550, catchUp55: 1_000 },
  2026: { individual: 4_400, family: 8_750, catchUp55: 1_000 },
};

export const FEDERAL_TAX_BRACKETS = [10, 12, 22, 24, 32, 35, 37];

export interface CalculatorInputs {
  initialBalance: number;
  annualContribution: number;
  expectedReturn: number;
  timeHorizon: number;
  taxBracket: number;
  stateTaxRate: number;
}

export const DEFAULT_CALCULATOR_INPUTS: CalculatorInputs = {
  initialBalance: 0,
  annualContribution: 4_150,
  expectedReturn: 7,
  timeHorizon: 20,
  taxBracket: 24,
  stateTaxRate: 5,
};

export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
