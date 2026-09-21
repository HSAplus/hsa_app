-- ============================================================================
-- Merge the stale PayFlex row into Inspira Financial
-- ============================================================================
-- Running the registry migration surfaced two rows for one company:
--
--   slug                id                 name               tier
--   payflex             payflex            PayFlex            portal
--   inspira-financial   inspira-financial  Inspira Financial  fax
--
-- PayFlex *became* Inspira Financial on 1 January 2024. Same company, same
-- accounts. The `payflex` row predates the rebrand and was never updated.
--
-- Leaving it costs more than a duplicate listing:
--   - /hsa-providers shows the same company twice, one entry contradicting
--     the other on how to submit a claim
--   - anyone whose profile points at `payflex` gets submission_tier 'portal'
--     when Inspira actually takes claims by fax
--   - the `inspira-financial` row already carries {PayFlex} in former_names,
--     so searching "PayFlex" on the hub already finds the correct row
--
-- Checked against production on 2026-09-20: 0 claims and 0 profiles reference
-- `payflex`, so nothing is lost by removing it outright. The block below
-- re-checks rather than trusting that, because this also has to be correct on
-- a database where the answer is different.
--
--   select
--     (select count(*) from public.claims   where administrator_id    = 'payflex') as claims,
--     (select count(*) from public.profiles where hsa_administrator_id = 'payflex') as profiles;
--
-- ============================================================================

-- Profiles drive FUTURE submissions, so these are repointed first regardless.
-- A profile left on `payflex` would keep routing new claims to a portal that
-- is no longer how this administrator takes them.
update public.profiles
set hsa_administrator_id = 'inspira-financial'
where hsa_administrator_id = 'payflex';

do $$
declare
  claim_count bigint;
begin
  select count(*) into claim_count
  from public.claims
  where administrator_id = 'payflex';

  if claim_count = 0 then
    -- Nothing points at it, so delete rather than leaving a contradictory
    -- row in the table for whoever reads it next.
    delete from public.hsa_administrators where id = 'payflex';
    raise notice 'payflex: deleted (no claims referenced it)';
  else
    -- Claims are deliberately NOT repointed. A claim submitted in 2023 was
    -- submitted to PayFlex — a historical fact about where documents actually
    -- went, and rewriting it would make the record say something untrue. The
    -- foreign key targets id, not active, so those keep resolving against a
    -- deactivated row, which already disappears from hsa_providers_public
    -- and so from every public page.
    update public.hsa_administrators set active = false where id = 'payflex';
    raise notice 'payflex: deactivated (% claim(s) still reference it)', claim_count;
  end if;
end;
$$;

-- ============================================================================
-- Separate issue found at the same time, NOT changed here
-- ============================================================================
-- HSA Bank is the only provider on submission_tier = 'email', and
-- accepts_email_phi defaults to false, so every HSA Bank claim now fails with
-- an explanatory message instead of sending.
--
-- That is the intended behaviour, and it is safer than what happened before:
-- previously these claims mailed patient names, providers, service
-- descriptions and amounts over ordinary SMTP, which is not a HIPAA-compliant
-- channel for PHI.
--
-- But it does mean HSA Bank claims do not work at all until someone
-- establishes how they actually accept them. Two ways to resolve it, both
-- requiring research first — do not guess:
--
--   -- If a published claims intake address is verified to accept PHI:
--   update public.hsa_administrators
--   set accepts_email_phi = true, email_address = '<verified address>'
--   where id = 'hsa_bank';
--
--   -- More likely: move it to the channel they actually document.
--   update public.hsa_administrators
--   set submission_tier = 'fax', fax_number = '<from their claim form>'
--   where id = 'hsa_bank';
-- ============================================================================
