#!/usr/bin/env node
/**
 * Turn the hsasearch.com provider table into a file import-providers.mjs
 * accepts.
 *
 *   node scripts/prepare-hsasearch-import.mjs <raw.tsv> <out.csv>
 *
 * Input is the table copied as TSV, with a header row and the columns
 * name, state, monthly_fee, investments.
 *
 * The scraped source is deliberately NOT committed — only this script,
 * because what needs reviewing and reusing is the decisions in it: which
 * names map to providers we already have, how duplicates are disambiguated,
 * and what we choose not to import.
 *
 * FEE AND INVESTMENT COLUMNS ARE READ AND DISCARDED. They are the
 * fastest-rotting data in the source: a monthly fee taken from a third-party
 * compilation on an unknown date, for 839 banks that change fee schedules
 * without announcing them. A wrong fee on a page we are trying to rank is
 * worse than no fee, so the registry stores neither rather than storing data
 * it cannot stand behind.
 *
 * What is imported is the part that stays true: who exists, where they are,
 * and what kind of institution they are.
 */

import fs from "fs";

const [IN, OUT] = process.argv.slice(2);

if (!IN || !OUT) {
  console.error(
    "Usage: node scripts/prepare-hsasearch-import.mjs <raw.tsv> <out.csv>\n\n" +
      "Input: the hsasearch.com provider table as TSV, header row plus\n" +
      "columns name, state, monthly_fee, investments."
  );
  process.exit(1);
}

// Names in the source that are already in our database under a different
// slug. Hand-verified — a wrong entry here merges two real companies.
const SLUG_OVERRIDES = {
  "Fidelity Investments": "fidelity", // our row is named "Fidelity"
  "UMB Bank": "umb-healthcare-services", // UMB's HSA arm; same company
};

/** Mirrors slugify() in import-providers.mjs and public.slugify() in SQL. */
function slugify(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * "Bank" or "Credit Union" in an institution's own name is definitional, so
 * only those two are inferred. Everything else stays empty rather than
 * guessed — org_type drives a public filter, and a wrong label is a visible
 * factual error about a real company.
 */
function orgType(name) {
  const n = name.toLowerCase();
  if (/\b(credit union|fcu|cu)\b/.test(n)) return "credit_union";
  if (/\b(bank|savings|bancorp|bankers|banking|trust)\b/.test(n)) return "bank";
  return "";
}

const lines = fs.readFileSync(IN, "utf-8").split(/\r?\n/).filter((l) => l.trim());
const rows = lines.slice(1).map((l) => {
  const [name, state] = l.split("\t");
  return { name: (name ?? "").trim(), state: (state ?? "").trim() };
});

// Count BASE SLUGS, not names. Keying on names misses the case that matters
// most: "Farmers & Merchants Bank" and "Farmers and Merchants Bank" are
// different names that slugify identically, because & expands to "and".
// Three such pairs exist in this source.
const baseSlugCounts = new Map();
for (const r of rows) {
  const base = SLUG_OVERRIDES[r.name] ?? slugify(r.name);
  baseSlugCounts.set(base, (baseSlugCounts.get(base) ?? 0) + 1);
}

const used = new Set();
const out = [];
const notes = { overridden: [], suffixed: [], numbered: [] };

for (const r of rows) {
  let slug;

  if (SLUG_OVERRIDES[r.name]) {
    slug = SLUG_OVERRIDES[r.name];
    notes.overridden.push(`${r.name} -> ${slug}`);
  } else {
    slug = slugify(r.name);

    if (baseSlugCounts.get(slug) > 1 && r.state) {
      // Five distinct "Community Bank"s exist here. They are different
      // companies, and state is the only distinguishing fact the source gives.
      slug = `${slug}-${r.state.toLowerCase()}`;
      notes.suffixed.push(`${r.name} (${r.state}) -> ${slug}`);
    }

    // Still colliding — same name and state, or a duplicate name with no
    // state. Number it so no provider is silently dropped, and flag it.
    if (used.has(slug)) {
      let n = 2;
      while (used.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
      notes.numbered.push(
        `${r.name}${r.state ? ` (${r.state})` : " (no state)"} -> ${slug}`
      );
    }
  }

  used.add(slug);

  out.push({
    slug,
    name: r.name,
    hq_state: r.state,
    org_type: orgType(r.name),
    // Everything on this list holds HSA accounts; whether it also adjudicates
    // claims is unknown, so is_administrator is left at its default.
    is_custodian: "true",
    data_source: "hsasearch.com",
  });
}

const cols = Object.keys(out[0]);
const esc = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
fs.writeFileSync(
  OUT,
  [cols.join(","), ...out.map((r) => cols.map((c) => esc(r[c] ?? "")).join(","))].join("\n") + "\n",
  "utf-8"
);

console.log(`Wrote ${out.length} rows to ${OUT}\n`);
console.log(`Mapped to existing slugs (${notes.overridden.length}):`);
for (const n of notes.overridden) console.log("  ", n);
console.log(`\nState-suffixed for uniqueness (${notes.suffixed.length}):`);
for (const n of notes.suffixed.slice(0, 8)) console.log("  ", n);
if (notes.suffixed.length > 8) console.log(`   ... and ${notes.suffixed.length - 8} more`);
console.log(`\nNEEDS REVIEW — numbered because name+state still collided (${notes.numbered.length}):`);
for (const n of notes.numbered) console.log("  ", n);

const withOrg = out.filter((r) => r.org_type !== "").length;
const withState = out.filter((r) => r.hq_state !== "").length;
console.log(
  `\nCoverage: ${withState}/${out.length} have a state, ${withOrg} org_type inferred, ` +
    `${out.length - withOrg} left blank rather than guessed`
);
