import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Normalizes a document URL or relative path to a storage object path.
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

/**
 * Creates a short-lived signed URL for downloading/viewing a document.
 * Defaults to 60 seconds.
 */
export async function createDocumentSignedUrl(
  pathOrUrl: string,
  expiresInSeconds: number = 60
): Promise<string> {
  const filePath = normalizeStoragePath(pathOrUrl);
  if (!filePath) {
    throw new Error("Invalid document path");
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.storage
    .from("hsa-documents")
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message || "Unknown error"}`);
  }

  return data.signedUrl;
}

/**
 * Directly downloads a document buffer from Supabase Storage without an external HTTP fetch.
 * Uses the server-side Supabase client.
 */
export async function downloadDocumentBuffer(
  pathOrUrl: string
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const filePath = normalizeStoragePath(pathOrUrl);
  if (!filePath) {
    throw new Error("Invalid document path");
  }

  const supabase = await createServerClient();
  const { data: blob, error } = await supabase.storage
    .from("hsa-documents")
    .download(filePath);

  if (error || !blob) {
    throw new Error(`Failed to download document from storage: ${error?.message || "Not found"}`);
  }

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = filePath.split("/").pop() || "document";
  const contentType = blob.type || "application/octet-stream";

  return { buffer, filename, contentType };
}
