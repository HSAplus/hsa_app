"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Expense, ExpenseFormData, DashboardStats } from "@/lib/types";
import { isAuditReady, getRetentionStatus } from "@/lib/types";

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date_of_service", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }

  return data as Expense[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const expenses = await getExpenses();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursed = expenses
    .filter((e) => e.reimbursed)
    .reduce((sum, e) => sum + (e.reimbursed_amount ?? e.amount), 0);
  const pendingReimbursement = totalExpenses - totalReimbursed;

  const byAccount = {
    hsa: expenses.filter((e) => e.account_type === "hsa").reduce((sum, e) => sum + e.amount, 0),
    lpfsa: expenses.filter((e) => e.account_type === "lpfsa").reduce((sum, e) => sum + e.amount, 0),
    hcfsa: expenses.filter((e) => e.account_type === "hcfsa").reduce((sum, e) => sum + e.amount, 0),
  };

  // IRS audit readiness (per HRMorning: 20% penalty + income tax on unproven purchases)
  const auditReadyCount = expenses.filter((e) => isAuditReady(e)).length;
  const auditReadiness = {
    total: expenses.length,
    ready: auditReadyCount,
    missing: expenses.length - auditReadyCount,
  };

  // Retention alerts: expenses approaching or past the 7-year IRS retention window
  const retentionAlerts = expenses.filter((e) => {
    const taxYear = e.tax_year ?? new Date(e.date_of_service).getFullYear();
    const status = getRetentionStatus(taxYear);
    return status === "warning" || status === "critical";
  }).length;

  return {
    totalExpenses,
    totalReimbursed,
    pendingReimbursement,
    expenseCount: expenses.length,
    byAccount,
    auditReadiness,
    retentionAlerts,
  };
}

export async function addExpense(formData: ExpenseFormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    ...formData,
  });

  if (error) {
    console.error("Error adding expense:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function updateExpense(
  id: string,
  formData: ExpenseFormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("expenses")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating expense:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting expense:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function markAsReimbursed(
  id: string,
  reimbursedAmount: number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("expenses")
    .update({
      reimbursed: true,
      reimbursed_date: new Date().toISOString().split("T")[0],
      reimbursed_amount: reimbursedAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error marking as reimbursed:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function uploadFile(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string;

  if (!file) return { error: "No file provided" };

  const fileExt = file.name.split(".").pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50);
  const fileName = `${user.id}/${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from("hsa-documents")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading file:", error);
    return { error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("hsa-documents").getPublicUrl(fileName);

  return { url: publicUrl };
}

export async function deleteFile(
  fileUrl: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  try {
    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(/\/object\/public\/hsa-documents\/(.+)/);
    if (!pathMatch) return { error: "Invalid file URL" };

    const filePath = pathMatch[1];

    // Verify the file belongs to this user
    if (!filePath.startsWith(user.id)) {
      return { error: "Unauthorized" };
    }

    const { error } = await supabase.storage
      .from("hsa-documents")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      return { error: error.message };
    }

    return {};
  } catch {
    return { error: "Failed to delete file" };
  }
}
