import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Calendar, Users, MapPin, Megaphone, Wallet, Trophy, Heart,
  ClipboardList, User, LogOut, Menu, X, Plus, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationCenter from '../../components/ui/NotificationCenter';

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
    { id: 'grades', label: 'My Grades', icon: <ClipboardList size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
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
          {activeSection === 'sports' && <SportsSection institutionId={institutionId} />}
          {activeSection === 'wellness' && <WellnessSection />}
          {activeSection === 'surveys' && <SurveysSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'grades' && <GradesSection userId={user?.id} />}
          {activeSection === 'profile' && <ProfileSection profile={profile} userId={user?.id} />}
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

  const load = async () => {
    if (!institutionId) return;
    setLoading(true);
    const { data } = await supabase.from('ct_events').select('id,title,event_date,location,description').eq('institution_id', institutionId).order('event_date').limit(50);
    setEvents((data || []) as Event[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [institutionId]);

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
              {saving ? 'Saving…' : 'Save Event'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm hover:bg-outline/20 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(e => (
            <div key={e.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-jakarta font-700 text-on-surface">{e.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{new Date(e.event_date).toLocaleString()}</p>
                  {e.location && <p className="text-xs text-on-surface-variant">📍 {e.location}</p>}
                  {e.description && <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{e.description}</p>}
                </div>
              </div>
              <button className="mt-3 w-full py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors">RSVP</button>
            </div>
          ))}
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

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_clubs').select('id,name,description,member_count').eq('institution_id', institutionId).limit(50).then(({ data }) => {
      setClubs((data || []) as Club[]);
      setLoading(false);
    });
  }, [institutionId]);

  const join = async (clubId: string) => {
    if (!userId) return;
    await supabase.from('ct_club_members').insert({ club_id: clubId, user_id: userId, role: 'member' });
    alert('Joined club!');
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
                <button onClick={() => join(c.id)} className="mt-3 w-full py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors">Join Club</button>
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
    supabase.from('ct_venues').select('id,name,capacity,location').eq('institution_id', institutionId).limit(20).then(({ data }) => {
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
      purpose: form.purpose, status: 'pending'
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
                    <button onClick={() => submit(v.id)} disabled={saving} className="flex-1 py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors disabled:opacity-50">{saving ? 'Submitting…' : 'Submit Request'}</button>
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
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50">{saving ? 'Posting…' : 'Post'}</button>
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
        <button onClick={save} disabled={saving} className="mt-3 px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Add Transaction'}</button>
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
function SportsSection({ institutionId }: { institutionId: string | null }) {
  const [leagues, setLeagues] = useState<Array<{ id: string; name: string; sport: string; status: string }>>([]);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_sports_leagues').select('id,name,sport,status').eq('institution_id', institutionId).limit(20).then(({ data }) => setLeagues(data || []));
  }, [institutionId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Sports</h1>
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
            <button className="mt-3 w-full py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors">Join as Free Agent</button>
          </div>
        ))}
        {leagues.length === 0 && <p className="text-on-surface-variant font-jakarta col-span-2 text-center py-12">No active leagues</p>}
      </div>
    </div>
  );
}

// ─── Wellness Section ─────────────────────────────────────────────────────────
function WellnessSection() {
  const resources = [
    { title: 'Campus Counseling', desc: 'Book a free counseling session', color: 'bg-tertiary-container', text: 'text-tertiary' },
    { title: 'Mental Health Hotline', desc: '24/7 support: 1-800-273-8255', color: 'bg-primary-container', text: 'text-primary' },
    { title: 'Mindfulness Resources', desc: 'Guided meditations and breathing exercises', color: 'bg-secondary-container', text: 'text-secondary' },
    { title: 'Peer Support Groups', desc: 'Connect with fellow students', color: 'bg-tertiary-container', text: 'text-tertiary' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #00A86B, #00c77e)' }}>
        <h1 className="font-lexend font-900 text-2xl mb-1">Your Wellness Hub 💚</h1>
        <p className="font-jakarta text-white/80 text-sm">Mental health, physical wellness, and support resources</p>
      </div>
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
    supabase.from('ct_grades').select('id,score,letter_grade,gpa_points,notes,assignment_id,created_at').eq('student_id', userId).order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      setGrades((data || []) as Grade[]);
      setLoading(false);
    });
  }, [userId]);

  const avgGpa = grades.length ? grades.reduce((a, g) => a + ((g as any).gpa_points || 0), 0) / grades.length : 0;

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">My Grades</h1>
      {grades.length > 0 && (
        <div className="bg-primary-container rounded-2xl p-4 flex items-center gap-4">
          <div>
            <p className="text-xs font-jakarta text-primary">Average GPA</p>
            <p className="font-lexend font-900 text-3xl text-primary">{avgGpa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-jakarta text-primary">{grades.length} graded assignments</p>
          </div>
        </div>
      )}
      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div> : (
        <div className="space-y-3">
          {grades.map(g => (
            <div key={g.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
              <div>
                <p className="font-jakarta font-700 text-on-surface text-sm">Assignment</p>
                {g.notes && <p className="text-xs text-on-surface-variant mt-0.5">{g.notes}</p>}
                <p className="text-xs text-on-surface-variant">{new Date(g.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-lexend font-900 text-2xl text-primary">{g.letter_grade || `${g.score}%`}</p>
                {(g as any).gpa_points && <p className="text-xs text-on-surface-variant">{(g as any).gpa_points} GPA</p>}
              </div>
            </div>
          ))}
          {grades.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No grades yet</p>}
        </div>
      )}
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection({ profile, userId }: { profile: any; userId?: string }) {
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    department: profile?.department || '',
    year_of_study: profile?.year_of_study || '',
    student_id_number: profile?.student_id_number || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('ct_users').update({ ...form, year_of_study: form.year_of_study ? parseInt(String(form.year_of_study)) : null }).eq('id', userId);
    await refreshProfile(userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">My Profile</h1>
      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            {form.avatar_url ? <img src={form.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" /> : <span className="text-white font-lexend font-900 text-xl">{form.full_name.charAt(0).toUpperCase()}</span>}
          </div>
          <div>
            <p className="font-lexend font-700 text-on-surface">{form.full_name}</p>
            <p className="text-sm text-on-surface-variant">{profile?.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'full_name', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            { label: 'Department', key: 'department', type: 'text' },
            { label: 'Year of Study', key: 'year_of_study', type: 'number' },
            { label: 'Student ID', key: 'student_id_number', type: 'text' },
            { label: 'Avatar URL', key: 'avatar_url', type: 'url' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">{field.label}</label>
              <input
                type={field.type}
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                value={(form as any)[field.key]}
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
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
