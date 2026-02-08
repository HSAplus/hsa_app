"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { updateProfile } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, User as UserIcon, Mail, Lock, Shield, CalendarDays } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface ProfileFormProps {
  user: User;
  profile: Profile | null;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || "");
  const [email, setEmail] = useState(user.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const displayName = `${firstName} ${lastName}`.trim();

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : user.email
      ? user.email.substring(0, 2).toUpperCase()
      : "U";

  const isOAuthUser = user.app_metadata?.provider !== "email";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("dateOfBirth", dateOfBirth);
    formData.set("email", email);
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
    </div>
  );
}
