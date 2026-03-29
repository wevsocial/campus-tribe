import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Game {
  id: string;
  scheduled_at: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_team?: { name: string } | null;
  away_team?: { name: string } | null;
}

export default function CoachSchedule() {
  const { institutionId } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_sports_games')
      .select('*, home_team:ct_sports_teams!home_team_id(name), away_team:ct_sports_teams!away_team_id(name)')
      .eq('institution_id', institutionId)
      .order('scheduled_at', { ascending: false })
      .then(({ data }) => { setGames((data as Game[]) ?? []); setLoading(false); });
  }, [institutionId]);

  const submitScore = async (gameId: string) => {
    const s = scores[gameId];
    if (!s) return;
    await supabase.from('ct_sports_games').update({ home_score: +s.home, away_score: +s.away, status: 'completed' }).eq('id', gameId);
    setGames(games.map(g => g.id === gameId ? { ...g, home_score: +s.home, away_score: +s.away, status: 'completed' } : g));
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Schedule & Scores</h1>
      {games.length === 0 ? <EmptyState icon="📅" message="No games scheduled." /> : (
        <div className="space-y-4">
          {games.map(g => (
            <Card key={g.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-jakarta text-sm text-on-surface-variant">
                  {g.scheduled_at ? new Date(g.scheduled_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                </p>
                <Badge label={g.status} variant={g.status === 'completed' ? 'success' : g.status === 'live' ? 'warning' : 'neutral'} />
              </div>
              <div className="flex items-center justify-center gap-4 py-3">
                <div className="text-center flex-1">
                  <p className="font-jakarta font-bold text-on-surface">{g.home_team?.name || 'Home'}</p>
                  <p className="font-lexend font-bold text-3xl text-primary mt-1">{g.home_score ?? '—'}</p>
                </div>
                <span className="font-jakarta text-on-surface-variant font-bold text-lg">vs</span>
                <div className="text-center flex-1">
                  <p className="font-jakarta font-bold text-on-surface">{g.away_team?.name || 'Away'}</p>
                  <p className="font-lexend font-bold text-3xl text-primary mt-1">{g.away_score ?? '—'}</p>
                </div>
              </div>
              {g.status !== 'completed' && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/20">
                  <input type="number" placeholder="Home" value={scores[g.id]?.home || ''} onChange={e => setScores({ ...scores, [g.id]: { ...scores[g.id], home: e.target.value } })}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none" min={0} />
                  <input type="number" placeholder="Away" value={scores[g.id]?.away || ''} onChange={e => setScores({ ...scores, [g.id]: { ...scores[g.id], away: e.target.value } })}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none" min={0} />
                  <Button size="sm" onClick={() => submitScore(g.id)} className="rounded-full">Save Score</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
