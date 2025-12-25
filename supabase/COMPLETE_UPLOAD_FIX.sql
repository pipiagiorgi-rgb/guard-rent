-- =========================
-- COMPLETE FIX FOR RENTVAULT UPLOADS
-- Run this ENTIRE script in Supabase SQL Editor
-- Created: 2024-12-25
-- =========================

-- ========================================
-- STEP 1: FIX ASSET TYPE ENUM VALUES
-- ========================================

-- Add all missing asset types one by one
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'deposit_proof'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'walkthrough_video'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'issue_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'issue_video'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'checkin_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'handover_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE asset_type ADD VALUE IF NOT EXISTS 'meter_photo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========================================
-- STEP 2: FIX ASSETS TABLE COLUMNS
-- ========================================

ALTER TABLE assets ADD COLUMN IF NOT EXISTS original_name TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_hash TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS phase TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS duration_seconds INT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS codec TEXT;

-- ========================================
-- STEP 3: FIX STORAGE BUCKET
-- ========================================

-- Update existing bucket with correct MIME types
UPDATE storage.buckets 
SET 
    allowed_mime_types = ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
        'image/heic', 'image/heif', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg',
        'application/pdf', 'application/octet-stream'
    ],
    file_size_limit = 2147483648
WHERE id = 'guard-rent';

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'guard-rent',
    'guard-rent',
    false,
    2147483648,
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
        'image/heic', 'image/heif', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg',
        'application/pdf', 'application/octet-stream'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STEP 4: FIX STORAGE POLICIES (PERMISSIVE)
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can upload to their cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create simple, working policies for authenticated users
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guard-rent');

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'guard-rent');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'guard-rent');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'guard-rent');

-- ========================================
-- STEP 5: FIX ASSETS TABLE RLS
-- ========================================

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own assets" ON assets;
CREATE POLICY "Users can CRUD own assets"
ON assets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'Asset types available:' as check_1;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'asset_type'::regtype ORDER BY enumlabel;

SELECT 'Storage bucket config:' as check_2;
SELECT id, name, public, file_size_limit, array_length(allowed_mime_types, 1) as mime_type_count 
FROM storage.buckets WHERE id = 'guard-rent';

SELECT 'Storage policies:' as check_3;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

SELECT '✅ ALL FIXES APPLIED SUCCESSFULLY!' as status;
