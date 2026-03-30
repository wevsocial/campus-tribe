-- Fix recursive ct_users RLS policies that caused infinite recursion errors
-- and broke role/profile reads at login.

ALTER TABLE ct_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_read_institution_members" ON ct_users;
DROP POLICY IF EXISTS "Users can read own profile" ON ct_users;
DROP POLICY IF EXISTS "it_admin_can_update_users" ON ct_users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON ct_users;
DROP POLICY IF EXISTS "Users can update own profile" ON ct_users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON ct_users;
DROP POLICY IF EXISTS "ct_users_insert" ON ct_users;

CREATE POLICY "ct_users_select_authenticated" ON ct_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ct_users_update_authenticated" ON ct_users
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "ct_users_insert_authenticated" ON ct_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
