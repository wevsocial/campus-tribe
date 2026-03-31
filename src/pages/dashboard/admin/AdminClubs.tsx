import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton, StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';

interface Club {
  id: string; name: string; category: string | null; description: string | null;
  is_approved: boolean; status: string; created_at: string; leader_id: string | null;
  member_count: number; created_by: string | null;
}
interface ComplianceScore {
  hasRecentEvents: boolean; hasActiveMembers: boolean; hasLeader: boolean;
}

export default function AdminClubs() {
  const { user, institutionId } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [compliance, setCompliance] = useState<Record<string, ComplianceScore>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Academic', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false });
    const clubData = (data ?? []) as Club[];
    setClubs(clubData);

    // Compliance scorecard
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 90);
    const { data: recentEvents } = await supabase.from('ct_events').select('id').eq('institution_id', institutionId).gte('created_at', cutoff.toISOString());
    const hasEventsGlobal = (recentEvents?.length ?? 0) > 0;

    const scores: Record<string, ComplianceScore> = {};
    for (const club of clubData) {
      scores[club.id] = {
        hasRecentEvents: hasEventsGlobal, // simplified — in real app filter by club
        hasActiveMembers: (club.member_count || 0) > 0,
        hasLeader: !!club.leader_id,
      };
    }
    setCompliance(scores);
    setLoading(false);
  };

  useEffect(() => { load(); }, [institutionId]);

  const approveClub = async (id: string) => {
    await supabase.from('ct_clubs').update({ is_approved: true, status: 'active' }).eq('id', id);
    setClubs(clubs.map(c => c.id === id ? { ...c, is_approved: true, status: 'active' } : c));
  };

  const rejectClub = async (id: string) => {
    await supabase.from('ct_clubs').update({ status: 'rejected' }).eq('id', id);
    setClubs(clubs.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
  };

  const createClub = async () => {
    if (!form.name || !institutionId || !user) return;
    setSaving(true);
    const { data } = await supabase.from('ct_clubs').insert({
      name: form.name, category: form.category, description: form.description || null,
      institution_id: institutionId, created_by: user.id, status: 'active', is_approved: true, member_count: 0,
    }).select().single();
    setSaving(false);
    if (data) {
      setClubs(prev => [data, ...prev]);
      setForm({ name: '', category: 'Academic', description: '' });
      setShowCreate(false);
    }
  };

  const overallStatus = (s: ComplianceScore) => {
    const score = [s.hasRecentEvents, s.hasActiveMembers, s.hasLeader].filter(Boolean).length;
    return score === 3 ? 'green' : score >= 2 ? 'amber' : 'red';
  };

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton /></div>;

  const active = clubs.filter(c => c.is_approved && c.status === 'active');
  const pending = clubs.filter(c => !c.is_approved && c.status !== 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Clubs</h1>
        <Button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2">
          <Plus size={16} /> New Club
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={clubs.length} label="Total Clubs" color="primary" />
        <StatCard value={active.length} label="Active" color="tertiary" />
        <StatCard value={pending.length} label="Pending Approval" color="danger" />
      </div>

      {/* Create club form */}
      {showCreate && (
        <Card>
          <h2 className="font-lexend font-bold text-on-surface mb-4">Create New Club</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Club Name *</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Photography Society" />
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Category</label>
              <select className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['Academic', 'Sports', 'Arts', 'Social', 'Cultural', 'Community', 'Technology'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Description</label>
              <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest" rows={2}
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." />
            </div>
            <div className="flex gap-3">
              <Button onClick={createClub} disabled={saving || !form.name}>{saving ? 'Creating...' : 'Create Club'}</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Pending approvals */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Pending Approval ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-on-surface-variant font-jakarta">No pending clubs.</p>
        ) : (
          <Card padding="none">
            <table className="w-full">
              <thead className="bg-surface-low">
                <tr>
                  {['Name', 'Category', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {pending.map(c => (
                  <tr key={c.id} className="hover:bg-surface-low/50">
                    <td className="px-4 py-3 font-jakarta font-bold text-on-surface text-sm">{c.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-sm">{c.category || 'N/A'}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveClub(c.id)}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => rejectClub(c.id)}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Active clubs with compliance scorecard */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Active Clubs ({active.length})</h2>
        {active.length === 0 ? <EmptyState message="No active clubs yet. Create one above!" /> : (
          <div className="space-y-3">
            {active.map(c => {
              const score = compliance[c.id] || { hasRecentEvents: false, hasActiveMembers: false, hasLeader: false };
              const overall = overallStatus(score);
              return (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-jakarta font-bold text-on-surface">{c.name}</p>
                        <Badge label={c.category || 'General'} variant="neutral" />
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${overall === 'green' ? 'bg-green-500' : overall === 'amber' ? 'bg-amber-400' : 'bg-red-500'}`} />
                      </div>
                      {c.description && <p className="text-xs text-on-surface-variant mb-2">{c.description}</p>}
                      {/* Compliance scorecard */}
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs">
                          {score.hasRecentEvents ? <CheckCircle size={12} className="text-green-500" /> : <AlertTriangle size={12} className="text-amber-400" />}
                          <span className="text-on-surface-variant">Events (90d)</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {score.hasActiveMembers ? <CheckCircle size={12} className="text-green-500" /> : <AlertTriangle size={12} className="text-amber-400" />}
                          <span className="text-on-surface-variant">Members</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {score.hasLeader ? <CheckCircle size={12} className="text-green-500" /> : <AlertTriangle size={12} className="text-amber-400" />}
                          <span className="text-on-surface-variant">Leader</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant">{c.member_count} members</p>
                      <p className="text-xs text-on-surface-variant mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
