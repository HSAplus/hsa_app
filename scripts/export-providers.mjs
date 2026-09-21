#!/usr/bin/env node
/**
 * Export the provider registry to a committed JSON snapshot.
 *
 *   node scripts/export-providers.mjs [--check]
 *
 * The database is the source of truth. This file is a DERIVED ARTIFACT whose
 * only job is to put the registry under version control, so that git history
 * answers "what did this row say six months ago, and when did it change" —
 * which is the record that matters if a provider ever disputes something on a
 * published guide page.
 *
 * Because it is derived, it cannot drift the way a hand-maintained copy would.
 * The worst case is staleness, and staleness is visible from the commit date.
 *
 * Output is deliberately deterministic — rows sorted by slug, keys in a fixed
 * order — so a diff shows only what actually changed in the data, not
 * whatever order Postgres happened to return rows in.
 *
 * Only public-view columns are exported. Internal routing configuration
 * (fax_number, email_address, mailing_address, api_base_url, form_template_id,
 * submission_notes) is excluded, because this file is committed to the repo
 * and a repo's visibility can change.
 *
 * --check exits non-zero if the snapshot is out of date, for CI.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const OUT_PATH = path.join(rootDir, "data", "providers.generated.json");

// Fixed key order. Matches public.hsa_providers_public; keep the two in sync.
const COLUMNS = [
  "id",
  "slug",
  "name",
  "legal_name",
  "aliases",
  "former_names",
  "org_type",
  "website_url",
  "portal_url",
  "support_phone",
  "hq_state",
  "is_custodian",
  "is_administrator",
  "account_types",
  "market_share_pct",
  "accounts_count",
  "logo_url",
  "submission_tier",
  "claim_form_url",
  "routing_varies_by_employer",
  "docs_required",
  "has_guide",
  "guide_summary",
  "guide_body",
  "sources",
  "last_reviewed",
  "updated_at",
];

const PAGE_SIZE = 1000;

function orderKeys(row) {
  const out = {};
  for (const col of COLUMNS) out[col] = row[col] ?? null;
  return out;
}

async function fetchAll(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("hsa_providers_public")
      .select(COLUMNS.join(","))
      .order("slug", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Query failed: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function main() {
  const checkOnly = process.argv.includes("--check");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // The anon key is enough: the view is granted to anon and exposes nothing
  // the public site doesn't already render.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !key) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and one of SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });

  const rows = await fetchAll(supabase);
  const providers = rows.map(orderKeys);

  const snapshot = {
    _comment:
      "GENERATED FILE — DO NOT EDIT. Produced by scripts/export-providers.mjs " +
      "from public.hsa_providers_public. The database is the source of truth; " +
      "edit there and re-run `npm run export:providers`. Hand edits here will " +
      "be silently overwritten on the next export.",
    // Not a timestamp of the export run: an unchanged registry must produce a
    // byte-identical file, or every export creates a meaningless diff and the
    // history stops being readable.
    generated_from: "public.hsa_providers_public",
    count: providers.length,
    providers,
  };

  const json = JSON.stringify(snapshot, null, 2) + "\n";

  if (checkOnly) {
    if (!fs.existsSync(OUT_PATH)) {
      console.error(`[STALE] ${path.relative(rootDir, OUT_PATH)} does not exist.`);
      console.error("Run: npm run export:providers");
      process.exit(1);
    }
    const existing = fs.readFileSync(OUT_PATH, "utf-8");
    if (existing !== json) {
      console.error(`[STALE] ${path.relative(rootDir, OUT_PATH)} does not match the database.`);
      console.error("Run: npm run export:providers  (and commit the result)");
      process.exit(1);
    }
    console.log(`[OK] Snapshot is current (${providers.length} providers).`);
    return;
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, json, "utf-8");

  const withGuides = providers.filter((p) => p.has_guide).length;
  console.log(
    `[SUCCESS] Wrote ${providers.length} provider(s) (${withGuides} with guides) to ${path.relative(rootDir, OUT_PATH)}`
  );
  console.log("Commit this file — its git history is the registry's audit trail.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
