import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, ClipboardList, Users, Megaphone, User, LogOut, Menu, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationCenter from '../../components/ui/NotificationCenter';

interface Course { id: string; name: string; code: string; description: string | null; credits: number | null; }
interface Assignment { id: string; title: string; description: string | null; due_date: string | null; max_points: number | null; is_published: boolean; }
interface Student { id: string; full_name: string | null; email: string; }

export default function TeacherPlatform() {
  const { profile, user, institutionId, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'courses', label: 'Courses', icon: <GraduationCap size={18} /> },
    { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={18} /> },
    { id: 'grades', label: 'Grades', icon: <ClipboardList size={18} /> },
    { id: 'students', label: 'Students', icon: <Users size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Teacher';
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
          <p className="text-xs font-jakarta text-white/70">Teacher</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => { setActiveSection(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-jakarta text-sm font-700 transition-all ${activeSection === item.id ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}
              >
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
      <aside className="hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full z-30 bg-surface-lowest shadow-float">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface-lowest border-b border-outline-variant/30 flex items-center gap-3 px-4 py-3">
        <button onClick={() => setMobileOpen(!mobileOpen)}><Menu size={22} className="text-on-surface" /></button>
        <p className="font-lexend font-900 text-on-surface text-sm flex-1">Campus Tribe</p>
        <NotificationCenter />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col bg-surface-lowest shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
          <div className="hidden lg:flex justify-end mb-4"><NotificationCenter /></div>
          {activeSection === 'overview' && <TeacherOverview institutionId={institutionId} />}
          {activeSection === 'courses' && <CoursesSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'assignments' && <AssignmentsSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'grades' && <GradesSection institutionId={institutionId} />}
          {activeSection === 'students' && <StudentsSection institutionId={institutionId} />}
          {activeSection === 'announcements' && <TeacherAnnouncements institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'profile' && <ProfileSection profile={profile} userId={user?.id} />}
        </div>
      </main>
    </div>
  );
}

function TeacherOverview({ institutionId }: { institutionId: string | null }) {
  const [stats, setStats] = useState({ courses: 0, assignments: 0, students: 0 });

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_courses').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_assignments').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_users').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId).eq('role', 'student'),
    ]).then(([c, a, s]) => setStats({ courses: c.count || 0, assignments: a.count || 0, students: s.count || 0 }));
  }, [institutionId]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <h1 className="font-lexend font-900 text-2xl">Teacher Dashboard</h1>
        <p className="font-jakarta text-white/80 text-sm mt-1">Manage courses, assignments and grades</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-primary">Courses</p><p className="font-lexend font-900 text-3xl text-primary">{stats.courses}</p></div>
        <div className="bg-secondary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-secondary">Assignments</p><p className="font-lexend font-900 text-3xl text-secondary">{stats.assignments}</p></div>
        <div className="bg-tertiary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-tertiary">Students</p><p className="font-lexend font-900 text-3xl text-tertiary">{stats.students}</p></div>
      </div>
    </div>
  );
}

function CoursesSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', credits: '3' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_courses').select('id,name,code,description,credits').eq('institution_id', institutionId).order('name');
    setCourses((data || []) as Course[]);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.name || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_courses').insert({ ...form, credits: parseInt(form.credits), institution_id: institutionId, is_active: true });
    setForm({ name: '', code: '', description: '', credits: '3' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend font-900 text-2xl text-on-surface">Courses</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors">
          <Plus size={16} /> Add Course
        </button>
      </div>
      {showCreate && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Course Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Course Code (e.g. CS101)" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input type="number" className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Credits" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Create Course'}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-lexend font-700 text-on-surface">{c.name}</p>
                <p className="text-xs text-on-surface-variant">{c.code} · {c.credits} credits</p>
                {c.description && <p className="text-sm text-on-surface-variant mt-1">{c.description}</p>}
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="text-on-surface-variant font-jakarta col-span-2 text-center py-12">No courses yet</p>}
      </div>
    </div>
  );
}

function AssignmentsSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', max_points: '100' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const { data } = await supabase.from('ct_assignments').select('id,title,description,due_date,max_points,is_published').eq('institution_id', institutionId).order('due_date');
    setAssignments((data || []) as Assignment[]);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.title || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_assignments').insert({ ...form, max_points: parseInt(form.max_points), institution_id: institutionId, created_by: userId, is_published: true });
    setForm({ title: '', description: '', due_date: '', max_points: '100' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend font-900 text-2xl text-on-surface">Assignments</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors">
          <Plus size={16} /> New Assignment
        </button>
      </div>
      {showCreate && (
        <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface md:col-span-2" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface md:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input type="datetime-local" className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            <input type="number" className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Max Points" value={form.max_points} onChange={e => setForm(f => ({ ...f, max_points: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Publish Assignment'}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30 flex items-center justify-between">
            <div>
              <p className="font-lexend font-700 text-on-surface">{a.title}</p>
              {a.description && <p className="text-sm text-on-surface-variant mt-0.5">{a.description}</p>}
              {a.due_date && <p className="text-xs text-on-surface-variant mt-1">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="font-lexend font-700 text-primary">{a.max_points || 100} pts</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_published ? 'bg-tertiary-container text-tertiary' : 'bg-surface-low text-on-surface-variant'}`}>{a.is_published ? 'Published' : 'Draft'}</span>
            </div>
          </div>
        ))}
        {assignments.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No assignments yet</p>}
      </div>
    </div>
  );
}

function GradesSection({ institutionId }: { institutionId: string | null }) {
  const [grades, setGrades] = useState<Array<{ id: string; score: number | null; letter_grade: string | null; student_id: string; assignment_id: string; created_at: string }>>([]);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_grades').select('id,score,letter_grade,student_id,assignment_id,created_at').order('created_at', { ascending: false }).limit(50).then(({ data }) => setGrades(data || []));
  }, [institutionId]);

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Grade Book</h1>
      <div className="bg-surface-lowest rounded-2xl p-5 shadow-float border border-outline-variant/30">
        <p className="text-sm text-on-surface-variant font-jakarta mb-4">Recent grades across all assignments</p>
        {grades.length === 0 ? <p className="text-center text-on-surface-variant font-jakarta py-8">No grades recorded yet</p> : (
          <div className="space-y-2">
            {grades.map(g => (
              <div key={g.id} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                <div>
                  <p className="font-jakarta text-sm text-on-surface">Student {g.student_id.slice(-6)}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(g.created_at).toLocaleDateString()}</p>
                </div>
                <span className="font-lexend font-700 text-primary">{g.letter_grade || `${g.score}%`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsSection({ institutionId }: { institutionId: string | null }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_users').select('id,full_name,email').eq('institution_id', institutionId).eq('role', 'student').order('full_name').limit(100).then(({ data }) => setStudents((data || []) as Student[]));
  }, [institutionId]);

  const filtered = students.filter(s => !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Students</h1>
      <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="bg-surface-lowest rounded-2xl shadow-float border border-outline-variant/30 overflow-hidden">
        {filtered.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${i < filtered.length - 1 ? 'border-b border-outline-variant/20' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-jakarta font-900">{s.full_name?.charAt(0) || '?'}</span>
            </div>
            <div>
              <p className="font-jakarta font-700 text-on-surface text-sm">{s.full_name || 'Unknown'}</p>
              <p className="text-xs text-on-surface-variant">{s.email}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-on-surface-variant font-jakarta py-8">No students found</p>}
      </div>
    </div>
  );
}

function TeacherAnnouncements({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
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
        <h3 className="font-lexend font-700 text-on-surface mb-4">Post Announcement</h3>
        <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface mb-3" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={4} placeholder="Body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
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
  const [form, setForm] = useState({ full_name: profile?.full_name || '', bio: profile?.bio || '', department: profile?.department || '', phone: profile?.phone || '' });
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
          {[{ label: 'Full Name', key: 'full_name' }, { label: 'Phone', key: 'phone' }, { label: 'Department', key: 'department' }].map(field => (
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
