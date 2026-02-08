-- Migration: Add middle_name and onboarding_completed to profiles
-- middle_name: optional middle name
-- onboarding_completed: tracks whether user has completed the first-login onboarding popup
-- Run this in Supabase SQL Editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS middle_name text NOT NULL DEFAULT '';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
