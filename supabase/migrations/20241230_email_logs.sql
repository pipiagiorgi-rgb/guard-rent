-- ================================================================
-- MIGRATION: Email Logs Table for Health Tracking
-- Safe to run multiple times (idempotent)
-- Created: 2024-12-30
-- ================================================================

-- 1. Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_type TEXT NOT NULL,
    case_id UUID REFERENCES cases(case_id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Strict RLS: NO user access, only service role
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No user access to email_logs" ON email_logs;
CREATE POLICY "No user access to email_logs" ON email_logs FOR ALL USING (false);

-- 3. Indexes for querying
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_success ON email_logs(success);
CREATE INDEX IF NOT EXISTS idx_email_logs_case_id ON email_logs(case_id);

-- Verification
SELECT '✅ Email logs table created with strict RLS' as status;
