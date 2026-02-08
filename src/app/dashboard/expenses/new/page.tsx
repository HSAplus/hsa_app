import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseFormPage } from "@/components/dashboard/expense-form-page";
import { getProfile } from "@/app/dashboard/actions";

export default async function NewExpensePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return <ExpenseFormPage profile={profile} />;
}
