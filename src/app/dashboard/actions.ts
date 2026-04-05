"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Expense, ExpenseFormData, DashboardStats, Profile, Dependent } from "@/lib/types";
import { isAuditReady, getRetentionStatus, calculateExpectedReturn } from "@/lib/types";
import type { Claim, HsaAdministrator } from "@/lib/claims/types";
import { submitClaim as submitClaimService } from "@/lib/claims/submission";
import { getPlanLimits } from "@/lib/plans";
import type { PlanType } from "@/lib/types";

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

  const { data: profileData } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", user.id)
    .single();

  const limits = getPlanLimits((profileData?.plan_type as PlanType) ?? "free");
  if (!limits.allowDependents) {
    return { error: "Dependent management requires HSA Plus. Upgrade to track family expenses." };
  }

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

  const { data: profileData } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", user.id)
    .single();

  const limits = getPlanLimits((profileData?.plan_type as PlanType) ?? "free");

  if (limits.maxExpenses !== Infinity) {
    const { count } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= limits.maxExpenses) {
      return { error: `Free plan is limited to ${limits.maxExpenses} expenses. Upgrade to Plus for unlimited.` };
    }
  }

  if (!limits.allowMultiAccount && formData.account_type !== "hsa") {
    return { error: "LPFSA and HCFSA accounts require HSA Plus. Upgrade to unlock multi-account tracking." };
  }

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

  const { data: profileData } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", user.id)
    .single();

  const limits = getPlanLimits((profileData?.plan_type as PlanType) ?? "free");
  if (!limits.allowPlaid) {
    return { error: "Plaid HSA sync requires HSA Plus. Upgrade to auto-sync your balance." };
  }

  const plaid = await import("@/lib/plaid");
  if (!plaid.isPlaidConfigured()) {
    return { error: plaid.plaidConfigErrorMessage() };
  }

  try {
    const linkToken = await plaid.createLinkToken(user.id);
    return { linkToken };
  } catch (err) {
    console.error("Error creating link token:", err);
    const msg = plaid.getPlaidErrorMessage(err);
    return { error: msg || "Failed to initialize Plaid Link. Check credentials and Plaid dashboard settings." };
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

  const { data: profileData } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", user.id)
    .single();

  const limits = getPlanLimits((profileData?.plan_type as PlanType) ?? "free");
  if (!limits.allowPlaid) {
    return { error: "Plaid HSA sync requires HSA Plus." };
  }

  try {
    const plaid = await import("@/lib/plaid");
    const { syncPlaidForConnection } = await import("@/lib/plaid-sync");
    const { accessToken, itemId } = await plaid.exchangePublicToken(publicToken);

    const accountId = metadata.account?.id ?? null;
    const now = new Date().toISOString();

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
          last_synced_at: now,
          updated_at: now,
          sync_status: "ok",
          sync_error: null,
          transactions_cursor: null,
          last_transactions_sync_at: null,
        },
        { onConflict: "user_id" }
      );

    if (connError) {
      console.error("Error saving connection:", connError);
      return { error: connError.message };
    }

    const { data: row, error: fetchErr } = await supabase
      .from("hsa_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !row) {
      return { error: "Connected but could not load connection row." };
    }

    const syncResult = await syncPlaidForConnection(supabase, {
      id: row.id as string,
      user_id: row.user_id as string,
      plaid_access_token: row.plaid_access_token as string,
      account_id: (row.account_id as string | null) ?? null,
      transactions_cursor: (row.transactions_cursor as string | null) ?? null,
    });

    if (!syncResult.ok) {
      return { error: syncResult.error ?? "Connected but initial sync failed. Try Sync from profile." };
    }

    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    console.error("Error connecting HSA:", err);
    const plaid = await import("@/lib/plaid");
    return { error: plaid.getPlaidErrorMessage(err) || "Failed to connect account" };
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
    const { syncPlaidForConnection } = await import("@/lib/plaid-sync");
    const result = await syncPlaidForConnection(supabase, {
      id: conn.id as string,
      user_id: conn.user_id as string,
      plaid_access_token: conn.plaid_access_token as string,
      account_id: (conn.account_id as string | null) ?? null,
      transactions_cursor: (conn.transactions_cursor as string | null) ?? null,
    });

    if (!result.ok) {
      return { error: result.error ?? "Failed to sync with Plaid" };
    }

    const profile = await getProfile();
    revalidatePath("/dashboard");
    return { balance: profile?.current_hsa_balance ?? 0 };
  } catch (err) {
    console.error("Error syncing balance:", err);
    const plaid = await import("@/lib/plaid");
    return { error: plaid.getPlaidErrorMessage(err) || "Failed to sync balance" };
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
    await removeItem(conn.plaid_access_token as string);
  } catch {
    // If Plaid removal fails, still remove from our DB
  }

  await supabase.from("plaid_transactions").delete().eq("user_id", user.id);

  const { error } = await supabase
    .from("hsa_connections")
    .delete()
    .eq("id", conn.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function sendTestDigest(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const profile = await getProfile();
  if (!profile) return { error: "Profile not found" };

  const limits = getPlanLimits(profile.plan_type ?? "free");
  if (!limits.allowEmailDigest) {
    return { error: "Email digests require HSA Plus. Upgrade to receive periodic summaries." };
  }

  const expenses = await getExpenses();

  try {
    const { resend, EMAIL_FROM } = await import("@/lib/resend");
    const { DigestEmail } = await import("@/lib/email-templates/digest");
    const ReactDOMServer = await import("react-dom/server");

    const now = new Date();
    const periodLabel = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalReimbursed = expenses
      .filter((e) => e.reimbursed)
      .reduce((sum, e) => sum + (e.reimbursed_amount ?? e.amount), 0);
    const pendingReimbursement = totalExpenses - totalReimbursed;

    const annualReturn = profile.expected_annual_return ?? 7;
    const timeHorizon = profile.time_horizon_years ?? 20;

    const { calculateExpectedReturn, isAuditReady: checkAudit } = await import(
      "@/lib/types"
    );
    const { extraGrowth } = calculateExpectedReturn(
      expenses,
      annualReturn,
      timeHorizon
    );

    const auditReadyCount = expenses.filter((e) => checkAudit(e)).length;
    const auditReadyPct =
      expenses.length > 0
        ? Math.round((auditReadyCount / expenses.length) * 100)
        : 100;

    const topExpenses = expenses.slice(0, 5).map((e) => ({
      description: e.description,
      amount: e.amount,
      date: new Date(e.date_of_service + "T00:00:00").toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      ),
    }));

    const element = DigestEmail({
      firstName: profile.first_name || "there",
      periodLabel,
      hsaBalance: profile.current_hsa_balance ?? 0,
      totalExpenses,
      pendingReimbursement,
      newExpenseCount: expenses.filter(
        (e) =>
          new Date(e.created_at) >=
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      reimbursedThisPeriod: 0,
      projectedGrowth: extraGrowth,
      timeHorizon,
      annualReturn,
      auditReadyPct,
      topExpenses,
    });

    const html = ReactDOMServer.renderToStaticMarkup(element);

    await resend.emails.send({
      from: EMAIL_FROM,
      to: profile.email,
      subject: `[Test] Your HSA Plus ${periodLabel} Summary`,
      html,
    });

    return {};
  } catch (err) {
    console.error("Error sending test digest:", err);
    return { error: "Failed to send test email. Check Resend configuration." };
  }
}

export async function getHsaConnection(): Promise<import("@/lib/types").HsaConnectionPublic | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("hsa_connections")
    .select(
      "id, user_id, institution_name, institution_id, account_id, account_name, last_synced_at, last_transactions_sync_at, sync_status, sync_error, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    institution_name: (row.institution_name as string) ?? "",
    institution_id: (row.institution_id as string) ?? "",
    account_id: (row.account_id as string | null) ?? null,
    account_name: (row.account_name as string | null) ?? null,
    last_synced_at: (row.last_synced_at as string | null) ?? null,
    last_transactions_sync_at: (row.last_transactions_sync_at as string | null) ?? null,
    sync_status: (row.sync_status as import("@/lib/types").HsaConnectionPublic["sync_status"]) ?? "ok",
    sync_error: (row.sync_error as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getPlaidImportTransactions(): Promise<
  import("@/lib/types").PlaidImportTransaction[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("plaid_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(500);

  if (error) {
    console.error("getPlaidImportTransactions:", error);
    return [];
  }

  return (data ?? []) as import("@/lib/types").PlaidImportTransaction[];
}

export async function reconcilePlaidToExpense(
  plaidImportId: string,
  expenseId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: exp } = await supabase
    .from("expenses")
    .select("id")
    .eq("id", expenseId)
    .eq("user_id", user.id)
    .single();
  if (!exp) return { error: "Expense not found" };

  const { error } = await supabase
    .from("plaid_transactions")
    .update({
      reconciliation_status: "matched",
      matched_expense_id: expenseId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", plaidImportId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function setPlaidImportStatus(
  plaidImportId: string,
  status: "ignored" | "discrepancy" | "unmatched"
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const patch: Record<string, unknown> = {
    reconciliation_status: status,
    updated_at: new Date().toISOString(),
  };
  if (status === "unmatched") {
    patch.matched_expense_id = null;
  }

  const { error } = await supabase
    .from("plaid_transactions")
    .update(patch)
    .eq("id", plaidImportId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

// ── Claims ───────────────────────────────────────────

export async function getHsaAdministrators(): Promise<HsaAdministrator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hsa_administrators")
    .select("*")
    .eq("active", true)
    .order("market_share_pct", { ascending: false });

  if (error) {
    console.error("Error fetching administrators:", error);
    return [];
  }

  return data as HsaAdministrator[];
}

export async function setHsaAdministrator(
  administratorId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      hsa_administrator_id: administratorId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error setting administrator:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function submitClaimAction(
  expenseId: string
): Promise<{
  success: boolean;
  claimId?: string;
  generatedPdfUrl?: string;
  portalUrl?: string;
  error?: string;
}> {
  const profile = await getProfile();
  const limits = getPlanLimits(profile?.plan_type ?? "free");
  if (!limits.allowClaimSubmission) {
    return { success: false, error: "Automated claim submission requires HSA Plus. Upgrade to submit claims directly." };
  }

  const result = await submitClaimService(expenseId);

  if (result.success) {
    revalidatePath("/dashboard");
  }

  return result;
}

export async function getClaims(): Promise<Claim[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("claims")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching claims:", error);
    return [];
  }

  return data as Claim[];
}

export async function updateClaimStatus(
  claimId: string,
  status: string,
  details?: { denial_reason?: string; reimbursed_amount?: number; reimbursed_date?: string }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("claims")
    .update({
      status,
      ...details,
      submitted_at: status === "submitted" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", claimId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating claim:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function getExpenseCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}
