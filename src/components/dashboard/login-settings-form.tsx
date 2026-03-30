"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { updateLoginSettings, cleanupMfaFactors } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
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

  // MFA state
  const [supabase] = useState(() => createClient());
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaLoaded, setMfaLoaded] = useState(false);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaPendingFactorId, setMfaPendingFactorId] = useState<string | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = useState("");
  const [mfaVerifying, setMfaVerifying] = useState(false);
  const [mfaDisabling, setMfaDisabling] = useState(false);

  const loadMfaFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const totp = data?.totp ?? [];
    const verified = totp.find((f) => f.status === "verified");
    setMfaFactorId(verified?.id ?? null);
    setMfaLoaded(true);
  }, [supabase]);

  useEffect(() => {
    loadMfaFactors();
  }, [loadMfaFactors]);

  const handleMfaEnroll = async () => {
    setMfaEnrolling(true);

    const { data: check } = await supabase.auth.mfa.listFactors();
    const alreadyVerified = check?.totp?.find((f) => f.status === "verified");
    if (alreadyVerified) {
      setMfaFactorId(alreadyVerified.id);
      setMfaEnrolling(false);
      toast.success("Two-factor authentication is already enabled");
      return;
    }

    // Use server action with admin privileges to remove stale factors
    await cleanupMfaFactors();

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `HSA Plus (${Date.now()})`,
    });
    if (error) {
      toast.error(error.message);
      setMfaEnrolling(false);
      return;
    }
    setMfaQrCode(data.totp.qr_code);
    setMfaSecret(data.totp.secret);
    setMfaPendingFactorId(data.id);
  };

  const handleMfaConfirmEnroll = async () => {
    if (!mfaPendingFactorId || mfaVerifyCode.length !== 6) return;

    setMfaVerifying(true);
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: mfaPendingFactorId });

    if (challengeError) {
      toast.error(challengeError.message);
      setMfaVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaPendingFactorId,
      challengeId: challenge.id,
      code: mfaVerifyCode,
    });

    if (verifyError) {
      toast.error("Invalid code. Please try again.");
      setMfaVerifyCode("");
      setMfaVerifying(false);
      return;
    }

    setMfaEnrolling(false);
    setMfaQrCode(null);
    setMfaSecret(null);
    setMfaPendingFactorId(null);
    setMfaVerifyCode("");
    setMfaVerifying(false);
    await loadMfaFactors();
    toast.success("Two-factor authentication enabled");
  };

  const handleMfaCancelEnroll = async () => {
    await cleanupMfaFactors();
    setMfaEnrolling(false);
    setMfaQrCode(null);
    setMfaSecret(null);
    setMfaPendingFactorId(null);
    setMfaVerifyCode("");
  };

  const handleMfaDisable = async () => {
    if (!mfaFactorId) return;
    setMfaDisabling(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Two-factor authentication disabled");
      setMfaFactorId(null);
    }
    setMfaDisabling(false);
  };

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
    <div className="min-h-screen bg-[#FAFAF8]">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
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
            <h1 className="text-xl font-semibold tracking-tight text-[#0C1220] font-sans">
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
            <h2 className="text-sm font-semibold text-[#0C1220] mb-1 font-sans">Email address</h2>
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
                <h2 className="text-sm font-semibold text-[#0C1220] mb-1 font-sans">Change password</h2>
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

          {/* Two-Factor Authentication */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              {mfaFactorId ? (
                <ShieldCheck className="h-4 w-4 text-[#059669]" />
              ) : (
                <ShieldOff className="h-4 w-4 text-[#94A3B8]" />
              )}
              <h2 className="text-sm font-semibold text-[#0C1220] font-sans">Two-factor authentication</h2>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4">
              {mfaFactorId
                ? "Your account is protected with an authenticator app"
                : "Add an extra layer of security with an authenticator app"}
            </p>

            {!mfaLoaded && (
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Checking status...
              </div>
            )}

            {mfaLoaded && !mfaEnrolling && !mfaFactorId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[13px] h-8"
                onClick={handleMfaEnroll}
              >
                Enable 2FA
              </Button>
            )}

            {mfaEnrolling && mfaQrCode && (
              <div className="max-w-sm space-y-4">
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                  <p className="text-[13px] text-[#475569] mb-3">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mfaQrCode}
                    alt="Scan this QR code with your authenticator app"
                    className="mx-auto w-48 h-48"
                  />
                  {mfaSecret && (
                    <div className="mt-3 text-center">
                      <p className="text-[11px] text-[#94A3B8] mb-1">Or enter this key manually:</p>
                      <code className="text-xs font-mono bg-[#F1F5F9] px-2 py-1 rounded select-all">
                        {mfaSecret}
                      </code>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="mfaCode" className="text-[13px] text-[#475569]">
                      Enter the 6-digit code from your app
                    </Label>
                    <Input
                      id="mfaCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaVerifyCode}
                      onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, ""))}
                      className="text-center text-lg tracking-[0.3em] font-mono max-w-[200px]"
                      autoComplete="one-time-code"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="text-[13px] h-8"
                      disabled={mfaVerifying || mfaVerifyCode.length !== 6}
                      onClick={handleMfaConfirmEnroll}
                    >
                      {mfaVerifying && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      Verify &amp; enable
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[13px] h-8 text-[#64748B]"
                      onClick={handleMfaCancelEnroll}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {mfaFactorId && !mfaEnrolling && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#059669]/10 px-2.5 py-1 text-xs font-medium text-[#059669]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                  Enabled
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[13px] h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleMfaDisable}
                  disabled={mfaDisabling}
                >
                  {mfaDisabling && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Disable 2FA
                </Button>
              </div>
            )}
          </section>

          <Separator className="bg-[#F1F5F9]" />

          {/* Account Info */}
          <section>
            <h2 className="text-sm font-semibold text-[#0C1220] mb-4 font-sans">Account info</h2>
            <div className="grid grid-cols-2 gap-6 text-sm max-w-sm">
              <div>
                <p className="text-xs text-[#94A3B8] mb-0.5">Created</p>
                <p className="text-[13px] font-medium text-[#0C1220]">
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
                <p className="text-[13px] font-medium text-[#0C1220]">
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
