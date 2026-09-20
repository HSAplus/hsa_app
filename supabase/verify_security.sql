-- ==============================================================================
-- Supabase Security Verification Queries (Appendix A)
-- Run these queries directly in Supabase SQL Editor against PRODUCTION
-- ==============================================================================

-- 1. Which public tables lack RLS? Expect zero rows.
SELECT c.relname AS table_without_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT c.relrowsecurity;

-- 2. Is the document bucket public? Expect: public = false
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'hsa-documents';

-- 3. Any storage policy granting unconditional unauthenticated read? Expect: 0 rows
SELECT policyname, qual, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname ILIKE '%public%';

-- 4. Confirm user-scoped storage policies exist on storage.objects
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND qual ILIKE '%hsa-documents%';

-- 5. Confirm the Stripe lookup index exists on profiles. Expect: 1 row
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND indexdef ILIKE '%stripe_customer_id%';

-- 6. Confirm RLS policies on claims and hsa_administrators
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('claims', 'hsa_administrators');
