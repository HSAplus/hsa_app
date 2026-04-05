-- Align with plaid_sync_transactions.sql: deleting an expense clears Plaid link instead of blocking.
alter table public.plaid_transactions
  drop constraint if exists plaid_transactions_matched_expense_id_fkey;

alter table public.plaid_transactions
  add constraint plaid_transactions_matched_expense_id_fkey
  foreign key (matched_expense_id) references public.expenses(id) on delete set null;
