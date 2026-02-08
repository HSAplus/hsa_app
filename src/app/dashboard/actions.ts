"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Expense, ExpenseFormData, DashboardStats, Profile, Dependent } from "@/lib/types";
import { isAuditReady, getRetentionStatus, calculateExpectedReturn } from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile;
}

export async function completeOnboarding(data: {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string | null;
  current_hsa_balance: number;
  annual_contribution: number;
  expected_annual_return: number;
  time_horizon_years: number;
  federal_tax_bracket: number;
  state_tax_rate: number;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      current_hsa_balance: data.current_hsa_balance,
      annual_contribution: data.annual_contribution,
      expected_annual_return: data.expected_annual_return,
      time_horizon_years: data.time_horizon_years,
      federal_tax_bracket: data.federal_tax_bracket,
      state_tax_rate: data.state_tax_rate,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error completing onboarding:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function getDependents(): Promise<Dependent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("dependents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching dependents:", error);
    return [];
  }

  return data as Dependent[];
}

export async function addDependent(dependent: {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  relationship: string;
}): Promise<{ error?: string; dependent?: Dependent }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase.from("dependents").insert({
    user_id: user.id,
    ...dependent,
  }).select().single();

  if (error) {
    console.error("Error adding dependent:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { dependent: data as Dependent };
}

export async function updateDependent(
  id: string,
  dependent: {
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    relationship: string;
  }
): Promise<{ error?: string; dependent?: Dependent }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("dependents")
    .update({ ...dependent, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating dependent:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { dependent: data as Dependent };
}

export async function deleteDependent(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("dependents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting dependent:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return {};
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching expense:", error);
    return null;
  }

  return data as Expense;
}

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
  const [expenses, profile] = await Promise.all([getExpenses(), getProfile()]);

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

  // Expected return: projected HSA growth if pending amounts stay invested
  const annualReturn = profile?.expected_annual_return ?? 7;
  const timeHorizonYears = profile?.time_horizon_years ?? 20;
  const { projectedValue, extraGrowth } = calculateExpectedReturn(
    expenses,
    annualReturn,
    timeHorizonYears,
  );

  return {
    currentHsaBalance: profile?.current_hsa_balance ?? 0,
    totalExpenses,
    totalReimbursed,
    pendingReimbursement,
    expenseCount: expenses.length,
    byAccount,
    auditReadiness,
    retentionAlerts,
    expectedReturn: {
      projectedValue,
      extraGrowth,
      annualReturn,
      timeHorizonYears,
    },
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

// ────────────────────────────────────────────────
// Expense Templates
// ────────────────────────────────────────────────

export async function getExpenseTemplates() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("expense_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    console.error("Error fetching templates:", error);
    return [];
  }

  return (data ?? []) as import("@/lib/types").ExpenseTemplate[];
}

export async function addExpenseTemplate(
  templateData: import("@/lib/types").ExpenseTemplateFormData
): Promise<{ error?: string; template?: import("@/lib/types").ExpenseTemplate }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("expense_templates")
    .insert({ user_id: user.id, ...templateData })
    .select()
    .single();

  if (error) {
    console.error("Error adding template:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { template: data as import("@/lib/types").ExpenseTemplate };
}

export async function updateExpenseTemplate(
  id: string,
  templateData: Partial<import("@/lib/types").ExpenseTemplateFormData>
): Promise<{ error?: string; template?: import("@/lib/types").ExpenseTemplate }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("expense_templates")
    .update({ ...templateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating template:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { template: data as import("@/lib/types").ExpenseTemplate };
}

export async function deleteExpenseTemplate(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("expense_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting template:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function getExpenseTemplateById(
  id: string
): Promise<import("@/lib/types").ExpenseTemplate | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("expense_templates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching template:", error);
    return null;
  }

  return data as import("@/lib/types").ExpenseTemplate;
}

// ────────────────────────────────────────────────
// Plaid HSA Integration
// ────────────────────────────────────────────────

export async function createPlaidLinkToken(): Promise<{ linkToken?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  try {
    const { createLinkToken } = await import("@/lib/plaid");
    const linkToken = await createLinkToken(user.id);
    return { linkToken };
  } catch (err) {
    console.error("Error creating link token:", err);
    return { error: "Failed to initialize connection. Check Plaid credentials." };
  }
}

export async function connectHsaAccount(
  publicToken: string,
  metadata: { institution?: { name?: string; institution_id?: string }; account?: { id?: string; name?: string } }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  try {
    const { exchangePublicToken, getBalance } = await import("@/lib/plaid");
    const { accessToken, itemId } = await exchangePublicToken(publicToken);

    const accountId = metadata.account?.id ?? null;
    const balance = await getBalance(accessToken, accountId);

    // Upsert connection (one per user)
    const { error: connError } = await supabase
      .from("hsa_connections")
      .upsert(
        {
          user_id: user.id,
          plaid_item_id: itemId,
          plaid_access_token: accessToken,
          institution_name: metadata.institution?.name ?? "",
          institution_id: metadata.institution?.institution_id ?? "",
          account_id: accountId,
          account_name: metadata.account?.name ?? null,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (connError) {
      console.error("Error saving connection:", connError);
      return { error: connError.message };
    }

    // Update profile balance
    await supabase
      .from("profiles")
      .update({
        current_hsa_balance: balance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    console.error("Error connecting HSA:", err);
    return { error: "Failed to connect account" };
  }
}

export async function syncHsaBalance(): Promise<{ balance?: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: conn } = await supabase
    .from("hsa_connections")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!conn) return { error: "No HSA connection found" };

  try {
    const { getBalance } = await import("@/lib/plaid");
    const balance = await getBalance(conn.plaid_access_token, conn.account_id);

    await supabase
      .from("hsa_connections")
      .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", conn.id);

    await supabase
      .from("profiles")
      .update({ current_hsa_balance: balance, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    revalidatePath("/dashboard");
    return { balance };
  } catch (err) {
    console.error("Error syncing balance:", err);
    return { error: "Failed to sync balance" };
  }
}

export async function disconnectHsaAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: conn } = await supabase
    .from("hsa_connections")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!conn) return { error: "No HSA connection found" };

  try {
    const { removeItem } = await import("@/lib/plaid");
    await removeItem(conn.plaid_access_token);
  } catch {
    // If Plaid removal fails, still remove from our DB
  }

  const { error } = await supabase
    .from("hsa_connections")
    .delete()
    .eq("id", conn.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function getHsaConnection(): Promise<import("@/lib/types").HsaConnection | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("hsa_connections")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (data as import("@/lib/types").HsaConnection) ?? null;
}
