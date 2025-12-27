-- Migration: Fix related_contracts schema for document uploads
-- Resolves: "Failed to save contract" error
-- Root cause: Missing columns (mime_type, size_bytes, label) and incomplete CHECK constraint

-- Add missing columns
ALTER TABLE related_contracts 
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS label TEXT;

-- Update CHECK constraint to allow all contract types used by the UI
-- First drop the old constraint (may fail if doesn't exist - that's OK)
DO $$ 
BEGIN
    ALTER TABLE related_contracts 
    DROP CONSTRAINT IF EXISTS related_contracts_contract_type_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add the updated constraint with all valid types
ALTER TABLE related_contracts 
ADD CONSTRAINT related_contracts_contract_type_check 
CHECK (contract_type IN (
    'internet', 
    'electricity', 
    'gas', 
    'water', 
    'parking', 
    'insurance', 
    'storage', 
    'cleaning', 
    'employment', 
    'other'
));

-- Add comment for documentation
COMMENT ON TABLE related_contracts IS 'Document Vault: Reference-only contracts and utility documents. NOT sealed evidence.';
