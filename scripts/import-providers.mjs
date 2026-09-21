#!/usr/bin/env node
/**
 * Import the HSA provider registry into public.hsa_administrators.
 *
 *   node scripts/import-providers.mjs <file.csv|file.json> [--dry-run]
 *
 * The DB is the source of truth for the registry, so this is an upsert, not a
 * replace: it will not delete rows that are missing from the input file. A
 * provider that genuinely no longer exists gets active = false, which is a
 * deliberate human decision, not something a bad input file should trigger.
 *
 * EDITORIAL COLUMNS ARE NEVER TOUCHED. has_guide, guide_summary, guide_body,
 * sources and last_reviewed are hand-written and reviewed; re-running an
 * import must not be able to blank them or silently republish an unreviewed
 * page. Those live in supabase/seed/providers_researched.sql instead.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The service
 * role key bypasses RLS, which is required here because the table's only
 * policy is read-only.
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./load-env.mjs";

loadEnv();

// Columns this script is allowed to write. Anything in the input file outside
// this list is reported and ignored rather than guessed at.
const REGISTRY_COLUMNS = new Set([
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
  "fax_number",
  "email_address",
  "mailing_address",
  "api_base_url",
  "form_template_id",
  "submission_notes",
  "data_source",
  "active",
]);

const EDITORIAL_COLUMNS = new Set([
  "has_guide",
  "guide_summary",
  "guide_body",
  "sources",
  "last_reviewed",
  "accepts_email_phi",
]);

const ARRAY_COLUMNS = new Set(["aliases", "former_names", "account_types"]);
const BOOLEAN_COLUMNS = new Set([
  "is_custodian",
  "is_administrator",
  "routing_varies_by_employer",
  "active",
]);
const NUMERIC_COLUMNS = new Set(["market_share_pct", "accounts_count"]);

const VALID_TIERS = ["api", "email", "fax", "portal", "mail", "self_directed"];
const VALID_ORG_TYPES = [
  "bank",
  "credit_union",
  "non_bank_custodian",
  "tpa",
  "health_plan",
  "investment_platform",
  "payroll_benefits",
  "other",
];
const VALID_DOCS_REQUIRED = ["none", "always", "varies", "over_threshold"];

const BATCH_SIZE = 200;

// ────────────────────────────────────────────────
// CSV parsing (RFC 4180: quoted fields, embedded commas, "" escapes)
// ────────────────────────────────────────────────

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  // Strip a UTF-8 BOM — Excel writes one and it would otherwise become part
  // of the first header name.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      // Treat \r\n as one terminator
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }

  // Trailing field/row when the file doesn't end in a newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

// ────────────────────────────────────────────────
// Normalization
// ────────────────────────────────────────────────

/**
 * Build a URL slug from a provider name. Providers arrive with inconsistent
 * punctuation ("Optum Bank, Inc." / "HSA Bank (a division of Webster Bank)"),
 * and this is the public path segment, so it has to be stable and clean.
 *
 * Mirrors public.slugify() in add_provider_registry.sql. The two must agree,
 * or a row imported from a file gets a different URL than the same row
 * backfilled by the migration.
 */
function slugify(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    // Strip the combining diacritical marks NFKD just separated out, so
    // "Zurich" with an umlaut slugs to "zurich" and not "zu-rich".
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArrayValue(raw) {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  const s = String(raw).trim();
  if (!s) return [];
  // Accept a JSON array or a semicolon/pipe-delimited list. Commas are not a
  // delimiter here — provider names contain them.
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      /* fall through to delimiter split */
    }
  }
  return s
    .split(/[;|]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseBooleanValue(raw) {
  if (typeof raw === "boolean") return raw;
  const s = String(raw).trim().toLowerCase();
  if (["true", "t", "yes", "y", "1"].includes(s)) return true;
  if (["false", "f", "no", "n", "0"].includes(s)) return false;
  return null;
}

function normalizeRow(input, rowNum, warnings) {
  const out = {};
  const unknown = [];

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const key = rawKey.trim().toLowerCase().replace(/[\s-]+/g, "_");

    if (EDITORIAL_COLUMNS.has(key)) {
      warnings.push(
        `row ${rowNum}: ignoring editorial column "${key}" — those are maintained in supabase/seed/providers_researched.sql, not imported`
      );
      continue;
    }

    if (!REGISTRY_COLUMNS.has(key)) {
      unknown.push(rawKey);
      continue;
    }

    const isEmpty =
      rawValue === null ||
      rawValue === undefined ||
      String(rawValue).trim() === "";

    if (isEmpty) {
      // Don't write NULL over a value a human may have curated in the DB.
      // Omitting the key leaves the existing value intact on upsert.
      continue;
    }

    if (ARRAY_COLUMNS.has(key)) {
      out[key] = parseArrayValue(rawValue);
    } else if (BOOLEAN_COLUMNS.has(key)) {
      const b = parseBooleanValue(rawValue);
      if (b === null) {
        warnings.push(`row ${rowNum}: "${key}" = "${rawValue}" is not a boolean — skipped`);
      } else {
        out[key] = b;
      }
    } else if (NUMERIC_COLUMNS.has(key)) {
      const n = Number(String(rawValue).replace(/[$,%\s,]/g, ""));
      if (Number.isNaN(n)) {
        warnings.push(`row ${rowNum}: "${key}" = "${rawValue}" is not a number — skipped`);
      } else {
        out[key] = n;
      }
    } else {
      out[key] = String(rawValue).trim();
    }
  }

  if (unknown.length) {
    warnings.push(`row ${rowNum}: unrecognized columns ignored: ${unknown.join(", ")}`);
  }

  return out;
}

function validateRow(row, rowNum, errors, synthesized) {
  if (!row.name) {
    errors.push(`row ${rowNum}: missing required column "name"`);
    return false;
  }

  // `id` is the internal key that claims.administrator_id points at, and
  // `slug` is the public URL. They are separate columns and only default to
  // the same value for genuinely new providers.
  if (!row.slug) row.slug = slugify(row.id || row.name);
  if (!row.id) {
    row.id = row.slug;
    synthesized.add("id");
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.slug)) {
    const fixed = slugify(row.slug);
    if (!fixed) {
      errors.push(
        `row ${rowNum}: slug "${row.slug}" cannot be made into a valid URL slug`
      );
      return false;
    }
    row.slug = fixed;
  }

  // submission_tier is NOT NULL with no default. 'portal' is the honest
  // starting point for an unresearched provider: it says "go to their site",
  // which is true of every provider and claims nothing we haven't verified.
  //
  // Recorded as synthesized so it is dropped again for providers that already
  // exist. The first real run of this script wrote this default over
  // Fidelity's curated 'self_directed', which is how 24% of the market
  // silently acquired a claims process it does not have.
  if (!row.submission_tier) {
    row.submission_tier = "portal";
    synthesized.add("submission_tier");
  } else if (!VALID_TIERS.includes(row.submission_tier)) {
    errors.push(
      `row ${rowNum} (${row.id}): submission_tier "${row.submission_tier}" is not one of ${VALID_TIERS.join(", ")}`
    );
    return false;
  }

  if (row.org_type && !VALID_ORG_TYPES.includes(row.org_type)) {
    errors.push(
      `row ${rowNum} (${row.id}): org_type "${row.org_type}" is not one of ${VALID_ORG_TYPES.join(", ")}`
    );
    return false;
  }

  if (row.docs_required && !VALID_DOCS_REQUIRED.includes(row.docs_required)) {
    errors.push(
      `row ${rowNum} (${row.id}): docs_required "${row.docs_required}" is not one of ${VALID_DOCS_REQUIRED.join(", ")}`
    );
    return false;
  }

  if (!row.data_source) {
    row.data_source = "import";
    synthesized.add("data_source");
  }

  return true;
}

// ────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error("Usage: node scripts/import-providers.mjs <file.csv|file.json> [--dry-run]");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const ext = path.extname(filePath).toLowerCase();

  let records;
  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    records = Array.isArray(parsed) ? parsed : parsed.providers;
    if (!Array.isArray(records)) {
      console.error("JSON input must be an array, or an object with a `providers` array.");
      process.exit(1);
    }
  } else {
    const rows = parseCsv(raw);
    if (rows.length < 2) {
      console.error("CSV appears to have no data rows.");
      process.exit(1);
    }
    const headers = rows[0];
    records = rows.slice(1).map((r) =>
      Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""]))
    );
  }

  console.log(`Read ${records.length} record(s) from ${filePath}\n`);

  const warnings = [];
  const errors = [];
  // Both columns are unique in the database, so both are checked here — a
  // collision caught in the file is a readable error, while the same
  // collision caught by Postgres aborts a batch halfway through.
  const seenIds = new Map();
  const seenSlugs = new Map();
  const prepared = [];
  const synthesizedByRow = new Map();

  records.forEach((rec, i) => {
    const rowNum = i + 2; // 1-indexed, +1 for the header row
    const row = normalizeRow(rec, rowNum, warnings);

    // Which fields this script invented rather than read from the file. They
    // are fine for a brand-new provider and must never be written over an
    // existing one.
    const synthesized = new Set();
    if (!validateRow(row, rowNum, errors, synthesized)) return;
    synthesizedByRow.set(row, synthesized);

    // A duplicate would make one provider silently overwrite another — two
    // rows in, one row out, no error. Catch it here instead.
    if (seenSlugs.has(row.slug)) {
      errors.push(
        `row ${rowNum}: duplicate slug "${row.slug}" (also row ${seenSlugs.get(row.slug)}) — "${row.name}" collides with an earlier provider. Give one of them an explicit distinct slug.`
      );
      return;
    }
    if (seenIds.has(row.id)) {
      errors.push(
        `row ${rowNum}: duplicate id "${row.id}" (also row ${seenIds.get(row.id)}) — "${row.name}" collides with an earlier provider. Give one of them an explicit distinct id.`
      );
      return;
    }
    seenSlugs.set(row.slug, rowNum);
    seenIds.set(row.id, rowNum);
    prepared.push(row);
  });

  // A column-level problem produces one warning per row, so on an 800-row file
  // a single bad header becomes 800 lines and buries the one-off warnings that
  // actually need reading. Collapse by message, keep the row count.
  if (warnings.length) {
    const grouped = new Map();
    for (const w of warnings) {
      const m = w.match(/^row (\d+): (.*)$/);
      const [rowNum, message] = m ? [m[1], m[2]] : [null, w];
      if (!grouped.has(message)) grouped.set(message, []);
      if (rowNum) grouped.get(message).push(rowNum);
    }

    console.log(`${grouped.size} distinct warning(s) across ${warnings.length} row(s):`);
    for (const [message, rowNums] of grouped) {
      if (rowNums.length === 0) {
        console.log(`  ! ${message}`);
      } else if (rowNums.length <= 3) {
        console.log(`  ! ${message} (row${rowNums.length > 1 ? "s" : ""} ${rowNums.join(", ")})`);
      } else {
        console.log(`  ! ${message} (${rowNums.length} rows, first: ${rowNums.slice(0, 3).join(", ")})`);
      }
    }
    console.log("");
  }

  if (errors.length) {
    console.error(`${errors.length} error(s) — nothing was written:`);
    for (const e of errors.slice(0, 30)) console.error(`  x ${e}`);
    if (errors.length > 30) console.error(`  ... and ${errors.length - 30} more`);
    process.exit(1);
  }

  console.log(`${prepared.length} record(s) validated.`);

  if (dryRun) {
    console.log("\n--dry-run: nothing written. Sample of the first 3 rows:\n");
    console.log(JSON.stringify(prepared.slice(0, 3), null, 2));
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "\nNEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.\n" +
        "The service role key is required because hsa_administrators has no write policy."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ────────────────────────────────────────────────
  // Preserve the id of every row that already exists
  // ────────────────────────────────────────────────
  // The upsert below conflicts on slug, but PostgREST updates every column
  // present in the payload — including id. So a row whose slug already exists
  // would have its id rewritten to whatever this file generated, silently
  // repointing a primary key that claims.administrator_id and
  // profiles.hsa_administrator_id reference with no ON UPDATE CASCADE.
  //
  // In practice that either breaks with a foreign key error halfway through a
  // batch, or succeeds and quietly orphans nothing today while changing an
  // identifier something might rely on tomorrow. Both happened on the first
  // real run of this script.
  //
  // So: look up the ids the database already has and send those back
  // unchanged. `id` is only ever newly assigned for genuinely new providers.
  const existingBySlug = new Map();
  const LOOKUP_CHUNK = 500;
  const allSlugs = prepared.map((r) => r.slug);

  for (let i = 0; i < allSlugs.length; i += LOOKUP_CHUNK) {
    const { data, error } = await supabase
      .from("hsa_administrators")
      // Every column this script is capable of synthesizing, so the current
      // value can be sent back unchanged instead of a guess.
      .select("id,slug,submission_tier,data_source")
      .in("slug", allSlugs.slice(i, i + LOOKUP_CHUNK));

    if (error) {
      console.error(`\nCould not read existing providers: ${error.message}`);
      process.exit(1);
    }
    for (const row of data ?? []) existingBySlug.set(row.slug, row);
  }

  let idPreserved = 0;
  let defaultsDropped = 0;

  for (const row of prepared) {
    const existing = existingBySlug.get(row.slug);
    if (existing === undefined) continue; // genuinely new — defaults apply

    if (existing.id !== row.id) {
      row.id = existing.id;
      idPreserved++;
    }

    // Replace every field this script invented with what the database already
    // holds. For a provider that already exists, a synthesized default is not
    // information — it is this script guessing, over a value a human chose.
    //
    // Sending the current value back, rather than omitting the column, is
    // required for submission_tier: it is NOT NULL with no default, and
    // Postgres validates the INSERT tuple of an upsert before it ever
    // resolves the conflict. Omitting it fails the whole batch even though
    // every row is destined for DO UPDATE.
    for (const field of synthesizedByRow.get(row) ?? []) {
      if (field === "id") continue; // handled above

      if (existing[field] !== null && existing[field] !== undefined) {
        row[field] = existing[field];
      } else {
        delete row[field];
      }
      defaultsDropped++;
    }
  }

  console.log(
    `${existingBySlug.size} of ${prepared.length} already exist and will be updated in place` +
      (idPreserved > 0 ? `; ${idPreserved} keep an id that differs from their slug` : "") +
      (defaultsDropped > 0 ? `; ${defaultsDropped} synthesized default(s) replaced with the existing value` : "")
  );
  console.log(`${prepared.length - existingBySlug.size} are new.\n`);

  // ────────────────────────────────────────────────
  // Group by key signature before sending
  // ────────────────────────────────────────────────
  // PostgREST builds one INSERT per request, with a column list taken from
  // the UNION of keys across the batch. A row that omits a key therefore does
  // not "skip" that column — it gets NULL written into it. The first real run
  // of this script nulled org_type on three curated providers exactly this
  // way, while its own documentation promised empty cells were skipped.
  //
  // Grouping rows that share an identical key set restores the intended
  // behaviour: a column absent from a group is absent from that INSERT, so
  // new rows take the database default and existing rows keep what they have.
  const groups = new Map();
  for (const row of prepared) {
    const signature = Object.keys(row).sort().join("\u0000");
    if (!groups.has(signature)) groups.set(signature, []);
    groups.get(signature).push(row);
  }

  console.log(`Sending ${groups.size} group(s) of uniform columns.`);

  let written = 0;
  for (const rows of groups.values()) {
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      // Conflict on slug, not id. The table holds hand-entered rows whose ids
      // follow no convention, so matching on id would insert a second
      // "HealthEquity" beside an existing `health_equity` instead of updating
      // it — and the new row would be orphaned from anything pointing at the
      // old one.
      const { error } = await supabase
        .from("hsa_administrators")
        .upsert(batch, { onConflict: "slug" });

      if (error) {
        console.error(`\nA batch failed: ${error.message}`);
        console.error(`${written} record(s) were written before this point.`);
        process.exit(1);
      }

      written += batch.length;
      process.stdout.write(`\r  upserted ${written}/${prepared.length}`);
    }
  }

  console.log(`\n\n[SUCCESS] ${written} provider(s) upserted.`);
  console.log("Next: npm run export:providers to refresh the committed snapshot.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
