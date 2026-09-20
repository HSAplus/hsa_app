/**
 * Normalizes a document URL or relative path to a storage object path.
 * Safe for use in both Client Components and Server Components.
 *
 * Handles:
 * - Full public URLs: https://<proj>.supabase.co/storage/v1/object/public/hsa-documents/<user_id>/<folder>/<file>
 * - Full signed URLs: https://<proj>.supabase.co/storage/v1/object/sign/hsa-documents/<user_id>/<folder>/<file>?token=...
 * - Relative paths: <user_id>/<folder>/<file>
 *
 * Security:
 * - Allowlist philosophy: Valid storage keys are strictly formatted as
 *   `${user.id}/${folder}/${timestamp}-${filename}` using [a-zA-Z0-9._-].
 * - Rejects any path containing '%' (blocks all percent-encoding variants: single, double, triple, null-byte).
 * - Rejects any path containing '..' or '.' dot segments, backslashes, or empty segments ('//').
 * - Returns "" for any invalid or malicious path, triggering existing `if (!filePath)` guards.
 */
export function normalizeStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return "";

  let rawPath = urlOrPath;

  // If it's a full URL, extract the path segment after hsa-documents
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    try {
      const url = new URL(urlOrPath);
      const match = url.pathname.match(
        /\/object\/(?:public|sign)\/hsa-documents\/(.+)$/
      );
      if (match && match[1]) {
        rawPath = match[1];
      } else {
        const fallbackMatch = url.pathname.match(/\/hsa-documents\/(.+)$/);
        if (fallbackMatch && fallbackMatch[1]) {
          rawPath = fallbackMatch[1];
        }
      }
    } catch {
      return "";
    }
  }

  // Reject any percent-encoding (%2e, %252e, etc.). Valid storage keys never contain '%'
  if (/%/.test(rawPath)) {
    return "";
  }

  // Reject backslashes
  if (/\\/.test(rawPath)) {
    return "";
  }

  // Strip leading and trailing slashes
  const cleanPath = rawPath.replace(/^\/+/, "").replace(/\/+$/, "");

  // Reject dot segments ('.', '..') and empty segments ('//')
  const segments = cleanPath.split("/");
  if (segments.some((seg) => seg === "." || seg === ".." || seg === "")) {
    return "";
  }

  return cleanPath;
}
