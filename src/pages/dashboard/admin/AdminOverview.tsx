import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import { AlertTriangle, Building2, Calendar, MapPin, Trophy, BarChart2, Settings } from 'lucide-react';

interface Stats {
  clubs: number; events: number; users: number; surveys: number;
  venues: number; pendingClubs: number; pendingBookings: number; activeLeagues: number;
}

interface AtRiskStudent { id: string; full_name: string; email: string; riskScore: number; reason: string; }

export default function AdminOverview() {
  const { institutionId } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [atRisk, setAtRisk] = useState<AtRiskStudent[]>([]);
  const [atRiskLoading, setAtRiskLoading] = useState(true);

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
        clubs: clubs.count ?? 0, events: events.count ?? 0, users: users.count ?? 0,
        surveys: surveys.count ?? 0, venues: venues.count ?? 0,
        pendingClubs: pendingClubs.count ?? 0, pendingBookings: pendingBookings.count ?? 0,
        activeLeagues: leagues.count ?? 0,
      });
      setLoading(false);
    });

    // At-risk student detection (Module 13)
    Promise.all([
      supabase.from('ct_users').select('id,full_name,email').eq('institution_id', id).eq('role', 'student'),
      supabase.from('ct_wellbeing_checks').select('user_id,mood'),
      supabase.from('ct_club_members').select('user_id'),
      supabase.from('ct_event_rsvps').select('user_id'),
    ]).then(([students, wellbeing, clubMembers, rsvps]) => {
      const wellbeingByUser: Record<string, number[]> = {};
      (wellbeing.data ?? []).forEach((w: { user_id: string; mood: number }) => {
        if (!wellbeingByUser[w.user_id]) wellbeingByUser[w.user_id] = [];
        wellbeingByUser[w.user_id].push(w.mood);
      });
      const clubUserIds = new Set((clubMembers.data ?? []).map((m: { user_id: string }) => m.user_id));
      const rsvpUserIds = new Set((rsvps.data ?? []).map((r: { user_id: string }) => r.user_id));

      const risks: AtRiskStudent[] = [];
      (students.data ?? []).forEach((u: { id: string; full_name: string; email: string }) => {
        const moods = wellbeingByUser[u.id] ?? [];
        const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
        const hasClub = clubUserIds.has(u.id);
        const hasRsvp = rsvpUserIds.has(u.id);

        const reasons: string[] = [];
        if (avgMood !== null && avgMood < 3) reasons.push(`low wellbeing (${avgMood.toFixed(1)})`);
        if (!hasClub) reasons.push('no club');
        if (!hasRsvp) reasons.push('no event RSVPs');

        const riskScore = (avgMood !== null && avgMood < 3 ? 2 : 0) + (!hasClub ? 1 : 0) + (!hasRsvp ? 1 : 0);
        if (riskScore >= 2) {
          risks.push({ id: u.id, full_name: u.full_name, email: u.email, riskScore, reason: reasons.join(', ') });
        }
      });
      risks.sort((a, b) => b.riskScore - a.riskScore);
      setAtRisk(risks.slice(0, 10));
      setAtRiskLoading(false);
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
        <StatCard value={stats!.users} label="Total Users" color="primary" />
        <StatCard value={stats!.clubs} label="Clubs" color="secondary" />
        <StatCard value={stats!.events} label="Events" color="tertiary" />
        <StatCard value={stats!.surveys} label="Surveys" color="neutral" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats!.pendingClubs} label="Clubs Pending" color="danger" />
        <StatCard value={stats!.pendingBookings} label="Bookings Pending" color="secondary" />
        <StatCard value={stats!.activeLeagues} label="Active Leagues" color="tertiary" />
        <StatCard value={stats!.venues} label="Venues" color="neutral" />
      </div>

      {/* At-Risk Students — Module 13 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="font-lexend font-bold text-on-surface">At-Risk Students</h2>
          <Badge label={`${atRisk.length} flagged`} variant={atRisk.length > 0 ? 'warning' : 'success'} />
        </div>
        {atRiskLoading ? (
          <p className="text-sm text-on-surface-variant font-jakarta">Analyzing…</p>
        ) : atRisk.length === 0 ? (
          <p className="text-sm text-on-surface-variant font-jakarta">No at-risk students detected. All students show healthy engagement.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-on-surface-variant font-jakarta mb-3">Rule-based detection: low wellbeing avg (&lt;3) + no club + no event RSVPs</p>
            {atRisk.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <div>
                  <p className="font-jakarta font-700 text-on-surface text-sm">{s.full_name}</p>
                  <p className="text-xs text-on-surface-variant">{s.email} · {s.reason}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: s.riskScore }).map((_, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="bg-primary-container rounded-2xl p-6">
        <h2 className="font-lexend font-bold text-primary text-lg mb-2">Admin Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Approve Clubs', path: '/dashboard/admin/clubs', Icon: Building2 },
            { label: 'Manage Events', path: '/dashboard/admin/events', Icon: Calendar },
            { label: 'Venue Queue', path: '/dashboard/admin/venues', Icon: MapPin },
            { label: 'Sports', path: '/dashboard/admin/sports', Icon: Trophy },
            { label: 'Reports', path: '/dashboard/admin/reports', Icon: BarChart2 },
            { label: 'Settings', path: '/dashboard/admin/settings', Icon: Settings },
          ].map(link => (
            <a key={link.path} href={link.path} className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-white transition-colors group">
              <link.Icon size={18} className="text-primary flex-shrink-0" />
              <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
