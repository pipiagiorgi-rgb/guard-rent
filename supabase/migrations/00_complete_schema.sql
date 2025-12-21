-- =========================
-- RENTVAULT DATABASE SCHEMA
-- Safe to run multiple times (idempotent)
-- Last updated: December 2024
-- =========================

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
ON profiles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =========================
-- 2. CASES (RENTALS) - ENUM TYPES
-- =========================
DO $$ BEGIN
  CREATE TYPE case_status AS ENUM ('active', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE purchase_type AS ENUM ('checkin', 'moveout', 'bundle');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE deletion_status AS ENUM ('active', 'pending_deletion', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================
-- 2. CASES TABLE
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
  status case_status DEFAULT 'active',
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  purchase_type purchase_type,
  purchase_at TIMESTAMPTZ,
  retention_until TIMESTAMPTZ,
  grace_until TIMESTAMPTZ,
  deletion_status deletion_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ADD MISSING COLUMNS (safe if they already exist)
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_analysis JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS lease_start DATE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS lease_end DATE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own cases" ON cases;
CREATE POLICY "Users can CRUD own cases"
ON cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);

-- =========================
-- 3. ROOMS (for Check-in photos)
-- =========================
CREATE TABLE IF NOT EXISTS rooms (
  room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own rooms" ON rooms;
CREATE POLICY "Users can CRUD own rooms"
ON rooms FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.case_id = rooms.case_id
    AND cases.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.case_id = rooms.case_id
    AND cases.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_rooms_case_id ON rooms(case_id);

-- =========================
-- 4. ASSETS (photos, contracts, generated files)
-- =========================
DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('contract', 'photo', 'generated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS assets (
  asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL,
  type asset_type NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ADD room_id column if missing
ALTER TABLE assets ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL;

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own assets" ON assets;
CREATE POLICY "Users can CRUD own assets"
ON assets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assets_case_id ON assets(case_id);
CREATE INDEX IF NOT EXISTS idx_assets_room_id ON assets(room_id);

-- =========================
-- 5. OUTPUTS (generated PDFs, reports)
-- =========================
DO $$ BEGIN
  CREATE TYPE output_type AS ENUM (
    'contract_scan',
    'translation',
    'checkin_report',
    'deposit_pack',
    'handover_report'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add new enum value if it doesn't exist
DO $$ BEGIN
  ALTER TYPE output_type ADD VALUE IF NOT EXISTS 'handover_report';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
ON outputs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_outputs_case_id ON outputs(case_id);

-- =========================
-- 6. DEADLINES (Intent-based reminders)
-- =========================
CREATE TABLE IF NOT EXISTS deadlines (
  deadline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'termination_notice' or 'rent_payment'
  date DATE NOT NULL,
  preferences JSONB,   -- { offsets: [30, 7], dueDay: "1", noticeMethod: "..." }
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ADD preferences column if missing
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS preferences JSONB;

-- Create unique constraint for case_id + type (prevents duplicate reminders per type)
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

ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own deadlines" ON deadlines;
CREATE POLICY "Users can CRUD own deadlines"
ON deadlines FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.case_id = deadlines.case_id
    AND cases.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.case_id = deadlines.case_id
    AND cases.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines(date);

-- =========================
-- 7. HANDOVER (Key handover tracking)
-- =========================
CREATE TABLE IF NOT EXISTS handovers (
  handover_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'move_in' or 'move_out'
  handover_date DATE,
  keys_received JSONB,  -- { apartment: true, mailbox: true, garage: false }
  meter_readings JSONB, -- { electricity: "12345", gas: "6789", water: "111" }
  notes TEXT,
  witness_name TEXT,
  witness_email TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own handovers" ON handovers;
CREATE POLICY "Users can CRUD own handovers"
ON handovers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.case_id = handovers.case_id
    AND cases.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.case_id = handovers.case_id
    AND cases.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_handovers_case_id ON handovers(case_id);

-- =========================
-- 8. DELETION AUDIT (for compliance)
-- =========================
DO $$ BEGIN
  CREATE TYPE audit_reason AS ENUM ('user_request', 'retention_expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS deletion_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID,
  reason audit_reason NOT NULL,
  objects_deleted INT DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 9. AUTO-CREATE PROFILE TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- =========================
-- 10. STORAGE BUCKET
-- =========================
-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'guard-rent',
    'guard-rent',
    false,  -- Private bucket
    52428800,  -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
DROP POLICY IF EXISTS "Users can upload to their cases" ON storage.objects;
CREATE POLICY "Users can upload to their cases"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'guard-rent' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'cases'
);

DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'guard-rent' AND
    auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'guard-rent' AND
    auth.uid() IS NOT NULL
);

-- =========================
-- VERIFICATION QUERIES
-- =========================

-- Check cases table structure
SELECT 'CASES TABLE' as table_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cases'
ORDER BY ordinal_position;

-- Check deadlines table structure
SELECT 'DEADLINES TABLE' as table_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'deadlines'
ORDER BY ordinal_position;

-- Check handovers table structure  
SELECT 'HANDOVERS TABLE' as table_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'handovers'
ORDER BY ordinal_position;

-- Check storage bucket
SELECT 'STORAGE BUCKET' as info;
SELECT id, name, public FROM storage.buckets WHERE id = 'guard-rent';

-- =========================
-- SCHEMA COMPLETE
-- =========================
SELECT 'RentVault schema setup complete!' as status;
