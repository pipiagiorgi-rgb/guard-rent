-- =========================
-- STORAGE EXTENSION COLUMNS
-- Run this in Supabase SQL Editor
-- =========================

-- Add storage tracking columns to cases table
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS storage_years_purchased INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS storage_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS storage_extended_at TIMESTAMPTZ;

-- Set default expiry for existing cases (1 year from purchase or creation)
UPDATE cases 
SET storage_expires_at = COALESCE(
    purchased_at + INTERVAL '1 year',
    created_at + INTERVAL '1 year'
)
WHERE storage_expires_at IS NULL;

-- Index for finding expiring cases (for reminder emails)
CREATE INDEX IF NOT EXISTS idx_cases_storage_expires ON cases(storage_expires_at);

-- Grant column access
COMMENT ON COLUMN cases.storage_years_purchased IS 'Total years of storage purchased (default: 1 included with bundle)';
COMMENT ON COLUMN cases.storage_expires_at IS 'When storage expires and data may be deleted';
COMMENT ON COLUMN cases.storage_extended_at IS 'Last time storage was extended';
