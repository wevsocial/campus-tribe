import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Plus, Radio, BarChart2, X, QrCode } from 'lucide-react';

interface Survey {
  id: string; title: string; description: string | null; status: string; is_anonymous: boolean; created_at: string;
}
interface SurveyQuestion {
  id: string; survey_id: string; question_text: string; question_type: string; options: string[] | null; required: boolean; order_index: number;
}
interface SurveyResponse {
  id: string; survey_id: string; question_id: string; response_text: string | null;
}

const QUESTION_TYPES = ['multiple_choice', 'rating', 'likert', 'nps', 'text'];

export default function TeacherSurveys() {
  const { institutionId, user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [livePollSurvey, setLivePollSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create' | 'questions' | 'results'>('list');
  const [newSurveyForm, setNewSurveyForm] = useState({ title: '', description: '', anonymous: false });
  const [createdSurvey, setCreatedSurvey] = useState<Survey | null>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState({ prompt: '', question_type: 'rating', options: '' });
  const [saving, setSaving] = useState(false);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false })
      .then(({ data }) => { setSurveys(data ?? []); setLoading(false); });
  }, [institutionId]);

  const createSurvey = async () => {
    if (!newSurveyForm.title.trim() || !institutionId || !user) return;
    setSaving(true);
    const { data, error } = await supabase.from('ct_surveys').insert({
      title: newSurveyForm.title,
      description: newSurveyForm.description || null,
      is_anonymous: newSurveyForm.anonymous,
      status: 'draft',
      institution_id: institutionId,
      created_by: user.id,
      is_active: false,
    }).select().single();
    setSaving(false);
    if (data) {
      setSurveys(prev => [data, ...prev]);
      setCreatedSurvey(data);
      setSurveyQuestions([]);
      setNewSurveyForm({ title: '', description: '', anonymous: false });
      setView('questions');
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.prompt.trim() || !createdSurvey) return;
    const options = newQuestion.question_type === 'multiple_choice' && newQuestion.options
      ? newQuestion.options.split(',').map(s => s.trim()).filter(Boolean)
      : null;
    const { data } = await supabase.from('ct_survey_questions').insert({
      survey_id: createdSurvey.id,
      question_text: newQuestion.prompt,
      question_type: newQuestion.question_type,
      options: options,
      required: true,
      order_index: surveyQuestions.length + 1,
    }).select().single();
    if (data) {
      setSurveyQuestions(prev => [...prev, data]);
      setNewQuestion({ prompt: '', question_type: 'rating', options: '' });
    }
  };

  const publishSurvey = async (s: Survey) => {
    await supabase.from('ct_surveys').update({ status: 'active', is_active: true }).eq('id', s.id);
    setSurveys(prev => prev.map(x => x.id === s.id ? { ...x, status: 'active' } : x));
    if (createdSurvey?.id === s.id) setCreatedSurvey(prev => prev ? { ...prev, status: 'active' } : prev);
  };

  const viewResults = async (s: Survey) => {
    setSelectedSurvey(s);
    const [qRes, rRes] = await Promise.all([
      supabase.from('ct_survey_questions').select('*').eq('survey_id', s.id).order('order_index'),
      supabase.from('ct_survey_responses').select('*').eq('survey_id', s.id),
    ]);
    setQuestions(qRes.data ?? []);
    setResponses(rRes.data ?? []);
    setView('results');
  };

  const startLivePoll = (s: Survey) => {
    setLivePollSurvey(s);
    setLiveCount(0);
    liveIntervalRef.current = setInterval(async () => {
      const { count } = await supabase.from('ct_survey_responses').select('id', { count: 'exact' }).eq('survey_id', s.id);
      setLiveCount(count ?? 0);
    }, 3000);
  };

  const stopLivePoll = () => {
    if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    setLivePollSurvey(null);
  };

  const getBarData = (q: SurveyQuestion) => {
    const qResponses = responses.filter(r => r.question_id === q.id);
    if (q.question_type === 'rating' || q.question_type === 'nps') {
      const counts: Record<string, number> = {};
      qResponses.forEach(r => { if (r.response_text) counts[r.response_text] = (counts[r.response_text] || 0) + 1; });
      return Object.entries(counts).sort(([a], [b]) => Number(a) - Number(b));
    }
    if (q.question_type === 'multiple_choice' && q.options) {
      return q.options.map(opt => [opt, qResponses.filter(r => r.response_text === opt).length] as [string, number]);
    }
    return [];
  };

  const pollUrl = `https://campus-tribe.onrender.com/survey/${livePollSurvey?.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pollUrl)}`;

  if (loading) return <LoadingSkeleton />;

  // Live poll fullscreen overlay
  if (livePollSurvey) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-8 text-white">
        <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={stopLivePoll}>
          <X size={28} />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Radio size={20} className="text-red-400 animate-pulse" />
          <span className="text-red-400 font-bold text-sm uppercase tracking-widest">Live Poll</span>
        </div>
        <h2 className="font-lexend font-black text-3xl text-center mb-6">{livePollSurvey.title}</h2>
        <img src={qrUrl} alt="QR Code" className="rounded-2xl mb-4" style={{ width: 200, height: 200 }} />
        <p className="text-white/60 text-sm mb-8 break-all max-w-sm text-center">{pollUrl}</p>
        <div className="bg-white/10 rounded-2xl px-12 py-6 text-center">
          <p className="text-5xl font-lexend font-black text-white">{liveCount}</p>
          <p className="text-white/60 text-sm mt-1">responses received</p>
        </div>
        <button className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold" onClick={stopLivePoll}>
          End Live Poll
        </button>
      </div>
    );
  }

  // Results view
  if (view === 'results' && selectedSurvey) {
    const totalRespondents = new Set(responses.map(r => r.survey_id)).size;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-on-surface" onClick={() => setView('list')}>← Back</button>
          <h1 className="font-lexend text-2xl font-extrabold text-on-surface">{selectedSurvey.title} : Results</h1>
          <Badge label={selectedSurvey.status} variant={selectedSurvey.status === 'active' ? 'success' : 'neutral'} />
        </div>
        <p className="text-sm text-on-surface-variant">{responses.length} responses total</p>
        {questions.length === 0 ? <EmptyState message="No questions found." /> : (
          <div className="space-y-6">
            {questions.map(q => {
              const bars = getBarData(q);
              const maxVal = Math.max(...bars.map(([, v]) => v as number), 1);
              return (
                <Card key={q.id}>
                  <p className="font-jakarta font-bold text-on-surface mb-1">{q.question_text}</p>
                  <p className="text-xs text-on-surface-variant mb-4 capitalize">{q.question_type.replace('_', ' ')}</p>
                  {bars.length > 0 ? (
                    <div className="space-y-2">
                      {bars.map(([label, count]) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="text-sm font-jakarta text-on-surface-variant w-24 truncate">{label}</span>
                          <div className="flex-1 bg-surface-low rounded-full h-4 overflow-hidden">
                            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${((count as number) / maxVal) * 100}%` }} />
                          </div>
                          <span className="text-sm font-bold text-on-surface w-6 text-right">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">Text responses: {responses.filter(r => r.question_id === q.id).length}</p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Create survey view
  if (view === 'create') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-on-surface" onClick={() => setView('list')}>← Back</button>
          <h1 className="font-lexend text-2xl font-extrabold text-on-surface">New Survey</h1>
        </div>
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">Title *</label>
              <input
                className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                value={newSurveyForm.title}
                onChange={e => setNewSurveyForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Survey title..."
              />
            </div>
            <div>
              <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">Description</label>
              <textarea
                className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={newSurveyForm.description}
                onChange={e => setNewSurveyForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newSurveyForm.anonymous} onChange={e => setNewSurveyForm(f => ({ ...f, anonymous: e.target.checked }))} />
              <span className="font-jakarta text-sm text-on-surface">Anonymous responses</span>
            </label>
            <Button onClick={createSurvey} disabled={saving || !newSurveyForm.title.trim()}>
              {saving ? 'Creating...' : 'Create Survey →'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Add questions view
  if (view === 'questions' && createdSurvey) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-on-surface" onClick={() => setView('list')}>← Back to List</button>
          <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Add Questions</h1>
          <Badge label={createdSurvey.title} variant="neutral" />
        </div>
        <Card>
          <h3 className="font-jakarta font-bold text-on-surface mb-4">New Question</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Question prompt *</label>
              <input
                className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                value={newQuestion.prompt}
                onChange={e => setNewQuestion(q => ({ ...q, prompt: e.target.value }))}
                placeholder="e.g. How satisfied are you?"
              />
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Type</label>
              <select
                className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={newQuestion.question_type}
                onChange={e => setNewQuestion(q => ({ ...q, question_type: e.target.value }))}
              >
                {QUESTION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            {newQuestion.question_type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Options (comma-separated)</label>
                <input
                  className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                  value={newQuestion.options}
                  onChange={e => setNewQuestion(q => ({ ...q, options: e.target.value }))}
                  placeholder="Option A, Option B, Option C"
                />
              </div>
            )}
            <Button onClick={addQuestion} disabled={!newQuestion.prompt.trim()}>Add Question</Button>
          </div>
        </Card>
        {surveyQuestions.length > 0 && (
          <Card>
            <h3 className="font-jakarta font-bold text-on-surface mb-3">Questions ({surveyQuestions.length})</h3>
            <div className="space-y-2">
              {surveyQuestions.map((q, i) => (
                <div key={q.id} className="flex items-center gap-3 p-3 bg-surface-low rounded-xl">
                  <span className="text-xs font-bold text-on-surface-variant w-5">{i + 1}</span>
                  <div>
                    <p className="font-jakarta font-bold text-on-surface text-sm">{q.question_text}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{q.question_type.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setView('list')}>Done Adding</Button>
          <Button onClick={() => publishSurvey(createdSurvey)} disabled={createdSurvey.status === 'active'}>
            {createdSurvey.status === 'active' ? 'Published' : 'Publish Survey'}
          </Button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Surveys</h1>
        <Button onClick={() => setView('create')} className="flex items-center gap-2">
          <Plus size={16} /> New Survey
        </Button>
      </div>
      {surveys.length === 0 ? <EmptyState message="No surveys yet. Create one!" /> : (
        <div className="space-y-3">
          {surveys.map(s => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-jakarta font-bold text-on-surface">{s.title}</p>
                    <Badge label={s.status} variant={s.status === 'active' ? 'success' : 'neutral'} />
                    {s.is_anonymous && <Badge label="Anonymous" variant="neutral" />}
                  </div>
                  {s.description && <p className="text-sm text-on-surface-variant">{s.description}</p>}
                  <p className="text-xs text-on-surface-variant mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {s.status !== 'active' && (
                    <Button size="sm" onClick={() => publishSurvey(s)}>Publish</Button>
                  )}
                  {s.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => startLivePoll(s)} className="flex items-center gap-1">
                      <Radio size={12} /> Live Poll
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => viewResults(s)} className="flex items-center gap-1">
                    <BarChart2 size={12} /> Results
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
