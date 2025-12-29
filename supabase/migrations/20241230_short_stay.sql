-- ================================================================
-- MIGRATION: Add Short-Stay Support
-- Safe to run multiple times (idempotent)
-- Created: 2024-12-29
-- ================================================================

-- 1. Add stay_type discriminator
ALTER TABLE cases ADD COLUMN IF NOT EXISTS stay_type TEXT DEFAULT 'long_term' 
  CHECK (stay_type IN ('long_term', 'short_stay'));

-- 2. Add short-stay optional metadata
ALTER TABLE cases ADD COLUMN IF NOT EXISTS platform_name TEXT;  -- 'Airbnb', 'Booking', 'VRBO', 'Other'
ALTER TABLE cases ADD COLUMN IF NOT EXISTS reservation_id TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS check_in_date DATE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS check_out_date DATE;

-- 3. Index for queries
CREATE INDEX IF NOT EXISTS idx_cases_stay_type ON cases(stay_type);

-- 4. Unique constraint on purchases (one pack per case per type for one-time packs)
-- Only applies to known one-time pack types, explicitly listed
DROP INDEX IF EXISTS idx_purchases_case_pack_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_case_pack_unique
  ON purchases(case_id, pack_type)
  WHERE pack_type IN ('checkin', 'moveout', 'bundle', 'short_stay', 'related_contracts');

-- Verification
SELECT '✅ Short-Stay migration complete' as status;
SELECT 'Added: stay_type, platform_name, reservation_id, check_in_date, check_out_date' as columns;
SELECT 'Added: idx_cases_stay_type, idx_purchases_case_pack_unique' as indexes;
