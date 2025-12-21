-- =========================
-- RENTVAULT - HANDOVER & EVIDENCE FLOW SCHEMA
-- Run this after the main schema
-- =========================

-- =========================
-- UPDATE ASSET TYPES
-- =========================
-- Add new asset types for evidence flow
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

-- =========================
-- UPDATE CASES TABLE - HANDOVER FIELDS
-- =========================
ALTER TABLE cases ADD COLUMN IF NOT EXISTS handover_notes TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS handover_completed_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS keys_returned_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS meter_readings JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS checkin_completed_at TIMESTAMPTZ;

-- =========================
-- UPDATE ROOMS TABLE - BETTER TRACKING
-- =========================
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'custom';
-- room_type: 'living_room', 'kitchen', 'bathroom', 'bedroom', 'custom'

-- =========================
-- PURCHASE RECORDS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS purchases (
    purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    pack_type TEXT NOT NULL,  -- 'checkin_pack', 'deposit_pack'
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

-- =========================
-- HELPER VIEWS (OPTIONAL)
-- =========================
-- View to get photo counts per room per type
CREATE OR REPLACE VIEW room_photo_counts AS
SELECT 
    r.room_id,
    r.case_id,
    r.name as room_name,
    COUNT(CASE WHEN a.type = 'checkin_photo' THEN 1 END) as checkin_photos,
    COUNT(CASE WHEN a.type = 'handover_photo' THEN 1 END) as handover_photos
FROM rooms r
LEFT JOIN assets a ON a.room_id = r.room_id
GROUP BY r.room_id, r.case_id, r.name;

-- =========================
-- VERIFICATION
-- =========================
SELECT 'CASES HANDOVER COLUMNS' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cases' 
AND column_name IN ('handover_notes', 'handover_completed_at', 'keys_returned_at', 'meter_readings', 'checkin_completed_at');

SELECT 'PURCHASES TABLE' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'purchases';

SELECT 'Schema update complete!' as status;
