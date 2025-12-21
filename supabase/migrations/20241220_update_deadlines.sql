-- =========================
-- UPDATE DEADLINES TABLE FOR INTENT-BASED REMINDERS
-- Run this in Supabase SQL Editor
-- =========================

-- Add preferences JSONB column to store notification offsets
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS preferences JSONB;

-- Create unique constraint for case_id + type (prevents duplicate reminders)
-- This allows upsert behavior
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'deadlines_case_type_unique'
    ) THEN
        ALTER TABLE deadlines ADD CONSTRAINT deadlines_case_type_unique 
        UNIQUE (case_id, type);
    END IF;
EXCEPTION WHEN others THEN
    NULL; -- Ignore if constraint already exists
END $$;

-- Add column to track last notification sent (for cron deduplication)
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS last_notification_sent_at TIMESTAMPTZ;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deadlines'
ORDER BY ordinal_position;
