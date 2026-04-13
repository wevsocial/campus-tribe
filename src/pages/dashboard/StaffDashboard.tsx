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
import TicketingSystem from '../../components/tickets/TicketingSystem';
import { findVenueConflicts, normalizeRelation } from '../../lib/dashboardData';

type Child = { id: string; full_name: string; parent_id: string | null; room: string | null };
type Booking = { id: string; purpose: string | null; status: string; start_time: string; end_time: string; venue_id: string | null; notes: string | null; ct_venues?: { name: string | null; institution_id?: string | null } | null };

export default function StaffDashboard() {
  const { user, institutionId, profile } = useAuth();
  const isPreschool = (profile?.institution_type || profile?.platform_type) === 'preschool';
  const [childId, setChildId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState('4');
  const [activities, setActivities] = useState('Outdoor play, storytime');
  const [teacherNote, setTeacherNote] = useState('');
  const [mealNote, setMealNote] = useState('Lunch finished well');
  const [napDuration, setNapDuration] = useState('45');
  const [photoList, setPhotoList] = useState('');
  const [linkParentChildId, setLinkParentChildId] = useState('');
  const [linkParentUserId, setLinkParentUserId] = useState('');
  const [updateChildId, setUpdateChildId] = useState('');
  const [updateType, setUpdateType] = useState('update');
  const [updateNote, setUpdateNote] = useState('');
  const [bookingReviewNotes, setBookingReviewNotes] = useState<Record<string, string>>({});

  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [childrenRes, reportsRes, classesRes, announcementsRes, parentsRes, updatesRes, venuesRes] = await Promise.all([
      supabase.from('ct_children').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_daily_reports').select('*, ct_children(full_name)').eq('teacher_id', userId).order('report_date', { ascending: false }).limit(20),
      supabase.from('ct_classes').select('id, section, room, schedule, ct_courses(code, name)').eq('teacher_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_announcements').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(10),
      supabase.from('ct_users').select('id, full_name, email').eq('institution_id', institutionId).eq('role', 'parent').order('full_name'),
      supabase.from('ct_parent_updates').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(20),
      supabase.from('ct_venues').select('id').eq('institution_id', institutionId),
    ]);
    const venueIds = (venuesRes.data ?? []).map((venue: any) => venue.id);
    const bookingsRes = venueIds.length
      ? await supabase.from('ct_venue_bookings').select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, institution_id)').in('venue_id', venueIds).in('status', ['pending', 'approved', 'rejected']).order('created_at', { ascending: false }).limit(40)
      : { data: [] };
    return {
      children: childrenRes.data ?? [],
      reports: reportsRes.data ?? [],
      classes: classesRes.data ?? [],
      announcements: announcementsRes.data ?? [],
      parents: parentsRes.data ?? [],
      updates: updatesRes.data ?? [],
      bookings: (bookingsRes.data ?? [])
        .map((booking: any) => ({ ...booking, ct_venues: normalizeRelation(booking.ct_venues) })),
    };
  }, { children: [], reports: [], classes: [], announcements: [], parents: [], updates: [], bookings: [] } as any, { requireInstitution: true });

  const childOptions = useMemo(() => data.children, [data.children]);

  const createDailyReport = async () => {
    if (!user?.id || !childId || !reportDate) return;
    const payload = {
      child_id: childId,
      teacher_id: user.id,
      report_date: reportDate,
      mood: Number(mood),
      meals: { summary: mealNote },
      nap_duration_minutes: Number(napDuration || 0),
      activities: activities.split(',').map((entry) => entry.trim()).filter(Boolean),
      teacher_note: teacherNote || null,
      photos: photoList.split(',').map((entry) => entry.trim()).filter(Boolean),
    };
    const { data: report } = await supabase.from('ct_daily_reports').insert(payload).select('*, ct_children(full_name)').single();
    if (report) setData((current: any) => ({ ...current, reports: [report, ...current.reports] }));
    setTeacherNote('');
  };

  const linkParent = async () => {
    if (!linkParentChildId || !linkParentUserId) return;
    const { data: child } = await supabase.from('ct_children').update({ parent_id: linkParentUserId }).eq('id', linkParentChildId).select('*').single();
    if (child) setData((current: any) => ({ ...current, children: current.children.map((entry: Child) => entry.id === child.id ? child : entry) }));
  };

  const addUpdate = async () => {
    if (!institutionId || !updateChildId || !user?.id || !updateNote.trim()) return;
    const { data: update } = await supabase.from('ct_parent_updates').insert({ institution_id: institutionId, child_id: updateChildId, author_id: user.id, audience: 'parent', note_type: updateType, note: updateNote.trim() }).select('*').single();
    if (update) setData((current: any) => ({ ...current, updates: [update, ...current.updates] }));
    setUpdateNote('');
  };

  const reviewBooking = async (bookingId: string, status: 'approved' | 'rejected') => {
    const notes = bookingReviewNotes[bookingId] || null;
    const { data: booking } = await supabase.from('ct_venue_bookings').update({ status, approved_by: user?.id || null, notes }).eq('id', bookingId).select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, institution_id)').single();
    if (booking) setData((current: any) => ({ ...current, bookings: current.bookings.map((entry: Booking) => entry.id === bookingId ? booking : entry) }));
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
          <h1 className="font-lexend text-3xl font-900">{isPreschool ? 'Preschool Staff Workspace' : 'Staff Workspace'}</h1>
          <p className="mt-2 text-white/80">{isPreschool ? 'Publish richer daily reports, link parents to children, and keep a durable parent communication trail.' : 'Manage classes, communications, and venue approvals with institution-backed data.'}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Children" value={data.children.length} color="primary" />
          <StatCard label="Daily reports" value={data.reports.length} color="secondary" />
          <StatCard label="Parent notes" value={data.updates.length} color="tertiary" />
          <StatCard label="Venue reviews" value={data.bookings.filter((booking: Booking) => booking.status === 'pending').length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Card>
            <h2 className="font-lexend text-lg font-800 text-on-surface">Create richer daily report</h2>
            <div className="mt-4 space-y-3">
              <label className="text-sm font-jakarta font-700 text-on-surface">Child</label>
              <select value={childId} onChange={(e) => setChildId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select child</option>
                {childOptions.map((child: Child) => <option key={child.id} value={child.id}>{child.full_name}</option>)}
              </select>
              <Input label="Report date" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
              <label className="text-sm font-jakarta font-700 text-on-surface">Mood</label>
              <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="1">1 · Very low</option>
                <option value="2">2 · Low</option>
                <option value="3">3 · Okay</option>
                <option value="4">4 · Good</option>
                <option value="5">5 · Excellent</option>
              </select>
              <Input label="Activities" value={activities} onChange={(e) => setActivities(e.target.value)} placeholder="Outdoor play, painting, nap time" />
              <Input label="Meal summary" value={mealNote} onChange={(e) => setMealNote(e.target.value)} placeholder="Snack and lunch notes" />
              <Input label="Nap duration (minutes)" type="number" value={napDuration} onChange={(e) => setNapDuration(e.target.value)} />
              <Input label="Photo URLs (comma separated)" value={photoList} onChange={(e) => setPhotoList(e.target.value)} placeholder="https://..." />
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Teacher note</label>
                <textarea value={teacherNote} onChange={(e) => setTeacherNote(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm text-on-surface" placeholder="Share notable moments, milestones, or follow-up needs." />
              </div>
              <Button onClick={createDailyReport} className="w-full rounded-full">Publish report</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Child linking + parent update trail</h2>
            <div className="space-y-3 mb-5">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Link child to parent</label>
              <select value={linkParentChildId} onChange={(e) => setLinkParentChildId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                <option value="">Select child</option>
                {data.children.map((child: Child) => <option key={child.id} value={child.id}>{child.full_name}{child.parent_id ? ' · already linked' : ''}</option>)}
              </select>
              <select value={linkParentUserId} onChange={(e) => setLinkParentUserId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                <option value="">Select parent</option>
                {data.parents.map((parent: any) => <option key={parent.id} value={parent.id}>{parent.full_name || parent.email}</option>)}
              </select>
              <Button variant="outline" onClick={linkParent} className="w-full rounded-full">Save link</Button>
            </div>
            <div className="space-y-3 mb-5">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Post parent-facing update</label>
              <select value={updateChildId} onChange={(e) => setUpdateChildId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                <option value="">Select child</option>
                {data.children.map((child: Child) => <option key={child.id} value={child.id}>{child.full_name}</option>)}
              </select>
              <select value={updateType} onChange={(e) => setUpdateType(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                {['update', 'pickup', 'health', 'learning', 'behaviour', 'follow_up'].map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
              </select>
              <textarea value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Share a parent-facing update or request follow-up." />
              <Button onClick={addUpdate} className="w-full rounded-full">Post update</Button>
            </div>
            {data.updates.slice(0, 5).map((update: any) => <div key={update.id} className="mb-3 rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{update.note_type.replace('_', ' ')}</p><Badge label={update.audience} variant="secondary" /></div><p className="mt-2 text-sm text-on-surface-variant">{update.note}</p></div>)}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Recent daily reports</h2>
            {data.reports.length === 0 ? <p className="text-sm text-on-surface-variant">No reports yet.</p> : data.reports.map((report: any) => (
              <div key={report.id} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-jakarta font-700 text-on-surface">{report.ct_children?.full_name || 'Child report'}</p>
                  <Badge label={`Mood ${report.mood || '-'}`} variant="secondary" />
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">{report.report_date} · {(report.activities || []).join(', ') || 'No activities listed'}</p>
                <p className="text-sm text-on-surface-variant">Meals: {report.meals?.summary || 'No meal summary'} · Nap: {report.nap_duration_minutes || 0} min</p>
                <p className="mt-2 text-sm text-on-surface-variant">{report.teacher_note || 'No teacher note yet.'}</p>
              </div>
            ))}
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Venue review queue</h2>
            {data.bookings.length === 0 ? <p className="text-sm text-on-surface-variant">No venue bookings waiting.</p> : data.bookings.map((booking: Booking) => {
              const conflicts = findVenueConflicts(data.bookings as Booking[], {
                venueId: booking.venue_id,
                start: booking.start_time,
                end: booking.end_time,
                excludeId: booking.id,
              });
              return (
              <div key={booking.id} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">{booking.purpose || 'Venue booking'}</p>
                    <p className="text-sm text-on-surface-variant">{booking.ct_venues?.name || 'Venue'} · {new Date(booking.start_time).toLocaleString()}</p>
                  </div>
                  <Badge label={booking.status} variant={booking.status === 'approved' ? 'tertiary' : booking.status === 'rejected' ? 'secondary' : 'primary'} />
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">Overlap scan: {conflicts.length} conflicting request(s)</p>
                <textarea value={bookingReviewNotes[booking.id] ?? booking.notes ?? ''} onChange={(e) => setBookingReviewNotes((current) => ({ ...current, [booking.id]: e.target.value }))} rows={2} className="mt-3 w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Approval note / reason" />
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="rounded-full" onClick={() => reviewBooking(booking.id, 'approved')}>Approve</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => reviewBooking(booking.id, 'rejected')}>Reject</Button>
                </div>
              </div>
            );})}
          </Card>
        </div>

        {/* Ops Tickets */}
        <div id="tickets" className="scroll-mt-24">
          <TicketingSystem
            ticketType="ops"
            institutionId={institutionId}
            userId={user?.id}
            userRole="staff"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

