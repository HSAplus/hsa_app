-- Migration: Add HSA investment & tax fields to profiles
-- Run this in Supabase SQL Editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_hsa_balance decimal(12,2) NOT NULL DEFAULT 0.00;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS annual_contribution decimal(10,2) NOT NULL DEFAULT 4150.00;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS federal_tax_bracket decimal(4,1) NOT NULL DEFAULT 22.0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS state_tax_rate decimal(4,1) NOT NULL DEFAULT 5.0;
