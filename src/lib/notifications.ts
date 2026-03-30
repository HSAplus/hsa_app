import type { DashboardStats, Expense, Profile, HsaConnection } from "@/lib/types";
import type { Claim } from "@/lib/claims/types";
import type { PlanLimits } from "@/lib/plans";
import { getContributionLimit } from "@/lib/hsa-constants";

export type NotificationType =
  | "retention_deadline"
  | "audit_readiness"
  | "balance_stale"
  | "contribution_limit"
  | "expense_limit"
  | "claim_update";

export type NotificationPriority = "critical" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  href?: string;
  count?: number;
}

interface ComputeParams {
  stats: DashboardStats;
  profile: Profile | null;
  claims: Claim[];
  expenses: Expense[];
  hsaConnection: HsaConnection | null;
  expenseCount: number;
  planLimits: PlanLimits;
  isPlus: boolean;
}

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

function retentionDeadlineNotification(stats: DashboardStats): Notification | null {
  if (stats.retentionAlerts <= 0) return null;
  return {
    id: "retention_deadline",
    type: "retention_deadline",
    priority: stats.retentionAlerts >= 3 ? "critical" : "warning",
    title: "Retention deadline approaching",
    description: `${stats.retentionAlerts} expense${stats.retentionAlerts === 1 ? "" : "s"} approaching 7-year retention deadline.`,
    href: "/dashboard",
    count: stats.retentionAlerts,
  };
}

function auditReadinessNotification(stats: DashboardStats): Notification | null {
  if (stats.auditReadiness.missing <= 0) return null;
  return {
    id: "audit_readiness",
    type: "audit_readiness",
    priority: "warning",
    title: "Missing documentation",
    description: `${stats.auditReadiness.missing} expense${stats.auditReadiness.missing === 1 ? " is" : "s are"} missing documentation for IRS audit readiness.`,
    href: "/dashboard",
    count: stats.auditReadiness.missing,
  };
}

function balanceStalenessNotification(hsaConnection: HsaConnection | null): Notification | null {
  if (!hsaConnection?.last_synced_at) return null;
  const daysSinceSync = Math.floor(
    (Date.now() - new Date(hsaConnection.last_synced_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceSync < 30) return null;
  return {
    id: "balance_stale",
    type: "balance_stale",
    priority: "warning",
    title: "HSA balance sync is stale",
    description: `Your HSA balance sync is ${daysSinceSync} days stale. Re-sync to get the latest data.`,
    href: "/dashboard/profile",
  };
}

function contributionLimitNotification(profile: Profile | null): Notification | null {
  if (!profile || profile.annual_contribution <= 0) return null;
  const limit = getContributionLimit(profile.coverage_type, profile.date_of_birth);
  const pct = profile.annual_contribution / limit;
  if (pct < 0.8) return null;
  const pctDisplay = Math.round(pct * 100);
  return {
    id: "contribution_limit",
    type: "contribution_limit",
    priority: pct >= 1 ? "critical" : "info",
    title: pct >= 1 ? "Contribution limit reached" : "Nearing contribution limit",
    description:
      pct >= 1
        ? `You've reached the IRS annual contribution limit of $${limit.toLocaleString()}.`
        : `You've contributed ${pctDisplay}% of the $${limit.toLocaleString()} annual limit.`,
    href: "/dashboard/profile",
  };
}

function expenseLimitNotification(
  expenseCount: number,
  planLimits: PlanLimits,
  isPlus: boolean,
): Notification | null {
  if (isPlus || planLimits.maxExpenses === Infinity) return null;
  const pct = expenseCount / planLimits.maxExpenses;
  if (pct < 0.8) return null;
  return {
    id: "expense_limit",
    type: "expense_limit",
    priority: pct >= 0.9 ? "warning" : "info",
    title: pct >= 1 ? "Expense limit reached" : "Running low on free expenses",
    description: `You've used ${expenseCount} of ${planLimits.maxExpenses} free expenses.${pct >= 1 ? " Upgrade to add more." : ""}`,
    href: "/pricing",
    count: expenseCount,
  };
}

function claimUpdateNotifications(claims: Claim[], expenses: Expense[]): Notification[] {
  const expenseMap = new Map(expenses.map((e) => [e.id, e]));
  const results: Notification[] = [];

  for (const claim of claims) {
    if (claim.status !== "approved" && claim.status !== "denied") continue;
    const expense = expenseMap.get(claim.expense_id);
    const label = expense?.description ?? "an expense";
    const isApproved = claim.status === "approved";

    results.push({
      id: `claim_update_${claim.id}`,
      type: "claim_update",
      priority: isApproved ? "info" : "critical",
      title: isApproved ? "Claim approved" : "Claim denied",
      description: isApproved
        ? `Your claim for "${label}" was approved.`
        : `Your claim for "${label}" was denied.${claim.denial_reason ? ` Reason: ${claim.denial_reason}` : ""}`,
      href: "/dashboard",
    });
  }

  return results;
}

export function computeNotifications(params: ComputeParams): Notification[] {
  const notifications: Notification[] = [];

  const retention = retentionDeadlineNotification(params.stats);
  if (retention) notifications.push(retention);

  const audit = auditReadinessNotification(params.stats);
  if (audit) notifications.push(audit);

  const stale = balanceStalenessNotification(params.hsaConnection);
  if (stale) notifications.push(stale);

  const contribution = contributionLimitNotification(params.profile);
  if (contribution) notifications.push(contribution);

  const expLimit = expenseLimitNotification(params.expenseCount, params.planLimits, params.isPlus);
  if (expLimit) notifications.push(expLimit);

  notifications.push(...claimUpdateNotifications(params.claims, params.expenses));

  notifications.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return notifications;
}
