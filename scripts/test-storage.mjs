#!/usr/bin/env node
/**
 * Automated test suite for storage path normalization and path traversal defense.
 */

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageFilePath = path.resolve(__dirname, "..", "src", "lib", "storage.ts");

// Extract the function implementation from TypeScript file to test directly in Node
const storageContent = fs.readFileSync(storageFilePath, "utf-8");
const fnMatch = storageContent.match(/export function normalizeStoragePath[\s\S]*?^}/m);

if (!fnMatch) {
  console.error("Failed to find normalizeStoragePath in storage.ts");
  process.exit(1);
}

const fnCode = fnMatch[0]
  .replace("export function", "function")
  .replace(/:\s*string/g, "");
const normalizeStoragePath = new Function(`${fnCode}; return normalizeStoragePath;`)();

const testCases = [
  // Traversal attacks
  { name: "Bare dot-dot traversal", input: "me/../victim/secret.pdf", expected: "" },
  { name: "Double percent-encoded traversal", input: "me/%252e%252e/victim/secret.pdf", expected: "" },
  { name: "Single percent-encoded traversal", input: "me/%2e%2e/victim/secret.pdf", expected: "" },
  { name: "Single percent-encoded slash", input: "me%2fsecret.pdf", expected: "" },
  { name: "Plain percent sign", input: "me/%25/secret.pdf", expected: "" },
  { name: "Null byte injection", input: "me/%00/secret.pdf", expected: "" },
  { name: "Current directory dot segment", input: "me/./secret.pdf", expected: "" },
  { name: "Double slash empty segment", input: "me//secret.pdf", expected: "" },
  { name: "Backslash traversal", input: "me\\..\\victim\\secret.pdf", expected: "" },
  { name: "CRLF injection", input: "me/receipt/a.pdf\r\nX: y", expected: "" },
  { name: "Newline injection", input: "me/receipt/a.pdf\n", expected: "" },
  { name: "Tab character", input: "me/receipt/\ta.pdf", expected: "" },

  // URL-based traversal attacks
  {
    name: "URL with percent-encoded traversal",
    input: "https://xyz.supabase.co/storage/v1/object/public/hsa-documents/me/%252e%252e/victim/secret.pdf",
    expected: "",
  },

  // Valid paths
  {
    name: "Valid relative storage path",
    input: "550e8400-e29b-41d4-a716-446655440000/receipt/1726857600000-receipt.pdf",
    expected: "550e8400-e29b-41d4-a716-446655440000/receipt/1726857600000-receipt.pdf",
  },
  {
    name: "Valid public URL",
    input: "https://xyz.supabase.co/storage/v1/object/public/hsa-documents/550e8400-e29b-41d4-a716-446655440000/receipt/1726857600000-receipt.pdf",
    expected: "550e8400-e29b-41d4-a716-446655440000/receipt/1726857600000-receipt.pdf",
  },
  {
    name: "Valid signed URL with token",
    input: "https://xyz.supabase.co/storage/v1/object/sign/hsa-documents/550e8400-e29b-41d4-a716-446655440000/receipt/1726857600000-receipt.pdf?token=abc123xyz",
    expected: "550e8400-e29b-41d4-a716-446655440000/receipt/1726857600000-receipt.pdf",
  },
];

console.log("=== Storage Path Security Test Suite ===");
let passed = 0;
for (const tc of testCases) {
  const actual = normalizeStoragePath(tc.input);
  try {
    assert.strictEqual(actual, tc.expected);
    console.log(`  ✓ ${tc.name}`);
    passed++;
  } catch {
    console.error(`  ✗ ${tc.name}: expected '${tc.expected}', got '${actual}'`);
  }
}

if (passed === testCases.length) {
  console.log(`\n[SUCCESS] All ${passed} security test cases passed.`);
  process.exit(0);
} else {
  console.error(`\n[FAILED] ${testCases.length - passed} test cases failed.`);
  process.exit(1);
}
