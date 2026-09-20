import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not set — email features will not work.");
}

export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_placeholder_for_build"
);

// Claim submissions to HSA administrators. Deliverability is business-critical
// here — a claim filtered to spam is money the user doesn't get reimbursed — so
// this sends from a domain that never carries bulk mail.
export const EMAIL_FROM_CLAIMS =
  process.env.RESEND_FROM_CLAIMS ?? "HSA Plus Claims <claims@mail.hsa.plus>";

// Periodic digests to our own users. Spam complaints are an expected cost of
// bulk mail, which is exactly why this must not share a sending domain with
// claim submissions.
export const EMAIL_FROM_DIGEST =
  process.env.RESEND_FROM_DIGEST ?? "HSA Plus <digest@news.hsa.plus>";
