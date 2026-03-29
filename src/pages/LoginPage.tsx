import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { getRoleDashboardPath, useAuth } from '../context/AuthContext';
import { initializeGoogleButton } from '../lib/googleIdentity';
import { supabase } from '../lib/supabase';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const demoHint = useMemo(() => 'Use your Campus Tribe credentials', []);

  useEffect(() => {
    if (!googleButtonRef.current) return;
    initializeGoogleButton({
      element: googleButtonRef.current,
      onBeforeAuth: () => {
        setSubmitting(true);
        setError('');
      },
      onSuccess: async () => {
        const profile = await refreshProfile();
        setSubmitting(false);
        navigate(getRoleDashboardPath(profile?.role));
      },
      onError: (message) => {
        setSubmitting(false);
        setError(message);
      },
    }).catch((err) => setError(err instanceof Error ? err.message : 'Google sign-in failed.'));
  }, [navigate, refreshProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const result = await signIn(email, password);
    if (!result.success) {
      setSubmitting(false);
      const msg = result.error || 'Login failed.';
      if (/email not confirmed/i.test(msg)) {
        setError('Email not confirmed. Please confirm from inbox, or tap Resend confirmation email below.');
      } else {
        setError(msg);
      }
      return;
    }

    const profile = await refreshProfile();
    setSubmitting(false);
    navigate(getRoleDashboardPath(profile?.role));
  };

  const resendConfirmation = async () => {
    if (!email) {
      setError('Enter your email first, then tap resend.');
      return;
    }
    setResending(true);
    setError('');
    setSuccess('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (resendError) throw resendError;
      setSuccess(`Confirmation email re-sent to ${email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-hero-gradient">
        <div>
          <Link to="/" className="font-lexend font-900 italic text-2xl text-white">Campus Tribe</Link>
          <p className="text-white/60 text-xs mt-1">by WevSocial</p>
        </div>
        <div>
          <blockquote className="text-white text-2xl font-lexend font-800 leading-relaxed mb-6">
            All student life, teaching, clubs, sports, and family communication in one platform.
          </blockquote>
          <p className="text-white/80 text-sm font-jakarta">Built for modern institutions that want a real campus operating system.</p>
        </div>
        <p className="text-white/40 text-xs">© 2026 WevSocial Inc.</p>
      </div>

      <div className="flex items-center justify-center p-8 bg-surface-lowest">
        <div className="w-full max-w-md rounded-[1.5rem] bg-surface-lowest p-2">
          <div className="mb-2">
            <Link to="/" className="font-lexend font-900 italic text-xl text-primary lg:hidden">Campus Tribe</Link>
          </div>
          <h1 className="font-lexend font-900 text-3xl text-on-surface mb-1">Welcome back</h1>
          <p className="text-on-surface-variant text-sm mb-8">Sign in to your Campus Tribe account.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-on-surface-variant">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              iconPosition="right"
              required
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl font-jakarta">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-2xl font-jakarta">
                {success}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={submitting} className="w-full rounded-full">
              Sign In
            </Button>

            <Button type="button" variant="outline" size="md" isLoading={resending} onClick={resendConfirmation} className="w-full rounded-full">
              Resend confirmation email
            </Button>
          </form>

          <div className="mt-4 flex justify-center">
            <div ref={googleButtonRef} className="min-h-[44px]" />
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-jakarta font-700 hover:underline">Register</Link>
          </p>

          <p className="text-center text-xs text-on-surface-variant mt-4 opacity-60">
            {demoHint}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
