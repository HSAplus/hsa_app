import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getProfile, getDependents } from "@/app/dashboard/actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, dependents] = await Promise.all([
    getProfile(),
    getDependents(),
  ]);

  return <ProfileForm user={user} profile={profile} dependents={dependents} />;
}
