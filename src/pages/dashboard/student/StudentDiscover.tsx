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
}

export default function StudentDiscover() {
  const { user, institutionId } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubIds, setMyClubIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    Promise.all([
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).eq('is_approved', true).order('name'),
      supabase.from('ct_club_members').select('club_id').eq('user_id', user.id),
    ]).then(([cl, mem]) => {
      setClubs(cl.data ?? []);
      setMyClubIds(new Set((mem.data ?? []).map((m: { club_id: string }) => m.club_id)));
      setLoading(false);
    });
  }, [institutionId, user?.id]);

  const joinClub = async (clubId: string) => {
    if (!user?.id || !institutionId) return;
    await supabase.from('ct_club_members').insert({ club_id: clubId, user_id: user.id, institution_id: institutionId, role: 'member', status: 'active' });
    setMyClubIds(new Set([...myClubIds, clubId]));
  };

  const leaveClub = async (clubId: string) => {
    if (!user?.id) return;
    await supabase.from('ct_club_members').delete().eq('club_id', clubId).eq('user_id', user.id);
    const next = new Set(myClubIds);
    next.delete(clubId);
    setMyClubIds(next);
  };

  const filtered = clubs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Discover Clubs</h1>
        <Badge label={`${myClubIds.size} joined`} variant="primary" />
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search clubs..."
        className="w-full px-4 py-2.5 rounded-xl bg-surface-lowest border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {filtered.length === 0 ? (
        <EmptyState message={search ? `No clubs matching "${search}"` : 'No clubs available yet.'} />
      ) : (
        <div className="space-y-3">
          {filtered.map(club => {
            const isMember = myClubIds.has(club.id);
            return (
              <Card key={club.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 bg-primary-container text-primary rounded-full font-jakarta">{club.category ?? 'Club'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-jakarta font-bold text-on-surface truncate">{club.name}</p>
                    <p className="text-sm text-on-surface-variant">{club.category || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isMember && <Badge label="Joined" variant="success" />}
                  <Button
                    size="sm"
                    variant={isMember ? 'outline' : 'primary'}
                    onClick={() => isMember ? leaveClub(club.id) : joinClub(club.id)}
                    className="rounded-full"
                  >
                    {isMember ? 'Leave' : 'Join'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
