import type { ClaimAdapter, ClaimPayload, ClaimSubmissionResult } from "../types";
import { sendFax } from "@/lib/westfax";
import { generateClaimFormPdf } from "../form-generator";

export const faxAdapter: ClaimAdapter = {
  tier: "fax",

  async submit(payload: ClaimPayload): Promise<ClaimSubmissionResult> {
    const { administrator, expense } = payload;

    if (!administrator.fax_number) {
      return {
        success: false,
        error: `No fax number configured for ${administrator.name}`,
      };
    }

    try {
      const pdfBuffer = await generateClaimFormPdf(payload);

      const pdfBuffers: { filename: string; buffer: Buffer }[] = [
        {
          filename: `claim-form-${expense.id.slice(0, 8)}.pdf`,
          buffer: pdfBuffer,
        },
      ];

      for (const url of payload.documentUrls) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const buffer = Buffer.from(await res.arrayBuffer());
            const filename = url.split("/").pop() ?? "document.pdf";
            pdfBuffers.push({ filename, buffer });
          }
        } catch {
          // Skip documents that fail to download
        }
      }

      const result = await sendFax({
        destinationNumber: administrator.fax_number,
        pdfBuffers,
        jobName: `HSA Claim — ${expense.description} — $${expense.amount.toFixed(2)}`,
      });

      if (!result.success) {
        return { success: false, error: result.error ?? "Fax send failed" };
      }

      return {
        success: true,
        confirmationId: result.faxId ?? undefined,
      };
    } catch (err) {
      return { success: false, error: `Fax submission failed: ${(err as Error).message}` };
    }
  },
};
