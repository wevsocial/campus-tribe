import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Calendar, Users, MapPin, Megaphone, Wallet, Trophy, Heart,
  ClipboardList, User, LogOut, Menu, X, Plus, ChevronRight, Loader2,
  Bell, CheckCircle, BookOpen, Settings, Download, Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationCenter from '../../components/ui/NotificationCenter';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../components/ui/NotificationPrefsPanel';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Event { id: string; title: string; event_date: string; location: string | null; description: string | null; }
interface Club { id: string; name: string; description: string | null; member_count: number | null; }
interface Venue { id: string; name: string; capacity: number | null; location: string | null; }
interface Announcement { id: string; title: string; body: string | null; created_at: string; }
interface Grade { id: string; score: number | null; letter_grade: string | null; notes: string | null; assignment_id: string; created_at: string; }
interface Survey { id: string; title: string; description: string | null; status: string; }

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function StudentPlatform() {
  const { profile, roles, user, institutionId, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStudent = roles.includes('student') || roles.includes('student_rep') || roles.includes('club_leader');
  const isRep = roles.includes('student_rep');
  const isLeader = roles.includes('club_leader');

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
    { id: 'clubs', label: 'Clubs', icon: <Users size={18} /> },
    ...(isRep ? [{ id: 'venues', label: 'Venue Booking', icon: <MapPin size={18} /> }] : []),
    ...(isRep ? [{ id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> }] : []),
    ...(isLeader ? [{ id: 'budget', label: 'Budget', icon: <Wallet size={18} /> }] : []),
    { id: 'sports', label: 'Sports', icon: <Trophy size={18} /> },
    { id: 'wellness', label: 'Wellness', icon: <Heart size={18} /> },
    { id: 'surveys', label: 'Surveys', icon: <ClipboardList size={18} /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen size={18} /> },
    { id: 'grades', label: 'My Grades', icon: <ClipboardList size={18} /> },
    ...(isLeader ? [{ id: 'myclubs', label: 'My Clubs', icon: <Users size={18} /> }] : []),
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = isLeader ? 'Club Leader' : isRep ? 'Student Rep' : 'Student';

  const handleSignOut = async () => { await signOut(); navigate('/login'); };
  const switchRole = () => {
    sessionStorage.removeItem('ct.session-role');
    navigate('/login?multiRole=1');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? 'w-64 flex flex-col h-full' : 'hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full z-30'} bg-surface-lowest shadow-float`}>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant/30" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="text-white text-xs font-lexend font-900">CT</span>
        </div>
        <div>
          <p className="font-lexend font-900 text-white text-sm">Campus Tribe</p>
          <p className="text-xs font-jakarta text-white/70">{roleLabel}</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => { setActiveSection(item.id); if (mobile) setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-jakarta text-sm font-700 transition-all ${
                  activeSection === item.id ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-3 py-4 border-t border-outline-variant/30">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-jakarta font-900">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-jakarta font-700 text-on-surface text-sm truncate">{userName}</p>
            <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
          </div>
        </div>
        {roles.length > 1 && (
          <button onClick={switchRole} className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-jakarta text-on-surface-variant hover:bg-secondary-container hover:text-secondary transition-colors">
            <ChevronRight size={18} /> Switch role
          </button>
        )}
        <button onClick={handleSignOut} className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-jakarta text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-surface">
      <Sidebar />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface-lowest border-b border-outline-variant/30 flex items-center gap-3 px-4 py-3">
        <button onClick={() => setMobileOpen(!mobileOpen)}><Menu size={22} className="text-on-surface" /></button>
        <p className="font-lexend font-900 text-on-surface text-sm flex-1">Campus Tribe</p>
        <NotificationCenter />
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-jakarta font-900">{initials}</span>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
          <div className="hidden lg:flex justify-end mb-4">
            <NotificationCenter />
          </div>
          {activeSection === 'home' && <StudentHome institutionId={institutionId} profile={profile} isRep={isRep} isLeader={isLeader} />}
          {activeSection === 'events' && <EventsSection institutionId={institutionId} canCreate={isRep || isLeader} />}
          {activeSection === 'clubs' && <ClubsSection institutionId={institutionId} isLeader={isLeader} userId={user?.id} />}
          {activeSection === 'venues' && <VenueSection institutionId={institutionId} />}
          {activeSection === 'announcements' && <AnnouncementsSection institutionId={institutionId} canCreate={isRep} />}
          {activeSection === 'budget' && <BudgetSection institutionId={institutionId} />}
          {activeSection === 'sports' && <SportsSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'wellness' && <WellnessSection userId={user?.id} institutionId={institutionId} />}
          {activeSection === 'surveys' && <SurveysSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'grades' && <GradesSection userId={user?.id} />}
          {activeSection === 'courses' && <CoursesSection userId={user?.id} />}
          {activeSection === 'myclubs' && isLeader && <MyClubsSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'settings' && <SettingsSection profile={profile as unknown as Record<string, unknown> | null} userId={user?.id} institutionId={institutionId} role={isLeader ? 'club_leader' : 'student'} />}
        </div>
      </main>
    </div>
  );
}

// ─── Student Home ─────────────────────────────────────────────────────────────
function StudentHome({ institutionId, profile, isRep, isLeader }: { institutionId: string | null; profile: any; isRep: boolean; isLeader: boolean }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [mood, setMood] = useState<number | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_events').select('id,title,event_date,location,description').eq('institution_id', institutionId).gte('event_date', new Date().toISOString()).order('event_date').limit(5).then(({ data }) => setEvents((data || []) as Event[]));
    supabase.from('ct_announcements').select('id,title,body,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(5).then(({ data }) => setAnnouncements((data || []) as Announcement[]));
  }, [institutionId]);

  const moodLabels = ['😞', '😕', '😐', '😊', '😄'];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <h1 className="font-lexend font-900 text-2xl mb-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="font-jakarta text-white/80 text-sm">{isLeader ? 'Club Leader · ' : ''}{isRep ? 'Student Rep · ' : ''}Your campus life dashboard</p>
      </div>

      {/* Mood check-in */}
      <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
        <h2 className="font-lexend font-700 text-on-surface mb-3">How are you feeling today?</h2>
        <div className="flex gap-4">
          {moodLabels.map((emoji, i) => (
            <button key={i} onClick={() => setMood(i)} className={`text-3xl rounded-xl p-2 transition-all ${mood === i ? 'bg-tertiary/20 scale-110' : 'hover:bg-surface-low'}`}>{emoji}</button>
          ))}
        </div>
        {mood !== null && <p className="mt-2 text-sm text-tertiary font-jakarta">Thanks for sharing! Your wellbeing matters. 💚</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <h2 className="font-lexend font-700 text-on-surface mb-4">Upcoming Events</h2>
          {events.length === 0 ? <p className="text-sm text-on-surface-variant font-jakarta">No upcoming events</p> : events.map(e => (
            <div key={e.id} className="flex items-start gap-3 py-2 border-b border-outline-variant/20 last:border-0">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-jakarta font-700 text-on-surface text-sm">{e.title}</p>
                <p className="text-xs text-on-surface-variant">{new Date(e.event_date).toLocaleDateString()}{e.location ? ` · ${e.location}` : ''}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Announcements */}
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <h2 className="font-lexend font-700 text-on-surface mb-4">Announcements</h2>
          {announcements.length === 0 ? <p className="text-sm text-on-surface-variant font-jakarta">No announcements</p> : announcements.map(a => (
            <div key={a.id} className="py-2 border-b border-outline-variant/20 last:border-0">
              <p className="font-jakarta font-700 text-on-surface text-sm">{a.title}</p>
              {a.body && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{a.body}</p>}
              <p className="text-xs text-on-surface-variant mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Events Section ───────────────────────────────────────────────────────────
function EventsSection({ institutionId, canCreate }: { institutionId: string | null; canCreate: boolean }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', event_date: '', location: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [rsvps, setRsvps] = useState<Record<string, { count: number; mine: boolean }>>({});
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const load = async () => {
    if (!institutionId) return;
    setLoading(true);
    const { data } = await supabase.from('ct_events').select('id,title,event_date,location,description').eq('institution_id', institutionId).order('event_date').limit(50);
    setEvents((data || []) as Event[]);
    setLoading(false);
  };

  const loadRsvps = async (eventIds: string[]) => {
    if (!eventIds.length || !user) return;
    const { data } = await supabase.from('ct_event_rsvps').select('event_id,user_id,student_id').in('event_id', eventIds);
    const map: Record<string, { count: number; mine: boolean }> = {};
    for (const r of (data || [])) {
      if (!map[r.event_id]) map[r.event_id] = { count: 0, mine: false };
      map[r.event_id].count++;
      if (r.student_id === user.id || r.user_id === user.id) map[r.event_id].mine = true;
    }
    setRsvps(map);
  };

  useEffect(() => { load(); }, [institutionId]);
  useEffect(() => { if (events.length) loadRsvps(events.map(e => e.id)); }, [events, user?.id]);

  const toggleRsvp = async (eventId: string) => {
    if (!user) return;
    setRsvpLoading(eventId);
    const current = rsvps[eventId];
    if (current?.mine) {
      await supabase.from('ct_event_rsvps').delete().eq('event_id', eventId).eq('user_id', user.id);
      setRsvps(r => ({ ...r, [eventId]: { count: (r[eventId]?.count || 1) - 1, mine: false } }));
    } else {
      await supabase.from('ct_event_rsvps').upsert({ event_id: eventId, user_id: user.id, status: 'attending' }, { onConflict: 'event_id,user_id' });
      setRsvps(r => ({ ...r, [eventId]: { count: (r[eventId]?.count || 0) + 1, mine: true } }));
    }
    setRsvpLoading(null);
  };

  const save = async () => {
    if (!form.title || !form.event_date || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_events').insert({ ...form, institution_id: institutionId });
    setForm({ title: '', event_date: '', location: '', description: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend font-900 text-2xl text-on-surface">Events</h1>
        {canCreate && (
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors">
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <h3 className="font-lexend font-700 text-on-surface mb-4">New Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input type="datetime-local" className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Event'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm hover:bg-outline/20 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(e => {
            const r = rsvps[e.id];
            return (
              <div key={e.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                    <Calendar size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-jakarta font-700 text-on-surface">{e.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{new Date(e.event_date).toLocaleString()}</p>
                    {e.location && <p className="text-xs text-on-surface-variant">{e.location}</p>}
                    {e.description && <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{e.description}</p>}
                    {r?.count ? <p className="text-xs text-tertiary mt-1">{r.count} attending</p> : null}
                  </div>
                </div>
                <button
                  onClick={() => toggleRsvp(e.id)}
                  disabled={rsvpLoading === e.id}
                  className={`mt-3 w-full py-2 rounded-xl text-sm font-jakarta font-700 transition-colors flex items-center justify-center gap-2 ${r?.mine ? 'bg-tertiary text-white hover:bg-tertiary/90' : 'bg-secondary text-white hover:bg-secondary/90'} disabled:opacity-50`}
                >
                  {rsvpLoading === e.id ? <Loader2 size={14} className="animate-spin" /> : r?.mine ? <><CheckCircle size={14} /> Attending</> : 'RSVP'}
                </button>
              </div>
            );
          })}
          {events.length === 0 && <p className="text-on-surface-variant font-jakarta col-span-2 text-center py-12">No events found</p>}
        </div>
      )}
    </div>
  );
}

// ─── Clubs Section ────────────────────────────────────────────────────────────
function ClubsSection({ institutionId, isLeader, userId }: { institutionId: string | null; isLeader: boolean; userId?: string }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_clubs').select('id,name,description,member_count').eq('institution_id', institutionId).limit(50).then(({ data }) => {
      setClubs((data || []) as Club[]);
      setLoading(false);
    });
  }, [institutionId]);

  useEffect(() => {
    if (!userId) return;
    supabase.from('ct_club_members').select('club_id').eq('user_id', userId).then(({ data }) => {
      setJoinedClubs(new Set((data || []).map(m => m.club_id)));
    });
  }, [userId]);

  const join = async (clubId: string) => {
    if (!userId || joining) return;
    setJoining(clubId);
    // Check if already a member first
    const { data: existing } = await supabase.from('ct_club_members').select('id').eq('club_id', clubId).eq('user_id', userId).maybeSingle();
    if (!existing) {
      await supabase.from('ct_club_members').insert({ club_id: clubId, user_id: userId, role: 'member', status: 'active' });
    }
    setJoinedClubs(prev => new Set([...prev, clubId]));
    setJoining(null);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Clubs</h1>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(c => (
            <div key={c.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center mb-3">
                <Users size={18} className="text-secondary" />
              </div>
              <p className="font-lexend font-700 text-on-surface">{c.name}</p>
              {c.description && <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{c.description}</p>}
              {c.member_count != null && <p className="text-xs text-on-surface-variant mt-2">{c.member_count} members</p>}
              {!isLeader && (
                joinedClubs.has(c.id) ? (
                  <div className="mt-3 w-full py-2 rounded-xl bg-tertiary-container text-tertiary text-sm font-jakarta font-700 flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Member
                  </div>
                ) : (
                  <button
                    onClick={() => join(c.id)}
                    disabled={joining === c.id}
                    className="mt-3 w-full py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  >
                    {joining === c.id ? 'Joining...' : 'Join Club'}
                  </button>
                )
              )}
            </div>
          ))}
          {clubs.length === 0 && <p className="text-on-surface-variant font-jakarta col-span-3 text-center py-12">No clubs found</p>}
        </div>
      )}
    </div>
  );
}

// ─── Venue Booking ────────────────────────────────────────────────────────────
function VenueSection({ institutionId }: { institutionId: string | null }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', start_time: '', end_time: '', purpose: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!institutionId) return;
    // Query venues without institution filter (venues may not have institution_id set)
    supabase.from('ct_venues').select('id,name,capacity,location').limit(20).then(({ data }) => {
      setVenues((data || []) as Venue[]);
      setLoading(false);
    });
  }, [institutionId]);

  const submit = async (venueId: string) => {
    if (!form.date || !user) return;
    setSaving(true);
    await supabase.from('ct_venue_bookings').insert({
      venue_id: venueId,
      booked_by: user.id, start_time: form.date + 'T' + form.start_time,
      end_time: form.date + 'T' + form.end_time,
      purpose: form.purpose, status: 'pending',
      org_id: institutionId,
    });
    setBooking(null);
    setSaving(false);
    alert('Booking request submitted!');
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Venue Booking</h1>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues.map(v => (
            <div key={v.id} className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center"><MapPin size={18} className="text-primary" /></div>
                <div className="flex-1">
                  <p className="font-lexend font-700 text-on-surface">{v.name}</p>
                  {v.location && <p className="text-xs text-on-surface-variant">{v.location}</p>}
                  {v.capacity && <p className="text-xs text-on-surface-variant">Capacity: {v.capacity}</p>}
                </div>
              </div>
              {booking === v.id ? (
                <div className="mt-4 space-y-3">
                  <input type="date" className="w-full border border-outline-variant rounded-xl px-3 py-2 font-jakarta text-sm bg-surface" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="time" className="border border-outline-variant rounded-xl px-3 py-2 font-jakarta text-sm bg-surface" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                    <input type="time" className="border border-outline-variant rounded-xl px-3 py-2 font-jakarta text-sm bg-surface" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                  </div>
                  <input className="w-full border border-outline-variant rounded-xl px-3 py-2 font-jakarta text-sm bg-surface" placeholder="Purpose" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                  <div className="flex gap-2">
                    <button onClick={() => submit(v.id)} disabled={saving} className="flex-1 py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors disabled:opacity-50">{saving ? 'Submitting...' : 'Submit Request'}</button>
                    <button onClick={() => setBooking(null)} className="px-4 py-2 rounded-xl bg-surface-low text-on-surface-variant text-sm font-jakarta">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setBooking(v.id)} className="mt-3 w-full py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors">Book Venue</button>
              )}
            </div>
          ))}
          {venues.length === 0 && <p className="text-on-surface-variant font-jakarta col-span-2 text-center py-12">No venues available</p>}
        </div>
      )}
    </div>
  );
}

// ─── Announcements ────────────────────────────────────────────────────────────
function AnnouncementsSection({ institutionId, canCreate }: { institutionId: string | null; canCreate: boolean }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_announcements').select('id,title,body,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(20);
    setAnnouncements((data || []) as Announcement[]);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.title || !institutionId || !user) return;
    setSaving(true);
    await supabase.from('ct_announcements').insert({ ...form, institution_id: institutionId, created_by: user.id });
    setForm({ title: '', body: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend font-900 text-2xl text-on-surface">Announcements</h1>
        {canCreate && (
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors">
            <Plus size={16} /> Post Announcement
          </button>
        )}
      </div>
      {showCreate && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface mb-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary" rows={4} placeholder="Announcement body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
          <div className="flex gap-3 mt-3">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50">{saving ? 'Posting...' : 'Post'}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <p className="font-lexend font-700 text-on-surface">{a.title}</p>
            {a.body && <p className="text-sm text-on-surface-variant mt-1">{a.body}</p>}
            <p className="text-xs text-on-surface-variant mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No announcements yet</p>}
      </div>
    </div>
  );
}

// ─── Budget Section ───────────────────────────────────────────────────────────
function BudgetSection({ institutionId }: { institutionId: string | null }) {
  const [transactions, setTransactions] = useState<Array<{ id: string; description: string; amount: number; category: string | null; created_at: string }>>([]);
  const [form, setForm] = useState({ description: '', amount: '', transaction_type: 'expense' });
  const [saving, setSaving] = useState(false);
  const [budgetId, setBudgetId] = useState<string | null>(null);

  const ensureBudget = async () => {
    if (!institutionId) return null;
    const { data: existing } = await supabase.from('ct_budgets').select('id').eq('institution_id', institutionId).limit(1).maybeSingle();
    if (existing?.id) return existing.id;
    const { data: created } = await supabase.from('ct_budgets').insert({ institution_id: institutionId, fiscal_year: new Date().getFullYear(), total_allocated: 0, total_spent: 0 }).select('id').single();
    return created?.id ?? null;
  };

  const load = async () => {
    const bId = await ensureBudget();
    setBudgetId(bId);
    if (!bId) return;
    const { data } = await supabase.from('ct_budget_items').select('id,description,amount,category,created_at').eq('budget_id', bId).order('created_at', { ascending: false }).limit(20);
    setTransactions(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.description || !form.amount) return;
    const bId = budgetId || await ensureBudget();
    if (!bId) return;
    setSaving(true);
    await supabase.from('ct_budget_items').insert({ description: form.description, amount: parseFloat(form.amount), budget_id: bId, category: form.transaction_type });
    setForm({ description: '', amount: '', transaction_type: 'expense' });
    setSaving(false);
    load();
  };

  const balance = transactions.reduce((acc, t) => acc + (t.category === 'income' ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Club Budget</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary-container rounded-2xl p-4 text-center">
          <p className="text-xs font-jakarta text-primary mb-1">Balance</p>
          <p className="font-lexend font-900 text-xl text-primary">${balance.toFixed(2)}</p>
        </div>
        <div className="bg-tertiary-container rounded-2xl p-4 text-center">
          <p className="text-xs font-jakarta text-tertiary mb-1">Income</p>
          <p className="font-lexend font-900 text-xl text-tertiary">${transactions.filter(t => t.category === 'income').reduce((a, t) => a + t.amount, 0).toFixed(2)}</p>
        </div>
        <div className="bg-secondary-container rounded-2xl p-4 text-center">
          <p className="text-xs font-jakarta text-secondary mb-1">Expenses</p>
          <p className="font-lexend font-900 text-xl text-secondary">${transactions.filter(t => t.category !== 'income').reduce((a, t) => a + t.amount, 0).toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Add Transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input type="number" className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          <select className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={form.transaction_type} onChange={e => setForm(f => ({ ...f, transaction_type: e.target.value }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <button onClick={save} disabled={saving} className="mt-3 px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Add Transaction'}</button>
      </div>
      <div className="space-y-2">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center justify-between bg-surface-lowest rounded-xl p-3 border border-outline-variant/20">
            <div>
              <p className="font-jakarta font-700 text-on-surface text-sm">{t.description}</p>
              <p className="text-xs text-on-surface-variant">{new Date(t.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`font-jakarta font-700 ${t.category === 'income' ? 'text-tertiary' : 'text-secondary'}`}>
              {t.category === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sports Section ───────────────────────────────────────────────────────────
interface Challenge {
  id: string;
  title: string | null;
  description: string | null;
  sport: string;
  status: string;
  is_open: boolean;
  scheduled_at: string | null;
  challenger_score: number | null;
  challenged_score: number | null;
  institution_id: string | null;
}
interface SportRanking { user_id: string; sport: string; wins: number; losses: number; points: number; }

function SportsSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [leagues, setLeagues] = useState<Array<{ id: string; name: string; sport: string; status: string }>>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rankings, setRankings] = useState<SportRanking[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [challengeForm, setChallengeForm] = useState({ title: '', description: '', sport: 'Basketball', scheduled_at: '' });
  const [postScore, setPostScore] = useState<{ id: string; myScore: string; oppScore: string } | null>(null);
  const [freeAgent, setFreeAgent] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!institutionId) return;
    supabase.from('ct_sports_leagues').select('id,name,sport,status').eq('institution_id', institutionId).limit(20).then(({ data }) => setLeagues(data || []));
    supabase.from('ct_sports_challenges').select('*').eq('institution_id', institutionId).eq('is_open', true).order('scheduled_at').limit(30).then(({ data }) => setChallenges((data || []) as Challenge[]));
    supabase.from('ct_sport_rankings').select('*').eq('institution_id', institutionId).order('points', { ascending: false }).limit(20).then(({ data }) => setRankings((data || []) as SportRanking[]));
    if (userId) supabase.from('ct_users').select('free_agent').eq('id', userId).maybeSingle().then(({ data }) => setFreeAgent(data?.free_agent || false));
  };

  useEffect(() => { load(); }, [institutionId, userId]);

  const createChallenge = async () => {
    if (!userId || !institutionId || !challengeForm.title) return;
    setSaving(true);
    // Need ct_students.id for challenger_id FK
    const { data: student } = await supabase.from('ct_students').select('id').eq('email', (await supabase.from('ct_users').select('email').eq('id', userId).maybeSingle()).data?.email || '').maybeSingle();
    await supabase.from('ct_sports_challenges').insert({
      title: challengeForm.title,
      description: challengeForm.description,
      sport: challengeForm.sport,
      scheduled_at: challengeForm.scheduled_at || null,
      status: 'open',
      is_open: true,
      institution_id: institutionId,
      challenger_id: student?.id || null,
    });
    setChallengeForm({ title: '', description: '', sport: 'Basketball', scheduled_at: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  const acceptChallenge = async (challengeId: string) => {
    if (!userId) return;
    await supabase.from('ct_challenge_participants').upsert({ challenge_id: challengeId, user_id: userId }, { onConflict: 'challenge_id,user_id' });
    await supabase.from('ct_notifications').insert({ user_id: userId, type: 'challenge_accepted', title: 'Challenge Accepted', message: 'You have accepted a sports challenge. See you on the field!' });
    load();
  };

  const postResult = async () => {
    if (!postScore || !userId) return;
    const myS = parseInt(postScore.myScore);
    const oppS = parseInt(postScore.oppScore);
    await supabase.from('ct_sports_challenges').update({
      challenger_score: myS,
      challenged_score: oppS,
      status: 'completed',
      result_posted_at: new Date().toISOString(),
      result_posted_by: userId,
    }).eq('id', postScore.id);
    // Update rankings
    const { data: c } = await supabase.from('ct_sports_challenges').select('sport,institution_id').eq('id', postScore.id).maybeSingle();
    if (c && userId) {
      const won = myS > oppS;
      await supabase.from('ct_sport_rankings').upsert({
        user_id: userId,
        institution_id: c.institution_id,
        sport: c.sport,
        wins: won ? 1 : 0,
        losses: won ? 0 : 1,
        points: won ? 30 : 10,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,institution_id,sport' });
    }
    setPostScore(null);
    load();
  };

  const toggleFreeAgent = async () => {
    if (!userId) return;
    const newVal = !freeAgent;
    await supabase.from('ct_users').update({ free_agent: newVal }).eq('id', userId);
    setFreeAgent(newVal);
  };

  const SPORTS = ['Basketball', 'Soccer', 'Tennis', 'Volleyball', 'Swimming', 'Track', 'Badminton', 'Table Tennis'];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #FF7F50, #ff6030)' }}>
        <h1 className="font-lexend font-900 text-2xl mb-1">Sports Hub</h1>
        <p className="font-jakarta text-white/80 text-sm">Leagues, open challenges, and campus rankings</p>
      </div>

      {/* Free Agent toggle */}
      <div className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
        <div>
          <p className="font-lexend font-700 text-on-surface">Free Agent Status</p>
          <p className="text-xs text-on-surface-variant font-jakarta">Make yourself available for teams looking for players</p>
        </div>
        <button onClick={toggleFreeAgent} className={`w-12 h-6 rounded-full transition-colors ${freeAgent ? 'bg-secondary' : 'bg-outline-variant'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${freeAgent ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Leagues */}
      {leagues.length > 0 && (
        <div>
          <h2 className="font-lexend font-700 text-lg text-on-surface mb-3">Active Leagues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leagues.map(l => (
              <div key={l.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center"><Trophy size={18} className="text-secondary" /></div>
                  <div>
                    <p className="font-lexend font-700 text-on-surface">{l.name}</p>
                    <p className="text-xs text-on-surface-variant">{l.sport} · {l.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Challenges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-lexend font-700 text-lg text-on-surface">Open Challenges</h2>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors">
            <Plus size={14} /> Post Challenge
          </button>
        </div>

        {showCreate && (
          <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30 mb-4 space-y-3">
            <input value={challengeForm.title} onChange={e => setChallengeForm(f => ({ ...f, title: e.target.value }))} placeholder="Challenge title (e.g. 3v3 Basketball)" className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm font-jakarta" />
            <textarea value={challengeForm.description} onChange={e => setChallengeForm(f => ({ ...f, description: e.target.value }))} placeholder="Details, location, rules..." rows={2} className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm font-jakarta resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={challengeForm.sport} onChange={e => setChallengeForm(f => ({ ...f, sport: e.target.value }))} className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm font-jakarta">
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="datetime-local" value={challengeForm.scheduled_at} onChange={e => setChallengeForm(f => ({ ...f, scheduled_at: e.target.value }))} className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm font-jakarta" />
            </div>
            <button onClick={createChallenge} disabled={saving || !challengeForm.title} className="w-full py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 disabled:opacity-50">
              {saving ? 'Posting...' : 'Post Open Challenge'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {challenges.map(c => (
            <div key={c.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-lexend font-700 text-on-surface">{c.title || c.sport + ' Challenge'}</p>
                  {c.description && <p className="text-sm text-on-surface-variant font-jakarta mt-0.5">{c.description}</p>}
                  <p className="text-xs text-on-surface-variant font-jakarta mt-1">{c.sport} {c.scheduled_at ? '· ' + new Date(c.scheduled_at).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {c.status === 'open' && (
                    <button onClick={() => acceptChallenge(c.id)} className="px-3 py-1.5 rounded-xl bg-tertiary text-white text-xs font-jakarta font-700 hover:bg-tertiary/90 transition-colors whitespace-nowrap">
                      Accept
                    </button>
                  )}
                  {c.status === 'open' && (
                    <button onClick={() => setPostScore({ id: c.id, myScore: '', oppScore: '' })} className="px-3 py-1.5 rounded-xl bg-secondary-container text-secondary text-xs font-jakarta font-700 hover:bg-secondary/10 transition-colors whitespace-nowrap">
                      Post Score
                    </button>
                  )}
                  {c.status === 'completed' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-tertiary-container text-tertiary font-jakarta font-700">
                      {c.challenger_score} - {c.challenged_score}
                    </span>
                  )}
                </div>
              </div>
              {postScore?.id === c.id && (
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" placeholder="Your score" value={postScore.myScore} onChange={e => setPostScore(s => s ? { ...s, myScore: e.target.value } : null)} className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-sm font-jakarta" />
                  <span className="text-on-surface-variant">vs</span>
                  <input type="number" placeholder="Opponent score" value={postScore.oppScore} onChange={e => setPostScore(s => s ? { ...s, oppScore: e.target.value } : null)} className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-sm font-jakarta" />
                  <button onClick={postResult} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-jakarta font-700">Save</button>
                </div>
              )}
            </div>
          ))}
          {challenges.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-8">No open challenges yet. Be the first to post one!</p>}
        </div>
      </div>

      {/* Campus Rankings */}
      {rankings.length > 0 && (
        <div>
          <h2 className="font-lexend font-700 text-lg text-on-surface mb-3">Campus Rankings</h2>
          <div className="bg-surface-lowest rounded-2xl shadow-float border border-outline-variant/30 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-surface-container text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest">
              <span>Player</span><span className="text-center">Sport</span><span className="text-center">W-L</span><span className="text-center">Points</span>
            </div>
            {rankings.map((r, i) => (
              <div key={r.user_id + r.sport} className="grid grid-cols-4 gap-2 px-4 py-3 border-t border-outline-variant/20 items-center">
                <span className="font-jakarta font-700 text-on-surface text-sm">#{i + 1}</span>
                <span className="text-xs font-jakarta text-on-surface-variant text-center">{r.sport}</span>
                <span className="text-xs font-jakarta text-on-surface text-center">{r.wins}-{r.losses}</span>
                <span className="text-sm font-lexend font-700 text-secondary text-center">{r.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Wellness Section ─────────────────────────────────────────────────────────
function WellnessSection({ userId, institutionId }: { userId?: string; institutionId: string | null }) {
  const [happinessScore, setHappinessScore] = useState(5);
  const [stressScore, setStressScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [trend, setTrend] = useState<{ date: string; happiness_score: number | null; stress_score: number | null }[]>([]);

  useEffect(() => {
    if (!userId) return;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    supabase.from('ct_wellbeing_checks').select('date,happiness_score,stress_score').eq('user_id', userId).gte('date', sevenDaysAgo).order('date').then(({ data }) => {
      setTrend((data || []).map(d => ({ date: d.date, happiness_score: d.happiness_score, stress_score: d.stress_score })));
    });
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('ct_wellbeing_checks').insert({
      user_id: userId,
      happiness_score: happinessScore,
      stress_score: stressScore,
      notes,
      date: new Date().toISOString().split('T')[0],
    });
    setSaving(false);
    setSaved(true);
    setNotes('');
    setTimeout(() => setSaved(false), 2000);
  };

  const resources = [
    { title: 'Campus Counseling', desc: 'Book a free counseling session', color: 'bg-tertiary-container', text: 'text-tertiary' },
    { title: 'Mental Health Hotline', desc: '24/7 support: 1-800-273-8255', color: 'bg-primary-container', text: 'text-primary' },
    { title: 'Mindfulness Resources', desc: 'Guided meditations and breathing exercises', color: 'bg-secondary-container', text: 'text-secondary' },
    { title: 'Peer Support Groups', desc: 'Connect with fellow students', color: 'bg-tertiary-container', text: 'text-tertiary' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #00A86B, #00c77e)' }}>
        <h1 className="font-lexend font-900 text-2xl mb-1">Your Wellness Hub</h1>
        <p className="font-jakarta text-white/80 text-sm">Mental health, physical wellness, and support resources</p>
      </div>

      <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Daily Check-In</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-jakarta font-700 text-on-surface-variant mb-2">Happiness: {happinessScore}/10</label>
            <input type="range" min={1} max={10} value={happinessScore} onChange={e => setHappinessScore(parseInt(e.target.value))} className="w-full accent-tertiary" />
          </div>
          <div>
            <label className="block text-sm font-jakarta font-700 text-on-surface-variant mb-2">Stress Level: {stressScore}/10</label>
            <input type="range" min={1} max={10} value={stressScore} onChange={e => setStressScore(parseInt(e.target.value))} className="w-full accent-secondary" />
          </div>
          <div>
            <label className="block text-sm font-jakarta font-700 text-on-surface-variant mb-1">Notes (optional)</label>
            <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={2} placeholder="How are you feeling today?" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button onClick={save} disabled={saving} className={`px-6 py-2.5 rounded-xl font-jakarta font-700 text-sm text-white transition-colors ${saved ? 'bg-tertiary' : 'bg-primary hover:bg-primary/90'} disabled:opacity-50`}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Check-In'}
          </button>
        </div>
      </div>

      {trend.length > 0 && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <h3 className="font-lexend font-700 text-on-surface mb-3">7-Day Trend</h3>
          <div className="space-y-2">
            {trend.map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-jakarta">
                <span className="text-on-surface-variant w-20 flex-shrink-0">{new Date(t.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex-1 flex gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-tertiary">H:</span>
                    <div className="w-16 h-2 bg-surface-low rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary rounded-full" style={{ width: `${((t.happiness_score || 0) / 10) * 100}%` }} />
                    </div>
                    <span>{t.happiness_score ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-secondary">S:</span>
                    <div className="w-16 h-2 bg-surface-low rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${((t.stress_score || 0) / 10) * 100}%` }} />
                    </div>
                    <span>{t.stress_score ?? '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((r, i) => (
          <div key={i} className={`${r.color} rounded-2xl p-5 shadow-float border border-outline-variant/30`}>
            <p className={`font-lexend font-700 ${r.text} mb-1`}>{r.title}</p>
            <p className="text-sm text-on-surface-variant">{r.desc}</p>
            <button className="mt-3 px-4 py-2 rounded-xl bg-white/80 text-on-surface text-sm font-jakarta font-700 hover:bg-white transition-colors">Learn More</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Surveys Section ──────────────────────────────────────────────────────────
function SurveysSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_surveys').select('id,title,description,status').eq('institution_id', institutionId).eq('status', 'published').limit(20).then(({ data }) => setSurveys((data || []) as Survey[]));
  }, [institutionId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Surveys</h1>
      <div className="space-y-3">
        {surveys.map(s => (
          <div key={s.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
            <div>
              <p className="font-lexend font-700 text-on-surface">{s.title}</p>
              {s.description && <p className="text-sm text-on-surface-variant mt-0.5">{s.description}</p>}
            </div>
            <button className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors ml-4 flex-shrink-0">Take Survey</button>
          </div>
        ))}
        {surveys.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No active surveys</p>}
      </div>
    </div>
  );
}

// ─── Grades Section ───────────────────────────────────────────────────────────
function GradesSection({ userId }: { userId?: string }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase.from('ct_grades').select('id,grade,max_points,feedback,assignment_id,graded_at').eq('student_id', userId).order('graded_at', { ascending: false }).limit(50).then(({ data }) => {
      setGrades((data as unknown as Grade[]) || []);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">My Grades</h1>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div> : (
        <div className="space-y-3">
          {grades.map(g => (
            <div key={g.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
              <div>
                <p className="font-jakarta font-700 text-on-surface text-sm">Assignment</p>
                {(g as unknown as { feedback?: string }).feedback && <p className="text-xs text-on-surface-variant mt-0.5">{(g as unknown as { feedback: string }).feedback}</p>}
                <p className="text-xs text-on-surface-variant">{new Date((g as unknown as { graded_at?: string }).graded_at || g.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-lexend font-900 text-2xl text-primary">
                  {(g as unknown as { grade?: number }).grade ?? g.score ?? g.letter_grade ?? '-'}/{(g as unknown as { max_points?: number }).max_points || 100}
                </p>
              </div>
            </div>
          ))}
          {grades.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No grades yet</p>}
        </div>
      )}
    </div>
  );
}

// ─── Courses Section (Student) ────────────────────────────────────────────────
function CoursesSection({ userId }: { userId?: string }) {
  const [enrollments, setEnrollments] = useState<{
    id: string;
    course: { id: string; name: string; code: string };
    assignments: { id: string; title: string; due_date: string | null; max_points: number | null; docs: { id: string; name: string; url: string }[] }[];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const submitInputRef = React.useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!userId) return;
    const { data: enr } = await supabase.from('ct_course_enrollments').select('id,course_id').eq('student_id', userId);
    const courseIds = (enr || []).map(e => e.course_id);
    if (!courseIds.length) { setLoading(false); return; }

    const { data: courses } = await supabase.from('ct_courses').select('id,name,code').in('id', courseIds);
    const { data: assignments } = await supabase.from('ct_assignments').select('id,title,due_date,max_points,course_id').in('course_id', courseIds);
    const assignmentIds = (assignments || []).map(a => a.id);
    const { data: docs } = assignmentIds.length ? await supabase.from('ct_assignment_documents').select('id,name,url,assignment_id').in('assignment_id', assignmentIds) : { data: [] };

    const result = (courses || []).map(c => ({
      id: (enr || []).find(e => e.course_id === c.id)?.id || c.id,
      course: c,
      assignments: (assignments || []).filter(a => a.course_id === c.id).map(a => ({
        ...a,
        docs: (docs || []).filter(d => d.assignment_id === a.id),
      })),
    }));
    setEnrollments(result);
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  const submitAssignment = async (file: File, assignmentId: string) => {
    if (!userId || !file) return;
    setSubmitting(assignmentId);
    // Upsert submission
    const { data: sub } = await supabase.from('ct_assignment_submissions')
      .upsert({ assignment_id: assignmentId, student_id: userId }, { onConflict: 'assignment_id,student_id' })
      .select('id').single();
    if (sub?.id) {
      const path = `${assignmentId}/${userId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('ct-submissions').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('ct-submissions').getPublicUrl(path);
        await supabase.from('ct_submission_files').insert({ submission_id: sub.id, name: file.name, url: urlData.publicUrl, mime_type: file.type, size_bytes: file.size });
      }
    }
    setSubmitting(null);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">My Courses</h1>
      {enrollments.length === 0 ? (
        <p className="text-on-surface-variant font-jakarta text-center py-12">Not enrolled in any courses yet</p>
      ) : enrollments.map(e => (
        <div key={e.id} className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-lexend font-700 text-on-surface">{e.course.name}</p>
              <p className="text-xs text-on-surface-variant">{e.course.code}</p>
            </div>
          </div>
          {e.assignments.length === 0 ? (
            <p className="text-sm text-on-surface-variant font-jakarta">No assignments for this course</p>
          ) : (
            <div className="space-y-3">
              {e.assignments.map(a => (
                <div key={a.id} className="bg-surface rounded-xl p-3 border border-outline-variant/20">
                  <p className="font-jakarta font-700 text-sm text-on-surface">{a.title}</p>
                  {a.due_date && <p className="text-xs text-on-surface-variant">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.docs.map(d => (
                      <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary font-jakarta hover:underline">
                        <Download size={11} /> {d.name}
                      </a>
                    ))}
                    <button
                      onClick={() => { (submitInputRef.current as HTMLInputElement & { _assignmentId?: string })?. _assignmentId && null; (submitInputRef.current as HTMLInputElement & { _assignmentId?: string })._assignmentId = a.id; submitInputRef.current?.click(); }}
                      disabled={submitting === a.id}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-secondary-container text-secondary font-jakarta font-700"
                    >
                      <Upload size={11} /> {submitting === a.id ? 'Uploading...' : 'Submit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <input
        ref={submitInputRef}
        type="file"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          const aId = (submitInputRef.current as HTMLInputElement & { _assignmentId?: string })?._assignmentId;
          if (f && aId) submitAssignment(f, aId);
          if (submitInputRef.current) submitInputRef.current.value = '';
        }}
      />
    </div>
  );
}

// ─── My Clubs Section (Club Leader) ──────────────────────────────────────────
function MyClubsSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [clubs, setClubs] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [members, setMembers] = useState<{ id: string; user_id: string; user?: { full_name: string | null; email: string } }[]>([]);
  const [notifMsg, setNotifMsg] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    // Get clubs where this user is a leader
    const { data: memberData } = await supabase.from('ct_club_members').select('club_id').eq('user_id', userId || '').eq('role', 'leader');
    const clubIds = (memberData || []).map(m => m.club_id);
    if (!clubIds.length) { setClubs([]); return; }
    const { data } = await supabase.from('ct_clubs').select('id,name,description').in('id', clubIds);
    setClubs(data || []);
  };

  useEffect(() => { load(); }, [institutionId, userId]);

  const createClub = async () => {
    if (!form.name || !institutionId || !userId) return;
    setSaving(true);
    const { data } = await supabase.from('ct_clubs').insert({ name: form.name, description: form.description, institution_id: institutionId }).select('id').single();
    if (data?.id) {
      await supabase.from('ct_club_members').insert({ club_id: data.id, user_id: userId, role: 'leader' });
    }
    setForm({ name: '', description: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  const loadMembers = async (clubId: string) => {
    setSelectedClub(clubId);
    const { data } = await supabase.from('ct_club_members').select('id,user_id').eq('club_id', clubId);
    const enriched = [];
    for (const m of (data || [])) {
      const { data: u } = await supabase.from('ct_users').select('full_name,email').eq('id', m.user_id).maybeSingle();
      enriched.push({ ...m, user: u || undefined });
    }
    setMembers(enriched);
  };

  const sendNotification = async (clubId: string) => {
    if (!notifMsg) return;
    setSendingNotif(true);
    const club = clubs.find(c => c.id === clubId);
    const rows = members.map(m => ({
      user_id: m.user_id,
      type: 'club_announcement',
      title: `${club?.name}: New Announcement`,
      message: notifMsg,
    }));
    if (rows.length) await supabase.from('ct_notifications').insert(rows);
    setNotifMsg('');
    setSendingNotif(false);
    alert('Notification sent to all members!');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend font-900 text-2xl text-on-surface">My Clubs</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors">
          <Plus size={16} /> Create Club
        </button>
      </div>

      {showCreate && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface mb-3" placeholder="Club Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-3 mt-4">
            <button onClick={createClub} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {clubs.length === 0 && !showCreate && (
        <p className="text-on-surface-variant font-jakarta text-center py-12">No clubs managed yet. Create one above.</p>
      )}

      {clubs.map(c => (
        <div key={c.id} className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-lexend font-700 text-on-surface">{c.name}</p>
              {c.description && <p className="text-sm text-on-surface-variant">{c.description}</p>}
            </div>
            <button onClick={() => selectedClub === c.id ? setSelectedClub(null) : loadMembers(c.id)} className="text-xs px-3 py-1.5 rounded-lg bg-primary-container text-primary font-jakarta font-700">
              {selectedClub === c.id ? 'Hide Members' : 'Manage'}
            </button>
          </div>

          {selectedClub === c.id && (
            <div className="space-y-3 mt-4">
              <h4 className="font-jakarta font-700 text-sm text-on-surface">Members ({members.length})</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-2 py-1">
                    <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                      <span className="text-primary text-xs">{m.user?.full_name?.charAt(0) || '?'}</span>
                    </div>
                    <span className="text-sm font-jakarta text-on-surface">{m.user?.full_name || m.user?.email || m.user_id.slice(-8)}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-jakarta font-700 text-sm text-on-surface mb-2">Send Notification to All Members</h4>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-outline-variant rounded-xl px-3 py-2 font-jakarta text-sm bg-surface"
                    placeholder="Message..."
                    value={notifMsg}
                    onChange={e => setNotifMsg(e.target.value)}
                  />
                  <button onClick={() => sendNotification(c.id)} disabled={sendingNotif || !notifMsg} className="px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm disabled:opacity-50">
                    <Bell size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Settings Section ─────────────────────────────────────────────────────────
function SettingsSection({ profile, userId, institutionId, role }: { profile: Record<string, unknown> | null; userId?: string; institutionId: string | null; role: string }) {
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: (profile?.full_name as string) || '',
    bio: (profile?.bio as string) || '',
    department: (profile?.department as string) || '',
    year_of_study: (profile?.year_of_study as string) || '',
    phone: (profile?.phone as string) || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('ct_users').update({ ...form, year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null }).eq('id', userId);
    await refreshProfile(userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setPwMsg('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    setPwMsg(error ? 'Error: ' + error.message : 'Password updated successfully');
    setNewPassword('');
    setTimeout(() => setPwMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Settings</h1>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Profile Photo</h3>
        {userId && (
          <ProfilePhotoUpload
            userId={userId}
            currentUrl={profile?.avatar_url as string | null}
            displayName={form.full_name}
          />
        )}
      </div>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'full_name', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            { label: 'Department', key: 'department', type: 'text' },
            { label: 'Year of Study', key: 'year_of_study', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">{field.label}</label>
              <input
                type={field.type}
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                value={(form as Record<string, string>)[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Bio</label>
            <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>
        <button onClick={save} disabled={saving} className={`mt-5 px-6 py-2.5 rounded-xl font-jakarta font-700 text-sm text-white transition-colors disabled:opacity-50 ${saved ? 'bg-tertiary' : 'bg-secondary hover:bg-secondary/90'}`}>
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        {userId && <NotificationPrefsPanel userId={userId} institutionId={institutionId} role={role} />}
      </div>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Change Password</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">New Password</label>
            <input
              type="password"
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
          <button onClick={changePassword} disabled={pwSaving} className="px-5 py-2.5 rounded-xl bg-primary text-white font-jakarta font-700 text-sm disabled:opacity-50">
            {pwSaving ? 'Updating...' : 'Update'}
          </button>
        </div>
        {pwMsg && <p className={`text-xs font-jakarta mt-2 ${pwMsg.startsWith('Error') ? 'text-red-500' : 'text-tertiary'}`}>{pwMsg}</p>}
      </div>
    </div>
  );
}
