import React, { useEffect, useState } from 'react';
import { Baby, Bell, Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import ProfilePhotoUpload from '../../../components/ui/ProfilePhotoUpload';

interface Child {
  id: string;
  student_id: string;
  student_name: string | null;
  student_email: string;
  user_id: string;
}

interface ParentUpdate {
  id: string;
  note: string;
  note_type: string;
  created_at: string;
  author?: { full_name: string | null };
}

interface RecentGrade {
  grade: number | null;
  max_points: number | null;
  assignment?: { title: string };
}

export default function ParentOverview() {
  const { user, institutionId } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [updates, setUpdates] = useState<ParentUpdate[]>([]);
  const [grades, setGrades] = useState<Record<string, RecentGrade[]>>({});
  const [events, setEvents] = useState<Array<{ id: string; title: string; start_time: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !institutionId) return;
    const load = async () => {
      setLoading(true);

      // Fetch linked children via ct_parent_links (student_id -> ct_students.id)
      const { data: links } = await supabase
        .from('ct_parent_links')
        .select('student_id')
        .eq('parent_user_id', user.id);

      const studentRecordIds = (links || []).map(l => l.student_id);
      const childList: Child[] = [];

      if (studentRecordIds.length > 0) {
        // ct_students has user_id, full_name, email
        const { data: studentRecords } = await supabase
          .from('ct_students')
          .select('id, user_id, full_name, email')
          .in('id', studentRecordIds);

        for (const s of (studentRecords || [])) {
          childList.push({
            id: s.id,
            student_id: s.id,
            user_id: s.user_id,
            student_name: s.full_name,
            student_email: s.email,
          });
        }
      }
      setChildren(childList);

      // Fetch recent grades for each child using user_id
      const gradeMap: Record<string, RecentGrade[]> = {};
      for (const child of childList) {
        if (child.user_id) {
          const { data: g } = await supabase
            .from('ct_grades')
            .select('grade, max_points, assignment:ct_assignments(title)')
            .eq('student_id', child.user_id)
            .order('graded_at', { ascending: false })
            .limit(3);
          gradeMap[child.id] = (g || []) as unknown as RecentGrade[];
        }
      }
      setGrades(gradeMap);

      // Fetch parent updates for the institution
      const { data: upd } = await supabase
        .from('ct_parent_updates')
        .select('id, note, note_type, created_at, author:author_id(full_name)')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(5);
      setUpdates((upd || []) as unknown as ParentUpdate[]);

      // Upcoming events
      const { data: ev } = await supabase
        .from('ct_events')
        .select('id, title, start_time')
        .eq('institution_id', institutionId)
        .gte('start_time', new Date().toISOString())
        .order('start_time')
        .limit(5);
      setEvents(ev || []);

      setLoading(false);
    };
    load();
  }, [user?.id, institutionId]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Parent Overview</h1>

      {user?.id && (
        <div className="bg-surface-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-float">
          <p className="font-lexend font-700 text-on-surface mb-3">Profile Photo</p>
          <ProfilePhotoUpload userId={user.id} displayName={user.email || ''} />
        </div>
      )}

      <Card variant="primary-tinted">
        <p className="font-jakarta font-bold text-on-surface">Welcome to the Parent Portal</p>
        <p className="text-sm text-on-surface-variant mt-1">Monitor your child's activities, grades, and school updates.</p>
      </Card>

      {/* Children Summary */}
      <div>
        <h2 className="font-lexend font-bold text-lg text-on-surface mb-3 flex items-center gap-2"><Baby size={18} className="text-primary" /> My Children</h2>
        {children.length === 0 ? (
          <EmptyState message="No children linked. Ask your school administrator to link your account." />
        ) : (
          <div className="space-y-3">
            {children.map(child => (
              <div key={child.id} className="bg-surface-lowest rounded-xl p-4 border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center font-lexend font-bold text-primary text-sm">
                    {(child.student_name || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-jakarta font-bold text-on-surface">{child.student_name || child.student_email}</p>
                    <p className="text-xs text-on-surface-variant">{child.student_email}</p>
                  </div>
                </div>
                {(grades[child.id] || []).length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {grades[child.id].map((g, i) => (
                      <span key={i} className="text-xs bg-secondary-container text-secondary px-2 py-1 rounded-lg font-jakarta">
                        {(g.assignment as { title?: string })?.title || 'Assignment'}: {g.grade}/{g.max_points}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Updates */}
      <div>
        <h2 className="font-lexend font-bold text-lg text-on-surface mb-3 flex items-center gap-2"><Bell size={18} className="text-secondary" /> School Updates</h2>
        {updates.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No updates yet.</p>
        ) : (
          <div className="space-y-2">
            {updates.map(u => (
              <div key={u.id} className="bg-surface-lowest rounded-xl p-3 border border-outline-variant/30">
                <p className="text-sm text-on-surface">{u.note}</p>
                <p className="text-xs text-on-surface-variant mt-1">{(u.author as { full_name?: string | null })?.full_name || 'Staff'} &middot; {new Date(u.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-lg text-on-surface mb-3 flex items-center gap-2"><Calendar size={18} className="text-tertiary" /> Upcoming Events</h2>
          <div className="space-y-2">
            {events.map(e => (
              <div key={e.id} className="bg-surface-lowest rounded-xl p-3 border border-outline-variant/30 flex justify-between items-center">
                <p className="text-sm font-jakarta font-bold text-on-surface">{e.title}</p>
                <p className="text-xs text-on-surface-variant">{new Date((e as any).start_time).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
