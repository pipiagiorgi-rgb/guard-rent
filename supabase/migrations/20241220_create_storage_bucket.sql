-- =========================
-- STORAGE BUCKET FOR GUARD.RENT
-- Run this in Supabase SQL Editor
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
