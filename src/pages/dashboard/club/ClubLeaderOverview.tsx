import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';

export default function ClubLeaderOverview() {
  const { user, institutionId } = useAuth();
  const [stats, setStats] = useState({ members: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [myClub, setMyClub] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    supabase.from('ct_clubs').select('id,name').eq('institution_id', institutionId).eq('created_by', user.id).limit(1).single()
      .then(({ data: club }) => {
        if (!club) { setLoading(false); return; }
        setMyClub(club);
        Promise.all([
          supabase.from('ct_club_members').select('id', { count: 'exact' }).eq('club_id', club.id),
          supabase.from('ct_events').select('id', { count: 'exact' }).eq('institution_id', institutionId),
        ]).then(([mem, ev]) => {
          setStats({ members: mem.count ?? 0, events: ev.count ?? 0 });
          setLoading(false);
        });
      });
  }, [institutionId, user?.id]);

  if (loading) return <div className="space-y-6"><h1 className="font-lexend text-2xl font-extrabold text-on-surface">Club Overview</h1><StatSkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">{myClub?.name || 'Club'} Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard value={stats.members} label="Members" icon="group" color="primary" />
        <StatCard value={stats.events} label="Events" icon="event" color="secondary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Members', href: '/dashboard/club/members', emoji: '👥' },
          { label: 'Events', href: '/dashboard/club/events', emoji: '📅' },
          { label: 'Budget', href: '/dashboard/club/budget', emoji: '💰' },
        ].map(l => (
          <a key={l.href} href={l.href} className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-primary-container transition-colors group">
            <span className="text-2xl">{l.emoji}</span>
            <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
