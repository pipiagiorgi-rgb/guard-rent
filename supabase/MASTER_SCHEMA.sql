-- =================================================================
-- RENTVAULT - MASTER SCHEMA (December 2024)
-- Single comprehensive file - safe to run multiple times
-- Last updated: 2024-12-25
-- =================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- SECTION 1: ENUM TYPES
-- =================================================================
DO $$ BEGIN CREATE TYPE case_status AS ENUM ('active', 'closed', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE purchase_type AS ENUM ('checkin', 'moveout', 'bundle'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE deletion_status AS ENUM ('active', 'pending_deletion', 'deleted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE audit_reason AS ENUM ('user_request', 'retention_expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE output_type AS ENUM ('contract_scan', 'translation', 'checkin_report', 'deposit_pack', 'handover_report'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Asset type enum with all values
DO $$ BEGIN CREATE TYPE asset_type AS ENUM ('contract', 'photo', 'generated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'checkin_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'handover_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'meter_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'deposit_proof'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'walkthrough_video'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'issue_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'issue_video'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =================================================================
-- SECTION 2: PROFILES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =================================================================
-- SECTION 3: CASES TABLE
-- =================================================================
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
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    purchase_type purchase_type,
    purchase_at TIMESTAMPTZ,
    retention_until TIMESTAMPTZ,
    grace_until TIMESTAMPTZ,
    deletion_status deletion_status DEFAULT 'active',
    expiry_notified_at TIMESTAMPTZ,
    final_expiry_notified_at TIMESTAMPTZ,
    extension_count INT DEFAULT 0,
    pdf_customization JSONB,
    storage_years_purchased INT DEFAULT 1,
    storage_expires_at TIMESTAMPTZ,
    storage_extended_at TIMESTAMPTZ,
    retention_reminder_level INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add columns if table already exists
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_analysis JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_file_name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_uploaded_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_text TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS translation_saved TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS checkin_meter_readings JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS checkin_completed_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS handover_notes TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS handover_completed_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS keys_returned_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS meter_readings JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS expiry_notified_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS final_expiry_notified_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS extension_count INT DEFAULT 0;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS pdf_customization JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS storage_years_purchased INT DEFAULT 1;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS storage_expires_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS storage_extended_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS retention_reminder_level INT DEFAULT 0;

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own cases" ON cases;
CREATE POLICY "Users can CRUD own cases" ON cases FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);

-- =================================================================
-- SECTION 4: ROOMS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS rooms (
    room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    room_type TEXT DEFAULT 'custom',
    photo_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'custom';
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own rooms" ON rooms;
CREATE POLICY "Users can CRUD own rooms" ON rooms FOR ALL
    USING (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = rooms.case_id AND cases.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = rooms.case_id AND cases.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_rooms_case_id ON rooms(case_id);

-- =================================================================
-- SECTION 5: ISSUES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS issues (
    issue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    description TEXT NOT NULL,
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own issues" ON issues;
DROP POLICY IF EXISTS "Users can insert own issues" ON issues;
DROP POLICY IF EXISTS "Users can update own issues" ON issues;
DROP POLICY IF EXISTS "Users can delete own issues" ON issues;
CREATE POLICY "Users can view own issues" ON issues FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own issues" ON issues FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own issues" ON issues FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own issues" ON issues FOR DELETE USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_issues_case_id ON issues(case_id);

-- =================================================================
-- SECTION 6: ASSETS TABLE (with all columns)
-- =================================================================
DROP VIEW IF EXISTS room_photo_counts CASCADE;

CREATE TABLE IF NOT EXISTS assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL,
    issue_id UUID REFERENCES issues(issue_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    original_name TEXT,
    file_hash TEXT,
    file_hash_server TEXT,
    integrity_warning BOOLEAN DEFAULT NULL,
    phase TEXT,
    duration_seconds INT,
    resolution TEXT,
    codec TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add columns if table exists
ALTER TABLE assets ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS issue_id UUID REFERENCES issues(issue_id) ON DELETE CASCADE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS original_name TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_hash TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_hash_server TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS integrity_warning BOOLEAN DEFAULT NULL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS phase TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS duration_seconds INT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS codec TEXT;

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own assets" ON assets;
CREATE POLICY "Users can CRUD own assets" ON assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_assets_case_id ON assets(case_id);
CREATE INDEX IF NOT EXISTS idx_assets_room_id ON assets(room_id);
CREATE INDEX IF NOT EXISTS idx_assets_issue_id ON assets(issue_id);

-- Recreate view
CREATE OR REPLACE VIEW room_photo_counts WITH (security_invoker = true) AS
SELECT 
    r.room_id, r.case_id, r.name,
    COUNT(a.asset_id) FILTER (WHERE a.type IN ('photo', 'checkin_photo')) as checkin_photos,
    COUNT(a.asset_id) FILTER (WHERE a.type = 'handover_photo') as handover_photos
FROM rooms r LEFT JOIN assets a ON a.room_id = r.room_id
GROUP BY r.room_id, r.case_id, r.name;

-- =================================================================
-- SECTION 7: OUTPUTS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS outputs (
    output_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    type output_type NOT NULL,
    payload JSONB NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own outputs" ON outputs;
CREATE POLICY "Users can CRUD own outputs" ON outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_outputs_case_id ON outputs(case_id);

-- =================================================================
-- SECTION 8: DEADLINES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS deadlines (
    deadline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    date DATE NOT NULL,
    preferences JSONB,
    notified_at TIMESTAMPTZ,
    last_notification_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS preferences JSONB;
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS last_notification_sent_at TIMESTAMPTZ;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own deadlines" ON deadlines;
CREATE POLICY "Users can CRUD own deadlines" ON deadlines FOR ALL
    USING (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = deadlines.case_id AND cases.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM cases WHERE cases.case_id = deadlines.case_id AND cases.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines(date);

-- =================================================================
-- SECTION 9: PURCHASES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS purchases (
    purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    pack_type TEXT NOT NULL,
    amount_cents INT NOT NULL,
    currency TEXT DEFAULT 'EUR',
    stripe_payment_id TEXT,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_case_id ON purchases(case_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);

-- =================================================================
-- SECTION 10: CHECKIN METERS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS checkin_meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
    electricity_reading TEXT,
    gas_reading TEXT,
    water_reading TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checkin_meters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own checkin meters" ON checkin_meters;
CREATE POLICY "Users can manage own checkin meters" ON checkin_meters FOR ALL
    USING (case_id IN (SELECT case_id FROM cases WHERE user_id = auth.uid()));

-- =================================================================
-- SECTION 11: AUDIT LOGS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(case_id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =================================================================
-- SECTION 12: OTP CODES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_lookup ON otp_codes(email, code, used);
-- IMPORTANT: Disable RLS on otp_codes - accessed by service role for auth
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- SECTION 13: FEEDBACK TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('bug', 'feature', 'general')) NOT NULL,
    message TEXT NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;
CREATE POLICY "Users can insert feedback" ON feedback FOR INSERT WITH CHECK (true);

-- =================================================================
-- SECTION 14: DELETION AUDIT TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS deletion_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID,
    reason audit_reason NOT NULL,
    objects_deleted INT DEFAULT 0,
    deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- SECTION 15: AUTO-CREATE PROFILE TRIGGER
-- =================================================================
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

-- =================================================================
-- SECTION 16: STORAGE BUCKET
-- =================================================================
-- Update existing bucket
UPDATE storage.buckets SET 
    allowed_mime_types = ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
        'image/heic', 'image/heif', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg',
        'application/pdf', 'application/octet-stream'
    ],
    file_size_limit = 2147483648
WHERE id = 'guard-rent';

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'guard-rent', 'guard-rent', false, 2147483648,
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
        'image/heic', 'image/heif', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg',
        'application/pdf', 'application/octet-stream'
    ]
) ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- SECTION 17: STORAGE POLICIES (Simple and Permissive)
-- =================================================================
DROP POLICY IF EXISTS "Users can upload to their cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;

CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'guard-rent');
CREATE POLICY "Allow authenticated reads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'guard-rent');
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'guard-rent');
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'guard-rent');

-- =================================================================
-- VERIFICATION
-- =================================================================
SELECT '✅ RENTVAULT MASTER SCHEMA COMPLETE!' as status;
SELECT 'Tables: profiles, cases, rooms, issues, assets, outputs, deadlines, purchases, checkin_meters, audit_logs, otp_codes, feedback, deletion_audit' as tables;
SELECT 'Storage bucket: guard-rent with all MIME types' as storage;
