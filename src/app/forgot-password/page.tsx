import { forgotPassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="HSA Plus" width={72} height={48} className="rounded-lg" />
        </div>
        <h1 className="text-2xl tracking-tight text-[#0F172A] text-center font-sans font-bold">
          Forgot password
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] text-center mb-8">
          Enter your email and we&apos;ll send you a reset link
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

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
          </div>
          <Button formAction={forgotPassword} className="w-full">
            Send reset link
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#059669] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
