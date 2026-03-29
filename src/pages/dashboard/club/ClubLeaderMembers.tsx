import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Member { id: string; user_id: string; role: string; status: string; user?: { full_name: string; email: string } | null; }

export default function ClubLeaderMembers() {
  const { user, institutionId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState<string | null>(null);

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    supabase.from('ct_clubs').select('id').eq('institution_id', institutionId).eq('created_by', user.id).limit(1).single()
      .then(({ data: club }) => {
        if (!club) { setLoading(false); return; }
        setClubId(club.id);
        supabase.from('ct_club_members').select('*, user:ct_users(full_name,email)').eq('club_id', club.id)
          .then(({ data }) => { setMembers((data as Member[]) ?? []); setLoading(false); });
      });
  }, [institutionId, user?.id]);

  const removeM = async (id: string) => {
    await supabase.from('ct_club_members').delete().eq('id', id);
    setMembers(members.filter(m => m.id !== id));
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Members</h1>
        <span className="font-jakarta text-sm text-on-surface-variant">{members.length} members</span>
      </div>
      {!clubId ? (
        <Card variant="primary-tinted"><p className="font-jakarta text-on-surface">You don't own a club yet. Contact admin to have one assigned.</p></Card>
      ) : members.length === 0 ? (
        <EmptyState icon="👥" message="No members yet." />
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <Card key={m.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="font-jakarta font-bold text-primary text-xs">{(m.user?.full_name || '?').slice(0,2).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-jakarta font-bold text-on-surface text-sm truncate">{m.user?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-on-surface-variant truncate">{m.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={m.role} variant={m.role === 'leader' ? 'primary' : 'neutral'} />
                {m.role !== 'leader' && <Button size="sm" variant="outline" onClick={() => removeM(m.id)} className="rounded-full">Remove</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
