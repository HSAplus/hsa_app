"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Expense, ExpenseCategory, ExpenseFormData, Profile, Dependent } from "@/lib/types";
import { ELIGIBLE_EXPENSES, IRS_RULES, isAuditReady } from "@/lib/types";
import { addExpense, updateExpense, addDependent, getExpenseTemplateById } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  ShieldAlert,
  FileText,
  User,
  UserPlus,
  Receipt,
  ClipboardCheck,
  X,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface ExpenseFormPageProps {
  expense?: Expense;
  profile?: Profile | null;
  dependents?: Dependent[];
}

const STEPS = [
  { id: 1, title: "Expense Info", description: "What expense are you recording?", icon: FileText },
  { id: 2, title: "Patient & Account", description: "Who was treated and which account?", icon: User },
  { id: 3, title: "Upload Docs", description: "Upload supporting documents", icon: Receipt },
  { id: 4, title: "Review & Submit", description: "Review and save your expense", icon: ClipboardCheck },
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
  eob_urls: [],
  invoice_urls: [],
  receipt_urls: [],
  credit_card_statement_urls: [],
  tax_year: new Date().getFullYear(),
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

export function ExpenseFormPage({ expense, profile, dependents = [] }: ExpenseFormPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-populate patient_name with profile name when creating a new expense
  const profileFullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "";

  const [form, setForm] = useState<ExpenseFormData>({
    ...emptyForm,
    patient_name: profileFullName,
  });
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependentsList, setDependentsList] = useState<Dependent[]>(dependents);
  const [savingDependent, setSavingDependent] = useState(false);

  const isEditing = !!expense;

  // Pre-fill form from template if ?template=id is present
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && !isEditing) {
      getExpenseTemplateById(templateId).then((t) => {
        if (t) {
          setForm((prev) => ({
            ...prev,
            description: t.description,
            amount: t.amount,
            provider: t.provider,
            patient_name: t.patient_name || prev.patient_name,
            patient_relationship: t.patient_relationship,
            account_type: t.account_type,
            category: t.category,
            expense_type: t.expense_type,
            payment_method: t.payment_method,
          }));
          toast.info(`Loaded template: ${t.name}`);
        }
      });
    }
  }, [searchParams, isEditing]);

  const eligibleTypes = useMemo(
    () => ELIGIBLE_EXPENSES[form.category] || [],
    [form.category]
  );

  const currentAuditReady = useMemo(
    () =>
      isAuditReady({
        receipt_urls: form.receipt_urls,
        eob_urls: form.eob_urls,
        invoice_urls: form.invoice_urls,
      }),
    [form.receipt_urls, form.eob_urls, form.invoice_urls]
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
        eob_urls: expense.eob_urls ?? [],
        invoice_urls: expense.invoice_urls ?? [],
        receipt_urls: expense.receipt_urls ?? [],
        credit_card_statement_urls: expense.credit_card_statement_urls ?? [],
        tax_year: expense.tax_year ?? new Date(expense.date_of_service).getFullYear(),
      });
    }
  }, [expense]);

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

  // Determine if the current patient is a new (unsaved) dependent
  const isNewDependent = useMemo(() => {
    const name = form.patient_name.trim();
    const rel = form.patient_relationship;
    if (!name || rel === "self") return false;
    // Check if it matches the profile owner
    if (name.toLowerCase() === profileFullName.toLowerCase()) return false;
    // Check if it matches any existing dependent
    return !dependentsList.some(
      (dep) =>
        `${dep.first_name} ${dep.last_name}`.trim().toLowerCase() === name.toLowerCase() &&
        dep.relationship === rel
    );
  }, [form.patient_name, form.patient_relationship, profileFullName, dependentsList]);

  const handleSaveAsDependent = async () => {
    const name = form.patient_name.trim();
    const parts = name.split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    if (!firstName) return;

    setSavingDependent(true);
    try {
      const result = await addDependent({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: null,
        relationship: form.patient_relationship,
      });
      if (result.error) {
        toast.error(result.error);
      } else if (result.dependent) {
        setDependentsList((prev) =>
          [...prev, result.dependent!].sort((a, b) =>
            a.first_name.localeCompare(b.first_name)
          )
        );
        toast.success(`${name} saved as a dependent! They'll appear in quick-select next time.`);
      }
    } catch {
      toast.error("Failed to save dependent");
    }
    setSavingDependent(false);
  };

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
        toast.success(isEditing ? "Expense updated" : "Expense added");
        router.push("/dashboard");
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

  return (
    <div className="min-h-screen bg-[#FAFAFA]" onKeyDown={handleKeyDown}>
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="HSA Plus" width={56} height={37} className="rounded-lg" />
              <span className="text-base font-semibold tracking-tight">HSA Plus</span>
            </Link>
            <span className="text-[#E2E8F0]">/</span>
            <span className="text-sm font-medium text-[#64748B]">
              {isEditing ? "Edit Expense" : "New Expense"}
            </span>
          </div>

          <Button variant="ghost" size="sm" asChild className="text-[13px] text-[#64748B] h-8">
            <Link href="/dashboard">
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Link>
          </Button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-[#F1F5F9]">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="max-w-2xl mx-auto relative">
            {/* Connector lines */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[12.5%] right-[12.5%]">
              <div className="flex">
                {STEPS.slice(0, -1).map((s, i) => (
                  <div key={`line-${i}`} className="flex-1">
                    <div
                      className={`h-px w-full ${
                        step > s.id ? "bg-gradient-to-r from-[#059669] to-[#34d399]" : "bg-[#E2E8F0]"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Step buttons in equal-width grid */}
            <div className="relative grid grid-cols-4">
              {STEPS.map((s) => {
                const StepIcon = s.icon;
                const isActive = step === s.id;
                const isComplete = step > s.id;
                return (
                  <div key={s.id} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (s.id < step) setStep(s.id);
                      }}
                      className={`
                        inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all whitespace-nowrap
                        ${isActive
                          ? "bg-gradient-to-r from-[#059669] to-[#34d399] text-white shadow-accent"
                          : isComplete
                            ? "bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/15"
                            : "bg-[#F1F5F9] text-[#94A3B8]"
                        }
                      `}
                    >
                      {isComplete ? (
                        <Check className="h-3 w-3 shrink-0" />
                      ) : (
                        <StepIcon className="h-3 w-3 shrink-0" />
                      )}
                      <span className="hidden sm:inline">{s.title}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Step Title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {STEPS[step - 1].title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Step {step} of 4 &mdash; {STEPS[step - 1].description}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive mb-6">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            {/* ── Step 1: Expense Info ── */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
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

                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
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
                      <SelectTrigger className="w-full">
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
                      <SelectTrigger className="w-full">
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
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Quick-select patient */}
                {(profileFullName || dependentsList.length > 0) && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-normal">Quick Select Patient</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileFullName && (
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                            form.patient_name === profileFullName && form.patient_relationship === "self"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                          }`}
                          onClick={() =>
                            setForm({
                              ...form,
                              patient_name: profileFullName,
                              patient_relationship: "self",
                            })
                          }
                        >
                          <User className="h-3.5 w-3.5" />
                          {profileFullName}
                          <span className="text-xs text-muted-foreground">(Self)</span>
                        </button>
                      )}
                      {dependentsList.map((dep) => {
                        const depName = `${dep.first_name} ${dep.last_name}`.trim();
                        const isSelected =
                          form.patient_name === depName &&
                          form.patient_relationship === dep.relationship;
                        const relLabel =
                          dep.relationship === "spouse"
                            ? "Spouse"
                            : dep.relationship === "dependent_child"
                              ? "Child"
                              : "Partner";
                        return (
                          <button
                            key={dep.id}
                            type="button"
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                            }`}
                            onClick={() =>
                              setForm({
                                ...form,
                                patient_name: depName,
                                patient_relationship: dep.relationship,
                              })
                            }
                          >
                            <User className="h-3.5 w-3.5" />
                            {depName}
                            <span className="text-xs text-muted-foreground">({relLabel})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
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
                        setForm({
                          ...form,
                          patient_relationship: value,
                          patient_name: value === "self" && profileFullName ? profileFullName : (value !== "self" && form.patient_name === profileFullName ? "" : form.patient_name),
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
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

                  {/* Save as dependent prompt */}
                  {isNewDependent && (
                    <div className="col-span-2 flex items-center justify-between gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <span className="font-medium">{form.patient_name.trim()}</span>{" "}
                          isn&apos;t saved yet. Save them so you can quick-select next time?
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={savingDependent}
                        onClick={handleSaveAsDependent}
                        className="shrink-0 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        {savingDependent ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Account Type *</Label>
                    <Select
                      value={form.account_type}
                      onValueChange={(value: "hsa" | "lpfsa" | "hcfsa") =>
                        setForm({ ...form, account_type: value })
                      }
                    >
                      <SelectTrigger className="w-full">
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
                      <SelectTrigger className="w-full">
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
                      <SelectTrigger className="w-full">
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
              <div className="space-y-5 animate-in fade-in duration-200">
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
                    value={form.receipt_urls}
                    onChange={(urls) => setForm({ ...form, receipt_urls: urls })}
                    required
                  />

                  <FileUpload
                    folder="eob"
                    label="EOB (Explanation of Benefits)"
                    description="From your insurance — proves the expense was medical"
                    value={form.eob_urls}
                    onChange={(urls) => setForm({ ...form, eob_urls: urls })}
                  />

                  <FileUpload
                    folder="invoice"
                    label="Invoice / Bill"
                    description="From the provider — details services and cost"
                    value={form.invoice_urls}
                    onChange={(urls) => setForm({ ...form, invoice_urls: urls })}
                  />

                  <FileUpload
                    folder="cc-statement"
                    label="Credit Card Statement"
                    description="Proves you paid out-of-pocket (not with HSA debit card)"
                    value={form.credit_card_statement_urls}
                    onChange={(urls) => setForm({ ...form, credit_card_statement_urls: urls })}
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
                {/* Summary Card */}
                <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{form.description || "Untitled"}</h4>
                    <span className="text-2xl font-bold font-mono">
                      ${form.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
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
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {form.receipt_urls.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                        <Check className="h-3 w-3" /> Receipt ({form.receipt_urls.length})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        ✕ Receipt
                      </span>
                    )}
                    {form.eob_urls.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                        <Check className="h-3 w-3" /> EOB ({form.eob_urls.length})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        ✕ EOB
                      </span>
                    )}
                    {form.invoice_urls.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" /> Invoice ({form.invoice_urls.length})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        ✕ Invoice
                      </span>
                    )}
                    {form.credit_card_statement_urls.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                        <Check className="h-3 w-3" /> CC Stmt ({form.credit_card_statement_urls.length})
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
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">N &mdash; Not yet reimbursed (let HSA grow! 📈)</SelectItem>
                      <SelectItem value="yes">Y &mdash; Already reimbursed from account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.reimbursed && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
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
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-6 pb-8">
          <div>
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={handleBack} className="text-[13px] text-gray-500 h-9">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" asChild className="text-[13px] text-gray-500 h-9">
                <Link href="/dashboard">Cancel</Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Step dots for mobile */}
            <div className="flex gap-1.5 mr-2 sm:hidden">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`h-1.5 w-1.5 rounded-full ${
                    step >= s.id ? "bg-[#059669]" : "bg-[#E2E8F0]"
                  }`}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-9 text-[13px]"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="h-9 text-[13px]"
              >
                {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {isEditing ? "Update Expense" : "Save Expense"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
