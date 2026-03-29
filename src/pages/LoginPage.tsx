import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { getRoleDashboardPath, useAuth } from '../context/AuthContext';
import { initializeGoogleButton } from '../lib/googleIdentity';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, refreshProfile } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(searchParams.get('email') ? 'Account already exists — please sign in here.' : '');
  const [submitting, setSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

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
    setSubmitting(true);

    const result = await signIn(email, password);
    if (!result.success) {
      setSubmitting(false);
      const msg = result.error || 'Sign in failed.';
      if (/email not confirmed/i.test(msg)) {
        setError('Your email is not yet confirmed. Check your inbox for the confirmation link, or sign up again — email confirmation is now instant.');
      } else if (/invalid login credentials/i.test(msg)) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(msg);
      }
      return;
    }

    const profile = await refreshProfile();
    setSubmitting(false);
    navigate(getRoleDashboardPath(profile?.role));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-hero-gradient relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10">
          <Link to="/" className="font-lexend font-900 italic text-2xl text-white">Campus Tribe</Link>
          <p className="text-white/60 text-xs mt-1">by WevSocial</p>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-jakarta font-700 uppercase tracking-widest mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Live Platform
          </div>
          <blockquote className="text-white text-3xl font-lexend font-800 leading-tight mb-6">
            All student life, teaching, clubs, sports, and family communication in one place.
          </blockquote>
          <p className="text-white/70 text-sm font-jakarta">Built for universities, schools, and preschools.</p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Students', val: '12K+' },
              { label: 'Institutions', val: '200+' },
              { label: 'Events/mo', val: '4K+' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="font-lexend font-900 text-2xl text-white">{s.val}</p>
                <p className="text-white/60 text-xs mt-1 font-jakarta">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs relative z-10">© 2026 WevSocial Inc.</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8 bg-surface-lowest dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="font-lexend font-900 italic text-xl text-primary lg:hidden">Campus Tribe</Link>
            <h1 className="font-lexend font-900 text-4xl text-on-surface mt-2 tracking-tight">Welcome back</h1>
            <p className="text-on-surface-variant text-sm mt-2">Sign in to your Campus Tribe account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              icon={<Mail size={16} />}
              required
              autoComplete="email"
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
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-2xl font-jakarta">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={submitting} className="w-full rounded-full">
              Sign in →
            </Button>
          </form>

          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <div className="flex justify-center">
            <div ref={googleButtonRef} className="min-h-[44px]" />
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-jakarta font-700 hover:underline">Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
