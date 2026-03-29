import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

type Booking = any;
type PlatformSetting = any;
type AdminSurvey = any;

type SectionId = 'overview' | 'engagement' | 'clubs' | 'events' | 'venues' | 'sports' | 'reports' | 'settings';

const sectionLabels: Record<SectionId, string> = {
  overview: 'Overview',
  engagement: 'Engagement',
  clubs: 'Clubs',
  events: 'Events',
  venues: 'Venues',
  sports: 'Sports',
  reports: 'Reports',
  settings: 'Settings',
};

export default function AdminDashboard() {
  const { user, institutionId } = useAuth();

  const { data, setData } = useDashboardData(async ({ institutionId, userId }) => {
    const [institutionRes, membersRes, clubsRes, announcementsRes, settingsRes, venuesRes, surveysRes, sportsLeaguesRes, sportsTeamsRes, sportsGamesRes, sportParticipantsRes] = await Promise.all([
      supabase.from('ct_institutions').select('*').eq('id', institutionId).maybeSingle(),
      supabase.from('ct_users').select('id, full_name, email, role, institution_id').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_announcements').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_platform_settings').select('*').eq('institution_id', institutionId).order('updated_at', { ascending: false }),
      supabase.from('ct_venues').select('id, name, institution_id').eq('institution_id', institutionId),
      supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sports_teams').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sports_games').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_sport_participants').select('*').eq('institution_id', institutionId).order('joined_at', { ascending: false }),
    ]);

    const venueIds = (venuesRes.data ?? []).map((v: any) => v.id);
    const bookingsRes = venueIds.length
      ? await supabase
          .from('ct_venue_bookings')
          .select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, institution_id)')
          .in('venue_id', venueIds)
          .order('created_at', { ascending: false })
      : { data: [] as any[] };

    const bookingIds = (bookingsRes.data ?? []).map((b: any) => b.id);
    const historyRes = bookingIds.length
      ? await supabase.from('ct_venue_booking_history').select('*').in('booking_id', bookingIds).order('created_at', { ascending: false })
      : { data: [] as any[] };

    const historyByBookingId = (historyRes.data ?? []).reduce((acc: Record<string, any[]>, row: any) => {
      acc[row.booking_id] = [...(acc[row.booking_id] ?? []), row];
      return acc;
    }, {});

    const surveys = surveysRes.data ?? [];
    const surveyIds = surveys.map((s: any) => s.id);

    const [surveyQuestionsRes, surveyResponsesRes] = await Promise.all([
      surveyIds.length ? supabase.from('ct_survey_questions').select('*').in('survey_id', surveyIds).order('order_index', { ascending: true }) : Promise.resolve({ data: [] as any[] }),
      surveyIds.length ? supabase.from('ct_survey_responses').select('id, survey_id, answers').in('survey_id', surveyIds) : Promise.resolve({ data: [] as any[] }),
    ]);

    return {
      institution: institutionRes.data ?? null,
      members: membersRes.data ?? [],
      clubs: clubsRes.data ?? [],
      announcements: announcementsRes.data ?? [],
      settings: settingsRes.data ?? [],
      venues: venuesRes.data ?? [],
      bookings: (bookingsRes.data ?? []).map((b: any) => ({ ...b, ct_venues: normalizeRelation(b.ct_venues), history: historyByBookingId[b.id] ?? [] })),
      surveys,
      surveyQuestions: surveyQuestionsRes.data ?? [],
      surveyResponses: surveyResponsesRes.data ?? [],
      sportsLeagues: sportsLeaguesRes.data ?? [],
      sportsTeams: sportsTeamsRes.data ?? [],
      sportsGames: sportsGamesRes.data ?? [],
      sportParticipants: sportParticipantsRes.data ?? [],
      userId,
    };
  }, {
    institution: null,
    members: [],
    clubs: [],
    announcements: [],
    settings: [],
    venues: [],
    bookings: [],
    surveys: [],
    surveyQuestions: [],
    surveyResponses: [],
    sportsLeagues: [],
    sportsTeams: [],
    sportsGames: [],
    sportParticipants: [],
    userId: null,
  } as any, { requireInstitution: true });

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [clubName, setClubName] = useState('');
  const [bookingReviewNotes, setBookingReviewNotes] = useState<Record<string, string>>({});
  const [lmsStatus, setLmsStatus] = useState('draft');
  const [lmsNotes, setLmsNotes] = useState('');
  const [helcimStatus, setHelcimStatus] = useState('draft');
  const [helcimNotes, setHelcimNotes] = useState('');
  const [selectedSurveyId, setSelectedSurveyId] = useState('');

  const activeSection: SectionId = useMemo(() => {
    const hash = (window.location.hash || '#overview').replace('#', '') as SectionId;
    return (hash in sectionLabels ? hash : 'overview');
  }, [window.location.hash]);

  const createAnnouncement = async () => {
    if (!user?.id || !institutionId || !announcementTitle.trim()) return;
    const { data: announcement } = await supabase
      .from('ct_announcements')
      .insert({ institution_id: institutionId, created_by: user.id, title: announcementTitle.trim(), body: announcementTitle.trim(), status: 'published', audience: 'all', priority: 'normal' })
      .select('*')
      .single();
    if (announcement) setData((current: any) => ({ ...current, announcements: [announcement, ...current.announcements] }));
    setAnnouncementTitle('');
  };

  const createClubRequest = async () => {
    if (!user?.id || !institutionId || !clubName.trim()) return;
    const { data: club } = await supabase
      .from('ct_clubs')
      .insert({ institution_id: institutionId, created_by: user.id, leader_id: user.id, name: clubName.trim(), is_approved: false, status: 'pending' })
      .select('*')
      .single();
    if (club) setData((current: any) => ({ ...current, clubs: [club, ...current.clubs] }));
    setClubName('');
  };

  const approveClub = async (clubId: string) => {
    await supabase.from('ct_clubs').update({ is_approved: true, status: 'active' }).eq('id', clubId);
    setData((current: any) => ({ ...current, clubs: current.clubs.map((club: any) => (club.id === clubId ? { ...club, is_approved: true, status: 'active' } : club)) }));
  };

  const reviewBooking = async (bookingId: string, status: 'approved' | 'rejected') => {
    const notes = bookingReviewNotes[bookingId] || null;
    const bookingResult = await supabase
      .from('ct_venue_bookings')
      .update({ status, approved_by: user?.id || null, notes })
      .eq('id', bookingId)
      .select('id, purpose, status, start_time, end_time, venue_id, notes, ct_venues(name, institution_id)')
      .single();

    if (bookingResult.error || !bookingResult.data) {
      window.alert(bookingResult.error?.message || 'Could not review booking.');
      return;
    }

    const historyResult = await supabase.from('ct_venue_booking_history').select('*').eq('booking_id', bookingId).order('created_at', { ascending: false });

    setData((current: any) => ({
      ...current,
      bookings: current.bookings.map((entry: Booking) =>
        entry.id === bookingId
          ? { ...bookingResult.data, ct_venues: normalizeRelation((bookingResult.data as any).ct_venues), history: historyResult.data ?? [] }
          : entry
      ),
    }));
  };

  const saveSetting = async (category: 'lms' | 'payments', provider: string, status: string, notes: string, config: any) => {
    if (!institutionId || !user?.id) return;
    const { data: setting } = await supabase
      .from('ct_platform_settings')
      .upsert({ institution_id: institutionId, category, provider, status, notes, config, updated_by: user.id }, { onConflict: 'institution_id,category,provider' })
      .select('*')
      .single();
    if (setting) {
      setData((current: any) => ({
        ...current,
        settings: [setting, ...current.settings.filter((entry: PlatformSetting) => !(entry.category === setting.category && entry.provider === setting.provider))],
      }));
    }
  };

  const studentCount = (data.members as any[]).filter((m) => m.role === 'student').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section id="overview" className="scroll-mt-24">
          <div className="rounded-[1.5rem] bg-primary p-8 text-white">
            <h1 className="font-lexend text-3xl font-900">Admin Workspace</h1>
            <p className="mt-2 text-white/80">Manage engagement, clubs, events, venues, sports, reports, and platform settings with live data.</p>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Institution" value={data.institution?.name || 'Setup needed'} color="primary" />
            <StatCard label="Members" value={data.members.length} color="secondary" />
            <StatCard label="Pending venues" value={data.bookings.filter((b: Booking) => b.status === 'pending').length} color="tertiary" />
            <StatCard label="Settings" value={data.settings.length} color="primary" />
          </div>
        </section>

        <section id="engagement" className="scroll-mt-24">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Engagement Snapshot</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Announcements" value={data.announcements.length} color="primary" />
              <StatCard label="Clubs" value={data.clubs.length} color="secondary" />
              <StatCard label="Events" value={(data as any).events?.length ?? 0} color="tertiary" />
              <StatCard label="Students" value={studentCount} color="primary" />
            </div>
          </Card>
        </section>

        <section id="clubs" className="scroll-mt-24 grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create club request</h2>
            <Input label="Club name" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Debate Club" />
            <Button onClick={createClubRequest} className="mt-3 w-full rounded-full">Create pending club</Button>
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Pending / Active Clubs</h2>
            {data.clubs.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No clubs yet.</p>
            ) : (
              data.clubs.map((club: any) => (
                <div key={club.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">{club.name}</p>
                    <p className="text-sm text-on-surface-variant">{club.is_approved ? 'Approved' : 'Pending approval'}</p>
                  </div>
                  {club.is_approved ? (
                    <Badge label="approved" variant="tertiary" />
                  ) : (
                    <Button onClick={() => approveClub(club.id)} className="rounded-full">Approve</Button>
                  )}
                </div>
              ))
            )}
          </Card>
        </section>

        <section id="events" className="scroll-mt-24 grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create announcement</h2>
            <Input label="Announcement title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Campus opens registration next week" />
            <Button onClick={createAnnouncement} className="mt-3 w-full rounded-full">Publish announcement</Button>
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Recent announcements</h2>
            {data.announcements.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No announcements yet.</p>
            ) : (
              data.announcements.slice(0, 10).map((a: any) => (
                <div key={a.id} className="mb-3 rounded-[1rem] bg-surface p-4">
                  <p className="font-jakarta font-700 text-on-surface">{a.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{a.created_at ? new Date(a.created_at).toLocaleString() : 'just now'}</p>
                </div>
              ))
            )}
          </Card>
        </section>

        <section id="venues" className="scroll-mt-24">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Venue approval queue</h2>
            {data.bookings.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No venue requests yet.</p>
            ) : (
              data.bookings.map((booking: Booking) => {
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
                    <p className="mt-2 text-xs text-on-surface-variant">Overlap scan: {conflicts.length} conflict(s)</p>
                    <textarea
                      value={bookingReviewNotes[booking.id] ?? booking.notes ?? ''}
                      onChange={(e) => setBookingReviewNotes((current) => ({ ...current, [booking.id]: e.target.value }))}
                      rows={2}
                      className="mt-3 w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm"
                      placeholder="Approval note / reason"
                    />
                    {booking.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="rounded-full" onClick={() => reviewBooking(booking.id, 'approved')}>Approve</Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => reviewBooking(booking.id, 'rejected')}>Reject</Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        </section>

        <section id="sports" className="scroll-mt-24">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Sports snapshot</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Leagues" value={data.sportsLeagues.length} color="primary" />
              <StatCard label="Teams" value={data.sportsTeams.length} color="secondary" />
              <StatCard label="Games" value={data.sportsGames.length} color="tertiary" />
              <StatCard label="Participants" value={data.sportParticipants.length} color="primary" />
            </div>
          </Card>
        </section>

        <section id="reports" className="scroll-mt-24">
          <Card>
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h2 className="font-lexend text-lg font-800 text-on-surface">Survey Analytics</h2>
              <select
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                className="rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface"
              >
                <option value="">Select a survey</option>
                {data.surveys.map((s: AdminSurvey) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            {!selectedSurveyId ? (
              <p className="text-sm text-on-surface-variant">Select a survey to view analytics.</p>
            ) : (() => {
              const questions = data.surveyQuestions.filter((q: any) => q.survey_id === selectedSurveyId).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));
              const responses = data.surveyResponses.filter((r: any) => r.survey_id === selectedSurveyId);
              const responseRate = studentCount > 0 ? Math.round((responses.length / studentCount) * 100) : 0;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Responses" value={responses.length} color="primary" />
                    <StatCard label="Response Rate" value={`${responseRate}%`} color="secondary" />
                    <StatCard label="Questions" value={questions.length} color="tertiary" />
                  </div>

                  {questions.map((q: any) => {
                    const dist: Record<string, number> = {};
                    responses.forEach((r: any) => {
                      const val = r.answers?.[q.id];
                      if (val !== undefined && val !== null && val !== '') {
                        const k = String(val);
                        dist[k] = (dist[k] || 0) + 1;
                      }
                    });

                    const chartData = Object.entries(dist).map(([name, value]) => ({ name, value }));

                    return (
                      <div key={q.id} className="rounded-[1rem] bg-surface p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-jakarta font-700 text-on-surface text-sm">{q.prompt || q.question_text}</p>
                          <Badge label={(q.question_type || 'question').replace('_', ' ')} variant="secondary" />
                        </div>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#0047AB" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-xs text-on-surface-variant">No responses yet.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </Card>
        </section>

        <section id="settings" className="scroll-mt-24 grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">LMS integration groundwork</h2>
            <div className="space-y-3">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Status</label>
              <select value={lmsStatus} onChange={(e) => setLmsStatus(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                {['draft', 'review', 'configured', 'disabled'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <textarea value={lmsNotes} onChange={(e) => setLmsNotes(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Canvas / Moodle / Brightspace scope and dependencies." />
              <Button onClick={() => saveSetting('lms', 'canvas', lmsStatus, lmsNotes, { reviewSurface: ['rosters', 'grade passback', 'course sync'] })} className="w-full rounded-full">Save LMS review item</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Helcim groundwork</h2>
            <div className="space-y-3">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Status</label>
              <select value={helcimStatus} onChange={(e) => setHelcimStatus(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                {['draft', 'review', 'configured', 'disabled'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <textarea value={helcimNotes} onChange={(e) => setHelcimNotes(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Merchant readiness, payment ownership, PCI notes." />
              <Button onClick={() => saveSetting('payments', 'helcim', helcimStatus, helcimNotes, { reviewSurface: ['merchant status', 'checkout ownership'] })} className="w-full rounded-full">Save Helcim review item</Button>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
