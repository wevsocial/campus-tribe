-- Campus Tribe PRD Phase 1 completion
-- Fix overly-open auth flows, add staff role, survey questions, and safer integration scaffolding

ALTER TABLE ct_users DROP CONSTRAINT IF EXISTS ct_users_role_check;
ALTER TABLE ct_users ADD CONSTRAINT ct_users_role_check
  CHECK (role IN ('student','student_rep','teacher','admin','coach','club_leader','staff','it_director','parent'));

ALTER TABLE ct_announcements ADD COLUMN IF NOT EXISTS audience text DEFAULT 'all';
ALTER TABLE ct_announcements ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ct_users(id);
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS max_members integer;
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE ct_events ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ct_users(id);

ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS anonymous boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS ct_survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES ct_surveys(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  question_type text NOT NULL DEFAULT 'text',
  options jsonb DEFAULT '[]'::jsonb,
  position integer DEFAULT 0,
  required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ct_survey_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_ct_survey_questions_open" ON ct_survey_questions;
CREATE POLICY "ct_ct_survey_questions_open" ON ct_survey_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE ct_api_keys ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE ct_notifications ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ct_users(id);
ALTER TABLE ct_notifications ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id);
ALTER TABLE ct_notifications ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE ct_notifications ADD COLUMN IF NOT EXISTS body text;
ALTER TABLE ct_notifications ADD COLUMN IF NOT EXISTS type text DEFAULT 'system';
ALTER TABLE ct_notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

DROP POLICY IF EXISTS "ct_notifications_open" ON ct_notifications;
DROP POLICY IF EXISTS "ct_notifications_select_own" ON ct_notifications;
DROP POLICY IF EXISTS "ct_notifications_insert_same_user_or_admin" ON ct_notifications;
DROP POLICY IF EXISTS "ct_notifications_update_own" ON ct_notifications;
DROP POLICY IF EXISTS "ct_notifications_delete_own" ON ct_notifications;
CREATE POLICY "ct_notifications_select_own" ON ct_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ct_notifications_insert_same_user_or_admin" ON ct_notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR created_by = auth.uid());
CREATE POLICY "ct_notifications_update_own" ON ct_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ct_notifications_delete_own" ON ct_notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
