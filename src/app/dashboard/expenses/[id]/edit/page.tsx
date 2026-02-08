import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getExpenseById, getProfile, getDependents } from "@/app/dashboard/actions";
import { ExpenseFormPage } from "@/components/dashboard/expense-form-page";

interface EditExpensePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [expense, profile, dependents] = await Promise.all([
    getExpenseById(id),
    getProfile(),
    getDependents(),
  ]);

  if (!expense) {
    notFound();
  }

  return <ExpenseFormPage expense={expense} profile={profile} dependents={dependents} />;
}
