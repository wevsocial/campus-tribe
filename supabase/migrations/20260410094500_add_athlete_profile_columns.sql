-- Add athlete profile support to ct_users
ALTER TABLE public.ct_users
  ADD COLUMN IF NOT EXISTS is_athlete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS athlete_sport text,
  ADD COLUMN IF NOT EXISTS athlete_team_id uuid,
  ADD COLUMN IF NOT EXISTS athlete_coach_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ct_users_athlete_team_id_fkey'
  ) THEN
    ALTER TABLE public.ct_users
      ADD CONSTRAINT ct_users_athlete_team_id_fkey
      FOREIGN KEY (athlete_team_id)
      REFERENCES public.ct_sports_teams(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ct_users_athlete_coach_id_fkey'
  ) THEN
    ALTER TABLE public.ct_users
      ADD CONSTRAINT ct_users_athlete_coach_id_fkey
      FOREIGN KEY (athlete_coach_id)
      REFERENCES public.ct_users(id)
      ON DELETE SET NULL;
  END IF;
END $$;
