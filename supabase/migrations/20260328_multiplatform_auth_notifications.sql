-- Campus Tribe multi-platform auth + notifications hardening

ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS platform_type text GENERATED ALWAYS AS (institution_type) STORED;

ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS platform_type text;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS onboarding_step text DEFAULT 'workspace';

CREATE TABLE IF NOT EXISTS ct_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES ct_users(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text DEFAULT 'system',
  link text,
  is_read boolean DEFAULT false,
  created_by uuid REFERENCES ct_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ct_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_notifications_open" ON ct_notifications;
CREATE POLICY "ct_notifications_open" ON ct_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

UPDATE ct_users u
SET platform_type = i.institution_type
FROM ct_institutions i
WHERE u.institution_id = i.id
  AND (u.platform_type IS NULL OR u.platform_type = '');

NOTIFY pgrst, 'reload schema';
