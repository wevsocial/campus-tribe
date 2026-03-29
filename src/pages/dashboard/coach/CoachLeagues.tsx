import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface League { id: string; name: string; sport: string | null; season: string | null; status: string; format: string | null; }

export default function CoachLeagues() {
  const { user, institutionId } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', sport: '', season: '', format: 'round_robin' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false })
      .then(({ data }) => { setLeagues(data ?? []); setLoading(false); });
  }, [institutionId]);

  const createLeague = async () => {
    if (!form.name.trim() || !institutionId) return;
    setCreating(true);
    const { data } = await supabase.from('ct_sports_leagues')
      .insert({ ...form, institution_id: institutionId, status: 'active' })
      .select('*').single();
    if (data) { setLeagues([data, ...leagues]); setForm({ name: '', sport: '', season: '', format: 'round_robin' }); }
    setCreating(false);
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
            <Card key={l.id} className="flex items-center justify-between">
              <div>
                <p className="font-jakarta font-bold text-on-surface">{l.name}</p>
                <p className="text-sm text-on-surface-variant">{l.sport} · {l.season} · {l.format}</p>
              </div>
              <Badge label={l.status} variant={l.status === 'active' ? 'success' : 'neutral'} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
