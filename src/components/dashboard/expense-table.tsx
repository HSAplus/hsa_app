"use client";

import { useState } from "react";
import type { Expense } from "@/lib/types";
import { isAuditReady, getRetentionStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const categoryColors: Record<string, string> = {
  medical: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  dental: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  vision: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  prescription: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  mental_health: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  hearing: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  preventive_care: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const accountLabels: Record<string, string> = {
  hsa: "HSA",
  lpfsa: "LPFSA",
  hcfsa: "HCFSA",
};

const accountColors: Record<string, string> = {
  hsa: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  lpfsa: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  hcfsa: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl">Expenses</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-50"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-37.5">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="dental">Dental</SelectItem>
                <SelectItem value="vision">Vision</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="mental_health">Mental Health</SelectItem>
                <SelectItem value="hearing">Hearing</SelectItem>
                <SelectItem value="preventive_care">Preventive Care</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="w-full sm:w-37.5">
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="hsa">HSA</SelectItem>
                <SelectItem value="lpfsa">LPFSA</SelectItem>
                <SelectItem value="hcfsa">HCFSA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-37.5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reimbursed">Reimbursed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No expenses found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {expenses.length === 0
                ? "Add your first expense to get started"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reimbursed</TableHead>
                  <TableHead>Audit</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(expense.date_of_service), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium max-w-50 truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {expense.patient_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {expense.provider}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={categoryColors[expense.category]}
                      >
                        {categoryLabels[expense.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={accountColors[expense.account_type] || ""}
                      >
                        {accountLabels[expense.account_type] || expense.account_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {expense.reimbursed ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Y
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          N
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const auditOk = isAuditReady(expense);
                        const taxYear = expense.tax_year ?? new Date(expense.date_of_service).getFullYear();
                        const retention = getRetentionStatus(taxYear);
                        if (retention === "critical") {
                          return (
                            <div className="flex items-center gap-1" title={`Tax year ${taxYear} — past 7-year retention limit!`}>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                          );
                        }
                        if (retention === "warning") {
                          return (
                            <div className="flex items-center gap-1" title={`Tax year ${taxYear} — approaching 7-year limit`}>
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </div>
                          );
                        }
                        return auditOk ? (
                          <span title="Audit ready ✓">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          </span>
                        ) : (
                          <span title="Missing documentation">
                            <ShieldAlert className="h-4 w-4 text-amber-500" />
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {expense.receipt_url && (
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300 hover:opacity-80 transition-opacity"
                          >
                            <FileText className="h-3 w-3" />
                            RCT
                          </a>
                        )}
                        {expense.eob_url && (
                          <a
                            href={expense.eob_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 hover:opacity-80 transition-opacity"
                          >
                            <FileText className="h-3 w-3" />
                            EOB
                          </a>
                        )}
                        {expense.invoice_url && (
                          <a
                            href={expense.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 hover:opacity-80 transition-opacity"
                          >
                            <FileText className="h-3 w-3" />
                            INV
                          </a>
                        )}
                        {expense.credit_card_statement_url && (
                          <a
                            href={expense.credit_card_statement_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 dark:text-orange-300 hover:opacity-80 transition-opacity"
                          >
                            <FileText className="h-3 w-3" />
                            CC
                          </a>
                        )}
                        {!expense.receipt_url && !expense.eob_url && !expense.invoice_url && !expense.credit_card_statement_url && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {!expense.reimbursed && (
                            <DropdownMenuItem
                              onClick={() =>
                                onMarkReimbursed(expense.id, expense.amount)
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Reimbursed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onDelete(expense.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}
