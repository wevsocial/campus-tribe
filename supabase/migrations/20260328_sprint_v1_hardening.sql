-- Campus Tribe sprint v1 hardening
-- Safe schema support for conflict scans, sports scheduling, and survey traversal

ALTER TABLE ct_venue_bookings
  DROP CONSTRAINT IF EXISTS ct_venue_bookings_time_range_check;
ALTER TABLE ct_venue_bookings
  ADD CONSTRAINT ct_venue_bookings_time_range_check
  CHECK (end_time > start_time);

CREATE INDEX IF NOT EXISTS ct_venue_bookings_venue_time_idx
  ON ct_venue_bookings (venue_id, start_time, end_time, status);

CREATE UNIQUE INDEX IF NOT EXISTS ct_athletes_team_user_uidx
  ON ct_athletes (team_id, user_id)
  WHERE team_id IS NOT NULL AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ct_games_home_team_schedule_idx
  ON ct_games (home_team_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS ct_games_away_team_schedule_idx
  ON ct_games (away_team_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS ct_survey_questions_survey_position_idx
  ON ct_survey_questions (survey_id, position);

CREATE INDEX IF NOT EXISTS ct_parent_updates_child_created_idx
  ON ct_parent_updates (child_id, created_at DESC);

NOTIFY pgrst, 'reload schema';
