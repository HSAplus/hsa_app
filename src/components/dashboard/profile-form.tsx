"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile, Dependent, PatientRelationship } from "@/lib/types";
import { getContributionLimit, isCatchUpEligible, type CoverageType } from "@/lib/hsa-constants";
import { HsaConnectionWidget } from "./hsa-connection";
import { updateProfile } from "@/app/auth/actions";
import { addDependent, updateDependent, deleteDependent } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Shield, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface ProfileFormProps {
  user: User;
  profile: Profile | null;
  dependents: Dependent[];
}

export function ProfileForm({ user, profile, dependents: initialDependents }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [middleName, setMiddleName] = useState(profile?.middle_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || "");
  const [hsaBalance, setHsaBalance] = useState(
    profile?.current_hsa_balance?.toString() || "0"
  );
  const [annualContribution, setAnnualContribution] = useState(
    profile?.annual_contribution?.toString() || "4150"
  );
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState(
    profile?.expected_annual_return?.toString() || "7"
  );
  const [timeHorizonYears, setTimeHorizonYears] = useState(
    profile?.time_horizon_years?.toString() || "20"
  );
  const [federalBracket, setFederalBracket] = useState(
    profile?.federal_tax_bracket?.toString() || "22"
  );
  const [stateTaxRate, setStateTaxRate] = useState(
    profile?.state_tax_rate?.toString() || "5"
  );
  const [coverageType, setCoverageType] = useState<CoverageType>(
    profile?.coverage_type || "individual"
  );
  const [increasePercent, setIncreasePercent] = useState(
    profile?.contribution_increase_rate ?? 0
  );
  const [horizonMode, setHorizonMode] = useState<"years" | "date">("years");
  const [targetDate, setTargetDate] = useState("");
  const [dependentsList, setDependentsList] = useState<Dependent[]>(initialDependents);
  const [depDialogOpen, setDepDialogOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const [depFirstName, setDepFirstName] = useState("");
  const [depLastName, setDepLastName] = useState("");
  const [depDob, setDepDob] = useState("");
  const [depRelationship, setDepRelationship] = useState<Exclude<PatientRelationship, "self">>("spouse");
  const [depSaving, setDepSaving] = useState(false);
  const [depDeleting, setDepDeleting] = useState<string | null>(null);

  const displayName = `${firstName} ${lastName}`.trim();

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : user.email
      ? user.email.substring(0, 2).toUpperCase()
      : "U";

  const isOAuthUser = user.app_metadata?.provider !== "email";

  const relationshipLabels: Record<Exclude<PatientRelationship, "self">, string> = {
    spouse: "Spouse",
    dependent_child: "Dependent Child",
    domestic_partner: "Domestic Partner",
  };

  const openAddDependent = () => {
    setEditingDependent(null);
    setDepFirstName("");
    setDepLastName("");
    setDepDob("");
    setDepRelationship("spouse");
    setDepDialogOpen(true);
  };

  const openEditDependent = (dep: Dependent) => {
    setEditingDependent(dep);
    setDepFirstName(dep.first_name);
    setDepLastName(dep.last_name);
    setDepDob(dep.date_of_birth || "");
    setDepRelationship(dep.relationship);
    setDepDialogOpen(true);
  };

  const handleSaveDependent = async () => {
    if (!depFirstName.trim() || !depLastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setDepSaving(true);
    const depData = {
      first_name: depFirstName.trim(),
      last_name: depLastName.trim(),
      date_of_birth: depDob || null,
      relationship: depRelationship,
    };

    try {
      if (editingDependent) {
        const result = await updateDependent(editingDependent.id, depData);
        if (result.error) {
          toast.error(result.error);
        } else if (result.dependent) {
          setDependentsList((prev) =>
            prev.map((d) => (d.id === editingDependent.id ? result.dependent! : d))
          );
          toast.success("Dependent updated");
          setDepDialogOpen(false);
        }
      } else {
        const result = await addDependent(depData);
        if (result.error) {
          toast.error(result.error);
        } else if (result.dependent) {
          setDependentsList((prev) =>
            [...prev, result.dependent!].sort((a, b) =>
              a.first_name.localeCompare(b.first_name)
            )
          );
          toast.success("Dependent added");
          setDepDialogOpen(false);
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
    setDepSaving(false);
  };

  const handleDeleteDependent = async (id: string) => {
    setDepDeleting(id);
    try {
      const result = await deleteDependent(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setDependentsList((prev) => prev.filter((d) => d.id !== id));
        toast.success("Dependent removed");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setDepDeleting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.set("firstName", firstName);
    formData.set("middleName", middleName);
    formData.set("lastName", lastName);
    formData.set("dateOfBirth", dateOfBirth);
    formData.set("hsaBalance", hsaBalance);
    formData.set("annualContribution", annualContribution);
    formData.set("expectedAnnualReturn", expectedAnnualReturn);
    formData.set("timeHorizonYears", timeHorizonYears);
    formData.set("federalBracket", federalBracket);
    formData.set("stateTaxRate", stateTaxRate);
    formData.set("coverageType", coverageType);
    formData.set("contributionIncreaseRate", increasePercent.toString());

    const result = await updateProfile(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated successfully");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
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
            <span className="text-sm font-medium text-[#64748B]">Profile</span>
          </div>

          <Button variant="ghost" size="sm" asChild className="text-[13px] text-[#64748B] h-8">
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-6 py-8 max-w-2xl">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-gradient-to-br from-[#059669] to-[#34d399] text-white text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#0F172A] font-sans">
              {displayName || "Profile Settings"}
            </h1>
            <p className="text-sm text-[#64748B]">
              {user.email}
              {isOAuthUser && (
                <span className="inline-flex items-center gap-1 ml-2 text-xs text-[#94A3B8]">
                  <Shield className="h-3 w-3" />
                  {user.app_metadata?.provider === "google" ? "Google" : user.app_metadata?.provider}
                </span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4 font-sans">Personal information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[13px] text-[#475569]">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[13px] text-[#475569]">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="middleName" className="text-[13px] text-[#475569]">
                    Middle name <span className="text-[#94A3B8]">(optional)</span>
                  </Label>
                  <Input id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Michael" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-[13px] text-[#475569]">Date of birth</Label>
                  <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-[#F1F5F9]" />

          {/* HSA Investment Settings */}
          <section>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-1 font-sans">HSA investment settings</h2>
            <p className="text-xs text-[#94A3B8] mb-4">Used to project growth from delaying reimbursement</p>
            <div className="space-y-4">
              {/* Coverage type toggle */}
              <div className="space-y-2">
                <Label className="text-[13px] text-[#475569]">Coverage type</Label>
                <div className="inline-flex rounded-lg border border-[#E2E8F0] p-0.5 bg-[#F8FAFC]">
                  {(["individual", "family"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setCoverageType(type);
                        const newMax = getContributionLimit(type, dateOfBirth);
                        if (parseFloat(annualContribution) > newMax) {
                          setAnnualContribution(newMax.toString());
                        }
                      }}
                      className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                        coverageType === type
                          ? "bg-white text-[#0F172A] shadow-sm"
                          : "text-[#94A3B8] hover:text-[#64748B]"
                      }`}
                    >
                      {type === "individual" ? "Individual" : "Family"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plaid HSA connection */}
              <HsaConnectionWidget onBalanceUpdate={(balance) => setHsaBalance(balance.toString())} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hsaBalance" className="text-[13px] text-[#475569]">Current HSA balance</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">$</span>
                    <Input id="hsaBalance" type="number" min="0" step="100" value={hsaBalance} onChange={(e) => setHsaBalance(e.target.value)} className="pl-7" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualContribution" className="text-[13px] text-[#475569]">Annual contribution</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">$</span>
                    <Input
                      id="annualContribution"
                      type="number"
                      min="0"
                      max={getContributionLimit(coverageType, dateOfBirth)}
                      step="50"
                      value={annualContribution}
                      onChange={(e) => {
                        const val = Math.min(
                          Math.max(0, parseFloat(e.target.value) || 0),
                          getContributionLimit(coverageType, dateOfBirth)
                        );
                        setAnnualContribution(val.toString());
                      }}
                      className="pl-7"
                      placeholder={coverageType === "family" ? "8750" : "4400"}
                    />
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    {new Date().getFullYear()} {coverageType} max: ${getContributionLimit(coverageType, dateOfBirth).toLocaleString()}
                    {isCatchUpEligible(dateOfBirth) && (
                      <span className="text-[#059669] font-medium"> (incl. $1,000 catch-up 55+)</span>
                    )}
                  </p>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">Annual increase</span>
                      <span className="text-[11px] font-mono font-semibold text-[#059669]">
                        +{increasePercent}% / year
                      </span>
                    </div>
                    <Slider
                      value={[increasePercent]}
                      onValueChange={([pct]) => setIncreasePercent(pct)}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                    {increasePercent > 0 && (
                      <p className="text-[11px] text-[#94A3B8]">
                        Contribution grows from ${(parseFloat(annualContribution) || 0).toLocaleString()} to ~${Math.round((parseFloat(annualContribution) || 0) * Math.pow(1 + increasePercent / 100, parseFloat(timeHorizonYears) || 1)).toLocaleString()} by year {timeHorizonYears}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedAnnualReturn" className="text-[13px] text-[#475569]">Expected annual return</Label>
                  <div className="relative">
                    <Input id="expectedAnnualReturn" type="number" step="0.5" min="0" max="30" value={expectedAnnualReturn} onChange={(e) => setExpectedAnnualReturn(e.target.value)} className="pr-7" placeholder="7" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timeHorizonYears" className="text-[13px] text-[#475569]">Time horizon</Label>
                    <div className="inline-flex rounded-md border border-[#E2E8F0] p-0.5 bg-[#F8FAFC]">
                      {(["years", "date"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setHorizonMode(mode);
                            if (mode === "years") setTargetDate("");
                          }}
                          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                            horizonMode === mode
                              ? "bg-white text-[#0F172A] shadow-sm"
                              : "text-[#94A3B8] hover:text-[#64748B]"
                          }`}
                        >
                          {mode === "years" ? "Years" : "Target date"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {horizonMode === "years" ? (
                    <div className="relative">
                      <Input id="timeHorizonYears" type="number" step="1" min="1" max="50" value={timeHorizonYears} onChange={(e) => setTimeHorizonYears(e.target.value)} className="pr-9" placeholder="20" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">yrs</span>
                    </div>
                  ) : (
                    <>
                      <Input
                        id="targetDate"
                        type="date"
                        value={targetDate}
                        min={(() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d.toISOString().split("T")[0];
                        })()}
                        max={(() => {
                          const d = new Date();
                          d.setFullYear(d.getFullYear() + 50);
                          return d.toISOString().split("T")[0];
                        })()}
                        onChange={(e) => {
                          setTargetDate(e.target.value);
                          if (e.target.value) {
                            const target = new Date(e.target.value + "T00:00:00");
                            const today = new Date();
                            const diffMs = target.getTime() - today.getTime();
                            const years = Math.max(1, Math.ceil(diffMs / (365.25 * 24 * 60 * 60 * 1000)));
                            setTimeHorizonYears(years.toString());
                          }
                        }}
                      />
                      {targetDate && (
                        <p className="text-[11px] text-[#94A3B8]">~{timeHorizonYears} years from now</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-[#F1F5F9]" />

          {/* Tax Settings */}
          <section>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4 font-sans">Tax settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="federalBracket" className="text-[13px] text-[#475569]">Federal tax bracket</Label>
                <Select value={federalBracket} onValueChange={setFederalBracket}>
                  <SelectTrigger id="federalBracket">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["10", "12", "22", "24", "32", "35", "37"].map((b) => (
                      <SelectItem key={b} value={b}>{b}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateTaxRate" className="text-[13px] text-[#475569]">State tax rate</Label>
                <div className="relative">
                  <Input id="stateTaxRate" type="number" min="0" max="15" step="0.1" value={stateTaxRate} onChange={(e) => setStateTaxRate(e.target.value)} className="pr-7" placeholder="5" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">%</span>
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-[#F1F5F9]" />

          {/* Dependents */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A] font-sans">Dependents</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Family members covered under your plan</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={openAddDependent} className="h-8 text-[13px]">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add
              </Button>
            </div>

            {dependentsList.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-[#E2E8F0]">
                <Users className="h-8 w-8 mx-auto mb-2 text-[#E2E8F0]" />
                <p className="text-sm text-[#64748B]">No dependents added</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Add family members for quick selection when filing expenses
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dependentsList.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#F1F5F9] text-[#475569] text-[11px] font-medium">
                          {dep.first_name[0]}{dep.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">
                          {dep.first_name} {dep.last_name}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {relationshipLabels[dep.relationship]}
                          {dep.date_of_birth && (
                            <> &middot; {new Date(dep.date_of_birth + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-[#94A3B8] hover:text-[#64748B]" onClick={() => openEditDependent(dep)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#94A3B8] hover:text-red-500"
                        disabled={depDeleting === dep.id}
                        onClick={() => handleDeleteDependent(dep.id)}
                      >
                        {depDeleting === dep.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Save Button */}
          <div className="flex justify-end pb-8 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="h-9 px-6 text-[13px]"
            >
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </main>

      {/* Add/Edit Dependent Dialog */}
      <Dialog open={depDialogOpen} onOpenChange={setDepDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-sans">
              {editingDependent ? "Edit dependent" : "Add dependent"}
            </DialogTitle>
            <DialogDescription>
              {editingDependent
                ? "Update the details for this dependent."
                : "Add a family member covered under your plan."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depFirstName" className="text-[13px]">First name</Label>
                <Input id="depFirstName" value={depFirstName} onChange={(e) => setDepFirstName(e.target.value)} placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depLastName" className="text-[13px]">Last name</Label>
                <Input id="depLastName" value={depLastName} onChange={(e) => setDepLastName(e.target.value)} placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depRelationship" className="text-[13px]">Relationship</Label>
              <Select value={depRelationship} onValueChange={(v) => setDepRelationship(v as Exclude<PatientRelationship, "self">)}>
                <SelectTrigger id="depRelationship">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="dependent_child">Dependent Child</SelectItem>
                  <SelectItem value="domestic_partner">Domestic Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depDob" className="text-[13px]">
                Date of birth <span className="text-[#94A3B8]">(optional)</span>
              </Label>
              <Input id="depDob" type="date" value={depDob} onChange={(e) => setDepDob(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDepDialogOpen(false)} className="h-9 text-[13px]">
              Cancel
            </Button>
            <Button
              type="button"
              disabled={depSaving}
              onClick={handleSaveDependent}
              className="h-9 text-[13px]"
            >
              {depSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {editingDependent ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
