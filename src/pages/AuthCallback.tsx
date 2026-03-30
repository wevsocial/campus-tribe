import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getRoleDashboardPath } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing sign-in…');

  useEffect(() => {
    const handle = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login', { replace: true }); return; }

      setStatus('Loading your profile…');
      let profile = null;
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.from('ct_users').select('role, roles').eq('id', session.user.id).maybeSingle();
        if (data?.role) { profile = data; break; }
        await new Promise(r => setTimeout(r, 500));
      }

      if (!profile) {
        const pending = localStorage.getItem('campus-tribe.pending-signup');
        const role = pending ? JSON.parse(pending).role : 'student';
        navigate(getRoleDashboardPath(role), { replace: true });
        return;
      }

      const roles: string[] = profile.roles?.length ? profile.roles : [profile.role];
      if (roles.length > 1) {
        sessionStorage.setItem('ct.pending-role-select', JSON.stringify(roles));
        navigate('/login?multiRole=1', { replace: true });
      } else {
        navigate(getRoleDashboardPath(profile.role), { replace: true });
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
