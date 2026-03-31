import React, { useEffect, useState } from 'react';
import { Baby, ChevronDown, ChevronUp, BookOpen, BarChart2, UserPlus, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';

interface Child {
  id: string; // ct_students.id
  user_id: string; // ct_students.user_id (links to ct_users)
  student_name: string | null;
  student_email: string;
}

interface Grade {
  grade: number | null;
  max_points: number | null;
  graded_at: string;
  assignment: { title: string };
}

export default function ParentChildren() {
  const { user, institutionId } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [courses, setCourses] = useState<Record<string, Array<{ course: { name: string; code: string } }>>>({});
  const [grades, setGrades] = useState<Record<string, Grade[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; user_id: string; full_name: string | null; email: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data: links } = await supabase
      .from('ct_parent_links')
      .select('student_id')
      .eq('parent_user_id', user.id);

    const studentIds = (links || []).map(l => l.student_id);
    if (studentIds.length > 0) {
      const { data: records } = await supabase
        .from('ct_students')
        .select('id, user_id, full_name, email')
        .in('id', studentIds);
      setChildren((records || []).map(s => ({ id: s.id, user_id: s.user_id, student_name: s.full_name, student_email: s.email })));
    } else {
      setChildren([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const expand = async (child: Child) => {
    if (expanded === child.id) { setExpanded(null); return; }
    setExpanded(child.id);
    if (!courses[child.id] && child.user_id) {
      const [{ data: enrollData }, { data: gradeData }] = await Promise.all([
        supabase.from('ct_course_enrollments').select('course:ct_courses(name,code)').eq('student_id', child.user_id),
        supabase.from('ct_grades').select('grade, max_points, graded_at, assignment:ct_assignments(title)').eq('student_id', child.user_id).order('graded_at', { ascending: false }).limit(5),
      ]);
      setCourses(c => ({ ...c, [child.id]: (enrollData || []) as unknown as Array<{ course: { name: string; code: string } }> }));
      setGrades(g => ({ ...g, [child.id]: (gradeData || []) as unknown as Grade[] }));
    }
  };

  const searchStudents = async () => {
    if (!searchQuery.trim() || !institutionId) return;
    setSearching(true);
    const { data } = await supabase
      .from('ct_students')
      .select('id, user_id, full_name, email')
      .ilike('email', `%${searchQuery}%`)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  };

  const linkChild = async (studentId: string) => {
    if (!user?.id) return;
    setLinking(true);
    await supabase.from('ct_parent_links').upsert(
      { parent_user_id: user.id, student_id: studentId, status: 'active' },
      { onConflict: 'parent_user_id,student_id' }
    );
    setSearchResults([]);
    setSearchQuery('');
    setLinking(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">My Children</h1>

      <Card>
        <p className="font-jakarta font-bold text-on-surface mb-3 flex items-center gap-2"><UserPlus size={16} className="text-primary" /> Link a Child Account</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-outline-variant rounded-xl px-4 py-2 font-jakarta text-sm bg-surface"
            placeholder="Search by student email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchStudents()}
          />
          <button onClick={searchStudents} disabled={searching} className="px-4 py-2 rounded-xl bg-primary text-white font-jakarta font-bold text-sm hover:bg-primary/90">
            {searching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Search size={16} />}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-surface-low rounded-xl px-4 py-2">
                <div>
                  <p className="text-sm font-jakarta font-bold text-on-surface">{s.full_name || s.email}</p>
                  <p className="text-xs text-on-surface-variant">{s.email}</p>
                </div>
                <button onClick={() => linkChild(s.id)} disabled={linking} className="text-xs px-3 py-1 bg-secondary text-white rounded-lg font-jakarta font-bold hover:bg-secondary/90">Link</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {children.length === 0 ? (
        <EmptyState message="No children linked yet." />
      ) : (
        <div className="space-y-3">
          {children.map(child => (
            <div key={child.id} className="bg-surface-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
              <button onClick={() => expand(child)} className="w-full flex items-center justify-between p-4 hover:bg-surface-low transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center font-lexend font-bold text-primary text-sm">
                    {(child.student_name || 'S')[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-jakarta font-bold text-on-surface">{child.student_name || child.student_email}</p>
                    <p className="text-xs text-on-surface-variant">{child.student_email}</p>
                  </div>
                </div>
                {expanded === child.id ? <ChevronUp size={18} className="text-on-surface-variant" /> : <ChevronDown size={18} className="text-on-surface-variant" />}
              </button>

              {expanded === child.id && (
                <div className="px-4 pb-4 border-t border-outline-variant/20 pt-4 space-y-4">
                  <div>
                    <p className="font-jakarta font-bold text-sm text-on-surface mb-2 flex items-center gap-2"><BookOpen size={14} className="text-secondary" /> Enrolled Courses</p>
                    {(courses[child.id] || []).length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No courses found.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {courses[child.id].map((e, i) => (
                          <span key={i} className="text-xs bg-secondary-container text-secondary px-3 py-1 rounded-full font-jakarta font-bold">
                            {(e.course as { name?: string; code?: string })?.name} ({(e.course as { name?: string; code?: string })?.code})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-jakarta font-bold text-sm text-on-surface mb-2 flex items-center gap-2"><BarChart2 size={14} className="text-tertiary" /> Recent Grades</p>
                    {(grades[child.id] || []).length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No grades yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {grades[child.id].map((g, i) => (
                          <div key={i} className="flex justify-between text-xs text-on-surface bg-surface-low rounded-lg px-3 py-1.5">
                            <span>{(g.assignment as { title?: string })?.title || 'Assignment'}</span>
                            <span className="font-bold text-primary">{g.grade}/{g.max_points}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
