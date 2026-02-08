import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      {/* Left brand panel (inverted) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F172A] relative overflow-hidden items-end p-12">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#059669]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34d399]/8 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Image src="/logo.png" alt="HSA Plus" width={64} height={42} className="rounded-lg mb-8 brightness-200" />
          <h2 className="text-3xl leading-tight mb-3 text-white">
            Start building<br />
            <span className="gradient-text">tax-free wealth.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Set up in minutes with guided onboarding. Track expenses, manage dependents, and project your HSA growth.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-6">
            <Image src="/logo.png" alt="HSA Plus" width={72} height={48} className="rounded-lg" />
          </div>
          <h1 className="text-2xl tracking-tight text-[#0F172A] font-sans font-bold">
            Create an account
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B] mb-8">
            Start tracking your HSA expenses
          </p>

          {params.error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {params.error}
            </div>
          )}
          {params.message && (
            <div className="mb-4 rounded-lg bg-[#059669]/5 border border-[#059669]/20 px-4 py-3 text-sm text-[#059669]">
              {params.message}
            </div>
          )}

          <div className="space-y-4">
            <GoogleSignInButton />

            <div className="relative my-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAFAFA] px-3 text-xs text-[#94A3B8]">
                or
              </span>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">First name</Label>
                  <Input id="firstName" name="firstName" type="text" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">Last name</Label>
                  <Input id="lastName" name="lastName" type="text" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" minLength={6} required />
              </div>
              <Button formAction={signup} className="w-full">
                Create account
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#059669] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
