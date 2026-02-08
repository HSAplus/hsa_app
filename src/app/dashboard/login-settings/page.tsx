import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginSettingsForm } from "@/components/dashboard/login-settings-form";
import { getProfile } from "@/app/dashboard/actions";

export default async function LoginSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "";

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : user.email
        ? user.email.substring(0, 2).toUpperCase()
        : "U";

  return (
    <LoginSettingsForm
      user={user}
      displayName={displayName}
      initials={initials}
    />
  );
}
