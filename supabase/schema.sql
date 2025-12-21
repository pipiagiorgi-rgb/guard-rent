-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Minimal User Data)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- 2. CASES (Rental Units)
CREATE TYPE case_status AS ENUM ('active', 'closed', 'archived');
CREATE TYPE purchase_type AS ENUM ('checkin', 'moveout', 'bundle');
CREATE TYPE deletion_status AS ENUM ('active', 'pending_deletion', 'deleted');

CREATE TABLE cases (
  case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  country TEXT NOT NULL,
  -- Address removed per Phase 3 Hard Constraint
  lease_start DATE,
  lease_end DATE,
  status case_status DEFAULT 'active',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Commerce & Retention
  purchase_type purchase_type,
  purchase_at TIMESTAMP WITH TIME ZONE,
  retention_until TIMESTAMP WITH TIME ZONE,
  grace_until TIMESTAMP WITH TIME ZONE,
  deletion_status deletion_status DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own cases" ON cases FOR ALL USING (auth.uid() = user_id);

-- 3. ASSETS (Private Files)
CREATE TYPE asset_type AS ENUM ('contract', 'photo', 'generated');

CREATE TABLE assets (
  asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE, -- Denormalized for easier RLS
  type asset_type NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own assets" ON assets FOR ALL USING (auth.uid() = user_id);

-- 4. OUTPUTS (AI Results & PDFs)
CREATE TYPE output_type AS ENUM ('contract_scan', 'translation', 'checkin_report', 'deposit_pack');

CREATE TABLE outputs (
  output_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE, -- Denormalized for RLS
  type output_type NOT NULL,
  payload JSONB NOT NULL, -- The structured AI result
  storage_path TEXT, -- Null if just data, populated if PDF
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Outputs
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own outputs" ON outputs FOR ALL USING (auth.uid() = user_id);

-- 5. DELETION AUDIT (Compliance)
CREATE TYPE audit_reason AS ENUM ('user_request', 'retention_expired');

CREATE TABLE deletion_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID, -- No FK because case might be gone, or kept for reference? Spec says "audit", let's store ID.
  reason audit_reason NOT NULL,
  objects_deleted INT DEFAULT 0,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
