import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { findVenueConflicts, normalizeRelation } from '../../lib/dashboardData';

type Booking = { id: string; purpose: string | null; status: string; start_time: string; end_time: string; venue_id: string | null; notes: string | null; ct_venues?: { name: string | null; institution_id?: string | null } | null };
type PlatformSetting = { id: string; category: string; provider: string; status: string; notes: string | null; config: any };

export default function AdminDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ institutionId, userId }) => {
    const [institutionRes, membersRes, clubsRes, announcementsRes, settingsRes, venuesRes] = await Promise.all([
      supabase.from('ct_institutions').select('*').eq('id', institutionId).maybeSingle(),
      supabase.from('ct_users').select('id, full_name, email, role').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_announcements').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_platform_settings').select('*').eq('institution_id', institutionId).order('updated_at', { ascending: false }),
      supabase.from('ct_venues').select('id').eq('institution_id', institutionId),
    ]);
    const venueIds = (venuesRes.data ?? []).map((venue: any) => venue.id);
    const bookingsRes = venueIds.length
      ? await supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, institution_id)').in('venue_id', venueIds).order('created_at', { ascending: false }).limit(40)
      : { data: [] };
    return {
      institution: institutionRes.data ?? null,
      members: membersRes.data ?? [],
      clubs: clubsRes.data ?? [],
      announcements: announcementsRes.data ?? [],
      bookings: (bookingsRes.data ?? [])
        .map((booking: any) => ({ ...booking, ct_venues: normalizeRelation(booking.ct_venues) })),
      settings: settingsRes.data ?? [],
      userId,
    };
  }, { institution: null, members: [], clubs: [], announcements: [], bookings: [], settings: [], userId: null } as any);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [clubName, setClubName] = useState('');
  const [bookingReviewNotes, setBookingReviewNotes] = useState<Record<string, string>>({});
  const [lmsStatus, setLmsStatus] = useState('draft');
  const [lmsNotes, setLmsNotes] = useState('');
  const [helcimStatus, setHelcimStatus] = useState('draft');
  const [helcimNotes, setHelcimNotes] = useState('');

  const createAnnouncement = async () => {
    if (!user?.id || !institutionId || !announcementTitle.trim()) return;
    const { data: announcement } = await supabase.from('ct_announcements').insert({ institution_id: institutionId, author_id: user.id, title: announcementTitle.trim(), status: 'published', audience: 'all' }).select('*').single();
    if (announcement) setData((current: any) => ({ ...current, announcements: [announcement, ...current.announcements] }));
    setAnnouncementTitle('');
  };

  const createClubRequest = async () => {
    if (!user?.id || !institutionId || !clubName.trim()) return;
    const { data: club } = await supabase.from('ct_clubs').insert({ institution_id: institutionId, created_by: user.id, leader_id: user.id, name: clubName.trim(), is_approved: false }).select('*').single();
    if (club) setData((current: any) => ({ ...current, clubs: [club, ...current.clubs] }));
    setClubName('');
  };

  const approveClub = async (clubId: string) => {
    await supabase.from('ct_clubs').update({ is_approved: true }).eq('id', clubId);
    setData((current: any) => ({ ...current, clubs: current.clubs.map((club: any) => club.id === clubId ? { ...club, is_approved: true } : club) }));
  };

  const reviewBooking = async (bookingId: string, status: 'approved' | 'rejected') => {
    const notes = bookingReviewNotes[bookingId] || null;
    const { data: booking } = await supabase.from('ct_venue_bookings').update({ status, approved_by: user?.id || null, notes }).eq('id', bookingId).select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, institution_id)').single();
    if (booking) setData((current: any) => ({ ...current, bookings: current.bookings.map((entry: Booking) => entry.id === bookingId ? booking : entry) }));
  };

  const saveSetting = async (category: 'lms' | 'payments', provider: string, status: string, notes: string, config: any) => {
    if (!institutionId || !user?.id) return;
    const { data: setting } = await supabase.from('ct_platform_settings').upsert({ institution_id: institutionId, category, provider, status, notes, config, updated_by: user.id }, { onConflict: 'institution_id,category,provider' }).select('*').single();
    if (setting) setData((current: any) => ({ ...current, settings: [setting, ...current.settings.filter((entry: PlatformSetting) => !(entry.category === setting.category && entry.provider === setting.provider))] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Admin Workspace</h1>
          <p className="mt-2 text-white/80">Manage your institution, review venue approvals, and track LMS + Helcim readiness with simple admin scaffolding.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Institution" value={data.institution?.name || 'Setup needed'} color="primary" />
          <StatCard label="Members" value={data.members.length} color="secondary" />
          <StatCard label="Pending venues" value={data.bookings.filter((booking: Booking) => booking.status === 'pending').length} color="tertiary" />
          <StatCard label="Settings" value={data.settings.length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create announcement</h2>
            <Input label="Announcement title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Campus opens registration next week" />
            <Button onClick={createAnnouncement} className="mt-3 w-full rounded-full">Publish announcement</Button>
          </Card>
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create club request</h2>
            <Input label="Club name" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Debate Club" />
            <Button onClick={createClubRequest} className="mt-3 w-full rounded-full">Create pending club</Button>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Pending / Active Clubs</h2>
            {data.clubs.length === 0 ? <p className="text-sm text-on-surface-variant">No clubs yet.</p> : data.clubs.map((club: any) => <div key={club.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-3"><div><p className="font-jakarta font-700 text-on-surface">{club.name}</p><p className="text-sm text-on-surface-variant">{club.is_approved ? 'Approved' : 'Pending approval'}</p></div>{club.is_approved ? <Badge label="approved" variant="tertiary" /> : <Button onClick={() => approveClub(club.id)} className="rounded-full">Approve</Button>}</div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Venue approval queue</h2>
            {data.bookings.length === 0 ? <p className="text-sm text-on-surface-variant">No venue requests yet.</p> : data.bookings.map((booking: Booking) => {
              const conflicts = findVenueConflicts(data.bookings as Booking[], {
                venueId: booking.venue_id,
                start: booking.start_time,
                end: booking.end_time,
                excludeId: booking.id,
              });
              return <div key={booking.id} className="mb-3 rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-jakarta font-700 text-on-surface">{booking.purpose || 'Venue booking'}</p><p className="text-sm text-on-surface-variant">{booking.ct_venues?.name || 'Venue'} · {new Date(booking.start_time).toLocaleString()}</p></div><Badge label={booking.status} variant={booking.status === 'approved' ? 'tertiary' : booking.status === 'rejected' ? 'secondary' : 'primary'} /></div><p className="mt-2 text-xs text-on-surface-variant">Overlap scan: {conflicts.length} conflicting request(s)</p><textarea value={bookingReviewNotes[booking.id] ?? booking.notes ?? ''} onChange={(e) => setBookingReviewNotes((current) => ({ ...current, [booking.id]: e.target.value }))} rows={2} className="mt-3 w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Approval note / reason" />{booking.status === 'pending' && <div className="mt-3 flex gap-2"><Button size="sm" className="rounded-full" onClick={() => reviewBooking(booking.id, 'approved')}>Approve</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => reviewBooking(booking.id, 'rejected')}>Reject</Button></div>}</div>;
            })}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">LMS integration groundwork</h2>
            <div className="space-y-3">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Status</label>
              <select value={lmsStatus} onChange={(e) => setLmsStatus(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                {['draft', 'review', 'configured', 'disabled'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <textarea value={lmsNotes} onChange={(e) => setLmsNotes(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Canvas / Moodle / Google Classroom scope, API access, SIS dependencies." />
              <Button onClick={() => saveSetting('lms', 'canvas', lmsStatus, lmsNotes, { reviewSurface: ['rosters', 'grade passback', 'course sync'] })} className="w-full rounded-full">Save LMS review item</Button>
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Helcim groundwork</h2>
            <div className="space-y-3">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Status</label>
              <select value={helcimStatus} onChange={(e) => setHelcimStatus(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                {['draft', 'review', 'configured', 'disabled'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <textarea value={helcimNotes} onChange={(e) => setHelcimNotes(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Merchant account readiness, payment page owners, refund policy, PCI review notes." />
              <Button onClick={() => saveSetting('payments', 'helcim', helcimStatus, helcimNotes, { reviewSurface: ['billing settings', 'merchant status', 'checkout ownership'] })} className="w-full rounded-full">Save Helcim review item</Button>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Members</h2>
            {data.members.length === 0 ? <p className="text-sm text-on-surface-variant">No members yet.</p> : data.members.slice(0, 12).map((member: any) => <div key={member.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{member.full_name || member.email}</p><p className="text-sm text-on-surface-variant">{member.role} · {member.email}</p></div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Integration review surfaces</h2>
            {data.settings.length === 0 ? <p className="text-sm text-on-surface-variant">No settings saved yet.</p> : data.settings.map((setting: PlatformSetting) => <div key={setting.id} className="mb-3 rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">{setting.provider}</p><p className="text-sm text-on-surface-variant">{setting.category}</p></div><Badge label={setting.status} variant="secondary" /></div><p className="mt-2 text-sm text-on-surface-variant">{setting.notes || 'No notes yet.'}</p><p className="mt-2 text-xs text-on-surface-variant">Review surface: {(setting.config?.reviewSurface || []).join(', ') || 'n/a'}</p></div>)}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
