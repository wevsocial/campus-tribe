import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface League { id: string; name: string; }
interface Team { id: string; name: string; league_id: string; wins: number; losses: number; points: number; }

export default function CoachTeams() {
  const { institutionId } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_sports_leagues').select('id,name').eq('institution_id', institutionId),
      supabase.from('ct_sports_teams').select('*').eq('institution_id', institutionId).order('points', { ascending: false }),
    ]).then(([l, t]) => {
      setLeagues(l.data ?? []);
      setTeams(t.data ?? []);
      if ((l.data ?? []).length > 0) setSelectedLeague((l.data ?? [])[0].id);
      setLoading(false);
    });
  }, [institutionId]);

  const createTeam = async () => {
    if (!newName.trim() || !institutionId || !selectedLeague) return;
    const { data } = await supabase.from('ct_sports_teams')
      .insert({ name: newName, league_id: selectedLeague, institution_id: institutionId, wins: 0, losses: 0, points: 0 })
      .select('*').single();
    if (data) { setTeams([...teams, data]); setNewName(''); }
  };

  const inputCls = 'px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none';

  if (loading) return <LoadingSkeleton />;

  const filteredTeams = selectedLeague ? teams.filter(t => t.league_id === selectedLeague) : teams;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Teams</h1>
      {leagues.length > 0 && (
        <Card>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Add Team</h2>
          <div className="flex gap-3">
            <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} className={inputCls}>
              {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Team name" className={`${inputCls} flex-1`} />
            <Button onClick={createTeam} className="rounded-full">Add</Button>
          </div>
        </Card>
      )}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedLeague('')}
          className={`px-3 py-1.5 rounded-full font-jakarta text-sm font-bold transition-colors ${!selectedLeague ? 'bg-primary text-white' : 'bg-surface-lowest text-on-surface-variant hover:text-on-surface'}`}>
          All
        </button>
        {leagues.map(l => (
          <button key={l.id} onClick={() => setSelectedLeague(l.id)}
            className={`px-3 py-1.5 rounded-full font-jakarta text-sm font-bold transition-colors ${selectedLeague === l.id ? 'bg-primary text-white' : 'bg-surface-lowest text-on-surface-variant hover:text-on-surface'}`}>
            {l.name}
          </button>
        ))}
      </div>
      {filteredTeams.length === 0 ? <EmptyState message="No teams yet. Add one above." /> : (
        <Card padding="none">
          <table className="w-full">
            <thead className="bg-surface-low"><tr>{['Team','W','L','Pts'].map(h=><th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredTeams.map(t => (
                <tr key={t.id}>
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
  );
}
