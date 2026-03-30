"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";

export default function VerifyMfaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.[0];
      if (totp) {
        setFactorId(totp.id);
      } else {
        router.replace("/dashboard");
      }
    });
  }, [supabase, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;

    setVerifying(true);
    setError("");

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setError(challengeError.message);
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError("Invalid code. Please try again.");
      setCode("");
      setVerifying(false);
      return;
    }

    router.replace("/dashboard");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F172A] relative overflow-hidden items-end p-12">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#059669]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34d399]/8 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Image src="/logo.png" alt="HSA Plus" width={64} height={42} className="rounded-lg mb-8 brightness-200" />
          <h2 className="text-3xl leading-tight mb-3 text-white">
            One more step to<br />
            <span className="gradient-text">secure your account.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Enter the verification code from your authenticator app to continue.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-6">
            <Image src="/logo.png" alt="HSA Plus" width={72} height={48} className="rounded-lg" />
          </div>

          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="h-6 w-6 text-[#059669]" />
            <h1 className="text-2xl tracking-tight text-[#0F172A] font-sans font-bold">
              Two-factor verification
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-[#64748B] mb-8">
            Open your authenticator app and enter the 6-digit code
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm">Verification code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-[0.3em] font-mono h-12"
                autoFocus
                autoComplete="one-time-code"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={verifying || code.length !== 6}
            >
              {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
