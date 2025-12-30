-- ================================================================
-- MIGRATION: Admin Metrics Table
-- Safe to run multiple times (idempotent)
-- Created: 2024-12-30
-- ================================================================

-- 1. Create metrics table for tracking downloads
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL CHECK (event IN ('pdf_downloaded', 'video_downloaded')),
    case_id UUID REFERENCES cases(case_id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    stay_type TEXT CHECK (stay_type IN ('long_term', 'short_stay')),
    pack_type TEXT,
    pdf_type TEXT, -- 'checkin_report', 'deposit_pack', 'short_stay'
    asset_type TEXT, -- for video: 'walkthrough_video'
    phase TEXT, -- 'check-in', 'handover'
    is_admin BOOLEAN DEFAULT FALSE,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Strict RLS: NO user access, only service role
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Admin only metrics" ON metrics;
DROP POLICY IF EXISTS "No user access to metrics" ON metrics;

-- Policy: Users cannot read or write (service role bypasses RLS)
-- This effectively makes the table admin-only via API
CREATE POLICY "No user access to metrics" ON metrics FOR ALL USING (false);

-- 3. Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_metrics_event ON metrics(event);
CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_metrics_case_id ON metrics(case_id);
CREATE INDEX IF NOT EXISTS idx_metrics_stay_type ON metrics(stay_type);
CREATE INDEX IF NOT EXISTS idx_metrics_is_admin ON metrics(is_admin);

-- 4. Index for purchases by pack_type (for revenue queries)
CREATE INDEX IF NOT EXISTS idx_purchases_pack_type ON purchases(pack_type);

-- Verification
SELECT '✅ Metrics table created with strict RLS' as status;
SELECT 'Events: pdf_downloaded, video_downloaded' as tracked_events;
SELECT 'RLS: No user access (service role only)' as security;
