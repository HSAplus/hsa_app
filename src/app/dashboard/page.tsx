import type { Metadata } from "next";

// Cloudflare serves its own robots.txt with `Allow: /`, overriding
// src/app/robots.ts entirely, so a Disallow rule there never reaches a
// crawler. This meta tag is served by us and does apply.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getProfile } from "@/app/dashboard/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return <DashboardShell user={user} profile={profile} />;
}
