-- =========================
-- RENTVAULT SCHEMA PART 2
-- Run this AFTER complete_schema.sql completes successfully
-- This creates the helper view that uses the new enum values
-- =========================

-- View to get photo counts per room per type
-- This requires the enum values to be committed first
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

SELECT 'Helper view created successfully!' as status;
