import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';

interface Stats {
  clubs: number;
  events: number;
  users: number;
  surveys: number;
  venues: number;
  pendingClubs: number;
  pendingBookings: number;
  activeLeagues: number;
}

export default function AdminOverview() {
  const { institutionId } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    const id = institutionId;

    Promise.all([
      supabase.from('ct_clubs').select('id, is_approved', { count: 'exact' }).eq('institution_id', id),
      supabase.from('ct_events').select('id', { count: 'exact' }).eq('institution_id', id),
      supabase.from('ct_users').select('id', { count: 'exact' }).eq('institution_id', id),
      supabase.from('ct_surveys').select('id', { count: 'exact' }).eq('institution_id', id),
      supabase.from('ct_venues').select('id', { count: 'exact' }).eq('institution_id', id),
      supabase.from('ct_clubs').select('id', { count: 'exact' }).eq('institution_id', id).eq('is_approved', false),
      supabase.from('ct_venue_bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('ct_sports_leagues').select('id', { count: 'exact' }).eq('institution_id', id).eq('status', 'active'),
    ]).then(([clubs, events, users, surveys, venues, pendingClubs, pendingBookings, leagues]) => {
      setStats({
        clubs: clubs.count ?? 0,
        events: events.count ?? 0,
        users: users.count ?? 0,
        surveys: surveys.count ?? 0,
        venues: venues.count ?? 0,
        pendingClubs: pendingClubs.count ?? 0,
        pendingBookings: pendingBookings.count ?? 0,
        activeLeagues: leagues.count ?? 0,
      });
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Overview</h1>
      <StatSkeleton />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats!.users} label="Total Users" icon="people" color="primary" />
        <StatCard value={stats!.clubs} label="Clubs" icon="groups" color="secondary" />
        <StatCard value={stats!.events} label="Events" icon="event" color="tertiary" />
        <StatCard value={stats!.surveys} label="Surveys" icon="assignment" color="neutral" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats!.pendingClubs} label="Clubs Pending" icon="pending" color="danger" />
        <StatCard value={stats!.pendingBookings} label="Bookings Pending" icon="schedule" color="secondary" />
        <StatCard value={stats!.activeLeagues} label="Active Leagues" icon="emoji_events" color="tertiary" />
        <StatCard value={stats!.venues} label="Venues" icon="place" color="neutral" />
      </div>
      <div className="bg-primary-container rounded-2xl p-6">
        <h2 className="font-lexend font-bold text-primary text-lg mb-2">Admin Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Approve Clubs', path: '/dashboard/admin/clubs', emoji: '🏛️' },
            { label: 'Manage Events', path: '/dashboard/admin/events', emoji: '📅' },
            { label: 'Venue Queue', path: '/dashboard/admin/venues', emoji: '🏟️' },
            { label: 'Sports', path: '/dashboard/admin/sports', emoji: '🏆' },
            { label: 'Reports', path: '/dashboard/admin/reports', emoji: '📊' },
            { label: 'Settings', path: '/dashboard/admin/settings', emoji: '⚙️' },
          ].map(link => (
            <a key={link.path} href={link.path}
              className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-white transition-colors group"
            >
              <span className="text-2xl">{link.emoji}</span>
              <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
