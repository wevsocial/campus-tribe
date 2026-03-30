CREATE TABLE IF NOT EXISTS ct_demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  institution_name text NOT NULL,
  institution_type text NOT NULL,
  student_count text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ct_demo_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert demo requests" ON ct_demo_requests FOR INSERT WITH CHECK (true);
