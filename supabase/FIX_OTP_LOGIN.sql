-- =================================================================
-- FIX OTP LOGIN - RUN THIS IMMEDIATELY
-- =================================================================

-- Drop RLS on otp_codes (service role should bypass anyway)
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- Ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON otp_codes(email, code);

-- Verify
SELECT 'OTP table fixed!' as status;
SELECT COUNT(*) as existing_codes FROM otp_codes;
