"use client";

import { useState, useEffect } from "react";
import type { Expense } from "@/lib/types";
import { isAuditReady, getRetentionStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Search,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onMarkReimbursed: (id: string, amount: number) => void;
}

const categoryLabels: Record<string, string> = {
  medical: "Medical",
  dental: "Dental",
  vision: "Vision",
  prescription: "Rx",
  mental_health: "Mental Health",
  hearing: "Hearing",
  preventive_care: "Preventive",
  other: "Other",
};

const accountLabels: Record<string, string> = {
  hsa: "HSA",
  lpfsa: "LPFSA",
  hcfsa: "HCFSA",
};

const accountColors: Record<string, string> = {
  hsa: "bg-[#059669]/10 text-[#059669] border-[#059669]/20",
  lpfsa: "bg-blue-50 text-blue-700 border-blue-200/50",
  hcfsa: "bg-violet-50 text-violet-700 border-violet-200/50",
};

export function ExpenseTable({
  expenses,
  loading,
  onEdit,
  onDelete,
  onMarkReimbursed,
}: ExpenseTableProps) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.provider.toLowerCase().includes(search.toLowerCase()) ||
      expense.patient_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || expense.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "reimbursed" && expense.reimbursed) ||
      (filterStatus === "pending" && !expense.reimbursed);
    const matchesAccount =
      filterAccount === "all" || expense.account_type === filterAccount;

    return matchesSearch && matchesCategory && matchesStatus && matchesAccount;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus, filterAccount]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedExpenses = filteredExpenses.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const docCount = (expense: Expense) => {
    return (
      (expense.receipt_urls?.length || 0) +
      (expense.eob_urls?.length || 0) +
      (expense.invoice_urls?.length || 0) +
      (expense.credit_card_statement_urls?.length || 0)
    );
  };

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F1F5F9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#0F172A] font-sans">Expenses</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-full sm:w-44 text-[13px]"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-8 w-full sm:w-32 text-[13px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="dental">Dental</SelectItem>
                <SelectItem value="vision">Vision</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="mental_health">Mental Health</SelectItem>
                <SelectItem value="hearing">Hearing</SelectItem>
                <SelectItem value="preventive_care">Preventive</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="h-8 w-full sm:w-28 text-[13px]">
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                <SelectItem value="hsa">HSA</SelectItem>
                <SelectItem value="lpfsa">LPFSA</SelectItem>
                <SelectItem value="hcfsa">HCFSA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-full sm:w-28 text-[13px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="reimbursed">Reimbursed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table body */}
      <div className="px-1">
        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-[#F1F5F9]" />
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-10 w-10 text-[#E2E8F0] mb-3" />
            <p className="text-sm font-medium text-[#0F172A]">No expenses found</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              {expenses.length === 0
                ? "Add your first expense to get started"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#F1F5F9] hover:bg-transparent">
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Date</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Description</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Patient</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Provider</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Category</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono">Acct</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono text-right">Amount</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono text-center">Status</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono text-center">Audit</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider font-mono text-center">Docs</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="border-[#F8FAFC] hover:bg-[#F8FAFC]"
                  >
                    <TableCell className="whitespace-nowrap text-[13px] text-[#64748B] tabular-nums font-mono">
                      {format(new Date(expense.date_of_service), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-[13px] font-medium text-[#0F172A] max-w-48 truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#64748B]">
                      {expense.patient_name}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#64748B]">
                      {expense.provider}
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-medium text-[#475569]">
                        {categoryLabels[expense.category]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-medium border ${accountColors[expense.account_type] || "bg-[#F1F5F9] text-[#475569]"}`}
                      >
                        {accountLabels[expense.account_type] || expense.account_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[13px] font-medium tabular-nums font-mono text-[#0F172A]">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {expense.reimbursed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#059669]">
                          <CheckCircle className="h-3 w-3" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#94A3B8]">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const auditOk = isAuditReady(expense);
                        const taxYear = expense.tax_year ?? new Date(expense.date_of_service).getFullYear();
                        const retention = getRetentionStatus(taxYear);
                        if (retention === "critical") {
                          return (
                            <span title={`Tax year ${taxYear} — past 7-year retention limit!`}>
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500 mx-auto" />
                            </span>
                          );
                        }
                        if (retention === "warning") {
                          return (
                            <span title={`Tax year ${taxYear} — approaching 7-year limit`}>
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mx-auto" />
                            </span>
                          );
                        }
                        return auditOk ? (
                          <span title="Audit ready">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#059669] mx-auto" />
                          </span>
                        ) : (
                          <span title="Missing documentation">
                            <ShieldAlert className="h-3.5 w-3.5 text-[#E2E8F0] mx-auto" />
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {docCount(expense) > 0 ? (
                        <span className="text-[11px] font-medium text-[#64748B] tabular-nums font-mono">
                          {docCount(expense)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#E2E8F0]">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#94A3B8] hover:text-[#64748B]">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          {!expense.reimbursed && (
                            <DropdownMenuItem
                              onClick={() =>
                                onMarkReimbursed(expense.id, expense.amount)
                              }
                            >
                              <CheckCircle className="mr-2 h-3.5 w-3.5" />
                              Mark reimbursed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onDelete(expense.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredExpenses.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9]">
          <p className="text-xs text-[#94A3B8] tabular-nums font-mono">
            {(safePage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(safePage * PAGE_SIZE, filteredExpenses.length)} of {filteredExpenses.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(safePage - 1)}
              className="h-7 px-2 text-[13px]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-[#64748B] px-2 tabular-nums font-mono">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
              className="h-7 px-2 text-[13px]"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
