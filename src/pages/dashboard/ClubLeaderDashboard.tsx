import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { findVenueConflicts, normalizeRelation } from '../../lib/dashboardData';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../components/ui/NotificationPrefsPanel';

type Venue = { id: string; name: string; building: string | null; capacity: number | null; institution_id?: string | null };
type Booking = {
  id: string;
  purpose: string | null;
  status: string;
  start_time: string;
  end_time: string;
  venue_id: string | null;
  notes: string | null;
  approved_by?: string | null;
  ct_venues?: { name: string | null; building: string | null; institution_id?: string | null } | null;
};
type Budget = { id: string; club_id: string | null; total_allocated: number | null; total_spent: number | null; fiscal_year: string | null; notes: string | null };
type FundingRequest = { id: string; club_id: string | null; amount: number | null; purpose: string | null; status: string; created_at: string };

export default function ClubLeaderDashboard() {
  const { user, institutionId, profile } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [clubsRes, membersRes, eventsRes, bookingsRes, venuesRes] = await Promise.all([
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).or(`leader_id.eq.${userId},created_by.eq.${userId}`),
      supabase.from('ct_club_members').select('id, club_id, user_id, role, status').eq('institution_id', institutionId),
      supabase.from('ct_events').select('id, title, status, start_time, institution_id').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(20),
      supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, approved_by, ct_venues(name, building, institution_id)').eq('booked_by', userId).order('created_at', { ascending: false }),
      supabase.from('ct_venues').select('id, name, building, capacity, institution_id').eq('institution_id', institutionId).eq('is_bookable', true).order('name'),
    ]);
    const clubs = clubsRes.data ?? [];
    const clubIds = clubs.map((c: any) => c.id);
    const venueIds = (venuesRes.data ?? []).map((venue: Venue) => venue.id);
    const [venueBookingsRes, budgetsRes, fundingRes] = await Promise.all([
      venueIds.length
        ? supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, approved_by, ct_venues(name, building, institution_id)').in('venue_id', venueIds).order('start_time', { ascending: true })
        : Promise.resolve({ data: [] }),
      clubIds.length
        ? supabase.from('ct_budgets').select('*').in('club_id', clubIds)
        : Promise.resolve({ data: [] }),
      clubIds.length
        ? supabase.from('ct_funding_requests').select('*').in('club_id', clubIds).order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    return {
      clubs,
      members: membersRes.data ?? [],
      events: eventsRes.data ?? [],
      bookings: (bookingsRes.data ?? []).map((booking: any) => ({ ...booking, ct_venues: normalizeRelation(booking.ct_venues) })) as Booking[],
      venues: (venuesRes.data ?? []) as Venue[],
      venueBookings: (venueBookingsRes.data ?? []).map((booking: any) => ({ ...booking, ct_venues: normalizeRelation(booking.ct_venues) })) as Booking[],
      budgets: (budgetsRes.data ?? []) as Budget[],
      fundingRequests: (fundingRes.data ?? []) as FundingRequest[],
    };
  }, { clubs: [], members: [], events: [], bookings: [], venues: [], venueBookings: [], budgets: [], fundingRequests: [] } as any, { requireInstitution: true });

  const [clubName, setClubName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingVenueId, setBookingVenueId] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [message, setMessage] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingPurpose, setFundingPurpose] = useState('');
  const [showHandoff, setShowHandoff] = useState(false);
  const firstClub = data.clubs[0];

  const detectedConflicts = useMemo(() => findVenueConflicts(data.venueBookings as Booking[], {
    venueId: bookingVenueId,
    start: bookingStart,
    end: bookingEnd,
  }), [bookingVenueId, bookingStart, bookingEnd, data.venueBookings]);

  const createClub = async () => {
    if (!user?.id || !institutionId || !clubName.trim()) return;
    const { data: club } = await supabase.from('ct_clubs').insert({ institution_id: institutionId, leader_id: user.id, created_by: user.id, name: clubName.trim(), is_approved: false, status: 'active' }).select('*').single();
    if (club) setData((current: any) => ({ ...current, clubs: [club, ...current.clubs] }));
    setClubName('');
  };

  const createEvent = async () => {
    if (!user?.id || !institutionId || !firstClub?.id || !eventTitle.trim()) return;
    // ct_events has no club_id; create event then link via ct_club_events join table
    const { data: event } = await supabase.from('ct_events').insert({
      institution_id: institutionId,
      title: eventTitle.trim(),
      status: 'upcoming',
      created_by: user.id,
      start_time: eventDate || null,
      event_date: eventDate || new Date().toISOString(),
    }).select('*').single();
    if (event) {
      await supabase.from('ct_club_events').insert({ club_id: firstClub.id, event_id: event.id });
      setData((current: any) => ({ ...current, events: [event, ...current.events] }));
    }
    setEventTitle(''); setEventDate('');
  };

  const createBooking = async () => {    if (!user?.id || !bookingPurpose.trim() || !bookingStart || !bookingEnd || !bookingVenueId) return;
    setMessage('');
    const { data: booking } = await supabase.from('ct_venue_bookings').insert({ booked_by: user.id, venue_id: bookingVenueId, purpose: bookingPurpose.trim(), start_time: bookingStart, end_time: bookingEnd, status: 'pending', notes: bookingNotes || null }).select('id, purpose, status, start_time, end_time, venue_id, notes, approved_by, ct_venues(name, building, institution_id)').single();
    if (booking) {
      setData((current: any) => ({ ...current, bookings: [booking, ...current.bookings], venueBookings: [...current.venueBookings, booking] }));
      setMessage(detectedConflicts.length ? `Booking submitted with ${detectedConflicts.length} detected conflict(s). Awaiting review.` : 'Booking request submitted.');
    }
    setBookingPurpose(''); setBookingStart(''); setBookingEnd(''); setBookingVenueId(''); setBookingNotes('');
  };

  const memberCount = firstClub ? data.members.filter((member: any) => member.club_id === firstClub.id).length : 0;

  const submitFundingRequest = async () => {
    if (!user?.id || !institutionId || !firstClub?.id || !fundingAmount || !fundingPurpose.trim()) return;
    const { data: req } = await supabase.from('ct_funding_requests').insert({
      club_id: firstClub.id,
      institution_id: institutionId,
      submitted_by: user.id,
      amount: Number(fundingAmount),
      purpose: fundingPurpose.trim(),
      status: 'pending',
    }).select('*').single();
    if (req) setData((current: any) => ({ ...current, fundingRequests: [req, ...current.fundingRequests] }));
    setFundingAmount(''); setFundingPurpose('');
    setMessage('Funding request submitted for review.');
  };

  const exportClubData = () => {
    const exportData = {
      club: firstClub,
      members: data.members.filter((m: any) => m.club_id === firstClub?.id),
      events: data.events,
      bookings: data.bookings,
      budgets: data.budgets,
      fundingRequests: data.fundingRequests,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${firstClub?.name?.replace(/\s+/g, '-') || 'club'}-handoff.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowHandoff(false);
  };

  const budget = data.budgets.find((b: Budget) => b.club_id === firstClub?.id);

  const [notifMsg, setNotifMsg] = useState('');
  const [notifClubId, setNotifClubId] = useState('');
  const sendClubNotification = async (clubId: string, memberUserIds: string[]) => {
    if (!user?.id || memberUserIds.length === 0) { setMessage('No members to notify.'); return; }
    const club = data.clubs.find((c: any) => c.id === clubId);
    const notifTitle = `Message from ${club?.name || 'Club Leader'}`;
    const notifBody = notifMsg.trim() || `New update from ${club?.name || 'your club'}.`;
    const rows = memberUserIds.map((uid: string) => ({
      user_id: uid,
      type: 'club_notification',
      title: notifTitle,
      body: notifBody,
      institution_id: institutionId,
    }));
    await supabase.from('ct_notifications').insert(rows);
    setMessage(`Notification sent to ${memberUserIds.length} member(s).`);
    setNotifMsg('');
    setNotifClubId('');
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
                    {(detectedConflicts as Booking[]).map((booking) => (
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

        {/* Budget tracker + Funding requests */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Budget tracker</h2>
            {budget ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-on-surface-variant">Allocated</span>
                  <span className="font-jakarta font-700 text-on-surface">${(budget.total_allocated || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-on-surface-variant">Spent</span>
                  <span className="font-jakarta font-700 text-secondary">${(budget.total_spent || 0).toLocaleString()}</span>
                </div>
                <div className="rounded-full bg-surface h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-secondary transition-all"
                    style={{ width: `${Math.min(100, ((budget.total_spent || 0) / (budget.total_allocated || 1)) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {Math.round(((budget.total_spent || 0) / (budget.total_allocated || 1)) * 100)}% used · FY {budget.fiscal_year || 'Current'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">No budget allocated yet. Contact your admin to set up a budget for this club.</p>
            )}

            <div className="mt-6">
              <h3 className="mb-3 font-lexend text-base font-700 text-on-surface">Request funding</h3>
              <div className="space-y-3">
                <Input label="Amount ($)" type="number" value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} placeholder="250" />
                <Input label="Purpose" value={fundingPurpose} onChange={(e) => setFundingPurpose(e.target.value)} placeholder="Equipment purchase" />
                <Button onClick={submitFundingRequest} disabled={!firstClub} className="w-full rounded-full">Submit funding request</Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-lexend text-lg font-800 text-on-surface">Funding requests</h2>
              {firstClub && (
                <Button onClick={() => setShowHandoff(true)} variant="outline" className="rounded-full" size="sm">📦 Handoff export</Button>
              )}
            </div>
            {data.fundingRequests.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No funding requests yet.</p>
            ) : data.fundingRequests.map((req: FundingRequest) => (
              <div key={req.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-jakarta font-700 text-on-surface">{req.purpose}</p>
                  <p className="text-sm text-on-surface-variant">${(req.amount || 0).toLocaleString()} · {new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <Badge label={req.status} variant={req.status === 'approved' ? 'tertiary' : req.status === 'rejected' ? 'secondary' : 'primary'} />
              </div>
            ))}
          </Card>
        </div>

        {/* Handoff modal */}
        {showHandoff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowHandoff(false)}>
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-lexend text-xl font-800 text-on-surface mb-2">Club handoff export</h2>
              <p className="text-sm text-on-surface-variant mb-6">Download all club data (members, events, bookings, budget, funding requests) as a JSON file for leadership transition.</p>
              <div className="flex gap-3">
                <Button onClick={exportClubData} className="flex-1 rounded-full">Download JSON</Button>
                <Button onClick={() => setShowHandoff(false)} variant="outline" className="flex-1 rounded-full">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">My Clubs</h2>
            {data.clubs.length === 0 ? <p className="text-sm text-on-surface-variant">No clubs yet. Create your first club profile to start onboarding members.</p> : data.clubs.map((club: any) => {
              const clubMembers = data.members.filter((member: any) => member.club_id === club.id);
              return (
                <div key={club.id} className="mb-4 rounded-[1rem] bg-surface p-4 border border-outline-variant/30">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-jakarta font-700 text-on-surface">{club.name}</p>
                    <Badge label={club.is_approved ? 'approved' : 'pending'} variant={club.is_approved ? 'tertiary' : 'secondary'} />
                  </div>
                  {club.description && <p className="text-xs text-on-surface-variant mb-2">{club.description}</p>}
                  <p className="text-xs text-on-surface-variant mb-3">{clubMembers.length} member{clubMembers.length !== 1 ? 's' : ''}</p>
                  {clubMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {clubMembers.slice(0, 5).map((m: any) => (
                        <span key={m.id} className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-xs font-jakarta">{m.user_id?.substring(0, 8)}...</span>
                      ))}
                      {clubMembers.length > 5 && <span className="text-xs text-on-surface-variant">+{clubMembers.length - 5} more</span>}
                    </div>
                  )}
                  <div className="space-y-2">
                    <textarea
                      className="w-full border border-outline-variant rounded-xl px-3 py-2 font-jakarta text-xs bg-surface text-on-surface"
                      rows={2}
                      placeholder="Message to send to members (optional)"
                      value={notifClubId === club.id ? notifMsg : ''}
                      onChange={e => { setNotifClubId(club.id); setNotifMsg(e.target.value); }}
                    />
                    <button
                      onClick={() => sendClubNotification(club.id, clubMembers.map((m: any) => m.user_id))}
                      className="w-full px-3 py-1.5 rounded-xl bg-secondary-container text-secondary text-xs font-jakarta font-700 hover:bg-secondary/20 transition-colors"
                      disabled={clubMembers.length === 0}
                    >
                      Notify All Members ({clubMembers.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Events & Booking status</h2>
            {data.events.length === 0 && data.bookings.length === 0 ? <p className="text-sm text-on-surface-variant">No club operations yet. Create an event or request a venue booking.</p> : (
              <div className="space-y-3">
                {data.events.map((event: any) => <div key={event.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">{event.title}</p><p className="text-sm text-on-surface-variant">{event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'}</p></div><Badge label={event.status} variant="primary" /></div>)}
                {(data.bookings as Booking[]).map((booking: Booking) => {
                  const historyConflicts = findVenueConflicts(data.venueBookings as Booking[], {
                    venueId: booking.venue_id,
                    start: booking.start_time,
                    end: booking.end_time,
                    excludeId: booking.id,
                  });
                  return <div key={booking.id} className="rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-jakarta font-700 text-on-surface">{booking.purpose || 'Venue booking'}</p><p className="text-sm text-on-surface-variant">{booking.ct_venues?.name || 'Venue TBD'} · {new Date(booking.start_time).toLocaleString()}</p></div><Badge label={booking.status} variant={booking.status === 'approved' ? 'tertiary' : booking.status === 'rejected' ? 'secondary' : 'primary'} /></div><p className="mt-2 text-xs text-on-surface-variant">Conflict history: {historyConflicts.length} overlapping booking(s)</p>{booking.notes && <p className="mt-2 text-sm text-on-surface-variant">Notes: {booking.notes}</p>}</div>;
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
      {/* Settings: Profile Photo + Notification Prefs */}
      <div id="settings" className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Profile Photo</h2>
          {user?.id && <ProfilePhotoUpload userId={user.id} currentUrl={profile?.avatar_url as string | null} displayName={profile?.full_name || user.email} />}
        </Card>
        <Card>
          {user?.id && <NotificationPrefsPanel userId={user.id} institutionId={institutionId} role="club_leader" />}
        </Card>
      </div>
    </DashboardLayout>
  );
}
