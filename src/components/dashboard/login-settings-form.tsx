"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { updateLoginSettings } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface LoginSettingsFormProps {
  user: User;
  displayName: string;
  initials: string;
}

export function LoginSettingsForm({ user, displayName, initials }: LoginSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState(user.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isOAuthUser = user.app_metadata?.provider !== "email";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    const result = await updateLoginSettings(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        result.emailChanged
          ? "Check your new email to confirm the change."
          : "Login settings updated successfully"
      );
      setNewPassword("");
      setConfirmPassword("");
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
            <span className="text-sm font-medium text-[#64748B]">Login Settings</span>
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
              Login Settings
            </h1>
            <p className="text-sm text-[#64748B]">
              {displayName || user.email}
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
          {/* Email */}
          <section>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-1 font-sans">Email address</h2>
            <p className="text-xs text-[#94A3B8] mb-4">
              {isOAuthUser
                ? "Your email is managed by your OAuth provider"
                : "Change your email address"}
            </p>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="email" className="text-[13px] text-[#475569]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isOAuthUser}
              />
              {!isOAuthUser && (
                <p className="text-[11px] text-[#94A3B8]">
                  You&apos;ll receive a confirmation email at the new address.
                </p>
              )}
            </div>
          </section>

          {/* Change Password */}
          {!isOAuthUser && (
            <>
              <Separator className="bg-[#F1F5F9]" />
              <section>
                <h2 className="text-sm font-semibold text-[#0F172A] mb-1 font-sans">Change password</h2>
                <p className="text-xs text-[#94A3B8] mb-4">Leave blank to keep your current password</p>
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[13px] text-[#475569]">New password</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[13px] text-[#475569]">Confirm</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" minLength={6} />
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator className="bg-[#F1F5F9]" />

          {/* Account Info */}
          <section>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4 font-sans">Account info</h2>
            <div className="grid grid-cols-2 gap-6 text-sm max-w-sm">
              <div>
                <p className="text-xs text-[#94A3B8] mb-0.5">Created</p>
                <p className="text-[13px] font-medium text-[#0F172A]">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "\u2014"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-0.5">Last sign in</p>
                <p className="text-[13px] font-medium text-[#0F172A]">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "\u2014"}
                </p>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pb-8 pt-4">
            <Button
              type="submit"
              disabled={saving || isOAuthUser}
              className="h-9 px-6 text-[13px]"
            >
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
