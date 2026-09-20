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
 * - Prevents path traversal: rejects any path containing "..", ".", "%2e%2e", or empty segments.
 * - Returns "" if the path is invalid or malicious, triggering existing `if (!filePath)` checks.
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
        rawPath = decodeURIComponent(match[1]);
      } else {
        const fallbackMatch = url.pathname.match(/\/hsa-documents\/(.+)$/);
        if (fallbackMatch && fallbackMatch[1]) {
          rawPath = decodeURIComponent(fallbackMatch[1]);
        }
      }
    } catch {
      return "";
    }
  } else {
    try {
      rawPath = decodeURIComponent(rawPath);
    } catch {
      // Keep rawPath if malformed URI component
    }
  }

  // Strip leading and trailing slashes
  const cleanPath = rawPath.replace(/^\/+/, "").replace(/\/+$/, "");

  // Prevent path traversal and malformed paths:
  // Reject any segment that is ".", "..", or empty (e.g. "//")
  const segments = cleanPath.split("/");
  if (segments.some((seg) => seg === "." || seg === ".." || seg === "")) {
    return "";
  }

  return cleanPath;
}
