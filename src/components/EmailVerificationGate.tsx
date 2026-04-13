import React, { useEffect, useState } from 'react';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PAID_ROLES = ['coach', 'teacher', 'admin', 'it_director', 'it_admin', 'staff'];

interface Props {
  children: React.ReactNode;
}

export default function EmailVerificationGate({ children }: Props) {
  const { profile } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const confirmed = data.user?.email_confirmed_at;
      setVerified(!!confirmed);
    });
  }, []);

  const role = profile?.role ?? '';
  const isPaidRole = PAID_ROLES.includes(role);

  if (verified === null) return null; // loading
  if (verified || !isPaidRole) return <>{children}</>;

  const handleResend = async () => {
    setSending(true);
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (email) {
      await supabase.auth.resend({ type: 'signup', email });
      setResent(true);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">
          We sent a verification link to <strong>{profile?.email}</strong>.<br />
          Please verify your email before accessing your dashboard.
        </p>
        {resent ? (
          <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-sm">
            <CheckCircle size={16} /> Email resent! Check your inbox.
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={sending ? 'animate-spin' : ''} />
            {sending ? 'Sending...' : 'Resend verification email'}
          </button>
        )}
        <p className="text-xs text-gray-400 mt-4">
          After verifying, refresh this page to continue.
        </p>
      </div>
    </div>
  );
}
