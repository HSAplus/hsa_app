-- Migration: Add dependents table
-- Run this against your Supabase database if you already have the existing schema

CREATE TABLE IF NOT EXISTS dependents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'dependent_child', 'domestic_partner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only manage their own dependents
CREATE POLICY "Users can view own dependents"
  ON dependents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dependents"
  ON dependents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dependents"
  ON dependents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dependents"
  ON dependents FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_dependents_user_id ON dependents(user_id);
