"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Play, Repeat, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ExpenseTemplate, ExpenseTemplateFormData, TemplateFrequency, AccountType, ExpenseCategory, PatientRelationship } from "@/lib/types";
import { getExpenseTemplates, addExpenseTemplate, updateExpenseTemplate, deleteExpenseTemplate } from "@/app/dashboard/actions";
import { formatCurrency } from "@/lib/hsa-constants";

const frequencyLabels: Record<TemplateFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
  as_needed: "As needed",
};

const categoryLabels: Record<ExpenseCategory, string> = {
  medical: "Medical",
  dental: "Dental",
  vision: "Vision",
  prescription: "Prescription",
  mental_health: "Mental Health",
  hearing: "Hearing",
  preventive_care: "Preventive",
  other: "Other",
};

export function ExpenseTemplates() {
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientRelationship, setPatientRelationship] = useState<PatientRelationship>("self");
  const [accountType, setAccountType] = useState<AccountType>("hsa");
  const [category, setCategory] = useState<ExpenseCategory>("medical");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [frequency, setFrequency] = useState<TemplateFrequency>("monthly");

  useEffect(() => {
    getExpenseTemplates().then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setAmount("");
    setProvider("");
    setPatientName("");
    setPatientRelationship("self");
    setAccountType("hsa");
    setCategory("medical");
    setPaymentMethod("credit_card");
    setFrequency("monthly");
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (t: ExpenseTemplate) => {
    setEditing(t);
    setName(t.name);
    setDescription(t.description);
    setAmount(t.amount.toString());
    setProvider(t.provider);
    setPatientName(t.patient_name);
    setPatientRelationship(t.patient_relationship);
    setAccountType(t.account_type);
    setCategory(t.category);
    setPaymentMethod(t.payment_method);
    setFrequency(t.frequency);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setSaving(true);
    const formData: ExpenseTemplateFormData = {
      name: name.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      provider: provider.trim(),
      patient_name: patientName.trim(),
      patient_relationship: patientRelationship,
      account_type: accountType,
      category,
      expense_type: "",
      payment_method: paymentMethod,
      frequency,
    };

    if (editing) {
      const result = await updateExpenseTemplate(editing.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.template) {
        setTemplates((prev) => prev.map((t) => (t.id === editing.id ? result.template! : t)));
        toast.success("Template updated");
        setDialogOpen(false);
      }
    } else {
      const result = await addExpenseTemplate(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.template) {
        setTemplates((prev) => [...prev, result.template!].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Template created");
        setDialogOpen(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const result = await deleteExpenseTemplate(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <div className="h-5 w-48 animate-pulse rounded bg-[#F1F5F9] mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[#F8FAFC]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-[#059669]" />
          <h2 className="text-base font-semibold text-[#0F172A] font-sans">
            Recurring Templates
          </h2>
          <span className="text-xs text-[#94A3B8] font-mono">{templates.length}</span>
        </div>
        <Button size="sm" variant="outline" onClick={openAdd} className="h-8 text-[13px]">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New
        </Button>
      </div>

      <div className="p-4">
        {templates.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-dashed border-[#E2E8F0]">
            <CalendarClock className="h-8 w-8 mx-auto mb-2 text-[#E2E8F0]" />
            <p className="text-sm text-[#64748B]">No templates yet</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Save recurring expenses as templates for quick entry
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="rounded-lg p-2 bg-[#F8FAFC] shrink-0">
                    <Repeat className="h-3.5 w-3.5 text-[#059669]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{t.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] shrink-0">
                        {frequencyLabels[t.frequency]}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] truncate">
                      {t.provider && `${t.provider} · `}
                      {categoryLabels[t.category]} · {t.account_type.toUpperCase()}
                    </p>
                  </div>
                  <p className="text-sm font-mono font-semibold text-[#0F172A] shrink-0">
                    {formatCurrency(t.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-[#059669] hover:text-[#047857]" asChild>
                    <Link href={`/dashboard/expenses/new?template=${t.id}`}>
                      <Play className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-[#94A3B8] hover:text-[#64748B]" onClick={() => openEdit(t)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-[#94A3B8] hover:text-red-500"
                    disabled={deleting === t.id}
                    onClick={() => handleDelete(t.id)}
                  >
                    {deleting === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Template Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-sans">
              {editing ? "Edit template" : "New template"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Update the recurring expense template." : "Create a template for a recurring expense."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px]">Template name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Monthly prescription" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as TemplateFrequency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(frequencyLabels) as [TemplateFrequency, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px]">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">$</span>
                  <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-7" placeholder="25.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Provider</Label>
                <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="CVS Pharmacy" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Monthly Rx refill" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px]">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(categoryLabels) as [ExpenseCategory, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Account</Label>
                <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hsa">HSA</SelectItem>
                    <SelectItem value="lpfsa">LPFSA</SelectItem>
                    <SelectItem value="hcfsa">HCFSA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Patient</Label>
                <Select value={patientRelationship} onValueChange={(v) => setPatientRelationship(v as PatientRelationship)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="dependent_child">Child</SelectItem>
                    <SelectItem value="domestic_partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-9 text-[13px]">
              Cancel
            </Button>
            <Button disabled={saving} onClick={handleSave} className="h-9 text-[13px]">
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
