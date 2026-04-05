-- Supabase upsert in src/lib/plaid-sync.ts uses onConflict: 'user_id,plaid_transaction_id'.
-- Your live table may omit this if the table was created from a partial / context-only script.
-- Resolve duplicate rows first if this fails.

create unique index if not exists plaid_transactions_user_id_plaid_transaction_id_key
  on public.plaid_transactions (user_id, plaid_transaction_id);
