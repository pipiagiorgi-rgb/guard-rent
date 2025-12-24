-- Issues table for mid-tenancy incident logging
CREATE TABLE IF NOT EXISTS issues (
    issue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    description TEXT NOT NULL,
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only manage their own issues)
CREATE POLICY "Users can view own issues"
    ON issues FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own issues"
    ON issues FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own issues"
    ON issues FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own issues"
    ON issues FOR DELETE
    USING (user_id = auth.uid());

-- Add issue_id column to assets table for linking photos to issues
ALTER TABLE assets ADD COLUMN IF NOT EXISTS issue_id UUID REFERENCES issues(issue_id) ON DELETE CASCADE;

-- Index for faster issue lookups
CREATE INDEX IF NOT EXISTS idx_issues_case_id ON issues(case_id);
CREATE INDEX IF NOT EXISTS idx_assets_issue_id ON assets(issue_id);
