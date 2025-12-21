-- Add contract_analysis column to cases table
-- This stores the analysis results so they persist across page navigation

ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS contract_analysis JSONB;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cases_contract_analysis 
ON cases USING gin (contract_analysis);

COMMENT ON COLUMN cases.contract_analysis IS 'Stores extracted contract data: analysis results, extracted text, filename, and timestamp';
