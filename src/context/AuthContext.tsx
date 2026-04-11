import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type CampusRole = 'student' | 'student_rep' | 'admin' | 'coach' | 'club_leader' | 'staff' | 'it_director' | 'teacher' | 'parent' | 'athlete';

export interface CampusProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: CampusRole;
  roles: CampusRole[] | null;
  institution_id: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  interests?: string[] | null;
  department?: string | null;
  student_number?: string | null;
  institution_type?: string | null;
  platform_type?: string | null;
  major?: string | null;
  year_of_study?: number | null;
  onboarding_complete?: boolean | null;
  payment_status?: 'not_required' | 'pending' | 'paid' | 'overdue' | null;
  email_verified?: boolean | null;
}

export interface InstitutionInfo {
  id: string;
  name: string;
  short_name?: string | null;
  institution_type?: string | null;
  logo_url?: string | null;
  color_primary?: string | null;
  subscription_status?: string | null;
}

type PendingSignup = {
  email: string;
  full_name: string;
  role: CampusRole;
  platform_type: 'university' | 'school' | 'preschool';
  institution_name?: string;
  invite_code?: string;
};

interface AuthContextValue {
  session: Session | null;
  user: SupabaseUser | null;
  profile: CampusProfile | null;
  role: CampusRole | null;
  roles: CampusRole[];
  institutionId: string | null;
  institution: InstitutionInfo | null;
  loading: boolean;
  isEmailVerified: boolean;
  isSuperAdmin: boolean;
  needsPayment: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<CampusProfile | null>;
  refreshInstitution: (instId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PENDING_SIGNUP_KEY = 'campus-tribe.pending-signup';

// Roles that require payment to use the platform
const PAID_ROLES: CampusRole[] = ['admin', 'it_director', 'teacher', 'coach', 'staff'];

function readPendingSignup(): PendingSignup | null {
  try {
    const raw = localStorage.getItem(PENDING_SIGNUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePendingSignup(payload: PendingSignup) {
  try {
    localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(payload));
  } catch {}
}

function clearPendingSignup() {
  try {
    localStorage.removeItem(PENDING_SIGNUP_KEY);
  } catch {}
}

export function persistPendingSignup(payload: PendingSignup) {
  writePendingSignup(payload);
}

export function getRoleDashboardPath(role?: string | null) {
  switch (role) {
    case 'student':      return '/dashboard/student';
    case 'student_rep':  return '/dashboard/student';
    case 'teacher':      return '/dashboard/teacher';
    case 'admin':        return '/dashboard/admin';
    case 'staff':        return '/dashboard/staff';
    case 'club_leader':  return '/dashboard/student';
    case 'coach':        return '/dashboard/coach';
    case 'it_director':  return '/dashboard/admin';
    case 'parent':       return '/dashboard/parent';
    case 'athlete':      return '/dashboard/athlete';
    default:             return '/dashboard/student';
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); })
           .catch((e) => { clearTimeout(t); reject(e); });
  });
}

// Super admin email list (client-side fast check — DB is authoritative)
const SUPERADMIN_EMAILS = [
  'mrxxxbond@gmail.com',
  'mrxxxbong@gmail.com',
  'siinamits@gmail.com',
  'sdescha21@gmail.com',
  'wevsocial.s@gmail.com',
  'amitt.k.sin@gmail.com',
  'javbollad@gmail.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<CampusProfile | null>(null);
  const [institution, setInstitution] = useState<InstitutionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshInstitution = async (instId?: string) => {
    const targetId = instId ?? profile?.institution_id;
    if (!targetId) { setInstitution(null); return; }
    const { data } = await supabase
      .from('ct_institutions')
      .select('id, name, short_name, institution_type, logo_url, color_primary, subscription_status')
      .eq('id', targetId)
      .maybeSingle();
    setInstitution(data as InstitutionInfo | null);
  };

  const refreshProfile = async (userId?: string) => {
    const targetUserId = userId ?? user?.id;
    if (!targetUserId) { setProfile(null); return null; }

    const { data, error } = await supabase
      .from('ct_users')
      .select('*')
      .eq('id', targetUserId)
      .maybeSingle();

    if (error) { console.error('Failed to load profile', error); setProfile(null); return null; }
    const next = (data as CampusProfile | null) ?? null;
    setProfile(next);
    if (next?.institution_id) await refreshInstitution(next.institution_id);
    return next;
  };

  const bootstrapProfileIfMissing = async (authUser: SupabaseUser) => {
    const existing = await refreshProfile(authUser.id);
    if (existing) {
      const pending = readPendingSignup();
      if (pending?.email?.toLowerCase() === authUser.email?.toLowerCase()) clearPendingSignup();
      return existing;
    }

    const metadata = authUser.user_metadata || {};
    const pending = readPendingSignup();
    const canUsePending = !!pending && (
      !pending.email || pending.email.toLowerCase() === authUser.email?.toLowerCase()
    );

    const signupData = (canUsePending
      ? { ...pending, email: authUser.email || pending?.email || '' }
      : {
          email: authUser.email || '',
          full_name: metadata.full_name || metadata.name || authUser.email || 'Campus User',
          role: (metadata.role || 'student') as CampusRole,
          platform_type: (metadata.platform_type || 'university') as 'university' | 'school' | 'preschool',
          institution_name: metadata.institution_name,
          invite_code: metadata.invite_code,
        }) as PendingSignup;

    if (!signupData.email) return null;

    let institutionId: string | null = null;
    let institutionType = signupData.platform_type;

    if (signupData.invite_code) {
      const { data: institution } = await supabase
        .from('ct_institutions')
        .select('id, institution_type')
        .eq('invite_code', signupData.invite_code.toLowerCase())
        .maybeSingle();
      institutionId = institution?.id ?? null;
      institutionType = (institution?.institution_type || institutionType) as typeof institutionType;
    }

    if (!institutionId && signupData.institution_name) {
      const inviteCode = signupData.institution_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 24) || `campus-${Date.now().toString(36)}`;

      const { data: createdInstitution } = await supabase
        .from('ct_institutions')
        .insert({
          name: signupData.institution_name,
          institution_type: institutionType,
          city: null,
          country: 'Canada',
          color_primary: '#0047AB',
          invite_code: inviteCode,
        })
        .select('id, institution_type')
        .single();

      institutionId = createdInstitution?.id ?? null;
      institutionType = (createdInstitution?.institution_type || institutionType) as typeof institutionType;
    }

    if (!institutionId) {
      const { data: firstInst } = await supabase
        .from('ct_institutions')
        .select('id, institution_type')
        .limit(1)
        .maybeSingle();
      if (firstInst?.id) {
        institutionId = firstInst.id;
        institutionType = (firstInst.institution_type || institutionType) as typeof institutionType;
      }
    }

    const role = signupData.role;
    // Determine payment status based on role
    const paymentStatus = PAID_ROLES.includes(role) ? 'pending' : 'not_required';

    const { error: profileError } = await supabase.from('ct_users').upsert({
      id: authUser.id,
      email: signupData.email,
      full_name: signupData.full_name,
      role,
      roles: [role],
      institution_id: institutionId,
      platform_type: institutionType,
      institution_type: institutionType,
      onboarding_complete: false,
      is_active: true,
      payment_status: paymentStatus,
      email_verified: false,
    });

    if (profileError) throw profileError;

    // Seed trial subscription for new institution if not exists
    if (institutionId) {
      await supabase.from('ct_institution_subscriptions').upsert({
        institution_id: institutionId,
        status: 'trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'institution_id' });

      await supabase.from('ct_notifications').insert({
        user_id: authUser.id,
        institution_id: institutionId,
        title: 'Welcome to Campus Tribe',
        body: `Your workspace is ready. ${PAID_ROLES.includes(role) ? 'Please complete payment to unlock all features.' : 'Start exploring your campus!'}`,
        type: 'system',
        created_by: authUser.id,
      });
    }

    clearPendingSignup();
    return await refreshProfile(authUser.id);
  };

  useEffect(() => {
    let mounted = true;

    const syncAuthState = async (nextSession: Session | null) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setInstitution(null);
        if (mounted) setLoading(false);
        return;
      }

      try {
        await withTimeout(bootstrapProfileIfMissing(nextSession.user), 8000);
      } catch (error) {
        console.error('Failed to bootstrap profile', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        await syncAuthState(data.session ?? null);
      } catch (error) {
        console.error('Session bootstrap error', error);
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      void syncAuthState(nextSession ?? null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isSuperAdmin = useMemo(() => {
    if (!user?.email) return false;
    return SUPERADMIN_EMAILS.includes(user.email.toLowerCase());
  }, [user?.email]);

  const needsPayment = useMemo(() => {
    if (!profile) return false;
    if (isSuperAdmin) return false;
    const role = profile.role;
    if (!PAID_ROLES.includes(role)) return false;
    return profile.payment_status === 'pending' || profile.payment_status === 'overdue';
  }, [profile, isSuperAdmin]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session, user, profile, institution,
      role: profile?.role ?? null,
      roles: profile?.roles?.length ? profile.roles : (profile?.role ? [profile.role] : []),
      institutionId: profile?.institution_id ?? null,
      loading,
      isEmailVerified: user?.email_confirmed_at != null || profile?.email_verified === true,
      isSuperAdmin,
      needsPayment,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        return { success: true };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setInstitution(null);
      },
      refreshProfile,
      refreshInstitution,
    }),
    [session, user, profile, institution, loading, isSuperAdmin, needsPayment]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
