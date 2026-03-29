import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ClaimPayload } from "./types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { fontSize: 16, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  subheader: { fontSize: 12, fontWeight: "bold", marginTop: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#999", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: 180, fontWeight: "bold", color: "#333" },
  value: { flex: 1, color: "#000" },
  disclaimer: { marginTop: 30, fontSize: 8, color: "#666", lineHeight: 1.4 },
  signatureLine: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#000", width: 250, paddingTop: 4 },
  signatureLabel: { fontSize: 9, color: "#333" },
});

function ClaimFormDocument({ payload }: { payload: ClaimPayload }) {
  const { expense, profile, administrator } = payload;
  const today = new Date().toLocaleDateString("en-US");

  return createElement(Document, {},
    createElement(Page, { size: "LETTER", style: styles.page },
      createElement(Text, { style: styles.header }, "HSA Reimbursement Claim Form"),
      createElement(Text, { style: { fontSize: 10, textAlign: "center", marginBottom: 20, color: "#666" } },
        `Submitted to: ${administrator.name}`
      ),

      createElement(Text, { style: styles.subheader }, "Participant Information"),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Participant Name:"),
        createElement(Text, { style: styles.value }, `${profile.first_name} ${profile.middle_name ? profile.middle_name + " " : ""}${profile.last_name}`)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Date of Birth:"),
        createElement(Text, { style: styles.value }, profile.date_of_birth ?? "N/A")
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Account Type:"),
        createElement(Text, { style: styles.value }, expense.account_type.toUpperCase())
      ),

      createElement(Text, { style: styles.subheader }, "Expense Details"),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Description:"),
        createElement(Text, { style: styles.value }, expense.description)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Provider:"),
        createElement(Text, { style: styles.value }, expense.provider)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Patient Name:"),
        createElement(Text, { style: styles.value }, expense.patient_name)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Patient Relationship:"),
        createElement(Text, { style: styles.value }, expense.patient_relationship.replace("_", " "))
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Date of Service:"),
        createElement(Text, { style: styles.value },
          expense.date_of_service_end
            ? `${expense.date_of_service} to ${expense.date_of_service_end}`
            : expense.date_of_service
        )
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Amount Requested:"),
        createElement(Text, { style: styles.value }, `$${expense.amount.toFixed(2)}`)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Category:"),
        createElement(Text, { style: styles.value }, expense.category.replace("_", " "))
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Expense Type:"),
        createElement(Text, { style: styles.value }, expense.expense_type)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Claim Type:"),
        createElement(Text, { style: styles.value }, expense.claim_type)
      ),

      createElement(Text, { style: styles.subheader }, "Attached Documentation"),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Receipts:"),
        createElement(Text, { style: styles.value }, `${expense.receipt_urls.length} attached`)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "EOBs:"),
        createElement(Text, { style: styles.value }, `${expense.eob_urls.length} attached`)
      ),
      createElement(View, { style: styles.row },
        createElement(Text, { style: styles.label }, "Invoices:"),
        createElement(Text, { style: styles.value }, `${expense.invoice_urls.length} attached`)
      ),

      createElement(Text, { style: styles.disclaimer },
        "I certify that the expenses listed above were incurred by me or my eligible dependents for qualified medical expenses as defined under IRS Section 213(d). I understand that I am solely responsible for the tax consequences of this reimbursement and that I should retain all receipts and documentation for tax purposes."
      ),

      createElement(View, { style: styles.signatureLine },
        createElement(Text, { style: styles.signatureLabel }, `Electronically signed: ${profile.first_name} ${profile.last_name} — ${today}`)
      )
    )
  );
}

/**
 * Generate a pre-filled HSA claim form PDF from expense + profile data.
 * Returns a Buffer containing the PDF bytes.
 */
export async function generateClaimFormPdf(payload: ClaimPayload): Promise<Buffer> {
  const element = createElement(ClaimFormDocument, { payload });
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
