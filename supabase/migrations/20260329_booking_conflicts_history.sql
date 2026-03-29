-- Campus Tribe booking enforcement + append-only review history
-- - Prevent overlapping approved venue bookings at the DB layer
-- - Preserve an append-only audit/history trail for booking submissions + reviews

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
        'venue_id', NEW.venue_id
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
          'approved_by', NEW.approved_by
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
          'approved_by', NEW.approved_by
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

NOTIFY pgrst, 'reload schema';
