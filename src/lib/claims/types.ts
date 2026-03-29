import type { Expense, Profile } from "@/lib/types";

export type SubmissionTier = "api" | "email" | "fax" | "portal";

export type ClaimStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "approved"
  | "denied"
  | "reimbursed";

export interface HsaAdministrator {
  id: string;
  name: string;
  submission_tier: SubmissionTier;
  fax_number: string | null;
  email_address: string | null;
  portal_url: string | null;
  api_base_url: string | null;
  form_template_id: string | null;
  mailing_address: string | null;
  market_share_pct: number | null;
  logo_url: string | null;
  active: boolean;
}

export interface Claim {
  id: string;
  user_id: string;
  expense_id: string;
  administrator_id: string;
  submission_tier: SubmissionTier;
  status: ClaimStatus;
  submitted_at: string | null;
  submitted_via: string | null;
  external_claim_id: string | null;
  fax_confirmation_id: string | null;
  email_message_id: string | null;
  form_data: Record<string, unknown>;
  document_urls: string[];
  generated_pdf_url: string | null;
  denial_reason: string | null;
  reimbursed_amount: number | null;
  reimbursed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimPayload {
  expense: Expense;
  profile: Profile;
  administrator: HsaAdministrator;
  documentUrls: string[];
}

export interface ClaimSubmissionResult {
  success: boolean;
  externalClaimId?: string;
  confirmationId?: string;
  generatedPdfUrl?: string;
  portalUrl?: string;
  error?: string;
}

export interface ClaimAdapter {
  tier: SubmissionTier;
  submit(payload: ClaimPayload): Promise<ClaimSubmissionResult>;
}
