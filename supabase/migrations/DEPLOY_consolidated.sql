-- =================================================================
-- RENTVAULT - CONSOLIDATED MIGRATION (Run in Supabase SQL Editor)
-- Version: December 2025
-- =================================================================

-- Run this SQL in your Supabase Dashboard > SQL Editor
-- This consolidates all required schema updates

-- =================================================================
-- 1. ASSET TYPES
-- =================================================================
DO $$ BEGIN
  ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'checkin_photo';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'handover_photo';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'meter_photo';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =================================================================
-- 2. CASES TABLE UPDATES
-- =================================================================
ALTER TABLE cases ADD COLUMN IF NOT EXISTS handover_notes TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS handover_completed_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS keys_returned_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS meter_readings JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS checkin_completed_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_analysis JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_file_name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_uploaded_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_text TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS translation_saved TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS expiry_notified_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS extension_count INT DEFAULT 0;

-- =================================================================
-- 3. ROOMS TABLE
-- =================================================================
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'custom';

-- =================================================================
-- 4. DEADLINES TABLE UPDATES
-- =================================================================
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS preferences JSONB;
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS last_notification_sent_at TIMESTAMPTZ;

-- Create unique constraint for case_id + type (for upsert)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'deadlines_case_type_unique'
    ) THEN
        ALTER TABLE deadlines ADD CONSTRAINT deadlines_case_type_unique 
        UNIQUE (case_id, type);
    END IF;
EXCEPTION WHEN others THEN
    NULL;
END $$;

-- =================================================================
-- 5. PURCHASES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS purchases (
    purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    pack_type TEXT NOT NULL,
    amount_cents INT NOT NULL,
    currency TEXT DEFAULT 'EUR',
    stripe_payment_id TEXT,
    purchased_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases"
ON purchases FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
CREATE POLICY "Users can insert own purchases"
ON purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_case_id ON purchases(case_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);

-- =================================================================
-- 6. CHECKIN METERS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS checkin_meters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
    electricity_reading TEXT,
    gas_reading TEXT,
    water_reading TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE checkin_meters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own checkin meters" ON checkin_meters;
CREATE POLICY "Users can manage own checkin meters"
ON checkin_meters FOR ALL
USING (
    case_id IN (
        SELECT case_id FROM cases WHERE user_id = auth.uid()
    )
);

-- =================================================================
-- 7. VERIFY
-- =================================================================
SELECT 'Migration complete!' as status;
