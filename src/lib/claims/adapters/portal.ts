import type { ClaimAdapter, ClaimPayload, ClaimSubmissionResult } from "../types";
import { generateClaimFormPdf } from "../form-generator";
import { createClient } from "@/lib/supabase/server";

export const portalAdapter: ClaimAdapter = {
  tier: "portal",

  async submit(payload: ClaimPayload): Promise<ClaimSubmissionResult> {
    const { administrator, expense, profile } = payload;

    try {
      const pdfBuffer = await generateClaimFormPdf(payload);

      const supabase = await createClient();
      const filename = `${profile.id}/claims/claim-form-${expense.id.slice(0, 8)}-${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("hsa-documents")
        .upload(filename, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: `Failed to upload claim form: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage
        .from("hsa-documents")
        .getPublicUrl(filename);

      return {
        success: true,
        generatedPdfUrl: urlData.publicUrl,
        portalUrl: administrator.portal_url ?? undefined,
      };
    } catch (err) {
      return { success: false, error: `Portal form generation failed: ${(err as Error).message}` };
    }
  },
};
