import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "plaid";
import {
  getBalance,
  transactionsSyncAll,
  isPlaidLoginRequiredError,
  getPlaidErrorMessage,
} from "@/lib/plaid";

export interface HsaConnectionRow {
  id: string;
  user_id: string;
  plaid_access_token: string;
  account_id: string | null;
  transactions_cursor: string | null;
}

function txAppliesToAccount(t: Transaction, linkedAccountId: string | null): boolean {
  if (!linkedAccountId) return true;
  return t.account_id === linkedAccountId;
}

function mapTxToDbRow(
  userId: string,
  t: Transaction,
  preserve?: { reconciliation_status: string; matched_expense_id: string | null } | null
): Record<string, unknown> {
  return {
    user_id: userId,
    plaid_transaction_id: t.transaction_id,
    account_id: t.account_id,
    amount: t.amount,
    iso_currency_code: t.iso_currency_code ?? "USD",
    date: t.date,
    name: t.name,
    merchant_name: t.merchant_name ?? null,
    pending: t.pending,
    raw: t as unknown as object,
    reconciliation_status: preserve?.reconciliation_status ?? "unmatched",
    matched_expense_id: preserve?.matched_expense_id ?? null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Sync balance + transactions for one HSA connection row.
 * Updates profiles (balance, plaid_inbound_ytd), hsa_connections (cursor, sync fields), and plaid_transactions.
 */
export async function syncPlaidForConnection(
  supabase: SupabaseClient,
  conn: HsaConnectionRow
): Promise<{ ok: boolean; error?: string }> {
  const { user_id: userId, plaid_access_token: token, account_id: linkedAccountId } = conn;

  try {
    const balance = await getBalance(token, linkedAccountId);

    const { nextCursor, added, modified, removed } = await transactionsSyncAll(
      token,
      conn.transactions_cursor,
      linkedAccountId
    );

    const toUpsert: Transaction[] = [];
    for (const t of [...added, ...modified]) {
      if (!txAppliesToAccount(t, linkedAccountId)) continue;
      toUpsert.push(t);
    }

    const txIds = toUpsert.map((t) => t.transaction_id);
    const existingMap = new Map<
      string,
      { reconciliation_status: string; matched_expense_id: string | null }
    >();
    if (txIds.length > 0) {
      const { data: existingRows } = await supabase
        .from("plaid_transactions")
        .select("plaid_transaction_id, reconciliation_status, matched_expense_id")
        .eq("user_id", userId)
        .in("plaid_transaction_id", txIds);
      for (const r of existingRows ?? []) {
        existingMap.set(r.plaid_transaction_id as string, {
          reconciliation_status: r.reconciliation_status as string,
          matched_expense_id: (r.matched_expense_id as string | null) ?? null,
        });
      }
    }

    const chunkSize = 80;
    for (let i = 0; i < toUpsert.length; i += chunkSize) {
      const chunk = toUpsert
        .slice(i, i + chunkSize)
        .map((t) => mapTxToDbRow(userId, t, existingMap.get(t.transaction_id) ?? null));
      if (chunk.length === 0) continue;
      const { error: upErr } = await supabase.from("plaid_transactions").upsert(chunk, {
        onConflict: "user_id,plaid_transaction_id",
      });
      if (upErr) {
        console.error("plaid_transactions upsert:", upErr);
        return { ok: false, error: upErr.message };
      }
    }

    const removedIds = removed.map((r) => r.transaction_id).filter(Boolean);
    if (removedIds.length > 0) {
      await supabase
        .from("plaid_transactions")
        .delete()
        .eq("user_id", userId)
        .in("plaid_transaction_id", removedIds);
    }

    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    let inboundQuery = supabase
      .from("plaid_transactions")
      .select("amount")
      .eq("user_id", userId)
      .gte("date", yearStart)
      .eq("pending", false);

    if (linkedAccountId) {
      inboundQuery = inboundQuery.eq("account_id", linkedAccountId);
    }

    const { data: amounts, error: sumErr } = await inboundQuery;
    if (sumErr) {
      console.error("plaid inbound sum:", sumErr);
    }

    let plaidInboundYtd: number | null = null;
    if (amounts && amounts.length > 0) {
      plaidInboundYtd = amounts.reduce((sum, row: { amount: number }) => {
        const a = Number(row.amount);
        if (a < 0) return sum + -a;
        return sum;
      }, 0);
    }

    const now = new Date().toISOString();

    await supabase
      .from("hsa_connections")
      .update({
        transactions_cursor: nextCursor,
        last_transactions_sync_at: now,
        last_synced_at: now,
        sync_status: "ok",
        sync_error: null,
        updated_at: now,
      })
      .eq("id", conn.id);

    await supabase
      .from("profiles")
      .update({
        current_hsa_balance: balance,
        plaid_inbound_ytd: plaidInboundYtd,
        last_plaid_contribution_sync_at: now,
        updated_at: now,
      })
      .eq("id", userId);

    return { ok: true };
  } catch (err) {
    const msg = getPlaidErrorMessage(err);
    const loginReq = isPlaidLoginRequiredError(err);
    const status = loginReq ? "login_required" : "error";
    await supabase
      .from("hsa_connections")
      .update({
        sync_status: status,
        sync_error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conn.id);
    return { ok: false, error: msg };
  }
}
