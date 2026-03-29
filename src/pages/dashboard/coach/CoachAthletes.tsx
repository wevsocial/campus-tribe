import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Athlete { id: string; user_id: string; is_free_agent: boolean; league_id: string; user?: { full_name: string; email: string } | null; }

export default function CoachAthletes() {
  const { institutionId } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_sport_participants')
      .select('*, user:ct_users(full_name,email)')
      .eq('institution_id', institutionId)
      .then(({ data }) => { setAthletes((data as Athlete[]) ?? []); setLoading(false); });
  }, [institutionId]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Athletes</h1>
        <span className="font-jakarta text-sm text-on-surface-variant">{athletes.length} registered</span>
      </div>
      {athletes.length === 0 ? <EmptyState icon="🏃" message="No athletes registered yet." /> : (
        <div className="space-y-2">
          {athletes.map(a => (
            <Card key={a.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="font-jakarta font-bold text-secondary text-xs">
                    {(a.user?.full_name || a.user?.email || '?').slice(0,2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-jakarta font-bold text-on-surface text-sm truncate">{a.user?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-on-surface-variant truncate">{a.user?.email}</p>
                </div>
              </div>
              {a.is_free_agent && <Badge label="Free Agent" variant="warning" />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
