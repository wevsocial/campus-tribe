-- Campus Tribe dashboard compatibility bridge
-- Aligns older live schema with current dashboard/frontend contracts.

-- ------------------------------------------------------------
-- Users / notifications
-- ------------------------------------------------------------
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS platform_type text;
UPDATE ct_users
SET platform_type = COALESCE(platform_type, institution_type)
WHERE platform_type IS NULL;

ALTER TABLE ct_notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
UPDATE ct_notifications
SET is_read = COALESCE(is_read, read, false)
WHERE is_read IS NULL;

-- ------------------------------------------------------------
-- Announcements compatibility
-- ------------------------------------------------------------
ALTER TABLE ct_announcements ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES ct_institutions(id) ON DELETE CASCADE;
ALTER TABLE ct_announcements ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES ct_users(id) ON DELETE SET NULL;
ALTER TABLE ct_announcements ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE ct_announcements ADD COLUMN IF NOT EXISTS target_roles text[] DEFAULT '{}'::text[];

UPDATE ct_announcements
SET institution_id = COALESCE(institution_id, org_id),
    author_id = COALESCE(author_id, created_by)
WHERE institution_id IS NULL OR author_id IS NULL;

CREATE INDEX IF NOT EXISTS ct_announcements_institution_created_idx
  ON ct_announcements (institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ct_announcements_author_created_idx
  ON ct_announcements (author_id, created_at DESC);

-- ------------------------------------------------------------
-- Clubs compatibility
-- ------------------------------------------------------------
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS leader_id uuid REFERENCES ct_users(id) ON DELETE SET NULL;
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE ct_clubs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE ct_clubs
SET is_approved = CASE
  WHEN is_approved IS NOT NULL THEN is_approved
  WHEN status IN ('approved', 'active', 'published') THEN true
  ELSE false
END
WHERE is_approved IS NULL;

CREATE INDEX IF NOT EXISTS ct_clubs_institution_leader_idx
  ON ct_clubs (institution_id, leader_id);

-- ------------------------------------------------------------
-- Venues compatibility
-- ------------------------------------------------------------
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS building text;
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS room_number text;
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS is_bookable boolean DEFAULT true;
ALTER TABLE ct_venues ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE ct_venues
SET building = COALESCE(building, location)
WHERE building IS NULL AND location IS NOT NULL;

-- ------------------------------------------------------------
-- Survey compatibility
-- ------------------------------------------------------------
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS target_roles text[] DEFAULT '{}'::text[];
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE ct_surveys ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

UPDATE ct_surveys
SET is_active = COALESCE(is_active, status = 'published'),
    is_anonymous = COALESCE(is_anonymous, anonymous, false),
    target_roles = CASE
      WHEN target_roles IS NOT NULL AND array_length(target_roles, 1) IS NOT NULL THEN target_roles
      WHEN target_audience IS NOT NULL AND btrim(target_audience) <> '' THEN ARRAY[target_audience]
      ELSE ARRAY[]::text[]
    END,
    updated_at = COALESCE(updated_at, created_at, now())
WHERE is_active IS NULL
   OR is_anonymous IS NULL
   OR target_roles IS NULL
   OR updated_at IS NULL;

CREATE INDEX IF NOT EXISTS ct_surveys_institution_status_idx
  ON ct_surveys (institution_id, status, created_at DESC);

-- ------------------------------------------------------------
-- Parent updates table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ct_parent_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES ct_children(id) ON DELETE CASCADE,
  author_id UUID REFERENCES ct_users(id) ON DELETE SET NULL,
  audience TEXT NOT NULL DEFAULT 'parent',
  note_type TEXT NOT NULL DEFAULT 'update',
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ct_parent_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_parent_updates_open" ON ct_parent_updates;
CREATE POLICY "ct_parent_updates_open"
  ON ct_parent_updates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS ct_parent_updates_child_created_idx
  ON ct_parent_updates (child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ct_parent_updates_institution_created_idx
  ON ct_parent_updates (institution_id, created_at DESC);

-- ------------------------------------------------------------
-- Platform settings table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ct_platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES ct_institutions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES ct_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ct_platform_settings_institution_category_provider_key UNIQUE (institution_id, category, provider)
);

ALTER TABLE ct_platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_platform_settings_open" ON ct_platform_settings;
CREATE POLICY "ct_platform_settings_open"
  ON ct_platform_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS ct_platform_settings_institution_updated_idx
  ON ct_platform_settings (institution_id, updated_at DESC);

-- ------------------------------------------------------------
-- Event RSVP compatibility
-- ------------------------------------------------------------
ALTER TABLE ct_event_rsvps ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE ct_event_rsvps ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
UPDATE ct_event_rsvps r
SET user_id = COALESCE(r.user_id, r.student_id)
WHERE r.user_id IS NULL
  AND EXISTS (SELECT 1 FROM ct_users u WHERE u.id = r.student_id);

CREATE UNIQUE INDEX IF NOT EXISTS ct_event_rsvps_event_user_uidx
  ON ct_event_rsvps (event_id, user_id)
  WHERE user_id IS NOT NULL;

-- ------------------------------------------------------------
-- Sync triggers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION ct_sync_announcement_compat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN NEW.institution_id := NEW.org_id; END IF;
  IF NEW.org_id IS NULL THEN NEW.org_id := NEW.institution_id; END IF;
  IF NEW.author_id IS NULL THEN NEW.author_id := NEW.created_by; END IF;
  IF NEW.created_by IS NULL THEN NEW.created_by := NEW.author_id; END IF;
  IF NEW.target_roles IS NULL THEN NEW.target_roles := ARRAY[]::text[]; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ct_sync_announcement_compat_trigger ON ct_announcements;
CREATE TRIGGER ct_sync_announcement_compat_trigger
BEFORE INSERT OR UPDATE ON ct_announcements
FOR EACH ROW
EXECUTE FUNCTION ct_sync_announcement_compat();

CREATE OR REPLACE FUNCTION ct_sync_survey_compat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN NEW.institution_id := NEW.org_id; END IF;
  IF NEW.org_id IS NULL THEN NEW.org_id := NEW.institution_id; END IF;
  IF NEW.target_roles IS NULL THEN
    NEW.target_roles := CASE
      WHEN NEW.target_audience IS NOT NULL AND btrim(NEW.target_audience) <> '' THEN ARRAY[NEW.target_audience]
      ELSE ARRAY[]::text[]
    END;
  END IF;
  IF NEW.is_active IS NULL THEN NEW.is_active := (NEW.status = 'published'); END IF;
  IF NEW.is_anonymous IS NULL THEN NEW.is_anonymous := COALESCE(NEW.anonymous, false); END IF;
  IF NEW.anonymous IS NULL THEN NEW.anonymous := COALESCE(NEW.is_anonymous, false); END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ct_sync_survey_compat_trigger ON ct_surveys;
CREATE TRIGGER ct_sync_survey_compat_trigger
BEFORE INSERT OR UPDATE ON ct_surveys
FOR EACH ROW
EXECUTE FUNCTION ct_sync_survey_compat();

CREATE OR REPLACE FUNCTION ct_sync_event_rsvp_compat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN NEW.user_id := NEW.student_id; END IF;
  IF NEW.student_id IS NULL THEN NEW.student_id := NEW.user_id; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ct_sync_event_rsvp_compat_trigger ON ct_event_rsvps;
CREATE TRIGGER ct_sync_event_rsvp_compat_trigger
BEFORE INSERT OR UPDATE ON ct_event_rsvps
FOR EACH ROW
EXECUTE FUNCTION ct_sync_event_rsvp_compat();

NOTIFY pgrst, 'reload schema';
