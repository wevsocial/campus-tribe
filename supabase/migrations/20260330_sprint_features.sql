-- Notification preferences
CREATE TABLE IF NOT EXISTS ct_notification_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id uuid,
  channel text NOT NULL CHECK (channel IN ('email', 'in_app')),
  event_type text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, channel, event_type)
);

-- In-app notifications
CREATE TABLE IF NOT EXISTS ct_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Assignment documents (teacher uploads)
CREATE TABLE IF NOT EXISTS ct_assignment_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES ct_assignments(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz DEFAULT now()
);

-- Student assignment submissions
CREATE TABLE IF NOT EXISTS ct_assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES ct_assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(assignment_id, student_id)
);

-- Files attached to submissions
CREATE TABLE IF NOT EXISTS ct_submission_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES ct_assignment_submissions(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz DEFAULT now()
);

-- Grades
CREATE TABLE IF NOT EXISTS ct_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES ct_assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  grade numeric,
  max_points numeric,
  feedback text,
  graded_by uuid REFERENCES auth.users(id),
  graded_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS ct_course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES ct_courses(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(course_id, student_id)
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS ct_event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES ct_events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'attending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Add wellness columns if not present
ALTER TABLE ct_wellbeing_checks ADD COLUMN IF NOT EXISTS happiness_score integer;
ALTER TABLE ct_wellbeing_checks ADD COLUMN IF NOT EXISTS stress_score integer;
ALTER TABLE ct_wellbeing_checks ADD COLUMN IF NOT EXISTS notes text;

-- RLS: enable on new tables
ALTER TABLE ct_notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_assignment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own notification prefs' AND tablename = 'ct_notification_prefs') THEN
    CREATE POLICY "Users manage own notification prefs" ON ct_notification_prefs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own notifications' AND tablename = 'ct_notifications') THEN
    CREATE POLICY "Users read own notifications" ON ct_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own notifications' AND tablename = 'ct_notifications') THEN
    CREATE POLICY "Users update own notifications" ON ct_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All authenticated read assignment docs' AND tablename = 'ct_assignment_documents') THEN
    CREATE POLICY "All authenticated read assignment docs" ON ct_assignment_documents FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers insert assignment docs' AND tablename = 'ct_assignment_documents') THEN
    CREATE POLICY "Teachers insert assignment docs" ON ct_assignment_documents FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students manage own submissions' AND tablename = 'ct_assignment_submissions') THEN
    CREATE POLICY "Students manage own submissions" ON ct_assignment_submissions FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers read all submissions' AND tablename = 'ct_assignment_submissions') THEN
    CREATE POLICY "Teachers read all submissions" ON ct_assignment_submissions FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students manage own submission files' AND tablename = 'ct_submission_files') THEN
    CREATE POLICY "Students manage own submission files" ON ct_submission_files FOR ALL TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All read grades' AND tablename = 'ct_grades') THEN
    CREATE POLICY "All read grades" ON ct_grades FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers manage grades' AND tablename = 'ct_grades') THEN
    CREATE POLICY "Teachers manage grades" ON ct_grades FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students manage own enrollments' AND tablename = 'ct_course_enrollments') THEN
    CREATE POLICY "Students manage own enrollments" ON ct_course_enrollments FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All read enrollments' AND tablename = 'ct_course_enrollments') THEN
    CREATE POLICY "All read enrollments" ON ct_course_enrollments FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own RSVPs' AND tablename = 'ct_event_rsvps') THEN
    CREATE POLICY "Users manage own RSVPs" ON ct_event_rsvps FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All read RSVPs' AND tablename = 'ct_event_rsvps') THEN
    CREATE POLICY "All read RSVPs" ON ct_event_rsvps FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
