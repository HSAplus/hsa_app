"use client";

import { useState } from "react";
import type { Profile, PatientRelationship } from "@/lib/types";
import { completeOnboarding, addDependent } from "@/app/dashboard/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  PartyPopper,
  Users,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface OnboardingDialogProps {
  profile: Profile | null;
  onComplete: () => void;
}

type Step = 1 | 2 | 3;

interface PendingDependent {
  tempId: string;
  first_name: string;
  last_name: string;
  relationship: Exclude<PatientRelationship, "self">;
  date_of_birth: string;
}

const RELATIONSHIP_LABELS: Record<Exclude<PatientRelationship, "self">, string> = {
  spouse: "Spouse",
  dependent_child: "Dependent Child",
  domestic_partner: "Domestic Partner",
};

const FEDERAL_TAX_BRACKETS = [
  "10", "12", "22", "24", "32", "35", "37",
];

export function OnboardingDialog({ profile, onComplete }: OnboardingDialogProps) {
  const shouldShow = profile && !profile.onboarding_completed;

  const [open, setOpen] = useState(!!shouldShow);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Personal Info
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [middleName, setMiddleName] = useState(profile?.middle_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || "");

  // Step 2 — Dependents
  const [dependents, setDependents] = useState<PendingDependent[]>([]);
  const [showDepForm, setShowDepForm] = useState(false);
  const [depFirstName, setDepFirstName] = useState("");
  const [depLastName, setDepLastName] = useState("");
  const [depRelationship, setDepRelationship] = useState<Exclude<PatientRelationship, "self">>("spouse");
  const [depDob, setDepDob] = useState("");

  // Step 3 — HSA Investment & Tax Settings
  const [hsaBalance, setHsaBalance] = useState(
    profile?.current_hsa_balance?.toString() || "0"
  );
  const [annualContribution, setAnnualContribution] = useState(
    profile?.annual_contribution?.toString() || "4150"
  );
  const [expectedReturn, setExpectedReturn] = useState(
    profile?.expected_annual_return?.toString() || "7"
  );
  const [timeHorizon, setTimeHorizon] = useState(
    profile?.time_horizon_years?.toString() || "20"
  );
  const [federalBracket, setFederalBracket] = useState(
    profile?.federal_tax_bracket?.toString() || "22"
  );
  const [stateTaxRate, setStateTaxRate] = useState(
    profile?.state_tax_rate?.toString() || "5"
  );

  if (!shouldShow) return null;

  // ── Navigation ──

  const handleNextToStep2 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    setStep(2);
  };

  const handleNextToStep3 = () => {
    setStep(3);
  };

  const handleBackToStep1 = () => setStep(1);
  const handleBackToStep2 = () => setStep(2);

  // ── Dependents helpers ──

  const resetDepForm = () => {
    setDepFirstName("");
    setDepLastName("");
    setDepRelationship("spouse");
    setDepDob("");
    setShowDepForm(false);
  };

  const handleAddDependent = () => {
    if (!depFirstName.trim() || !depLastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    setDependents((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        first_name: depFirstName.trim(),
        last_name: depLastName.trim(),
        relationship: depRelationship,
        date_of_birth: depDob,
      },
    ]);
    resetDepForm();
  };

  const handleRemoveDependent = (tempId: string) => {
    setDependents((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  // ── Finish ──

  const handleFinish = async () => {
    setSaving(true);

    // 1. Save profile info + HSA params + tax settings + mark onboarding complete
    const profileResult = await completeOnboarding({
      first_name: firstName.trim(),
      middle_name: middleName.trim(),
      last_name: lastName.trim(),
      date_of_birth: dateOfBirth || null,
      current_hsa_balance: parseFloat(hsaBalance) || 0,
      annual_contribution: parseFloat(annualContribution) || 0,
      expected_annual_return: parseFloat(expectedReturn) || 7,
      time_horizon_years: parseInt(timeHorizon, 10) || 20,
      federal_tax_bracket: parseFloat(federalBracket) || 22,
      state_tax_rate: parseFloat(stateTaxRate) || 5,
    });

    if (profileResult.error) {
      toast.error(profileResult.error);
      setSaving(false);
      return;
    }

    // 2. Save any dependents
    if (dependents.length > 0) {
      const results = await Promise.allSettled(
        dependents.map((dep) =>
          addDependent({
            first_name: dep.first_name,
            last_name: dep.last_name,
            relationship: dep.relationship,
            date_of_birth: dep.date_of_birth || null,
          })
        )
      );

      const failures = results.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && r.value.error)
      );
      if (failures.length > 0) {
        toast.error(`${failures.length} dependent(s) could not be saved`);
      }
    }

    toast.success("Welcome to HSA Plus!");
    setOpen(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-10 rounded-full transition-colors ${
                step >= s ? "bg-gradient-to-r from-[#059669] to-[#34d399]" : "bg-[#E2E8F0]"
              }`}
            />
          ))}
        </div>

        {/* ───────────── Step 1: Personal Info ───────────── */}
        {step === 1 && (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399]">
                <PartyPopper className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-lg font-semibold">Welcome to HSA Plus!</DialogTitle>
              <DialogDescription>
                Let&apos;s get your profile set up. This only takes a moment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ob-firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ob-lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ob-middleName">
                  Middle Name{" "}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="ob-middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Michael"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ob-dob">Date of Birth</Label>
                <Input
                  id="ob-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used for age-related HSA eligibility (mm/dd/yyyy)
                </p>
              </div>

              <Button
                onClick={handleNextToStep2}
                disabled={!firstName.trim() || !lastName.trim()}
                className="w-full mt-2 h-10"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* ───────────── Step 2: Dependents ───────────── */}
        {step === 2 && (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399]">
                <Users className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-lg font-semibold">Add Dependents</DialogTitle>
              <DialogDescription>
                Add family members covered under your plan. You can skip this
                and add them later in Profile Settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* List of added dependents */}
              {dependents.length > 0 && (
                <div className="space-y-2">
                  {dependents.map((dep) => (
                    <div
                      key={dep.tempId}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-bold">
                            {dep.first_name[0]}
                            {dep.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {dep.first_name} {dep.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {RELATIONSHIP_LABELS[dep.relationship]}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveDependent(dep.tempId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add dependent form (inline) */}
              {showDepForm ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="ob-depFirst" className="text-sm">First Name</Label>
                      <Input
                        id="ob-depFirst"
                        value={depFirstName}
                        onChange={(e) => setDepFirstName(e.target.value)}
                        placeholder="Jane"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ob-depLast" className="text-sm">Last Name</Label>
                      <Input
                        id="ob-depLast"
                        value={depLastName}
                        onChange={(e) => setDepLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-depRel" className="text-sm">Relationship</Label>
                    <Select
                      value={depRelationship}
                      onValueChange={(v) =>
                        setDepRelationship(v as Exclude<PatientRelationship, "self">)
                      }
                    >
                      <SelectTrigger id="ob-depRel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="dependent_child">Dependent Child</SelectItem>
                        <SelectItem value="domestic_partner">Domestic Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-depDob" className="text-sm">
                      Date of Birth{" "}
                      <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="ob-depDob"
                      type="date"
                      value={depDob}
                      onChange={(e) => setDepDob(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={resetDepForm}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      disabled={!depFirstName.trim() || !depLastName.trim()}
                      onClick={handleAddDependent}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDepForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add a Dependent
                </Button>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleBackToStep1} className="flex-1 h-10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNextToStep3}
                  className="flex-1 h-10"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ───────────── Step 3: HSA Investment & Tax Settings ───────────── */}
        {step === 3 && (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#34d399]">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-lg font-semibold">HSA Investment Settings</DialogTitle>
              <DialogDescription>
                Set your investment parameters and tax info to project HSA growth.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Current HSA Balance */}
              <div className="space-y-2">
                <Label htmlFor="ob-hsaBalance">Current HSA Balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="ob-hsaBalance"
                    type="number"
                    min="0"
                    step="100"
                    value={hsaBalance}
                    onChange={(e) => setHsaBalance(e.target.value)}
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Annual Contribution */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ob-contribution">Annual Contribution</Label>
                  <Badge variant="secondary" className="text-xs bg-[#059669]/10 text-[#059669] border border-[#059669]/20">
                    Max $8,550
                  </Badge>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="ob-contribution"
                    type="number"
                    min="0"
                    max="8550"
                    step="50"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(e.target.value)}
                    className="pl-7"
                    placeholder="4150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expected Annual Return */}
                <div className="space-y-2">
                  <Label htmlFor="ob-return">Expected Annual Return</Label>
                  <div className="relative">
                    <Input
                      id="ob-return"
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(e.target.value)}
                      className="pr-7"
                      placeholder="7"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>

                {/* Time Horizon */}
                <div className="space-y-2">
                  <Label htmlFor="ob-horizon">Time Horizon</Label>
                  <div className="relative">
                    <Input
                      id="ob-horizon"
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      value={timeHorizon}
                      onChange={(e) => setTimeHorizon(e.target.value)}
                      className="pr-9"
                      placeholder="20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">yrs</span>
                  </div>
                </div>
              </div>

              <Separator />

              <p className="text-sm font-medium text-muted-foreground">Tax Settings</p>

              <div className="grid grid-cols-2 gap-4">
                {/* Federal Tax Bracket */}
                <div className="space-y-2">
                  <Label htmlFor="ob-federal">Federal Tax Bracket</Label>
                  <Select value={federalBracket} onValueChange={setFederalBracket}>
                    <SelectTrigger id="ob-federal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEDERAL_TAX_BRACKETS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State Tax Rate */}
                <div className="space-y-2">
                  <Label htmlFor="ob-state">State Tax Rate</Label>
                  <div className="relative">
                    <Input
                      id="ob-state"
                      type="number"
                      min="0"
                      max="15"
                      step="0.1"
                      value={stateTaxRate}
                      onChange={(e) => setStateTaxRate(e.target.value)}
                      className="pr-7"
                      placeholder="5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleBackToStep2} className="flex-1 h-10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 h-10"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
