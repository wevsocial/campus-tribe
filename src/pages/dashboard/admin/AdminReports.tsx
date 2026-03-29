import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/ui/StatCard';
import { LoadingSkeleton, StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { AlertTriangle, Download } from 'lucide-react';

interface Survey {
  id: string; title: string; status: string; anonymous: boolean; created_at: string; response_count?: number;
}

export default function AdminReports() {
  const { institutionId } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [wellnessAlert, setWellnessAlert] = useState<{ avg: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_survey_responses').select('id, survey_id', { count: 'exact' }),
      supabase.from('ct_wellbeing_checks').select('mood'),
    ]).then(([sv, sr, wb]) => {
      const surveyList = sv.data ?? [];
      const responseCounts: Record<string, number> = {};
      (sr.data ?? []).forEach((r: { survey_id: string }) => {
        responseCounts[r.survey_id] = (responseCounts[r.survey_id] || 0) + 1;
      });
      setSurveys(surveyList.map(s => ({ ...s, response_count: responseCounts[s.id] || 0 })));
      setTotalResponses(sr.count ?? 0);

      // Wellness cohort threshold alert (Module 11)
      const moods = (wb.data ?? []).map((w: { mood: number }) => w.mood);
      if (moods.length > 0) {
        const avg = moods.reduce((a: number, b: number) => a + b, 0) / moods.length;
        if (avg < 3) setWellnessAlert({ avg: parseFloat(avg.toFixed(2)), count: moods.length });
      }
      setLoading(false);
    });
  }, [institutionId]);

  const exportAccreditation = () => {
    const rows = [
      ['Report Type', 'Accreditation Data Export'],
      ['Institution ID', institutionId ?? ''],
      ['Generated At', new Date().toISOString()],
      ['Total Surveys', surveys.length.toString()],
      ['Published Surveys', surveys.filter(s => s.status === 'published').length.toString()],
      ['Total Responses', totalResponses.toString()],
      ...surveys.map(s => [s.title, s.status, (s.response_count ?? 0).toString()]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'accreditation-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton /></div>;

  const published = surveys.filter(s => s.status === 'published');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Reports & Surveys</h1>
        <button onClick={exportAccreditation} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-jakarta text-sm font-700 hover:bg-primary/90 transition-colors">
          <Download size={14} />
          Export Accreditation Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={surveys.length} label="Total Surveys" icon="assignment" color="primary" />
        <StatCard value={published.length} label="Published" icon="public" color="tertiary" />
        <StatCard value={totalResponses} label="Total Responses" icon="bar_chart" color="secondary" />
      </div>

      {/* Wellness cohort alert */}
      {wellnessAlert && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-jakarta font-700 text-amber-800 dark:text-amber-400 text-sm">⚠️ Wellness Alert — Cohort avg mood below threshold</p>
            <p className="text-xs text-amber-700 dark:text-amber-500 font-jakarta mt-0.5">
              Average mood score: <strong>{wellnessAlert.avg}/5</strong> across {wellnessAlert.count} check-ins. Consider scheduling a wellness event or reaching out to counseling services.
            </p>
          </div>
        </div>
      )}

      {published.length > 0 && (
        <Card>
          <h2 className="font-lexend font-bold text-on-surface mb-4">Survey Response Rates</h2>
          <div className="space-y-4">
            {published.map(survey => (
              <div key={survey.id}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-jakarta text-sm font-bold text-on-surface truncate max-w-xs">{survey.title}</p>
                  <span className="font-jakarta text-sm text-on-surface-variant">{survey.response_count} responses</span>
                </div>
                <div className="h-2 bg-surface-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(4, (survey.response_count || 0) * 5))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">All Surveys</h2>
        {surveys.length === 0 ? <EmptyState icon="📋" message="No surveys yet." /> : (
          <div className="space-y-3">
            {surveys.map(s => (
              <Card key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{s.title}</p>
                  <p className="text-sm text-on-surface-variant">{s.response_count} responses · {s.anonymous ? 'Anonymous' : 'Named'}</p>
                </div>
                <Badge label={s.status} variant={s.status === 'published' ? 'success' : 'neutral'} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
