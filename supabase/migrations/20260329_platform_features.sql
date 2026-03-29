-- Add waiver tracking to ct_athletes
ALTER TABLE ct_athletes ADD COLUMN IF NOT EXISTS waiver_signed boolean DEFAULT false;
ALTER TABLE ct_athletes ADD COLUMN IF NOT EXISTS waiver_signed_at timestamptz;

-- Add budget tracking tables
CREATE TABLE IF NOT EXISTS ct_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE,
  club_id uuid REFERENCES ct_clubs(id) ON DELETE CASCADE,
  fiscal_year text NOT NULL DEFAULT extract(year FROM now())::text,
  total_allocated numeric(12,2) DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ct_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_budgets_open" ON ct_budgets;
CREATE POLICY "ct_budgets_open" ON ct_budgets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add funding requests table  
CREATE TABLE IF NOT EXISTS ct_funding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES ct_clubs(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES ct_users(id),
  amount numeric(12,2) NOT NULL,
  purpose text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  reviewed_by uuid REFERENCES ct_users(id),
  review_notes text,
  reviewed_at timestamptz,
  receipt_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ct_funding_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_funding_requests_open" ON ct_funding_requests;
CREATE POLICY "ct_funding_requests_open" ON ct_funding_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Engagement score tracking
CREATE TABLE IF NOT EXISTS ct_engagement_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES ct_users(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES ct_institutions(id),
  score integer DEFAULT 0,
  event_attendance_count integer DEFAULT 0,
  club_count integer DEFAULT 0,
  wellbeing_check_count integer DEFAULT 0,
  survey_response_count integer DEFAULT 0,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE ct_engagement_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_engagement_scores_open" ON ct_engagement_scores;
CREATE POLICY "ct_engagement_scores_open" ON ct_engagement_scores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Free agent pool for sports
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS free_agent boolean DEFAULT false;

NOTIFY pgrst, 'reload schema';
