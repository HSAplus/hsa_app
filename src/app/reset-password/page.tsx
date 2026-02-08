import { resetPassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default async function ResetPasswordPage({
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
          Reset password
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] text-center mb-8">
          Enter your new password below
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
            <Label htmlFor="password" className="text-sm">New password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" minLength={6} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm">Confirm password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" minLength={6} required />
          </div>
          <Button formAction={resetPassword} className="w-full">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
