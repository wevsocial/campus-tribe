import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

type Venue = { id: string; name: string; building: string | null; capacity: number | null };
type Booking = {
  id: string;
  purpose: string | null;
  status: string;
  start_time: string;
  end_time: string;
  venue_id: string | null;
  notes: string | null;
  approved_by?: string | null;
  ct_venues?: { name: string | null; building: string | null } | null;
};

function normalizeVenueRelation(input: any) {
  if (Array.isArray(input)) return input[0] || null;
  return input || null;
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return new Date(startA).getTime() < new Date(endB).getTime() && new Date(endA).getTime() > new Date(startB).getTime();
}

export default function ClubLeaderDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [clubsRes, membersRes, eventsRes, bookingsRes, venuesRes, venueBookingsRes] = await Promise.all([
      supabase.from('ct_clubs').select('*').eq('leader_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_club_members').select('id, club_id, user_id, role, status').eq('institution_id', institutionId),
      supabase.from('ct_events').select('id, club_id, title, status, start_time').eq('created_by', userId).order('created_at', { ascending: false }),
      supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, approved_by, ct_venues(name, building)').eq('booked_by', userId).order('created_at', { ascending: false }),
      supabase.from('ct_venues').select('id, name, building, capacity').eq('institution_id', institutionId).eq('is_bookable', true).order('name'),
      supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, approved_by, ct_venues(name, building)').order('start_time', { ascending: true }),
    ]);
    return {
      clubs: clubsRes.data ?? [],
      members: membersRes.data ?? [],
      events: eventsRes.data ?? [],
      bookings: (bookingsRes.data ?? []).map((booking: any) => ({ ...booking, ct_venues: normalizeVenueRelation(booking.ct_venues) })) as Booking[],
      venues: (venuesRes.data ?? []) as Venue[],
      venueBookings: (venueBookingsRes.data ?? []).map((booking: any) => ({ ...booking, ct_venues: normalizeVenueRelation(booking.ct_venues) })) as Booking[],
    };
  }, { clubs: [], members: [], events: [], bookings: [], venues: [], venueBookings: [] } as any);

  const [clubName, setClubName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingVenueId, setBookingVenueId] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [message, setMessage] = useState('');
  const firstClub = data.clubs[0];

  const detectedConflicts = useMemo(() => {
    if (!bookingVenueId || !bookingStart || !bookingEnd) return [];
    return data.venueBookings.filter((booking: Booking) => booking.venue_id === bookingVenueId && booking.status !== 'rejected' && booking.status !== 'cancelled' && overlaps(bookingStart, bookingEnd, booking.start_time, booking.end_time));
  }, [bookingVenueId, bookingStart, bookingEnd, data.venueBookings]);

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
    if (!user?.id || !bookingPurpose.trim() || !bookingStart || !bookingEnd || !bookingVenueId) return;
    setMessage('');
    const { data: booking } = await supabase.from('ct_venue_bookings').insert({ booked_by: user.id, venue_id: bookingVenueId, purpose: bookingPurpose.trim(), start_time: bookingStart, end_time: bookingEnd, status: 'pending', notes: bookingNotes || null }).select('id, purpose, status, start_time, end_time, venue_id, notes, approved_by, ct_venues(name, building)').single();
    if (booking) {
      setData((current: any) => ({ ...current, bookings: [booking, ...current.bookings], venueBookings: [...current.venueBookings, booking] }));
      setMessage(detectedConflicts.length ? `Booking submitted with ${detectedConflicts.length} detected conflict(s). Awaiting review.` : 'Booking request submitted.');
    }
    setBookingPurpose(''); setBookingStart(''); setBookingEnd(''); setBookingVenueId(''); setBookingNotes('');
  };

  const memberCount = firstClub ? data.members.filter((member: any) => member.club_id === firstClub.id).length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Club Leader Workspace</h1>
          <p className="mt-2 text-white/80">Create your club, publish events, and request venue bookings with live conflict detection and approval visibility.</p>
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
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create event</h2>
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
              <label className="block text-sm font-jakarta font-700 text-on-surface">Venue</label>
              <select value={bookingVenueId} onChange={(e) => setBookingVenueId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select venue</option>
                {data.venues.map((venue: Venue) => <option key={venue.id} value={venue.id}>{venue.name}{venue.building ? ` · ${venue.building}` : ''}</option>)}
              </select>
              <Input label="Purpose" value={bookingPurpose} onChange={(e) => setBookingPurpose(e.target.value)} placeholder="Club workshop" />
              <Input label="Start" type="datetime-local" value={bookingStart} onChange={(e) => setBookingStart(e.target.value)} />
              <Input label="End" type="datetime-local" value={bookingEnd} onChange={(e) => setBookingEnd(e.target.value)} />
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Submission notes</label>
                <textarea value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm text-on-surface" placeholder="Setup needs, approval context, etc." />
              </div>
              {detectedConflicts.length > 0 && (
                <div className="rounded-[1rem] bg-amber-50 p-3 text-sm text-amber-700">
                  <p className="font-jakarta font-700">Potential conflicts detected</p>
                  <div className="mt-2 space-y-2">
                    {detectedConflicts.map((booking: Booking) => (
                      <div key={booking.id} className="rounded-xl bg-white/80 p-2">
                        <p className="font-medium">{booking.ct_venues?.name || 'Venue'} · {booking.status}</p>
                        <p>{new Date(booking.start_time).toLocaleString()} → {new Date(booking.end_time).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {message && <div className="rounded-[1rem] bg-primary/10 p-3 text-sm text-primary">{message}</div>}
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
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Events & Booking status</h2>
            {data.events.length === 0 && data.bookings.length === 0 ? <p className="text-sm text-on-surface-variant">No club operations yet. Create an event or request a venue booking.</p> : (
              <div className="space-y-3">
                {data.events.map((event: any) => <div key={event.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">{event.title}</p><p className="text-sm text-on-surface-variant">{event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'}</p></div><Badge label={event.status} variant="primary" /></div>)}
                {data.bookings.map((booking: Booking) => <div key={booking.id} className="rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-jakarta font-700 text-on-surface">{booking.purpose || 'Venue booking'}</p><p className="text-sm text-on-surface-variant">{booking.ct_venues?.name || 'Venue TBD'} · {new Date(booking.start_time).toLocaleString()}</p></div><Badge label={booking.status} variant={booking.status === 'approved' ? 'tertiary' : booking.status === 'rejected' ? 'secondary' : 'primary'} /></div>{booking.notes && <p className="mt-2 text-sm text-on-surface-variant">Notes: {booking.notes}</p>}</div>)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
