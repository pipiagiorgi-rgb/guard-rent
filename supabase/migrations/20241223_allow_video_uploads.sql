-- =========================
-- UPDATE STORAGE BUCKET FOR VIDEO UPLOADS
-- Run this in Supabase SQL Editor
-- =========================

-- Update the bucket to allow video uploads
UPDATE storage.buckets 
SET 
    file_size_limit = 2147483648,  -- 2GB limit for videos
    allowed_mime_types = ARRAY[
        'image/jpeg', 
        'image/png', 
        'image/webp', 
        'image/heic', 
        'application/pdf',
        'video/mp4',           -- MP4 videos
        'video/quicktime'      -- MOV videos
    ]
WHERE id = 'guard-rent';

-- Verify the update
SELECT id, name, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'guard-rent';
