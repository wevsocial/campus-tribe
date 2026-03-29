import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Club {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  is_approved: boolean;
  status: string;
  created_at: string;
}

export default function AdminClubs() {
  const { user, institutionId } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClubName, setNewClubName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_clubs').select('*').eq('institution_id', institutionId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setClubs(data ?? []); setLoading(false); });
  }, [institutionId]);

  const approveClub = async (id: string) => {
    await supabase.from('ct_clubs').update({ is_approved: true, status: 'active' }).eq('id', id);
    setClubs(clubs.map(c => c.id === id ? { ...c, is_approved: true, status: 'active' } : c));
  };

  const rejectClub = async (id: string) => {
    await supabase.from('ct_clubs').update({ status: 'rejected' }).eq('id', id);
    setClubs(clubs.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
  };

  const createClub = async () => {
    if (!newClubName.trim() || !institutionId || !user?.id) return;
    setCreating(true);
    const { data } = await supabase.from('ct_clubs')
      .insert({ name: newClubName, institution_id: institutionId, created_by: user.id, status: 'active', is_approved: true })
      .select('*').single();
    if (data) { setClubs([data, ...clubs]); setNewClubName(''); }
    setCreating(false);
  };

  if (loading) return <LoadingSkeleton />;

  const pending = clubs.filter(c => !c.is_approved && c.status !== 'rejected');
  const active = clubs.filter(c => c.is_approved);
  const rejected = clubs.filter(c => c.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Clubs</h1>
        <div className="flex gap-2">
          <Badge label={`${active.length} active`} variant="success" />
          {pending.length > 0 && <Badge label={`${pending.length} pending`} variant="warning" />}
        </div>
      </div>

      {/* Create club */}
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Create New Club</h2>
        <div className="flex gap-3">
          <input
            value={newClubName}
            onChange={e => setNewClubName(e.target.value)}
            placeholder="Club name..."
            onKeyDown={e => e.key === 'Enter' && createClub()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button onClick={createClub} isLoading={creating} className="rounded-full">Create</Button>
        </div>
      </Card>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Pending Approval ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(club => (
              <Card key={club.id} className="flex items-center justify-between">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{club.name}</p>
                  <p className="text-sm text-on-surface-variant">{club.category || 'General'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label="Pending" variant="warning" />
                  <Button size="sm" onClick={() => approveClub(club.id)} className="rounded-full">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectClub(club.id)} className="rounded-full">Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active clubs */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Active Clubs</h2>
        {active.length === 0 ? (
          <EmptyState icon="🏛️" message="No active clubs yet. Create one above!" />
        ) : (
          <div className="space-y-3">
            {active.map(club => (
              <Card key={club.id} className="flex items-center justify-between">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{club.name}</p>
                  <p className="text-sm text-on-surface-variant">{club.category || 'General'}</p>
                </div>
                <Badge label="Active" variant="success" />
              </Card>
            ))}
          </div>
        )}
      </div>

      {rejected.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Rejected ({rejected.length})</h2>
          <div className="space-y-3">
            {rejected.map(club => (
              <Card key={club.id} className="flex items-center justify-between">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{club.name}</p>
                  <p className="text-sm text-on-surface-variant">{club.category || 'General'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label="Rejected" variant="danger" />
                  <Button size="sm" variant="outline" onClick={() => approveClub(club.id)} className="rounded-full">Re-approve</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
