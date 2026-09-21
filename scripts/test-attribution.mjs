#!/usr/bin/env node
/**
 * Automated test suite for signup attribution channel derivation.
 */

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const attributionFilePath = path.resolve(__dirname, "..", "src", "lib", "attribution.ts");
const source = fs.readFileSync(attributionFilePath, "utf-8");

function extractStatement(name, startPattern) {
  const match = source.match(startPattern);
  if (!match) {
    console.error(`Failed to find ${name} in attribution.ts`);
    process.exit(1);
  }
  const endIdx = source.indexOf(";", match.index);
  return source.slice(match.index, endIdx + 1);
}

function extractFunction(name, startPattern) {
  const match = source.match(startPattern);
  if (!match) {
    console.error(`Failed to find ${name} in attribution.ts`);
    process.exit(1);
  }
  const startIdx = match.index;

  // Skip past the parameter list first (it may itself contain destructuring
  // braces, e.g. `function f({ a, b }: Params): Ret {`), so the body's own
  // opening brace isn't mistaken for the destructure's.
  const parenOpenIdx = source.indexOf("(", startIdx);
  let parenDepth = 0;
  let i = parenOpenIdx;
  for (; i < source.length; i++) {
    if (source[i] === "(") parenDepth++;
    else if (source[i] === ")") {
      parenDepth--;
      if (parenDepth === 0) {
        i++;
        break;
      }
    }
  }

  const braceOpenIdx = source.indexOf("{", i);
  let depth = 0;
  for (let j = braceOpenIdx; j < source.length; j++) {
    if (source[j] === "{") depth++;
    else if (source[j] === "}") {
      depth--;
      if (depth === 0) {
        return source.slice(startIdx, j + 1);
      }
    }
  }
  console.error(`Failed to find end of ${name} in attribution.ts`);
  process.exit(1);
}

// Strip TypeScript-only syntax so the extracted source can run as plain JS,
// same approach as scripts/test-storage.mjs. Order matters: longer/more
// specific annotations must be stripped before the shorter ones they contain.
function stripTypes(code) {
  return code
    .replace(/export\s+/g, "")
    .replace(/:\s*Record<string, SignupChannel>/g, "")
    .replace(/:\s*DeriveChannelParams/g, "")
    .replace(/:\s*SignupChannel/g, "")
    .replace(/:\s*string\[\]/g, "")
    .replace(/:\s*string \| null/g, "")
    .replace(/:\s*string/g, "")
    .replace(/:\s*boolean/g, "");
}

const parts = [
  extractStatement("PAID_MEDIUM_PATTERN", /const PAID_MEDIUM_PATTERN = /),
  extractStatement("SEARCH_ENGINE_HOSTS", /export const SEARCH_ENGINE_HOSTS = \[/),
  extractStatement("SOCIAL_HOSTS", /export const SOCIAL_HOSTS = \[/),
  extractStatement("SOURCE_CHANNEL_MAP", /const SOURCE_CHANNEL_MAP: Record<string, SignupChannel> = \{/),
  extractFunction("escapeRegExp", /function escapeRegExp\(/),
  extractFunction("hostMatches", /export function hostMatches\(/),
  extractFunction("hostInList", /function hostInList\(/),
  extractFunction("extractReferrerHost", /export function extractReferrerHost\(/),
  extractFunction("deriveChannel", /export function deriveChannel\(/),
].map(stripTypes);

const combinedCode = parts.join("\n\n");
const deriveChannel = new Function(`${combinedCode}\nreturn deriveChannel;`)();
const hostMatches = new Function(`${combinedCode}\nreturn hostMatches;`)();

const OWN_HOST = "hsa.plus";

const testCases = [
  // Precedence: paid utm_medium wins regardless of referrer/source
  {
    name: "utm_medium=cpc overrides everything",
    input: { referrer: "https://www.facebook.com/", currentHost: OWN_HOST, utmSource: "newsletter", utmMedium: "cpc" },
    expected: "paid",
  },
  { name: "utm_medium=ppc", input: { referrer: "", currentHost: OWN_HOST, utmSource: null, utmMedium: "ppc" }, expected: "paid" },
  { name: "utm_medium=display", input: { referrer: "", currentHost: OWN_HOST, utmSource: null, utmMedium: "display" }, expected: "paid" },
  { name: "utm_medium=paidsearch", input: { referrer: "", currentHost: OWN_HOST, utmSource: null, utmMedium: "paidsearch" }, expected: "paid" },

  // utm_source present, no paid medium
  {
    name: "utm_source=google maps to organic_search",
    input: { referrer: "", currentHost: OWN_HOST, utmSource: "google", utmMedium: "email" },
    expected: "organic_search",
  },
  {
    name: "utm_source=facebook maps to social",
    input: { referrer: "", currentHost: OWN_HOST, utmSource: "facebook", utmMedium: null },
    expected: "social",
  },
  {
    name: "unrecognized utm_source falls back to referral",
    input: { referrer: "", currentHost: OWN_HOST, utmSource: "some-newsletter-tool", utmMedium: null },
    expected: "referral",
  },
  {
    name: "utm_source present overrides a search-engine referrer",
    input: { referrer: "https://www.google.com/search?q=hsa", currentHost: OWN_HOST, utmSource: "some-newsletter-tool", utmMedium: null },
    expected: "referral",
  },

  // No UTM params: fall through to referrer-based rules
  { name: "empty referrer is direct", input: { referrer: "", currentHost: OWN_HOST, utmSource: null, utmMedium: null }, expected: "direct" },
  {
    name: "own host is internal",
    input: { referrer: "https://hsa.plus/pricing", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "internal",
  },
  {
    name: "own host subdomain is internal",
    input: { referrer: "https://www.hsa.plus/pricing", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "internal",
  },
  {
    name: "google.com referrer is organic_search",
    input: { referrer: "https://www.google.com/search?q=hsa", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "organic_search",
  },
  {
    name: "google.co.uk referrer (wildcard TLD) is organic_search",
    input: { referrer: "https://www.google.co.uk/search?q=hsa", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "organic_search",
  },
  {
    name: "bing.com referrer is organic_search",
    input: { referrer: "https://www.bing.com/search?q=hsa", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "organic_search",
  },
  {
    name: "facebook.com referrer is social",
    input: { referrer: "https://facebook.com/", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "social",
  },
  {
    name: "m.facebook.com referrer is social",
    input: { referrer: "https://m.facebook.com/", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "social",
  },
  {
    name: "out.reddit.com referrer is social",
    input: { referrer: "https://out.reddit.com/", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "social",
  },
  {
    name: "unknown referrer host is referral",
    input: { referrer: "https://some-blog.example.com/post", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "referral",
  },
  {
    name: "malformed referrer treated as no referrer (direct)",
    input: { referrer: "not-a-url", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "direct",
  },

  // Host-matching must never use substring/includes semantics
  {
    name: "lookalike host is NOT treated as google (includes() bug guard)",
    input: { referrer: "https://notgoogle.com.evil.test/", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "referral",
  },
  {
    name: "lookalike host is NOT treated as facebook (includes() bug guard)",
    input: { referrer: "https://facebook.com.evil.test/", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "referral",
  },
  {
    name: "domain containing google as a substring is not organic_search",
    input: { referrer: "https://googleanalytics-clone.com/", currentHost: OWN_HOST, utmSource: null, utmMedium: null },
    expected: "referral",
  },
];

console.log("=== Signup Attribution Test Suite ===");
let passed = 0;
for (const tc of testCases) {
  const actual = deriveChannel(tc.input);
  try {
    assert.strictEqual(actual, tc.expected);
    console.log(`  ✓ ${tc.name}`);
    passed++;
  } catch {
    console.error(`  ✗ ${tc.name}: expected '${tc.expected}', got '${actual}'`);
  }
}

// Direct hostMatches guards, independent of deriveChannel's precedence order
const hostMatchesCases = [
  { name: "exact match", host: "google.com", pattern: "google.com", expected: true },
  { name: "subdomain match", host: "www.google.com", pattern: "google.com", expected: true },
  { name: "includes()-style false positive rejected", host: "notgoogle.com.evil.test", pattern: "google.com", expected: false },
  { name: "wildcard TLD match", host: "google.co.uk", pattern: "google.*", expected: true },
  { name: "wildcard TLD non-match", host: "notgoogle.co.uk", pattern: "google.*", expected: false },
];

for (const tc of hostMatchesCases) {
  const actual = hostMatches(tc.host, tc.pattern);
  try {
    assert.strictEqual(actual, tc.expected);
    console.log(`  ✓ hostMatches: ${tc.name}`);
    passed++;
    testCases.push(tc);
  } catch {
    console.error(`  ✗ hostMatches: ${tc.name}: expected '${tc.expected}', got '${actual}'`);
    testCases.push(tc);
  }
}

// ────────────────────────────────────────────────
// SIGNUP_CHANNELS must match the database check constraint
// ────────────────────────────────────────────────
// profiles_signup_channel_check exists so a typo in deriveChannel() fails
// loudly rather than writing junk. But "loudly at write time" means a real
// person's signup erroring out, so the mismatch is worth catching in CI
// instead — the constraint stays as the last line of defence.

{
  const name = "SIGNUP_CHANNELS matches profiles_signup_channel_check";
  testCases.push({ name });

  const migration = fs.readFileSync(
    path.resolve(__dirname, "..", "supabase", "migrations", "add_signup_attribution.sql"),
    "utf-8"
  );

  const match = migration.match(
    /check\s*\(\s*signup_channel\s+in\s*\(([^)]*)\)/i
  );

  if (!match) {
    console.error(`  ✗ ${name}: could not find the constraint in the migration`);
  } else {
    const sqlChannels = [...match[1].matchAll(/'([^']+)'/g)]
      .map((m) => m[1])
      .sort();

    // Read the array out of attribution.ts the same way the rest of this file
    // reads it — by text, because CI runs Node 20 and cannot import TS.
    const tsChannels = [
      ...extractStatement(
        "SIGNUP_CHANNELS",
        /export const SIGNUP_CHANNELS[^=]*=\s*\[/
      ).matchAll(/"([^"]+)"/g),
    ]
      .map((m) => m[1])
      .sort();

    try {
      assert.deepStrictEqual(sqlChannels, tsChannels);
      console.log(`  ✓ ${name} (${tsChannels.length} channels)`);
      passed++;
    } catch {
      const onlyTs = tsChannels.filter((c) => !sqlChannels.includes(c));
      const onlySql = sqlChannels.filter((c) => !tsChannels.includes(c));
      console.error(`  ✗ ${name}`);
      if (onlyTs.length)
        console.error(`      in attribution.ts but not the constraint: ${onlyTs.join(", ")}`);
      if (onlySql.length)
        console.error(`      in the constraint but not attribution.ts: ${onlySql.join(", ")}`);
    }
  }
}

if (passed === testCases.length) {
  console.log(`\n[SUCCESS] All ${passed} test cases passed.`);
  process.exit(0);
} else {
  console.error(`\n[FAILED] ${testCases.length - passed} test cases failed.`);
  process.exit(1);
}
