"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile, Dependent, PatientRelationship } from "@/lib/types";
import { updateProfile } from "@/app/auth/actions";
import { addDependent, updateDependent, deleteDependent } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, User as UserIcon, Mail, Lock, Shield, CalendarDays, Users, Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
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
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || "");
  const [email, setEmail] = useState(user.email || "");
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState(
    profile?.expected_annual_return?.toString() || "7"
  );
  const [timeHorizonYears, setTimeHorizonYears] = useState(
    profile?.time_horizon_years?.toString() || "20"
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Dependents state
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
    formData.set("lastName", lastName);
    formData.set("dateOfBirth", dateOfBirth);
    formData.set("email", email);
    formData.set("expectedAnnualReturn", expectedAnnualReturn);
    formData.set("timeHorizonYears", timeHorizonYears);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    const result = await updateProfile(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        result.emailChanged
          ? "Profile updated. Check your new email to confirm the change."
          : "Profile updated successfully"
      );
      setNewPassword("");
      setConfirmPassword("");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="HSA Plus" width={72} height={48} className="rounded-lg" />
              <span className="text-lg font-bold">HSA Plus</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Profile</span>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Avatar Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">
                  {displayName || user.email}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {isOAuthUser && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Signed in with {user.app_metadata?.provider === "google" ? "Google" : user.app_metadata?.provider}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <CardDescription>Update your name and personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date of Birth */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Date of Birth</CardTitle>
                  <CardDescription>Used for age-related eligibility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* HSA Investment Parameters */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">HSA Investment Parameters</CardTitle>
                  <CardDescription>
                    Used to project how much your HSA grows by delaying reimbursement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedAnnualReturn">Expected Annual Return (%)</Label>
                  <Input
                    id="expectedAnnualReturn"
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={expectedAnnualReturn}
                    onChange={(e) => setExpectedAnnualReturn(e.target.value)}
                    placeholder="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Average S&P 500 return is ~7-10% after inflation
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeHorizonYears">Time Horizon (years)</Label>
                  <Input
                    id="timeHorizonYears"
                    type="number"
                    step="1"
                    min="1"
                    max="50"
                    value={timeHorizonYears}
                    onChange={(e) => setTimeHorizonYears(e.target.value)}
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground">
                    How many years before you plan to reimburse from HSA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dependents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">Dependents</CardTitle>
                    <CardDescription>
                      Manage family members covered under your plan
                    </CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openAddDependent}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dependentsList.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No dependents added yet</p>
                  <p className="text-xs mt-1">
                    Add family members so you can quickly select them when filing expenses
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dependentsList.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-bold">
                            {dep.first_name[0]}{dep.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {dep.first_name} {dep.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {relationshipLabels[dep.relationship]}
                            {dep.date_of_birth && (
                              <> · Born {new Date(dep.date_of_birth + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDependent(dep)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          disabled={depDeleting === dep.id}
                          onClick={() => handleDeleteDependent(dep.id)}
                        >
                          {depDeleting === dep.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Email Address</CardTitle>
                  <CardDescription>
                    {isOAuthUser
                      ? "Your email is managed by your OAuth provider"
                      : "Change your email address"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isOAuthUser}
                />
                {!isOAuthUser && (
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll receive a confirmation email at the new address.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          {!isOAuthUser && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">Change Password</CardTitle>
                    <CardDescription>
                      Leave blank to keep your current password
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Account Info (read-only) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Account Info</CardTitle>
                  <CardDescription>Read-only account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium mt-0.5">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Sign In</p>
                  <p className="font-medium mt-0.5">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pb-8">
            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </main>

      {/* Add/Edit Dependent Dialog */}
      <Dialog open={depDialogOpen} onOpenChange={setDepDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDependent ? "Edit Dependent" : "Add Dependent"}
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
                <Label htmlFor="depFirstName">First Name</Label>
                <Input
                  id="depFirstName"
                  value={depFirstName}
                  onChange={(e) => setDepFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depLastName">Last Name</Label>
                <Input
                  id="depLastName"
                  value={depLastName}
                  onChange={(e) => setDepLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depRelationship">Relationship</Label>
              <Select
                value={depRelationship}
                onValueChange={(v) => setDepRelationship(v as Exclude<PatientRelationship, "self">)}
              >
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
              <Label htmlFor="depDob">Date of Birth (optional)</Label>
              <Input
                id="depDob"
                type="date"
                value={depDob}
                onChange={(e) => setDepDob(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDepDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={depSaving}
              onClick={handleSaveDependent}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {depSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingDependent ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
