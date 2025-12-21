-- Migration: Add retention_until column to cases table
-- Run this in Supabase SQL Editor

-- Add retention_until column
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS retention_until TIMESTAMP WITH TIME ZONE;

-- Add extension_count to track how many times extended
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0;

-- Set default retention_until for existing rows (12 months from created_at)
UPDATE cases 
SET retention_until = created_at + INTERVAL '12 months'
WHERE retention_until IS NULL;

-- Create index for efficient queries on retention_until
CREATE INDEX IF NOT EXISTS idx_cases_retention_until ON cases(retention_until);

-- Function to automatically set retention_until on new cases
CREATE OR REPLACE FUNCTION set_default_retention()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.retention_until IS NULL THEN
        NEW.retention_until := NEW.created_at + INTERVAL '12 months';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention_until on insert
DROP TRIGGER IF EXISTS trigger_set_retention ON cases;
CREATE TRIGGER trigger_set_retention
    BEFORE INSERT ON cases
    FOR EACH ROW
    EXECUTE FUNCTION set_default_retention();

-- View for cases expiring soon (for cron job to query)
CREATE OR REPLACE VIEW cases_expiring_soon AS
SELECT 
    c.case_id,
    c.user_id,
    c.label,
    c.retention_until,
    u.email as user_email,
    EXTRACT(DAY FROM c.retention_until - NOW()) as days_until_expiry
FROM cases c
JOIN auth.users u ON c.user_id = u.id
WHERE c.retention_until IS NOT NULL
  AND c.retention_until > NOW()
  AND c.retention_until < NOW() + INTERVAL '30 days';
