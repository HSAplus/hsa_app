export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date_of_service: string;
  date_of_service_end: string | null;
  provider: string;
  patient_name: string;
  patient_relationship: PatientRelationship;
  account_type: AccountType;
  category: ExpenseCategory;
  expense_type: string;
  reimbursed: boolean;
  reimbursed_date: string | null;
  reimbursed_amount: number | null;
  claim_type: ClaimType;
  payment_method: string;
  notes: string | null;
  eob_urls: string[];
  invoice_urls: string[];
  receipt_urls: string[];
  credit_card_statement_urls: string[];
  created_at: string;
  updated_at: string;
  // IRS audit readiness fields (per HRMorning / IRS guidance)
  tax_year: number; // The tax year this expense falls under
  audit_ready: boolean; // Whether all required documentation is attached
}

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dependent {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  relationship: Exclude<PatientRelationship, "self">;
  created_at: string;
  updated_at: string;
}

export type AccountType = "hsa" | "lpfsa" | "hcfsa";

export type PatientRelationship =
  | "self"
  | "spouse"
  | "dependent_child"
  | "domestic_partner";

export type ClaimType =
  | "new"
  | "resubmission"
  | "appeal";

export type ExpenseCategory =
  | "medical"
  | "dental"
  | "vision"
  | "prescription"
  | "mental_health"
  | "hearing"
  | "preventive_care"
  | "other";

// Based on ViaBenefits HSA Eligible Expense List
export const ELIGIBLE_EXPENSES: Record<ExpenseCategory, string[]> = {
  medical: [
    "Acupuncture",
    "Ambulance services",
    "Annual physical exam",
    "Blood pressure monitor",
    "Body scan",
    "Breast pump & supplies",
    "Chiropractic care",
    "Coinsurance / copays / deductibles",
    "COVID-19 testing & treatment",
    "Crutches",
    "Doctor office visits & co-pays",
    "Durable medical equipment (DME)",
    "Emergency room visits",
    "First aid kit / supplies",
    "Flu shots",
    "Hospital services",
    "Lab fees / blood work",
    "Masks (face masks, N95)",
    "Occupational therapy",
    "Orthopedic shoes / inserts",
    "Oxygen & oxygen equipment",
    "Physical therapy",
    "Prenatal care",
    "Prostheses",
    "Sleep apnea treatment / CPAP",
    "Speech therapy",
    "Surgery",
    "Thermometer",
    "Transplants",
    "Vaccinations",
    "Walker / wheelchair",
    "Weight loss program (if prescribed)",
    "X-rays",
  ],
  dental: [
    "Cleanings",
    "Crowns / bridges",
    "Dentures",
    "Dental X-rays",
    "Extractions",
    "Fillings",
    "Fluoride treatments",
    "Implants",
    "Oral surgery",
    "Orthodontia (braces, retainers)",
    "Root canal",
    "Sealants",
  ],
  vision: [
    "Contact lenses & solution",
    "Eye exam",
    "Eye surgery (LASIK, PRK, cataract)",
    "Eyeglasses (Rx)",
    "Reading glasses",
    "Prescription sunglasses",
  ],
  prescription: [
    "Prescription medications",
    "Insulin & diabetic supplies",
    "Birth control (Rx)",
    "Epinephrine auto-injectors (EpiPen)",
    "Hormone therapy (Rx)",
    "OTC drugs (with Rx after 2020 — or w/o Rx per CARES Act)",
    "Sunscreen SPF 15+ (OTC eligible)",
    "Menstrual care products",
  ],
  mental_health: [
    "Psychiatrist visits",
    "Psychologist / therapist visits",
    "Substance abuse treatment",
    "Inpatient mental health treatment",
    "Counseling / therapy",
  ],
  hearing: [
    "Hearing aids",
    "Hearing aid batteries",
    "Hearing exams / tests",
    "Cochlear implant",
  ],
  preventive_care: [
    "Annual wellness visit",
    "Cancer screenings (mammogram, colonoscopy, etc.)",
    "Cholesterol testing",
    "Immunizations",
    "Well-baby / well-child visits",
    "Smoking cessation programs",
  ],
  other: [
    "Guide dog / service animal expenses",
    "Home modifications for medical reasons",
    "Long-term care premiums (age-based limits)",
    "Mileage to/from medical appointments",
    "Nursing services",
    "Special education for learning disabilities",
    "Telephone / TV equipment for hearing impaired",
  ],
};

export interface ExpenseFormData {
  description: string;
  amount: number;
  date_of_service: string;
  date_of_service_end: string | null;
  provider: string;
  patient_name: string;
  patient_relationship: PatientRelationship;
  account_type: AccountType;
  category: ExpenseCategory;
  expense_type: string;
  reimbursed: boolean;
  reimbursed_date: string | null;
  reimbursed_amount: number | null;
  claim_type: ClaimType;
  payment_method: string;
  notes: string | null;
  eob_urls: string[];
  invoice_urls: string[];
  receipt_urls: string[];
  credit_card_statement_urls: string[];
  tax_year: number;
}

export interface DashboardStats {
  totalExpenses: number;
  totalReimbursed: number;
  pendingReimbursement: number;
  expenseCount: number;
  byAccount: {
    hsa: number;
    lpfsa: number;
    hcfsa: number;
  };
  auditReadiness: {
    total: number;
    ready: number;
    missing: number;
  };
  retentionAlerts: number; // Expenses approaching 7-year retention limit
}

// ViaBenefits reimbursement request form fields
export interface ReimbursementRequest {
  participant_name: string;
  participant_id: string;
  patient_name: string;
  patient_relationship: PatientRelationship;
  expense_type: string;
  provider: string;
  date_of_service_start: string;
  date_of_service_end: string;
  amount: number;
  account_type: AccountType;
  claim_type: ClaimType;
  signature_date: string;
}

// IRS Recordkeeping Rules (per HRMorning / IRS guidance)
// Source: https://www.hrmorning.com/articles/hsa-requirements-receipts-recordkeeping/
export const IRS_RULES = {
  /** Tax returns remain open for audit for 7 years after filing */
  RETENTION_YEARS: 7,
  /** Penalty rate on unproven HSA purchases during an IRS audit */
  PENALTY_RATE: 0.2,
  /** Required documentation for each HSA expense to be audit-ready */
  REQUIRED_DOCS: [
    "receipt",      // Proof of purchase / payment
    "eob",          // Explanation of Benefits (from insurance)
    "invoice",      // Invoice / bill from provider
  ] as const,
  /** Recommended documentation (not strictly required but best practice) */
  RECOMMENDED_DOCS: [
    "credit_card_statement", // Proof of out-of-pocket payment
  ] as const,
};

/**
 * Check if an expense has all required documentation for IRS audit readiness.
 * Per HRMorning: account holders face a 20% penalty + income tax on any HSA
 * purchases they cannot prove were for qualified medical expenses.
 */
export function isAuditReady(expense: Pick<Expense, "receipt_urls" | "eob_urls" | "invoice_urls">): boolean {
  // At minimum, need a receipt. EOB or invoice provides secondary proof.
  return !!(expense.receipt_urls.length > 0 && (expense.eob_urls.length > 0 || expense.invoice_urls.length > 0));
}

/**
 * Check if an expense is approaching or past the 7-year retention window.
 * Per HRMorning: "a tax return remains open for seven years after it was filed,
 * it's important to keep HSA purchase records for at least that long."
 */
export function getRetentionStatus(taxYear: number): "safe" | "warning" | "critical" {
  const currentYear = new Date().getFullYear();
  const yearsElapsed = currentYear - taxYear;
  if (yearsElapsed >= IRS_RULES.RETENTION_YEARS) return "critical";
  if (yearsElapsed >= IRS_RULES.RETENTION_YEARS - 1) return "warning";
  return "safe";
}
