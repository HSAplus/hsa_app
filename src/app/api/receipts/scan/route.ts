import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractReceiptData } from "@/lib/receipt-scanner";
import { getPlanLimits } from "@/lib/plans";
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
    const { imageUrl } = body as { imageUrl?: string };

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const result = await extractReceiptData(imageUrl);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Receipt scan error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to scan receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
