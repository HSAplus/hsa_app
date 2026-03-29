"use client";

import { Badge } from "@/components/ui/badge";
import type { ClaimStatus } from "@/lib/claims/types";

const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  submitted: {
    label: "Submitted",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  processing: {
    label: "Processing",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  approved: {
    label: "Approved",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  denied: {
    label: "Denied",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  reimbursed: {
    label: "Reimbursed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const config = statusConfig[status] ?? statusConfig.draft;

  return (
    <Badge
      variant="secondary"
      className={`text-[10px] font-medium border ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
