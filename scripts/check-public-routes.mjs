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
// `url: baseUrl` with no suffix is the home page, which is always public.

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
