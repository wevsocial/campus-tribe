import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Survey { id: string; title: string; description: string | null; status: string; anonymous: boolean; }
interface Question { id: string; prompt: string; question_type: string; order_index: number; }

export default function StudentSurveys() {
  const { user, institutionId } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    Promise.all([
      supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).eq('status', 'published'),
      supabase.from('ct_survey_responses').select('survey_id').eq('user_id', user.id),
    ]).then(([sv, sr]) => {
      setSurveys(sv.data ?? []);
      setCompletedIds(new Set((sr.data ?? []).map((r: { survey_id: string }) => r.survey_id)));
      setLoading(false);
    });
  }, [institutionId, user?.id]);

  const openSurvey = async (survey: Survey) => {
    setActiveSurvey(survey);
    setAnswers({});
    const { data } = await supabase.from('ct_survey_questions').select('*').eq('survey_id', survey.id).order('order_index');
    setQuestions(data ?? []);
  };

  const submitSurvey = async () => {
    if (!activeSurvey || !user?.id) return;
    setSubmitting(true);
    await supabase.from('ct_survey_responses').insert({
      survey_id: activeSurvey.id,
      user_id: user.id,
      answers,
    });
    setCompletedIds(new Set([...completedIds, activeSurvey.id]));
    setActiveSurvey(null);
    setSubmitting(false);
  };

  if (loading) return <LoadingSkeleton />;

  if (activeSurvey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveSurvey(null)} className="p-2 hover:bg-surface-low rounded-xl">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h1 className="font-lexend text-xl font-extrabold text-on-surface">{activeSurvey.title}</h1>
        </div>
        {activeSurvey.description && <p className="text-on-surface-variant font-jakarta text-sm">{activeSurvey.description}</p>}
        {questions.length === 0 ? (
          <Card><p className="text-on-surface-variant text-center py-4">This survey has no questions yet.</p></Card>
        ) : (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <Card key={q.id}>
                <p className="font-jakarta font-bold text-on-surface mb-3">{i+1}. {q.prompt}</p>
                <textarea
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Your answer..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none resize-none"
                />
              </Card>
            ))}
            <Button onClick={submitSurvey} isLoading={submitting} className="rounded-full w-full">Submit Survey</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Surveys</h1>
      {surveys.length === 0 ? <EmptyState message="No active surveys right now." /> : (
        <div className="space-y-3">
          {surveys.map(s => {
            const done = completedIds.has(s.id);
            return (
              <Card key={s.id} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface">{s.title}</p>
                  {s.description && <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1">{s.description}</p>}
                  <div className="flex gap-2 mt-1">
                    {s.anonymous && <Badge label="Anonymous" variant="neutral" />}
                    {done && <Badge label="Completed" variant="success" />}
                  </div>
                </div>
                <Button size="sm" variant={done ? 'outline' : 'primary'} onClick={() => !done && openSurvey(s)} className="rounded-full flex-shrink-0" disabled={done}>
                  {done ? 'Done' : 'Take Survey'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
