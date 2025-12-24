-- Add integrity_warning column to assets table for hash mismatch tracking
-- This column is set to true when the client-side hash doesn't match the server-side hash

ALTER TABLE assets ADD COLUMN IF NOT EXISTS integrity_warning BOOLEAN DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN assets.integrity_warning IS 'Set to true if client hash does not match server hash, indicating potential file corruption during upload';
