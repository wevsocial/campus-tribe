import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

type Team = { id: string; name: string; sport: string | null; season: string | null; coach_id: string | null; institution_id: string | null };
type Athlete = { id: string; team_id: string | null; position: string | null; jersey_number: string | null; ct_users?: { full_name: string | null; email: string | null } | null };
type Game = { id: string; home_team_id: string; away_team_id: string; scheduled_at: string | null; home_score: number | null; away_score: number | null; status: string; notes: string | null };

export default function CoachDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [teamsRes, trainingRes, usersRes] = await Promise.all([
      supabase.from('ct_teams').select('*').eq('coach_id', userId).eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_training_sessions').select('*').eq('coach_id', userId).order('scheduled_at', { ascending: false }).limit(20),
      supabase.from('ct_users').select('id, full_name, email, role').eq('institution_id', institutionId).in('role', ['student', 'student_rep']).order('full_name'),
    ]);
    const teams = teamsRes.data ?? [];
    const teamIds = teams.map((team: Team) => team.id);
    const [gamesRes, athletesRes] = teamIds.length
      ? await Promise.all([
          supabase.from('ct_games').select('*').or(teamIds.map((teamId: string) => `home_team_id.eq.${teamId},away_team_id.eq.${teamId}`).join(',')).order('scheduled_at', { ascending: false }).limit(40),
          supabase.from('ct_athletes').select('id, team_id, position, jersey_number, ct_users(full_name, email)').in('team_id', teamIds).order('created_at', { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }];
    return { teams, games: gamesRes.data ?? [], training: trainingRes.data ?? [], athletes: athletesRes.data ?? [], users: usersRes.data ?? [] };
  }, { teams: [], games: [], training: [], athletes: [], users: [] } as any);

  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [gameTime, setGameTime] = useState('');
  const [athleteUserId, setAthleteUserId] = useState('');
  const [athleteTeamId, setAthleteTeamId] = useState('');
  const [athletePosition, setAthletePosition] = useState('');
  const [athleteJersey, setAthleteJersey] = useState('');
  const [gameEdits, setGameEdits] = useState<Record<string, { scheduled_at?: string; status?: string; notes?: string; home_score?: string; away_score?: string }>>({});

  const teamMap = useMemo(() => Object.fromEntries(data.teams.map((team: Team) => [team.id, team])), [data.teams]);

  const myGames = useMemo(() => data.games.filter((game: Game) => teamMap[game.home_team_id] || teamMap[game.away_team_id]), [data.games, teamMap]);

  const standings = useMemo(() => {
    const rows: Record<string, { teamId: string; name: string; sport: string; wins: number; losses: number; draws: number; points: number; games: number; pf: number; pa: number }> = {};
    data.teams.forEach((team: Team) => {
      rows[team.id] = { teamId: team.id, name: team.name, sport: team.sport || 'Sport', wins: 0, losses: 0, draws: 0, points: 0, games: 0, pf: 0, pa: 0 };
    });
    myGames.forEach((game: Game) => {
      const home = rows[game.home_team_id];
      const away = rows[game.away_team_id];
      if (!home || !away || game.status !== 'completed' || game.home_score == null || game.away_score == null) return;
      home.games += 1; away.games += 1;
      home.pf += game.home_score; home.pa += game.away_score;
      away.pf += game.away_score; away.pa += game.home_score;
      if (game.home_score > game.away_score) { home.wins += 1; home.points += 3; away.losses += 1; }
      else if (game.home_score < game.away_score) { away.wins += 1; away.points += 3; home.losses += 1; }
      else { home.draws += 1; away.draws += 1; home.points += 1; away.points += 1; }
    });
    return Object.values(rows).sort((a, b) => b.points - a.points || b.wins - a.wins || (b.pf - b.pa) - (a.pf - a.pa));
  }, [data.teams, myGames]);

  const createTeam = async () => {
    if (!user?.id || !institutionId || !teamName.trim()) return;
    const { data: team } = await supabase.from('ct_teams').insert({ institution_id: institutionId, coach_id: user.id, name: teamName.trim(), sport: sport.trim() || null, season: 'Current' }).select('*').single();
    if (team) setData((current: any) => ({ ...current, teams: [team, ...current.teams] }));
    setTeamName(''); setSport('');
  };

  const createTraining = async () => {
    if (!user?.id || !data.teams[0]?.id || !sessionTitle.trim() || !sessionTime) return;
    const { data: session } = await supabase.from('ct_training_sessions').insert({ team_id: data.teams[0].id, coach_id: user.id, title: sessionTitle.trim(), scheduled_at: sessionTime }).select('*').single();
    if (session) setData((current: any) => ({ ...current, training: [session, ...current.training] }));
    setSessionTitle(''); setSessionTime('');
  };

  const createGame = async () => {
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId || !gameTime) return;
    const { data: game } = await supabase.from('ct_games').insert({ home_team_id: homeTeamId, away_team_id: awayTeamId, scheduled_at: gameTime, status: 'scheduled' }).select('*').single();
    if (game) setData((current: any) => ({ ...current, games: [game, ...current.games] }));
    setHomeTeamId(''); setAwayTeamId(''); setGameTime('');
  };

  const saveGame = async (game: Game, mode: 'schedule' | 'score' = 'schedule') => {
    const edit = gameEdits[game.id] || {};
    const payload: Record<string, any> = {
      scheduled_at: edit.scheduled_at ?? game.scheduled_at,
      status: edit.status ?? game.status,
      notes: edit.notes ?? game.notes,
    };
    if (mode === 'score') {
      payload.home_score = Number(edit.home_score ?? game.home_score ?? 0);
      payload.away_score = Number(edit.away_score ?? game.away_score ?? 0);
      payload.status = 'completed';
    }
    const { data: updated } = await supabase.from('ct_games').update(payload).eq('id', game.id).select('*').single();
    if (updated) {
      setData((current: any) => ({ ...current, games: current.games.map((entry: Game) => entry.id === game.id ? updated : entry) }));
      setGameEdits((current) => ({ ...current, [game.id]: {
        scheduled_at: updated.scheduled_at ?? '',
        status: updated.status,
        notes: updated.notes ?? '',
        home_score: updated.home_score != null ? String(updated.home_score) : '',
        away_score: updated.away_score != null ? String(updated.away_score) : '',
      } }));
    }
  };

  const addAthlete = async () => {
    if (!athleteUserId || !athleteTeamId) return;
    const { data: athlete } = await supabase.from('ct_athletes').insert({ user_id: athleteUserId, team_id: athleteTeamId, position: athletePosition || null, jersey_number: athleteJersey || null }).select('id, team_id, position, jersey_number, ct_users(full_name, email)').single();
    if (athlete) setData((current: any) => ({ ...current, athletes: [athlete, ...current.athletes] }));
    setAthleteUserId(''); setAthleteTeamId(''); setAthletePosition(''); setAthleteJersey('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Coach Workspace</h1>
          <p className="mt-2 text-white/80">Create teams and games, record scores, derive standings, and manage a minimal roster flow from live data.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create team</h2>
            <div className="space-y-3">
              <Input label="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Blue Wolves" />
              <Input label="Sport" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="Basketball" />
              <Button onClick={createTeam} className="w-full rounded-full">Create team</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create training session</h2>
            <div className="space-y-3">
              <Input label="Session title" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Conditioning" />
              <Input label="Scheduled at" type="datetime-local" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} />
              <Button onClick={createTraining} className="w-full rounded-full" disabled={!data.teams[0]}>Create session</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create game</h2>
            <div className="space-y-3">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Home team</label>
              <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select team</option>
                {data.teams.map((team: Team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <label className="block text-sm font-jakarta font-700 text-on-surface">Away team</label>
              <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select team</option>
                {data.teams.map((team: Team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <Input label="Scheduled at" type="datetime-local" value={gameTime} onChange={(e) => setGameTime(e.target.value)} />
              <Button onClick={createGame} className="w-full rounded-full" disabled={data.teams.length < 2}>Create game</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Add athlete to roster</h2>
            <div className="space-y-3">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Student athlete</label>
              <select value={athleteUserId} onChange={(e) => setAthleteUserId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select student</option>
                {data.users.map((entry: any) => <option key={entry.id} value={entry.id}>{entry.full_name || entry.email}</option>)}
              </select>
              <label className="block text-sm font-jakarta font-700 text-on-surface">Team</label>
              <select value={athleteTeamId} onChange={(e) => setAthleteTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select team</option>
                {data.teams.map((team: Team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <Input label="Position" value={athletePosition} onChange={(e) => setAthletePosition(e.target.value)} placeholder="Forward" />
              <Input label="Jersey #" value={athleteJersey} onChange={(e) => setAthleteJersey(e.target.value)} placeholder="12" />
              <Button onClick={addAthlete} className="w-full rounded-full">Add athlete</Button>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Standings</h2>
            {standings.length === 0 ? <p className="text-sm text-on-surface-variant">No teams yet.</p> : standings.map((team, index) => (
              <div key={team.teamId} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">#{index + 1} · {team.name}</p>
                    <p className="text-sm text-on-surface-variant">{team.sport} · {team.wins}-{team.losses}-{team.draws} · PF/PA {team.pf}/{team.pa}</p>
                  </div>
                  <Badge label={`${team.points} pts`} variant="tertiary" />
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Schedule & score updates</h2>
            {myGames.length === 0 ? <p className="text-sm text-on-surface-variant">No games recorded yet.</p> : myGames.map((game: Game) => {
              const edit = gameEdits[game.id] || {};
              return (
              <div key={game.id} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">{teamMap[game.home_team_id]?.name || 'Home'} vs {teamMap[game.away_team_id]?.name || 'Away'}</p>
                    <p className="text-sm text-on-surface-variant">{game.scheduled_at ? new Date(game.scheduled_at).toLocaleString() : 'TBD'}</p>
                  </div>
                  <Badge label={game.status} variant={game.status === 'completed' ? 'tertiary' : 'secondary'} />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Scheduled at" type="datetime-local" value={edit.scheduled_at ?? (game.scheduled_at ? new Date(new Date(game.scheduled_at).getTime() - new Date(game.scheduled_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')} onChange={(e) => setGameEdits((current) => ({ ...current, [game.id]: { ...current[game.id], scheduled_at: e.target.value } }))} />
                  <div>
                    <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Status</label>
                    <select value={edit.status ?? game.status} onChange={(e) => setGameEdits((current) => ({ ...current, [game.id]: { ...current[game.id], status: e.target.value } }))} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                      {['scheduled', 'live', 'completed', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
                <textarea value={edit.notes ?? game.notes ?? ''} onChange={(e) => setGameEdits((current) => ({ ...current, [game.id]: { ...current[game.id], notes: e.target.value } }))} rows={2} className="mt-3 w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Game notes / schedule changes" />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input value={edit.home_score ?? (game.home_score != null ? String(game.home_score) : '')} onChange={(e) => setGameEdits((current) => ({ ...current, [game.id]: { ...current[game.id], home_score: e.target.value } }))} type="number" min="0" className="w-20 rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2 text-sm" />
                  <span className="text-on-surface-variant">-</span>
                  <input value={edit.away_score ?? (game.away_score != null ? String(game.away_score) : '')} onChange={(e) => setGameEdits((current) => ({ ...current, [game.id]: { ...current[game.id], away_score: e.target.value } }))} type="number" min="0" className="w-20 rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2 text-sm" />
                  <Button size="sm" className="rounded-full" onClick={() => saveGame(game, 'score')}>Save score</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => saveGame(game, 'schedule')}>Save schedule</Button>
                </div>
              </div>
            );})}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Teams, roster & training</h2>
            {data.teams.length === 0 ? <p className="text-sm text-on-surface-variant">No teams yet. Create your first team.</p> : data.teams.map((team: Team) => (
              <div key={team.id} className="mb-4 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{team.name}</p><Badge label={team.sport || 'sport'} variant="primary" /></div>
                <p className="mt-1 text-sm text-on-surface-variant">Roster: {data.athletes.filter((athlete: Athlete) => athlete.team_id === team.id).length} athletes</p>
                <div className="mt-2 space-y-2">
                  {data.athletes.filter((athlete: Athlete) => athlete.team_id === team.id).slice(0, 4).map((athlete: Athlete) => <p key={athlete.id} className="text-sm text-on-surface-variant">{athlete.ct_users?.full_name || athlete.ct_users?.email || 'Athlete'} · {athlete.position || 'Position TBD'} · #{athlete.jersey_number || '—'}</p>)}
                  {data.training.filter((session: any) => session.team_id === team.id).slice(0, 2).map((session: any) => <p key={session.id} className="text-sm text-on-surface-variant">Training: {session.title || 'Session'} · {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'TBD'}</p>)}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
