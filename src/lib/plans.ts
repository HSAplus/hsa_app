import type { PlanType, Profile } from "@/lib/types";

export interface PlanLimits {
  maxExpenses: number;
  maxUploadsPerExpense: number;
  maxScenarios: number;
  allowDependents: boolean;
  allowPlaid: boolean;
  allowClaimSubmission: boolean;
  allowEmailDigest: boolean;
  allowContributionIncrease: boolean;
  allowMultiAccount: boolean;
  allowReceiptScanning: boolean;
  optimizerFull: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxExpenses: 10,
    maxUploadsPerExpense: 5,
    maxScenarios: 2,
    allowDependents: false,
    allowPlaid: false,
    allowClaimSubmission: false,
    allowEmailDigest: false,
    allowContributionIncrease: false,
    allowMultiAccount: false,
    allowReceiptScanning: false,
    optimizerFull: false,
  },
  plus: {
    maxExpenses: Infinity,
    maxUploadsPerExpense: Infinity,
    maxScenarios: 4,
    allowDependents: true,
    allowPlaid: true,
    allowClaimSubmission: true,
    allowEmailDigest: true,
    allowContributionIncrease: true,
    allowMultiAccount: true,
    allowReceiptScanning: true,
    optimizerFull: true,
  },
};

export function getPlanLimits(planType: PlanType): PlanLimits {
  return PLAN_LIMITS[planType];
}

export function isPlusUser(profile: Profile | null): boolean {
  return profile?.plan_type === "plus";
}

export function getPlanType(profile: Profile | null): PlanType {
  return profile?.plan_type ?? "free";
}
