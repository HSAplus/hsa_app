import type { Metadata } from "next";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export const metadata: Metadata = {
  title: "Sign In | HSA Plus",
  description: "Sign in to your HSA Plus account to track expenses and manage receipts.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel (inverted) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0C1220] relative overflow-hidden items-end p-12">
        {/* Texture */}
        <div className="absolute inset-0 dot-pattern" />
        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#059669]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34d399]/8 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Image src="/logo.png" alt="HSA Plus" width={48} height={48} className="rounded-xl mb-8 aspect-square" />
          <h2 className="text-3xl leading-tight mb-3 text-white">
            Your HSA deserves<br />a{" "}
            <span className="gradient-text">smarter strategy.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Track expenses, project investment growth, and stay IRS audit-ready in one place.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-surface-lg">
          <div className="lg:hidden flex justify-center mb-6">
            <Image src="/logo.png" alt="HSA Plus" width={48} height={48} className="rounded-xl aspect-square" />
          </div>
          <h1 className="text-2xl tracking-tight text-foreground font-sans font-bold">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground mb-8">
            Sign in to your HSA Plus account
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

          <div className="space-y-4">
            <GoogleSignInButton />

            <div className="relative my-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or
              </span>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>
              <Button formAction={login} className="w-full">
                Sign in
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
