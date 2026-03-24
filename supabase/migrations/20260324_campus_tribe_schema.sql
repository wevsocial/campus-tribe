-- Campus Tribe Database Migration
-- All tables with ct_ prefix, UUID primary keys, RLS enabled

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Institutions
CREATE TABLE IF NOT EXISTS ct_institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  institution_type TEXT DEFAULT 'university' CHECK (institution_type IN ('university', 'school', 'preschool')),
  student_count INTEGER DEFAULT 0,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Canada',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_institutions ENABLE ROW LEVEL SECURITY;

-- Users profile (linked to auth.users)
CREATE TABLE IF NOT EXISTS ct_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES ct_institutions(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student','teacher','admin','coach','club_leader','staff','it_director','parent')),
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[],
  department TEXT,
  student_number TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON ct_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON ct_users FOR UPDATE USING (auth.uid() = id);

-- Courses
CREATE TABLE IF NOT EXISTS ct_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  credits INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_courses ENABLE ROW LEVEL SECURITY;

-- Classes (course sections)
CREATE TABLE IF NOT EXISTS ct_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES ct_courses(id),
  teacher_id UUID REFERENCES ct_users(id),
  institution_id UUID REFERENCES ct_institutions(id),
  section TEXT,
  room TEXT,
  schedule TEXT,
  semester TEXT,
  academic_year TEXT,
  capacity INTEGER DEFAULT 35,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_classes ENABLE ROW LEVEL SECURITY;

-- Enrollments
CREATE TABLE IF NOT EXISTS ct_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES ct_classes(id),
  student_id UUID REFERENCES ct_users(id),
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled','dropped','completed','waitlisted')),
  grade TEXT,
  gpa_points NUMERIC(3,2),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_enrollments ENABLE ROW LEVEL SECURITY;

-- Assignments
CREATE TABLE IF NOT EXISTS ct_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES ct_classes(id),
  teacher_id UUID REFERENCES ct_users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  total_marks INTEGER DEFAULT 100,
  assignment_type TEXT DEFAULT 'assignment' CHECK (assignment_type IN ('assignment','quiz','midterm','final','lab','project')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_assignments ENABLE ROW LEVEL SECURITY;

-- Submissions
CREATE TABLE IF NOT EXISTS ct_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES ct_assignments(id),
  student_id UUID REFERENCES ct_users(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  file_url TEXT,
  content TEXT,
  score NUMERIC(5,2),
  feedback TEXT,
  graded_by UUID REFERENCES ct_users(id),
  graded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','graded','returned','late')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_submissions ENABLE ROW LEVEL SECURITY;

-- Grades
CREATE TABLE IF NOT EXISTS ct_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES ct_enrollments(id),
  student_id UUID REFERENCES ct_users(id),
  class_id UUID REFERENCES ct_classes(id),
  assignment_id UUID REFERENCES ct_assignments(id),
  score NUMERIC(5,2),
  letter_grade TEXT,
  gpa_points NUMERIC(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_grades ENABLE ROW LEVEL SECURITY;

-- Attendance
CREATE TABLE IF NOT EXISTS ct_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES ct_classes(id),
  student_id UUID REFERENCES ct_users(id),
  teacher_id UUID REFERENCES ct_users(id),
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_attendance ENABLE ROW LEVEL SECURITY;

-- Clubs
CREATE TABLE IF NOT EXISTS ct_clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  leader_id UUID REFERENCES ct_users(id),
  cover_image_url TEXT,
  cover_gradient TEXT,
  tags TEXT[],
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  annual_budget NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_clubs ENABLE ROW LEVEL SECURITY;

-- Club Members
CREATE TABLE IF NOT EXISTS ct_club_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES ct_clubs(id),
  user_id UUID REFERENCES ct_users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('member','officer','leader')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','pending','removed')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_club_members ENABLE ROW LEVEL SECURITY;

-- Events (general)
CREATE TABLE IF NOT EXISTS ct_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  club_id UUID REFERENCES ct_clubs(id),
  venue_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  category TEXT,
  capacity INTEGER DEFAULT 100,
  rsvp_count INTEGER DEFAULT 0,
  cover_gradient TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft','upcoming','live','past','cancelled')),
  is_public BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES ct_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_events ENABLE ROW LEVEL SECURITY;

-- Club Events (alias/join for club-specific events)
CREATE TABLE IF NOT EXISTS ct_club_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES ct_clubs(id),
  event_id UUID REFERENCES ct_events(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_club_events ENABLE ROW LEVEL SECURITY;

-- Event RSVPs
CREATE TABLE IF NOT EXISTS ct_event_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES ct_events(id),
  user_id UUID REFERENCES ct_users(id),
  status TEXT DEFAULT 'going' CHECK (status IN ('going','maybe','not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE ct_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Venues
CREATE TABLE IF NOT EXISTS ct_venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  name TEXT NOT NULL,
  building TEXT,
  room_number TEXT,
  capacity INTEGER,
  amenities TEXT[],
  is_bookable BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_venues ENABLE ROW LEVEL SECURITY;

-- Venue Bookings
CREATE TABLE IF NOT EXISTS ct_venue_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES ct_venues(id),
  booked_by UUID REFERENCES ct_users(id),
  event_id UUID REFERENCES ct_events(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  purpose TEXT,
  attendee_count INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by UUID REFERENCES ct_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_venue_bookings ENABLE ROW LEVEL SECURITY;

-- Sports Teams
CREATE TABLE IF NOT EXISTS ct_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  name TEXT NOT NULL,
  sport TEXT,
  coach_id UUID REFERENCES ct_users(id),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  season TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_teams ENABLE ROW LEVEL SECURITY;

-- Athletes
CREATE TABLE IF NOT EXISTS ct_athletes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES ct_teams(id),
  user_id UUID REFERENCES ct_users(id),
  position TEXT,
  jersey_number TEXT,
  stats JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_athletes ENABLE ROW LEVEL SECURITY;

-- Games
CREATE TABLE IF NOT EXISTS ct_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES ct_teams(id),
  away_team_id UUID REFERENCES ct_teams(id),
  venue_id UUID REFERENCES ct_venues(id),
  scheduled_at TIMESTAMPTZ,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_games ENABLE ROW LEVEL SECURITY;

-- Training Sessions
CREATE TABLE IF NOT EXISTS ct_training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES ct_teams(id),
  coach_id UUID REFERENCES ct_users(id),
  venue_id UUID REFERENCES ct_venues(id),
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 90,
  title TEXT,
  focus_area TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_training_sessions ENABLE ROW LEVEL SECURITY;

-- Wellbeing Checkins
CREATE TABLE IF NOT EXISTS ct_wellbeing_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES ct_users(id),
  date DATE NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  stress INTEGER CHECK (stress BETWEEN 1 AND 5),
  sleep_hours NUMERIC(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_wellbeing_checks ENABLE ROW LEVEL SECURITY;

-- Surveys
CREATE TABLE IF NOT EXISTS ct_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  created_by UUID REFERENCES ct_users(id),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]',
  target_roles TEXT[],
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_surveys ENABLE ROW LEVEL SECURITY;

-- Survey Responses
CREATE TABLE IF NOT EXISTS ct_survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES ct_surveys(id),
  user_id UUID REFERENCES ct_users(id),
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_survey_responses ENABLE ROW LEVEL SECURITY;

-- Admissions
CREATE TABLE IF NOT EXISTS ct_admissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  program TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied','reviewing','interview','accepted','rejected','waitlisted','enrolled')),
  gpa NUMERIC(3,2),
  notes TEXT,
  reviewed_by UUID REFERENCES ct_users(id),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_admissions ENABLE ROW LEVEL SECURITY;

-- Budgets
CREATE TABLE IF NOT EXISTS ct_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  department TEXT,
  club_id UUID REFERENCES ct_clubs(id),
  fiscal_year TEXT,
  total_allocated NUMERIC(12,2) DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_budgets ENABLE ROW LEVEL SECURITY;

-- Budget Items
CREATE TABLE IF NOT EXISTS ct_budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES ct_budgets(id),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT,
  receipt_url TEXT,
  approved_by UUID REFERENCES ct_users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_budget_items ENABLE ROW LEVEL SECURITY;

-- Announcements
CREATE TABLE IF NOT EXISTS ct_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  author_id UUID REFERENCES ct_users(id),
  title TEXT NOT NULL,
  body TEXT,
  target_roles TEXT[],
  club_id UUID REFERENCES ct_clubs(id),
  class_id UUID REFERENCES ct_classes(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_announcements ENABLE ROW LEVEL SECURITY;

-- API Keys
CREATE TABLE IF NOT EXISTS ct_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  created_by UUID REFERENCES ct_users(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_api_keys ENABLE ROW LEVEL SECURITY;

-- Audit Logs
CREATE TABLE IF NOT EXISTS ct_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  actor_id UUID REFERENCES ct_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','error','critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_audit_logs ENABLE ROW LEVEL SECURITY;

-- Children (Preschool)
CREATE TABLE IF NOT EXISTS ct_children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES ct_institutions(id),
  parent_id UUID REFERENCES ct_users(id),
  teacher_id UUID REFERENCES ct_users(id),
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  room TEXT,
  allergies TEXT,
  medical_notes TEXT,
  emergency_contact TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_children ENABLE ROW LEVEL SECURITY;

-- Daily Reports (Preschool)
CREATE TABLE IF NOT EXISTS ct_daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES ct_children(id),
  teacher_id UUID REFERENCES ct_users(id),
  report_date DATE NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  meals JSONB DEFAULT '{}',
  nap_duration_minutes INTEGER,
  activities TEXT[],
  teacher_note TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_daily_reports ENABLE ROW LEVEL SECURITY;

-- Leaderboard/Points
CREATE TABLE IF NOT EXISTS ct_engagement_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES ct_users(id),
  institution_id UUID REFERENCES ct_institutions(id),
  points INTEGER DEFAULT 0,
  badges TEXT[],
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_engagement_points ENABLE ROW LEVEL SECURITY;

-- Student Notes (teacher private notes)
CREATE TABLE IF NOT EXISTS ct_student_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES ct_users(id),
  student_id UUID REFERENCES ct_users(id),
  class_id UUID REFERENCES ct_classes(id),
  note TEXT,
  is_at_risk BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ct_student_notes ENABLE ROW LEVEL SECURITY;

-- Insert sample institution
INSERT INTO ct_institutions (id, name, domain, plan, institution_type, student_count, city, country)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
  'University of Toronto',
  'utoronto.ca',
  'enterprise',
  'university',
  89000,
  'Toronto',
  'Canada'
) ON CONFLICT (id) DO NOTHING;
