-- ============================================================
-- Campus Tribe Platform v3 — Real Platform Migration
-- Adds institution_type, user profile fields, missing tables
-- ============================================================

-- 1. Add institution_type to ct_institutions
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS institution_type text NOT NULL DEFAULT 'university' CHECK (institution_type IN ('university', 'school', 'preschool'));
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS country text DEFAULT 'Canada';
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS color_primary text DEFAULT '#0047AB';
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Add profile fields to ct_users
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS institution_type text;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS year_of_study integer;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Add platform_type to ct_clubs, ct_events, ct_venues (for filtering)
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE;
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE;

-- Already exist but ensure nullable:
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS max_members integer;
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ct_users(id);
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ct_users(id);
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS capacity integer;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS start_time timestamptz;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS end_time timestamptz;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS status text DEFAULT 'upcoming';

ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ct_users(id);
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS capacity integer;
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}';

-- 4. Wellbeing checkins - ensure proper structure  
ALTER TABLE ct_wellbeing_checkins ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id);
ALTER TABLE ct_wellbeing_checkins ADD COLUMN IF NOT EXISTS mood_score integer CHECK (mood_score BETWEEN 1 AND 5);
ALTER TABLE ct_wellbeing_checkins ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE ct_wellbeing_checkins ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES ct_users(id);
ALTER TABLE ct_wellbeing_checkins ADD COLUMN IF NOT EXISTS checked_in_at timestamptz DEFAULT now();

-- 5. Surveys - ensure institution_id
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id);
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ct_users(id);
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS closes_at timestamptz;
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS anonymous boolean DEFAULT false;

-- 6. Club members - proper structure
ALTER TABLE ct_club_members ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id);
ALTER TABLE ct_club_members ADD COLUMN IF NOT EXISTS role text DEFAULT 'member';
ALTER TABLE ct_club_members ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now();

-- 7. Enable RLS on ct_institutions
ALTER TABLE ct_institutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_inst_public_read" ON ct_institutions;
CREATE POLICY "ct_inst_public_read" ON ct_institutions FOR SELECT USING (true);
DROP POLICY IF EXISTS "ct_inst_admin_write" ON ct_institutions;
CREATE POLICY "ct_inst_admin_write" ON ct_institutions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Enable RLS on ct_users (update existing)
-- Policy already exists, just ensure insert works for new signups
DROP POLICY IF EXISTS "ct_users_insert" ON ct_users;
CREATE POLICY "ct_users_insert" ON ct_users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "ct_users_public_read_inst" ON ct_users;
CREATE POLICY "ct_users_public_read_inst" ON ct_users FOR SELECT TO authenticated USING (true);

-- 9. Open policies for campus tribe core tables
DO $$ 
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ct_clubs','ct_events','ct_venues','ct_event_rsvps','ct_venue_bookings',
    'ct_surveys','ct_survey_questions','ct_survey_responses',
    'ct_wellbeing_checkins','ct_club_members','ct_announcements',
    'ct_assignments','ct_grades','ct_courses','ct_classes','ct_attendance',
    'ct_sports_leagues','ct_sports_teams','ct_sports_games','ct_tournaments',
    'ct_engagement_points','ct_notifications'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "ct_%I_open" ON %I', t, t);
    EXECUTE format('CREATE POLICY "ct_%I_open" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- 10. Onboarding table for quick setup
CREATE TABLE IF NOT EXISTS ct_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES ct_users(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES ct_institutions(id),
  step_completed integer DEFAULT 0,
  interests text[] DEFAULT '{}',
  goals text[] DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ct_onboarding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_onboarding_own" ON ct_onboarding;
CREATE POLICY "ct_onboarding_own" ON ct_onboarding FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
