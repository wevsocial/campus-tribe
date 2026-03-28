import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

export default function ClubLeaderDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [clubsRes, membersRes, eventsRes, bookingsRes] = await Promise.all([
      supabase.from('ct_clubs').select('*').eq('leader_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_club_members').select('id, club_id, user_id, role, status').eq('institution_id', institutionId),
      supabase.from('ct_events').select('id, club_id, title, status, start_time').eq('created_by', userId).order('created_at', { ascending: false }),
      supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id').eq('booked_by', userId).order('created_at', { ascending: false }),
    ]);
    return { clubs: clubsRes.data ?? [], members: membersRes.data ?? [], events: eventsRes.data ?? [], bookings: bookingsRes.data ?? [] };
  }, { clubs: [], members: [], events: [], bookings: [] } as any);

  const [clubName, setClubName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const firstClub = data.clubs[0];

  const createClub = async () => {
    if (!user?.id || !institutionId || !clubName.trim()) return;
    const { data: club } = await supabase.from('ct_clubs').insert({ institution_id: institutionId, leader_id: user.id, created_by: user.id, name: clubName.trim(), is_approved: false, status: 'active' }).select('*').single();
    if (club) setData((current: any) => ({ ...current, clubs: [club, ...current.clubs] }));
    setClubName('');
  };

  const createEvent = async () => {
    if (!user?.id || !institutionId || !firstClub?.id || !eventTitle.trim()) return;
    const payload = { institution_id: institutionId, club_id: firstClub.id, title: eventTitle.trim(), status: 'upcoming', created_by: user.id, start_time: eventDate || null };
    const { data: event } = await supabase.from('ct_events').insert(payload).select('*').single();
    if (event) setData((current: any) => ({ ...current, events: [event, ...current.events] }));
    setEventTitle(''); setEventDate('');
  };

  const createBooking = async () => {
    if (!user?.id || !bookingPurpose.trim() || !bookingStart || !bookingEnd) return;
    const { data: booking } = await supabase.from('ct_venue_bookings').insert({ booked_by: user.id, purpose: bookingPurpose.trim(), start_time: bookingStart, end_time: bookingEnd, status: 'pending' }).select('*').single();
    if (booking) setData((current: any) => ({ ...current, bookings: [booking, ...current.bookings] }));
    setBookingPurpose(''); setBookingStart(''); setBookingEnd('');
  };

  const memberCount = firstClub ? data.members.filter((member: any) => member.club_id === firstClub.id).length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Club Leader Workspace</h1>
          <p className="mt-2 text-white/80">Create your club, publish events, manage members, and request venue bookings with real DB-backed flows.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create club profile</h2>
            <div className="space-y-3">
              <Input label="Club name" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Robotics Club" />
              <Button onClick={createClub} className="w-full rounded-full">Create club</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create first event</h2>
            <div className="space-y-3">
              <Input label="Event title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Welcome mixer" />
              <Input label="Start date/time" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <Button onClick={createEvent} className="w-full rounded-full" disabled={!firstClub}>Create event</Button>
              {!firstClub && <p className="text-xs text-on-surface-variant">Create a club first to attach events.</p>}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Request venue booking</h2>
            <div className="space-y-3">
              <Input label="Purpose" value={bookingPurpose} onChange={(e) => setBookingPurpose(e.target.value)} placeholder="Club workshop" />
              <Input label="Start" type="datetime-local" value={bookingStart} onChange={(e) => setBookingStart(e.target.value)} />
              <Input label="End" type="datetime-local" value={bookingEnd} onChange={(e) => setBookingEnd(e.target.value)} />
              <Button onClick={createBooking} className="w-full rounded-full">Request booking</Button>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">My Clubs</h2>
            {data.clubs.length === 0 ? <p className="text-sm text-on-surface-variant">No clubs yet. Create your first club profile to start onboarding members.</p> : data.clubs.map((club: any) => (
              <div key={club.id} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-jakarta font-700 text-on-surface">{club.name}</p>
                  <Badge label={club.is_approved ? 'approved' : 'pending approval'} variant={club.is_approved ? 'tertiary' : 'secondary'} />
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">Members: {club.id === firstClub?.id ? memberCount : data.members.filter((member: any) => member.club_id === club.id).length}</p>
              </div>
            ))}
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Events & Bookings</h2>
            {data.events.length === 0 && data.bookings.length === 0 ? <p className="text-sm text-on-surface-variant">No club operations yet. Create an event or request a venue booking.</p> : (
              <div className="space-y-3">
                {data.events.map((event: any) => <div key={event.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">{event.title}</p><p className="text-sm text-on-surface-variant">{event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'}</p></div><Badge label={event.status} variant="primary" /></div>)}
                {data.bookings.map((booking: any) => <div key={booking.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">{booking.purpose}</p><p className="text-sm text-on-surface-variant">{new Date(booking.start_time).toLocaleString()}</p></div><Badge label={booking.status} variant="secondary" /></div>)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
