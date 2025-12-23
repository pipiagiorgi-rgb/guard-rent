
-- =========================
-- 12. EVIDENCE INTEGRITY UPDATES
-- =========================

-- 1. Add file_hash to assets if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'file_hash') THEN
        ALTER TABLE assets ADD COLUMN file_hash TEXT;
    END IF;
END $$;

-- 2. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(case_id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs"
ON audit_logs FOR SELECT
USING (user_id = auth.uid());

-- Only allow system/backend to insert (effectively) or users triggering actions
DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
CREATE POLICY "Users can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. EVIDENCE LOCKING POLICY
-- Prevent modification/deletion of asset rows if the parent case has checkin_completed_at set
-- AND the asset type is 'checkin_photo' or 'photo' (check-in phase evidence)

-- Note: We need a trigger or a complex policy. Standard RLS on UPDATE/DELETE works best.

DROP POLICY IF EXISTS "Prevent delete of locked evidence" ON assets;
CREATE POLICY "Prevent delete of locked evidence"
ON assets FOR DELETE
USING (
  auth.uid() = user_id 
  AND (
    -- Allow delete if checkin NOT complete OR asset is NOT a checkin photo
    NOT EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.case_id = assets.case_id 
      AND cases.checkin_completed_at IS NOT NULL
    )
    OR assets.type NOT IN ('checkin_photo', 'photo')
  )
);

DROP POLICY IF EXISTS "Prevent update of locked evidence" ON assets;
CREATE POLICY "Prevent update of locked evidence"
ON assets FOR UPDATE
USING (
  auth.uid() = user_id 
  AND (
    NOT EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.case_id = assets.case_id 
      AND cases.checkin_completed_at IS NOT NULL
    )
    OR assets.type NOT IN ('checkin_photo', 'photo')
  )
)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    NOT EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.case_id = assets.case_id 
      AND cases.checkin_completed_at IS NOT NULL
    )
    OR assets.type NOT IN ('checkin_photo', 'photo')
  )
);
