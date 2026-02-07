"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  ShieldAlert,
  FileText,
  User,
  Receipt,
  ClipboardCheck,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  expense: Expense | null;
}

const STEPS = [
  { id: 1, title: "Expense Info", icon: FileText },
  { id: 2, title: "Patient & Account", icon: User },
  { id: 3, title: "Upload Docs", icon: Receipt },
  { id: 4, title: "Review & Submit", icon: ClipboardCheck },
] as const;

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
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!expense;

  const eligibleTypes = useMemo(
    () => ELIGIBLE_EXPENSES[form.category] || [],
    [form.category]
  );

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
    setStep(1);
    setError(null);
  }, [expense, open]);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return !!(
          form.description.trim() &&
          form.amount > 0 &&
          form.provider.trim() &&
          form.date_of_service
        );
      case 2:
        return !!form.patient_name.trim();
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, form]);

  const handleSubmit = async () => {
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

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step < 4) {
      e.preventDefault();
      if (canProceed()) handleNext();
    }
  };

  const categoryLabel: Record<string, string> = {
    medical: "Medical",
    dental: "Dental",
    vision: "Vision",
    prescription: "Rx",
    mental_health: "Mental Health",
    hearing: "Hearing",
    preventive_care: "Preventive",
    other: "Other",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        onKeyDown={handleKeyDown}
      >
        {/* Stepper Header */}
        <div className="border-b bg-muted/30 px-6 pt-6 pb-4">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg">
              {isEditing ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
            <DialogDescription>
              Step {step} of 4 &mdash; {STEPS[step - 1].title}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (s.id < step) setStep(s.id);
                    }}
                    className={`
                      flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all w-full justify-center
                      ${isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : isComplete
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-200"
                          : "bg-muted text-muted-foreground"
                      }
                    `}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <StepIcon className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">{s.title}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-2 mx-0.5 shrink-0 rounded ${
                        step > s.id ? "bg-emerald-400" : "bg-muted-foreground/20"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-5 space-y-5 min-h-75">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ── Step 1: Expense Info ── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-sm text-muted-foreground">
                What expense are you recording? Fill in the basics.
              </p>

              <div className="space-y-2">
                <Label htmlFor="description">What was this for? *</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="e.g., Annual physical exam, dental cleaning"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
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
                    placeholder="e.g., Dr. Smith, CVS"
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
                      <SelectValue />
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
                  <Label htmlFor="expense_type">Eligible Type</Label>
                  <Select
                    value={form.expense_type || "custom"}
                    onValueChange={(value) =>
                      setForm({ ...form, expense_type: value === "custom" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select from list" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">&mdash; Custom &mdash;</SelectItem>
                      {eligibleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_service">Date of Service *</Label>
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
                  <Label htmlFor="date_of_service_end">End Date (if range)</Label>
                  <Input
                    id="date_of_service_end"
                    type="date"
                    value={form.date_of_service_end ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, date_of_service_end: e.target.value || null })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Patient & Account ── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-sm text-muted-foreground">
                Who was treated, and which account should this go to?
              </p>

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
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Relationship *</Label>
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
                  <Label>Account Type *</Label>
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
                      <SelectItem value="hsa">HSA</SelectItem>
                      <SelectItem value="lpfsa">LPFSA (Limited Purpose FSA)</SelectItem>
                      <SelectItem value="hcfsa">HCFSA (Health Care FSA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={form.payment_method}
                    onValueChange={(value) =>
                      setForm({ ...form, payment_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Claim Type</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="tax_year">Tax Year *</Label>
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
              </div>
            </div>
          )}

          {/* ── Step 3: Upload Documents ── */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Upload your supporting documents. They&apos;re stored securely in your private folder.
                </p>
                {currentAuditReady ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0 ml-3">
                    <ShieldCheck className="h-4 w-4" />
                    Audit Ready
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 shrink-0 ml-3">
                    <ShieldAlert className="h-4 w-4" />
                    Missing Docs
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-300">
                <strong>IRS Rule:</strong> Keep receipts for {IRS_RULES.RETENTION_YEARS}+ years.
                You face a {IRS_RULES.PENALTY_RATE * 100}% penalty + income tax on unproven HSA
                purchases. A <strong>receipt + (EOB or invoice)</strong> = audit ready ✓
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FileUpload
                  folder="receipt"
                  label="Receipt"
                  description="Proof of purchase — the most important document for IRS audits"
                  value={form.receipt_url}
                  onChange={(url) => setForm({ ...form, receipt_url: url })}
                  required
                />

                <FileUpload
                  folder="eob"
                  label="EOB (Explanation of Benefits)"
                  description="From your insurance — proves the expense was medical"
                  value={form.eob_url}
                  onChange={(url) => setForm({ ...form, eob_url: url })}
                />

                <FileUpload
                  folder="invoice"
                  label="Invoice / Bill"
                  description="From the provider — details services and cost"
                  value={form.invoice_url}
                  onChange={(url) => setForm({ ...form, invoice_url: url })}
                />

                <FileUpload
                  folder="cc-statement"
                  label="Credit Card Statement"
                  description="Proves you paid out-of-pocket (not with HSA debit card)"
                  value={form.credit_card_statement_url}
                  onChange={(url) => setForm({ ...form, credit_card_statement_url: url })}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                You can skip this step and upload documents later by editing the expense.
              </p>
            </div>
          )}

          {/* ── Step 4: Review & Submit ── */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-sm text-muted-foreground">
                Review your expense details, then submit.
              </p>

              {/* Summary Card */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">{form.description || "Untitled"}</h4>
                  <span className="text-xl font-bold font-mono">
                    ${form.amount.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Provider:</span>{" "}
                    <span className="font-medium">{form.provider}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    <span className="font-medium">{form.date_of_service}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Patient:</span>{" "}
                    <span className="font-medium">{form.patient_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account:</span>{" "}
                    <span className="font-medium uppercase">{form.account_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span className="font-medium">{categoryLabel[form.category] || form.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tax Year:</span>{" "}
                    <span className="font-medium">{form.tax_year}</span>
                  </div>
                </div>

                {/* Doc status badges */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {form.receipt_url ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                      <Check className="h-3 w-3" /> Receipt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      ✕ Receipt
                    </span>
                  )}
                  {form.eob_url ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                      <Check className="h-3 w-3" /> EOB
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      ✕ EOB
                    </span>
                  )}
                  {form.invoice_url ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      <Check className="h-3 w-3" /> Invoice
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      ✕ Invoice
                    </span>
                  )}
                  {form.credit_card_statement_url ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                      <Check className="h-3 w-3" /> CC Stmt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      ✕ CC Stmt
                    </span>
                  )}
                  <span className="ml-auto">
                    {currentAuditReady ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" /> Audit Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        <ShieldAlert className="h-3.5 w-3.5" /> Not Audit Ready
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Reimbursement Status */}
              <div className="space-y-3">
                <Label>Reimbursement Status *</Label>
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
                    <SelectItem value="no">N &mdash; Not yet reimbursed (let HSA grow! 📈)</SelectItem>
                    <SelectItem value="yes">Y &mdash; Already reimbursed from account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <Label htmlFor="reimbursed_amount">Amount ($)</Label>
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

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value || null })
                  }
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/20">
          <div>
            {step > 1 ? (
              <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Step dots for mobile */}
            <div className="flex gap-1 mr-2 sm:hidden">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`h-1.5 w-1.5 rounded-full ${
                    step >= s.id ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Expense" : "Save Expense"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
