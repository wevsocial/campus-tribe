import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, GraduationCap, School, Baby, Backpack, Vote, BookOpen, Award, Trophy, Monitor, UserCheck, Building2, Users } from 'lucide-react';
import { getRoleDashboardPath, useAuth } from '../context/AuthContext';
import { initializeGoogleButton } from '../lib/googleIdentity';
import { AnimatedIcon } from '../components/ui/AnimatedIcon';
import { supabase } from '../lib/supabase';
import type { LucideIcon } from 'lucide-react';

const PLATFORM_CARDS: { icon: LucideIcon; label: string; desc: string; iconBg: string }[] = [
  { icon: GraduationCap, label: 'University', desc: 'Students, faculty, clubs, sports, surveys, venue booking', iconBg: 'bg-primary' },
  { icon: School,        label: 'School',     desc: 'Students, teachers, parents, clubs, events', iconBg: 'bg-secondary' },
  { icon: Baby,          label: 'Preschool',  desc: 'Parents, teachers, staff, daily reports', iconBg: 'bg-tertiary' },
];

const ALL_ROLES = ['Student', 'Student Rep', 'Teacher', 'Club Leader', 'Coach', 'IT Director', 'Staff', 'Admin', 'Parent'];

const STATS = [
  { val: '12K+', label: 'Students' },
  { val: '200+', label: 'Institutions' },
  { val: '4K+', label: 'Events/mo' },
];

const ROLE_META: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  student: { label: 'Student', description: 'Classes, clubs and campus life', icon: Backpack },
  student_rep: { label: 'Student Rep', description: 'Venues, announcements, events', icon: Vote },
  teacher: { label: 'Teacher', description: 'Courses and student progress', icon: BookOpen },
  club_leader: { label: 'Club Leader', description: 'Members, budget and activities', icon: Award },
  coach: { label: 'Coach', description: 'Teams, leagues and schedules', icon: Trophy },
  it_director: { label: 'IT Director', description: 'Platform security and integrations', icon: Monitor },
  staff: { label: 'Staff', description: 'Operations and reports', icon: UserCheck },
  admin: { label: 'Admin', description: 'Institution-wide management', icon: Building2 },
  parent: { label: 'Parent', description: 'Track your child and updates', icon: Users },
};

function RoleSelector({ roles, onSelect }: { roles: string[]; onSelect: (role: string) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [remember, setRemember] = useState(false);

  const selectRole = (role: string) => {
    if (remember) localStorage.setItem('ct.role-choice.' + today, role);
    onSelect(role);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl bg-surface dark:bg-slate-900 p-8 shadow-2xl border border-primary/20">
        <div className="mb-6">
          <p className="font-lexend font-black text-primary text-xl">Campus Tribe</p>
          <h2 className="font-lexend font-black text-2xl text-on-surface mt-2">Choose your role</h2>
          <p className="text-sm text-on-surface-variant font-jakarta mt-1">Platform context: Multi-role account detected. Select one role for this session.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {roles.map((role, idx) => {
            const meta = ROLE_META[role] ?? { label: role.replace('_', ' '), description: 'Continue with this role', icon: Users };
            const Icon = meta.icon;
            const isPrimary = idx === 0;
            return (
              <button
                key={role}
                onClick={() => selectRole(role)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:bg-primary-container/40 ${isPrimary ? 'border-primary bg-primary-container/30' : 'border-outline/40'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center"><Icon size={18} /></div>
                  <div className="min-w-0">
                    <p className="font-jakarta font-bold text-on-surface text-sm">{meta.label}</p>
                    <p className="text-xs text-on-surface-variant font-jakarta">{meta.description}</p>
                    {isPrimary && <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-primary text-white">Primary role</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm font-jakarta text-on-surface-variant cursor-pointer">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
          Remember this choice for today
        </label>
      </div>
    </div>
  );
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, refreshProfile } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(searchParams.get('email') ? 'Account already exists — please sign in here.' : '');
  const [submitting, setSubmitting] = useState(false);
  const [roleSelectRoles, setRoleSelectRoles] = useState<string[] | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!googleButtonRef.current) return;
    initializeGoogleButton({
      element: googleButtonRef.current,
      onBeforeAuth: () => { setSubmitting(true); setError(''); },
      onSuccess: async () => {
        const profile = await refreshProfile();
        setSubmitting(false);
        navigate(getRoleDashboardPath(profile?.role));
      },
      onError: (message) => { setSubmitting(false); setError(message); },
    }).catch((err) => setError(err instanceof Error ? err.message : 'Google sign-in failed.'));
  }, [navigate, refreshProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (!result.success) {
        const msg = result.error || 'Sign in failed.';
        if (/email not confirmed/i.test(msg)) {
          setError('Your email is not yet confirmed. Check your inbox for the confirmation link.');
        } else if (/invalid login credentials/i.test(msg)) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(msg);
        }
        return;
      }
      // Fetch profile directly from DB (bypasses any AuthContext timing issues)
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      let roles: string[] = [];
      let primaryRole = 'student';
      if (userId) {
        const { data: profileRow } = await supabase
          .from('ct_users')
          .select('role, roles')
          .eq('id', userId)
          .maybeSingle();
        if (profileRow) {
          primaryRole = profileRow.role || 'student';
          roles = profileRow.roles?.length ? profileRow.roles : [primaryRole];
        }
      }
      if (roles.length > 1) {
        setRoleSelectRoles(roles);
      } else {
        navigate(getRoleDashboardPath(primaryRole));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    sessionStorage.setItem('ct.session-role', role);
    setRoleSelectRoles(null);
    navigate(getRoleDashboardPath(role));
  };

  useEffect(() => {
    if (!roleSelectRoles?.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const remembered = localStorage.getItem('ct.role-choice.' + today);
    if (remembered && roleSelectRoles.includes(remembered)) {
      handleRoleSelect(remembered);
    }
  }, [roleSelectRoles]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {roleSelectRoles && <RoleSelector roles={roleSelectRoles} onSelect={handleRoleSelect} />}

      {/* Left: brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0047AB 0%, #1a5fc9 60%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10">
          <Link to="/" className="font-lexend font-900 text-2xl text-white">Campus Tribe</Link>
          <p className="text-white/50 text-xs mt-1 font-jakarta">by WevSocial</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-white text-4xl font-lexend font-900 leading-tight">
              One login.<br />Every platform.
            </h1>
            <p className="text-white/70 font-jakarta text-lg mt-2">University · School · Preschool</p>
          </div>

          {/* Platform cards */}
          <div className="grid grid-cols-3 gap-3">
            {PLATFORM_CARDS.map((p) => (
              <div key={p.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.iconBg}`}>
                  <AnimatedIcon icon={p.icon} size={18} className="text-white" />
                </div>
                <p className="font-lexend font-700 text-white text-sm mt-2">{p.label}</p>
                <p className="text-white/60 text-xs mt-1 font-jakarta leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Role chips */}
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((r) => (
              <span
                key={r}
                className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-jakarta font-700 border border-white/20"
              >
                {r}
              </span>
            ))}
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center bg-white/10 rounded-2xl py-4">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <p className="font-lexend font-900 text-2xl text-white">{s.val}</p>
                <p className="text-white/60 text-xs font-jakarta mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs relative z-10 font-jakarta">© 2026 WevSocial Inc.</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="font-lexend font-900 text-xl text-primary lg:hidden">Campus Tribe</Link>
            <h1 className="font-lexend font-900 text-4xl text-gray-900 dark:text-white mt-2 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 font-jakarta">Sign in to your Campus Tribe account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 font-jakarta text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 font-jakarta text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-jakarta">Forgot password?</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-2xl font-jakarta">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-jakarta font-700 text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            <span className="text-xs font-jakarta font-700 text-gray-400 dark:text-slate-500 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>

          <div className="flex justify-center">
            <div ref={googleButtonRef} className="min-h-[44px]" />
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 font-jakarta mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-700 dark:text-blue-400 font-700 hover:underline">Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
