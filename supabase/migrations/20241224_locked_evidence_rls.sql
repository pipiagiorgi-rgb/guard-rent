-- =========================
-- RLS POLICIES FOR LOCKED EVIDENCE PROTECTION
-- Prevents deletion/modification of assets after evidence is locked
-- Created: 24 December 2024
-- =========================

-- Add phase column to assets if not exists (for walkthrough videos)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS phase TEXT;

-- 1. Prevent DELETE on check-in assets after check-in is locked
DROP POLICY IF EXISTS "prevent_checkin_asset_delete_when_locked" ON assets;
CREATE POLICY "prevent_checkin_asset_delete_when_locked" ON assets
FOR DELETE USING (
    -- If check-in is locked and asset is a check-in type, block delete
    NOT (
        EXISTS (
            SELECT 1 FROM cases
            WHERE cases.case_id = assets.case_id
            AND cases.checkin_completed_at IS NOT NULL
        )
        AND (
            assets.type::text = 'checkin_photo' 
            OR assets.type::text = 'photo'
            OR (assets.type::text = 'walkthrough_video' AND assets.phase = 'check-in')
        )
    )
);

-- 2. Prevent DELETE on handover assets after handover is locked  
DROP POLICY IF EXISTS "prevent_handover_asset_delete_when_locked" ON assets;
CREATE POLICY "prevent_handover_asset_delete_when_locked" ON assets
FOR DELETE USING (
    -- If handover is locked and asset is a handover type, block delete
    NOT (
        EXISTS (
            SELECT 1 FROM cases
            WHERE cases.case_id = assets.case_id
            AND cases.handover_completed_at IS NOT NULL
        )
        AND (
            assets.type::text = 'handover_photo'
            OR (assets.type::text = 'walkthrough_video' AND assets.phase = 'handover')
        )
    )
);

-- 3. Prevent UPDATE on check-in assets after lock (no content changes)
DROP POLICY IF EXISTS "prevent_checkin_asset_update_when_locked" ON assets;
CREATE POLICY "prevent_checkin_asset_update_when_locked" ON assets
FOR UPDATE USING (
    NOT (
        EXISTS (
            SELECT 1 FROM cases
            WHERE cases.case_id = assets.case_id
            AND cases.checkin_completed_at IS NOT NULL
        )
        AND (
            assets.type::text = 'checkin_photo' 
            OR assets.type::text = 'photo'
            OR (assets.type::text = 'walkthrough_video' AND assets.phase = 'check-in')
        )
    )
);

-- 4. Prevent UPDATE on handover assets after lock
DROP POLICY IF EXISTS "prevent_handover_asset_update_when_locked" ON assets;
CREATE POLICY "prevent_handover_asset_update_when_locked" ON assets
FOR UPDATE USING (
    NOT (
        EXISTS (
            SELECT 1 FROM cases
            WHERE cases.case_id = assets.case_id
            AND cases.handover_completed_at IS NOT NULL
        )
        AND (
            assets.type::text = 'handover_photo'
            OR (assets.type::text = 'walkthrough_video' AND assets.phase = 'handover')
        )
    )
);

-- =========================
-- VERIFICATION
-- =========================
SELECT 'RLS policies for locked evidence created successfully!' as status;
