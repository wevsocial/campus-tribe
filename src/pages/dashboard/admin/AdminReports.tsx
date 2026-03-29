import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/ui/StatCard';
import { LoadingSkeleton, StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Survey {
  id: string;
  title: string;
  status: string;
  anonymous: boolean;
  created_at: string;
  response_count?: number;
}

export default function AdminReports() {
  const { institutionId } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_survey_responses').select('id, survey_id', { count: 'exact' }),
    ]).then(async ([sv, sr]) => {
      const surveyList = sv.data ?? [];
      const responseCounts: Record<string, number> = {};
      (sr.data ?? []).forEach((r: { survey_id: string }) => {
        responseCounts[r.survey_id] = (responseCounts[r.survey_id] || 0) + 1;
      });
      setSurveys(surveyList.map(s => ({ ...s, response_count: responseCounts[s.id] || 0 })));
      setTotalResponses(sr.count ?? 0);
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton /></div>;

  const published = surveys.filter(s => s.status === 'published');
  const draft = surveys.filter(s => s.status === 'draft');

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Reports & Surveys</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={surveys.length} label="Total Surveys" icon="assignment" color="primary" />
        <StatCard value={published.length} label="Published" icon="public" color="tertiary" />
        <StatCard value={totalResponses} label="Total Responses" icon="bar_chart" color="secondary" />
      </div>

      {/* Response rate bars */}
      {published.length > 0 && (
        <Card>
          <h2 className="font-lexend font-bold text-on-surface mb-4">Survey Response Rates</h2>
          <div className="space-y-4">
            {published.map(survey => {
              const rate = Math.min(100, survey.response_count ? Math.round((survey.response_count / 100) * 100) : 0);
              return (
                <div key={survey.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-jakarta text-sm font-bold text-on-surface truncate max-w-xs">{survey.title}</p>
                    <span className="font-jakarta text-sm text-on-surface-variant">{survey.response_count} responses</span>
                  </div>
                  <div className="h-2 bg-surface-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(4, (survey.response_count || 0) * 5))}%` }} />
                  </div>
                </div>
              );
            })}
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
