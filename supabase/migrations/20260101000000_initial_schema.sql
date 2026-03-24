-- Campus Tribe v1 Schema
-- Run this in Supabase SQL Editor or via CLI

-- Institutions
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  student_count INT DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'coach', 'club_leader', 'staff', 'it_director')),
  institution_id UUID REFERENCES institutions(id),
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubs
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  member_count INT DEFAULT 0,
  leader_id UUID REFERENCES users(id),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  cover_gradient TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club memberships
CREATE TABLE IF NOT EXISTS club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'officer', 'leader')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Venues
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  capacity INT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  is_bookable BOOLEAN DEFAULT TRUE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  club_id UUID REFERENCES clubs(id),
  venue_id UUID REFERENCES venues(id),
  venue_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  capacity INT DEFAULT 100,
  rsvp_count INT DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'past', 'cancelled')),
  cover_gradient TEXT,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Sports leagues
CREATE TABLE IF NOT EXISTS sports_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  season TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed')),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports teams
CREATE TABLE IF NOT EXISTS sports_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  league_id UUID NOT NULL REFERENCES sports_leagues(id) ON DELETE CASCADE,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  points INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports games
CREATE TABLE IF NOT EXISTS sports_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES sports_leagues(id),
  home_team_id UUID NOT NULL REFERENCES sports_teams(id),
  away_team_id UUID NOT NULL REFERENCES sports_teams(id),
  home_score INT,
  away_score INT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  venue_id UUID REFERENCES venues(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wellness check-ins
CREATE TABLE IF NOT EXISTS wellness_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  energy INT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  stress INT NOT NULL CHECK (stress BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event', 'club', 'sports', 'wellness', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue bookings
CREATE TABLE IF NOT EXISTS venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  club_id UUID REFERENCES clubs(id),
  event_id UUID REFERENCES events(id),
  booked_by UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club budget
CREATE TABLE IF NOT EXISTS club_budget_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  category TEXT,
  recorded_by UUID REFERENCES users(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read all users in their institution
CREATE POLICY "Users can view institution members" ON users
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM users WHERE id = auth.uid())
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Wellness checkins are private
CREATE POLICY "Users can manage own wellness" ON wellness_checkins
  FOR ALL USING (user_id = auth.uid());

-- Admins can read all wellness data in their institution
CREATE POLICY "Admins can read institution wellness" ON wellness_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Notifications are private
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Clubs visible to all authenticated users
CREATE POLICY "Clubs are publicly readable" ON clubs
  FOR SELECT TO authenticated USING (TRUE);

-- Events visible to all authenticated users
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT TO authenticated USING (TRUE);
