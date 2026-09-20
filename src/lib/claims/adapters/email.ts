import type { ClaimAdapter, ClaimPayload, ClaimSubmissionResult } from "../types";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { generateClaimFormPdf } from "../form-generator";
import { downloadDocumentBuffer } from "@/lib/storage-server";

export const emailAdapter: ClaimAdapter = {
  tier: "email",

  async submit(payload: ClaimPayload): Promise<ClaimSubmissionResult> {
    const { administrator, profile, expense } = payload;

    if (!administrator.email_address) {
      return {
        success: false,
        error: `No email address configured for ${administrator.name}`,
      };
    }

    try {
      const pdfBuffer = await generateClaimFormPdf(payload);

      const attachments: { filename: string; content: Buffer }[] = [
        {
          filename: `claim-form-${expense.id.slice(0, 8)}.pdf`,
          content: pdfBuffer,
        },
      ];

      for (const urlOrPath of payload.documentUrls) {
        try {
          const { buffer, filename } = await downloadDocumentBuffer(urlOrPath);
          attachments.push({ filename, content: buffer });
        } catch (err) {
          console.error(`Failed to download attachment ${urlOrPath}:`, err);
        }
      }

      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: administrator.email_address,
        subject: `HSA Reimbursement Claim — ${profile.first_name} ${profile.last_name} — $${expense.amount.toFixed(2)}`,
        text: [
          `HSA Reimbursement Claim Submission`,
          ``,
          `Participant: ${profile.first_name} ${profile.last_name}`,
          `Amount: $${expense.amount.toFixed(2)}`,
          `Date of Service: ${expense.date_of_service}`,
          `Provider: ${expense.provider}`,
          `Description: ${expense.description}`,
          ``,
          `Please find the claim form and supporting documentation attached.`,
        ].join("\n"),
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      });

      if (error) {
        return { success: false, error: `Email send failed: ${error.message}` };
      }

      return {
        success: true,
        confirmationId: data?.id ?? undefined,
      };
    } catch (err) {
      return { success: false, error: `Email submission failed: ${(err as Error).message}` };
    }
  },
};
