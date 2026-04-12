import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { Trophy, Target, Award, User, BarChart2, CheckCircle } from 'lucide-react';

interface League { id: string; name: string; sport: string | null; format: string | null; season: string | null; status: string | null; }
interface Game { id: string; home_team_id: string | null; away_team_id: string | null; scheduled_at: string | null; status: string | null; home_score: number | null; away_score: number | null; venue_id: string | null; league_id: string | null; }
interface Challenge { id: string; name: string; description: string | null; sport: string | null; challenge_type: string | null; start_date: string | null; end_date: string | null; prize: string | null; status: string | null; }
interface ChallengeEntry { id: string; challenge_id: string; rank: number | null; score: number | null; }
interface Participant { id: string; league_id: string | null; team_id: string | null; is_free_agent: boolean | null; user_id: string; }

type SubTab = 'leagues' | 'matches' | 'challenges' | 'rankings' | 'profile';

export default function StudentSports() {
  const { user, institutionId, profile } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>('leagues');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [myParticipants, setMyParticipants] = useState<Participant[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myEntries, setMyEntries] = useState<ChallengeEntry[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    setLoading(true);
    Promise.all([
      supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).eq('status', 'active'),
      supabase.from('ct_sport_participants').select('*').eq('user_id', user.id),
      supabase.from('ct_sports_games').select('*').eq('institution_id', institutionId).order('scheduled_at', { ascending: true }).limit(30),
      supabase.from('ct_sports_challenges').select('*').eq('institution_id', institutionId).eq('status', 'open'),
      supabase.from('ct_challenge_entries').select('*').eq('user_id', user.id),
      supabase.from('ct_sport_participants').select('*, ct_users!user_id(full_name), ct_sports_teams!team_id(name)').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(50),
    ]).then(([l, p, g, ch, ce, rank]) => {
      setLeagues(l.data ?? []);
      setMyParticipants(p.data ?? []);
      setGames(g.data ?? []);
      setChallenges(ch.data ?? []);
      setMyEntries(ce.data ?? []);
      setRankings(rank.data ?? []);
      setLoading(false);
    });
  }, [institutionId, user?.id]);

  const joinLeague = async (leagueId: string) => {
    if (!user?.id || !institutionId) return;
    const { data } = await supabase.from('ct_sport_participants').insert({
      user_id: user.id, league_id: leagueId, institution_id: institutionId, is_free_agent: true,
    }).select('*').single();
    if (data) {
      setMyParticipants(p => [...p, data as Participant]);
      showFlash('Joined as free agent! A coach will assign you to a team.');
    }
  };

  const leaveLeague = async (leagueId: string) => {
    if (!user?.id) return;
    const p = myParticipants.find(x => x.league_id === leagueId && x.user_id === user.id);
    if (!p) return;
    await supabase.from('ct_sport_participants').delete().eq('id', p.id);
    setMyParticipants(prev => prev.filter(x => x.id !== p.id));
    showFlash('Left league.');
  };

  const enterChallenge = async (challengeId: string) => {
    if (!user?.id || !institutionId) return;
    const { data } = await supabase.from('ct_challenge_entries').insert({
      challenge_id: challengeId, user_id: user.id, institution_id: institutionId,
    }).select('*').single();
    if (data) {
      setMyEntries(e => [...e, data as ChallengeEntry]);
      showFlash('Entered challenge!');
    }
  };

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 3000);
  };

  const TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'leagues',    label: 'Leagues',    icon: <Trophy size={15} /> },
    { id: 'matches',    label: 'Matches',    icon: <Target size={15} /> },
    { id: 'challenges', label: 'Challenges', icon: <Award size={15} /> },
    { id: 'rankings',   label: 'Rankings',   icon: <BarChart2 size={15} /> },
    { id: 'profile',    label: 'My Profile', icon: <User size={15} /> },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Sports</h1>

      {flash && (
        <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-jakarta font-700 text-primary">
          {flash}
        </div>
      )}

      {/* Sub-tab ribbon */}
      <div className="flex gap-1 overflow-x-auto bg-surface-low rounded-2xl p-1.5 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-jakarta font-700 whitespace-nowrap transition-all flex-shrink-0 ${
              subTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Leagues */}
      {subTab === 'leagues' && (
        <div className="space-y-3">
          {leagues.length === 0 ? (
            <Card><p className="text-sm text-on-surface-variant text-center py-8">No active leagues right now.</p></Card>
          ) : leagues.map(l => {
            const joined = myParticipants.some(p => p.league_id === l.id);
            return (
              <Card key={l.id} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-jakarta font-700 text-on-surface">{l.name}</p>
                    {joined && <Badge label="You're In" variant="success" />}
                  </div>
                  <p className="text-sm text-on-surface-variant">{l.sport} · {l.format || 'Round Robin'} · {l.season || 'Season'}</p>
                </div>
                {joined ? (
                  <Button size="sm" variant="outline" onClick={() => leaveLeague(l.id)} className="rounded-full shrink-0">Leave</Button>
                ) : (
                  <Button size="sm" onClick={() => joinLeague(l.id)} className="rounded-full shrink-0">Join League</Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab 2: Matches */}
      {subTab === 'matches' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-lexend font-bold text-on-surface mb-3">Upcoming Games</h2>
            {games.filter(g => g.status === 'scheduled').length === 0 ? (
              <Card><p className="text-sm text-on-surface-variant text-center py-6">No upcoming games.</p></Card>
            ) : (
              <div className="space-y-2">
                {games.filter(g => g.status === 'scheduled').slice(0, 10).map(g => (
                  <Card key={g.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-jakarta font-700 text-on-surface text-sm">
                        {g.scheduled_at ? new Date(g.scheduled_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </p>
                    </div>
                    <Badge label={g.status || 'scheduled'} variant="secondary" />
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-lexend font-bold text-on-surface mb-3">Past Results</h2>
            {games.filter(g => g.status === 'completed').length === 0 ? (
              <Card><p className="text-sm text-on-surface-variant text-center py-6">No completed games yet.</p></Card>
            ) : (
              <div className="space-y-2">
                {games.filter(g => g.status === 'completed').slice(0, 10).map(g => (
                  <Card key={g.id} className="flex items-center justify-between gap-4">
                    <p className="font-jakarta text-sm text-on-surface">
                      {g.scheduled_at ? new Date(g.scheduled_at).toLocaleDateString() : 'Unknown date'}
                    </p>
                    <p className="font-jakarta font-700 text-on-surface">{g.home_score ?? '–'} : {g.away_score ?? '–'}</p>
                    <Badge label="Completed" variant="success" />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Challenges */}
      {subTab === 'challenges' && (
        <div className="space-y-3">
          {challenges.length === 0 ? (
            <Card><p className="text-sm text-on-surface-variant text-center py-8">No open challenges right now.</p></Card>
          ) : challenges.map(ch => {
            const entered = myEntries.find(e => e.challenge_id === ch.id);
            return (
              <Card key={ch.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-jakarta font-700 text-on-surface">{ch.name}</p>
                    {ch.description && <p className="text-sm text-on-surface-variant mt-0.5">{ch.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ch.sport && <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-jakarta font-700">{ch.sport}</span>}
                      {ch.prize && <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-jakarta font-700">🏆 {ch.prize}</span>}
                      {ch.end_date && <span className="text-xs text-on-surface-variant">Ends: {ch.end_date}</span>}
                    </div>
                    {entered && entered.rank && (
                      <p className="text-sm font-jakarta font-700 text-primary mt-2">Your rank: #{entered.rank} {entered.score ? `· Score: ${entered.score}` : ''}</p>
                    )}
                  </div>
                  {entered ? (
                    <div className="flex items-center gap-1.5 text-green-600 shrink-0">
                      <CheckCircle size={16} />
                      <span className="text-xs font-jakarta font-700">Entered</span>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => enterChallenge(ch.id)} className="rounded-full shrink-0">Enter</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab 4: Rankings */}
      {subTab === 'rankings' && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Leaderboard</h2>
          {rankings.length === 0 ? (
            <Card><p className="text-sm text-on-surface-variant text-center py-8">No rankings yet.</p></Card>
          ) : (
            <Card padding="none">
              <table className="w-full">
                <thead className="bg-surface-low">
                  <tr>{['#', 'Name', 'Team', 'Free Agent'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {rankings.slice(0, 30).map((r: any, i: number) => (
                    <tr key={r.id} className={r.user_id === user?.id ? 'bg-primary/5' : ''}>
                      <td className="px-4 py-3 text-on-surface-variant font-jakarta text-sm">{i + 1}</td>
                      <td className="px-4 py-3 font-jakarta font-700 text-on-surface text-sm">
                        {r.ct_users?.full_name || 'Unknown'}
                        {r.user_id === user?.id && <span className="ml-1 text-xs text-primary">(you)</span>}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-sm">{r.ct_sports_teams?.name || '—'}</td>
                      <td className="px-4 py-3">
                        {r.is_free_agent ? <Badge label="Free Agent" variant="warning" /> : <Badge label="On Team" variant="success" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* Tab 5: My Profile */}
      {subTab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-lexend font-bold text-on-surface mb-4">Athlete Profile</h2>
            <div className="space-y-3">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-1">Sport</p>
                <p className="font-jakarta font-700 text-on-surface">{(profile as any)?.athlete_sport || 'Not set'}</p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-1">Leagues Joined</p>
                <p className="font-jakarta font-700 text-on-surface">{myParticipants.length}</p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-1">Waiver Status</p>
                {myParticipants.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Join a league first</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myParticipants.map(p => (
                      <Badge key={p.id} label={(p as any).waiver_signed ? 'Signed' : 'Pending'} variant={(p as any).waiver_signed ? 'success' : 'warning'} />
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-1">Challenges Entered</p>
                <p className="font-jakarta font-700 text-on-surface">{myEntries.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
