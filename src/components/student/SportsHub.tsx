import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Trophy, Swords, Star } from 'lucide-react';

type League = { id: string; name: string; sport: string | null; format: string | null; status: string | null; season: string | null };
type Challenge = { id: string; title: string | null; sport: string; institution_id: string | null; is_open: boolean | null; status: string; created_at: string };
type ChallengeEntry = { id: string; challenge_id: string; user_id: string; score: number | null; rank: number | null };
type Participant = { id: string; league_id: string | null; user_id: string | null };
type LeaderboardEntry = { user_id: string; full_name: string | null; total_points: number; sport: string | null };

const TABS = [
  { id: 'leagues', label: 'Leagues', icon: Trophy },
  { id: 'challenges', label: 'Challenges', icon: Swords },
  { id: 'rankings', label: 'Rankings', icon: Star },
];

export default function SportsHub() {
  const { user, institutionId } = useAuth();
  const [tab, setTab] = useState('leagues');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [myParticipations, setMyParticipations] = useState<Participant[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myEntries, setMyEntries] = useState<ChallengeEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [flash, setFlash] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).eq('status', 'active')
      .then(({ data }) => setLeagues((data as League[]) ?? []));
    supabase.from('ct_sport_participants').select('*').eq('user_id', user.id)
      .then(({ data }) => setMyParticipations((data as Participant[]) ?? []));
    supabase.from('ct_sports_challenges').select('*').eq('institution_id', institutionId)
      .then(({ data }) => setChallenges((data as Challenge[]) ?? []));
    supabase.from('ct_challenge_entries').select('*').eq('user_id', user.id)
      .then(({ data }) => setMyEntries((data as ChallengeEntry[]) ?? []));
    supabase.from('ct_challenge_entries')
      .select('user_id, score, ct_users!inner(full_name), ct_sports_challenges!inner(sport)')
      .then(({ data }) => {
        const map: Record<string, { full_name: string | null; total: number; sport: string | null }> = {};
        (data ?? []).forEach((e: any) => {
          const uid = e.user_id;
          if (!map[uid]) map[uid] = { full_name: e.ct_users?.full_name ?? null, total: 0, sport: e.ct_sports_challenges?.sport ?? null };
          map[uid].total += e.score ?? 0;
        });
        setLeaderboard(Object.entries(map).map(([uid, v]) => ({
          user_id: uid, full_name: v.full_name, total_points: v.total, sport: v.sport
        })).sort((a, b) => b.total_points - a.total_points).slice(0, 20));
      });
  }, [institutionId, user?.id]);

  const joinLeague = async (leagueId: string) => {
    if (!user?.id || !institutionId) return;
    setLoading(true);
    const { error } = await supabase.from('ct_sport_participants').insert({
      user_id: user.id, league_id: leagueId, institution_id: institutionId, is_free_agent: true
    });
    if (!error) {
      setMyParticipations(prev => [...prev, { id: crypto.randomUUID(), league_id: leagueId, user_id: user.id }]);
      showFlash('Joined league!');
    }
    setLoading(false);
  };

  const acceptChallenge = async (challengeId: string) => {
    if (!user?.id || !institutionId) return;
    setLoading(true);
    const { error } = await supabase.from('ct_challenge_entries').insert({
      challenge_id: challengeId, user_id: user.id, institution_id: institutionId
    });
    if (!error) {
      setMyEntries(prev => [...prev, { id: crypto.randomUUID(), challenge_id: challengeId, user_id: user.id, score: null, rank: null }]);
      showFlash('Challenge accepted!');
    }
    setLoading(false);
  };

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };

  return (
    <div className="space-y-4">
      {flash && <div className="rounded-xl bg-primary/10 p-3 text-sm text-primary font-jakarta font-700">{flash}</div>}

      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-jakarta font-700 transition-all ${tab === t.id ? 'bg-primary text-white' : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface'}`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'leagues' && (
        <div className="space-y-3">
          {leagues.length === 0 && <p className="text-sm text-on-surface-variant">No active leagues right now.</p>}
          {leagues.map(league => {
            const joined = myParticipations.some(p => p.league_id === league.id);
            return (
              <Card key={league.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-jakarta font-700 text-on-surface">{league.name}</p>
                  <p className="text-xs text-on-surface-variant">{league.sport} · {league.format} · {league.season}</p>
                </div>
                {joined ? (
                  <Badge label="Joined" variant="success" />
                ) : (
                  <Button size="sm" onClick={() => joinLeague(league.id)} disabled={loading}>Join</Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'challenges' && (
        <div className="space-y-3">
          {challenges.length === 0 && <p className="text-sm text-on-surface-variant">No open challenges right now.</p>}
          {challenges.map(ch => {
            const entered = myEntries.some(e => e.challenge_id === ch.id);
            const myEntry = myEntries.find(e => e.challenge_id === ch.id);
            return (
              <Card key={ch.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">{ch.title || ch.sport}</p>
                    <p className="text-xs text-on-surface-variant">{ch.sport} · {ch.status}</p>
                  </div>
                  {entered ? (
                    <div className="text-right">
                      <Badge label="Entered" variant="success" />
                      {myEntry?.score != null && <p className="text-xs text-on-surface-variant mt-1">Score: {myEntry.score}</p>}
                    </div>
                  ) : (
                    ch.is_open && ch.status !== 'closed'
                      ? <Button size="sm" onClick={() => acceptChallenge(ch.id)} disabled={loading}>Accept</Button>
                      : <Badge label="Closed" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'rankings' && (
        <Card className="p-4">
          <h3 className="font-lexend font-800 text-on-surface mb-3">🏆 Leaderboard</h3>
          {leaderboard.length === 0 && <p className="text-sm text-on-surface-variant">No rankings yet.</p>}
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={entry.user_id} className="flex items-center gap-3 py-2 border-b border-outline-variant/20 last:border-0">
                <span className="w-6 text-center font-lexend font-900 text-on-surface-variant text-sm">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {entry.full_name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1">
                  <p className="font-jakarta font-700 text-sm text-on-surface">{entry.full_name ?? 'Unknown'}</p>
                  {entry.sport && <p className="text-xs text-on-surface-variant">{entry.sport}</p>}
                </div>
                <span className="font-lexend font-900 text-primary">{entry.total_points} pts</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
