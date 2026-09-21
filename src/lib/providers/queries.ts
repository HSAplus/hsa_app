import { createClient } from "@supabase/supabase-js";
import type { PublicProvider } from "@/lib/claims/types";

/**
 * Cookie-free Supabase client for the public provider pages.
 *
 * Deliberately NOT @/lib/supabase/server — that one reads cookies(), which
 * opts the route into dynamic rendering. These pages are anonymous marketing
 * content that must render statically at build time for generateStaticParams
 * to mean anything.
 *
 * Reads the hsa_providers_public view, which is granted to anon and excludes
 * internal routing configuration.
 */
function publicClient() {
  // Returns null rather than throwing when the environment is incomplete.
  //
  // getSupabasePublishableKey() throws by design, which is right for the app
  // but wrong here: generateStaticParams runs at build time, so a missing key
  // took down the entire build — not just this route — on any environment
  // that hadn't been given Supabase credentials. Preview deployments were
  // exactly that, and had been fine until these pages became the first ones
  // to need the database before runtime.
  //
  // The rest of this file already treats unreachable data as an empty list.
  // This closes the one path that didn't.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    console.warn(
      "[providers] NEXT_PUBLIC_SUPABASE_URL / anon key not set — provider pages will render empty."
    );
    return null;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/** Columns the hub needs. Excludes guide_body, which is large and unused there. */
const LIST_COLUMNS = [
  "id",
  "slug",
  "name",
  "legal_name",
  "aliases",
  "former_names",
  "org_type",
  "website_url",
  "portal_url",
  "is_custodian",
  "is_administrator",
  "account_types",
  "market_share_pct",
  "submission_tier",
  "routing_varies_by_employer",
  "docs_required",
  "has_guide",
  "guide_summary",
  "last_reviewed",
].join(",");

export type ProviderListItem = Pick<
  PublicProvider,
  | "id"
  | "slug"
  | "name"
  | "legal_name"
  | "aliases"
  | "former_names"
  | "org_type"
  | "website_url"
  | "portal_url"
  | "is_custodian"
  | "is_administrator"
  | "account_types"
  | "market_share_pct"
  | "submission_tier"
  | "routing_varies_by_employer"
  | "docs_required"
  | "has_guide"
  | "guide_summary"
  | "last_reviewed"
>;

// PostgREST caps a single response; the registry is 800+ rows and growing.
const PAGE_SIZE = 1000;

/**
 * Every active provider, for the hub page.
 *
 * Returns [] rather than throwing when the table isn't reachable. This runs at
 * build time, and a build that fails because a marketing page's data source
 * blipped is worse than a page that renders its explanatory copy with an empty
 * list — every other route would go down with it.
 */
export async function getAllProviders(): Promise<ProviderListItem[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const rows: ProviderListItem[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("hsa_providers_public")
      .select(LIST_COLUMNS)
      .order("market_share_pct", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("getAllProviders failed:", error.message);
      return rows;
    }
    if (!data || data.length === 0) break;

    rows.push(...(data as unknown as ProviderListItem[]));
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}

/**
 * Providers cleared for their own page. generateStaticParams selects on this,
 * so an unresearched registry row can never become a thin page.
 */
export async function getGuidedProviderSlugs(): Promise<string[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("hsa_providers_public")
    .select("slug")
    .eq("has_guide", true)
    .order("slug");

  if (error) {
    console.error("getGuidedProviderSlugs failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.slug as string);
}

/** A single provider's full guide. Returns null when there is no page to show. */
export async function getProviderGuide(
  slug: string
): Promise<PublicProvider | null> {
  const supabase = publicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("hsa_providers_public")
    .select("*")
    .eq("slug", slug)
    .eq("has_guide", true)
    .maybeSingle();

  if (error) {
    console.error(`getProviderGuide(${slug}) failed:`, error.message);
    return null;
  }
  return (data as PublicProvider | null) ?? null;
}

// ────────────────────────────────────────────────
// Display helpers
// ────────────────────────────────────────────────

export const ORG_TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  credit_union: "Credit union",
  non_bank_custodian: "Non-bank custodian",
  tpa: "Third-party administrator",
  health_plan: "Health plan",
  investment_platform: "Investment platform",
  payroll_benefits: "Payroll & benefits",
  other: "Other",
};

export const TIER_LABELS: Record<string, string> = {
  self_directed: "Self-directed — no claim",
  api: "Automated submission",
  fax: "Fax",
  portal: "Provider portal",
  mail: "Mail",
  email: "Email",
};

/**
 * What the provider does, in the terms a reader actually cares about.
 * Custodian and administrator are distinct roles the same name may or may not
 * fill, and conflating them is what makes most provider comparisons wrong.
 */
export function roleLabel(p: {
  is_custodian: boolean;
  is_administrator: boolean;
}): string {
  if (p.is_custodian && p.is_administrator) return "Custodian & administrator";
  if (p.is_custodian) return "Custodian";
  if (p.is_administrator) return "Administrator";
  return "Provider";
}

/**
 * The haystack for the hub's filter. Former names matter as much as current
 * ones — someone searching "PayFlex" in 2026 needs to land on Inspira.
 */
export function searchIndex(p: ProviderListItem): string {
  return [p.name, p.legal_name, ...p.aliases, ...p.former_names]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
