-- ============================================================
-- Sprint: Institution Isolation + Billing + Super Admin Portal
-- ============================================================

-- ── 1. Institution-scoped user reads (RLS already exists for same inst)
-- Make sure anon can't read ct_users
ALTER TABLE ct_users ENABLE ROW LEVEL SECURITY;

-- ── 2. ct_billing_plans — per-institution subscription/payment plans
CREATE TABLE IF NOT EXISTS ct_billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'standard',
  price_per_user_monthly NUMERIC(10,2) NOT NULL DEFAULT 4.99,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','quarterly','annual')),
  currency TEXT NOT NULL DEFAULT 'CAD',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. ct_payment_methods — stores (tokenized) card/bank info per user or institution
CREATE TABLE IF NOT EXISTS ct_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL DEFAULT 'card' CHECK (payment_type IN ('card','bank_transfer','direct_deposit')),
  -- Card fields (masked/tokenized — never store raw PAN in production)
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INT,
  card_exp_year INT,
  card_holder_name TEXT,
  -- For bank/direct deposit
  bank_reference TEXT,
  -- Status
  is_default BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. ct_institution_subscriptions — active subscription state
CREATE TABLE IF NOT EXISTS ct_institution_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id UUID REFERENCES ct_billing_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','past_due','cancelled','pending_payment')),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 month'),
  payment_method_id UUID REFERENCES ct_payment_methods(id),
  seats_paid INT DEFAULT 0,
  -- Which role groups are covered
  covers_roles TEXT[] DEFAULT ARRAY['admin','it_director','teacher','coach','staff'],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. ct_billing_invoices — invoice/payment records
CREATE TABLE IF NOT EXISTS ct_billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES ct_institution_subscriptions(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded','waived')),
  payment_method_id UUID REFERENCES ct_payment_methods(id),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 6. ct_user_seat_billing — track which users are paid seats
CREATE TABLE IF NOT EXISTS ct_user_seat_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES ct_institutions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES ct_institution_subscriptions(id),
  role TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_by UUID REFERENCES ct_users(id), -- who paid (admin/IT director)
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, user_id)
);

-- ── 7. ct_superadmins — list of Campus Tribe platform super admins
CREATE TABLE IF NOT EXISTS ct_superadmins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  added_by UUID,
  permissions JSONB DEFAULT '{"view_all": true, "stealth_login": true, "manage_institutions": true, "manage_billing": true}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 8. ct_stealth_sessions — audit log for super admin stealth logins
CREATE TABLE IF NOT EXISTS ct_stealth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  superadmin_id UUID REFERENCES ct_superadmins(id) ON DELETE CASCADE,
  target_institution_id UUID REFERENCES ct_institutions(id),
  target_user_id UUID REFERENCES ct_users(id),
  target_role TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT
);

-- ── 9. ct_email_verifications — email verification tokens for paid roles
CREATE TABLE IF NOT EXISTS ct_email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ct_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 10. Add payment_status to ct_users
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' 
  CHECK (payment_status IN ('not_required','pending','paid','overdue'));
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- ── 11. Add institution name to ct_institutions if missing
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE ct_institutions ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- ── 12. RLS Policies for new tables
ALTER TABLE ct_billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_institution_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_user_seat_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_superadmins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_stealth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_email_verifications ENABLE ROW LEVEL SECURITY;

-- Billing: institution admins can manage their own billing
DROP POLICY IF EXISTS "admins_manage_billing_plans" ON ct_billing_plans;
CREATE POLICY "admins_manage_billing_plans" ON ct_billing_plans FOR ALL
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM ct_users WHERE id = auth.uid() AND role IN ('admin','it_director'))
  );

DROP POLICY IF EXISTS "admins_read_billing_plans" ON ct_billing_plans;
CREATE POLICY "admins_read_billing_plans" ON ct_billing_plans FOR SELECT
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );

-- Payment methods: institution admins can see their institution's methods, users can see their own
DROP POLICY IF EXISTS "payment_methods_institution_admin" ON ct_payment_methods;
CREATE POLICY "payment_methods_institution_admin" ON ct_payment_methods FOR ALL
  USING (
    user_id = auth.uid()
    OR (
      institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
      AND EXISTS (SELECT 1 FROM ct_users WHERE id = auth.uid() AND role IN ('admin','it_director'))
    )
  );

-- Subscriptions
DROP POLICY IF EXISTS "subscription_read_own_institution" ON ct_institution_subscriptions;
CREATE POLICY "subscription_read_own_institution" ON ct_institution_subscriptions FOR SELECT
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "subscription_manage_admin" ON ct_institution_subscriptions;
CREATE POLICY "subscription_manage_admin" ON ct_institution_subscriptions FOR ALL
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM ct_users WHERE id = auth.uid() AND role IN ('admin','it_director'))
  );

-- Invoices
DROP POLICY IF EXISTS "invoices_read_institution" ON ct_billing_invoices;
CREATE POLICY "invoices_read_institution" ON ct_billing_invoices FOR SELECT
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM ct_users WHERE id = auth.uid() AND role IN ('admin','it_director'))
  );

-- Seat billing
DROP POLICY IF EXISTS "seat_billing_read_institution" ON ct_user_seat_billing;
CREATE POLICY "seat_billing_read_institution" ON ct_user_seat_billing FOR SELECT
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    AND (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM ct_users WHERE id = auth.uid() AND role IN ('admin','it_director'))
    )
  );

DROP POLICY IF EXISTS "seat_billing_manage_admin" ON ct_user_seat_billing;
CREATE POLICY "seat_billing_manage_admin" ON ct_user_seat_billing FOR ALL
  USING (
    institution_id = (SELECT institution_id FROM ct_users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM ct_users WHERE id = auth.uid() AND role IN ('admin','it_director'))
  );

-- Super admins — only themselves can read
DROP POLICY IF EXISTS "superadmins_self_read" ON ct_superadmins;
CREATE POLICY "superadmins_self_read" ON ct_superadmins FOR SELECT
  USING (email = (SELECT email FROM ct_users WHERE id = auth.uid()));

-- Stealth sessions — super admin only
DROP POLICY IF EXISTS "stealth_sessions_superadmin" ON ct_stealth_sessions;
CREATE POLICY "stealth_sessions_superadmin" ON ct_stealth_sessions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM ct_superadmins WHERE email = (SELECT email FROM ct_users WHERE id = auth.uid()) AND is_active = true)
  );

-- Email verifications
DROP POLICY IF EXISTS "email_verifications_own" ON ct_email_verifications;
CREATE POLICY "email_verifications_own" ON ct_email_verifications FOR SELECT
  USING (user_id = auth.uid());

-- ── 13. Seed super admins (will upsert by email; user_id linked after auth)
INSERT INTO ct_superadmins (email, permissions, is_active)
VALUES
  ('mrxxxbond@gmail.com', '{"view_all":true,"stealth_login":true,"manage_institutions":true,"manage_billing":true,"manage_users":true}'::jsonb, true),
  ('siinamits@gmail.com', '{"view_all":true,"stealth_login":true,"manage_institutions":true,"manage_billing":true,"manage_users":true}'::jsonb, true),
  ('sdescha21@gmail.com', '{"view_all":true,"stealth_login":true,"manage_institutions":true,"manage_billing":true,"manage_users":true}'::jsonb, true),
  ('wevsocial.s@gmail.com', '{"view_all":true,"stealth_login":true,"manage_institutions":true,"manage_billing":true,"manage_users":true}'::jsonb, true),
  ('amitt.k.sin@gmail.com', '{"view_all":true,"stealth_login":true,"manage_institutions":true,"manage_billing":true,"manage_users":true}'::jsonb, true),
  ('javbollad@gmail.com', '{"view_all":true,"stealth_login":true,"manage_institutions":true,"manage_billing":true,"manage_users":true}'::jsonb, true)
ON CONFLICT (email) DO UPDATE SET is_active = true, permissions = EXCLUDED.permissions;

-- ── 14. Function: check if current user is a super admin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM ct_superadmins sa
    JOIN ct_users u ON u.email = sa.email
    WHERE u.id = auth.uid() AND sa.is_active = true
  )
$$;

-- ── 15. Update super admin policies to use function (avoids recursion)
DROP POLICY IF EXISTS "superadmins_full_access_users" ON ct_users;
CREATE POLICY "superadmins_full_access_users" ON ct_users FOR ALL
  USING (is_superadmin());

DROP POLICY IF EXISTS "superadmins_full_institutions" ON ct_institutions;
CREATE POLICY "superadmins_full_institutions" ON ct_institutions FOR ALL
  USING (is_superadmin());

DROP POLICY IF EXISTS "superadmins_full_billing_plans" ON ct_billing_plans;
CREATE POLICY "superadmins_full_billing_plans" ON ct_billing_plans FOR ALL
  USING (is_superadmin());

DROP POLICY IF EXISTS "superadmins_full_subscriptions" ON ct_institution_subscriptions;
CREATE POLICY "superadmins_full_subscriptions" ON ct_institution_subscriptions FOR ALL
  USING (is_superadmin());

DROP POLICY IF EXISTS "superadmins_full_invoices" ON ct_billing_invoices;
CREATE POLICY "superadmins_full_invoices" ON ct_billing_invoices FOR ALL
  USING (is_superadmin());

DROP POLICY IF EXISTS "superadmins_full_seat_billing" ON ct_user_seat_billing;
CREATE POLICY "superadmins_full_seat_billing" ON ct_user_seat_billing FOR ALL
  USING (is_superadmin());

-- ── 16. View: platform analytics for super admin portal
CREATE OR REPLACE VIEW ct_platform_analytics AS
SELECT
  i.id as institution_id,
  i.name as institution_name,
  i.institution_type,
  i.subscription_status,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'student') as students,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role IN ('teacher','coach','admin','it_director','staff')) as paid_users,
  COUNT(DISTINCT u.id) FILTER (WHERE u.payment_status = 'paid') as paid_seats,
  COALESCE(SUM(bi.amount) FILTER (WHERE bi.status = 'paid'), 0) as total_revenue,
  MAX(bi.paid_at) as last_payment_at,
  i.created_at as institution_created_at
FROM ct_institutions i
LEFT JOIN ct_users u ON u.institution_id = i.id
LEFT JOIN ct_billing_invoices bi ON bi.institution_id = i.id
GROUP BY i.id, i.name, i.institution_type, i.subscription_status, i.created_at;

-- ── 17. Helper function to get institution name for a user
CREATE OR REPLACE FUNCTION get_user_institution_name(uid UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT i.name FROM ct_institutions i
  JOIN ct_users u ON u.institution_id = i.id
  WHERE u.id = uid
  LIMIT 1
$$;

-- ── 18. Seed default billing plan for existing institutions
INSERT INTO ct_billing_plans (institution_id, plan_name, price_per_user_monthly, billing_cycle)
SELECT id, 'standard', 4.99, 'monthly'
FROM ct_institutions
ON CONFLICT DO NOTHING;

-- ── 19. Seed trial subscription for existing institutions
INSERT INTO ct_institution_subscriptions (institution_id, status, trial_ends_at)
SELECT id, 'trial', now() + INTERVAL '30 days'
FROM ct_institutions
ON CONFLICT (institution_id) DO NOTHING;
