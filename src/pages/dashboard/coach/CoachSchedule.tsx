import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Star } from 'lucide-react';

interface Game {
  id: string; home_team_id: string; away_team_id: string; home_score: number | null;
  away_score: number | null; scheduled_at: string; status: string;
  home_sportsmanship: number | null; away_sportsmanship: number | null;
  home_team?: { id: string; name: string; wins: number; losses: number; draws: number; points: number } | null;
  away_team?: { id: string; name: string; wins: number; losses: number; draws: number; points: number } | null;
}

export default function CoachSchedule() {
  const { institutionId } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [sportsmanship, setSportsmanship] = useState<Record<string, { home: number; away: number }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [ratingGame, setRatingGame] = useState<string | null>(null);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase
      .from('ct_sports_games')
      .select('*, home_team:ct_sports_teams!home_team_id(id, name, wins, losses, draws, points), away_team:ct_sports_teams!away_team_id(id, name, wins, losses, draws, points)')
      .eq('institution_id', institutionId)
      .order('scheduled_at', { ascending: true });
    setGames((data as Game[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [institutionId]);

  const submitScore = async (game: Game) => {
    const s = scores[game.id];
    if (!s) return;
    const homeScore = parseInt(s.home || '0');
    const awayScore = parseInt(s.away || '0');
    setSubmitting(game.id);

    await supabase.from('ct_sports_games').update({
      home_score: homeScore, away_score: awayScore, status: 'completed',
    }).eq('id', game.id);

    // Recalculate team records
    if (game.home_team && game.away_team) {
      if (homeScore > awayScore) {
        await supabase.from('ct_sports_teams').update({ wins: (game.home_team.wins || 0) + 1, points: (game.home_team.points || 0) + 3 }).eq('id', game.home_team_id);
        await supabase.from('ct_sports_teams').update({ losses: (game.away_team.losses || 0) + 1 }).eq('id', game.away_team_id);
      } else if (awayScore > homeScore) {
        await supabase.from('ct_sports_teams').update({ losses: (game.home_team.losses || 0) + 1 }).eq('id', game.home_team_id);
        await supabase.from('ct_sports_teams').update({ wins: (game.away_team.wins || 0) + 1, points: (game.away_team.points || 0) + 3 }).eq('id', game.away_team_id);
      } else {
        await supabase.from('ct_sports_teams').update({ draws: (game.home_team.draws || 0) + 1, points: (game.home_team.points || 0) + 1 }).eq('id', game.home_team_id);
        await supabase.from('ct_sports_teams').update({ draws: (game.away_team.draws || 0) + 1, points: (game.away_team.points || 0) + 1 }).eq('id', game.away_team_id);
      }
    }

    setSubmitting(null);
    setRatingGame(game.id);
    load();
  };

  const submitSportsmanship = async (gameId: string) => {
    const rating = sportsmanship[gameId];
    if (!rating) return;
    await supabase.from('ct_sports_games').update({
      home_sportsmanship: rating.home,
      away_sportsmanship: rating.away,
    }).eq('id', gameId);
    setRatingGame(null);
    load();
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onChange(s)}>
          <Star size={18} className={s <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  );

  const statusVariant = (s: string): 'success' | 'warning' | 'neutral' =>
    s === 'completed' ? 'success' : s === 'scheduled' ? 'warning' : 'neutral';

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Schedule & Scores</h1>
      {games.length === 0 ? <EmptyState message="No games scheduled yet." /> : (
        <div className="space-y-4">
          {games.map(game => (
            <Card key={game.id}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-jakarta font-bold text-on-surface text-sm">
                    {game.home_team?.name || 'Home'} vs {game.away_team?.name || 'Away'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {game.scheduled_at ? new Date(game.scheduled_at).toLocaleString() : 'TBD'}
                  </p>
                  {game.status === 'completed' && game.home_score !== null && (
                    <p className="font-lexend font-black text-lg text-primary mt-1">
                      {game.home_score} — {game.away_score}
                    </p>
                  )}
                </div>
                <Badge label={game.status} variant={statusVariant(game.status)} />
              </div>

              {game.status !== 'completed' && (
                <div className="flex items-center gap-3 mt-2">
                  <div>
                    <label className="block text-xs text-on-surface-variant mb-1">{game.home_team?.name || 'Home'}</label>
                    <input type="number" min={0} className="w-16 border border-outline-variant rounded-lg px-2 py-1 text-sm text-on-surface bg-surface-lowest"
                      value={scores[game.id]?.home ?? ''}
                      onChange={e => setScores(s => ({ ...s, [game.id]: { ...s[game.id], home: e.target.value } }))}
                      placeholder="0"
                    />
                  </div>
                  <span className="text-on-surface-variant font-bold mt-4">—</span>
                  <div>
                    <label className="block text-xs text-on-surface-variant mb-1">{game.away_team?.name || 'Away'}</label>
                    <input type="number" min={0} className="w-16 border border-outline-variant rounded-lg px-2 py-1 text-sm text-on-surface bg-surface-lowest"
                      value={scores[game.id]?.away ?? ''}
                      onChange={e => setScores(s => ({ ...s, [game.id]: { ...s[game.id], away: e.target.value } }))}
                      placeholder="0"
                    />
                  </div>
                  <Button size="sm" onClick={() => submitScore(game)} disabled={submitting === game.id || !scores[game.id]?.home || !scores[game.id]?.away} className="mt-4">
                    {submitting === game.id ? '...' : 'Submit Score'}
                  </Button>
                </div>
              )}

              {/* Sportsmanship rating prompt after score submission */}
              {ratingGame === game.id && (
                <div className="mt-4 p-4 bg-surface-low rounded-xl space-y-3">
                  <p className="font-jakarta font-bold text-on-surface text-sm">Rate Sportsmanship</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">{game.home_team?.name}</p>
                      <StarRating value={sportsmanship[game.id]?.home || 0} onChange={v => setSportsmanship(s => ({ ...s, [game.id]: { ...s[game.id], home: v } }))} />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">{game.away_team?.name}</p>
                      <StarRating value={sportsmanship[game.id]?.away || 0} onChange={v => setSportsmanship(s => ({ ...s, [game.id]: { ...s[game.id], away: v } }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => submitSportsmanship(game.id)} disabled={!sportsmanship[game.id]?.home || !sportsmanship[game.id]?.away}>
                      Rate Sportsmanship
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRatingGame(null)}>Skip</Button>
                  </div>
                </div>
              )}

              {/* Show existing sportsmanship */}
              {game.status === 'completed' && game.home_sportsmanship && (
                <div className="mt-3 flex gap-4 text-xs text-on-surface-variant">
                  <span>{game.home_team?.name}: {'⭐'.repeat(game.home_sportsmanship)}</span>
                  <span>{game.away_team?.name}: {'⭐'.repeat(game.away_sportsmanship || 0)}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
