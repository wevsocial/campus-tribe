import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type CampusRole = 'student' | 'student_rep' | 'admin' | 'coach' | 'club_leader' | 'staff' | 'it_director' | 'teacher' | 'parent';

export interface CampusProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: CampusRole;
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
  institutionId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<CampusProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PENDING_SIGNUP_KEY = 'campus-tribe.pending-signup';

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
  } catch {
    // ignore storage failures
  }
}

function clearPendingSignup() {
  try {
    localStorage.removeItem(PENDING_SIGNUP_KEY);
  } catch {
    // ignore storage failures
  }
}

export function persistPendingSignup(payload: PendingSignup) {
  writePendingSignup(payload);
}

export function getRoleDashboardPath(role?: string | null) {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'student_rep':
      return '/dashboard/student-rep';
    case 'teacher':
      return '/dashboard/teacher';
    case 'admin':
      return '/dashboard/admin';
    case 'staff':
      return '/dashboard/staff';
    case 'club_leader':
      return '/dashboard/club';
    case 'coach':
      return '/dashboard/coach';
    case 'it_director':
      return '/dashboard/it';
    case 'parent':
      return '/dashboard/parent';
    default:
      return '/dashboard/student';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<CampusProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (userId?: string) => {
    const targetUserId = userId ?? user?.id;
    if (!targetUserId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('ct_users')
      .select('*')
      .eq('id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error);
      setProfile(null);
      return null;
    }

    setProfile((data as CampusProfile | null) ?? null);
    return (data as CampusProfile | null) ?? null;
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
    const signupData = (pending?.email?.toLowerCase() === authUser.email?.toLowerCase()
      ? pending
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
      const { data: institution, error } = await supabase
        .from('ct_institutions')
        .select('id, institution_type')
        .eq('invite_code', signupData.invite_code.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      institutionId = institution?.id ?? null;
      institutionType = (institution?.institution_type || institutionType) as typeof institutionType;
    }

    if (!institutionId && signupData.institution_name) {
      const inviteCode = signupData.institution_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || `campus-${Date.now().toString(36)}`;
      const { data: createdInstitution, error } = await supabase
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
      if (error) throw error;
      institutionId = createdInstitution.id;
      institutionType = (createdInstitution.institution_type || institutionType) as typeof institutionType;
    }

    const { error: profileError } = await supabase.from('ct_users').upsert({
      id: authUser.id,
      email: signupData.email,
      full_name: signupData.full_name,
      role: signupData.role,
      institution_id: institutionId,
      platform_type: institutionType,
      institution_type: institutionType,
      onboarding_complete: false,
    });

    if (profileError) throw profileError;

    if (institutionId) {
      await supabase.from('ct_notifications').insert({
        user_id: authUser.id,
        institution_id: institutionId,
        title: 'Welcome to Campus Tribe',
        body: `Your ${institutionType} workspace is ready. Start by creating your first record.`,
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
        if (mounted) setLoading(false);
        return;
      }

      try {
        await bootstrapProfileIfMissing(nextSession.user);
      } catch (error) {
        console.error('Failed to bootstrap profile', error);
      }

      if (mounted) setLoading(false);
    };

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      await syncAuthState(data.session ?? null);
    };

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setLoading(true);
      await syncAuthState(nextSession ?? null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    profile,
    role: profile?.role ?? null,
    institutionId: profile?.institution_id ?? null,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setProfile(null);
    },
    refreshProfile,
  }), [session, user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
