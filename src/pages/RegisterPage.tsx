import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { getRoleDashboardPath, useAuth } from '../context/AuthContext';

const PLATFORM_ROLES: Record<string, string[]> = {
  university: ['student', 'student_rep', 'teacher', 'admin', 'staff', 'club_leader', 'coach', 'it_director', 'parent'],
  school: ['student', 'teacher', 'parent', 'admin', 'staff', 'club_leader', 'coach'],
  preschool: ['parent', 'teacher', 'staff', 'admin'],
};

function makeInviteCode(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || `campus-${Date.now().toString(36)}`;
}

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
  const [error, setError] = useState('');

  const roles = useMemo(() => PLATFORM_ROLES[platformType], [platformType]);

  const ensureInstitution = async () => {
    if (inviteCode.trim()) {
      const { data, error } = await supabase
        .from('ct_institutions')
        .select('id, name, institution_type')
        .eq('invite_code', inviteCode.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Invalid invite/access code.');
      return data;
    }

    if (!institutionName.trim()) throw new Error('Institution name is required when creating a new organization.');

    const code = makeInviteCode(institutionName);
    const { data, error } = await supabase
      .from('ct_institutions')
      .insert({
        name: institutionName.trim(),
        institution_type: platformType,
        city: null,
        country: 'Canada',
        color_primary: '#0047AB',
        invite_code: code,
      })
      .select('id, name, institution_type')
      .single();

    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, platform_type: platformType },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Could not create auth user.');
      if (!signUpData.session) throw new Error('Signup completed but no active session was created. Check Supabase email confirmation settings.');

      const institution = await ensureInstitution();

      const { error: profileError } = await supabase.from('ct_users').insert({
        id: signUpData.user.id,
        email,
        full_name: fullName,
        role,
        institution_id: institution.id,
        platform_type: institution.institution_type,
        institution_type: institution.institution_type,
        onboarding_complete: false,
      });
      if (profileError) throw profileError;

      await supabase.from('ct_notifications').insert({
        user_id: signUpData.user.id,
        institution_id: institution.id,
        title: 'Welcome to Campus Tribe',
        body: `Your ${institution.institution_type} workspace is ready. Start by creating your first record.`,
        type: 'system',
      });

      await refreshProfile(signUpData.user.id);
      navigate(getRoleDashboardPath(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) {
      setSubmitting(false);
      setError(error.message);
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

          <Button type="submit" isLoading={submitting} className="w-full rounded-full" size="lg">
            Create account
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full rounded-full" onClick={handleGoogleSignIn}>
            Continue with Google
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account? <Link to="/login" className="font-jakarta font-700 text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
