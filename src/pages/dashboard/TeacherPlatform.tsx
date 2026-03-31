import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, ClipboardList, Users, Megaphone,
  Settings, LogOut, Menu, Plus, Loader2, Upload, Download, CheckCircle, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationCenter from '../../components/ui/NotificationCenter';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../components/ui/NotificationPrefsPanel';

interface Course { id: string; name: string; code: string; description: string | null; credits: number | null; }
interface Assignment {
  id: string; title: string; description: string | null;
  due_date: string | null; max_points: number | null; is_published: boolean;
  course_id: string | null;
}
interface Submission {
  id: string; student_id: string; submitted_at: string; notes: string | null;
  student?: { full_name: string | null; email: string };
  files?: { id: string; name: string; url: string }[];
  grade?: { grade: number | null; max_points: number | null; feedback: string | null };
}

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
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
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
          {activeSection === 'courses' && <CoursesSection institutionId={institutionId} />}
          {activeSection === 'assignments' && <AssignmentsSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'grades' && <GradesSection institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'students' && <StudentsSection institutionId={institutionId} />}
          {activeSection === 'announcements' && <TeacherAnnouncements institutionId={institutionId} userId={user?.id} />}
          {activeSection === 'settings' && <SettingsSection profile={profile as unknown as Record<string, unknown> | null} userId={user?.id} institutionId={institutionId} />}
        </div>
      </main>
    </div>
  );
}

function TeacherOverview({ institutionId }: { institutionId: string | null }) {
  const [stats, setStats] = useState({ courses: 0, assignments: 0, students: 0, pendingSubmissions: 0 });

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_courses').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_assignments').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('ct_users').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId).eq('role', 'student'),
      supabase.from('ct_assignment_submissions').select('id', { count: 'exact', head: true }),
    ]).then(([c, a, s, sub]) => setStats({
      courses: c.count || 0,
      assignments: a.count || 0,
      students: s.count || 0,
      pendingSubmissions: sub.count || 0,
    }));
  }, [institutionId]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0047AB, #1a5fc9)' }}>
        <h1 className="font-lexend font-900 text-2xl">Teacher Dashboard</h1>
        <p className="font-jakarta text-white/80 text-sm mt-1">Manage courses, assignments, grades and submissions</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-primary">Courses</p><p className="font-lexend font-900 text-3xl text-primary">{stats.courses}</p></div>
        <div className="bg-secondary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-secondary">Assignments</p><p className="font-lexend font-900 text-3xl text-secondary">{stats.assignments}</p></div>
        <div className="bg-tertiary-container rounded-2xl p-5 text-center"><p className="text-xs font-jakarta text-tertiary">Students</p><p className="font-lexend font-900 text-3xl text-tertiary">{stats.students}</p></div>
        <div className="bg-surface-low rounded-2xl p-5 text-center border border-outline-variant/30"><p className="text-xs font-jakarta text-on-surface-variant">Submissions</p><p className="font-lexend font-900 text-3xl text-on-surface">{stats.pendingSubmissions}</p></div>
      </div>
    </div>
  );
}

function CoursesSection({ institutionId }: { institutionId: string | null }) {
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
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Create Course'}</button>
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', max_points: '100', course_id: '' });
  const [saving, setSaving] = useState(false);
  const [grading, setGrading] = useState<Record<string, { grade: string; feedback: string }>>({});
  const docInputRef = useRef<HTMLInputElement>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [assignmentDocs, setAssignmentDocs] = useState<Record<string, { id: string; name: string; url: string }[]>>({});

  const load = async () => {
    if (!institutionId) return;
    const [{ data: aData }, { data: cData }] = await Promise.all([
      supabase.from('ct_assignments').select('id,title,description,due_date,max_points,is_published,course_id').eq('institution_id', institutionId).order('due_date'),
      supabase.from('ct_courses').select('id,name,code,description,credits').eq('institution_id', institutionId),
    ]);
    setAssignments((aData || []) as Assignment[]);
    setCourses((cData || []) as Course[]);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.title || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_assignments').insert({
      title: form.title, description: form.description,
      due_date: form.due_date || null,
      max_points: parseInt(form.max_points),
      institution_id: institutionId,
      created_by: userId,
      course_id: form.course_id || null,
      is_published: true,
    });
    setForm({ title: '', description: '', due_date: '', max_points: '100', course_id: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  };

  const togglePublish = async (a: Assignment) => {
    await supabase.from('ct_assignments').update({ is_published: !a.is_published }).eq('id', a.id);
    load();
  };

  const loadSubmissions = async (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    setSubmissionsLoading(true);
    const { data: subs } = await supabase
      .from('ct_assignment_submissions')
      .select('id,student_id,submitted_at,notes')
      .eq('assignment_id', assignmentId);

    const enriched: Submission[] = [];
    for (const sub of (subs || [])) {
      const [{ data: studentData }, { data: filesData }, { data: gradeData }] = await Promise.all([
        supabase.from('ct_users').select('full_name,email').eq('id', sub.student_id).maybeSingle(),
        supabase.from('ct_submission_files').select('id,name,url').eq('submission_id', sub.id),
        supabase.from('ct_grades').select('grade,max_points,feedback').eq('assignment_id', assignmentId).eq('student_id', sub.student_id).maybeSingle(),
      ]);
      enriched.push({
        ...sub,
        student: studentData || undefined,
        files: filesData || [],
        grade: gradeData || undefined,
      });
    }
    setSubmissions(enriched);
    setSubmissionsLoading(false);
  };

  const loadDocs = async (assignmentId: string) => {
    const { data } = await supabase.from('ct_assignment_documents').select('id,name,url').eq('assignment_id', assignmentId);
    setAssignmentDocs(prev => ({ ...prev, [assignmentId]: data || [] }));
  };

  const uploadDoc = async (file: File, assignmentId: string) => {
    if (!file) return;
    setDocUploading(true);
    const path = `${assignmentId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('ct-assignments').upload(path, file, { upsert: false });
    if (!error) {
      const { data: urlData } = supabase.storage.from('ct-assignments').getPublicUrl(path);
      await supabase.from('ct_assignment_documents').insert({
        assignment_id: assignmentId,
        name: file.name,
        url: urlData.publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
      });
      loadDocs(assignmentId);
    }
    setDocUploading(false);
  };

  const submitGrade = async (sub: Submission, assignmentId: string) => {
    const g = grading[sub.student_id];
    if (!g) return;
    const assignment = assignments.find(a => a.id === assignmentId);
    await supabase.from('ct_grades').upsert({
      assignment_id: assignmentId,
      student_id: sub.student_id,
      score: parseFloat(g.grade),
      grade: parseFloat(g.grade),
      max_points: assignment?.max_points || 100,
      feedback: g.feedback,
      graded_by: userId,
      graded_at: new Date().toISOString(),
    }, { onConflict: 'assignment_id,student_id' });
    // Notify student
    await supabase.from('ct_notifications').insert({
      user_id: sub.student_id,
      type: 'grade_published',
      title: 'Grade Published',
      message: `Your submission for "${assignment?.title}" has been graded: ${g.grade}/${assignment?.max_points || 100}`,
    });
    loadSubmissions(assignmentId);
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
            <select className="border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface md:col-span-2" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
              <option value="">No specific course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Publish Assignment'}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {assignments.map(a => (
          <div key={a.id} className="bg-surface-lowest rounded-2xl p-4 shadow-float border border-outline-variant/30">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-lexend font-700 text-on-surface">{a.title}</p>
                {a.description && <p className="text-sm text-on-surface-variant mt-0.5">{a.description}</p>}
                {a.due_date && <p className="text-xs text-on-surface-variant mt-1">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => togglePublish(a)}
                  className={`text-xs px-3 py-1 rounded-full font-jakarta font-700 transition-colors ${a.is_published ? 'bg-tertiary-container text-tertiary hover:bg-tertiary/20' : 'bg-surface-low text-on-surface-variant hover:bg-outline/20'}`}
                >
                  {a.is_published ? 'Published' : 'Draft'}
                </button>
                <span className="font-lexend font-700 text-primary text-sm">{a.max_points || 100} pts</span>
              </div>
            </div>

            {/* Doc upload */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => { loadDocs(a.id); docInputRef.current?.click(); (docInputRef.current as HTMLInputElement & { _assignmentId?: string })._assignmentId = a.id; }}
                disabled={docUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-jakarta font-700 text-on-surface-variant hover:bg-surface-low transition-colors"
              >
                <Upload size={12} /> Upload Doc
              </button>
              {(assignmentDocs[a.id] || []).map(doc => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary font-jakarta hover:underline">
                  <Download size={12} /> {doc.name}
                </a>
              ))}
              {!assignmentDocs[a.id] && (
                <button onClick={() => loadDocs(a.id)} className="text-xs text-on-surface-variant font-jakarta hover:text-primary transition-colors">Load docs</button>
              )}
            </div>

            {/* View submissions */}
            <button
              onClick={() => selectedAssignment === a.id ? setSelectedAssignment(null) : loadSubmissions(a.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-container text-primary font-jakarta font-700 hover:bg-primary/20 transition-colors"
            >
              {selectedAssignment === a.id ? 'Hide Submissions' : 'View Submissions'}
            </button>

            {selectedAssignment === a.id && (
              <div className="mt-4 space-y-3">
                {submissionsLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" size={20} /></div>
                ) : submissions.length === 0 ? (
                  <p className="text-sm text-on-surface-variant font-jakarta py-4 text-center">No submissions yet</p>
                ) : submissions.map(sub => (
                  <div key={sub.id} className="bg-surface rounded-xl p-3 border border-outline-variant/20">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-jakarta font-700 text-sm text-on-surface">{sub.student?.full_name || sub.student?.email || sub.student_id.slice(-8)}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(sub.submitted_at).toLocaleString()}</p>
                      </div>
                      {sub.grade && (
                        <span className="font-lexend font-700 text-primary text-sm">{sub.grade.grade}/{sub.grade.max_points}</span>
                      )}
                    </div>
                    {(sub.files || []).map(f => (
                      <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary font-jakarta hover:underline mr-3">
                        <Download size={11} /> {f.name}
                      </a>
                    ))}
                    {sub.notes && <p className="text-xs text-on-surface-variant mt-1">{sub.notes}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        placeholder="Grade"
                        className="w-20 border border-outline-variant rounded-lg px-2 py-1 text-xs font-jakarta bg-surface"
                        value={grading[sub.student_id]?.grade || sub.grade?.grade?.toString() || ''}
                        onChange={e => setGrading(g => ({ ...g, [sub.student_id]: { ...g[sub.student_id], grade: e.target.value } }))}
                      />
                      <input
                        type="text"
                        placeholder="Feedback"
                        className="flex-1 border border-outline-variant rounded-lg px-2 py-1 text-xs font-jakarta bg-surface"
                        value={grading[sub.student_id]?.feedback || sub.grade?.feedback || ''}
                        onChange={e => setGrading(g => ({ ...g, [sub.student_id]: { ...g[sub.student_id], feedback: e.target.value } }))}
                      />
                      <button
                        onClick={() => submitGrade(sub, a.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-tertiary text-white text-xs font-jakarta font-700"
                      >
                        <CheckCircle size={12} /> Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {assignments.length === 0 && <p className="text-on-surface-variant font-jakarta text-center py-12">No assignments yet</p>}
      </div>

      <input
        ref={docInputRef}
        type="file"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          const aId = (docInputRef.current as HTMLInputElement & { _assignmentId?: string })?._assignmentId;
          if (f && aId) uploadDoc(f, aId);
          if (docInputRef.current) docInputRef.current.value = '';
        }}
      />
    </div>
  );
}

function GradesSection({ institutionId, userId }: { institutionId: string | null; userId?: string }) {
  const [grades, setGrades] = useState<Array<{
    id: string; grade: number | null; max_points: number | null; feedback: string | null;
    student_id: string; assignment_id: string; graded_at: string;
  }>>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  useEffect(() => {
    if (!userId) return;
    supabase.from('ct_grades').select('id,grade,max_points,feedback,student_id,assignment_id,graded_at').eq('graded_by', userId).order('graded_at', { ascending: false }).limit(100).then(({ data }) => setGrades(data || []));
  }, [userId]);

  const saveEdit = async (id: string) => {
    await supabase.from('ct_grades').update({ grade: parseFloat(editVal) }).eq('id', id);
    setGrades(g => g.map(gr => gr.id === id ? { ...gr, grade: parseFloat(editVal) } : gr));
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Grade Book</h1>
      <div className="bg-surface-lowest rounded-2xl shadow-float border border-outline-variant/30 overflow-hidden">
        {grades.length === 0 ? (
          <p className="text-center text-on-surface-variant font-jakarta py-12">No grades recorded yet</p>
        ) : grades.map((g, i) => (
          <div key={g.id} className={`flex items-center justify-between px-4 py-3 ${i < grades.length - 1 ? 'border-b border-outline-variant/20' : ''}`}>
            <div>
              <p className="font-jakarta text-sm text-on-surface">Student {g.student_id.slice(-6)}</p>
              {g.feedback && <p className="text-xs text-on-surface-variant">{g.feedback}</p>}
              <p className="text-xs text-on-surface-variant">{new Date(g.graded_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              {editing === g.id ? (
                <>
                  <input
                    type="number"
                    className="w-16 border border-outline-variant rounded-lg px-2 py-1 text-xs font-jakarta bg-surface"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                  />
                  <button onClick={() => saveEdit(g.id)} className="text-xs px-2 py-1 bg-primary text-white rounded-lg font-jakarta">Save</button>
                  <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-surface-low rounded-lg font-jakarta"><X size={12} /></button>
                </>
              ) : (
                <>
                  <span className="font-lexend font-700 text-primary">{g.grade}/{g.max_points}</span>
                  <button onClick={() => { setEditing(g.id); setEditVal(String(g.grade || '')); }} className="text-xs text-on-surface-variant hover:text-primary font-jakarta">Edit</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentsSection({ institutionId }: { institutionId: string | null }) {
  const [students, setStudents] = useState<{ id: string; full_name: string | null; email: string }[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_users').select('id,full_name,email').eq('institution_id', institutionId).eq('role', 'student').order('full_name').limit(100).then(({ data }) => setStudents(data || []));
  }, [institutionId]);

  const filtered = students.filter(s => !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Students</h1>
      <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
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
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; body: string | null; created_at: string }[]>([]);
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
        <button onClick={save} disabled={saving} className="mt-3 px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50">{saving ? 'Posting...' : 'Post'}</button>
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

function SettingsSection({ profile, userId, institutionId }: { profile: Record<string, unknown> | null; userId?: string; institutionId: string | null }) {
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: (profile?.full_name as string) || '',
    bio: (profile?.bio as string) || '',
    department: (profile?.department as string) || '',
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
      <h1 className="font-lexend font-900 text-2xl text-on-surface">Settings</h1>

      {/* Profile Photo */}
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

      {/* Profile Fields */}
      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'full_name' },
            { label: 'Phone', key: 'phone' },
            { label: 'Department', key: 'department' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">{field.label}</label>
              <input
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface"
                value={(form as Record<string, string>)[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Bio</label>
            <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>
        <button onClick={save} disabled={saving} className={`mt-5 px-6 py-2.5 rounded-xl font-jakarta font-700 text-sm text-white transition-colors ${saved ? 'bg-tertiary' : 'bg-secondary hover:bg-secondary/90'} disabled:opacity-50`}>
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* Notification Prefs */}
      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        {userId && <NotificationPrefsPanel userId={userId} institutionId={institutionId} role="teacher" />}
      </div>

      {/* Password */}
      <div className="bg-surface-lowest rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Change Password</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">New Password</label>
            <input
              type="password"
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface"
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
