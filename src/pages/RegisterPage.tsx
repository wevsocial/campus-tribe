import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getRoleDashboardPath, persistPendingSignup, useAuth } from '../context/AuthContext';
import { initializeGoogleButton } from '../lib/googleIdentity';
import { User, Mail, Lock, Building2, KeyRound, Eye, EyeOff, Check } from 'lucide-react';

const PLATFORM_ROLES: Record<string, { id: string; emoji: string; label: string; desc: string }[]> = {
  university: [
    { id: 'student', emoji: '🎒', label: 'Student', desc: 'Discover clubs, join sports, attend events' },
    { id: 'student_rep', emoji: '🗳️', label: 'Student Rep', desc: 'Book venues, organize student events' },
    { id: 'teacher', emoji: '👩‍🏫', label: 'Teacher / Faculty', desc: 'Manage courses, create surveys' },
    { id: 'admin', emoji: '🏛️', label: 'Administrator', desc: 'Full platform management' },
    { id: 'staff', emoji: '👔', label: 'Staff Member', desc: 'Daily reports and communications' },
    { id: 'club_leader', emoji: '🏆', label: 'Club Leader', desc: 'Manage your club or organization' },
    { id: 'coach', emoji: '⚽', label: 'Sports Coach', desc: 'Run leagues and manage teams' },
    { id: 'it_director', emoji: '🖥️', label: 'IT Director', desc: 'Platform config and security' },
    { id: 'parent', emoji: '👨‍👩‍👧', label: 'Parent / Guardian', desc: 'Monitor children\'s campus life' },
  ],
  school: [
    { id: 'student', emoji: '🎒', label: 'Student', desc: 'Classes, clubs, and school events' },
    { id: 'teacher', emoji: '👩‍🏫', label: 'Teacher', desc: 'Manage courses and communications' },
    { id: 'parent', emoji: '👨‍👩‍👧', label: 'Parent / Guardian', desc: 'Stay connected with school life' },
    { id: 'admin', emoji: '🏛️', label: 'Administrator', desc: 'Full platform management' },
    { id: 'staff', emoji: '👔', label: 'Staff Member', desc: 'Daily operations and reports' },
    { id: 'club_leader', emoji: '🏆', label: 'Club Leader', desc: 'Lead student activities' },
    { id: 'coach', emoji: '⚽', label: 'Sports Coach', desc: 'Run teams and competitions' },
  ],
  preschool: [
    { id: 'parent', emoji: '👨‍👩‍👧', label: 'Parent / Guardian', desc: 'Daily updates and reports' },
    { id: 'teacher', emoji: '👩‍🏫', label: 'Teacher', desc: 'Daily reports and communications' },
    { id: 'staff', emoji: '👔', label: 'Staff Member', desc: 'Facility operations' },
    { id: 'admin', emoji: '🏛️', label: 'Administrator', desc: 'Full platform management' },
  ],
};

const PLATFORMS = [
  { id: 'university', emoji: '🎓', label: 'University / College', desc: 'Higher education, 18+ platforms' },
  { id: 'school', emoji: '🏫', label: 'School (K-12)', desc: 'Primary and secondary schools' },
  { id: 'preschool', emoji: '🧸', label: 'Preschool', desc: 'Early childhood centers and daycare' },
];

const PLATFORM_CARDS = [
  { emoji: '🎓', label: 'University', desc: 'Students, faculty, clubs, sports, surveys, venue booking' },
  { emoji: '🏫', label: 'School', desc: 'Students, teachers, parents, clubs, events' },
  { emoji: '🧸', label: 'Preschool', desc: 'Parents, teachers, staff, daily reports' },
];

const ALL_ROLES = ['Student', 'Student Rep', 'Teacher', 'Club Leader', 'Coach', 'IT Director', 'Staff', 'Admin', 'Parent'];
const STATS = [
  { val: '12K+', label: 'Students' },
  { val: '200+', label: 'Institutions' },
  { val: '4K+', label: 'Events/mo' },
];

type Step = 1 | 2 | 3;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const initialPlatform = (searchParams.get('platform') as 'university' | 'school' | 'preschool' | null) || 'university';

  const [step, setStep] = useState<Step>(1);
  const [platformType, setPlatformType] = useState<string>(
    ['university', 'school', 'preschool'].includes(initialPlatform) ? initialPlatform : 'university'
  );
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const roles = useMemo(() => PLATFORM_ROLES[platformType] || [], [platformType]);

  useEffect(() => {
    if (step !== 3 || !googleButtonRef.current) return;
    initializeGoogleButton({
      element: googleButtonRef.current,
      onBeforeAuth: () => {
        persistPendingSignup({
          email, full_name: fullName || 'Campus User', role: role as any,
          platform_type: platformType as any,
          institution_name: institutionName.trim() || undefined,
          invite_code: inviteCode.trim().toLowerCase() || undefined,
        });
        setSubmitting(true); setError('');
      },
      onSuccess: async () => {
        const profile = await refreshProfile();
        setSubmitting(false);
        navigate(getRoleDashboardPath(profile?.role || role));
      },
      onError: (message) => { setSubmitting(false); setError(message); },
    }).catch((err) => setError(err instanceof Error ? err.message : 'Google sign-up failed.'));
  }, [step, email, fullName, institutionName, inviteCode, navigate, platformType, refreshProfile, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    if (!fullName.trim()) { setError('Full name is required.'); setSubmitting(false); return; }
    if (!email.trim()) { setError('Email is required.'); setSubmitting(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setSubmitting(false); return; }
    if (!institutionName.trim() && !inviteCode.trim()) {
      setError('Provide your institution name (new org) or an invite code (join existing).'); setSubmitting(false); return;
    }
    try {
      persistPendingSignup({
        email, full_name: fullName, role: role as any, platform_type: platformType as any,
        institution_name: institutionName.trim() || undefined,
        invite_code: inviteCode.trim().toLowerCase() || undefined,
      });
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { email, full_name: fullName, role, platform_type: platformType, institution_name: institutionName.trim() || undefined, invite_code: inviteCode.trim().toLowerCase() || undefined },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (signUpError) {
        const msg = signUpError.message || '';
        if (/already registered|already been registered|already exists/i.test(msg)) {
          setError('This email is already registered. Please sign in instead.');
          setSubmitting(false);
          setTimeout(() => navigate(`/login?email=${encodeURIComponent(email)}`), 2000);
          return;
        }
        throw signUpError;
      }
      if (!signUpData.user) throw new Error('Could not create account. Please try again.');
      if (!signUpData.session) {
        setError('Account created — check your email to confirm, then sign in.');
        setSubmitting(false); return;
      }
      const profile = await refreshProfile(signUpData.user.id);
      setSubmitting(false);
      navigate(getRoleDashboardPath(profile?.role || role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setSubmitting(false);
    }
  };

  const inputCls = "w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 font-jakarta text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0047AB 0%, #3A6FD0 100%)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10">
          <Link to="/" className="font-lexend font-900 text-2xl text-white">Campus Tribe</Link>
          <p className="text-white/50 text-xs mt-1 font-jakarta">by WevSocial</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-white text-4xl font-lexend font-900 leading-tight">One login.<br />Every platform.</h1>
            <p className="text-white/70 font-jakarta text-lg mt-2">University · School · Preschool</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {PLATFORM_CARDS.map((p) => (
              <div key={p.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <span className="text-2xl">{p.emoji}</span>
                <p className="font-lexend font-700 text-white text-sm mt-2">{p.label}</p>
                <p className="text-white/60 text-xs mt-1 font-jakarta leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((r) => (
              <span key={r} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-jakarta font-700 border border-white/20">{r}</span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center bg-white/10 rounded-2xl py-4">
                <div className="flex items-center justify-center mb-1">
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
      <div className="flex items-center justify-center p-6 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="mb-6">
            <Link to="/" className="font-lexend font-900 text-xl text-blue-700 lg:hidden">Campus Tribe</Link>
            <h1 className="font-lexend font-900 text-3xl text-gray-900 dark:text-white mt-2">Create your account</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-jakarta">Fast setup. No credit card.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {([1, 2, 3] as Step[]).map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step >= s ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-slate-600'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 font-jakarta border-2 transition-all ${
                    step > s ? 'bg-blue-700 border-blue-700 text-white' :
                    step === s ? 'border-blue-700 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400' :
                    'border-gray-300 dark:border-slate-600 text-gray-400'
                  }`}>
                    {step > s ? <Check size={12} /> : s}
                  </div>
                  <span className="text-xs font-jakarta font-700 hidden sm:block">
                    {s === 1 ? 'Platform' : s === 2 ? 'Role' : 'Details'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-blue-700' : 'bg-gray-200 dark:bg-slate-700'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Platform */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300 uppercase tracking-widest text-xs">Select your platform</p>
              <div className="space-y-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPlatformType(p.id);
                      setRole('');
                      setStep(2);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      platformType === p.id
                        ? 'border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <div>
                      <p className="font-jakarta font-700 text-gray-900 dark:text-white">{p.label}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 font-jakarta">{p.desc}</p>
                    </div>
                    {platformType === p.id && <Check size={18} className="ml-auto text-blue-700 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(1)} className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 font-jakarta">← Back</button>
                <p className="font-jakarta text-xs font-700 text-gray-700 dark:text-slate-300 uppercase tracking-widest">Select your role</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setRole(r.id); setStep(3); }}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      role === r.id
                        ? 'border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <span className="text-xl mt-0.5">{r.emoji}</span>
                    <div>
                      <p className="font-jakarta font-700 text-gray-900 dark:text-white text-sm">{r.label}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-jakarta mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Account Details */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(2)} className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 font-jakarta">← Back</button>
                <p className="font-jakarta text-xs font-700 text-gray-700 dark:text-slate-300 uppercase tracking-widest">Account details</p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <span className="text-xl">{PLATFORMS.find(p => p.id === platformType)?.emoji}</span>
                <div>
                  <p className="text-xs font-jakarta text-blue-700 dark:text-blue-400 font-700">{PLATFORMS.find(p => p.id === platformType)?.label}</p>
                  <p className="text-xs font-jakarta text-blue-600/70 dark:text-blue-400/70">{roles.find(r => r.id === role)?.label}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required autoComplete="name" className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" required autoComplete="email" className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required autoComplete="new-password" className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300">Institution Name</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={institutionName} onChange={e => setInstitutionName(e.target.value)} placeholder="Create new org" className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-jakarta text-sm font-700 text-gray-700 dark:text-slate-300">Invite Code <span className="text-gray-400 font-400">(optional)</span></label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Ask your admin for an invite code" className={inputCls} />
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
                  {submitting ? 'Creating account…' : 'Create account →'}
                </button>
              </form>

              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                <span className="text-xs font-jakarta font-700 text-gray-400 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              </div>

              <div className="flex justify-center">
                <div ref={googleButtonRef} className="min-h-[44px]" />
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-slate-400 font-jakarta">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-700 dark:text-blue-400 font-700 hover:underline">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
