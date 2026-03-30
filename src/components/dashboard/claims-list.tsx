"use client";

import type { Claim } from "@/lib/claims/types";
import type { Expense } from "@/lib/types";
import { ClaimStatusBadge } from "./claim-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Send, Phone, Globe, Cpu } from "lucide-react";
import { format } from "date-fns";

interface ClaimsListProps {
  claims: Claim[];
  expenses: Expense[];
  loading: boolean;
}

const tierIcons: Record<string, typeof Send> = {
  api: Cpu,
  email: Send,
  fax: Phone,
  portal: Globe,
};

const tierLabels: Record<string, string> = {
  api: "API",
  email: "Email",
  fax: "Fax",
  portal: "Portal",
};

export function ClaimsList({ claims, expenses, loading }: ClaimsListProps) {
  const getExpense = (expenseId: string) =>
    expenses.find((e) => e.id === expenseId);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-4">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-[#F1F5F9]" />
          ))}
        </div>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-10 w-10 text-[#E2E8F0] mb-3" />
          <p className="text-sm font-medium text-[#0C1220]">No claims submitted yet</p>
          <p className="text-xs text-[#94A3B8] mt-1">
            Submit a claim from any expense with documentation attached
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-[#F1F5F9]">
        <h2 className="text-base font-semibold text-[#0C1220]">Claims History</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#F1F5F9] hover:bg-transparent">
              <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Date</TableHead>
              <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Expense</TableHead>
              <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Administrator</TableHead>
              <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono text-right">Amount</TableHead>
              <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono text-center">Method</TableHead>
              <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => {
              const expense = getExpense(claim.expense_id);
              const TierIcon = tierIcons[claim.submission_tier] ?? Send;
              const formData = claim.form_data as Record<string, unknown>;

              return (
                <TableRow
                  key={claim.id}
                  className="border-[#F8FAFC] hover:bg-[#F8FAFC]"
                >
                  <TableCell className="whitespace-nowrap text-[13px] text-[#64748B] tabular-nums font-mono">
                    {claim.submitted_at
                      ? format(new Date(claim.submitted_at), "MMM d, yyyy")
                      : format(new Date(claim.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-[13px] font-medium text-[#0C1220] max-w-48 truncate">
                    {expense?.description ?? (formData.provider as string) ?? "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#64748B]">
                    {claim.administrator_id}
                  </TableCell>
                  <TableCell className="text-right text-[13px] font-medium tabular-nums font-mono text-[#0C1220]">
                    ${((formData.amount as number) ?? expense?.amount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B]">
                      <TierIcon className="h-3 w-3" />
                      {tierLabels[claim.submission_tier]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <ClaimStatusBadge status={claim.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
