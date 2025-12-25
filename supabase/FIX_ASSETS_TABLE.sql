-- =========================
-- FIX ASSETS TABLE FOR MOBILE UPLOADS
-- Run this in Supabase SQL Editor IMMEDIATELY
-- =========================

-- 1. Add missing asset_type ENUM values
DO $$ BEGIN
  ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'deposit_proof';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'walkthrough_video';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'issue_photo';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'issue_video';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add missing columns to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS original_name TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_hash TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS phase TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS duration_seconds INT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS codec TEXT;

-- 3. Verify enum values
SELECT 'ASSET TYPES NOW AVAILABLE:' as info;
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'asset_type'::regtype
ORDER BY enumlabel;

-- 4. Verify assets table columns
SELECT 'ASSETS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'assets'
ORDER BY ordinal_position;

SELECT 'Assets table fix complete!' as status;
