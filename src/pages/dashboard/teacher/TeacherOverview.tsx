import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';

export default function TeacherOverview() {
  const { institutionId } = useAuth();
  const [stats, setStats] = useState({ surveys: 0, responses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_surveys').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_survey_responses').select('id', { count: 'exact' }),
    ]).then(([sv, sr]) => {
      setStats({ surveys: sv.count ?? 0, responses: sr.count ?? 0 });
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><h1 className="font-lexend text-2xl font-extrabold text-on-surface">Teacher Overview</h1><StatSkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Teacher Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard value={stats.surveys} label="Surveys" color="primary" />
        <StatCard value={stats.responses} label="Total Responses" color="secondary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'My Surveys', href: '/dashboard/teacher/surveys', emoji: 'list' },
          { label: 'Courses', href: '/dashboard/teacher/courses', emoji: 'book' },
        ].map(l => (
          <a key={l.href} href={l.href} className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-primary-container transition-colors group">
            <span className="text-2xl">{l.emoji}</span>
            <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
