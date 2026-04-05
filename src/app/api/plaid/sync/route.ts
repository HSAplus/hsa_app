import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncPlaidForConnection } from "@/lib/plaid-sync";
import type { HsaConnectionRow } from "@/lib/plaid-sync";

/**
 * Cron-invokable: sync all Plaid HSA connections (balance + transactions).
 * Secure with Authorization: Bearer CRON_SECRET (same pattern as /api/digest).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: connections, error } = await supabase
    .from("hsa_connections")
    .select("id, user_id, plaid_access_token, account_id, transactions_cursor");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!connections?.length) {
    return NextResponse.json({ message: "No Plaid connections", synced: 0 });
  }

  let ok = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of connections) {
    const conn: HsaConnectionRow = {
      id: row.id as string,
      user_id: row.user_id as string,
      plaid_access_token: row.plaid_access_token as string,
      account_id: (row.account_id as string | null) ?? null,
      transactions_cursor: (row.transactions_cursor as string | null) ?? null,
    };
    const result = await syncPlaidForConnection(supabase, conn);
    if (result.ok) ok += 1;
    else {
      failed += 1;
      if (result.error) errors.push(`${conn.user_id}: ${result.error}`);
    }
  }

  return NextResponse.json({
    message: "Plaid sync complete",
    synced: ok,
    failed,
    errors: errors.slice(0, 20),
  });
}
