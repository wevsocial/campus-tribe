import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getRoleDashboardPath, persistPendingSignup, useAuth } from '../context/AuthContext';
import {
  User, Mail, Lock, Building2, KeyRound, Eye, EyeOff,
  GraduationCap, School, Baby, ChevronRight, CheckCircle, XCircle,
  Backpack, Vote, BookOpen, Trophy, Monitor, UserCheck, Users,
} from 'lucide-react';
import { AnimatedIcon } from '../components/ui/AnimatedIcon';

/* ── Platform / Role config ── */
const PLATFORMS = [
  { id: 'university', Icon: GraduationCap, label: 'University / College', desc: 'Higher education: students, faculty, clubs, sports' },
  { id: 'school',     Icon: School,        label: 'School (K-12)',         desc: 'Primary & secondary: students, teachers, parents' },
  { id: 'preschool',  Icon: Baby,          label: 'Preschool',             desc: 'Early childhood: parents, teachers, staff' },
];

const ROLES: Record<string, { id: string; label: string; desc: string }[]> = {
  university: [
    { id: 'student',     label: 'Student',              desc: 'Discover clubs, events, sports' },
    { id: 'student_rep', label: 'Student Rep / Dean',   desc: 'Book venues, run student council' },
    { id: 'teacher',     label: 'Teacher / Faculty',    desc: 'Courses, surveys, room bookings' },
    { id: 'club_leader', label: 'Club Leader',           desc: 'Manage your club or org' },
    { id: 'coach',       label: 'Sports Coach',          desc: 'Leagues, teams, schedules' },
    { id: 'it_director', label: 'IT Director',           desc: 'Platform config & security' },
    { id: 'staff',       label: 'Staff Member',          desc: 'Daily operations & reports' },
    { id: 'admin',       label: 'Administrator',         desc: 'Full platform management' },
    { id: 'parent',      label: 'Parent / Guardian',    desc: 'Monitor campus life' },
  ],
  school: [
    { id: 'student',     label: 'Student',              desc: 'Classes, clubs, activities' },
    { id: 'teacher',     label: 'Teacher',              desc: 'Courses & communications' },
    { id: 'parent',      label: 'Parent / Guardian',    desc: 'Stay connected with school' },
    { id: 'admin',       label: 'Administrator',         desc: 'Full platform management' },
    { id: 'staff',       label: 'Staff Member',          desc: 'Operations & reports' },
    { id: 'club_leader', label: 'Club Leader',           desc: 'Lead student activities' },
    { id: 'coach',       label: 'Sports Coach',          desc: 'Teams & competitions' },
  ],
  preschool: [
    { id: 'parent',  label: 'Parent / Guardian', desc: 'Daily updates & reports' },
    { id: 'teacher', label: 'Teacher',             desc: 'Reports & communications' },
    { id: 'staff',   label: 'Staff Member',         desc: 'Facility operations' },
    { id: 'admin',   label: 'Administrator',        desc: 'Full platform management' },
  ],
};

import type { LucideIcon } from 'lucide-react';

function getRoleIcon(roleId: string): LucideIcon {
  switch (roleId) {
    case 'student':     return Backpack;
    case 'student_rep': return Vote;
    case 'teacher':     return BookOpen;
    case 'club_leader': return Trophy;
    case 'coach':       return Trophy;
    case 'it_director': return Monitor;
    case 'staff':       return UserCheck;
    case 'admin':       return Building2;
    case 'parent':      return Users;
    default:            return GraduationCap;
  }
}

const inputCls =
  'w-full pl-10 pr-4 py-3 rounded-xl text-sm font-jakarta ' +
  'border border-gray-200 dark:border-slate-600 ' +
  'bg-white dark:bg-slate-800 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();

  const initPlat = (['university','school','preschool'].includes(searchParams.get('platform') ?? '')
    ? searchParams.get('platform')! : 'university') as string;

  const [platformType, setPlatformType] = useState(initPlat);
  const [role, setRole]                 = useState('');
  const [fullName, setFullName]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [inviteCode, setInviteCode]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const roles = ROLES[platformType] ?? [];

  const pwMatch = confirmPassword.length > 0 && password === confirmPassword;
  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleGoogleSignup = async () => {
    setError('');
    if (!platformType) { setError('Please select a platform first.'); return; }
    if (!role) { setError('Please select your role first.'); return; }

    persistPendingSignup({
      email: '',
      full_name: 'Google User',
      role: role as any,
      platform_type: platformType as any,
    });

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) {
      setSubmitting(false);
      setError(error.message);
    }
    // If no error, browser redirects — no need to setSubmitting(false)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!platformType) { setError('Please select a platform.'); return; }
    if (!role)         { setError('Please select your role.'); return; }
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!email.trim())    { setError('Email is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!institutionName.trim() && !inviteCode.trim()) { setError('Enter your institution name (new) or an invite code (join existing).'); return; }

    setSubmitting(true);
    try {
      persistPendingSignup({ email, full_name: fullName, role: role as any, platform_type: platformType as any, institution_name: institutionName.trim() || undefined, invite_code: inviteCode.trim().toLowerCase() || undefined });
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { email, full_name: fullName, role, platform_type: platformType, institution_name: institutionName.trim() || undefined, invite_code: inviteCode.trim().toLowerCase() || undefined }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signUpError) {
        if (/already registered|already exists/i.test(signUpError.message)) {
          setError('Email already registered. Sign in instead.');
          setTimeout(() => navigate(`/login?email=${encodeURIComponent(email)}`), 2000);
          return;
        }
        throw signUpError;
      }
      if (!data.user) throw new Error('Account creation failed. Please try again.');
      if (!data.session) { setError('Account created! Check your email to confirm, then sign in.'); return; }
      const profile = await refreshProfile(data.user.id);
      navigate(getRoleDashboardPath(profile?.role || role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[480px_1fr]">
      {/* ── LEFT: brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0047AB 0%,#1a5fc9 60%,#3A6FD0 100%)' }}>
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-white/5" />

        <Link to="/" className="relative z-10 font-lexend font-black text-2xl text-white">Campus Tribe</Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-lexend font-black text-white text-3xl leading-tight">One login.<br/>Every platform.</h2>
            <p className="text-white/70 font-jakarta mt-2">University · School · Preschool</p>
          </div>

          {/* Platform previews */}
          <div className="space-y-3">
            {PLATFORMS.map(({ id, Icon, label, desc }) => (
              <div key={id} className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-lexend font-bold text-white text-sm">{label}</p>
                  <p className="text-white/60 text-xs font-jakarta">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Role chips */}
          <div className="flex flex-wrap gap-2">
            {['Student','Student Rep','Teacher','Club Leader','Coach','IT Director','Staff','Admin','Parent'].map(r => (
              <span key={r} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-jakarta font-bold border border-white/20">{r}</span>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs relative z-10 font-jakarta">© 2026 WevSocial Inc.</p>
      </div>

      {/* ── RIGHT: single-page form ── */}
      <div className="flex items-start justify-center bg-white dark:bg-slate-950 overflow-y-auto p-6 lg:p-10">
        <div className="w-full max-w-xl py-4">
          {/* Mobile logo */}
          <Link to="/" className="font-lexend font-black text-xl text-blue-700 lg:hidden block mb-6">Campus Tribe</Link>

          <div className="mb-6">
            <h1 className="font-lexend font-black text-3xl text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-jakarta">Select platform, role, and fill in your details. All in one page.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Platform */}
            <div>
              <label className="block text-xs font-jakarta font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                1 · Choose your platform
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLATFORMS.map(({ id, Icon, label }) => (
                  <button
                    key={id} type="button"
                    onClick={() => { setPlatformType(id); setRole(''); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      platformType === id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platformType === id ? 'bg-blue-600' : 'bg-gray-100 dark:bg-slate-700'}`}>
                      <Icon size={20} className={platformType === id ? 'text-white' : 'text-gray-500 dark:text-slate-400'} />
                    </div>
                    <span className={`text-xs font-jakarta font-bold ${platformType === id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Role */}
            <div>
              <label className="block text-xs font-jakarta font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                2 · Select your role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roles.map((r) => {
                  const RoleIcon = getRoleIcon(r.id);
                  return (
                    <button
                      key={r.id} type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        role === r.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <AnimatedIcon icon={RoleIcon} size={18} className={role === r.id ? 'text-blue-600' : 'text-gray-500 dark:text-slate-400'} />
                      <div className="min-w-0">
                        <p className={`text-sm font-jakarta font-bold truncate ${role === r.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{r.label}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-jakarta truncate">{r.desc}</p>
                      </div>
                      {role === r.id && <ChevronRight size={14} className="ml-auto text-blue-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Google signup (between step 2 and 3) */}
            <div className="space-y-4">
              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                <span className="text-xs font-jakarta font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Quick signup</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              </div>

              {/* Hidden Google button (initialized by useEffect), clickable via handleGoogleSignup */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all font-jakarta font-bold text-gray-900 dark:text-white text-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7168v2.2581h2.9086C16.6582 14.0127 17.64 11.7955 17.64 9.2045z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3459 0-4.3318-1.5845-5.0386-3.7136H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                    <path d="M3.9614 10.71C3.7845 10.17 3.6818 9.5945 3.6818 9s.1027-1.17.2795-1.71V4.9582H.9574C.3477 6.1736 0 7.5477 0 9c0 1.4523.3477 2.8264.9574 4.0418L3.9614 10.71z" fill="#FBBC05"/>
                    <path d="M9 3.5773c1.3214 0 2.5077.4545 3.4405 1.3468l2.5814-2.5814C13.4636.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.9614 7.29C4.6682 5.1609 6.6541 3.5773 9 3.5773z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </button>
                <div className="hidden" />
              </div>

              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                <span className="text-xs font-jakarta font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">or fill in details below</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              </div>
            </div>

            {/* Section 3: Account details */}
            <div>
              <label className="block text-xs font-jakarta font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                3 · Account details
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Full name" autoComplete="name" className={inputCls} />
                </div>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu" autoComplete="email" className={inputCls} />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password (min. 6 chars)" autoComplete="new-password" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Confirm password */}
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {pwMatch && (
                    <CheckCircle size={15} className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                  {pwMismatch && (
                    <XCircle size={15} className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {pwMismatch && (
                  <p className="text-xs text-red-500 font-jakarta mt-1">Passwords do not match.</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={institutionName} onChange={e => setInstitutionName(e.target.value)}
                      placeholder="Institution name (new org)" className={inputCls} />
                  </div>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                      placeholder="Invite code (join existing)" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-2xl font-jakarta">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Creating account…' : 'Create account →'}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-slate-400 font-jakarta">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-700 dark:text-blue-400 font-bold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
