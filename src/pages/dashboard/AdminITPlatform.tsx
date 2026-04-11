import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Award, Calendar, MapPin, Trophy, ClipboardList,
  Megaphone, BarChart2, Key, History, Puzzle, Settings, User, LogOut, Menu,
  Plus, Search, Loader2, CheckCircle, XCircle, CreditCard, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationCenter from '../../components/ui/NotificationCenter';
import { sendNotification } from '../../lib/notify';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../components/ui/NotificationPrefsPanel';
import BillingSection from '../../components/billing/BillingSection';
import PaywallGate from '../../components/billing/PaywallGate';
import StealthBanner from '../../components/layout/StealthBanner';

export default function AdminITPlatform() {
  const { profile, user, institutionId, effectiveInstitutionId, institution, role, signOut, needsPayment } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    try { return localStorage.getItem('ct.admin.activeSection') || 'overview'; } catch { return 'overview'; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const isIT = role === 'it_director';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'clubs', label: 'Clubs', icon: <Award size={18} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
    { id: 'venues', label: 'Venues', icon: <MapPin size={18} /> },
    { id: 'sports', label: 'Sports', icon: <Trophy size={18} /> },
    { id: 'surveys', label: 'Surveys', icon: <ClipboardList size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart2 size={18} /> },
    { id: 'api-keys', label: 'API Keys', icon: <Key size={18} /> },
    { id: 'audit', label: 'Audit Log', icon: <History size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Puzzle size={18} /> },
    { id: 'billing', label: 'Bills & Payments', icon: <CreditCard size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = isIT ? 'IT Director' : 'Administrator';

  useEffect(() => {
    try { localStorage.setItem('ct.admin.activeSection', activeSection); } catch {}
  }, [activeSection]);
  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant/30" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="text-white text-xs font-lexend font-900">CT</span>
        </div>
        <div>
          <p className="font-lexend font-900 text-white text-sm">Campus Tribe</p>
          {institution?.name && (
            <p className="text-[10px] font-jakarta text-white/80 truncate max-w-[140px]" title={institution.name}>{institution.short_name || institution.name}</p>
          )}
          <p className="text-xs font-jakarta text-white/70">{roleLabel}</p>
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
        <div className="flex-1 min-w-0">
          <p className="font-lexend font-900 text-on-surface text-sm truncate">Campus Tribe</p>
          {institution?.name && <p className="text-[10px] text-on-surface-variant truncate">{institution.short_name || institution.name}</p>}
        </div>
        <NotificationCenter />
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col bg-surface-lowest shadow-xl"><SidebarContent /></aside>
        </div>
      )}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-16">
          <div className="hidden lg:flex justify-end mb-4"><NotificationCenter /></div>
          {activeSection === 'billing' ? (
            <BillingSection isAdmin={true} />
          ) : (
            <PaywallGate onGoToBilling={() => setActiveSection('billing')}>
              {activeSection === 'overview' && <AdminOverview institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'users' && <UsersSection institutionId={effectiveInstitutionId ?? institutionId} currentUserId={user?.id} />}
              {activeSection === 'clubs' && <ClubsSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'events' && <EventsSection institutionId={effectiveInstitutionId ?? institutionId} userId={user?.id} />}
              {activeSection === 'venues' && <VenuesSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'sports' && <SportsSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'surveys' && <SurveysSection institutionId={effectiveInstitutionId ?? institutionId} userId={user?.id} />}
              {activeSection === 'announcements' && <AnnouncementsSection institutionId={effectiveInstitutionId ?? institutionId} userId={user?.id} />}
              {activeSection === 'reports' && <ReportsSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'api-keys' && <ApiKeysSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'audit' && <AuditSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'integrations' && <IntegrationsSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'settings' && <SettingsSection institutionId={effectiveInstitutionId ?? institutionId} />}
              {activeSection === 'profile' && <ProfileSection profile={profile as Record<string, unknown> | null} userId={user?.id} institutionId={effectiveInstitutionId ?? institutionId} />}
            </PaywallGate>
          )}
        </div>
      </main>
      <StealthBanner />
    </div>
  );
}

function AdminOverview({ institutionId }: { institutionId: string | null }) {
  const [stats, setStats] = useState({ users: 0, clubs: 0, events: 0, venues: 0, apiKeys: 0, auditEvents: 0 });

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_users').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_clubs').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_events').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_venues').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_api_keys').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_audit_logs').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
    ]).then(([u, c, e, v, a, al]) => setStats({ users: u.count || 0, clubs: c.count || 0, events: e.count || 0, venues: v.count || 0, apiKeys: a.count || 0, auditEvents: al.count || 0 }));
  }, [institutionId]);

  const items = [
    { label: 'Users', value: stats.users, color: 'bg-primary-container', text: 'text-primary' },
    { label: 'Clubs', value: stats.clubs, color: 'bg-secondary-container', text: 'text-secondary' },
    { label: 'Events', value: stats.events, color: 'bg-tertiary-container', text: 'text-tertiary' },
    { label: 'Venues', value: stats.venues, color: 'bg-primary-container', text: 'text-primary' },
    { label: 'API Keys', value: stats.apiKeys, color: 'bg-secondary-container', text: 'text-secondary' },
    { label: 'Audit Events', value: stats.auditEvents, color: 'bg-tertiary-container', text: 'text-tertiary' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <h1 className="font-lexend font-900 text-2xl">Admin & IT Platform</h1>
        <p className="font-jakarta text-white/80 text-sm mt-1">Unified platform management dashboard</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.label} className={`${item.color} rounded-2xl p-5 text-center`}>
            <p className={`text-xs font-jakarta ${item.text}`}>{item.label}</p>
            <p className={`font-lexend font-900 text-3xl ${item.text}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersSection({ institutionId, currentUserId }: { institutionId: string | null; currentUserId?: string }) {
  const [users, setUsers] = useState<Array<{ id: string; full_name: string | null; email: string; role: string; roles: string[] | null; is_active: boolean | null }>>([]);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('student');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['student']);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_users').select('id,full_name,email,role,roles,is_active').eq('institution_id', institutionId).order('full_name').limit(100);
    setUsers(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const updateRole = async (userId: string) => {
    const rolesToSave = selectedRoles.length ? selectedRoles : [newRole];
    const primaryRole = newRole || rolesToSave[0];
    const { error } = await supabase.from('ct_users').update({ role: primaryRole, roles: rolesToSave }).eq('id', userId);
    if (error) {
      alert('Failed to save roles: ' + error.message);
      return;
    }
    // Optimistic local update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: primaryRole, roles: rolesToSave } : u));
    if (userId && institutionId) {
      sendNotification(userId, institutionId, 'Role Access Updated', `Your access roles are now: ${rolesToSave.join(', ')}`, 'info').catch(() => {});
    }
    setEditingUser(null);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const toggleActive = async (userId: string, current: boolean | null) => {
    await supabase.from('ct_users').update({ is_active: !current }).eq('id', userId);
    load();
  };

  const ROLES = ['student', 'student_rep', 'teacher', 'admin', 'staff', 'club_leader', 'coach', 'it_director', 'parent', 'athlete'];

  const filtered = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">User Management</h1>
      <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="bg-surface-lowest rounded-2xl shadow-float border border-outline-variant/30 overflow-hidden">
        {filtered.map((u, i) => (
          <div key={u.id} className={`px-4 py-3 ${i < filtered.length - 1 ? 'border-b border-outline-variant/20' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-jakarta font-900">{u.full_name?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-jakarta font-700 text-on-surface text-sm">{u.full_name || 'Unknown'}</p>
                <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-primary font-jakarta">{u.role}</span>
                {u.is_active === false && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-jakarta">Inactive</span>}
                {u.id !== currentUserId && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingUser(u.id); setNewRole(u.role); setSelectedRoles(u.roles?.length ? u.roles : [u.role]); }} className="px-2 py-1 rounded-lg bg-surface-low text-on-surface-variant text-xs font-jakarta hover:bg-outline/20">Edit Roles</button>
                    <button onClick={() => toggleActive(u.id, u.is_active)} className="px-2 py-1 rounded-lg bg-surface-low text-on-surface-variant text-xs font-jakarta hover:bg-outline/20">{u.is_active === false ? 'Activate' : 'Deactivate'}</button>
                  </div>
                )}
              </div>
            </div>
            {editingUser === u.id && (
              <div className="mt-3 pl-11 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(r => (
                    <label key={r} className={`px-2 py-1 rounded-lg border text-xs font-jakarta cursor-pointer ${selectedRoles.includes(r) ? 'bg-primary-container border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
                      <input type="checkbox" className="hidden" checked={selectedRoles.includes(r)} onChange={() => toggleRole(r)} />
                      {r}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant font-jakarta">Primary role (dashboard default)</p>
                <select className="border border-outline-variant rounded-lg px-3 py-1.5 font-jakarta text-sm bg-surface" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  {selectedRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateRole(u.id)} className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-jakarta font-700">Save</button>
                  <button onClick={() => setEditingUser(null)} className="px-3 py-1.5 rounded-lg bg-surface-low text-on-surface-variant text-xs font-jakarta">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-on-surface-variant font-jakarta py-8">No users found</p>}
      </div>
    </div>
  );
}

function ClubsSection({ institutionId }: { institutionId: string | null }) {
  const [clubs, setClubs] = useState<Array<{ id: string; name: string; status: string; member_count: number | null; description: string | null }>>([]);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_clubs').select('id,name,status,member_count,description').eq('institution_id', institutionId).order('name').limit(50);
    setClubs(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const approve = async (id: string) => {
    await supabase.from('ct_clubs').update({ status: 'active' }).eq('id', id);
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Clubs</h1>
      <div className="space-y-3">
        {clubs.map(c => (
          <div key={c.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
            <div>
              <p className="font-lexend font-700 text-on-surface">{c.name}</p>
              {c.description && <p className="text-sm text-on-surface-variant mt-0.5">{c.description}</p>}
              <p className="text-xs text-on-surface-variant mt-1">{c.member_count || 0} members</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-jakarta font-700 ${c.status === 'active' ? 'bg-tertiary-container text-tertiary' : 'bg-secondary-container text-secondary'}`}>{c.status}</span>
              {c.status !== 'active' && <button onClick={() => approve(c.id)} className="px-3 py-1.5 rounded-lg bg-tertiary text-white text-xs font-jakarta font-700">Approve</button>}
            </div>
          </div>
        ))}
        {clubs.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No clubs</p>}
      </div>
    </div>
  );
}

function EventsSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [events, setEvents] = useState<Array<{ id: string; title: string; event_date: string; location: string | null; status: string | null }>>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', event_date: '', location: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_events').select('id,title,event_date,location,status').eq('institution_id', institutionId).order('event_date', { ascending: false }).limit(50);
    setEvents(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.title || !form.event_date || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_events').insert({ ...form, institution_id: institutionId, created_by: userId });
    setForm({ title: '', event_date: '', location: '', description: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend font-900 text-2xl text-on-surface">Events</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors">
          <Plus size={16} /> Create Event
        </button>
      </div>
      {showCreate && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input type="datetime-local" className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
            <div>
              <p className="font-lexend font-700 text-on-surface">{e.title}</p>
              <p className="text-xs text-on-surface-variant">{new Date(e.event_date).toLocaleString()}{e.location ? ` · ${e.location}` : ''}</p>
            </div>
            {e.status && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-primary font-jakarta">{e.status}</span>}
          </div>
        ))}
        {events.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-8">No events</p>}
      </div>
    </div>
  );
}

function VenuesSection({ institutionId }: { institutionId: string | null }) {
  const [bookings, setBookings] = useState<Array<{ id: string; status: string; purpose: string | null; start_time: string }>>([]);

  const load = async () => {
    const { data } = await supabase.from('ct_venue_bookings').select('id,status,purpose,start_time').order('created_at', { ascending: false }).limit(50);
    setBookings(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const update = async (id: string, status: string) => {
    await supabase.from('ct_venue_bookings').update({ status }).eq('id', id);
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Venue Bookings</h1>
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-jakarta font-700 text-on-surface">{b.purpose || 'No purpose'}</p>
                <p className="text-xs text-on-surface-variant">{new Date(b.start_time).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-jakarta font-700 ${b.status === 'approved' ? 'bg-tertiary-container text-tertiary' : b.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-secondary-container text-secondary'}`}>{b.status}</span>
            </div>
            {b.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => update(b.id, 'approved')} className="flex-1 py-1.5 rounded-xl bg-tertiary text-white text-xs font-jakarta font-700">Approve</button>
                <button onClick={() => update(b.id, 'rejected')} className="flex-1 py-1.5 rounded-xl bg-red-500 text-white text-xs font-jakarta font-700">Reject</button>
              </div>
            )}
          </div>
        ))}
        {bookings.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-8">No bookings</p>}
      </div>
    </div>
  );
}

function SportsSection({ institutionId }: { institutionId: string | null }) {
  const [leagues, setLeagues] = useState<Array<{ id: string; name: string; sport: string; status: string }>>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', sport: '', status: 'active' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_sports_leagues').select('id,name,sport,status').eq('institution_id', institutionId).limit(20);
    setLeagues(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.name || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_sports_leagues').insert({ ...form, institution_id: institutionId });
    setForm({ name: '', sport: '', status: 'active' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend font-900 text-2xl text-on-surface">Sports Leagues</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors">
          <Plus size={16} /> New League
        </button>
      </div>
      {showCreate && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="League Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Sport Type" value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leagues.map(l => (
          <div key={l.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <p className="font-lexend font-700 text-on-surface">{l.name}</p>
            <p className="text-xs text-on-surface-variant">{l.sport} · {l.status}</p>
          </div>
        ))}
        {leagues.length === 0 && <p className="text-on-surface-variant font-jakarta col-span-2 text-center py-8">No leagues</p>}
      </div>
    </div>
  );
}

function SurveysSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [surveys, setSurveys] = useState<Array<{ id: string; title: string; status: string; created_at: string }>>([]);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_surveys').select('id,title,status,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(30).then(({ data }) => setSurveys(data || []));
  }, [institutionId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Surveys</h1>
      <div className="space-y-3">
        {surveys.map(s => (
          <div key={s.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
            <div>
              <p className="font-lexend font-700 text-on-surface">{s.title}</p>
              <p className="text-xs text-on-surface-variant">{new Date(s.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-jakarta font-700 ${s.status === 'published' ? 'bg-tertiary-container text-tertiary' : 'bg-surface-low text-on-surface-variant'}`}>{s.status}</span>
          </div>
        ))}
        {surveys.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-8">No surveys</p>}
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
        <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={4} placeholder="Broadcast message" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
        <button onClick={save} disabled={saving} className="mt-3 px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Broadcasting…' : 'Broadcast'}</button>
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

function ReportsSection({ institutionId }: { institutionId: string | null }) {
  const [stats, setStats] = useState({ users: 0, events: 0, clubs: 0, students: 0 });

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_users').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_events').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_clubs').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_users').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId).eq('role', 'student'),
    ]).then(([u, e, c, s]) => setStats({ users: u.count || 0, events: e.count || 0, clubs: c.count || 0, students: s.count || 0 }));
  }, [institutionId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Reports & Analytics</h1>
      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Institution Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="font-lexend font-900 text-3xl text-primary">{v}</p>
              <p className="text-xs font-jakarta text-on-surface-variant capitalize">{k}</p>
            </div>
          ))}
        </div>
        <button className="mt-6 px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90">Export Accreditation Report</button>
      </div>
    </div>
  );
}

function ApiKeysSection({ institutionId }: { institutionId: string | null }) {
  const [keys, setKeys] = useState<Array<{ id: string; name: string; key_prefix: string | null; is_active: boolean | null; created_at: string }>>([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_api_keys').select('id,name,key_prefix,is_active,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false });
    setKeys(data || []);
  };

  useEffect(() => { load(); }, [institutionId]);

  const generate = async () => {
    if (!name || !institutionId) return;
    setSaving(true);
    const prefix = `ct_${Math.random().toString(36).slice(2, 10)}`;
    await supabase.from('ct_api_keys').insert({ name: name, key_prefix: prefix, institution_id: institutionId, is_active: true });
    setName('');
    setSaving(false);
    load();
  };

  const revoke = async (id: string) => {
    await supabase.from('ct_api_keys').update({ is_active: false }).eq('id', id);
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">API Keys</h1>
      <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
        <div className="flex gap-3">
          <input className="flex-1 border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Key name" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={generate} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">Generate</button>
        </div>
      </div>
      <div className="space-y-3">
        {keys.map(k => (
          <div key={k.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-lexend font-700 text-on-surface">{k.name}</p>
                <p className="text-xs font-mono text-on-surface-variant mt-1">{k.key_prefix}…</p>
                <p className="text-xs text-on-surface-variant">{new Date(k.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-jakarta font-700 ${k.is_active ? 'bg-tertiary-container text-tertiary' : 'bg-red-100 text-red-600'}`}>{k.is_active ? 'Active' : 'Revoked'}</span>
                {k.is_active && <button onClick={() => revoke(k.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-jakarta font-700 hover:bg-red-100">Revoke</button>}
              </div>
            </div>
          </div>
        ))}
        {keys.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-8">No API keys</p>}
      </div>
    </div>
  );
}

function AuditSection({ institutionId }: { institutionId: string | null }) {
  const [logs, setLogs] = useState<Array<{ id: string; action: string; resource_type: string | null; created_at: string; actor_id: string | null }>>([]);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_audit_logs').select('id,action,resource_type,created_at,actor_id').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setLogs(data || []));
  }, [institutionId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Audit Log</h1>
      <div className="bg-surface-lowest rounded-2xl shadow-float border border-outline-variant/30 overflow-hidden">
        {logs.length === 0 ? <p className="text-center text-on-surface-variant font-jakarta py-8">No audit events</p> : logs.map((log, i) => (
          <div key={log.id} className={`flex items-center gap-3 px-4 py-3 ${i < logs.length - 1 ? 'border-b border-outline-variant/20' : ''}`}>
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-jakarta text-sm text-on-surface"><span className="font-700">{log.action}</span>{log.resource_type ? ` on ${log.resource_type}` : ''}</p>
              <p className="text-xs text-on-surface-variant">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LmsConfig { domain?: string; url?: string; token?: string; sync_enabled?: boolean; }

function IntegrationsSection({ institutionId }: { institutionId: string | null }) {
  const [lmsSettings, setLmsSettings] = useState<Record<string, { status: string; config: LmsConfig }>>({});
  const [editProvider, setEditProvider] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<LmsConfig>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = () => {
    if (!institutionId) return;
    supabase.from('ct_platform_settings')
      .select('provider, status, config')
      .eq('institution_id', institutionId)
      .eq('category', 'lms')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, { status: string; config: LmsConfig }> = {};
          data.forEach(row => { map[row.provider] = { status: row.status, config: (row.config as LmsConfig) || {} }; });
          setLmsSettings(map);
        }
      });
  };

  useEffect(() => { loadSettings(); }, [institutionId]);

  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string } | null>>({});
  const testLmsConnection = async (lmsId: string, cfg: Record<string, string>) => {
    setTestResult(prev => ({ ...prev, [lmsId]: null }));
    try {
      if (lmsId === 'canvas') {
        const domain = cfg.domain || 'canvas.instructure.com';
        const token = cfg.token || '';
        if (!token) { setTestResult(prev => ({ ...prev, [lmsId]: { ok: false, msg: 'No API token entered' } })); return; }
        const res = await fetch(`https://${domain}/api/v1/courses?per_page=5`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setTestResult(prev => ({ ...prev, [lmsId]: { ok: true, msg: `Connected. Found ${d.length} course(s).` } })); }
        else { setTestResult(prev => ({ ...prev, [lmsId]: { ok: false, msg: `HTTP ${res.status}: Check your API token.` } })); }
      } else if (lmsId === 'moodle') {
        const url = cfg.url || ''; const token = cfg.token || '';
        if (!token || !url) { setTestResult(prev => ({ ...prev, [lmsId]: { ok: false, msg: 'URL and token required' } })); return; }
        const apiUrl = `${url.replace(/\/+$/, '')}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`;
        const res = await fetch(apiUrl); const d = await res.json();
        if (d.sitename) { setTestResult(prev => ({ ...prev, [lmsId]: { ok: true, msg: `Connected to: ${d.sitename}` } })); }
        else { setTestResult(prev => ({ ...prev, [lmsId]: { ok: false, msg: d.message || 'Token invalid or site unreachable' } })); }
      } else {
        setTestResult(prev => ({ ...prev, [lmsId]: { ok: true, msg: 'Enterprise integration. Contact vendor for connection details.' } }));
      }
    } catch { setTestResult(prev => ({ ...prev, [lmsId]: { ok: false, msg: 'Network error or CORS blocked. Use a server-side proxy.' } })); }
  };

  const saveLms = async (provider: string) => {
    if (!institutionId) return;
    setSaving(true);
    const cfg = editConfig;
    const hasUrl = !!(cfg.domain || cfg.url || cfg.token);
    await supabase.from('ct_platform_settings').upsert({
      institution_id: institutionId,
      category: 'lms',
      provider,
      status: hasUrl ? 'connected' : 'draft',
      config: cfg,
    }, { onConflict: 'institution_id,category,provider' });
    setSaving(false);
    setSaved(true);
    setEditProvider(null);
    loadSettings();
    setTimeout(() => setSaved(false), 2000);
  };

  const disconnectLms = async (provider: string) => {
    if (!institutionId) return;
    await supabase.from('ct_platform_settings').upsert({
      institution_id: institutionId,
      category: 'lms',
      provider,
      status: 'draft',
      config: { sync_enabled: false },
    }, { onConflict: 'institution_id,category,provider' });
    loadSettings();
  };

  const lmsProviders = [
    { id: 'canvas', name: 'Canvas LMS', desc: 'Sync courses and grades with Canvas LMS. Demo: canvas.instructure.com | Token: demo_canvas_token (replace with real from Account > Settings > New Access Token)', fields: [{ key: 'domain', label: 'Canvas Domain', placeholder: 'yourschool.instructure.com' }, { key: 'token', label: 'API Token', placeholder: 'canvas_token...' }] },
    { id: 'moodle', name: 'Moodle', desc: 'Connect to Moodle for course sync and grade passback. Demo: wevsocial.moodlecloud.com | Token: provided on setup', fields: [{ key: 'url', label: 'Moodle URL', placeholder: 'https://moodle.yourschool.edu' }, { key: 'token', label: 'Web Service Token', placeholder: 'moodle_ws_token...' }] },
    { id: 'minerva', name: 'Minerva', desc: 'Enterprise Integration  -  contact sales@wevsocial.com for Minerva SIS configuration.', fields: [], enterprise: true },
    { id: 'blackboard', name: 'Blackboard', desc: 'Sync with Blackboard Learn LMS', fields: [{ key: 'url', label: 'Blackboard URL', placeholder: 'https://blackboard.yourschool.edu' }, { key: 'token', label: 'REST API Key', placeholder: 'bb_api_key...' }] },
    { id: 'google_classroom', name: 'Google Classroom', desc: 'Pull Google Classroom assignments and rosters', fields: [{ key: 'token', label: 'OAuth Token', placeholder: 'google_oauth_token...' }] },
  ] as Array<{ id: string; name: string; desc: string; fields: Array<{key: string; label: string; placeholder: string}>; enterprise?: boolean }>;

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface dark:text-slate-100">Integrations</h1>
      <p className="text-sm text-on-surface-variant dark:text-slate-400">Connect Campus Tribe to your institution's LMS and other systems.</p>
      {saved && <div className="bg-tertiary-container text-tertiary rounded-xl p-3 text-sm font-jakarta font-700">Settings saved successfully.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lmsProviders.map(lms => {
          const setting = lmsSettings[lms.id];
          const isConnected = setting?.status === 'connected';
          const isEditing = editProvider === lms.id;
          const cfg = setting?.config || {};
          const displayUrl = cfg.domain || cfg.url || '';
          return (
            <div key={lms.id} className="bg-surface-lowest dark:bg-slate-800 rounded-2xl p-5 shadow-float border border-outline-variant/30 dark:border-slate-700 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-lexend font-700 text-on-surface dark:text-slate-100">{lms.name}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-jakarta font-700 ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-surface-low dark:bg-slate-700 text-on-surface-variant dark:text-slate-400'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">{lms.desc}</p>
              {lms.enterprise && (
                <a href="mailto:sales@wevsocial.com" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-jakarta font-700 hover:bg-secondary/90 transition-colors w-fit">Contact Sales</a>
              )}
              {isConnected && displayUrl && <p className="text-xs font-mono bg-surface-container dark:bg-slate-900 px-3 py-1.5 rounded-lg text-on-surface-variant dark:text-slate-400 truncate">{displayUrl}</p>}
              {!lms.enterprise && isEditing ? (
                <div className="space-y-2">
                  {lms.fields.map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-jakarta font-700 text-on-surface-variant dark:text-slate-400 mb-1 block">{f.label}</label>
                      <input
                        className="w-full border border-outline-variant dark:border-slate-600 rounded-xl px-4 py-2 font-jakarta text-sm bg-surface dark:bg-slate-900 dark:text-slate-200"
                        placeholder={f.placeholder}
                        value={(editConfig as Record<string, string>)[f.key] || ''}
                        onChange={e => setEditConfig(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <button onClick={() => saveLms(lms.id)} disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => testLmsConnection(lms.id, editConfig as Record<string, string>)} className="px-4 py-2 rounded-xl bg-tertiary-container text-tertiary text-sm font-jakarta font-700 hover:opacity-80 transition-colors">Test Connection</button>
                    <button onClick={() => setEditProvider(null)} className="px-4 py-2 rounded-xl bg-surface-container dark:bg-slate-700 text-on-surface dark:text-slate-200 text-sm font-jakarta font-700">Cancel</button>
                  </div>
                  {testResult[lms.id] !== undefined && testResult[lms.id] !== null && (
                    <div className={`text-xs font-jakarta px-3 py-2 rounded-xl ${testResult[lms.id]!.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                      {testResult[lms.id]!.ok ? '✓ ' : '✗ '}{testResult[lms.id]!.msg}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {!lms.enterprise && <button onClick={() => { setEditProvider(lms.id); setEditConfig(cfg); }} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors">
                    {isConnected ? 'Configure' : 'Connect'}
                  </button>}
                  {isConnected && <button onClick={() => testLmsConnection(lms.id, cfg as Record<string, string>)} className="px-4 py-2 rounded-xl bg-tertiary-container text-tertiary text-sm font-jakarta font-700 hover:opacity-80 transition-colors">Test</button>}
                  {isConnected && !lms.enterprise && <button onClick={() => disconnectLms(lms.id)} className="px-4 py-2 rounded-xl bg-surface-container dark:bg-slate-700 text-on-surface dark:text-slate-200 text-sm font-jakarta font-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Disconnect</button>}
                  {isConnected && !lms.enterprise && <button className="px-4 py-2 rounded-xl bg-surface-container dark:bg-slate-700 text-on-surface dark:text-slate-200 text-sm font-jakarta font-700 hover:opacity-80 transition-colors">Sync Courses</button>}
                  {testResult[lms.id] !== undefined && testResult[lms.id] !== null && (
                    <div className={`w-full text-xs font-jakarta px-3 py-2 rounded-xl ${testResult[lms.id]!.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                      {testResult[lms.id]!.ok ? '✓ ' : '✗ '}{testResult[lms.id]!.msg}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Other integrations */}
      <h2 className="font-lexend font-700 text-lg text-on-surface dark:text-slate-100 mt-4">Other Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'Helcim Payments', desc: 'Accept payments for events and activities', status: 'Not Connected' },
          { name: 'Webhooks', desc: 'Send real-time events to external systems', status: 'Not Connected' },
          { name: 'Google Workspace', desc: 'SSO and calendar integration', status: 'Connected' },
        ].map(i => (
          <div key={i.name} className="bg-surface-lowest dark:bg-slate-800 rounded-2xl p-5 shadow-float border border-outline-variant/30 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="font-lexend font-700 text-on-surface dark:text-slate-100">{i.name}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-jakarta font-700 ${i.status === 'Connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-surface-low dark:bg-slate-700 text-on-surface-variant dark:text-slate-400'}`}>{i.status}</span>
            </div>
            <p className="text-sm text-on-surface-variant dark:text-slate-400">{i.desc}</p>
            <button className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors">{i.status === 'Connected' ? 'Configure' : 'Connect'}</button>
          </div>
        ))}
      </div>

      {/* Imported Courses */}
      <h2 className="font-lexend font-700 text-lg text-on-surface dark:text-slate-100 mt-6">Imported Courses (Demo)</h2>
      <div className="overflow-x-auto rounded-2xl bg-surface-lowest dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant dark:border-slate-700">{['Course','Code','LMS','Students','Last Sync'].map(h => <th key={h} className="py-3 px-4 text-left font-jakarta font-700 text-on-surface-variant dark:text-slate-400">{h}</th>)}</tr></thead>
          <tbody>{[
            { name: 'Introduction to Computer Science', code: 'CS101', lms: 'Canvas', students: 42, sync: '2026-04-01' },
            { name: 'Calculus I', code: 'MATH101', lms: 'Canvas', students: 88, sync: '2026-04-01' },
            { name: 'English Composition', code: 'ENG101', lms: 'Moodle', students: 35, sync: '2026-03-31' },
            { name: 'Introduction to Psychology', code: 'PSY101', lms: 'Moodle', students: 67, sync: '2026-03-31' },
          ].map(c => <tr key={c.code} className="border-b border-outline-variant/40 dark:border-slate-700 hover:bg-surface-container dark:hover:bg-slate-700/50">
            <td className="py-3 px-4 font-jakarta text-on-surface dark:text-slate-200">{c.name}</td>
            <td className="py-3 px-4 text-on-surface-variant dark:text-slate-400 font-mono">{c.code}</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-xs font-jakarta font-700">{c.lms}</span></td>
            <td className="py-3 px-4 text-on-surface dark:text-slate-200">{c.students}</td>
            <td className="py-3 px-4 text-on-surface-variant dark:text-slate-400">{c.sync}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsSection({ institutionId }: { institutionId: string | null }) {
  const [institution, setInstitution] = useState<{ name: string; country: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_institutions').select('name,country').eq('id', institutionId).maybeSingle().then(({ data }) => setInstitution(data));
  }, [institutionId]);

  const save = async () => {
    if (!institutionId || !institution) return;
    setSaving(true);
    await supabase.from('ct_institutions').update(institution).eq('id', institutionId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Settings</h1>
      {institution && (
        <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
          <h3 className="font-lexend font-700 text-on-surface mb-4">Institution Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Institution Name</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={institution.name} onChange={e => setInstitution(i => ({ ...i!, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Country</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={institution.country || ''} onChange={e => setInstitution(i => ({ ...i!, country: e.target.value }))} />
            </div>
          </div>
          <button onClick={save} disabled={saving} className={`mt-5 px-6 py-2.5 rounded-xl font-jakarta font-700 text-sm text-white transition-colors ${saved ? 'bg-tertiary' : 'bg-secondary hover:bg-secondary/90'}`}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      )}
      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Security</h3>
        <div className="space-y-4">
          {[{ label: 'Require MFA for Admins', desc: 'Enforce multi-factor authentication for admin accounts' }, { label: 'Session Timeout (60 min)', desc: 'Automatically sign out inactive users' }, { label: 'FERPA Compliance Mode', desc: 'Enable FERPA-compliant data handling' }].map(s => (
            <div key={s.label} className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0">
              <div>
                <p className="font-jakarta font-700 text-on-surface text-sm">{s.label}</p>
                <p className="text-xs text-on-surface-variant">{s.desc}</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-primary relative transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ profile, userId, institutionId }: { profile: Record<string, unknown> | null; userId?: string; institutionId: string | null }) {
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: (profile?.full_name as string) || '',
    bio: (profile?.bio as string) || '',
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
    await supabase.from('ct_users').update(form).eq('id', userId);
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
      <h1 className="font-lexend font-900 text-2xl text-on-surface">My Profile</h1>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Profile Photo</h3>
        {userId && <ProfilePhotoUpload userId={userId} currentUrl={profile?.avatar_url as string | null} displayName={form.full_name} />}
      </div>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ label: 'Full Name', key: 'full_name' }, { label: 'Phone', key: 'phone' }].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">{field.label}</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={(form as Record<string, string>)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Bio</label>
            <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>
        <button onClick={save} disabled={saving} className={`mt-5 px-6 py-2.5 rounded-xl font-jakarta font-700 text-sm text-white transition-colors ${saved ? 'bg-tertiary' : 'bg-secondary hover:bg-secondary/90'}`}>
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        {userId && <NotificationPrefsPanel userId={userId} institutionId={institutionId} role="admin" />}
      </div>

      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Change Password</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">New Password</label>
            <input type="password" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
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
