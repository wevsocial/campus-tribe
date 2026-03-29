import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [platformType, setPlatformType] = useState<'university' | 'school' | 'preschool'>('university');
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState('');
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
        setSuccess('');
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
    setSuccess('');
    setPendingConfirmEmail('');

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
      if (!signUpData.user) throw new Error('Could not create auth user.');

      if (!signUpData.session) {
        setPendingConfirmEmail(email);
        setSuccess('Account created. We sent a confirmation email. Open it, click confirm, then sign in. If nothing arrives, use Resend confirmation below.');
        setSubmitting(false);
        return;
      }

      const profile = await refreshProfile(signUpData.user.id);
      setSubmitting(false);
      navigate(getRoleDashboardPath(profile?.role || role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setSubmitting(false);
    }
  };

  const resendConfirmation = async () => {
    if (!pendingConfirmEmail) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: pendingConfirmEmail,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (resendError) throw resendError;
      setSuccess(`Confirmation email re-sent to ${pendingConfirmEmail}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 dark:bg-slate-950">
      <div className="w-full max-w-2xl rounded-[1.5rem] bg-surface-lowest p-8 shadow-rise dark:bg-slate-900">
        <Link to="/" className="font-lexend font-900 italic text-2xl text-primary">Campus Tribe</Link>
        <h1 className="mt-6 font-lexend font-900 text-3xl text-on-surface">Create your account</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Fast signup. Create a new organization or join an existing one with an access code.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <p className="mb-2 text-sm font-jakarta font-700 text-on-surface">Platform</p>
            <div className="flex flex-wrap gap-2">
              {(['university', 'school', 'preschool'] as const).map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => {
                    setPlatformType(platform);
                    setRole(PLATFORM_ROLES[platform][0]);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-jakarta font-700 capitalize ${platformType === platform ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant dark:bg-slate-800'}`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-jakarta font-700 text-on-surface">Role</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => setRole(roleOption)}
                  className={`rounded-full px-4 py-2 text-sm font-jakarta font-700 ${role === roleOption ? 'bg-secondary text-white' : 'bg-surface text-on-surface-variant dark:bg-slate-800'}`}
                >
                  {roleOption.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Institution name"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="Fill this if creating a new org"
            />
            <Input
              label="Invite / access code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Fill this if joining an existing org"
            />
          </div>

          {error && <div className="rounded-[1rem] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {success && <div className="rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          <Button type="submit" isLoading={submitting} className="w-full rounded-full" size="lg">
            Create account
          </Button>

          {pendingConfirmEmail && (
            <Button type="button" variant="outline" isLoading={resending} onClick={resendConfirmation} className="w-full rounded-full" size="lg">
              Resend confirmation email
            </Button>
          )}
        </form>

        <div className="mt-4 flex justify-center">
          <div ref={googleButtonRef} className="min-h-[44px]" />
        </div>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account? <Link to="/login" className="font-jakarta font-700 text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
