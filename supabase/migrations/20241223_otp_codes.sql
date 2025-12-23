-- =========================
-- OTP CODES TABLE FOR CUSTOM AUTH
-- Run this in Supabase SQL Editor
-- =========================

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);

-- Auto-cleanup expired codes (run periodically or via cron)
-- DELETE FROM otp_codes WHERE expires_at < NOW() OR used = TRUE;

-- RLS: No direct access - only via server-side functions
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- No policies = no client access (server only via service role)
