"use client";

import { useMemo, useState } from "react";
import type { Expense } from "@/lib/types";
import {
  FileSpreadsheet,
  Download,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TaxSummaryProps {
  expenses: Expense[];
}

interface CategoryBreakdown {
  category: string;
  count: number;
  total: number;
  reimbursed: number;
  pending: number;
}

interface TaxYearSummary {
  year: number;
  expenses: Expense[];
  total: number;
  reimbursed: number;
  pending: number;
  auditReady: number;
  auditMissing: number;
  byCategory: CategoryBreakdown[];
  byAccount: { hsa: number; lpfsa: number; hcfsa: number };
}

const categoryLabels: Record<string, string> = {
  medical: "Medical",
  dental: "Dental",
  vision: "Vision",
  prescription: "Prescription",
  mental_health: "Mental Health",
  hearing: "Hearing",
  preventive_care: "Preventive Care",
  other: "Other",
};

function formatMoney(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateCSV(summary: TaxYearSummary): string {
  const rows: string[] = [];
  rows.push(
    [
      "Date of Service",
      "Description",
      "Provider",
      "Patient",
      "Category",
      "Expense Type",
      "Account",
      "Amount",
      "Reimbursed",
      "Reimbursed Amount",
      "Reimbursed Date",
      "Audit Ready",
      "Tax Year",
    ].join(",")
  );

  for (const e of summary.expenses) {
    rows.push(
      [
        e.date_of_service,
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.provider.replace(/"/g, '""')}"`,
        `"${e.patient_name.replace(/"/g, '""')}"`,
        categoryLabels[e.category] ?? e.category,
        `"${e.expense_type.replace(/"/g, '""')}"`,
        e.account_type.toUpperCase(),
        e.amount.toFixed(2),
        e.reimbursed ? "Yes" : "No",
        e.reimbursed_amount?.toFixed(2) ?? "",
        e.reimbursed_date ?? "",
        e.audit_ready ? "Yes" : "No",
        e.tax_year.toString(),
      ].join(",")
    );
  }

  // Summary rows
  rows.push("");
  rows.push(`"Tax Year ${summary.year} Summary"`);
  rows.push(`"Total Expenses","","","","","","",${summary.total.toFixed(2)}`);
  rows.push(`"Total Reimbursed","","","","","","",${summary.reimbursed.toFixed(2)}`);
  rows.push(`"Pending Reimbursement","","","","","","",${summary.pending.toFixed(2)}`);
  rows.push("");
  rows.push('"Category","Count","Total"');
  for (const cat of summary.byCategory) {
    rows.push(`"${categoryLabels[cat.category] ?? cat.category}",${cat.count},${cat.total.toFixed(2)}`);
  }

  return rows.join("\n");
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function TaxSummary({ expenses }: TaxSummaryProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  const summaries = useMemo(() => {
    const byYear = new Map<number, Expense[]>();
    for (const e of expenses) {
      const year = e.tax_year ?? new Date(e.date_of_service).getFullYear();
      const existing = byYear.get(year) ?? [];
      existing.push(e);
      byYear.set(year, existing);
    }

    const results: TaxYearSummary[] = [];
    for (const [year, yearExpenses] of byYear) {
      const total = yearExpenses.reduce((s, e) => s + e.amount, 0);
      const reimbursed = yearExpenses
        .filter((e) => e.reimbursed)
        .reduce((s, e) => s + (e.reimbursed_amount ?? e.amount), 0);

      const catMap = new Map<string, CategoryBreakdown>();
      for (const e of yearExpenses) {
        const existing = catMap.get(e.category) ?? {
          category: e.category,
          count: 0,
          total: 0,
          reimbursed: 0,
          pending: 0,
        };
        existing.count++;
        existing.total += e.amount;
        if (e.reimbursed) {
          existing.reimbursed += e.reimbursed_amount ?? e.amount;
        } else {
          existing.pending += e.amount;
        }
        catMap.set(e.category, existing);
      }

      const auditReady = yearExpenses.filter((e) => e.audit_ready).length;

      results.push({
        year,
        expenses: yearExpenses.sort(
          (a, b) =>
            new Date(a.date_of_service).getTime() -
            new Date(b.date_of_service).getTime()
        ),
        total,
        reimbursed,
        pending: total - reimbursed,
        auditReady,
        auditMissing: yearExpenses.length - auditReady,
        byCategory: [...catMap.values()].sort((a, b) => b.total - a.total),
        byAccount: {
          hsa: yearExpenses
            .filter((e) => e.account_type === "hsa")
            .reduce((s, e) => s + e.amount, 0),
          lpfsa: yearExpenses
            .filter((e) => e.account_type === "lpfsa")
            .reduce((s, e) => s + e.amount, 0),
          hcfsa: yearExpenses
            .filter((e) => e.account_type === "hcfsa")
            .reduce((s, e) => s + e.amount, 0),
        },
      });
    }

    return results.sort((a, b) => b.year - a.year);
  }, [expenses]);

  const handleExport = (summary: TaxYearSummary) => {
    const csv = generateCSV(summary);
    downloadCSV(csv, `hsa-tax-summary-${summary.year}.csv`);
    toast.success(`Exported ${summary.year} tax summary`);
  };

  const handleExportAll = () => {
    for (const summary of summaries) {
      const csv = generateCSV(summary);
      downloadCSV(csv, `hsa-tax-summary-${summary.year}.csv`);
    }
    toast.success(`Exported ${summaries.length} tax summary files`);
  };

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-blue-500 to-blue-400">
              <FileSpreadsheet className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#0F172A] font-sans">
              Annual Tax Summary
            </h2>
          </div>
        </div>
        <div className="px-6 py-10 text-center">
          <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-[#E2E8F0]" />
          <p className="text-sm text-[#64748B]">No expenses to summarize</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Add expenses to see annual tax summaries
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-blue-500 to-blue-400">
              <FileSpreadsheet className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#0F172A] font-sans">
              Annual Tax Summary
            </h2>
          </div>
          {summaries.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAll}
              className="h-7 text-[11px] px-2.5"
            >
              <Download className="h-3 w-3 mr-1" />
              Export all
            </Button>
          )}
        </div>
      </div>

      {/* Year rows */}
      <div className="divide-y divide-[#F1F5F9]">
        {summaries.map((summary) => {
          const isExpanded = expandedYear === summary.year;
          return (
            <div key={summary.year}>
              {/* Year header */}
              <button
                onClick={() =>
                  setExpandedYear(isExpanded ? null : summary.year)
                }
                className="w-full px-6 py-3.5 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0F172A] font-mono">
                        {summary.year}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {summary.expenses.length} expense
                        {summary.expenses.length !== 1 ? "s" : ""}
                      </Badge>
                      {summary.auditMissing > 0 ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          {summary.auditMissing} missing docs
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-[#059669]">
                          <ShieldCheck className="h-3 w-3" />
                          Audit ready
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-[#94A3B8]">
                        Total: {formatMoney(summary.total)}
                      </span>
                      <span className="text-[11px] text-[#059669]">
                        Reimbursed: {formatMoney(summary.reimbursed)}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Pending: {formatMoney(summary.pending)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(summary);
                  }}
                  className="h-7 text-[11px] px-2 text-[#64748B] hover:text-[#0F172A]"
                >
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-6 pb-4 pt-1 bg-[#FAFAFA]">
                  {/* Category breakdown */}
                  <div className="mb-3">
                    <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-2">
                      By Category
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {summary.byCategory.map((cat) => (
                        <div
                          key={cat.category}
                          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2"
                        >
                          <p className="text-[11px] text-[#64748B]">
                            {categoryLabels[cat.category] ?? cat.category}
                          </p>
                          <p className="text-sm font-semibold font-mono tabular-nums text-[#0F172A]">
                            {formatMoney(cat.total)}
                          </p>
                          <p className="text-[10px] text-[#94A3B8]">
                            {cat.count} item{cat.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account breakdown */}
                  <div className="mb-3">
                    <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-2">
                      By Account
                    </p>
                    <div className="flex gap-4">
                      {(
                        [
                          ["HSA", summary.byAccount.hsa],
                          ["LPFSA", summary.byAccount.lpfsa],
                          ["HCFSA", summary.byAccount.hcfsa],
                        ] as const
                      )
                        .filter(([, v]) => v > 0)
                        .map(([label, value]) => (
                          <div key={label} className="text-[12px]">
                            <span className="text-[#64748B]">{label}:</span>{" "}
                            <span className="font-mono font-medium text-[#0F172A]">
                              {formatMoney(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Expense list */}
                  <div>
                    <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-2">
                      Expenses
                    </p>
                    <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                            <th className="text-left px-3 py-2 font-medium text-[#64748B]">
                              Date
                            </th>
                            <th className="text-left px-3 py-2 font-medium text-[#64748B]">
                              Description
                            </th>
                            <th className="text-left px-3 py-2 font-medium text-[#64748B]">
                              Category
                            </th>
                            <th className="text-right px-3 py-2 font-medium text-[#64748B]">
                              Amount
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-[#64748B]">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {summary.expenses.map((e) => (
                            <tr key={e.id} className="hover:bg-[#FAFAFA]">
                              <td className="px-3 py-2 text-[#64748B] font-mono whitespace-nowrap">
                                {new Date(
                                  e.date_of_service + "T00:00:00"
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-3 py-2 text-[#0F172A] truncate max-w-[200px]">
                                {e.description}
                              </td>
                              <td className="px-3 py-2 text-[#64748B]">
                                {categoryLabels[e.category] ?? e.category}
                              </td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums text-[#0F172A]">
                                {formatMoney(e.amount)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {e.reimbursed ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-[#059669]/10 text-[#059669] px-1.5"
                                  >
                                    Reimbursed
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-amber-50 text-amber-700 px-1.5"
                                  >
                                    Pending
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
