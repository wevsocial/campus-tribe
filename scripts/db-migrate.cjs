const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.ncftkuuxfllyohixiusb:socialWevisThenew12@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const migrations = [
  // 1. Fix is_superadmin - no recursion
  `CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email IN (
      'mrxxxbond@gmail.com',
      'mrxxxbong@gmail.com',
      'siinamits@gmail.com',
      'sdescha21@gmail.com',
      'wevsocial.s@gmail.com',
      'amitt.k.sin@gmail.com',
      'javbollad@gmail.com'
    )
  );
$$`,

  // 2. Fix get_my_institution_id
  `CREATE OR REPLACE FUNCTION public.get_my_institution_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT institution_id FROM public.ct_users WHERE id = auth.uid() LIMIT 1;
$$`,

  // 3. Grant execute
  `GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated`,
  `GRANT EXECUTE ON FUNCTION public.get_my_institution_id() TO authenticated`,

  // 4. Ensure ct_tickets has correct structure
  `CREATE TABLE IF NOT EXISTS ct_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES ct_users(id),
    to_user_id UUID REFERENCES ct_users(id),
    institution_id UUID REFERENCES ct_institutions(id),
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open','in-progress','resolved')),
    reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `ALTER TABLE ct_tickets ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ct_tickets' AND policyname = 'institution scoped tickets') THEN
      CREATE POLICY "institution scoped tickets" ON ct_tickets
        FOR ALL USING (institution_id = get_my_institution_id() OR is_superadmin());
    END IF;
  END $$`,

  // 5. Add missing athlete columns to ct_users
  `ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS is_athlete BOOLEAN DEFAULT false`,
  `ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS athlete_coach_id UUID REFERENCES ct_users(id)`,
  `ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS athlete_sport TEXT`,
  `ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS athlete_team_id UUID`,

  // 6. Ensure ct_match_participants exists
  `CREATE TABLE IF NOT EXISTS ct_match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID,
    user_id UUID REFERENCES ct_users(id),
    institution_id UUID REFERENCES ct_institutions(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `ALTER TABLE ct_match_participants ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ct_match_participants' AND policyname = 'match_participants_rls') THEN
      CREATE POLICY "match_participants_rls" ON ct_match_participants
        FOR ALL USING (institution_id = get_my_institution_id() OR is_superadmin());
    END IF;
  END $$`,

  // 7. Ensure ct_wellness_checkins has correct upsert constraint
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ct_wellness_checkins_user_date_unique') THEN
      ALTER TABLE ct_wellness_checkins ADD CONSTRAINT ct_wellness_checkins_user_date_unique UNIQUE(user_id, date);
    END IF;
  END $$ `,

  // 8. RLS on key tables - institution scoped
  // ct_users - students can see others in same institution
  `DROP POLICY IF EXISTS "users_institution_isolation" ON ct_users`,
  `CREATE POLICY "users_institution_isolation" ON ct_users
    FOR SELECT USING (
      institution_id = get_my_institution_id()
      OR id = auth.uid()
      OR is_superadmin()
    )`,

  // ct_clubs
  `DROP POLICY IF EXISTS "clubs_institution_rls" ON ct_clubs`,
  `CREATE POLICY "clubs_institution_rls" ON ct_clubs
    FOR SELECT USING (institution_id = get_my_institution_id() OR is_superadmin())`,

  // ct_events
  `DROP POLICY IF EXISTS "events_institution_rls" ON ct_events`,
  `CREATE POLICY "events_institution_rls" ON ct_events
    FOR SELECT USING (institution_id = get_my_institution_id() OR is_superadmin())`,

  // ct_sports_leagues
  `DROP POLICY IF EXISTS "leagues_institution_rls" ON ct_sports_leagues`,
  `CREATE POLICY "leagues_institution_rls" ON ct_sports_leagues
    FOR SELECT USING (institution_id = get_my_institution_id() OR is_superadmin())`,

  // ct_announcements
  `DROP POLICY IF EXISTS "announcements_institution_rls" ON ct_announcements`,
  `CREATE POLICY "announcements_institution_rls" ON ct_announcements
    FOR SELECT USING (institution_id = get_my_institution_id() OR is_superadmin())`,

  // ct_surveys
  `DROP POLICY IF EXISTS "surveys_institution_rls" ON ct_surveys`,
  `CREATE POLICY "surveys_institution_rls" ON ct_surveys
    FOR SELECT USING (institution_id = get_my_institution_id() OR is_superadmin())`,

  // ct_sports_teams
  `DROP POLICY IF EXISTS "teams_institution_rls" ON ct_sports_teams`,
  `CREATE POLICY "teams_institution_rls" ON ct_sports_teams
    FOR SELECT USING (institution_id = get_my_institution_id() OR is_superadmin())`,

  // ct_venues
  `DROP POLICY IF EXISTS "venues_institution_rls" ON ct_venues`,
  `CREATE POLICY "venues_institution_rls" ON ct_venues
    FOR SELECT USING (institution_id = get_my_institution_id() OR is_superadmin())`,

  // ct_notifications - user can see their own or same institution superadmin
  `DROP POLICY IF EXISTS "notifications_user_rls" ON ct_notifications`,
  `CREATE POLICY "notifications_user_rls" ON ct_notifications
    FOR SELECT USING (user_id = auth.uid() OR institution_id = get_my_institution_id() AND is_superadmin())`,

  // 9. Ensure ct_superadmins has the admin emails
  `INSERT INTO ct_superadmins (email) VALUES
    ('mrxxxbond@gmail.com'),
    ('mrxxxbong@gmail.com'),
    ('siinamits@gmail.com'),
    ('sdescha21@gmail.com'),
    ('wevsocial.s@gmail.com'),
    ('amitt.k.sin@gmail.com'),
    ('javbollad@gmail.com')
  ON CONFLICT (email) DO NOTHING`,

  // 10. Ensure ct_error_logs and ct_feature_events exist
  `CREATE TABLE IF NOT EXISTS ct_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT DEFAULT 'error' CHECK (level IN ('error','warning','info')),
    message TEXT NOT NULL,
    context JSONB,
    user_id UUID,
    institution_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ct_feature_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature TEXT NOT NULL,
    action TEXT,
    user_id UUID,
    institution_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
];

async function run() {
  await client.connect();
  console.log('Connected to DB');
  let errors = 0;
  for (let i = 0; i < migrations.length; i++) {
    try {
      await client.query(migrations[i]);
      console.log(`✓ Migration ${i + 1}`);
    } catch (e) {
      console.error(`✗ Migration ${i + 1}: ${e.message}`);
      errors++;
    }
  }
  await client.end();
  console.log(`Done. ${errors} errors.`);
}

run().catch(e => { console.error(e); process.exit(1); });
