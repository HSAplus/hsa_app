"use client";

import { useState, useEffect, useMemo } from "react";
import type { Expense, ExpenseCategory, ExpenseFormData } from "@/lib/types";
import { ELIGIBLE_EXPENSES, IRS_RULES, isAuditReady } from "@/lib/types";
import { addExpense, updateExpense } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Info, ShieldCheck, ShieldAlert } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  expense: Expense | null;
}

const emptyForm: ExpenseFormData = {
  description: "",
  amount: 0,
  date_of_service: new Date().toISOString().split("T")[0],
  date_of_service_end: null,
  provider: "",
  patient_name: "",
  patient_relationship: "self",
  account_type: "hsa",
  category: "medical",
  expense_type: "",
  reimbursed: false,
  reimbursed_date: null,
  reimbursed_amount: null,
  claim_type: "new",
  payment_method: "credit_card",
  notes: null,
  eob_url: null,
  invoice_url: null,
  receipt_url: null,
  credit_card_statement_url: null,
  tax_year: new Date().getFullYear(),
};

export function AddExpenseDialog({
  open,
  onClose,
  onSaved,
  expense,
}: AddExpenseDialogProps) {
  const [form, setForm] = useState<ExpenseFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!expense;

  // Get eligible expense types for selected category
  const eligibleTypes = useMemo(
    () => ELIGIBLE_EXPENSES[form.category] || [],
    [form.category]
  );

  // Compute IRS audit readiness in real-time as user fills in doc links
  const currentAuditReady = useMemo(
    () =>
      isAuditReady({
        receipt_url: form.receipt_url,
        eob_url: form.eob_url,
        invoice_url: form.invoice_url,
      }),
    [form.receipt_url, form.eob_url, form.invoice_url]
  );

  useEffect(() => {
    if (expense) {
      setForm({
        description: expense.description,
        amount: expense.amount,
        date_of_service: expense.date_of_service,
        date_of_service_end: expense.date_of_service_end,
        provider: expense.provider,
        patient_name: expense.patient_name,
        patient_relationship: expense.patient_relationship,
        account_type: expense.account_type,
        category: expense.category,
        expense_type: expense.expense_type,
        reimbursed: expense.reimbursed,
        reimbursed_date: expense.reimbursed_date,
        reimbursed_amount: expense.reimbursed_amount,
        claim_type: expense.claim_type,
        payment_method: expense.payment_method,
        notes: expense.notes,
        eob_url: expense.eob_url,
        invoice_url: expense.invoice_url,
        receipt_url: expense.receipt_url,
        credit_card_statement_url: expense.credit_card_statement_url,
        tax_year: expense.tax_year ?? new Date(expense.date_of_service).getFullYear(),
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [expense, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = isEditing
        ? await updateExpense(expense.id, form)
        : await addExpense(form);

      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the expense details below"
              : "Enter the details of your medical expense"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ViaBenefits Info Banner */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Per ViaBenefits: Pay with your credit card (not HSA debit), save all
              documentation, and mark as &quot;N&quot; until you request reimbursement.
              <strong className="block mt-1">
                IRS Rule: Keep all receipts for {IRS_RULES.RETENTION_YEARS}+ years.
                You face a {IRS_RULES.PENALTY_RATE * 100}% penalty + income tax on
                any HSA purchases you can&apos;t prove were qualified medical expenses.
              </strong>
            </span>
          </div>

          {/* Section 1: Patient & Account Info (per ViaBenefits Reimbursement Form) */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Patient &amp; Account Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name *</Label>
                <Input
                  id="patient_name"
                  value={form.patient_name}
                  onChange={(e) =>
                    setForm({ ...form, patient_name: e.target.value })
                  }
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_relationship">Relationship to Account Holder *</Label>
                <Select
                  value={form.patient_relationship}
                  onValueChange={(value: "self" | "spouse" | "dependent_child" | "domestic_partner") =>
                    setForm({ ...form, patient_relationship: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="dependent_child">Dependent Child</SelectItem>
                    <SelectItem value="domestic_partner">Domestic Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type *</Label>
                <Select
                  value={form.account_type}
                  onValueChange={(value: "hsa" | "lpfsa" | "hcfsa") =>
                    setForm({ ...form, account_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hsa">HSA (Health Savings Account)</SelectItem>
                    <SelectItem value="lpfsa">LPFSA (Limited Purpose FSA)</SelectItem>
                    <SelectItem value="hcfsa">HCFSA (Health Care FSA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="claim_type">Claim Type</Label>
                <Select
                  value={form.claim_type}
                  onValueChange={(value: "new" | "resubmission" | "appeal") =>
                    setForm({ ...form, claim_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Claim</SelectItem>
                    <SelectItem value="resubmission">Resubmission</SelectItem>
                    <SelectItem value="appeal">Appeal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 2: Expense Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Expense Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Brief note of the service or item"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value: ExpenseCategory) =>
                    setForm({ ...form, category: value, expense_type: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="vision">Vision</SelectItem>
                    <SelectItem value="prescription">Prescription / Rx</SelectItem>
                    <SelectItem value="mental_health">Mental Health</SelectItem>
                    <SelectItem value="hearing">Hearing</SelectItem>
                    <SelectItem value="preventive_care">Preventive Care</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_type">Eligible Expense Type</Label>
                <Select
                  value={form.expense_type || "custom"}
                  onValueChange={(value) =>
                    setForm({ ...form, expense_type: value === "custom" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from eligible list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">— Custom / Other —</SelectItem>
                    {eligibleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Paid Out-of-Pocket ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Input
                  id="provider"
                  value={form.provider}
                  onChange={(e) =>
                    setForm({ ...form, provider: e.target.value })
                  }
                  placeholder="e.g., Dr. Smith, CVS Pharmacy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_service">Date of Service (Start) *</Label>
                <Input
                  id="date_of_service"
                  type="date"
                  value={form.date_of_service}
                  onChange={(e) =>
                    setForm({ ...form, date_of_service: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_service_end">Date of Service (End)</Label>
                <Input
                  id="date_of_service_end"
                  type="date"
                  value={form.date_of_service_end ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, date_of_service_end: e.target.value || null })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={form.payment_method}
                  onValueChange={(value) =>
                    setForm({ ...form, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card (recommended)</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="hsa_card">HSA Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reimbursed">Reimbursed (Y/N) *</Label>
                <Select
                  value={form.reimbursed ? "yes" : "no"}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      reimbursed: value === "yes",
                      reimbursed_date:
                        value === "yes"
                          ? new Date().toISOString().split("T")[0]
                          : null,
                      reimbursed_amount: value === "yes" ? form.amount : null,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">N — Not yet (let HSA grow!)</SelectItem>
                    <SelectItem value="yes">Y — Reimbursed from account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Reimbursement details */}
          {form.reimbursed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
              <div className="space-y-2">
                <Label htmlFor="reimbursed_date">Reimbursement Date</Label>
                <Input
                  id="reimbursed_date"
                  type="date"
                  value={form.reimbursed_date ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, reimbursed_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reimbursed_amount">
                  Reimbursed Amount ($)
                </Label>
                <Input
                  id="reimbursed_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.reimbursed_amount ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reimbursed_amount: parseFloat(e.target.value) || null,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Section 3: Document Uploads & IRS Compliance */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Documents &amp; IRS Compliance
              </h4>
              {/* Real-time audit readiness indicator */}
              {currentAuditReady ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Audit Ready
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                  Missing Docs
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your documents directly — they&apos;re stored securely in your private folder.
              A receipt + (EOB or invoice) = audit ready.
              <strong> Keep all records for at least {IRS_RULES.RETENTION_YEARS} years.</strong>
            </p>

            {/* Tax Year */}
            <div className="space-y-2">
              <Label htmlFor="tax_year">Tax Year *</Label>
              <p className="text-xs text-muted-foreground">
                The tax year this expense falls under (keep records for 7 years from this year)
              </p>
              <Input
                id="tax_year"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                value={form.tax_year}
                onChange={(e) =>
                  setForm({ ...form, tax_year: parseInt(e.target.value) || new Date().getFullYear() })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FileUpload
                folder="receipt"
                label="Receipt"
                description='Per HRMorning: "save receipts for all HSA-eligible goods and services"'
                value={form.receipt_url}
                onChange={(url) => setForm({ ...form, receipt_url: url })}
                required
              />

              <FileUpload
                folder="eob"
                label="EOB (Explanation of Benefits)"
                description="First line of proof that the expense was medical and legitimate"
                value={form.eob_url}
                onChange={(url) => setForm({ ...form, eob_url: url })}
              />

              <FileUpload
                folder="invoice"
                label="Invoice / Bill"
                description="Comes directly from the provider, detailing the services and cost"
                value={form.invoice_url}
                onChange={(url) => setForm({ ...form, invoice_url: url })}
              />

              <FileUpload
                folder="cc-statement"
                label="Credit Card Statement"
                description="Proof you paid out-of-pocket (not with HSA debit card)"
                value={form.credit_card_statement_url}
                onChange={(url) => setForm({ ...form, credit_card_statement_url: url })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes ?? ""}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value || null })
              }
              placeholder="Any additional notes (skip for prescriptions, etc.)..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Expense" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
