import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractReceiptDataFromBuffer } from "@/lib/receipt-scanner";
import { getPlanLimits } from "@/lib/plans";
import { normalizeStoragePath } from "@/lib/storage";
import type { PlanType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .single();

    const planType: PlanType = profile?.plan_type ?? "free";
    const limits = getPlanLimits(planType);

    if (!limits.allowReceiptScanning) {
      return NextResponse.json(
        { error: "Receipt scanning requires HSA Plus. Upgrade to unlock this feature." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Explicitly reject imageUrl to completely eliminate SSRF vector
    if ("imageUrl" in body) {
      return NextResponse.json(
        { error: "imageUrl is disabled for security. Provide filePath instead." },
        { status: 400 }
      );
    }

    const { filePath } = body as { filePath?: string };

    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json(
        { error: "filePath is required" },
        { status: 400 }
      );
    }

    const normalizedPath = normalizeStoragePath(filePath);

    // Verify the file belongs to the authenticated user
    if (!normalizedPath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: "Unauthorized access to document" },
        { status: 403 }
      );
    }

    // Download bytes directly from Supabase Storage — no external HTTP fetch
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("hsa-documents")
      .download(normalizedPath);

    if (downloadError || !fileBlob) {
      return NextResponse.json(
        { error: downloadError?.message || "Failed to download receipt from storage" },
        { status: 404 }
      );
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = fileBlob.type || "image/jpeg";

    const result = await extractReceiptDataFromBuffer(buffer, contentType);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Receipt scan error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to scan receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
