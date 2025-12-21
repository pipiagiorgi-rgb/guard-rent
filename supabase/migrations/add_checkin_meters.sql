-- =========================
-- UPDATE CASES TABLE - CHECK-IN METER READINGS
-- =========================
ALTER TABLE cases ADD COLUMN IF NOT EXISTS checkin_meter_readings JSONB;

SELECT 'Check-in meter readings column added' as status;
