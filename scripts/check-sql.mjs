#!/usr/bin/env node
/**
 * CI Guard: dollar-quoted strings in SQL files must be balanced.
 *
 * An unbalanced `$$` turns the rest of the file into one giant string literal.
 * Postgres then fails somewhere far from the actual mistake, or — worse —
 * succeeds at everything before it and leaves the migration half applied.
 *
 * This exists because it has already happened twice: a tool rewriting these
 * files through JavaScript's String.replace, where `$$` in a replacement
 * string is the escape for a literal `$` and silently eats one of them. The
 * damage is invisible on a skim, because `$ language plpgsql` looks almost
 * exactly like `$$ language plpgsql`.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SQL_DIRS = [
  path.join(rootDir, "supabase"),
  path.join(rootDir, "supabase", "migrations"),
  path.join(rootDir, "supabase", "seed"),
];

// $$ or $tag$ — Postgres allows an optional alphanumeric tag between the
// dollars, which is how the provider seed nests markdown inside SQL ($md$).
const DOLLAR_TAG = /\$[a-zA-Z_][a-zA-Z0-9_]*\$|\$\$/g;

const files = [];
for (const dir of SQL_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".sql")) {
      files.push(path.join(dir, entry.name));
    }
  }
}

const problems = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const counts = new Map();

  for (const match of content.match(DOLLAR_TAG) ?? []) {
    counts.set(match, (counts.get(match) ?? 0) + 1);
  }

  for (const [tag, count] of counts) {
    if (count % 2 !== 0) {
      // Point at the last occurrence: with an odd count the opener that never
      // closed is almost always the final one.
      const lines = content.split(/\r?\n/);
      const lineNo = lines.reduce(
        (acc, line, i) => (line.includes(tag) ? i + 1 : acc),
        0
      );
      problems.push({
        file: path.relative(rootDir, file),
        tag,
        count,
        lineNo,
      });
    }
  }
}

console.log("=== SQL Dollar-Quote Balance Guard ===");
console.log(`Checked ${files.length} SQL file(s).`);

if (problems.length > 0) {
  console.error("\n[ERROR] Unbalanced dollar-quoted string(s):");
  for (const p of problems) {
    console.error(
      `  - ${p.file}:${p.lineNo} — ${p.tag} appears ${p.count} time(s), which is odd`
    );
  }
  console.error(
    "\nEvery dollar-quote delimiter must appear an even number of times.\n" +
      "A common cause is a script rewriting the file via JavaScript's\n" +
      "String.replace, where `$$` in the replacement string means a literal `$`."
  );
  process.exit(1);
}

console.log("\n[SUCCESS] All dollar-quoted strings are balanced.");
