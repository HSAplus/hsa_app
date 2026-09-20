/**
 * Normalizes a document URL or relative path to a storage object path.
 * Safe for use in both Client Components and Server Components.
 *
 * Handles:
 * - Full public URLs: https://<proj>.supabase.co/storage/v1/object/public/hsa-documents/<user_id>/<folder>/<file>
 * - Full signed URLs: https://<proj>.supabase.co/storage/v1/object/sign/hsa-documents/<user_id>/<folder>/<file>?token=...
 * - Relative paths: <user_id>/<folder>/<file>
 */
export function normalizeStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return "";

  // If it's already a relative path (e.g. userId/receipt/123-file.pdf)
  if (!urlOrPath.startsWith("http://") && !urlOrPath.startsWith("https://")) {
    return urlOrPath.replace(/^\/+/, "");
  }

  try {
    const url = new URL(urlOrPath);
    // Match /object/public/hsa-documents/<path> or /object/sign/hsa-documents/<path>
    const match = url.pathname.match(
      /\/object\/(?:public|sign)\/hsa-documents\/(.+)$/
    );
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    // Fallback: take the pathname after /hsa-documents/
    const fallbackMatch = url.pathname.match(/\/hsa-documents\/(.+)$/);
    if (fallbackMatch && fallbackMatch[1]) {
      return decodeURIComponent(fallbackMatch[1]);
    }
    return urlOrPath;
  } catch {
    return urlOrPath;
  }
}
