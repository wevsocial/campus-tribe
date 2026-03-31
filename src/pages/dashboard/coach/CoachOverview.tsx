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

  const [rankings, setRankings] = React.useState<Array<{user_id: string; sport: string; wins: number; losses: number; points: number}>>([]);

  React.useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_sport_rankings').select('user_id,sport,wins,losses,points').eq('institution_id', institutionId).order('points', { ascending: false }).limit(10).then(({ data }) => setRankings(data || []));
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
          { label: 'Schedule and Scores', href: '/dashboard/coach/schedule', Icon: Calendar },
          { label: 'Athletes', href: '/dashboard/coach/athletes', Icon: Dumbbell },
        ].map(l => (
          <a key={l.href} href={l.href} className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-primary-container transition-colors group">
            <l.Icon size={18} className="text-primary flex-shrink-0" />
            <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{l.label}</span>
          </a>
        ))}
      </div>
      {rankings.length > 0 && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <h2 className="font-lexend font-700 text-lg text-on-surface mb-3 flex items-center gap-2"><Trophy size={16} className="text-secondary" /> Campus Sport Rankings</h2>
          <div className="space-y-2">
            {rankings.map((r, i) => (
              <div key={r.user_id + r.sport} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary-container text-secondary text-xs font-lexend font-700 flex items-center justify-center">#{i+1}</span>
                  <span className="text-sm font-jakarta text-on-surface">{r.sport}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-jakarta text-on-surface-variant">
                  <span>{r.wins}W - {r.losses}L</span>
                  <span className="font-lexend font-700 text-secondary">{r.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
