import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getRoleDashboardPath } from '../context/AuthContext';

const PENDING_SIGNUP_KEY = 'campus-tribe.pending-signup';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing sign-in...');

  useEffect(() => {
    const handle = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login', { replace: true }); return; }

      setStatus('Setting up your profile...');

      // Read pending signup from localStorage
      let pending: { role?: string; platform_type?: string; full_name?: string; institution_name?: string } | null = null;
      try {
        const raw = localStorage.getItem(PENDING_SIGNUP_KEY);
        if (raw) pending = JSON.parse(raw);
      } catch {
        // ignore
      }

      // Wait for ct_users row - AuthContext bootstraps it on auth state change
      // Give it up to 8s
      let profile: { role: string; roles: string[] | null } | null = null;
      for (let i = 0; i < 16; i++) {
        const { data } = await supabase
          .from('ct_users')
          .select('role, roles')
          .eq('id', session.user.id)
          .maybeSingle();
        if (data?.role) { profile = data; break; }
        await new Promise(r => setTimeout(r, 500));
      }

      // Clear pending signup
      try { localStorage.removeItem(PENDING_SIGNUP_KEY); } catch { /* ignore */ }

      if (!profile) {
        // Bootstrap failed - create a minimal ct_users row ourselves
        const role = (pending?.role as string) || 'student';
        setStatus('Creating your account...');
        
        // Look up or create institution
        let institutionId: string | null = null;
        if (pending?.institution_name) {
          const { data: existingInst } = await supabase
            .from('ct_institutions')
            .select('id')
            .ilike('name', pending.institution_name)
            .maybeSingle();
          institutionId = existingInst?.id ?? null;
          if (!institutionId) {
            const inviteCode = pending.institution_name
              .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)
              || `campus-${Date.now().toString(36)}`;
            const { data: created } = await supabase
              .from('ct_institutions')
              .insert({ name: pending.institution_name, institution_type: pending.platform_type || 'university', country: 'Canada', invite_code: inviteCode })
              .select('id').single();
            institutionId = created?.id ?? null;
          }
        }
        if (!institutionId) {
          const { data: first } = await supabase.from('ct_institutions').select('id').limit(1).maybeSingle();
          institutionId = first?.id ?? null;
        }

        await supabase.from('ct_users').upsert({
          id: session.user.id,
          email: session.user.email,
          full_name: pending?.full_name || session.user.user_metadata?.full_name || session.user.email,
          role,
          roles: [role],
          platform_type: pending?.platform_type || 'university',
          institution_id: institutionId,
          is_active: true,
          onboarding_complete: false,
        });

        navigate(getRoleDashboardPath(role), { replace: true });
        return;
      }

      // Determine target role: use pending.role if set, otherwise profile.role
      const targetRole = pending?.role || profile.role;
      const roles: string[] = profile.roles?.length ? profile.roles : [profile.role];

      if (roles.length > 1) {
        sessionStorage.setItem('ct.pending-role-select', JSON.stringify(roles));
        navigate('/login?multiRole=1', { replace: true });
      } else {
        navigate(getRoleDashboardPath(targetRole), { replace: true });
      }
    };
    handle();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      <p className="font-jakarta text-on-surface-variant">{status}</p>
    </div>
  );
}
