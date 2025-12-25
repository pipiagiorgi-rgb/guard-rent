-- Related Contracts table for tracking non-evidence utility/service contracts
-- This is REFERENCE ONLY - NOT sealed evidence

CREATE TABLE IF NOT EXISTS related_contracts (
    contract_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    -- Contract details
    contract_type TEXT NOT NULL CHECK (contract_type IN ('internet', 'electricity', 'gas', 'parking', 'insurance', 'storage', 'other')),
    custom_type TEXT, -- For 'other' type, user can specify
    provider_name TEXT,
    
    -- File storage (NOT hashed - reference only)
    storage_path TEXT,
    file_name TEXT,
    
    -- Dates
    start_date DATE,
    end_date DATE,
    
    -- Notice period (only if explicitly stated in contract)
    notice_period_days INTEGER,
    notice_period_source TEXT CHECK (notice_period_source IN ('extracted', 'manual')),
    
    -- AI-extracted data (reference only)
    extracted_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE related_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only manage their own related contracts)
CREATE POLICY "Users can view own related contracts"
    ON related_contracts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own related contracts"
    ON related_contracts FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own related contracts"
    ON related_contracts FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own related contracts"
    ON related_contracts FOR DELETE
    USING (user_id = auth.uid());

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_related_contracts_case_id ON related_contracts(case_id);
CREATE INDEX IF NOT EXISTS idx_related_contracts_user_id ON related_contracts(user_id);

-- Add related_contracts to valid pack types in purchases if needed
-- Note: The purchase validation happens in application code
