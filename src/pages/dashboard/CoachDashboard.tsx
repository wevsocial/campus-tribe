import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

export default function CoachDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [teamsRes, gamesRes, trainingRes] = await Promise.all([
      supabase.from('ct_teams').select('*').eq('coach_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_games').select('*').order('scheduled_at', { ascending: false }).limit(10),
      supabase.from('ct_training_sessions').select('*').eq('coach_id', userId).order('scheduled_at', { ascending: false }).limit(10),
    ]);
    return { teams: teamsRes.data ?? [], games: gamesRes.data ?? [], training: trainingRes.data ?? [] };
  }, { teams: [], games: [], training: [] } as any);

  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Coach Workspace</h1>
          <p className="mt-2 text-white/80">Create teams, plan training sessions, and manage real sports data.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
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
              {!data.teams[0] && <p className="text-xs text-on-surface-variant">Create a team first.</p>}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Teams</h2>
            {data.teams.length === 0 ? <p className="text-sm text-on-surface-variant">No teams yet. Create your first team.</p> : data.teams.map((team: any) => <div key={team.id} className="mb-3 rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{team.name}</p><Badge label={team.sport || 'sport'} variant="primary" /></div><p className="mt-1 text-sm text-on-surface-variant">Record: {team.wins}-{team.losses}-{team.draws}</p></div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Training Sessions</h2>
            {data.training.length === 0 ? <p className="text-sm text-on-surface-variant">No sessions yet. Schedule the first training slot.</p> : data.training.map((session: any) => <div key={session.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{session.title}</p><p className="text-sm text-on-surface-variant">{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'TBD'}</p></div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Games</h2>
            {data.games.length === 0 ? <p className="text-sm text-on-surface-variant">No games recorded yet.</p> : data.games.map((game: any) => <div key={game.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">Game {game.id.slice(0, 8)}</p><p className="text-sm text-on-surface-variant">{game.scheduled_at ? new Date(game.scheduled_at).toLocaleString() : 'TBD'}</p></div><Badge label={game.status} variant="secondary" /></div>)}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
