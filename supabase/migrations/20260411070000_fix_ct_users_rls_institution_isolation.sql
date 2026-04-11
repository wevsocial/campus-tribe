-- ============================================================
-- Sprint 7: Fix ct_users RLS recursion + add get_my_institution_id helper
-- ============================================================

-- Fix recursion: use a SECURITY DEFINER function to get user's institution_id
CREATE OR REPLACE FUNCTION get_my_institution_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT institution_id FROM ct_users WHERE id = auth.uid() LIMIT 1
$$;

-- Remove old potentially recursive policies
DROP POLICY IF EXISTS "ct_users_public_read_inst" ON ct_users;
DROP POLICY IF EXISTS "ct_users_select_authenticated" ON ct_users;
DROP POLICY IF EXISTS "users_can_read_institution_members" ON ct_users;
DROP POLICY IF EXISTS "ct_users_read_own_institution" ON ct_users;
DROP POLICY IF EXISTS "ct_users_update_authenticated" ON ct_users;
DROP POLICY IF EXISTS "ct_users_update_own" ON ct_users;
DROP POLICY IF EXISTS "ct_users_insert_authenticated" ON ct_users;
DROP POLICY IF EXISTS "ct_users_insert_own" ON ct_users;

-- New: users can read own profile + all users in same institution
CREATE POLICY "ct_users_read_own_institution" ON ct_users
  FOR SELECT
  USING (
    id = auth.uid()
    OR institution_id = get_my_institution_id()
  );

-- IT directors and admins can update users in their institution; others update only own profile
CREATE POLICY "ct_users_update_own" ON ct_users
  FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      institution_id = get_my_institution_id()
      AND EXISTS (
        SELECT 1 FROM ct_users u2 WHERE u2.id = auth.uid() AND u2.role IN ('it_director', 'admin')
      )
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR (
      institution_id = get_my_institution_id()
      AND EXISTS (
        SELECT 1 FROM ct_users u2 WHERE u2.id = auth.uid() AND u2.role IN ('it_director', 'admin')
      )
    )
  );

-- Allow insert for own profile only
CREATE POLICY "ct_users_insert_own" ON ct_users
  FOR INSERT
  WITH CHECK (id = auth.uid());
