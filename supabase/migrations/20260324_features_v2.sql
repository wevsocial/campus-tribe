-- Venue bookings
CREATE TABLE IF NOT EXISTS venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name TEXT NOT NULL,
  booked_by UUID REFERENCES profiles(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event proposals
CREATE TABLE IF NOT EXISTS event_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organizer_id UUID REFERENCES profiles(id),
  club_id UUID REFERENCES clubs(id),
  event_date TIMESTAMPTZ,
  budget_requested NUMERIC(10,2),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','approved','live','completed','rejected')),
  attendee_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach scores
CREATE TABLE IF NOT EXISTS athlete_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES profiles(id),
  coach_id UUID REFERENCES profiles(id),
  sport TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  score NUMERIC(5,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training sessions
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily reports (preschool)
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES profiles(id),
  teacher_id UUID REFERENCES profiles(id),
  report_date DATE NOT NULL,
  meals JSONB,
  nap_minutes INTEGER,
  mood TEXT,
  activities TEXT[],
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE venue_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own bookings" ON venue_bookings FOR ALL USING (booked_by = auth.uid());
CREATE POLICY "View all proposals" ON event_proposals FOR SELECT USING (true);
CREATE POLICY "Organizer manages proposals" ON event_proposals FOR ALL USING (organizer_id = auth.uid());
CREATE POLICY "Coach manages scores" ON athlete_scores FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "View own scores" ON athlete_scores FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Coach manages training" ON training_sessions FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Parents view daily reports" ON daily_reports FOR SELECT USING (child_id = auth.uid() OR teacher_id = auth.uid());
CREATE POLICY "Teachers create reports" ON daily_reports FOR INSERT WITH CHECK (teacher_id = auth.uid());
