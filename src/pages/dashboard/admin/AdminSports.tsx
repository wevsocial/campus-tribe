import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/ui/StatCard';
import { LoadingSkeleton, StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface League {
  id: string;
  name: string;
  sport: string | null;
  season: string | null;
  status: string;
  format: string | null;
}

interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  points: number;
  league_id: string;
}

export default function AdminSports() {
  const { institutionId } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameCount, setGameCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sports_teams').select('*').eq('institution_id', institutionId).order('points', { ascending: false }),
      supabase.from('ct_sports_games').select('id', { count: 'exact' }).eq('institution_id', institutionId),
    ]).then(([l, t, g]) => {
      setLeagues(l.data ?? []);
      setTeams(t.data ?? []);
      setGameCount(g.count ?? 0);
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton /></div>;

  const leagueTeams = selectedLeague ? teams.filter(t => t.league_id === selectedLeague) : teams;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Sports</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={leagues.length} label="Leagues" icon="emoji_events" color="primary" />
        <StatCard value={teams.length} label="Teams" icon="groups" color="secondary" />
        <StatCard value={gameCount} label="Games" icon="sports" color="tertiary" />
      </div>

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Leagues</h2>
        {leagues.length === 0 ? <EmptyState icon="🏆" message="No leagues yet." /> : (
          <div className="space-y-3">
            {leagues.map(l => (
              <Card key={l.id}
                className={`cursor-pointer transition-all ${selectedLeague === l.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedLeague(selectedLeague === l.id ? null : l.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-jakarta font-bold text-on-surface">{l.name}</p>
                    <p className="text-sm text-on-surface-variant">{l.sport} · {l.season} · {l.format}</p>
                  </div>
                  <Badge label={l.status} variant={l.status === 'active' ? 'success' : 'neutral'} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">
          Standings {selectedLeague ? `(filtered)` : '(all teams)'}
        </h2>
        {leagueTeams.length === 0 ? <EmptyState icon="👥" message="No teams yet." /> : (
          <Card padding="none">
            <table className="w-full">
              <thead className="bg-surface-low">
                <tr>
                  {['Team', 'W', 'L', 'Pts'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {leagueTeams.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-surface-lowest' : 'bg-surface-low'}>
                    <td className="px-4 py-3 font-jakarta font-bold text-on-surface">{t.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{t.wins}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{t.losses}</td>
                    <td className="px-4 py-3 font-jakarta font-bold text-primary">{t.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
