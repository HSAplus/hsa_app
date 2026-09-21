import type { Metadata } from "next";

// Cloudflare serves its own robots.txt with `Allow: /`, overriding
// src/app/robots.ts entirely, so a Disallow rule there never reaches a
// crawler. This meta tag is served by us and does apply.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { forgotPassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-surface-lg">
        <div className="flex justify-center mb-6">
          <Logo size={48} />
        </div>
        <h1 className="text-2xl tracking-tight text-foreground text-center font-sans font-bold">
          Forgot password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-center mb-8">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {params.error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="mb-4 rounded-lg bg-[#059669]/5 dark:bg-[#059669]/10 border border-[#059669]/20 px-4 py-3 text-sm text-[#059669] dark:text-[#34d399]">
            {params.message}
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
          </div>
          <Button formAction={forgotPassword} className="w-full">
            Send reset link
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
