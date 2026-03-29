import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { normalizeRelation, summarizeVenueConflicts } from '../../lib/dashboardData';

type Booking = { id: string; purpose: string | null; status: string; start_time: string; end_time: string; venue_id: string | null; notes?: string | null; ct_venues?: { name?: string | null; building?: string | null; institution_id?: string | null } | null };

export default function StudentRepDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [venuesRes, clubsRes, eventsRes, announcementsRes] = await Promise.all([
      supabase.from('ct_venues').select('*').eq('institution_id', institutionId).order('name'),
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_events').select('*').eq('institution_id', institutionId).order('start_time', { ascending: true }).limit(12),
      supabase.from('ct_announcements').select('*').eq('author_id', userId).order('created_at', { ascending: false }).limit(10),
    ]);
    const venueIds = (venuesRes.data ?? []).map((venue: any) => venue.id);
    const [bookingsRes, institutionBookingsRes] = await Promise.all([
      supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, building, institution_id)').eq('booked_by', userId).order('created_at', { ascending: false }),
      venueIds.length
        ? supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, building, institution_id)').in('venue_id', venueIds).order('start_time', { ascending: true }).limit(120)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    return {
      venues: venuesRes.data ?? [],
      bookings: (bookingsRes.data ?? []).map((booking: any) => ({ ...booking, ct_venues: normalizeRelation(booking.ct_venues) })),
      institutionBookings: (institutionBookingsRes.data ?? []).map((booking: any) => ({ ...booking, ct_venues: normalizeRelation(booking.ct_venues) })),
      clubs: clubsRes.data ?? [],
      events: eventsRes.data ?? [],
      announcements: announcementsRes.data ?? [],
    };
  }, { venues: [], bookings: [], institutionBookings: [], clubs: [], events: [], announcements: [] } as any, { requireInstitution: true });

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [bookingVenueId, setBookingVenueId] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [message, setMessage] = useState('');

  const availableVenues = useMemo(() => data.venues.filter((venue: any) => venue.is_bookable !== false), [data.venues]);
  const conflictSummary = useMemo(() => summarizeVenueConflicts(data.institutionBookings as Booking[], {
    venueId: bookingVenueId,
    start: bookingStart,
    end: bookingEnd,
  }), [bookingVenueId, bookingStart, bookingEnd, data.institutionBookings]);

  const createEvent = async () => {
    if (!user?.id || !institutionId || !eventTitle.trim()) return;
    const payload = {
      institution_id: institutionId,
      title: eventTitle.trim(),
      start_time: eventDate || null,
      location: eventLocation.trim() || null,
      category: 'student_rep',
      status: 'upcoming',
      created_by: user.id,
    };
    const { data: event } = await supabase.from('ct_events').insert(payload).select('*').single();
    if (event) setData((current: any) => ({ ...current, events: [event, ...current.events] }));
    setEventTitle(''); setEventDate(''); setEventLocation('');
  };

  const requestBooking = async () => {
    if (!user?.id || !bookingVenueId || !bookingPurpose.trim() || !bookingStart || !bookingEnd) return;
    const { conflicts } = conflictSummary;
    const { data: booking } = await supabase.from('ct_venue_bookings').insert({
      venue_id: bookingVenueId,
      booked_by: user.id,
      purpose: bookingPurpose.trim(),
      start_time: bookingStart,
      end_time: bookingEnd,
      status: 'pending',
      notes: bookingNotes.trim() || null,
    }).select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, building, institution_id)').single();
    if (booking) {
      const normalized = { ...booking, ct_venues: normalizeRelation((booking as any).ct_venues) };
      setData((current: any) => ({ ...current, bookings: [normalized, ...current.bookings], institutionBookings: [...current.institutionBookings, normalized] }));
      setMessage(conflicts.length ? `Booking submitted with ${conflicts.length} overlapping request${conflicts.length === 1 ? '' : 's'} flagged for reviewers.` : 'Booking submitted to the venue review queue.');
    }
    setBookingVenueId(''); setBookingPurpose(''); setBookingStart(''); setBookingEnd(''); setBookingNotes('');
  };

  const createAnnouncement = async () => {
    if (!user?.id || !institutionId || !announcementTitle.trim()) return;
    const { data: announcement } = await supabase.from('ct_announcements').insert({
      institution_id: institutionId,
      author_id: user.id,
      title: announcementTitle.trim(),
      body: 'Created by student representation workspace.',
      target_roles: ['student'],
    }).select('*').single();
    if (announcement) setData((current: any) => ({ ...current, announcements: [announcement, ...current.announcements] }));
    setAnnouncementTitle('');
  };

  const approveClub = async (clubId: string) => {
    await supabase.from('ct_clubs').update({ is_approved: true }).eq('id', clubId);
    setData((current: any) => ({ ...current, clubs: current.clubs.map((club: any) => club.id === clubId ? { ...club, is_approved: true } : club) }));
  };

  
// Hash-based scroll navigation (driven by DashboardLayout sidebar)
React.useEffect(() => {
  const scrollToHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  // Small delay to let content render first
  const t = setTimeout(scrollToHash, 150);
  window.addEventListener('hashchange', scrollToHash);
  return () => { clearTimeout(t); window.removeEventListener('hashchange', scrollToHash); };
}, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Student Representative Workspace</h1>
          <p className="mt-2 text-white/80">Coordinate student-facing events, venue requests, campus announcements, and club approvals from one real workspace.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Bookable venues" value={availableVenues.length} color="primary" />
          <StatCard label="Venue requests" value={data.bookings.length} color="secondary" />
          <StatCard label="Upcoming events" value={data.events.length} color="tertiary" />
          <StatCard label="Club approvals" value={data.clubs.filter((club: any) => !club.is_approved).length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Publish student event</h2>
            <div className="space-y-3">
              <Input label="Event title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Campus town hall" />
              <Input label="Date / time" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <Input label="Location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Student centre" />
              <Button onClick={createEvent} className="w-full rounded-full">Create event</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Request venue booking</h2>
            <div className="space-y-3">
              <label className="text-sm font-jakarta font-700 text-on-surface">Venue</label>
              <select value={bookingVenueId} onChange={(e) => setBookingVenueId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select a venue</option>
                {availableVenues.map((venue: any) => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
              <Input label="Purpose" value={bookingPurpose} onChange={(e) => setBookingPurpose(e.target.value)} placeholder="Student government meeting" />
              <Input label="Start" type="datetime-local" value={bookingStart} onChange={(e) => setBookingStart(e.target.value)} />
              <Input label="End" type="datetime-local" value={bookingEnd} onChange={(e) => setBookingEnd(e.target.value)} />
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Submission notes</label>
                <textarea value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm text-on-surface" placeholder="Accessibility, setup, AV, or approval context" />
              </div>
              {(bookingVenueId && bookingStart && bookingEnd) && (
                <div className={`rounded-[1rem] p-3 text-sm ${conflictSummary.conflicts.length ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
                  <p className="font-jakarta font-700">{conflictSummary.conflicts.length ? 'Conflict scan' : 'Availability scan'}</p>
                  <p className="mt-1">{conflictSummary.label}</p>
                  {(conflictSummary.conflicts as Booking[]).slice(0, 3).map((booking: Booking) => (
                    <div key={booking.id} className="mt-2 rounded-xl bg-white/80 p-2">
                      <p className="font-medium">{booking.ct_venues?.name || 'Venue'} · {booking.status}</p>
                      <p>{new Date(booking.start_time).toLocaleString()} → {new Date(booking.end_time).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
              {message && <div className="rounded-[1rem] bg-primary/10 p-3 text-sm text-primary">{message}</div>}
              <Button onClick={requestBooking} className="w-full rounded-full">Submit booking</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Send student announcement</h2>
            <div className="space-y-3">
              <Input label="Headline" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Student election opens Monday" />
              <Button onClick={createAnnouncement} className="w-full rounded-full">Publish announcement</Button>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Venue requests</h2>
            {data.bookings.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No venue requests yet. Create your first booking request to reserve a campus space.</p>
            ) : data.bookings.map((booking: Booking) => (
              <div key={booking.id} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">{booking.purpose}</p>
                    <p className="text-sm text-on-surface-variant">{booking.ct_venues?.name || 'Venue pending'} · {new Date(booking.start_time).toLocaleString()}</p>
                  </div>
                  <Badge label={booking.status} variant={booking.status === 'approved' ? 'tertiary' : booking.status === 'rejected' ? 'secondary' : 'primary'} />
                </div>
                {booking.notes && <p className="mt-2 text-sm text-on-surface-variant">Notes: {booking.notes}</p>}
              </div>
            ))}
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Club requests and approvals</h2>
            {data.clubs.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No clubs exist yet. Once students create clubs, you can review and coordinate approvals here.</p>
            ) : data.clubs.map((club: any) => (
              <div key={club.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-jakarta font-700 text-on-surface">{club.name}</p>
                  <p className="text-sm text-on-surface-variant">{club.category || 'General'} · {club.is_approved ? 'Approved' : 'Pending approval'}</p>
                </div>
                {club.is_approved ? (
                  <Badge label="approved" variant="tertiary" />
                ) : (
                  <Button onClick={() => approveClub(club.id)} className="rounded-full">Approve</Button>
                )}
              </div>
            ))}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Student announcements</h2>
            {data.announcements.length === 0 ? <p className="text-sm text-on-surface-variant">No announcements yet. Publish a message to students to kick off your campus communications.</p> : data.announcements.map((announcement: any) => <div key={announcement.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{announcement.title}</p><p className="text-sm text-on-surface-variant">{new Date(announcement.created_at).toLocaleString()}</p></div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Upcoming campus events</h2>
            {data.events.length === 0 ? <p className="text-sm text-on-surface-variant">No events yet. Publish the first student-facing event here.</p> : data.events.map((event: any) => <div key={event.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">{event.title}</p><p className="text-sm text-on-surface-variant">{event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'} · {event.location || 'Campus'}</p></div><Badge label={event.status} variant="primary" /></div>)}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
