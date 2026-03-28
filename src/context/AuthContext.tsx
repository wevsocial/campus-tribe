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

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await refreshProfile(data.session.user.id);
      }

      if (mounted) setLoading(false);
    };

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await refreshProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
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
