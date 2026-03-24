-- Campus Tribe DB Schema
-- Run via Supabase SQL editor

-- Institutions
CREATE TABLE IF NOT EXISTS ct_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS ct_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'coach', 'admin', 'it_director', 'club_leader')),
  institution_id UUID REFERENCES ct_institutions(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubs
CREATE TABLE IF NOT EXISTS ct_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  logo_url TEXT,
  banner_url TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  leader_id UUID REFERENCES ct_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club Memberships
CREATE TABLE IF NOT EXISTS ct_club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES ct_clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'officer', 'leader')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Events
CREATE TABLE IF NOT EXISTS ct_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id),
  club_id UUID REFERENCES ct_clubs(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  venue_id UUID,
  location TEXT NOT NULL DEFAULT '',
  max_capacity INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES ct_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS ct_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES ct_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Venues
CREATE TABLE IF NOT EXISTS ct_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  location TEXT NOT NULL DEFAULT '',
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE
);

-- Venue Bookings
CREATE TABLE IF NOT EXISTS ct_venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES ct_venues(id),
  booked_by UUID REFERENCES ct_users(id),
  event_id UUID REFERENCES ct_events(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports Leagues
CREATE TABLE IF NOT EXISTS ct_sports_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id),
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  season TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registration' CHECK (status IN ('registration', 'active', 'completed')),
  created_by UUID REFERENCES ct_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports Teams
CREATE TABLE IF NOT EXISTS ct_sports_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES ct_sports_leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0
);

-- Sports Games
CREATE TABLE IF NOT EXISTS ct_sports_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES ct_sports_leagues(id),
  home_team_id UUID REFERENCES ct_sports_teams(id),
  away_team_id UUID REFERENCES ct_sports_teams(id),
  home_score INTEGER,
  away_score INTEGER,
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue_id UUID REFERENCES ct_venues(id),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wellness Check-ins
CREATE TABLE IF NOT EXISTS ct_wellness_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS ct_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('event', 'club', 'sports', 'wellness', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ct_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_wellness_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users read own" ON ct_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON ct_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own" ON ct_users FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs visible to all authenticated users
CREATE POLICY "Clubs readable" ON ct_clubs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Clubs insertable by auth" ON ct_clubs FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Clubs updatable by leader" ON ct_clubs FOR UPDATE USING (auth.uid() = leader_id);

-- Memberships
CREATE POLICY "Members read memberships" ON ct_club_memberships FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users join clubs" ON ct_club_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events
CREATE POLICY "Events readable" ON ct_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Events insertable" ON ct_events FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RSVPs
CREATE POLICY "RSVPs readable" ON ct_event_rsvps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "RSVPs own" ON ct_event_rsvps FOR ALL USING (auth.uid() = user_id);

-- Wellness
CREATE POLICY "Wellness own" ON ct_wellness_checkins FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Notifications own" ON ct_notifications FOR ALL USING (auth.uid() = user_id);

-- Trigger: create ct_users record on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ct_users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
