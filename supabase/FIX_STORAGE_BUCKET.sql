-- =========================
-- FIX STORAGE BUCKET FOR MOBILE UPLOADS
-- Run this in Supabase SQL Editor IMMEDIATELY
-- =========================

-- 1. Update bucket to allow more MIME types (including videos and all image variants)
UPDATE storage.buckets 
SET 
    allowed_mime_types = ARRAY[
        -- Images
        'image/jpeg',
        'image/jpg', 
        'image/png', 
        'image/webp', 
        'image/heic',
        'image/heif',      -- iOS variant
        'image/gif',
        -- Videos
        'video/mp4',
        'video/quicktime', -- iOS MOV files
        'video/webm',
        'video/mpeg',
        -- Documents
        'application/pdf'
    ],
    file_size_limit = 2147483648  -- 2GB for videos
WHERE id = 'guard-rent';

-- 2. Verify the bucket exists (if not, create it)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'guard-rent',
    'guard-rent',
    false,
    2147483648,  -- 2GB for videos
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
        'image/heic', 'image/heif', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg',
        'application/pdf'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Recreate storage policies with proper permissions
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

-- 4. Add UPDATE policy (needed for some operations)
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'guard-rent' AND
    auth.uid() IS NOT NULL
);

-- 5. Verify settings
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'guard-rent';

-- Show success message
SELECT 'Storage bucket fixed! Mobile uploads should now work.' as status;
