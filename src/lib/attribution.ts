import { z } from "zod";

/**
 * Derives which marketing channel a signup came from, and validates
 * attribution fields before they reach raw_user_meta_data. Pure and
 * dependency-free — see scripts/test-attribution.mjs.
 */

export type SignupChannel =
  | "direct"
  | "organic_search"
  | "social"
  | "referral"
  | "paid"
  | "internal";

export const SIGNUP_CHANNELS: readonly SignupChannel[] = [
  "direct",
  "organic_search",
  "social",
  "referral",
  "paid",
  "internal",
];

const PAID_MEDIUM_PATTERN = /^(cpc|ppc|paid|paidsearch|display)$/i;

export const SEARCH_ENGINE_HOSTS = [
  "google.*",
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.com",
  "ecosia.org",
  "search.brave.com",
  "baidu.com",
  "yandex.*",
];

export const SOCIAL_HOSTS = [
  "facebook.com",
  "m.facebook.com",
  "l.facebook.com",
  "instagram.com",
  "t.co",
  "x.com",
  "twitter.com",
  "linkedin.com",
  "lnkd.in",
  "reddit.com",
  "out.reddit.com",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
  "news.ycombinator.com",
];

// Best-effort utm_source -> channel map for common values. Anything not
// listed here falls back to "referral" (see deriveChannel precedence).
const SOURCE_CHANNEL_MAP: Record<string, SignupChannel> = {
  google: "organic_search",
  bing: "organic_search",
  duckduckgo: "organic_search",
  yahoo: "organic_search",
  facebook: "social",
  instagram: "social",
  twitter: "social",
  x: "social",
  linkedin: "social",
  reddit: "social",
  youtube: "social",
  tiktok: "social",
  pinterest: "social",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Exact-or-suffix match only, never `includes()` — includes('google.com')
// would match notgoogle.com.evil.test. Patterns ending in ".*" match any TLD
// (google.com, google.co.uk, ...) while still anchoring on a label boundary.
export function hostMatches(host: string, pattern: string): boolean {
  if (pattern.endsWith(".*")) {
    const base = pattern.slice(0, -2);
    const re = new RegExp(`(^|\\.)${escapeRegExp(base)}\\.[a-z]{2,}(\\.[a-z]{2,})?$`, "i");
    return re.test(host);
  }
  return host === pattern || host.endsWith("." + pattern);
}

function hostInList(host: string, list: string[]): boolean {
  return list.some((pattern) => hostMatches(host, pattern));
}

export function extractReferrerHost(referrer: string): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export interface DeriveChannelParams {
  /** document.referrer, may be "" */
  referrer: string;
  /** window.location.hostname, used to detect internal navigation */
  currentHost: string;
  utmSource: string | null;
  utmMedium: string | null;
}

/**
 * First match wins:
 * 1. utm_medium looks like paid media -> paid
 * 2. utm_source present -> mapped channel, else referral
 * 3. no referrer -> direct
 * 4. referrer is our own host -> internal
 * 5. referrer is a known search engine -> organic_search
 * 6. referrer is a known social platform -> social
 * 7. otherwise -> referral
 */
export function deriveChannel({
  referrer,
  currentHost,
  utmSource,
  utmMedium,
}: DeriveChannelParams): SignupChannel {
  if (utmMedium && PAID_MEDIUM_PATTERN.test(utmMedium)) {
    return "paid";
  }

  if (utmSource) {
    const normalized = utmSource.trim().toLowerCase();
    return SOURCE_CHANNEL_MAP[normalized] ?? "referral";
  }

  const referrerHost = extractReferrerHost(referrer);

  if (!referrerHost) {
    return "direct";
  }

  if (currentHost && hostMatches(referrerHost, currentHost.toLowerCase())) {
    return "internal";
  }

  if (hostInList(referrerHost, SEARCH_ENGINE_HOSTS)) {
    return "organic_search";
  }

  if (hostInList(referrerHost, SOCIAL_HOSTS)) {
    return "social";
  }

  return "referral";
}

export interface CapturedAttribution {
  signup_channel: SignupChannel;
  signup_referrer_host: string | null;
  signup_landing_path: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

export function captureAttribution({
  referrer,
  currentHost,
  landingPath,
  searchParams,
}: {
  referrer: string;
  currentHost: string;
  landingPath: string;
  searchParams: URLSearchParams;
}): CapturedAttribution {
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");

  return {
    signup_channel: deriveChannel({ referrer, currentHost, utmSource, utmMedium }),
    signup_referrer_host: extractReferrerHost(referrer),
    signup_landing_path: landingPath,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: searchParams.get("utm_campaign"),
    utm_term: searchParams.get("utm_term"),
    utm_content: searchParams.get("utm_content"),
  };
}

export const ATTRIBUTION_MAX_FIELD_LENGTH = 200;

const printableField = z
  .string()
  .max(ATTRIBUTION_MAX_FIELD_LENGTH)
  .transform((value) => value.replace(/[^\x20-\x7e]/g, "").trim())
  .transform((value) => (value.length > 0 ? value : undefined));

export const attributionMetadataSchema = z.object({
  signup_channel: z.enum(SIGNUP_CHANNELS as [SignupChannel, ...SignupChannel[]]).optional(),
  signup_referrer_host: printableField.optional(),
  signup_landing_path: printableField.optional(),
  utm_source: printableField.optional(),
  utm_medium: printableField.optional(),
  utm_campaign: printableField.optional(),
  utm_term: printableField.optional(),
  utm_content: printableField.optional(),
});

export type AttributionMetadata = z.infer<typeof attributionMetadataSchema>;

const ATTRIBUTION_FIELDS = Object.keys(
  attributionMetadataSchema.shape
) as (keyof AttributionMetadata)[];

/**
 * Validates/sanitizes raw attribution input (form data fields or a cookie
 * payload) before it reaches raw_user_meta_data. Fully attacker-controllable
 * input: caps length, strips non-printable characters, and drops any field
 * that fails validation individually rather than rejecting the whole
 * signup/login.
 */
export function sanitizeAttributionInput(raw: Record<string, unknown>): AttributionMetadata {
  const result: AttributionMetadata = {};
  const shape = attributionMetadataSchema.shape;

  for (const field of ATTRIBUTION_FIELDS) {
    const value = raw[field];
    if (typeof value !== "string" || value.length === 0) continue;

    const parsed = shape[field].safeParse(value);
    if (parsed.success && parsed.data !== undefined) {
      (result as Record<string, unknown>)[field] = parsed.data;
    }
  }

  return result;
}
