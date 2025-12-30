-- =========================
-- FIX DEADLINES UNIQUE CONSTRAINT FOR CUSTOM REMINDERS
-- Run this in Supabase SQL Editor
-- =========================

-- The current unique constraint prevents multiple custom reminders per case
-- since they all share type='custom'. We need a partial index instead.

-- Step 1: Drop the existing constraint
ALTER TABLE deadlines 
DROP CONSTRAINT IF EXISTS deadlines_case_type_unique;

-- Step 2: Create a partial unique index that only applies to non-custom types
-- This allows unlimited custom reminders while still enforcing uniqueness for
-- termination_notice and rent_payment types
CREATE UNIQUE INDEX IF NOT EXISTS deadlines_case_type_unique_non_custom 
ON deadlines (case_id, type) 
WHERE type != 'custom';

-- Verify the change
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'deadlines';
