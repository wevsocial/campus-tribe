import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';

export default function StudentRepOverview() {
  const { institutionId } = useAuth();
  const [stats, setStats] = useState({ venues: 0, events: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_venues').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_events').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_announcements').select('id', { count: 'exact' }).eq('institution_id', institutionId),
    ]).then(([v, e, a]) => {
      setStats({ venues: v.count ?? 0, events: e.count ?? 0, announcements: a.count ?? 0 });
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><h1 className="font-lexend text-2xl font-extrabold text-on-surface">Student Rep</h1><StatSkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Student Rep Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={stats.venues} label="Venues" color="primary" />
        <StatCard value={stats.events} label="Events" color="secondary" />
        <StatCard value={stats.announcements} label="Announcements" color="tertiary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Book Venue', href: '/dashboard/student-rep/venues', emoji: '🏟️' },
          { label: 'Create Event', href: '/dashboard/student-rep/events', emoji: 'calendar' },
          { label: 'Announce', href: '/dashboard/student-rep/announcements', emoji: '📢' },
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
