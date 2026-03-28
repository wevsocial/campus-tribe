-- Campus Tribe sprint v1 workflows
-- Minimal schema additions for parent communication + integration settings

CREATE TABLE IF NOT EXISTS ct_parent_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE,
  child_id uuid REFERENCES ct_children(id) ON DELETE CASCADE,
  author_id uuid REFERENCES ct_users(id) ON DELETE SET NULL,
  audience text DEFAULT 'parent' CHECK (audience IN ('parent','teacher','both')),
  note_type text DEFAULT 'update' CHECK (note_type IN ('update','pickup','health','learning','behaviour','follow_up')),
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ct_parent_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_parent_updates_open" ON ct_parent_updates;
CREATE POLICY "ct_parent_updates_open" ON ct_parent_updates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS ct_platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('lms','payments')),
  provider text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','review','configured','disabled')),
  config jsonb DEFAULT '{}'::jsonb,
  notes text,
  updated_by uuid REFERENCES ct_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (institution_id, category, provider)
);
ALTER TABLE ct_platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_platform_settings_open" ON ct_platform_settings;
CREATE POLICY "ct_platform_settings_open" ON ct_platform_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS ct_survey_responses_survey_user_uidx
  ON ct_survey_responses (survey_id, user_id)
  WHERE user_id IS NOT NULL;

NOTIFY pgrst, 'reload schema';
