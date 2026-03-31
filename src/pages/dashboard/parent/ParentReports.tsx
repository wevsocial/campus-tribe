import React, { useEffect, useState } from 'react';
import { LayoutList, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import EmptyState from '../../../components/ui/EmptyState';

interface ParentUpdate {
  id: string;
  note: string;
  note_type: string;
  created_at: string;
  author?: { full_name: string | null };
}

interface GradeSummary {
  student_name: string;
  assignment_title: string;
  grade: number | null;
  max_points: number | null;
  graded_at: string;
}

export default function ParentReports() {
  const { user, institutionId } = useAuth();
  const [updates, setUpdates] = useState<ParentUpdate[]>([]);
  const [gradeSummary, setGradeSummary] = useState<GradeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !institutionId) return;
    const load = async () => {
      setLoading(true);

      // Parent updates
      const { data: upd } = await supabase
        .from('ct_parent_updates')
        .select('id, note, note_type, created_at, author:author_id(full_name)')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(20);
      setUpdates((upd || []) as unknown as ParentUpdate[]);

      // Grade summary for linked children
      const { data: links } = await supabase
        .from('ct_parent_links')
        .select('student_id')
        .eq('parent_user_id', user.id);
      const childIds = (links || []).map(l => l.student_id);

      if (childIds.length > 0) {
        const { data: students } = await supabase.from('ct_students').select('id, user_id, full_name').in('id', childIds);
        const userIdMap: Record<string, string> = {};
        const studentMap: Record<string, string> = {};
        for (const s of (students || [])) {
          studentMap[s.id] = s.full_name || s.id;
          userIdMap[s.id] = s.user_id;
        }
        const userIds = Object.values(userIdMap).filter(Boolean);

        if (userIds.length > 0) {
          const { data: gradeData } = await supabase
            .from('ct_grades')
            .select('student_id, grade, max_points, graded_at, assignment:ct_assignments(title)')
            .in('student_id', userIds)
            .order('graded_at', { ascending: false })
            .limit(20);

          // reverse map user_id -> name
          const userToName: Record<string, string> = {};
          for (const s of (students || [])) userToName[s.user_id] = s.full_name || 'Student';

          setGradeSummary((gradeData || []).map(g => ({
            student_name: userToName[g.student_id] || 'Student',
            assignment_title: (g.assignment as { title?: string })?.title || 'Assignment',
            grade: g.grade,
            max_points: g.max_points,
            graded_at: g.graded_at,
          })));
        }
      }

      setLoading(false);
    };
    load();
  }, [user?.id, institutionId]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Reports</h1>

      {/* Grade Summary */}
      <div>
        <h2 className="font-lexend font-bold text-lg text-on-surface mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Academic Summary</h2>
        {gradeSummary.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No grades available for linked children.</p>
        ) : (
          <div className="space-y-2">
            {gradeSummary.map((g, i) => (
              <div key={i} className="bg-surface-lowest rounded-xl p-3 border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <p className="font-jakarta font-bold text-sm text-on-surface">{g.assignment_title}</p>
                  <p className="text-xs text-on-surface-variant">{g.student_name} &middot; {new Date(g.graded_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-lexend font-bold text-primary">{g.grade}/{g.max_points}</p>
                  <p className="text-xs text-on-surface-variant">{g.grade && g.max_points ? Math.round((g.grade / g.max_points) * 100) : 0}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Updates */}
      <div>
        <h2 className="font-lexend font-bold text-lg text-on-surface mb-3 flex items-center gap-2"><LayoutList size={18} className="text-secondary" /> Staff Updates</h2>
        {updates.length === 0 ? (
          <EmptyState message="No reports available yet." />
        ) : (
          <div className="space-y-3">
            {updates.map(u => (
              <div key={u.id} className="bg-surface-lowest rounded-xl p-4 border border-outline-variant/30">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-primary font-jakarta font-bold capitalize">{u.note_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-on-surface-variant">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-on-surface mt-1">{u.note}</p>
                <p className="text-xs text-on-surface-variant mt-1">{(u.author as { full_name?: string | null })?.full_name || 'Staff'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
