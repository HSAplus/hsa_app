import type { ClaimAdapter, ClaimPayload, ClaimSubmissionResult } from "../types";

const ALEGEUS_API_URL = process.env.ALEGEUS_API_URL ?? "";
const ALEGEUS_TPA_ID = process.env.ALEGEUS_TPA_ID ?? "";
const ALEGEUS_API_KEY = process.env.ALEGEUS_API_KEY ?? "";

export const alegeusAdapter: ClaimAdapter = {
  tier: "api",

  async submit(payload: ClaimPayload): Promise<ClaimSubmissionResult> {
    if (!ALEGEUS_API_URL || !ALEGEUS_TPA_ID || !ALEGEUS_API_KEY) {
      return {
        success: false,
        error: "Alegeus API not configured. Please contact support to enable direct API submission.",
      };
    }

    const { expense } = payload;

    const body = {
      accountTypeCode: expense.account_type.toUpperCase(),
      dateOfServiceFrom: expense.date_of_service,
      dateOfServiceTo: expense.date_of_service_end ?? expense.date_of_service,
      claimAmt: expense.amount,
      note: `${expense.description} — ${expense.provider}`,
      reimbursementMode: "DirectDeposit",
    };

    try {
      const response = await fetch(
        `${ALEGEUS_API_URL}/system/Services/Transaction/${ALEGEUS_TPA_ID}/_/_/ParticipantClaim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ALEGEUS_API_KEY}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        return { success: false, error: `Alegeus API error: ${response.status} — ${text}` };
      }

      const result = await response.json();

      if (result.ErrorCode !== 0) {
        return { success: false, error: result.ErrorDescription ?? "Alegeus claim submission failed" };
      }

      return {
        success: true,
        externalClaimId: result.UniqueClaimID,
        confirmationId: result.TrackingNumber,
      };
    } catch (err) {
      return { success: false, error: `Alegeus API request failed: ${(err as Error).message}` };
    }
  },
};
