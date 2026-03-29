import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Plus, Zap } from 'lucide-react';

interface League {
  id: string; name: string; sport: string; season: string; format: string; status: string;
}
interface Team { id: string; name: string; league_id: string; }
interface ScheduleRow { round: number; home: string; away: string; date: Date; homeId: string; awayId: string; }

function generateRoundRobin(teams: { id: string; name: string }[]): ScheduleRow[] {
  const arr = [...teams];
  if (arr.length % 2 !== 0) arr.push({ id: 'BYE', name: 'BYE' });
  const n = arr.length;
  const rounds = n - 1;
  const half = n / 2;
  const schedule: ScheduleRow[] = [];
  const rotatable = arr.slice(1);
  const fixed = arr[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);

  for (let r = 0; r < rounds; r++) {
    const current = [fixed, ...rotatable];
    for (let i = 0; i < half; i++) {
      const home = current[i];
      const away = current[n - 1 - i];
      if (home.name !== 'BYE' && away.name !== 'BYE') {
        const gameDate = new Date(startDate);
        gameDate.setDate(gameDate.getDate() + r * 3);
        schedule.push({ round: r + 1, home: home.name, away: away.name, date: gameDate, homeId: home.id, awayId: away.id });
      }
    }
    // Rotate: keep fixed[0], rotate rest
    rotatable.unshift(rotatable.pop()!);
  }
  return schedule;
}

export default function CoachLeagues() {
  const { institutionId, user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState<League | null>(null);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', sport: '', season: '', format: 'round_robin' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const [l, t] = await Promise.all([
      supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sports_teams').select('*').eq('institution_id', institutionId),
    ]);
    setLeagues(l.data ?? []);
    setTeams(t.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [institutionId]);

  const createLeague = async () => {
    if (!form.name || !institutionId || !user) return;
    setSaving(true);
    const { data } = await supabase.from('ct_sports_leagues').insert({
      name: form.name, sport: form.sport, season: form.season, format: form.format,
      institution_id: institutionId, status: 'active', created_by: user.id,
    }).select().single();
    setSaving(false);
    if (data) {
      setLeagues(prev => [data, ...prev]);
      setActiveLeague(data);
      setShowCreate(false);
      setForm({ name: '', sport: '', season: '', format: 'round_robin' });
      setSchedule([]);
      setGenerated(false);
    }
  };

  const addTeam = async () => {
    if (!newTeamName.trim() || !activeLeague || !institutionId) return;
    const { data } = await supabase.from('ct_sports_teams').insert({
      name: newTeamName.trim(), league_id: activeLeague.id, institution_id: institutionId,
      wins: 0, losses: 0, draws: 0, points: 0,
    }).select().single();
    if (data) {
      setTeams(prev => [...prev, data]);
      setNewTeamName('');
      setGenerated(false);
      setSchedule([]);
    }
  };

  const generateSchedule = async () => {
    if (!activeLeague) return;
    const leagueTeams = teams.filter(t => t.league_id === activeLeague.id);
    if (leagueTeams.length < 2) { alert('Need at least 2 teams to generate schedule.'); return; }
    const rows = generateRoundRobin(leagueTeams);
    setSchedule(rows);
    setGenerating(true);

    // Insert games
    const games = rows.map(row => ({
      league_id: activeLeague.id,
      home_team_id: row.homeId,
      away_team_id: row.awayId,
      scheduled_at: row.date.toISOString(),
      status: 'scheduled',
      institution_id: institutionId,
    }));
    await supabase.from('ct_sports_games').insert(games);
    setGenerating(false);
    setGenerated(true);
  };

  const activeLeagueTeams = activeLeague ? teams.filter(t => t.league_id === activeLeague.id) : [];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Leagues</h1>
        <Button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2">
          <Plus size={16} /> New League
        </Button>
      </div>

      {showCreate && (
        <Card>
          <h2 className="font-lexend font-bold text-on-surface mb-4">Create League</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">League Name *</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Spring Basketball League" />
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Sport</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))} placeholder="Basketball" />
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Season</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} placeholder="Spring 2026" />
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Format</label>
              <select className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                <option value="round_robin">Round Robin</option>
                <option value="playoff">Playoff</option>
                <option value="swiss">Swiss</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={createLeague} disabled={saving || !form.name}>
              {saving ? 'Creating...' : 'Create League'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Leagues list */}
      {leagues.length === 0 ? <EmptyState message="No leagues yet. Create one!" /> : (
        <div className="space-y-3">
          {leagues.map(l => (
            <Card key={l.id}
              className={`cursor-pointer transition-all ${activeLeague?.id === l.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => { setActiveLeague(activeLeague?.id === l.id ? null : l); setSchedule([]); setGenerated(false); }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{l.name}</p>
                  <p className="text-sm text-on-surface-variant">{l.sport} · {l.season} · {l.format}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={`${teams.filter(t => t.league_id === l.id).length} teams`} variant="neutral" />
                  <Badge label={l.status} variant={l.status === 'active' ? 'success' : 'neutral'} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Active league management */}
      {activeLeague && (
        <div className="space-y-4">
          <h2 className="font-lexend font-bold text-on-surface">Manage: {activeLeague.name}</h2>

          {/* Add teams */}
          <Card>
            <h3 className="font-jakarta font-bold text-on-surface mb-3">Add Teams</h3>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTeam()}
                placeholder="Team name..."
              />
              <Button onClick={addTeam} disabled={!newTeamName.trim()}>Add</Button>
            </div>
            {activeLeagueTeams.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeLeagueTeams.map(t => (
                  <span key={t.id} className="bg-surface-low px-3 py-1 rounded-full text-sm font-jakarta text-on-surface">{t.name}</span>
                ))}
              </div>
            )}
          </Card>

          {activeLeagueTeams.length >= 2 && (
            <div className="flex gap-3">
              <Button onClick={generateSchedule} disabled={generating} className="flex items-center gap-2">
                <Zap size={16} /> {generating ? 'Generating...' : 'Generate Schedule (Round-Robin)'}
              </Button>
            </div>
          )}

          {/* Generated schedule table */}
          {schedule.length > 0 && (
            <Card padding="none">
              <div className="px-4 py-3 border-b border-outline-variant/30">
                <p className="font-lexend font-bold text-on-surface">
                  Generated Schedule ({schedule.length} games) {generated && '✅ Saved'}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-low">
                    <tr>
                      {['Round', 'Home Team', 'Away Team', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {schedule.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-surface-lowest' : 'bg-surface-low'}>
                        <td className="px-4 py-3 font-bold text-primary text-sm">{row.round}</td>
                        <td className="px-4 py-3 text-on-surface text-sm">{row.home}</td>
                        <td className="px-4 py-3 text-on-surface text-sm">{row.away}</td>
                        <td className="px-4 py-3 text-on-surface-variant text-sm">{row.date.toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
