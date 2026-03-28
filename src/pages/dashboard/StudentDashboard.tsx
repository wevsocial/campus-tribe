import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

export default function StudentDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [clubsRes, membershipsRes, eventsRes, rsvpsRes, wellbeingRes] = await Promise.all([
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(12),
      supabase.from('ct_club_members').select('*').eq('user_id', userId),
      supabase.from('ct_events').select('*').eq('institution_id', institutionId).order('start_time', { ascending: true }).limit(12),
      supabase.from('ct_event_rsvps').select('*').eq('user_id', userId),
      supabase.from('ct_wellbeing_checks').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
    ]);
    return { clubs: clubsRes.data ?? [], memberships: membershipsRes.data ?? [], events: eventsRes.data ?? [], rsvps: rsvpsRes.data ?? [], wellbeing: wellbeingRes.data ?? [] };
  }, { clubs: [], memberships: [], events: [], rsvps: [], wellbeing: [] } as any);

  const [mood, setMood] = useState('3');

  const joinClub = async (clubId: string) => {
    if (!user?.id || !institutionId) return;
    const exists = data.memberships.some((membership: any) => membership.club_id === clubId);
    if (exists) return;
    const { data: membership } = await supabase.from('ct_club_members').insert({ club_id: clubId, user_id: user.id, institution_id: institutionId, role: 'member', status: 'active' }).select('*').single();
    if (membership) setData((current: any) => ({ ...current, memberships: [...current.memberships, membership] }));
  };

  const rsvpEvent = async (eventId: string) => {
    if (!user?.id) return;
    const exists = data.rsvps.some((rsvp: any) => rsvp.event_id === eventId);
    if (exists) return;
    const { data: rsvp } = await supabase.from('ct_event_rsvps').insert({ event_id: eventId, user_id: user.id, status: 'going' }).select('*').single();
    if (rsvp) setData((current: any) => ({ ...current, rsvps: [...current.rsvps, rsvp] }));
  };

  const submitWellbeing = async () => {
    if (!user?.id || !institutionId) return;
    const { data: checkin } = await supabase.from('ct_wellbeing_checks').insert({ user_id: user.id, date: new Date().toISOString().slice(0, 10), mood: Number(mood), energy: Number(mood), stress: 6 - Number(mood) }).select('*').single();
    if (checkin) setData((current: any) => ({ ...current, wellbeing: [checkin, ...current.wellbeing] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Student Hub</h1>
          <p className="mt-2 text-white/80">Browse clubs, RSVP events, and log a wellbeing check-in with live Supabase data.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Clubs joined" value={data.memberships.length} color="primary" />
          <StatCard label="Event RSVPs" value={data.rsvps.length} color="secondary" />
          <StatCard label="Wellbeing logs" value={data.wellbeing.length} color="tertiary" />
          <StatCard label="Available clubs" value={data.clubs.length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Today’s wellbeing check-in</h2>
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full rounded-[1rem] bg-surface px-4 py-3 text-sm text-on-surface focus:outline-none">
              <option value="1">1 · Very low</option>
              <option value="2">2 · Low</option>
              <option value="3">3 · Okay</option>
              <option value="4">4 · Good</option>
              <option value="5">5 · Great</option>
            </select>
            <Button onClick={submitWellbeing} className="mt-3 w-full rounded-full">Save check-in</Button>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Club directory</h2>
            {data.clubs.length === 0 ? <p className="text-sm text-on-surface-variant">No clubs have been created yet. Check back after your institution publishes its first club.</p> : data.clubs.map((club: any) => {
              const joined = data.memberships.some((membership: any) => membership.club_id === club.id);
              return <div key={club.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-4"><div><p className="font-jakarta font-700 text-on-surface">{club.name}</p><p className="text-sm text-on-surface-variant">{club.category || 'General'} · {club.description || 'No description yet'}</p></div><Button onClick={() => joinClub(club.id)} disabled={joined} className="rounded-full">{joined ? 'Joined' : 'Join club'}</Button></div>;
            })}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Event feed</h2>
            {data.events.length === 0 ? <p className="text-sm text-on-surface-variant">No events yet. Your campus admin or club leaders need to publish the first event.</p> : data.events.map((event: any) => {
              const going = data.rsvps.some((rsvp: any) => rsvp.event_id === event.id);
              return <div key={event.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-4"><div><p className="font-jakarta font-700 text-on-surface">{event.title}</p><p className="text-sm text-on-surface-variant">{event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'} · {event.location || 'Campus'}</p></div><div className="flex items-center gap-3"><Badge label={event.status || 'upcoming'} variant="secondary" /><Button onClick={() => rsvpEvent(event.id)} disabled={going} className="rounded-full">{going ? 'Going' : 'RSVP'}</Button></div></div>;
            })}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Recent check-ins</h2>
            {data.wellbeing.length === 0 ? <p className="text-sm text-on-surface-variant">No wellbeing entries yet. Submit your first check-in to start your trend history.</p> : data.wellbeing.map((entry: any) => <div key={entry.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{entry.date}</p><Badge label={`Mood ${entry.mood}`} variant="tertiary" /></div>)}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
