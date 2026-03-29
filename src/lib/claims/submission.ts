import { createClient } from "@/lib/supabase/server";
import type { Expense, Profile } from "@/lib/types";
import type { HsaAdministrator, ClaimSubmissionResult } from "./types";
import { alegeusAdapter } from "./adapters/alegeus";
import { emailAdapter } from "./adapters/email";
import { faxAdapter } from "./adapters/fax";
import { portalAdapter } from "./adapters/portal";
import { isAuditReady } from "@/lib/types";

export async function submitClaim(
  expenseId: string
): Promise<ClaimSubmissionResult & { claimId?: string }> {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // 2. Fetch expense
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .eq("user_id", user.id)
    .single();

  if (expenseError || !expense) {
    return { success: false, error: "Expense not found" };
  }

  const typedExpense = expense as Expense;

  // 3. Check for existing claim
  const { data: existingClaim } = await supabase
    .from("claims")
    .select("id, status")
    .eq("expense_id", expenseId)
    .single();

  if (existingClaim && existingClaim.status !== "denied") {
    return { success: false, error: "A claim has already been submitted for this expense" };
  }

  // 4. Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Profile not found" };
  }

  const typedProfile = profile as Profile & { hsa_administrator_id: string | null };

  // 5. Fetch administrator
  if (!typedProfile.hsa_administrator_id) {
    return { success: false, error: "No HSA administrator selected. Please set your administrator in your profile." };
  }

  const { data: admin, error: adminError } = await supabase
    .from("hsa_administrators")
    .select("*")
    .eq("id", typedProfile.hsa_administrator_id)
    .single();

  if (adminError || !admin) {
    return { success: false, error: "HSA administrator not found" };
  }

  const administrator = admin as HsaAdministrator;

  // 6. Validate documents
  if (!isAuditReady(typedExpense)) {
    return {
      success: false,
      error: "Missing required documentation. Please attach a receipt and an EOB or invoice before submitting.",
    };
  }

  // 7. Collect document URLs
  const documentUrls = [
    ...typedExpense.receipt_urls,
    ...typedExpense.eob_urls,
    ...typedExpense.invoice_urls,
  ];

  const payload = {
    expense: typedExpense,
    profile: typedProfile,
    administrator,
    documentUrls,
  };

  // 8. Create claim record (draft)
  const formDataSnapshot = {
    participant_name: `${typedProfile.first_name} ${typedProfile.last_name}`,
    participant_dob: typedProfile.date_of_birth,
    provider: typedExpense.provider,
    patient_name: typedExpense.patient_name,
    patient_relationship: typedExpense.patient_relationship,
    date_of_service: typedExpense.date_of_service,
    date_of_service_end: typedExpense.date_of_service_end,
    amount: typedExpense.amount,
    account_type: typedExpense.account_type,
    category: typedExpense.category,
    expense_type: typedExpense.expense_type,
    claim_type: typedExpense.claim_type,
  };

  // If a denied claim exists, delete it before inserting new one
  if (existingClaim && existingClaim.status === "denied") {
    await supabase.from("claims").delete().eq("id", existingClaim.id);
  }

  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .insert({
      user_id: user.id,
      expense_id: expenseId,
      administrator_id: administrator.id,
      submission_tier: administrator.submission_tier,
      status: "draft",
      form_data: formDataSnapshot,
      document_urls: documentUrls,
    })
    .select()
    .single();

  if (claimError || !claim) {
    return { success: false, error: `Failed to create claim record: ${claimError?.message}` };
  }

  // 9. Route to adapter
  let result: ClaimSubmissionResult;

  switch (administrator.submission_tier) {
    case "api":
      result = await alegeusAdapter.submit(payload);
      break;
    case "email":
      result = await emailAdapter.submit(payload);
      break;
    case "fax":
      result = await faxAdapter.submit(payload);
      break;
    case "portal":
      result = await portalAdapter.submit(payload);
      break;
    default:
      result = { success: false, error: `Unknown submission tier: ${administrator.submission_tier}` };
  }

  // 10. Update claim record
  if (result.success) {
    await supabase
      .from("claims")
      .update({
        status: administrator.submission_tier === "portal" ? "draft" : "submitted",
        submitted_at: administrator.submission_tier === "portal" ? null : new Date().toISOString(),
        submitted_via: administrator.submission_tier === "portal"
          ? "manual"
          : administrator.submission_tier === "api"
          ? "alegeus_api"
          : administrator.submission_tier === "email"
          ? "resend"
          : "westfax",
        external_claim_id: result.externalClaimId ?? null,
        fax_confirmation_id: administrator.submission_tier === "fax" ? (result.confirmationId ?? null) : null,
        email_message_id: administrator.submission_tier === "email" ? (result.confirmationId ?? null) : null,
        generated_pdf_url: result.generatedPdfUrl ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", claim.id);
  } else {
    // Delete the draft claim on failure
    await supabase.from("claims").delete().eq("id", claim.id);
  }

  return { ...result, claimId: result.success ? claim.id : undefined };
}
