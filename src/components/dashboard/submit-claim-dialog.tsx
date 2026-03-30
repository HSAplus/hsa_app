"use client";

import { useState, useEffect } from "react";
import type { Expense } from "@/lib/types";
import type { HsaAdministrator } from "@/lib/claims/types";
import {
  getHsaAdministrators,
  setHsaAdministrator,
  submitClaimAction,
} from "@/app/dashboard/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  FileText,
  Send,
  Download,
  ExternalLink,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { isAuditReady } from "@/lib/types";
import { UpgradeBlock } from "@/components/ui/upgrade-badge";

const tierLabel: Record<string, string> = {
  api: "Direct API submission",
  email: "Auto-email",
  fax: "Auto-fax (HIPAA)",
  portal: "Manual upload",
};

interface SubmitClaimDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedAdminId: string | null;
  onSubmitted: () => void;
  isPlus?: boolean;
}

export function SubmitClaimDialog({
  expense,
  open,
  onOpenChange,
  savedAdminId,
  onSubmitted,
  isPlus = false,
}: SubmitClaimDialogProps) {
  const [administrators, setAdministrators] = useState<HsaAdministrator[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(savedAdminId);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"select-admin" | "confirm">(
    savedAdminId ? "confirm" : "select-admin"
  );
  const [portalResult, setPortalResult] = useState<{
    pdfUrl: string;
    portalUrl: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      getHsaAdministrators().then(setAdministrators);
      setSelectedAdminId(savedAdminId);
      setStep(savedAdminId ? "confirm" : "select-admin");
      setPortalResult(null);
    }
  }, [open, savedAdminId]);

  const selectedAdmin = administrators.find((a) => a.id === selectedAdminId);

  const handleSelectAdmin = async (adminId: string) => {
    setSelectedAdminId(adminId);
    await setHsaAdministrator(adminId);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!expense || !selectedAdminId) return;

    setSubmitting(true);
    try {
      const result = await submitClaimAction(expense.id);

      if (result.success) {
        if (result.generatedPdfUrl && result.portalUrl) {
          setPortalResult({
            pdfUrl: result.generatedPdfUrl,
            portalUrl: result.portalUrl,
          });
          toast.success("Claim form generated. Download and upload to your portal.");
        } else {
          toast.success("Claim submitted successfully!");
          onOpenChange(false);
          onSubmitted();
        }
      } else {
        toast.error(result.error ?? "Claim submission failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!expense) return null;

  const auditReady = isAuditReady(expense);
  const filteredAdmins = administrators.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {portalResult ? "Download & Upload" : step === "select-admin" ? "Select HSA Administrator" : "Submit HSA Claim"}
          </DialogTitle>
        </DialogHeader>

        {!isPlus && (
          <div className="py-4">
            <UpgradeBlock
              feature="Automated claim submission"
              description="Submit reimbursement claims via API, email, fax, or portal with pre-filled forms"
            />
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}

        {isPlus && portalResult && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#64748B]">
              Your claim form has been generated. Download it and upload to your administrator&apos;s portal.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href={portalResult.pdfUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Claim Form
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={portalResult.portalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open {selectedAdmin?.name} Portal
                </a>
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  onOpenChange(false);
                  onSubmitted();
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}

        {isPlus && !portalResult && step === "select-admin" && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-[#64748B]">
              Who is your HSA administrator? This is the company that manages your HSA account.
            </p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
              <Input
                placeholder="Search administrators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredAdmins.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => handleSelectAdmin(admin.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F8FAFC] text-left transition-colors"
                >
                  <span className="text-sm font-medium text-[#0C1220]">{admin.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {tierLabel[admin.submission_tier]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {isPlus && !portalResult && step === "confirm" && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-[#E2E8F0] p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[#64748B]">Expense</span>
                <span className="text-sm font-medium text-[#0C1220]">{expense.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#64748B]">Amount</span>
                <span className="text-sm font-medium tabular-nums font-mono">${expense.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#64748B]">Date</span>
                <span className="text-sm text-[#0C1220]">{expense.date_of_service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#64748B]">Docs</span>
                <span className="text-sm">
                  {auditReady ? (
                    <span className="text-[#059669] flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Missing
                    </span>
                  )}
                </span>
              </div>
            </div>

            {selectedAdmin && (
              <div className="rounded-lg border border-[#E2E8F0] p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">Administrator</span>
                  <span className="text-sm font-medium text-[#0C1220]">{selectedAdmin.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">Method</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {tierLabel[selectedAdmin.submission_tier]}
                  </Badge>
                </div>
                <button
                  onClick={() => setStep("select-admin")}
                  className="text-xs text-[#059669] hover:underline"
                >
                  Change administrator
                </button>
              </div>
            )}

            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              By submitting, you confirm this is a qualified medical expense under IRS Section 213(d)
              and you have retained documentation for audit purposes.
            </p>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !auditReady}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : selectedAdmin?.submission_tier === "portal" ? (
                  <FileText className="mr-2 h-4 w-4" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {selectedAdmin?.submission_tier === "portal" ? "Generate Form" : "Submit Claim"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
