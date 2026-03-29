import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useDashboardData<T>(
  loader: (args: { userId: string; institutionId: string | null }) => Promise<T>,
  initialValue: T,
  options?: { requireInstitution?: boolean }
) {
  const { user, institutionId, loading: authLoading } = useAuth();
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (options?.requireInstitution && !institutionId) {
      setLoading(false);
      return;
    }

    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const next = await loader({ userId: user.id, institutionId });
        if (active) setData(next);
      } catch (err) {
        console.error('Dashboard data load error', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [authLoading, user?.id, institutionId]);

  return { data, loading, setData };
}

export async function safeSelect<T = unknown>(
  table: string,
  query: (builder: ReturnType<typeof supabase.from>) => PromiseLike<{ data: T[] | null } | { data: T | null }> | any,
  fallback: T
) {
  try {
    const result = await query(supabase.from(table));
    return (result.data ?? fallback) as T;
  } catch (error) {
    console.error(`Failed loading ${table}`, error);
    return fallback;
  }
}
