-- Migration: Convert document URL columns from single text to text arrays
-- Run this against your Supabase database if upgrading from single-file to multi-file uploads

-- 1. Add new array columns
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_urls text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS eob_urls text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS invoice_urls text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS credit_card_statement_urls text[] NOT NULL DEFAULT '{}';

-- 2. Migrate existing data from old single-value columns into the new arrays
UPDATE public.expenses SET receipt_urls = ARRAY[receipt_url]
  WHERE receipt_url IS NOT NULL AND receipt_url != '' AND receipt_urls = '{}';

UPDATE public.expenses SET eob_urls = ARRAY[eob_url]
  WHERE eob_url IS NOT NULL AND eob_url != '' AND eob_urls = '{}';

UPDATE public.expenses SET invoice_urls = ARRAY[invoice_url]
  WHERE invoice_url IS NOT NULL AND invoice_url != '' AND invoice_urls = '{}';

UPDATE public.expenses SET credit_card_statement_urls = ARRAY[credit_card_statement_url]
  WHERE credit_card_statement_url IS NOT NULL AND credit_card_statement_url != '' AND credit_card_statement_urls = '{}';

-- 3. Drop old single-value columns
ALTER TABLE public.expenses DROP COLUMN IF EXISTS receipt_url;
ALTER TABLE public.expenses DROP COLUMN IF EXISTS eob_url;
ALTER TABLE public.expenses DROP COLUMN IF EXISTS invoice_url;
ALTER TABLE public.expenses DROP COLUMN IF EXISTS credit_card_statement_url;

-- 4. Update the audit_ready trigger to use array columns
CREATE OR REPLACE FUNCTION public.compute_audit_ready()
RETURNS trigger AS $$
BEGIN
  new.audit_ready := (
    array_length(new.receipt_urls, 1) IS NOT NULL AND array_length(new.receipt_urls, 1) > 0 AND
    (
      (array_length(new.eob_urls, 1) IS NOT NULL AND array_length(new.eob_urls, 1) > 0) OR
      (array_length(new.invoice_urls, 1) IS NOT NULL AND array_length(new.invoice_urls, 1) > 0)
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 5. Re-compute audit_ready for all existing rows
UPDATE public.expenses SET audit_ready = (
  array_length(receipt_urls, 1) IS NOT NULL AND array_length(receipt_urls, 1) > 0 AND
  (
    (array_length(eob_urls, 1) IS NOT NULL AND array_length(eob_urls, 1) > 0) OR
    (array_length(invoice_urls, 1) IS NOT NULL AND array_length(invoice_urls, 1) > 0)
  )
);
