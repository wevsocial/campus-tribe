import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Shuffle } from 'lucide-react';

interface League { id: string; name: string; sport: string | null; season: string | null; status: string; format: string | null; }
interface Team { id: string; name: string; league_id: string; }
interface ScheduledGame { round: number; homeTeamId: string; awayTeamId: string; homeTeamName: string; awayTeamName: string; }

function generateRoundRobin(teams: Team[]): ScheduledGame[] {
  const schedule: ScheduledGame[] = [];
  const n = teams.length;
  if (n < 2) return [];
  const rounds = n % 2 === 0 ? n - 1 : n;
  const teamList = [...teams];
  if (n % 2 !== 0) teamList.push({ id: 'bye', name: 'BYE', league_id: '' });
  for (let round = 0; round < rounds; round++) {
    const half = teamList.length / 2;
    for (let i = 0; i < half; i++) {
      const home = teamList[i];
      const away = teamList[teamList.length - 1 - i];
      if (home.id !== 'bye' && away.id !== 'bye') {
        schedule.push({ round: round + 1, homeTeamId: home.id, awayTeamId: away.id, homeTeamName: home.name, awayTeamName: away.name });
      }
    }
    const rotating = teamList.slice(1);
    rotating.unshift(rotating.pop()!);
    teamList.splice(1, rotating.length, ...rotating);
  }
  return schedule;
}

export default function CoachLeagues() {
  const { institutionId } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', sport: '', season: '', format: 'round_robin' });
  const [creating, setCreating] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [leagueTeams, setLeagueTeams] = useState<Team[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduledGame[]>([]);
  const [generating, setGenerating] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false })
      .then(({ data }) => { setLeagues(data ?? []); setLoading(false); });
  }, [institutionId]);

  const loadTeams = async (league: League) => {
    setSelectedLeague(league);
    setGeneratedSchedule([]);
    setScheduleGenerated(false);
    const { data } = await supabase.from('ct_sports_teams').select('*').eq('league_id', league.id);
    setLeagueTeams(data ?? []);
  };

  const createLeague = async () => {
    if (!form.name.trim() || !institutionId) return;
    setCreating(true);
    const { data } = await supabase.from('ct_sports_leagues')
      .insert({ ...form, institution_id: institutionId, status: 'active' }).select('*').single();
    if (data) { setLeagues([data, ...leagues]); setForm({ name: '', sport: '', season: '', format: 'round_robin' }); }
    setCreating(false);
  };

  const generateSchedule = async () => {
    if (!selectedLeague || leagueTeams.length < 2) return;
    setGenerating(true);
    const schedule = generateRoundRobin(leagueTeams);
    setGeneratedSchedule(schedule);

    // Insert games into DB
    const gameRows = schedule.map(g => ({
      institution_id: institutionId,
      league_id: selectedLeague.id,
      home_team_id: g.homeTeamId,
      away_team_id: g.awayTeamId,
      status: 'scheduled',
    }));
    await supabase.from('ct_sports_games').insert(gameRows);
    setGenerating(false);
    setScheduleGenerated(true);
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none';

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Leagues</h1>
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Create League</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="League name" className={inputCls} />
          <input value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} placeholder="Sport" className={inputCls} />
          <input value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} placeholder="Season (e.g. Fall 2025)" className={inputCls} />
          <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} className={inputCls}>
            <option value="round_robin">Round Robin</option>
            <option value="single_elimination">Single Elimination</option>
            <option value="double_elimination">Double Elimination</option>
          </select>
        </div>
        <Button onClick={createLeague} isLoading={creating} className="rounded-full">Create League</Button>
      </Card>

      {leagues.length === 0 ? <EmptyState icon="🏆" message="No leagues yet." /> : (
        <div className="space-y-3">
          {leagues.map(l => (
            <Card key={l.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{l.name}</p>
                  <p className="text-sm text-on-surface-variant">{l.sport} · {l.season} · {l.format}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={l.status} variant={l.status === 'active' ? 'success' : 'neutral'} />
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => loadTeams(l)}>
                    Schedule
                  </Button>
                </div>
              </div>

              {selectedLeague?.id === l.id && (
                <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-jakarta text-sm font-700 text-on-surface">{leagueTeams.length} teams in league</p>
                    {leagueTeams.length >= 2 && !scheduleGenerated && (
                      <Button onClick={generateSchedule} isLoading={generating} className="rounded-full flex items-center gap-2" size="sm">
                        <Shuffle size={14} />
                        Generate Round-Robin Schedule
                      </Button>
                    )}
                    {scheduleGenerated && <Badge label="Schedule Generated ✓" variant="success" />}
                  </div>

                  {leagueTeams.length < 2 && <p className="text-xs text-on-surface-variant font-jakarta">Add at least 2 teams to generate a schedule.</p>}

                  {generatedSchedule.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-jakarta text-xs font-700 text-on-surface-variant uppercase tracking-widest">Generated Schedule ({generatedSchedule.length} games)</p>
                      {generatedSchedule.map((g, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm font-jakarta">
                          <span className="bg-primary-container text-primary text-xs font-700 px-2 py-0.5 rounded-full">R{g.round}</span>
                          <span className="font-700 text-on-surface">{g.homeTeamName}</span>
                          <span className="text-on-surface-variant">vs</span>
                          <span className="font-700 text-on-surface">{g.awayTeamName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
