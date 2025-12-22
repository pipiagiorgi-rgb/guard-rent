-- =================================================================
-- RENTVAULT - COMPLETE CORRECTED SCHEMA
-- Includes Security Fixes for 'Unrestricted' Warnings
-- Safe to run multiple times (idempotent)
-- =================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1. PROFILES
-- =========================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================
-- 2. ENUM TYPES
-- =========================
DO $$ BEGIN CREATE TYPE case_status AS ENUM ('active', 'closed', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE purchase_type AS ENUM ('checkin', 'moveout', 'bundle'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE deletion_status AS ENUM ('active', 'pending_deletion', 'deleted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE audit_reason AS ENUM ('user_request', 'retention_expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE output_type AS ENUM ('contract_scan', 'translation', 'checkin_report', 'deposit_pack'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- 3. CASES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS cases (
  case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  country TEXT NOT NULL,
  address TEXT,
  lease_start DATE,
  lease_end DATE,
  contract_analysis JSONB,
  contract_file_name TEXT,
  contract_uploaded_at TIMESTAMPTZ,
  contract_text TEXT,
  translation_saved TEXT,
  checkin_meter_readings JSONB,
  checkin_completed_at TIMESTAMPTZ,
  handover_notes TEXT,
  handover_completed_at TIMESTAMPTZ,
  keys_returned_at TIMESTAMPTZ,
  meter_readings JSONB,
  status case_status DEFAULT 'active',
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  purchase_type purchase_type,
  purchase_at TIMESTAMPTZ,
  retention_until TIMESTAMPTZ,
  grace_until TIMESTAMPTZ,
  deletion_status deletion_status DEFAULT 'active',
  expiry_notified_at TIMESTAMPTZ,
  final_expiry_notified_at TIMESTAMPTZ,
  extension_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own cases" ON cases;
CREATE POLICY "Users can CRUD own cases"
ON cases FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);

-- =========================
-- 4. ROOMS
-- =========================
CREATE TABLE IF NOT EXISTS rooms (
  room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT DEFAULT 'custom',
  photo_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own rooms" ON rooms;
CREATE POLICY "Users can CRUD own rooms"
ON rooms FOR ALL
USING (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = rooms.case_id AND cases.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = rooms.case_id AND cases.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_rooms_case_id ON rooms(case_id);

-- =========================
-- 5. ASSETS TABLE
-- =========================
-- Drop view first to avoid dependency errors when recreating assets/rooms
DROP VIEW IF EXISTS room_photo_counts CASCADE;

CREATE TABLE IF NOT EXISTS assets (
  asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own assets" ON assets;
CREATE POLICY "Users can CRUD own assets"
ON assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assets_case_id ON assets(case_id);
CREATE INDEX IF NOT EXISTS idx_assets_room_id ON assets(room_id);

-- [SECURITY FIX] Added 'WITH (security_invoker = true)' so view respects RLS
CREATE OR REPLACE VIEW room_photo_counts WITH (security_invoker = true) AS
SELECT 
  r.room_id, r.case_id, r.name,
  COUNT(a.asset_id) FILTER (WHERE a.type IN ('photo', 'checkin_photo')) as checkin_photos,
  COUNT(a.asset_id) FILTER (WHERE a.type = 'handover_photo') as handover_photos
FROM rooms r LEFT JOIN assets a ON a.room_id = r.room_id
GROUP BY r.room_id, r.case_id, r.name;

-- =========================
-- 6. OUTPUTS
-- =========================
CREATE TABLE IF NOT EXISTS outputs (
  output_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type output_type NOT NULL,
  payload JSONB NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own outputs" ON outputs;
CREATE POLICY "Users can CRUD own outputs"
ON outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_outputs_case_id ON outputs(case_id);

-- =========================
-- 7. DEADLINES
-- =========================
CREATE TABLE IF NOT EXISTS deadlines (
  deadline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  preferences JSONB,
  notified_at TIMESTAMPTZ,
  last_notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own deadlines" ON deadlines;
CREATE POLICY "Users can CRUD own deadlines"
ON deadlines FOR ALL
USING (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = deadlines.case_id AND cases.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = deadlines.case_id AND cases.user_id = auth.uid()));

-- =========================
-- 8. PURCHASES
-- =========================
CREATE TABLE IF NOT EXISTS purchases (
  purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  pack_type TEXT NOT NULL,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'EUR',
  stripe_payment_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
CREATE POLICY "Users can insert own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_case_id ON purchases(case_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);

-- =========================
-- 9. CHECKIN METERS
-- =========================
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
USING (case_id IN (SELECT case_id FROM cases WHERE user_id = auth.uid()));

-- =========================
-- 10. DELETION AUDIT
-- =========================
CREATE TABLE IF NOT EXISTS deletion_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID,
  reason audit_reason NOT NULL,
  objects_deleted INT DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT now()
);

-- [SECURITY FIX] Enable RLS and add policies
ALTER TABLE deletion_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own deletion logs" ON deletion_audit;
CREATE POLICY "Users can view own deletion logs"
ON deletion_audit FOR SELECT
USING (case_id IN (SELECT case_id FROM cases WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert deletion logs" ON deletion_audit;
CREATE POLICY "Users can insert deletion logs"
ON deletion_audit FOR INSERT
WITH CHECK (case_id IN (SELECT case_id FROM cases WHERE user_id = auth.uid()));

-- =========================
-- 11. AUTO-CREATE PROFILE TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================
-- DONE
-- =========================
SELECT 'RentVault schema complete and secured!' as status;
