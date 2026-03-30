import Anthropic from "@anthropic-ai/sdk";
import { ELIGIBLE_EXPENSES, type ExpenseCategory } from "@/lib/types";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ReceiptScanResult {
  provider: string;
  amount: number;
  date_of_service: string;
  description: string;
  category: ExpenseCategory;
  expense_type: string;
  payment_method: string;
  confidence: Record<string, ConfidenceLevel>;
  raw_text: string;
  is_medical: boolean;
}

const VALID_CATEGORIES: ExpenseCategory[] = [
  "medical",
  "dental",
  "vision",
  "prescription",
  "mental_health",
  "hearing",
  "preventive_care",
  "other",
];

const VALID_PAYMENT_METHODS = [
  "credit_card",
  "debit_card",
  "hsa_debit",
  "check",
  "cash",
  "insurance",
  "other",
];

function buildExtractionPrompt(): string {
  const expenseList = Object.entries(ELIGIBLE_EXPENSES)
    .map(([cat, types]) => `  ${cat}: ${types.join(", ")}`)
    .join("\n");

  return `You are a medical receipt data extraction assistant. Analyze the provided receipt image and extract structured data for an HSA (Health Savings Account) expense tracker.

Return ONLY valid JSON with no additional text. Use this exact schema:

{
  "provider": "Business/provider name from letterhead, logo, or store name",
  "amount": 0.00,
  "date_of_service": "YYYY-MM-DD",
  "description": "Brief summary of services or items",
  "category": "one of: medical, dental, vision, prescription, mental_health, hearing, preventive_care, other",
  "expense_type": "Best match from the eligible expenses list below, or empty string if no match",
  "payment_method": "one of: credit_card, debit_card, hsa_debit, check, cash, insurance, other",
  "confidence": {
    "provider": "high|medium|low",
    "amount": "high|medium|low",
    "date_of_service": "high|medium|low",
    "description": "high|medium|low",
    "category": "high|medium|low",
    "expense_type": "high|medium|low",
    "payment_method": "high|medium|low"
  },
  "raw_text": "Full text visible on the receipt",
  "is_medical": true
}

Rules:
- "amount" must be the FINAL total (including tax if shown), not a subtotal. Use a number, not a string.
- "date_of_service" should be the transaction/service date. Fall back to print date if no service date is visible. Use YYYY-MM-DD format.
- "description" should summarize the services or items purchased. Concatenate line items if multiple.
- "category" must be exactly one of the listed values. Infer from the provider type and items.
- "expense_type" should match one of the eligible types below. Use empty string "" if nothing matches well.
- "payment_method" should be inferred from card type, last-4 digits, or payment line on the receipt.
- "is_medical" should be false if this clearly is NOT a medical/health-related expense (e.g., groceries, gas, restaurant).
- For each field in "confidence": use "high" when clearly readable, "medium" when partially visible or inferred, "low" when guessing or not found.
- If the receipt is illegible or unreadable, set all confidence values to "low" and use empty/zero defaults.

Eligible expense types by category:
${expenseList}`;
}

function resolveMediaType(
  contentType: string
): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const lower = contentType.toLowerCase();
  if (lower.includes("png")) return "image/png";
  if (lower.includes("gif")) return "image/gif";
  if (lower.includes("webp")) return "image/webp";
  return "image/jpeg";
}

async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);

  if (contentType.toLowerCase().includes("heic")) {
    const heicConvert = (await import("heic-convert")).default;
    const converted = await heicConvert({
      buffer: new Uint8Array(buffer),
      format: "JPEG",
      quality: 0.9,
    });
    buffer = Buffer.from(converted);
    return {
      base64: buffer.toString("base64"),
      mediaType: "image/jpeg",
    };
  }

  return {
    base64: buffer.toString("base64"),
    mediaType: resolveMediaType(contentType),
  };
}

function sanitizeResult(raw: Record<string, unknown>): ReceiptScanResult {
  const category = VALID_CATEGORIES.includes(raw.category as ExpenseCategory)
    ? (raw.category as ExpenseCategory)
    : "other";

  const paymentMethod = VALID_PAYMENT_METHODS.includes(raw.payment_method as string)
    ? (raw.payment_method as string)
    : "credit_card";

  const confidence: Record<string, ConfidenceLevel> = {};
  const rawConfidence = (raw.confidence as Record<string, string>) || {};
  for (const key of [
    "provider",
    "amount",
    "date_of_service",
    "description",
    "category",
    "expense_type",
    "payment_method",
  ]) {
    const val = rawConfidence[key];
    confidence[key] =
      val === "high" || val === "medium" || val === "low" ? val : "low";
  }

  let dateStr = String(raw.date_of_service || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    dateStr = new Date().toISOString().split("T")[0];
    confidence.date_of_service = "low";
  }

  return {
    provider: String(raw.provider || ""),
    amount: typeof raw.amount === "number" && raw.amount > 0 ? raw.amount : 0,
    date_of_service: dateStr,
    description: String(raw.description || ""),
    category,
    expense_type: String(raw.expense_type || ""),
    payment_method: paymentMethod,
    confidence,
    raw_text: String(raw.raw_text || ""),
    is_medical: raw.is_medical !== false,
  };
}

export async function extractReceiptData(
  imageUrl: string
): Promise<ReceiptScanResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const anthropic = new Anthropic({ apiKey });
  const { base64, mediaType } = await fetchImageAsBase64(imageUrl);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: buildExtractionPrompt(),
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Claude response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  return sanitizeResult(parsed);
}
