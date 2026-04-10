import React, { useMemo, useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../components/ui/NotificationPrefsPanel';

type League = { id: string; name: string; sport: string | null; season: string | null; format: string | null; status: string | null; created_by: string | null; institution_id: string | null };
type Team = { id: string; name: string; league_id: string | null; institution_id: string | null; wins: number; losses: number; draws: number; points: number };
type Game = { id: string; home_team_id: string; away_team_id: string; institution_id: string | null; scheduled_at: string | null; status: string; home_score: number | null; away_score: number | null };
type Participant = { id: string; user_id: string | null; league_id: string | null; team_id: string | null; institution_id: string | null; is_free_agent: boolean | null };
type TrainingSession = { id: string; team_id: string | null; title: string | null; scheduled_at: string | null; duration_minutes: number | null; coach_id: string | null };
type AppUser = { id: string; full_name: string | null; email: string };

const SPORTS = ['Basketball', 'Soccer', 'Volleyball', 'Tennis', 'Swimming', 'Track & Field', 'Hockey', 'Baseball', 'Rugby'];
const FORMATS = ['Round Robin', 'Single Elimination', 'Double Elimination', 'League Play'];

export default function CoachDashboard() {
  const { user, institutionId } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      supabase.from('ct_users').select('full_name,avatar_url').eq('id', userId).maybeSingle().then(({ data }) => setProfile(data));
    }
    if (institutionId) {
      supabase.from('ct_sport_rankings').select('*').eq('institution_id', institutionId).order('points', { ascending: false }).limit(50).then(({ data }) => setRankings(data || []));
    }
  }, [userId, institutionId]);

  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [leaguesRes, teamsRes, gamesRes, participantsRes, trainingRes, usersRes] = await Promise.all([
      supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sports_teams').select('*').eq('institution_id', institutionId).order('points', { ascending: false }),
      supabase.from('ct_sports_games').select('*').eq('institution_id', institutionId).order('scheduled_at', { ascending: false }).limit(60),
      supabase.from('ct_sport_participants').select('*').eq('institution_id', institutionId).order('joined_at', { ascending: false }),
      supabase.from('ct_training_sessions').select('*').order('scheduled_at', { ascending: false }).limit(30),
      supabase.from('ct_users').select('id, full_name, email').eq('institution_id', institutionId).in('role', ['student', 'student_rep']).order('full_name'),
    ]);
    return {
      leagues: (leaguesRes.data ?? []) as League[],
      teams: (teamsRes.data ?? []) as Team[],
      games: (gamesRes.data ?? []) as Game[],
      participants: (participantsRes.data ?? []) as Participant[],
      training: (trainingRes.data ?? []) as TrainingSession[],
      users: (usersRes.data ?? []) as AppUser[],
    };
  }, { leagues: [], teams: [], games: [], participants: [], training: [], users: [] }, { requireInstitution: true });

  // League form
  const [leagueName, setLeagueName] = useState('');
  const [leagueSport, setLeagueSport] = useState('Basketball');
  const [leagueFormat, setLeagueFormat] = useState('Round Robin');
  const [leagueSeason, setLeagueSeason] = useState('Spring 2026');

  // Team form
  const [teamName, setTeamName] = useState('');
  const [teamLeagueId, setTeamLeagueId] = useState('');

  // Game form
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [gameTime, setGameTime] = useState('');

  // Training form
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTeamId, setSessionTeamId] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState('90');

  // Athlete form
  const [athleteUserId, setAthleteUserId] = useState('');
  const [athleteLeagueId, setAthleteLeagueId] = useState('');
  const [athleteTeamId, setAthleteTeamId] = useState('');

  // Filters/UI
  const [selectedLeagueId, setSelectedLeagueId] = useState('all');
  const [gameScores, setGameScores] = useState<Record<string, { home: string; away: string }>>({});
  const [message, setMessage] = useState('');

  const teamMap = useMemo(() => Object.fromEntries(data.teams.map((t) => [t.id, t])), [data.teams]);
  const leagueMap = useMemo(() => Object.fromEntries(data.leagues.map((l) => [l.id, l])), [data.leagues]);

  const filteredTeams = useMemo(() =>
    selectedLeagueId === 'all' ? data.teams : data.teams.filter((t) => t.league_id === selectedLeagueId),
    [data.teams, selectedLeagueId]
  );
  const filteredGames = useMemo(() =>
    selectedLeagueId === 'all' ? data.games : data.games.filter((g) => {
      const ht = teamMap[g.home_team_id]; const at = teamMap[g.away_team_id];
      return ht?.league_id === selectedLeagueId || at?.league_id === selectedLeagueId;
    }),
    [data.games, selectedLeagueId, teamMap]
  );
  const filteredParticipants = useMemo(() =>
    selectedLeagueId === 'all' ? data.participants : data.participants.filter((p) => p.league_id === selectedLeagueId),
    [data.participants, selectedLeagueId]
  );
  const filteredTraining = useMemo(() =>
    selectedLeagueId === 'all' ? data.training : data.training.filter((s) => s.team_id && teamMap[s.team_id]?.league_id === selectedLeagueId),
    [data.training, selectedLeagueId, teamMap]
  );

  const createLeague = async () => {
    if (!user?.id || !institutionId || !leagueName.trim()) return;
    const { data: league } = await supabase.from('ct_sports_leagues').insert({
      institution_id: institutionId,
      created_by: user.id,
      name: leagueName.trim(),
      sport: leagueSport,
      format: leagueFormat,
      season: leagueSeason,
      status: 'active',
    }).select('*').single();
    if (league) {
      setData((c) => ({ ...c, leagues: [league as League, ...c.leagues] }));
      setLeagueName('');
      setMessage('League created.');
    }
  };

  const createTeam = async () => {
    if (!user?.id || !institutionId || !teamName.trim() || !teamLeagueId) return;
    const { data: team } = await supabase.from('ct_sports_teams').insert({
      institution_id: institutionId,
      league_id: teamLeagueId,
      name: teamName.trim(),
      wins: 0, losses: 0, draws: 0, points: 0,
    }).select('*').single();
    if (team) {
      setData((c) => ({ ...c, teams: [team as Team, ...c.teams] }));
      setTeamName('');
      setMessage('Team created.');
    }
  };

  const createGame = async () => {
    if (!user?.id || !institutionId || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId || !gameTime) return;
    const { data: game } = await supabase.from('ct_sports_games').insert({
      institution_id: institutionId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      scheduled_at: gameTime,
      status: 'scheduled',
    }).select('*').single();
    if (game) {
      setData((c) => ({ ...c, games: [game as Game, ...c.games] }));
      setHomeTeamId(''); setAwayTeamId(''); setGameTime('');
      setMessage('Game scheduled.');
    }
  };

  const saveScore = async (game: Game) => {
    const edit = gameScores[game.id];
    if (!edit) return;
    const hs = Number(edit.home); const as_ = Number(edit.away);
    const { data: updated } = await supabase.from('ct_sports_games')
      .update({ home_score: hs, away_score: as_, status: 'completed' })
      .eq('id', game.id).select('*').single();
    if (updated) {
      // Update team wins/losses/points
      const homeTeam = teamMap[game.home_team_id];
      const awayTeam = teamMap[game.away_team_id];
      if (homeTeam && awayTeam) {
        const homeUpdate = hs > as_ ? { wins: (homeTeam.wins || 0) + 1, points: (homeTeam.points || 0) + 3 }
          : hs === as_ ? { draws: (homeTeam.draws || 0) + 1, points: (homeTeam.points || 0) + 1 }
          : { losses: (homeTeam.losses || 0) + 1 };
        const awayUpdate = as_ > hs ? { wins: (awayTeam.wins || 0) + 1, points: (awayTeam.points || 0) + 3 }
          : hs === as_ ? { draws: (awayTeam.draws || 0) + 1, points: (awayTeam.points || 0) + 1 }
          : { losses: (awayTeam.losses || 0) + 1 };
        await supabase.from('ct_sports_teams').update(homeUpdate).eq('id', homeTeam.id);
        await supabase.from('ct_sports_teams').update(awayUpdate).eq('id', awayTeam.id);
        setData((c) => ({
          ...c,
          games: c.games.map((g) => g.id === game.id ? updated as Game : g),
          teams: c.teams.map((t) =>
            t.id === homeTeam.id ? { ...t, ...homeUpdate }
            : t.id === awayTeam.id ? { ...t, ...awayUpdate }
            : t
          ),
        }));
      } else {
        setData((c) => ({ ...c, games: c.games.map((g) => g.id === game.id ? updated as Game : g) }));
      }
      setMessage('Score saved, standings updated.');
    }
  };

  const createTraining = async () => {
    if (!sessionTeamId || !sessionTitle.trim() || !sessionTime) return;
    const { data: session } = await supabase.from('ct_training_sessions').insert({
      team_id: sessionTeamId,
      coach_id: user?.id ?? null,
      title: sessionTitle.trim(),
      scheduled_at: sessionTime,
      duration_minutes: Number(sessionDuration) || 90,
    }).select('*').single();
    if (session) {
      setData((c) => ({ ...c, training: [session as TrainingSession, ...c.training] }));
      setSessionTitle(''); setSessionTime('');
      setMessage('Training session created.');
    }
  };

  const addParticipant = async () => {
    if (!athleteUserId || !athleteLeagueId || !institutionId) return;
    const already = data.participants.some((p) => p.user_id === athleteUserId && p.league_id === athleteLeagueId);
    if (already) { setMessage('Athlete already in this league.'); return; }
    const { data: participant } = await supabase.from('ct_sport_participants').insert({
      institution_id: institutionId,
      user_id: athleteUserId,
      league_id: athleteLeagueId,
      team_id: athleteTeamId || null,
      is_free_agent: !athleteTeamId,
    }).select('*').single();
    if (participant) {
      // Also update ct_users with athlete status and coach/team info
      await supabase.from('ct_users')
        .update({ is_athlete: true, athlete_coach_id: user!.id, athlete_team_id: athleteTeamId || null })
        .eq('id', athleteUserId);
      setData((c) => ({ ...c, participants: [participant as Participant, ...c.participants] }));
      setAthleteUserId(''); setAthleteLeagueId(''); setAthleteTeamId('');
      setMessage('Athlete registered.');
    }
  };

  
// Hash-based scroll navigation (driven by DashboardLayout sidebar)
React.useEffect(() => {
  const scrollToHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  // Small delay to let content render first
  const t = setTimeout(scrollToHash, 150);
  window.addEventListener('hashchange', scrollToHash);
  return () => { clearTimeout(t); window.removeEventListener('hashchange', scrollToHash); };
}, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <h1 className="font-lexend text-3xl font-900">Coach Workspace</h1>
          <p className="mt-2 text-white/80">Manage leagues, teams, game schedules, scores, athletes, and training sessions.</p>
        </div>

        {message && (
          <div className="rounded-[1rem] bg-primary/10 p-4 text-sm text-primary font-jakarta font-700">{message}</div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Leagues" value={data.leagues.length} color="primary" />
          <StatCard label="Teams" value={data.teams.length} color="secondary" />
          <StatCard label="Athletes" value={data.participants.length} color="tertiary" />
          <StatCard label="Games" value={data.games.length} color="primary" />
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-jakarta font-700 text-on-surface-variant">Filter by league:</span>
          <select
            value={selectedLeagueId}
            onChange={(e) => setSelectedLeagueId(e.target.value)}
            className="rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2 text-sm text-on-surface"
          >
            <option value="all">All leagues</option>
            {data.leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        {/* Create forms row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Create League</h2>
            <div className="space-y-3">
              <Input label="League name" value={leagueName} onChange={(e) => setLeagueName(e.target.value)} placeholder="Spring Intramural Basketball" />
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Sport</label>
                <select value={leagueSport} onChange={(e) => setLeagueSport(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Format</label>
                <select value={leagueFormat} onChange={(e) => setLeagueFormat(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <Input label="Season" value={leagueSeason} onChange={(e) => setLeagueSeason(e.target.value)} placeholder="Spring 2026" />
              <Button onClick={createLeague} className="w-full rounded-full">Create league</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Create Team</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">League</label>
                <select value={teamLeagueId} onChange={(e) => setTeamLeagueId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="">Select league</option>
                  {data.leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <Input label="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Blue Wolves" />
              <Button onClick={createTeam} className="w-full rounded-full" disabled={!teamLeagueId}>Create team</Button>
            </div>

            <h2 className="mt-6 mb-4 font-lexend text-lg font-800 text-on-surface">Schedule Game</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Home team</label>
                <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="">Select team</option>
                  {data.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Away team</label>
                <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="">Select team</option>
                  {data.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <Input label="Scheduled at" type="datetime-local" value={gameTime} onChange={(e) => setGameTime(e.target.value)} />
              <Button onClick={createGame} className="w-full rounded-full" disabled={data.teams.length < 2}>Schedule game</Button>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Register Athlete</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Student</label>
                <select value={athleteUserId} onChange={(e) => setAthleteUserId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="">Select student</option>
                  {data.users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">League</label>
                <select value={athleteLeagueId} onChange={(e) => setAthleteLeagueId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="">Select league</option>
                  {data.leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Team (optional; leave blank for free agent)</label>
                <select value={athleteTeamId} onChange={(e) => setAthleteTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="">Free agent</option>
                  {data.teams.filter((t) => !athleteLeagueId || t.league_id === athleteLeagueId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <Button onClick={addParticipant} className="w-full rounded-full" disabled={!athleteUserId || !athleteLeagueId}>Register athlete</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Training Session</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Team</label>
                <select value={sessionTeamId} onChange={(e) => setSessionTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="">Select team</option>
                  {data.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <Input label="Session title" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Conditioning & drills" />
              <Input label="Scheduled at" type="datetime-local" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} />
              <Input label="Duration (minutes)" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} />
              <Button onClick={createTraining} className="w-full rounded-full" disabled={!sessionTeamId}>Schedule training</Button>
            </div>
            {filteredTraining.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest">Upcoming</p>
                {filteredTraining.slice(0, 5).map((s) => (
                  <div key={s.id} className="rounded-[1rem] bg-surface p-3 flex items-center justify-between">
                    <div>
                      <p className="font-jakarta font-700 text-sm text-on-surface">{s.title}</p>
                      <p className="text-xs text-on-surface-variant">{teamMap[s.team_id || '']?.name || 'Team'} · {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : 'TBD'}</p>
                    </div>
                    <Badge label={`${s.duration_minutes || 90}min`} variant="tertiary" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Standings */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Standings</h2>
            {filteredTeams.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No teams yet. Create your first league and team.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-wide border-b border-outline-variant">
                      <th className="pb-2">Team</th>
                      <th className="pb-2 text-center">W</th>
                      <th className="pb-2 text-center">L</th>
                      <th className="pb-2 text-center">D</th>
                      <th className="pb-2 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.sort((a, b) => (b.points || 0) - (a.points || 0)).map((t, idx) => (
                      <tr key={t.id} className="border-b border-outline-variant/30">
                        <td className="py-2 font-jakarta font-700 text-on-surface">
                          <span className="text-on-surface-variant mr-2">#{idx + 1}</span>
                          {t.name}
                          {leagueMap[t.league_id || ''] && (
                            <span className="ml-2 text-xs text-on-surface-variant">({leagueMap[t.league_id || '']?.sport})</span>
                          )}
                        </td>
                        <td className="py-2 text-center text-tertiary font-700">{t.wins}</td>
                        <td className="py-2 text-center text-secondary font-700">{t.losses}</td>
                        <td className="py-2 text-center text-on-surface-variant">{t.draws}</td>
                        <td className="py-2 text-center font-lexend font-900 text-primary">{t.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Athletes</h2>
            {filteredParticipants.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No athletes registered. Add students to leagues above.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredParticipants.map((p) => {
                  const u = data.users.find((u) => u.id === p.user_id);
                  const team = teamMap[p.team_id || ''];
                  const league = leagueMap[p.league_id || ''];
                  return (
                    <div key={p.id} className="rounded-[1rem] bg-surface p-3 flex items-center justify-between">
                      <div>
                        <p className="font-jakarta font-700 text-sm text-on-surface">{u?.full_name || u?.email || 'Unknown'}</p>
                        <p className="text-xs text-on-surface-variant">{league?.name || 'League'} · {team?.name || (p.is_free_agent ? 'Free agent' : 'No team')}</p>
                      </div>
                      <Badge label={p.is_free_agent ? 'free agent' : 'assigned'} variant={p.is_free_agent ? 'secondary' : 'tertiary'} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Games */}
        <Card>
          <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Games & Scores</h2>
          {filteredGames.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No games yet. Schedule games between teams above.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGames.map((game) => {
                const home = teamMap[game.home_team_id];
                const away = teamMap[game.away_team_id];
                const edit = gameScores[game.id] || { home: String(game.home_score ?? ''), away: String(game.away_score ?? '') };
                return (
                  <div key={game.id} className="rounded-[1rem] bg-surface p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-jakarta font-700 text-on-surface">{home?.name || 'Home'} vs {away?.name || 'Away'}</p>
                      <Badge label={game.status} variant={game.status === 'completed' ? 'tertiary' : game.status === 'live' ? 'secondary' : 'primary'} />
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3">
                      {game.scheduled_at ? new Date(game.scheduled_at).toLocaleString() : 'TBD'}
                    </p>
                    {game.status === 'completed' ? (
                      <p className="font-lexend text-2xl font-900 text-center text-on-surface">
                        {game.home_score} - {game.away_score}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number" min="0"
                          value={edit.home}
                          onChange={(e) => setGameScores((c) => ({ ...c, [game.id]: { ...edit, home: e.target.value } }))}
                          placeholder="Home"
                          className="w-20 rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2 text-sm text-center"
                        />
                        <span className="text-on-surface-variant">-</span>
                        <input
                          type="number" min="0"
                          value={edit.away}
                          onChange={(e) => setGameScores((c) => ({ ...c, [game.id]: { ...edit, away: e.target.value } }))}
                          placeholder="Away"
                          className="w-20 rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2 text-sm text-center"
                        />
                        <Button size="sm" className="rounded-full ml-auto" onClick={() => saveScore(game)}>Save score</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Leagues list */}
        <Card>
          <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Leagues</h2>
          {data.leagues.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No leagues yet. Create your first league above.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.leagues.map((l) => {
                const teamCount = data.teams.filter((t) => t.league_id === l.id).length;
                const participantCount = data.participants.filter((p) => p.league_id === l.id).length;
                return (
                  <div key={l.id} className="rounded-[1rem] bg-surface p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-jakarta font-700 text-on-surface">{l.name}</p>
                      <Badge label={l.status || 'active'} variant="tertiary" />
                    </div>
                    <p className="text-sm text-on-surface-variant">{l.sport} · {l.format}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{l.season} · {teamCount} teams · {participantCount} athletes</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Rankings */}
        <Card id="rankings">
          <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Campus Sport Rankings</h2>
          {rankings.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No rankings yet. Post challenge scores to build leaderboard.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-outline-variant">{['Rank','User','Sport','W','L','Points'].map(h => <th key={h} className="py-2 px-3 text-left font-jakarta font-700 text-on-surface-variant">{h}</th>)}</tr></thead>
                <tbody>{rankings.map((r, i) => <tr key={r.id || i} className="border-b border-outline-variant/40"><td className="py-2 px-3 font-lexend font-700 text-primary">{i+1}</td><td className="py-2 px-3 text-on-surface font-jakarta">{r.user_id?.slice(0,8)}…</td><td className="py-2 px-3 text-on-surface-variant">{r.sport}</td><td className="py-2 px-3 text-green-600 font-700">{r.wins}</td><td className="py-2 px-3 text-red-500 font-700">{r.losses}</td><td className="py-2 px-3 font-lexend font-900 text-on-surface">{r.points}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Settings */}
        <Card id="settings">
          <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Settings</h2>
          {userId && <ProfilePhotoUpload userId={userId} currentUrl={profile?.avatar_url as string | null} displayName={profile?.full_name || user?.email} />}
          <div className="mt-6">
            {userId && <NotificationPrefsPanel userId={userId} institutionId={institutionId} role="coach" />}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
