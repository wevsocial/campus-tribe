-- Campus Tribe live schema compatibility bridge
-- Makes the current app work against older production tables.

-- ------------------------------------------------------------
-- Venue bookings compatibility
-- ------------------------------------------------------------
ALTER TABLE ct_venue_bookings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE ct_venue_bookings ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES ct_users(id);
ALTER TABLE ct_venue_bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE ct_venue_bookings
  DROP CONSTRAINT IF EXISTS ct_venue_bookings_time_range_check;
ALTER TABLE ct_venue_bookings
  ADD CONSTRAINT ct_venue_bookings_time_range_check
  CHECK (end_time > start_time);

CREATE INDEX IF NOT EXISTS ct_venue_bookings_venue_time_idx
  ON ct_venue_bookings (venue_id, start_time, end_time, status);

CREATE TABLE IF NOT EXISTS ct_venue_booking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES ct_venue_bookings(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES ct_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'status_changed', 'note_updated', 'reviewed')),
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ct_venue_booking_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_venue_booking_history_open" ON ct_venue_booking_history;
CREATE POLICY "ct_venue_booking_history_open"
  ON ct_venue_booking_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS ct_venue_booking_history_booking_created_idx
  ON ct_venue_booking_history (booking_id, created_at DESC);

CREATE OR REPLACE FUNCTION ct_log_venue_booking_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  history_action TEXT;
  history_actor UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ct_venue_booking_history (
      booking_id,
      actor_id,
      action,
      from_status,
      to_status,
      note,
      metadata
    ) VALUES (
      NEW.id,
      NEW.booked_by,
      'submitted',
      NULL,
      NEW.status,
      NEW.notes,
      jsonb_build_object(
        'purpose', NEW.purpose,
        'start_time', NEW.start_time,
        'end_time', NEW.end_time,
        'venue_id', NEW.venue_id,
        'org_id', NEW.org_id,
        'attendee_count', NEW.attendee_count
      )
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF COALESCE(NEW.status, '') IS DISTINCT FROM COALESCE(OLD.status, '') THEN
      history_action := CASE
        WHEN NEW.approved_by IS NOT NULL THEN 'reviewed'
        ELSE 'status_changed'
      END;
      history_actor := COALESCE(NEW.approved_by, OLD.approved_by, NEW.booked_by, OLD.booked_by);

      INSERT INTO ct_venue_booking_history (
        booking_id,
        actor_id,
        action,
        from_status,
        to_status,
        note,
        metadata
      ) VALUES (
        NEW.id,
        history_actor,
        history_action,
        OLD.status,
        NEW.status,
        NEW.notes,
        jsonb_build_object(
          'purpose', NEW.purpose,
          'start_time', NEW.start_time,
          'end_time', NEW.end_time,
          'venue_id', NEW.venue_id,
          'org_id', NEW.org_id,
          'approved_by', NEW.approved_by,
          'attendee_count', NEW.attendee_count
        )
      );
    ELSIF COALESCE(NEW.notes, '') IS DISTINCT FROM COALESCE(OLD.notes, '') THEN
      history_actor := COALESCE(NEW.approved_by, OLD.approved_by, NEW.booked_by, OLD.booked_by);

      INSERT INTO ct_venue_booking_history (
        booking_id,
        actor_id,
        action,
        from_status,
        to_status,
        note,
        metadata
      ) VALUES (
        NEW.id,
        history_actor,
        'note_updated',
        OLD.status,
        NEW.status,
        NEW.notes,
        jsonb_build_object(
          'purpose', NEW.purpose,
          'start_time', NEW.start_time,
          'end_time', NEW.end_time,
          'venue_id', NEW.venue_id,
          'org_id', NEW.org_id,
          'approved_by', NEW.approved_by,
          'attendee_count', NEW.attendee_count
        )
      );
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ct_venue_booking_history_trigger ON ct_venue_bookings;
CREATE TRIGGER ct_venue_booking_history_trigger
AFTER INSERT OR UPDATE OF status, notes, approved_by
ON ct_venue_bookings
FOR EACH ROW
EXECUTE FUNCTION ct_log_venue_booking_history();

CREATE OR REPLACE FUNCTION ct_prevent_overlapping_approved_venue_bookings()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  conflicting_booking_id UUID;
BEGIN
  IF NEW.status = 'approved' THEN
    SELECT booking.id
      INTO conflicting_booking_id
    FROM ct_venue_bookings booking
    WHERE booking.id <> NEW.id
      AND booking.venue_id = NEW.venue_id
      AND booking.status = 'approved'
      AND booking.start_time < NEW.end_time
      AND booking.end_time > NEW.start_time
    LIMIT 1;

    IF conflicting_booking_id IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '23514',
        MESSAGE = 'Approved venue booking overlaps an existing approved booking.',
        DETAIL = format('Conflicting booking id: %s', conflicting_booking_id),
        HINT = 'Adjust the booking time or reject/cancel the conflicting approved booking first.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ct_prevent_overlapping_approved_venue_bookings_trigger ON ct_venue_bookings;
CREATE TRIGGER ct_prevent_overlapping_approved_venue_bookings_trigger
BEFORE INSERT OR UPDATE OF venue_id, start_time, end_time, status
ON ct_venue_bookings
FOR EACH ROW
EXECUTE FUNCTION ct_prevent_overlapping_approved_venue_bookings();

-- ------------------------------------------------------------
-- Survey schema compatibility
-- ------------------------------------------------------------
ALTER TABLE ct_survey_questions ADD COLUMN IF NOT EXISTS prompt text;
ALTER TABLE ct_survey_questions ADD COLUMN IF NOT EXISTS position integer;

UPDATE ct_survey_questions
SET prompt = COALESCE(prompt, question_text),
    position = COALESCE(position, order_index)
WHERE prompt IS NULL OR position IS NULL;

CREATE OR REPLACE FUNCTION ct_sync_survey_question_compat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.prompt IS NULL THEN NEW.prompt := NEW.question_text; END IF;
  IF NEW.question_text IS NULL THEN NEW.question_text := NEW.prompt; END IF;
  IF NEW.position IS NULL THEN NEW.position := NEW.order_index; END IF;
  IF NEW.order_index IS NULL THEN NEW.order_index := NEW.position; END IF;
  IF NEW.options IS NULL THEN NEW.options := '[]'::jsonb; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ct_sync_survey_question_compat_trigger ON ct_survey_questions;
CREATE TRIGGER ct_sync_survey_question_compat_trigger
BEFORE INSERT OR UPDATE ON ct_survey_questions
FOR EACH ROW
EXECUTE FUNCTION ct_sync_survey_question_compat();

CREATE INDEX IF NOT EXISTS ct_survey_questions_survey_position_idx
  ON ct_survey_questions (survey_id, position);

ALTER TABLE ct_survey_responses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES ct_users(id);
ALTER TABLE ct_survey_responses ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE ct_survey_responses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE ct_survey_responses
SET user_id = COALESCE(user_id, student_id)
WHERE user_id IS NULL;

CREATE OR REPLACE FUNCTION ct_sync_survey_response_compat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  survey_org_id uuid;
BEGIN
  IF NEW.user_id IS NULL THEN NEW.user_id := NEW.student_id; END IF;
  IF NEW.student_id IS NULL THEN NEW.student_id := NEW.user_id; END IF;
  IF NEW.answers IS NULL THEN NEW.answers := '{}'::jsonb; END IF;
  IF NEW.submitted_at IS NULL THEN NEW.submitted_at := now(); END IF;
  IF NEW.created_at IS NULL THEN NEW.created_at := now(); END IF;
  NEW.updated_at := now();

  IF NEW.org_id IS NULL THEN
    SELECT org_id INTO survey_org_id FROM ct_surveys WHERE id = NEW.survey_id;
    NEW.org_id := survey_org_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ct_sync_survey_response_compat_trigger ON ct_survey_responses;
CREATE TRIGGER ct_sync_survey_response_compat_trigger
BEFORE INSERT OR UPDATE ON ct_survey_responses
FOR EACH ROW
EXECUTE FUNCTION ct_sync_survey_response_compat();

CREATE UNIQUE INDEX IF NOT EXISTS ct_survey_responses_survey_user_uidx
  ON ct_survey_responses (survey_id, user_id)
  WHERE user_id IS NOT NULL;

NOTIFY pgrst, 'reload schema';
