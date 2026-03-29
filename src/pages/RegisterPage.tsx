import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { getRoleDashboardPath, persistPendingSignup, useAuth } from '../context/AuthContext';
import { initializeGoogleButton } from '../lib/googleIdentity';

const PLATFORM_ROLES: Record<string, string[]> = {
  university: ['student', 'student_rep', 'teacher', 'admin', 'staff', 'club_leader', 'coach', 'it_director', 'parent'],
  school: ['student', 'teacher', 'parent', 'admin', 'staff', 'club_leader', 'coach'],
  preschool: ['parent', 'teacher', 'staff', 'admin'],
};

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  student_rep: 'Student Rep',
  teacher: 'Teacher',
  admin: 'Admin',
  staff: 'Staff',
  club_leader: 'Club Leader',
  coach: 'Coach',
  it_director: 'IT Director',
  parent: 'Parent',
};

const PLATFORM_EMOJI: Record<string, string> = {
  university: '🎓',
  school: '🏫',
  preschool: '🧸',
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const initialPlatform = (searchParams.get('platform') as 'university' | 'school' | 'preschool' | null) || 'university';
  const [platformType, setPlatformType] = useState<'university' | 'school' | 'preschool'>(
    ['university', 'school', 'preschool'].includes(initialPlatform) ? initialPlatform : 'university'
  );
  const [role, setRole] = useState(PLATFORM_ROLES[initialPlatform]?.[0] || 'student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const roles = useMemo(() => PLATFORM_ROLES[platformType], [platformType]);

  useEffect(() => {
    if (!googleButtonRef.current) return;
    initializeGoogleButton({
      element: googleButtonRef.current,
      onBeforeAuth: () => {
        persistPendingSignup({
          email,
          full_name: fullName || 'Campus User',
          role: role as any,
          platform_type: platformType,
          institution_name: institutionName.trim() || undefined,
          invite_code: inviteCode.trim().toLowerCase() || undefined,
        });
        setSubmitting(true);
        setError('');
      },
      onSuccess: async () => {
        const profile = await refreshProfile();
        setSubmitting(false);
        navigate(getRoleDashboardPath(profile?.role || role));
      },
      onError: (message) => {
        setSubmitting(false);
        setError(message);
      },
    }).catch((err) => setError(err instanceof Error ? err.message : 'Google sign-up failed.'));
  }, [email, fullName, institutionName, inviteCode, navigate, platformType, refreshProfile, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!fullName.trim()) { setError('Full name is required.'); setSubmitting(false); return; }
    if (!email.trim()) { setError('Email is required.'); setSubmitting(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setSubmitting(false); return; }
    if (!institutionName.trim() && !inviteCode.trim()) {
      setError('Provide your institution name (new org) or an invite code (join existing).'); setSubmitting(false); return;
    }

    try {
      persistPendingSignup({
        email,
        full_name: fullName,
        role: role as any,
        platform_type: platformType,
        institution_name: institutionName.trim() || undefined,
        invite_code: inviteCode.trim().toLowerCase() || undefined,
      });

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email,
            full_name: fullName,
            role,
            platform_type: platformType,
            institution_name: institutionName.trim() || undefined,
            invite_code: inviteCode.trim().toLowerCase() || undefined,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Could not create account. Please try again.');

      if (!signUpData.session) {
        // Email confirmation still required (shouldn't happen with autoconfirm on, but handle gracefully)
        setError('Account created — check your email to confirm, then sign in.');
        setSubmitting(false);
        return;
      }

      const profile = await refreshProfile(signUpData.user.id);
      setSubmitting(false);
      navigate(getRoleDashboardPath(profile?.role || role));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="font-lexend font-900 italic text-2xl text-primary">Campus Tribe</Link>
          <h1 className="mt-4 font-lexend font-900 text-4xl text-on-surface tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Fast setup. No credit card. Start in under a minute.</p>
        </div>

        <div className="bg-surface-lowest dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 space-y-6">
          {/* Platform selector */}
          <div>
            <p className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest mb-3">Platform type</p>
            <div className="grid grid-cols-3 gap-3">
              {(['university', 'school', 'preschool'] as const).map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => {
                    setPlatformType(platform);
                    setRole(PLATFORM_ROLES[platform][0]);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-[1.2rem] border-2 transition-all font-jakarta font-700 text-sm capitalize ${
                    platformType === platform
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary dark:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">{PLATFORM_EMOJI[platform]}</span>
                  <span>{platform}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Role selector */}
          <div>
            <p className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest mb-3">Your role</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => setRole(roleOption)}
                  className={`rounded-full px-4 py-2 text-sm font-jakarta font-700 border-2 transition-all ${
                    role === roleOption
                      ? 'bg-secondary border-secondary text-white shadow-md shadow-secondary/20'
                      : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-secondary/50 dark:bg-slate-800'
                  }`}
                >
                  {ROLE_LABELS[roleOption] || roleOption}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@university.edu" />
            </div>

            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Min. 6 characters" />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Institution name"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Create new org"
              />
              <Input
                label="Invite / access code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Join existing org"
              />
            </div>

            <p className="text-xs text-on-surface-variant">Fill institution name to create a new org, or enter an invite code to join an existing one.</p>

            {error && (
              <div className="rounded-[1rem] bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-jakarta">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={submitting} className="w-full rounded-full" size="lg">
              Create account →
            </Button>
          </form>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <div className="flex justify-center">
            <div ref={googleButtonRef} className="min-h-[44px]" />
          </div>

          <p className="text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="font-jakarta font-700 text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
