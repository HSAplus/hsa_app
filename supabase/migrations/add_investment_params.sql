-- Migration: Add expected_annual_return and time_horizon_years to profiles
-- These are used to project HSA investment growth for the "Expected Return" card.
-- Run this in Supabase SQL Editor.

alter table public.profiles
  add column if not exists expected_annual_return decimal(5,2) not null default 7.00;

alter table public.profiles
  add column if not exists time_horizon_years integer not null default 20;
