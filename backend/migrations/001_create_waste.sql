-- Migration: create waste table for logging spoiled/removed flowers
-- Run this in Supabase SQL editor or psql connected to your DB
CREATE TABLE IF NOT EXISTS waste (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gul_id uuid NOT NULL,
  son integer NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Optional index for faster queries by gul_id
CREATE INDEX IF NOT EXISTS idx_waste_gul_id ON waste(gul_id);
