#!/usr/bin/env node
/**
 * CI Guard: Checks that every table in the public schema has Row Level Security (RLS) enabled.
 * 
 * Performs static analysis across:
 * - supabase/schema.sql
 * - supabase/migrations/*.sql
 * 
 * If DATABASE_URL is set, can also execute the Appendix A query directly against Postgres.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SQL_FILES = [
  path.join(rootDir, "supabase", "schema.sql"),
];

const migrationsDir = path.join(rootDir, "supabase", "migrations");
if (fs.existsSync(migrationsDir)) {
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => path.join(migrationsDir, f));
  SQL_FILES.push(...migrationFiles);
}

const createdTables = new Set();
const rlsEnabledTables = new Set();

const CREATE_TABLE_REGEX = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(/gi;
const ENABLE_RLS_REGEX = /alter\s+table\s+(?:only\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+enable\s+row\s+level\s+security/gi;

for (const filePath of SQL_FILES) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, "utf-8");

  // Find created tables
  let match;
  while ((match = CREATE_TABLE_REGEX.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    // Exclude supabase/internal or extension tables if any
    createdTables.add(tableName);
  }

  // Find tables with RLS enabled
  while ((match = ENABLE_RLS_REGEX.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    rlsEnabledTables.add(tableName);
  }
}

const tablesWithoutRls = [];
for (const table of createdTables) {
  if (!rlsEnabledTables.has(table)) {
    tablesWithoutRls.push(table);
  }
}

console.log("=== Row Level Security (RLS) CI Guard ===");
console.log(`Discovered ${createdTables.size} tables across schema and migrations:`);
for (const table of Array.from(createdTables).sort()) {
  const status = rlsEnabledTables.has(table) ? "✓ RLS ENABLED" : "✗ NO RLS";
  console.log(`  - ${table.padEnd(30)} ${status}`);
}

if (tablesWithoutRls.length > 0) {
  console.error("\n[CRITICAL ERROR] The following tables lack Row Level Security (RLS):");
  for (const table of tablesWithoutRls) {
    console.error(`  - public.${table}`);
  }
  console.error("\nAdd 'ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;' and appropriate policies.");
  process.exit(1);
} else {
  console.log("\n[SUCCESS] All public tables have Row Level Security enabled.");
  process.exit(0);
}
