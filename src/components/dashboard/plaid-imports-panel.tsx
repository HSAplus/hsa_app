"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getPlaidImportTransactions,
  reconcilePlaidToExpense,
  setPlaidImportStatus,
} from "@/app/dashboard/actions";
import type { Expense, PlaidImportTransaction } from "@/lib/types";
import { formatCurrency } from "@/lib/hsa-constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Landmark, Link2, Ban, AlertTriangle } from "lucide-react";

interface PlaidImportsPanelProps {
  expenses: Expense[];
  onChanged: () => void;
}

function formatPlaidAmount(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "+" : amount > 0 ? "−" : "";
  return `${sign}${formatCurrency(abs)}`;
}

export function PlaidImportsPanel({ expenses, onChanged }: PlaidImportsPanelProps) {
  const [rows, setRows] = useState<PlaidImportTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await getPlaidImportTransactions();
    setRows(data);
  }, []);

  useEffect(() => {
    getPlaidImportTransactions().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  const handleMatch = async (plaidId: string, expenseId: string) => {
    if (!expenseId) return;
    setBusyId(plaidId);
    const res = await reconcilePlaidToExpense(plaidId, expenseId);
    setBusyId(null);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Matched to expense");
      onChanged();
      void refresh();
    }
  };

  const handleStatus = async (plaidId: string, status: "ignored" | "discrepancy" | "unmatched") => {
    setBusyId(plaidId);
    const res = await setPlaidImportStatus(plaidId, status);
    setBusyId(null);
    if (res.error) toast.error(res.error);
    else {
      toast.success(status === "ignored" ? "Marked as ignored" : "Updated");
      onChanged();
      void refresh();
    }
  };

  const unmatched = rows.filter((r) => r.reconciliation_status === "unmatched");
  const other = rows.filter((r) => r.reconciliation_status !== "unmatched");

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading bank activity…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <Landmark className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Bank activity (Plaid)</p>
            <p className="text-[13px] mt-1">
              No imported transactions yet. Connect your HSA in{" "}
              <Link href="/dashboard/profile" className="text-emerald-600 hover:underline">
                Profile
              </Link>{" "}
              and sync — activity appears here for reconciliation with your logged expenses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-foreground">Bank activity</h2>
        </div>
        <p className="text-[11px] text-muted-foreground hidden sm:block">
          Match Plaid lines to expenses, or log a new expense — imports never replace your records automatically.
        </p>
      </div>

      {unmatched.length > 0 && (
        <div className="px-2 py-2">
          <p className="text-[11px] text-muted-foreground px-2 pb-2">Needs review</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 px-2 font-medium">Date</th>
                  <th className="py-2 px-2 font-medium">Description</th>
                  <th className="py-2 px-2 font-medium text-right">Amount</th>
                  <th className="py-2 px-2 font-medium">Match</th>
                  <th className="py-2 px-2 font-medium w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unmatched.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 px-2 whitespace-nowrap text-muted-foreground">{r.date}</td>
                    <td className="py-2 px-2 max-w-[200px] sm:max-w-xs truncate" title={r.name}>
                      {r.merchant_name || r.name}
                      {r.pending && (
                        <span className="ml-1 text-[10px] text-amber-600">pending</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">
                      {formatPlaidAmount(r.amount)}
                    </td>
                    <td className="py-2 px-2">
                      <Select
                        disabled={busyId === r.id}
                        onValueChange={(expenseId) => handleMatch(r.id, expenseId)}
                      >
                        <SelectTrigger className="h-8 text-[12px]">
                          <SelectValue placeholder="Link expense…" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenses.map((e) => (
                            <SelectItem key={e.id} value={e.id} className="text-[12px]">
                              {e.date_of_service} · {formatCurrency(e.amount)} · {e.description.slice(0, 40)}
                              {e.description.length > 40 ? "…" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2"
                          disabled={busyId === r.id}
                          asChild
                        >
                          <Link
                            href={`/dashboard/expenses/new?fromPlaid=1&plaid_amount=${encodeURIComponent(String(Math.abs(r.amount)))}&plaid_date=${encodeURIComponent(r.date)}&plaid_provider=${encodeURIComponent(r.merchant_name || r.name)}&plaid_desc=${encodeURIComponent(r.name)}`}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            New expense
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] px-2 text-muted-foreground"
                          disabled={busyId === r.id}
                          onClick={() => handleStatus(r.id, "ignored")}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Ignore
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] px-2 text-amber-700"
                          disabled={busyId === r.id}
                          onClick={() => handleStatus(r.id, "discrepancy")}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flag
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div className="px-2 py-2 border-t border-border">
          <p className="text-[11px] text-muted-foreground px-2 pb-2">Reconciled</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] opacity-90">
              <tbody>
                {other.slice(0, 20).map((r) => (
                  <tr key={r.id} className="border-b border-border/40 last:border-0">
                    <td className="py-1.5 px-2 whitespace-nowrap text-muted-foreground">{r.date}</td>
                    <td className="py-1.5 px-2 truncate max-w-[180px]">
                      {r.merchant_name || r.name}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">{formatPlaidAmount(r.amount)}</td>
                    <td className="py-1.5 px-2 text-[11px] text-muted-foreground">
                      {r.reconciliation_status === "matched" && r.matched_expense_id && (
                        <span>Matched</span>
                      )}
                      {r.reconciliation_status === "ignored" && "Ignored"}
                      {r.reconciliation_status === "discrepancy" && "Flagged"}
                    </td>
                    <td className="py-1.5 px-2">
                      {(r.reconciliation_status === "matched" ||
                        r.reconciliation_status === "ignored" ||
                        r.reconciliation_status === "discrepancy") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px]"
                          disabled={busyId === r.id}
                          onClick={() => handleStatus(r.id, "unmatched")}
                        >
                          Undo
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
