import { createClient as createServerClient } from "@/lib/supabase/server";
import { normalizeStoragePath } from "@/lib/storage";

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
