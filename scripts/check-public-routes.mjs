#!/usr/bin/env node
/**
 * CI Guard: every route we advertise to crawlers must be publicly reachable.
 *
 * src/lib/supabase/middleware.ts redirects anonymous requests to /login unless
 * the path matches its publicPaths allowlist. That check runs before the page
 * is served, so a route missing from the list is invisible no matter how
 * correctly it builds or renders.
 *
 * This is easy to get wrong and hard to notice: the page prerenders, the
 * build output looks right, and a logged-in developer sees it fine. Only a
 * logged-out visitor — or Googlebot — gets the 307. /hsa-providers shipped
 * exactly this way, and the pages exist to be read by people who are not
 * logged in.
 *
 * So the invariant: anything listed in sitemap.ts, or explicitly allowed in
 * robots.ts, must be covered by publicPaths.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(rootDir, p), "utf-8");

// ── publicPaths from the middleware ────────────────────────────
const middleware = read("src/lib/supabase/middleware.ts");
const listMatch = middleware.match(/const publicPaths\s*=\s*\[([\s\S]*?)\]/);
if (!listMatch) {
  console.error("Could not find publicPaths in src/lib/supabase/middleware.ts");
  process.exit(1);
}
const publicPaths = [...listMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

// The middleware also treats "/" as public, separately from the array.
const isPublic = (p) =>
  p === "/" || publicPaths.some((allowed) => p.startsWith(allowed));

// ── routes we advertise ────────────────────────────────────────
const advertised = new Map(); // path -> where it came from

const sitemap = read("src/app/sitemap.ts");
for (const m of sitemap.matchAll(/\$\{baseUrl\}(\/[^`"'\s]*)/g)) {
  advertised.set(m[1], "sitemap.ts");
}
// `url: baseUrl` with no suffix is the home page. It is always publicly
// reachable, but it still needs a canonical — it is the single most common
// target for URL variations (utm params, trailing slash, apex vs www).
if (/url:s*baseUrls*,/.test(sitemap)) advertised.set("/", "sitemap.ts");

const robots = read("src/app/robots.ts");
const allowMatch = robots.match(/allow:\s*(\[[\s\S]*?\]|"[^"]*")/);
if (allowMatch) {
  for (const m of allowMatch[1].matchAll(/"([^"]+)"/g)) {
    if (m[1] !== "/") advertised.set(m[1], "robots.ts allow");
  }
}

// ── check ──────────────────────────────────────────────────────
console.log("=== Public Route Guard ===");
console.log(`publicPaths: ${publicPaths.length} entries`);
console.log(`advertised routes: ${advertised.size}`);

const unreachable = [];
for (const [route, source] of advertised) {
  if (!isPublic(route)) unreachable.push({ route, source });
}

if (unreachable.length > 0) {
  console.error(
    "\n[ERROR] These routes are advertised to crawlers but redirect to /login:"
  );
  for (const { route, source } of unreachable) {
    console.error(`  - ${route}   (from ${source})`);
  }
  console.error(
    "\nAdd them to publicPaths in src/lib/supabase/middleware.ts, or stop\n" +
      "advertising them. A route in the sitemap that 307s to /login is worse\n" +
      "than one that isn't there at all — it tells Google a page exists and\n" +
      "then hides it."
  );
  process.exit(1);
}

for (const [route] of advertised) console.log(`  ✓ ${route}`);
console.log("\n[SUCCESS] Every advertised route is publicly reachable.");

// ── canonical URLs on advertised routes ────────────────────────
// Without an explicit canonical, a URL variation — a utm parameter, a
// trailing slash, the apex vs www — is a candidate to be indexed as a
// separate page competing with the original. Every route we put in the
// sitemap should declare which URL is the real one.
console.log("\n=== Canonical URL Guard ===");

const missingCanonical = [];
for (const [route] of advertised) {
  if (route.includes("${")) continue; // dynamic segment, checked in its own file
  if (route.startsWith("/api/")) continue; // JSON, not an indexable document

  // sitemap path -> page file
  const pageFile = path.join(rootDir, "src/app", route === "/" ? "" : route, "page.tsx");
  if (!fs.existsSync(pageFile)) {
    missingCanonical.push({ route, why: "no page.tsx found" });
    continue;
  }
  if (!/canonical/.test(fs.readFileSync(pageFile, "utf-8"))) {
    missingCanonical.push({ route, why: "no canonical in metadata" });
  }
}

if (missingCanonical.length > 0) {
  console.error("\n[ERROR] Advertised routes without a canonical URL:");
  for (const { route, why } of missingCanonical) {
    console.error(`  - ${route}   (${why})`);
  }
  console.error(
    '\nAdd `alternates: { canonical: "<path>" }` to the page metadata.\n' +
      "metadataBase is set in layout.tsx, so a relative path is correct and\n" +
      "stays correct if the domain changes."
  );
  process.exit(1);
}

for (const [route] of advertised) {
  if (!route.includes("${") && !route.startsWith("/api/")) console.log(`  ✓ ${route}`);
}
console.log("\n[SUCCESS] Every advertised route declares a canonical URL.");
