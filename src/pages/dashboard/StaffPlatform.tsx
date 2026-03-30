import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Bell, Calendar, MapPin, Megaphone, User, LogOut, Menu, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationCenter from '../../components/ui/NotificationCenter';

export default function StaffPlatform() {
  const { profile, user, institutionId, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'reports', label: 'Daily Reports', icon: <FileText size={18} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
    { id: 'venues', label: 'Venues', icon: <MapPin size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Staff';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant/30" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="text-white text-xs font-lexend font-900">CT</span>
        </div>
        <div>
          <p className="font-lexend font-900 text-white text-sm">Campus Tribe</p>
          <p className="text-xs font-jakarta text-white/70">Staff</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.id}>
              <button onClick={() => { setActiveSection(item.id); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-jakarta text-sm font-700 transition-all ${activeSection === item.id ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}>
                {item.icon} {item.label}
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
        <button onClick={handleSignOut} className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-jakarta text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full z-30 bg-surface-lowest shadow-float"><SidebarContent /></aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface-lowest border-b border-outline-variant/30 flex items-center gap-3 px-4 py-3">
        <button onClick={() => setMobileOpen(!mobileOpen)}><Menu size={22} className="text-on-surface" /></button>
        <p className="font-lexend font-900 text-on-surface text-sm flex-1">Campus Tribe</p>
        <NotificationCenter />
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col bg-surface-lowest shadow-xl"><SidebarContent /></aside>
        </div>
      )}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
          <div className="hidden lg:flex justify-end mb-4"><NotificationCenter /></div>
          {activeSection === 'overview' && <StaffOverviewSection institutionId={institutionId} />}
          {activeSection === 'reports' && <ReportsSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'events' && <EventsSection institutionId={institutionId} />}
          {activeSection === 'venues' && <VenueQueueSection institutionId={institutionId} />}
          {activeSection === 'announcements' && <AnnouncementsSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'profile' && <ProfileSection profile={profile} userId={user?.id} />}
        </div>
      </main>
    </div>
  );
}

function StaffOverviewSection({ institutionId }: { institutionId: string | null }) {
  const [stats, setStats] = useState({ users: 0, events: 0, venues: 0, announcements: 0 });
  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_users').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_events').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_venue_bookings').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId).eq('status', 'pending'),
      supabase.from('ct_announcements').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
    ]).then(([u, e, v, a]) => setStats({ users: u.count || 0, events: e.count || 0, venues: v.count || 0, announcements: a.count || 0 }));
  }, [institutionId]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <h1 className="font-lexend font-900 text-2xl">Staff Dashboard</h1>
        <p className="font-jakarta text-white/80 text-sm mt-1">Manage reports, events and communications</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-primary">Users</p><p className="font-lexend font-900 text-3xl text-primary">{stats.users}</p></div>
        <div className="bg-secondary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-secondary">Events</p><p className="font-lexend font-900 text-3xl text-secondary">{stats.events}</p></div>
        <div className="bg-tertiary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-tertiary">Pending Bookings</p><p className="font-lexend font-900 text-3xl text-tertiary">{stats.venues}</p></div>
        <div className="bg-primary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-primary">Announcements</p><p className="font-lexend font-900 text-3xl text-primary">{stats.announcements}</p></div>
      </div>
    </div>
  );
}

function ReportsSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [reports, setReports] = useState<Array<{ id: string; title: string; content: string | null; created_at: string }>>([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_daily_reports').select('id,title,content,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(20);
    setReports(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.title || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_daily_reports').insert({ ...form, institution_id: institutionId, created_by: userId });
    setForm({ title: '', content: '' });
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Daily Reports</h1>
      <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Create Report</h3>
        <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface mb-3" placeholder="Report title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={5} placeholder="Report content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        <button onClick={save} disabled={saving} className="mt-3 px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Submit Report'}</button>
      </div>
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <p className="font-lexend font-700 text-on-surface">{r.title}</p>
            {r.content && <p className="text-sm text-on-surface-variant mt-1">{r.content}</p>}
            <p className="text-xs text-on-surface-variant mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {reports.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-8">No reports yet</p>}
      </div>
    </div>
  );
}

function EventsSection({ institutionId }: { institutionId: string | null }) {
  const [events, setEvents] = useState<Array<{ id: string; title: string; event_date: string; location: string | null }>>([]);
  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_events').select('id,title,event_date,location').eq('institution_id', institutionId).order('event_date').limit(30).then(({ data }) => setEvents(data || []));
  }, [institutionId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Events</h1>
      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center"><Calendar size={18} className="text-primary" /></div>
            <div>
              <p className="font-jakarta font-700 text-on-surface">{e.title}</p>
              <p className="text-xs text-on-surface-variant">{new Date(e.event_date).toLocaleString()}{e.location ? ` · ${e.location}` : ''}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No events</p>}
      </div>
    </div>
  );
}

function VenueQueueSection({ institutionId }: { institutionId: string | null }) {
  const [bookings, setBookings] = useState<Array<{ id: string; status: string; purpose: string | null; booking_date: string; venue_id: string }>>([]);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_venue_bookings').select('id,status,purpose,booking_date,venue_id').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(30);
    setBookings(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const approve = async (id: string) => {
    await supabase.from('ct_venue_bookings').update({ status: 'approved' }).eq('id', id);
    load();
  };
  const reject = async (id: string) => {
    await supabase.from('ct_venue_bookings').update({ status: 'rejected' }).eq('id', id);
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Venue Bookings Queue</h1>
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-jakarta font-700 text-on-surface text-sm">{b.purpose || 'No purpose specified'}</p>
                <p className="text-xs text-on-surface-variant">{new Date(b.booking_date).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-jakarta font-700 ${b.status === 'approved' ? 'bg-tertiary-container text-tertiary' : b.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-secondary-container text-secondary'}`}>{b.status}</span>
            </div>
            {b.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => approve(b.id)} className="flex-1 py-2 rounded-xl bg-tertiary text-white text-sm font-jakarta font-700 hover:bg-tertiary/90">Approve</button>
                <button onClick={() => reject(b.id)} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-jakarta font-700 hover:bg-red-600">Reject</button>
              </div>
            )}
          </div>
        ))}
        {bookings.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No bookings</p>}
      </div>
    </div>
  );
}

function AnnouncementsSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; body: string | null; created_at: string }>>([]);
  const [form, setForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_announcements').select('id,title,body,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(20);
    setAnnouncements(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.title || !institutionId || !userId) return;
    setSaving(true);
    await supabase.from('ct_announcements').insert({ ...form, institution_id: institutionId, created_by: userId });
    setForm({ title: '', body: '' });
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Announcements</h1>
      <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
        <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface mb-3" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={3} placeholder="Body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
        <button onClick={save} disabled={saving} className="mt-3 px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Posting…' : 'Post'}</button>
      </div>
      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <p className="font-lexend font-700 text-on-surface">{a.title}</p>
            {a.body && <p className="text-sm text-on-surface-variant mt-1">{a.body}</p>}
            <p className="text-xs text-on-surface-variant mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSection({ profile, userId }: { profile: any; userId?: string }) {
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: profile?.full_name || '', bio: profile?.bio || '', phone: profile?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('ct_users').update(form).eq('id', userId);
    await refreshProfile(userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">My Profile</h1>
      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ label: 'Full Name', key: 'full_name' }, { label: 'Phone', key: 'phone' }].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">{field.label}</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Bio</label>
            <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>
        <button onClick={save} disabled={saving} className={`mt-5 px-6 py-2.5 rounded-xl font-jakarta font-700 text-sm text-white transition-colors ${saved ? 'bg-tertiary' : 'bg-secondary hover:bg-secondary/90'}`}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
