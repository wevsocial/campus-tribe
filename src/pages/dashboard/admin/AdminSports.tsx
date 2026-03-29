import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton, StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Download } from 'lucide-react';

interface League {
  id: string; name: string; sport: string | null; season: string | null; status: string; format: string | null;
}
interface Team {
  id: string; name: string; wins: number; losses: number; points: number; league_id: string;
}
interface TitleIXRow {
  id: string; name: string; sport: string | null; male: number; female: number; non_binary: number; unknown: number; total: number;
}

export default function AdminSports() {
  const { institutionId } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameCount, setGameCount] = useState(0);
  const [titleIX, setTitleIX] = useState<TitleIXRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sports_teams').select('*').eq('institution_id', institutionId).order('points', { ascending: false }),
      supabase.from('ct_sports_games').select('id', { count: 'exact' }).eq('institution_id', institutionId),
    ]).then(([l, t, g]) => {
      setLeagues(l.data ?? []);
      setTeams(t.data ?? []);
      setGameCount(g.count ?? 0);
    });

    // Title IX: join participants with users for gender
    fetchTitleIX(institutionId);
  }, [institutionId]);

  const fetchTitleIX = async (instId: string) => {
    const { data: leagues } = await supabase
      .from('ct_sports_leagues')
      .select('id, name, sport')
      .eq('institution_id', instId);

    if (!leagues) { setLoading(false); return; }

    const rows: TitleIXRow[] = [];
    for (const lg of leagues) {
      const { data: parts } = await supabase
        .from('ct_sport_participants')
        .select('user_id, ct_users!inner(gender)')
        .eq('league_id', lg.id);

      const genderList = (parts ?? []).map((p: any) => p.ct_users?.gender || null);
      rows.push({
        id: lg.id,
        name: lg.name,
        sport: lg.sport,
        male: genderList.filter((g: string | null) => g === 'male').length,
        female: genderList.filter((g: string | null) => g === 'female').length,
        non_binary: genderList.filter((g: string | null) => g === 'non_binary').length,
        unknown: genderList.filter((g: string | null) => !g || !['male','female','non_binary'].includes(g)).length,
        total: genderList.length,
      });
    }
    setTitleIX(rows);
    setLoading(false);
  };

  const fetchTitleIXFallback = async (instId: string) => {
    const { data: lgData } = await supabase.from('ct_sports_leagues').select('id, name, sport').eq('institution_id', instId);
    if (lgData) {
      setTitleIX(lgData.map(l => ({ id: l.id, name: l.name, sport: l.sport, male: 0, female: 0, non_binary: 0, unknown: 0, total: 0 })));
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['Sport / League', 'Male', 'Female', 'Non-binary', 'Unknown', 'Total'];
    const rows = titleIX.map(r => [
      `${r.name} (${r.sport || 'N/A'})`, r.male, r.female, r.non_binary, r.unknown, r.total
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'title-ix-report.csv';
    a.click();
  };

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton /></div>;

  const leagueTeams = selectedLeague ? teams.filter(t => t.league_id === selectedLeague) : teams;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Sports</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={leagues.length} label="Leagues" color="primary" />
        <StatCard value={teams.length} label="Teams" color="secondary" />
        <StatCard value={gameCount} label="Games" color="tertiary" />
      </div>

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Leagues</h2>
        {leagues.length === 0 ? <EmptyState message="No leagues yet." /> : (
          <div className="space-y-3">
            {leagues.map(l => (
              <Card key={l.id}
                className={`cursor-pointer transition-all ${selectedLeague === l.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedLeague(selectedLeague === l.id ? null : l.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-jakarta font-bold text-on-surface">{l.name}</p>
                    <p className="text-sm text-on-surface-variant">{l.sport} · {l.season} · {l.format}</p>
                  </div>
                  <Badge label={l.status} variant={l.status === 'active' ? 'success' : 'neutral'} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">
          Standings {selectedLeague ? '(filtered)' : '(all teams)'}
        </h2>
        {leagueTeams.length === 0 ? <EmptyState message="No teams yet." /> : (
          <Card padding="none">
            <table className="w-full">
              <thead className="bg-surface-low">
                <tr>
                  {['Team', 'W', 'L', 'Pts'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {leagueTeams.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-surface-lowest' : 'bg-surface-low'}>
                    <td className="px-4 py-3 font-jakarta font-bold text-on-surface">{t.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{t.wins}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{t.losses}</td>
                    <td className="px-4 py-3 font-jakarta font-bold text-primary">{t.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Title IX Participation Report */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-lexend font-bold text-on-surface">Title IX Participation Report</h2>
          <Button size="sm" variant="outline" onClick={exportCSV} className="flex items-center gap-2">
            <Download size={14} /> Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
          <table className="w-full">
            <thead className="bg-surface-low">
              <tr>
                {['Sport / League', 'Male', 'Female', 'Non-binary', 'Unknown', 'Total'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {titleIX.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-on-surface-variant font-jakarta text-sm">No leagues data</td></tr>
              ) : titleIX.map(r => (
                <tr key={r.id} className="bg-surface-lowest">
                  <td className="px-4 py-3 font-jakarta font-bold text-on-surface text-sm">{r.name} ({r.sport || 'N/A'})</td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm">{r.male}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm">{r.female}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm">{r.non_binary}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm">{r.unknown}</td>
                  <td className="px-4 py-3 font-jakarta font-bold text-on-surface text-sm">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-on-surface-variant font-jakarta mt-2">Gender data sourced from user profiles.</p>
      </div>
    </div>
  );
}
