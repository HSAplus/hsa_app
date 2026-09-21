/**
 * Loads .env.local.hosted into process.env for the provider registry scripts.
 *
 * Exists so `npm run export:providers` works the same in bash, PowerShell and
 * cmd. The alternative — telling people to prefix the command with the right
 * env-var syntax for their shell — is three different incantations on a repo
 * that is already being worked on from both Git Bash and PowerShell.
 *
 * Not Node's --env-file: that needs 20.6+, and CI pins Node 20.
 *
 * REAL ENVIRONMENT VARIABLES ALWAYS WIN. A value already set is never
 * overwritten, so this is inert in CI and on Vercel, where the platform
 * supplies the real ones.
 *
 * Reads .env.local.hosted specifically, never .env.local — that one points at
 * a local Supabase for `npm run dev`, and these scripts must not silently
 * write to whichever database happens to be configured for development.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = path.join(rootDir, ".env.local.hosted");

export function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;

  const lines = fs.readFileSync(ENV_FILE, "utf-8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = trimmed.slice(eq + 1).trim();
    // Strip one matching pair of surrounding quotes, as dotenv does.
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }

    // An empty value is treated as absent. Vercel returns "" for Sensitive
    // variables that cannot be read back, and a present-but-empty key would
    // otherwise satisfy the scripts' `if (!key)` checks and fail later with a
    // confusing auth error instead of a clear "not set" message.
    if (value === "") continue;

    process.env[key] = value;
  }
}
