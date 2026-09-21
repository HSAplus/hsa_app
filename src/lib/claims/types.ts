import type { Expense, Profile } from "@/lib/types";

// 'self_directed' is not a submission channel — it means no claim exists.
// The largest provider by market share (Fidelity, ~24%) works this way: the
// accountholder moves money out of their own custodial account, with no
// adjudication, no documentation requirement, and no status to track. Code
// that branches on this type must handle it before assuming a Claim row.
export type SubmissionTier =
  | "api"
  | "email"
  | "fax"
  | "portal"
  | "mail"
  | "self_directed";

export type OrgType =
  | "bank"
  | "credit_union"
  | "non_bank_custodian"
  | "tpa"
  | "health_plan"
  | "investment_platform"
  | "payroll_benefits"
  | "other";

export type DocsRequired = "none" | "always" | "varies" | "over_threshold";

export interface ProviderSource {
  url: string;
  title: string;
  accessed: string;
}

export type ClaimStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "approved"
  | "denied"
  | "reimbursed";

/**
 * Columns safe to serve to the public internet. Mirrors the
 * public.hsa_providers_public view — keep the two in sync.
 */
export interface PublicProvider {
  /**
   * Internal key. Referenced by claims.administrator_id and
   * profiles.hsa_administrator_id with no ON UPDATE CASCADE, so it never
   * changes. Not the URL — use `slug` for that.
   */
  id: string;
  /** Public path segment at /hsa-providers/[slug]. */
  slug: string;
  name: string;
  legal_name: string | null;
  aliases: string[];
  /** e.g. Inspira Financial carries ["PayFlex"] — users search the old name for years. */
  former_names: string[];
  org_type: OrgType | null;
  website_url: string | null;
  portal_url: string | null;
  support_phone: string | null;
  hq_state: string | null;
  /** Holds the funds and files 1099-SA/5498-SA. */
  is_custodian: boolean;
  /** Adjudicates claims. Distinct from is_custodian; a provider may be either or both. */
  is_administrator: boolean;
  /** What this provider administers — describes the provider, not our product scope. */
  account_types: string[];
  market_share_pct: number | null;
  accounts_count: number | null;
  logo_url: string | null;
  submission_tier: SubmissionTier;
  claim_form_url: string | null;
  /** When true, stored fax/mailing routing is only a default — it is set per employer plan. */
  routing_varies_by_employer: boolean;
  docs_required: DocsRequired | null;
  /** Gates page generation; only researched rows get a page. */
  has_guide: boolean;
  guide_summary: string | null;
  guide_body: string | null;
  sources: ProviderSource[];
  last_reviewed: string | null;
  updated_at: string;
}

/**
 * The full row, including internal routing configuration. Only ever read
 * server-side on authenticated paths — never send this shape to a client.
 */
export interface HsaAdministrator extends PublicProvider {
  fax_number: string | null;
  email_address: string | null;
  api_base_url: string | null;
  form_template_id: string | null;
  mailing_address: string | null;
  submission_notes: string | null;
  /**
   * Defaults to false. Unencrypted email is not a HIPAA-compliant channel for
   * PHI, and no major administrator publishes a claims intake address that
   * accepts it, so the email adapter must check this before sending.
   */
  accepts_email_phi: boolean;
  data_source: string | null;
  active: boolean;
  created_at: string;
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
