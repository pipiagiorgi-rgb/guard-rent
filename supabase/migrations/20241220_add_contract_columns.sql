-- =========================
-- ADD MISSING COLUMNS FOR CONTRACT MANAGEMENT
-- Run this in Supabase SQL Editor
-- =========================

-- Add contract_applied column to track if user confirmed the extracted details
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_applied BOOLEAN DEFAULT false;

-- Add contract_applied_at timestamp
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_applied_at TIMESTAMPTZ;

-- Add rent_amount to store monthly rent
ALTER TABLE cases ADD COLUMN IF NOT EXISTS rent_amount TEXT;

-- Add termination_details for notice period information
ALTER TABLE cases ADD COLUMN IF NOT EXISTS termination_details JSONB;

-- Optional: Add notice_period field
ALTER TABLE cases ADD COLUMN IF NOT EXISTS notice_period TEXT;

-- Optional: Add notice_method field  
ALTER TABLE cases ADD COLUMN IF NOT EXISTS notice_method TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cases'
ORDER BY ordinal_position;
