import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import { Trophy, Users, Calendar, Dumbbell } from 'lucide-react';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';

export default function CoachOverview() {
  const { institutionId } = useAuth();
  const [stats, setStats] = useState({ leagues: 0, teams: 0, games: 0, athletes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_sports_leagues').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_sports_teams').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_sports_games').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_sport_participants').select('id', { count: 'exact' }).eq('institution_id', institutionId),
    ]).then(([l, t, g, a]) => {
      setStats({ leagues: l.count ?? 0, teams: t.count ?? 0, games: g.count ?? 0, athletes: a.count ?? 0 });
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><h1 className="font-lexend text-2xl font-extrabold text-on-surface">Coach Overview</h1><StatSkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Coach Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats.leagues} label="Leagues" color="primary" />
        <StatCard value={stats.teams} label="Teams" color="secondary" />
        <StatCard value={stats.games} label="Games" color="tertiary" />
        <StatCard value={stats.athletes} label="Athletes" color="neutral" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Manage Leagues', href: '/dashboard/coach/leagues', Icon: Trophy },
          { label: 'Manage Teams', href: '/dashboard/coach/teams', Icon: Users },
          { label: 'Schedule & Scores', href: '/dashboard/coach/schedule', Icon: Calendar },
          { label: 'Athletes', href: '/dashboard/coach/athletes', Icon: Dumbbell },
        ].map(l => (
          <a key={l.href} href={l.href} className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-primary-container transition-colors group">
            <l.Icon size={18} className="text-primary flex-shrink-0" />
            <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
