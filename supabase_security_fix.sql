-- =================================================================
-- SECURITY FIX PATCH
-- Run this in your Supabase SQL Editor to fix "Unrestricted" warnings
-- =================================================================

-- 1. Fix 'deletion_audit' Security
-- The table existed but lacked RLS, making it public.
ALTER TABLE deletion_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own deletion logs
-- (Assuming deletion logs are linked to cases they own)
DROP POLICY IF EXISTS "Users can view own deletion logs" ON deletion_audit;
CREATE POLICY "Users can view own deletion logs"
ON deletion_audit FOR SELECT
USING (case_id IN (SELECT case_id FROM cases WHERE user_id = auth.uid()));

-- Policy: Allow users/system to create logs
DROP POLICY IF EXISTS "Users can insert deletion logs" ON deletion_audit;
CREATE POLICY "Users can insert deletion logs"
ON deletion_audit FOR INSERT
WITH CHECK (case_id IN (SELECT case_id FROM cases WHERE user_id = auth.uid()));


-- 2. Fix 'room_photo_counts' View Security
-- Standard views run as the owner (admin) and bypass RLS. 
-- We must recreate it with 'security_invoker = true' to respect user permissions.
DROP VIEW IF EXISTS room_photo_counts;

CREATE OR REPLACE VIEW room_photo_counts WITH (security_invoker = true) AS
SELECT 
  r.room_id, r.case_id, r.name,
  COUNT(a.asset_id) FILTER (WHERE a.type IN ('photo', 'checkin_photo')) as checkin_photos,
  COUNT(a.asset_id) FILTER (WHERE a.type = 'handover_photo') as handover_photos
FROM rooms r LEFT JOIN assets a ON a.room_id = r.room_id
GROUP BY r.room_id, r.case_id, r.name;

SELECT 'Security patches applied successfully' as status;
