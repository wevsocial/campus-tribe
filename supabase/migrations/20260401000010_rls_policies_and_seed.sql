-- ============================================================
-- Sprint 4: Fix all RLS policies + data persistence issues
-- ============================================================

-- 1. Allow IT directors and admins to UPDATE ct_users in their institution
DROP POLICY IF EXISTS "it_admin_can_update_users" ON ct_users;
CREATE POLICY "it_admin_can_update_users" ON ct_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ct_users me
      WHERE me.id = auth.uid()
        AND me.institution_id = ct_users.institution_id
        AND me.role IN ('it_director', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ct_users me
      WHERE me.id = auth.uid()
        AND me.institution_id = ct_users.institution_id
        AND me.role IN ('it_director', 'admin')
    )
  );

-- 2. Allow users to read ct_users in same institution
DROP POLICY IF EXISTS "users_can_read_institution_members" ON ct_users;
CREATE POLICY "users_can_read_institution_members" ON ct_users
  FOR SELECT
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    OR id = auth.uid()
  );

-- 3. Allow users to update their own profile
DROP POLICY IF EXISTS "users_can_update_own_profile" ON ct_users;
CREATE POLICY "users_can_update_own_profile" ON ct_users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. Allow insert for new profile creation (bootstrap)
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON ct_users;
CREATE POLICY "users_can_insert_own_profile" ON ct_users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- 5. ct_events - ensure proper RLS for persistence
ALTER TABLE ct_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "institution_members_read_events" ON ct_events;
CREATE POLICY "institution_members_read_events" ON ct_events
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    OR status IN ('active', 'published')
  );

DROP POLICY IF EXISTS "staff_can_manage_events" ON ct_events;
CREATE POLICY "staff_can_manage_events" ON ct_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_events.institution_id
        AND role IN ('admin', 'staff', 'teacher', 'coach', 'student_rep', 'it_director')
    )
  );

-- 6. ct_clubs RLS
ALTER TABLE ct_clubs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_clubs" ON ct_clubs;
CREATE POLICY "read_institution_clubs" ON ct_clubs
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "manage_institution_clubs" ON ct_clubs;
CREATE POLICY "manage_institution_clubs" ON ct_clubs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_clubs.institution_id
        AND role IN ('admin', 'it_director', 'club_leader')
    )
  );

-- 7. ct_surveys RLS  
ALTER TABLE ct_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_surveys" ON ct_surveys;
CREATE POLICY "read_institution_surveys" ON ct_surveys
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "manage_surveys" ON ct_surveys;
CREATE POLICY "manage_surveys" ON ct_surveys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_surveys.institution_id
        AND role IN ('admin', 'teacher', 'it_director', 'staff')
    )
  );

-- 8. ct_venues RLS
ALTER TABLE ct_venues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_venues" ON ct_venues;
CREATE POLICY "read_institution_venues" ON ct_venues
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "manage_venues" ON ct_venues;
CREATE POLICY "manage_venues" ON ct_venues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_venues.institution_id
        AND role IN ('admin', 'it_director', 'staff', 'student_rep')
    )
  );

-- 9. ct_venue_bookings RLS
ALTER TABLE ct_venue_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_bookings" ON ct_venue_bookings;
CREATE POLICY "read_institution_bookings" ON ct_venue_bookings
  FOR SELECT USING (
    venue_id IN (
      SELECT id FROM ct_venues
      WHERE institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    )
    OR booked_by = auth.uid()
  );
DROP POLICY IF EXISTS "users_can_book" ON ct_venue_bookings;
CREATE POLICY "users_can_book" ON ct_venue_bookings
  FOR INSERT WITH CHECK (booked_by = auth.uid());
DROP POLICY IF EXISTS "manage_bookings" ON ct_venue_bookings;
CREATE POLICY "manage_bookings" ON ct_venue_bookings
  FOR UPDATE USING (
    booked_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'staff', 'student_rep', 'it_director')
    )
  );

-- 10. ct_event_rsvps
ALTER TABLE ct_event_rsvps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_can_rsvp" ON ct_event_rsvps;
CREATE POLICY "users_can_rsvp" ON ct_event_rsvps
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "staff_read_rsvps" ON ct_event_rsvps;
CREATE POLICY "staff_read_rsvps" ON ct_event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'staff', 'teacher', 'it_director')
    )
  );

-- 11. ct_wellbeing_checkins
ALTER TABLE ct_wellbeing_checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_wellbeing" ON ct_wellbeing_checkins;
CREATE POLICY "users_own_wellbeing" ON ct_wellbeing_checkins
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "staff_read_wellbeing" ON ct_wellbeing_checkins;
CREATE POLICY "staff_read_wellbeing" ON ct_wellbeing_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'parent', 'it_director')
    )
  );

-- 12. ct_announcements
ALTER TABLE ct_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_announcements" ON ct_announcements;
CREATE POLICY "read_institution_announcements" ON ct_announcements
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "staff_manage_announcements" ON ct_announcements;
CREATE POLICY "staff_manage_announcements" ON ct_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_announcements.institution_id
        AND role IN ('admin', 'staff', 'student_rep', 'it_director')
    )
  );

-- 13. ct_notifications
ALTER TABLE ct_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_notifications" ON ct_notifications;
CREATE POLICY "users_own_notifications" ON ct_notifications
  FOR ALL USING (user_id = auth.uid());

-- 14. ct_sports_leagues
ALTER TABLE ct_sports_leagues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_leagues" ON ct_sports_leagues;
CREATE POLICY "read_institution_leagues" ON ct_sports_leagues
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "coaches_manage_leagues" ON ct_sports_leagues;
CREATE POLICY "coaches_manage_leagues" ON ct_sports_leagues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_sports_leagues.institution_id
        AND role IN ('admin', 'coach', 'it_director')
    )
  );

-- 15. ct_sports_teams
ALTER TABLE ct_sports_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_teams" ON ct_sports_teams;
CREATE POLICY "read_institution_teams" ON ct_sports_teams
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "coaches_manage_teams" ON ct_sports_teams;
CREATE POLICY "coaches_manage_teams" ON ct_sports_teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_sports_teams.institution_id
        AND role IN ('admin', 'coach', 'it_director')
    )
  );

-- 16. ct_courses
ALTER TABLE ct_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_courses" ON ct_courses;
CREATE POLICY "read_institution_courses" ON ct_courses
  FOR SELECT USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "teachers_manage_courses" ON ct_courses;
CREATE POLICY "teachers_manage_courses" ON ct_courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_courses.institution_id
        AND role IN ('admin', 'teacher', 'it_director')
    )
  );

-- 17. ct_parent_links
ALTER TABLE ct_parent_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parents_own_links" ON ct_parent_links;
CREATE POLICY "parents_own_links" ON ct_parent_links
  FOR ALL USING (parent_id = auth.uid() OR student_id = auth.uid());

-- 18. ct_institutions - allow reading own institution
ALTER TABLE ct_institutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_institution" ON ct_institutions;
CREATE POLICY "read_own_institution" ON ct_institutions
  FOR SELECT USING (
    id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    OR true  -- allow reading all institutions for invite code lookup at registration
  );
DROP POLICY IF EXISTS "admins_manage_institution" ON ct_institutions;
CREATE POLICY "admins_manage_institution" ON ct_institutions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND institution_id = ct_institutions.id
        AND role IN ('admin', 'it_director')
    )
  );
DROP POLICY IF EXISTS "allow_institution_insert" ON ct_institutions;
CREATE POLICY "allow_institution_insert" ON ct_institutions
  FOR INSERT WITH CHECK (true);

-- 19. ct_survey_responses
ALTER TABLE ct_survey_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_responses" ON ct_survey_responses;
CREATE POLICY "users_own_responses" ON ct_survey_responses
  FOR ALL USING (respondent_id = auth.uid())
  WITH CHECK (respondent_id = auth.uid());
DROP POLICY IF EXISTS "staff_read_responses" ON ct_survey_responses;
CREATE POLICY "staff_read_responses" ON ct_survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ct_users u
      JOIN ct_surveys s ON s.institution_id = u.institution_id
      WHERE u.id = auth.uid()
        AND s.id = ct_survey_responses.survey_id
        AND u.role IN ('admin', 'teacher', 'it_director')
    )
  );

-- 20. ct_club_members / ct_club_memberships
ALTER TABLE ct_club_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_club_members" ON ct_club_members;
CREATE POLICY "read_club_members" ON ct_club_members
  FOR SELECT USING (
    club_id IN (
      SELECT id FROM ct_clubs
      WHERE institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "manage_own_membership" ON ct_club_members;
CREATE POLICY "manage_own_membership" ON ct_club_members
  FOR ALL USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'it_director', 'club_leader')
    )
  );

-- 21. ct_demo_requests - allow anyone to insert (already done, ensuring)
ALTER TABLE ct_demo_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert demo requests" ON ct_demo_requests;
CREATE POLICY "Anyone can insert demo requests" ON ct_demo_requests
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can read demo requests" ON ct_demo_requests;
CREATE POLICY "Admins can read demo requests" ON ct_demo_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'it_director')
    )
  );

-- 22. ct_budgets
ALTER TABLE ct_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "club_leaders_manage_budgets" ON ct_budgets;
CREATE POLICY "club_leaders_manage_budgets" ON ct_budgets
  FOR ALL USING (
    club_id IN (
      SELECT id FROM ct_clubs
      WHERE institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    )
  );

-- 23. ct_budget_items
ALTER TABLE ct_budget_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "club_leaders_manage_budget_items" ON ct_budget_items;
CREATE POLICY "club_leaders_manage_budget_items" ON ct_budget_items
  FOR ALL USING (
    budget_id IN (
      SELECT b.id FROM ct_budgets b
      JOIN ct_clubs c ON c.id = b.club_id
      WHERE c.institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    )
  );

-- 24. ct_audit_logs
ALTER TABLE ct_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_audit" ON ct_audit_logs;
CREATE POLICY "admins_read_audit" ON ct_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'it_director')
    )
  );
DROP POLICY IF EXISTS "system_insert_audit" ON ct_audit_logs;
CREATE POLICY "system_insert_audit" ON ct_audit_logs
  FOR INSERT WITH CHECK (true);

-- 25. ct_wellbeing_checks (alias table)
ALTER TABLE ct_wellbeing_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_wellbeing_checks" ON ct_wellbeing_checks;
CREATE POLICY "users_own_wellbeing_checks" ON ct_wellbeing_checks
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 26. ct_wellness_checkins (another alias)
ALTER TABLE ct_wellness_checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_wellness_checkins" ON ct_wellness_checkins;
CREATE POLICY "users_own_wellness_checkins" ON ct_wellness_checkins
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 27. ct_engagement_scores
ALTER TABLE ct_engagement_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_engagement" ON ct_engagement_scores;
CREATE POLICY "users_own_engagement" ON ct_engagement_scores
  FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "staff_read_engagement" ON ct_engagement_scores;
CREATE POLICY "staff_read_engagement" ON ct_engagement_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'it_director', 'coach')
    )
  );

-- 28. ct_interest_onboarding
ALTER TABLE ct_interest_onboarding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_interests" ON ct_interest_onboarding;
CREATE POLICY "users_own_interests" ON ct_interest_onboarding
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 29. ct_training_sessions
ALTER TABLE ct_training_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_training" ON ct_training_sessions;
CREATE POLICY "read_institution_training" ON ct_training_sessions
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM ct_sports_teams
      WHERE institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "coaches_manage_training" ON ct_training_sessions;
CREATE POLICY "coaches_manage_training" ON ct_training_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'coach', 'it_director')
    )
  );

-- 30. ct_athletes
ALTER TABLE ct_athletes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_institution_athletes" ON ct_athletes;
CREATE POLICY "read_institution_athletes" ON ct_athletes
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM ct_sports_teams
      WHERE institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "coaches_manage_athletes" ON ct_athletes;
CREATE POLICY "coaches_manage_athletes" ON ct_athletes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ct_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'coach', 'it_director')
    )
  );

-- ============================================================
-- Seed test data so dashboards show real content
-- ============================================================

-- Ensure the test institution exists
INSERT INTO ct_institutions (id, name, institution_type, city, country, color_primary, invite_code)
VALUES ('3f5ed307-2323-4b0f-9d13-b60a271a9235', 'WevSocial Test University', 'university', 'Toronto', 'Canada', '#0047AB', 'wevsocial-test')
ON CONFLICT (id) DO NOTHING;

-- Seed some events for the institution
INSERT INTO ct_events (institution_id, title, description, status, start_time, end_time, location, category, created_by)
SELECT 
  '3f5ed307-2323-4b0f-9d13-b60a271a9235',
  title, description, 'active', 
  now() + (idx || ' days')::interval,
  now() + (idx || ' days')::interval + '2 hours'::interval,
  location, category,
  (SELECT id FROM ct_users WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' AND role = 'admin' LIMIT 1)
FROM (VALUES
  (1, 'Campus Orientation Night', 'Welcome all new students to campus!', 'Main Hall', 'social'),
  (3, 'AI Workshop: Intro to ChatGPT APIs', 'Learn how to use AI APIs in your projects', 'Engineering Lab 3', 'academic'),
  (5, 'Spring Sports Festival', 'Annual sports festival with multiple events', 'Athletic Field', 'sports'),
  (7, 'Photography Exhibition Opening', 'Student photography showcase', 'Student Gallery', 'arts'),
  (10, 'Wellness & Mental Health Fair', 'Connecting students with wellness resources', 'Student Union', 'wellness'),
  (14, 'Career Fair 2026', 'Meet top employers from tech, finance, and more', 'Business School Atrium', 'career')
) AS v(idx, title, description, location, category)
WHERE NOT EXISTS (
  SELECT 1 FROM ct_events WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' LIMIT 1
);

-- Seed clubs
INSERT INTO ct_clubs (institution_id, name, description, category, is_approved, created_by)
SELECT 
  '3f5ed307-2323-4b0f-9d13-b60a271a9235',
  name, description, category, true,
  (SELECT id FROM ct_users WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' AND role = 'admin' LIMIT 1)
FROM (VALUES
  ('Debate Union', 'Practice critical thinking and public speaking', 'academic'),
  ('Film & Media Collective', 'Create and critique film and media', 'arts'),
  ('Robotics Club', 'Build and compete with robots', 'academic'),
  ('Dance Ensemble', 'All styles of dance welcome', 'arts'),
  ('Environmental Action', 'Campus sustainability initiatives', 'community'),
  ('Student Entrepreneurs', 'Launch your startup idea', 'career')
) AS v(name, description, category)
WHERE NOT EXISTS (
  SELECT 1 FROM ct_clubs WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' LIMIT 1
);

-- Seed sports leagues
INSERT INTO ct_sports_leagues (institution_id, name, sport_type, season, status, created_by)
SELECT
  '3f5ed307-2323-4b0f-9d13-b60a271a9235',
  name, sport_type, 'Spring 2026', 'active',
  (SELECT id FROM ct_users WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' AND role = 'admin' LIMIT 1)
FROM (VALUES
  ('Basketball Intramurals', 'basketball'),
  ('Soccer League', 'soccer'),
  ('Volleyball Cup', 'volleyball'),
  ('Tennis Open', 'tennis')
) AS v(name, sport_type)
WHERE NOT EXISTS (
  SELECT 1 FROM ct_sports_leagues WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' LIMIT 1
);

-- Seed venues
INSERT INTO ct_venues (institution_id, name, capacity, location, amenities, is_available, created_by)
SELECT
  '3f5ed307-2323-4b0f-9d13-b60a271a9235',
  name, capacity, location, amenities, true,
  (SELECT id FROM ct_users WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' AND role = 'admin' LIMIT 1)
FROM (VALUES
  ('Main Hall', 500, 'Building A, Ground Floor', ARRAY['AV equipment', 'stage', 'PA system']),
  ('Engineering Lab 3', 40, 'Engineering Building, Floor 3', ARRAY['computers', 'projector', 'whiteboard']),
  ('Student Gallery', 80, 'Arts Centre', ARRAY['display walls', 'lighting', 'reception area']),
  ('Athletic Field', 2000, 'East Campus', ARRAY['field lighting', 'bleachers', 'scoreboard']),
  ('Conference Room A', 20, 'Admin Building', ARRAY['video conferencing', 'whiteboard']),
  ('Sports Complex', 300, 'West Campus', ARRAY['courts', 'equipment storage', 'showers'])
) AS v(name, capacity, location, amenities)
WHERE NOT EXISTS (
  SELECT 1 FROM ct_venues WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' LIMIT 1
);

-- Seed surveys
INSERT INTO ct_surveys (institution_id, title, description, status, created_by)
SELECT
  '3f5ed307-2323-4b0f-9d13-b60a271a9235',
  title, description, 'active',
  (SELECT id FROM ct_users WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' AND role = 'admin' LIMIT 1)
FROM (VALUES
  ('Student Wellbeing Check-in', 'Monthly wellbeing survey for all students'),
  ('Campus Services Feedback', 'Help us improve campus services'),
  ('Event Satisfaction Survey', 'Tell us about your event experience')
) AS v(title, description)
WHERE NOT EXISTS (
  SELECT 1 FROM ct_surveys WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' LIMIT 1
);

-- Seed announcements
INSERT INTO ct_announcements (institution_id, title, body, type, created_by)
SELECT
  '3f5ed307-2323-4b0f-9d13-b60a271a9235',
  title, body, type,
  (SELECT id FROM ct_users WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' AND role = 'admin' LIMIT 1)
FROM (VALUES
  ('Welcome to Spring 2026!', 'The new semester has officially begun. Check your dashboard for upcoming events.', 'info'),
  ('Library Hours Extended', 'The library will be open 24/7 during exam season from April 15-30.', 'info'),
  ('Club Registration Open', 'Register your club or join existing clubs before March 31st.', 'event'),
  ('Campus Safety Update', 'New security measures in place. Please review the campus safety guidelines.', 'alert')
) AS v(title, body, type)
WHERE NOT EXISTS (
  SELECT 1 FROM ct_announcements WHERE institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235' LIMIT 1
);

-- Ensure amitt.k.sin@gmail.com has all roles (Amit tested this)
UPDATE ct_users 
SET roles = ARRAY['student','coach','club_leader','student_rep','parent','staff','teacher'],
    role = 'student'
WHERE email = 'amitt.k.sin@gmail.com';

-- Ensure institution_id for users with null
UPDATE ct_users
SET institution_id = '3f5ed307-2323-4b0f-9d13-b60a271a9235'
WHERE institution_id IS NULL AND email IN ('mrxxxbond@gmail.com', 'siinamits@gmail.com', 'mrxxxbong@gmail.com');

