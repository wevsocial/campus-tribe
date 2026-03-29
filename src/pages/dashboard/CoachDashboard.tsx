import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { formatDateTimeLocalInput } from '../../lib/dashboardData';

type Team = { id: string; name: string; sport: string | null; season: string | null; coach_id: string | null; institution_id: string | null };
type Athlete = { id: string; user_id?: string | null; team_id: string | null; position: string | null; jersey_number: string | null; waiver_signed?: boolean | null; ct_users?: { full_name: string | null; email: string | null } | null };
type Game = { id: string; home_team_id: string; away_team_id: string; scheduled_at: string | null; home_score: number | null; away_score: number | null; status: string; notes: string | null };
type TrainingSession = { id: string; team_id: string | null; title: string | null; scheduled_at: string | null };

export default function CoachDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [teamsRes, trainingRes, usersRes] = await Promise.all([
      supabase.from('ct_teams').select('*').eq('coach_id', userId).eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_training_sessions').select('*').eq('coach_id', userId).order('scheduled_at', { ascending: false }).limit(30),
      supabase.from('ct_users').select('id, full_name, email, role').eq('institution_id', institutionId).in('role', ['student', 'student_rep']).order('full_name'),
    ]);
    const teams = teamsRes.data ?? [];
    const teamIds = teams.map((team: Team) => team.id);
    const [gamesRes, athletesRes] = teamIds.length
      ? await Promise.all([
          supabase.from('ct_games').select('*').or(teamIds.map((teamId: string) => `home_team_id.eq.${teamId},away_team_id.eq.${teamId}`).join(',')).order('scheduled_at', { ascending: false }).limit(60),
          supabase.from('ct_athletes').select('id, user_id, team_id, position, jersey_number, waiver_signed, ct_users(full_name, email)').in('team_id', teamIds).order('created_at', { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }];
    return { teams, games: gamesRes.data ?? [], training: trainingRes.data ?? [], athletes: athletesRes.data ?? [], users: usersRes.data ?? [] };
  }, { teams: [], games: [], training: [], athletes: [], users: [] } as any);

  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [season, setSeason] = useState('Current');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionTeamId, setSessionTeamId] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [gameTime, setGameTime] = useState('');
  const [athleteUserId, setAthleteUserId] = useState('');
  const [athleteTeamId, setAthleteTeamId] = useState('');
  const [athletePosition, setAthletePosition] = useState('');
  const [athleteJersey, setAthleteJersey] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const [gameEdits, setGameEdits] = useState<Record<string, { scheduled_at?: string; status?: string; notes?: string; home_score?: string; away_score?: string }>>({});
  const [athleteEdits, setAthleteEdits] = useState<Record<string, { team_id?: string; position?: string; jersey_number?: string }>>({});
  const [message, setMessage] = useState('');

  const teamMap = useMemo(() => Object.fromEntries(data.teams.map((team: Team) => [team.id, team])), [data.teams]);

  const myGames = useMemo(() => data.games.filter((game: Game) => teamMap[game.home_team_id] || teamMap[game.away_team_id]), [data.games, teamMap]);
  const filteredGames = useMemo(() => selectedTeamId === 'all'
    ? myGames
    : myGames.filter((game: Game) => game.home_team_id === selectedTeamId || game.away_team_id === selectedTeamId), [myGames, selectedTeamId]);
  const filteredAthletes = useMemo(() => selectedTeamId === 'all'
    ? data.athletes
    : data.athletes.filter((athlete: Athlete) => athlete.team_id === selectedTeamId), [data.athletes, selectedTeamId]);
  const filteredTraining = useMemo(() => selectedTeamId === 'all'
    ? data.training
    : data.training.filter((session: TrainingSession) => session.team_id === selectedTeamId), [data.training, selectedTeamId]);

  const standings = useMemo(() => {
    const rows: Record<string, { teamId: string; name: string; sport: string; season: string; wins: number; losses: number; draws: number; points: number; games: number; pf: number; pa: number }> = {};
    data.teams.forEach((team: Team) => {
      rows[team.id] = { teamId: team.id, name: team.name, sport: team.sport || 'Sport', season: team.season || 'Current', wins: 0, losses: 0, draws: 0, points: 0, games: 0, pf: 0, pa: 0 };
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
    const { data: team } = await supabase.from('ct_teams').insert({ institution_id: institutionId, coach_id: user.id, name: teamName.trim(), sport: sport.trim() || null, season: season.trim() || 'Current' }).select('*').single();
    if (team) {
      setData((current: any) => ({ ...current, teams: [team, ...current.teams] }));
      setSelectedTeamId(team.id);
    }
    setTeamName(''); setSport(''); setSeason('Current');
  };

  const createTraining = async () => {
    if (!user?.id || !sessionTeamId || !sessionTitle.trim() || !sessionTime) return;
    const { data: session } = await supabase.from('ct_training_sessions').insert({ team_id: sessionTeamId, coach_id: user.id, title: sessionTitle.trim(), scheduled_at: sessionTime }).select('*').single();
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
      setMessage(mode === 'score' ? 'Score saved and standings refreshed.' : 'Game schedule updated.');
    }
  };

  const addAthlete = async () => {
    if (!athleteUserId || !athleteTeamId) return;
    const { data: athlete, error } = await supabase.from('ct_athletes').insert({ user_id: athleteUserId, team_id: athleteTeamId, position: athletePosition || null, jersey_number: athleteJersey || null }).select('id, user_id, team_id, position, jersey_number, waiver_signed, ct_users(full_name, email)').single();
    if (error) {
      setMessage(error.message.includes('duplicate') ? 'That athlete is already on this roster.' : error.message);
      return;
    }
    if (athlete) {
      setData((current: any) => ({ ...current, athletes: [athlete, ...current.athletes] }));
      setSelectedTeamId(athlete.team_id || 'all');
      setMessage('Athlete added to roster.');
    }
    setAthleteUserId(''); setAthleteTeamId(''); setAthletePosition(''); setAthleteJersey('');
  };

  const saveAthlete = async (athlete: Athlete) => {
    const edit = athleteEdits[athlete.id] || {};
    const { data: updated } = await supabase.from('ct_athletes').update({
      team_id: edit.team_id ?? athlete.team_id,
      position: edit.position ?? athlete.position,
      jersey_number: edit.jersey_number ?? athlete.jersey_number,
    }).eq('id', athlete.id).select('id, user_id, team_id, position, jersey_number, waiver_signed, ct_users(full_name, email)').single();
    if (updated) {
      setData((current: any) => ({ ...current, athletes: current.athletes.map((entry: Athlete) => entry.id === athlete.id ? updated : entry) }));
      setMessage('Roster entry updated.');
    }
  };

  const removeAthlete = async (athleteId: string) => {
    await supabase.from('ct_athletes').delete().eq('id', athleteId);
    setData((current: any) => ({ ...current, athletes: current.athletes.filter((entry: Athlete) => entry.id !== athleteId) }));
    setMessage('Athlete removed from roster.');
  };

  const toggleWaiver = async (athlete: Athlete) => {
    const newValue = !athlete.waiver_signed;
    await supabase.from('ct_athletes').update({ waiver_signed: newValue }).eq('id', athlete.id);
    setData((current: any) => ({ ...current, athletes: current.athletes.map((a: Athlete) => a.id === athlete.id ? { ...a, waiver_signed: newValue } : a) }));
    setMessage(newValue ? 'Waiver marked as signed.' : 'Waiver marked as unsigned.');
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Coach Workspace</h1>
          <p className="mt-2 text-white/80">Create teams and games, record scores, derive standings, and manage a fuller live roster workflow.</p>
        </div>

        {message && <div className="rounded-[1rem] bg-primary/10 p-3 text-sm text-primary">{message}</div>}

        <div className="grid lg:grid-cols-4 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create team</h2>
            <div className="space-y-3">
              <Input label="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Blue Wolves" />
              <Input label="Sport" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="Basketball" />
              <Input label="Season" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="Spring 2026" />
              <Button onClick={createTeam} className="w-full rounded-full">Create team</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create training session</h2>
            <div className="space-y-3">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Team</label>
              <select value={sessionTeamId} onChange={(e) => setSessionTeamId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select team</option>
                {data.teams.map((team: Team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <Input label="Session title" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Conditioning" />
              <Input label="Scheduled at" type="datetime-local" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} />
              <Button onClick={createTraining} className="w-full rounded-full" disabled={!data.teams.length}>Create session</Button>
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

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-jakarta font-700 text-on-surface">Filter team</label>
          <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
            <option value="all">All teams</option>
            {data.teams.map((team: Team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Standings</h2>
            {standings.length === 0 ? <p className="text-sm text-on-surface-variant">No teams yet.</p> : standings.map((team, index) => (
              <div key={team.teamId} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">#{index + 1} · {team.name}</p>
                    <p className="text-sm text-on-surface-variant">{team.sport} · {team.season} · {team.wins}-{team.losses}-{team.draws}</p>
                    <p className="text-xs text-on-surface-variant">PF/PA {team.pf}/{team.pa} · Diff {team.pf - team.pa}</p>
                  </div>
                  <Badge label={`${team.points} pts`} variant="tertiary" />
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Schedule & score updates</h2>
            {filteredGames.length === 0 ? <p className="text-sm text-on-surface-variant">No games recorded for this view yet.</p> : filteredGames.map((game: Game) => {
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
                  <Input label="Scheduled at" type="datetime-local" value={edit.scheduled_at ?? formatDateTimeLocalInput(game.scheduled_at)} onChange={(e) => setGameEdits((current) => ({ ...current, [game.id]: { ...current[game.id], scheduled_at: e.target.value } }))} />
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
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Roster & training</h2>
            {data.teams.length === 0 ? <p className="text-sm text-on-surface-variant">No teams yet. Create your first team.</p> : (
              <div className="space-y-4">
                {filteredAthletes.length === 0 ? <p className="text-sm text-on-surface-variant">No athletes in this filtered view yet.</p> : filteredAthletes.map((athlete: Athlete) => {
                  const edit = athleteEdits[athlete.id] || {};
                  return <div key={athlete.id} className="rounded-[1rem] bg-surface p-4 space-y-3"><div className="flex items-center justify-between gap-3"><div><p className="font-jakarta font-700 text-on-surface">{athlete.ct_users?.full_name || athlete.ct_users?.email || 'Athlete'}</p><p className="text-sm text-on-surface-variant">{teamMap[(edit.team_id ?? athlete.team_id) || '']?.name || 'Unassigned team'}</p></div><div className="flex items-center gap-2"><Badge label={athlete.waiver_signed ? '✓ Waiver' : '⚠ No waiver'} variant={athlete.waiver_signed ? 'tertiary' : 'secondary'} /><Badge label={edit.position || athlete.position || 'Position TBD'} variant="primary" /></div></div><div className="grid md:grid-cols-3 gap-3"><div><label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Team</label><select value={edit.team_id ?? athlete.team_id ?? ''} onChange={(e) => setAthleteEdits((current) => ({ ...current, [athlete.id]: { ...current[athlete.id], team_id: e.target.value } }))} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">{data.teams.map((team: Team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></div><Input label="Position" value={edit.position ?? athlete.position ?? ''} onChange={(e) => setAthleteEdits((current) => ({ ...current, [athlete.id]: { ...current[athlete.id], position: e.target.value } }))} placeholder="Forward" /><Input label="Jersey #" value={edit.jersey_number ?? athlete.jersey_number ?? ''} onChange={(e) => setAthleteEdits((current) => ({ ...current, [athlete.id]: { ...current[athlete.id], jersey_number: e.target.value } }))} placeholder="12" /></div><div className="flex flex-wrap gap-2"><Button size="sm" className="rounded-full" onClick={() => saveAthlete(athlete)}>Save athlete</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => toggleWaiver(athlete)}>{athlete.waiver_signed ? 'Revoke waiver' : 'Mark waiver signed'}</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => removeAthlete(athlete.id)}>Remove</Button></div></div>;
                })}
                <div className="rounded-[1rem] bg-surface p-4">
                  <p className="font-jakarta font-700 text-on-surface">Upcoming training</p>
                  <div className="mt-2 space-y-2">
                    {filteredTraining.length === 0 ? <p className="text-sm text-on-surface-variant">No training sessions in this view.</p> : filteredTraining.slice(0, 5).map((session: TrainingSession) => <p key={session.id} className="text-sm text-on-surface-variant">{teamMap[session.team_id || '']?.name || 'Team'} · {session.title || 'Session'} · {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'TBD'}</p>)}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
