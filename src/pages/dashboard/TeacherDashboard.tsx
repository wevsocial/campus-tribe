import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

type SurveyQuestion = { id?: string; survey_id?: string; prompt: string; question_type: string; options?: string[] | null; required?: boolean; position: number };
type Survey = { id: string; title: string; description: string | null; status?: string | null; is_active?: boolean | null; created_by?: string | null; target_roles?: string[] | null; anonymous?: boolean | null; is_anonymous?: boolean | null; created_at: string };
type SurveyResponse = { id: string; survey_id: string; user_id: string | null; answers: Record<string, any>; submitted_at: string };

const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'single_choice', label: 'Single choice' },
  { value: 'multi_choice', label: 'Multi choice' },
  { value: 'rating', label: 'Rating' },
  { value: 'yes_no', label: 'Yes / No' },
];

function normalizeQuestion(row: any): SurveyQuestion {
  return {
    id: row.id,
    survey_id: row.survey_id,
    prompt: row.prompt,
    question_type: row.question_type,
    options: Array.isArray(row.options) ? row.options : Array.isArray(row.options || []) ? row.options : ((row.options && Array.isArray(row.options)) ? row.options : []),
    required: row.required,
    position: row.position ?? 0,
  };
}

export default function TeacherDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [classesRes, assignmentsRes, surveysRes, announcementsRes, publishedRes] = await Promise.all([
      supabase.from('ct_classes').select('id, section, room, schedule, course_id, ct_courses(code, name)').eq('teacher_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_assignments').select('*').eq('teacher_id', userId).order('created_at', { ascending: false }),
      supabase.from('ct_surveys').select('*').eq('created_by', userId).order('created_at', { ascending: false }),
      supabase.from('ct_announcements').select('*').eq('author_id', userId).order('created_at', { ascending: false }),
      supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).or('status.eq.published,is_active.eq.true').order('created_at', { ascending: false }),
    ]);
    const surveys = surveysRes.data ?? [];
    const publishedSurveys = publishedRes.data ?? [];
    const relevantSurveyIds = Array.from(new Set([...surveys, ...publishedSurveys].map((survey: Survey) => survey.id)));
    const [questionsRes, responsesRes] = relevantSurveyIds.length
      ? await Promise.all([
          supabase.from('ct_survey_questions').select('*').in('survey_id', relevantSurveyIds).order('position'),
          supabase.from('ct_survey_responses').select('*').in('survey_id', relevantSurveyIds).order('submitted_at', { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }];
    return {
      classes: classesRes.data ?? [],
      assignments: assignmentsRes.data ?? [],
      surveys,
      announcements: announcementsRes.data ?? [],
      questions: (questionsRes.data ?? []).map(normalizeQuestion),
      responses: responsesRes.data ?? [],
      publishedSurveys,
    };
  }, { classes: [], assignments: [], surveys: [], announcements: [], questions: [], responses: [], publishedSurveys: [] } as any);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [surveyTargetRole, setSurveyTargetRole] = useState('student');
  const [builderQuestions, setBuilderQuestions] = useState<SurveyQuestion[]>([{ prompt: 'How are you doing this week?', question_type: 'text', options: [], required: true, position: 0 }]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [responseValues, setResponseValues] = useState<Record<string, any>>({});
  const [flash, setFlash] = useState('');

  const selectedSurvey = useMemo(() => data.publishedSurveys.find((survey: Survey) => survey.id === selectedSurveyId) || data.surveys[0] || null, [data.publishedSurveys, data.surveys, selectedSurveyId]);
  const selectedQuestions = useMemo(() => data.questions.filter((question: SurveyQuestion) => question.survey_id === selectedSurvey?.id).sort((a: SurveyQuestion, b: SurveyQuestion) => a.position - b.position), [data.questions, selectedSurvey]);
  const selectedResponses = useMemo(() => data.responses.filter((response: SurveyResponse) => response.survey_id === selectedSurvey?.id), [data.responses, selectedSurvey]);

  const createClass = async () => {
    if (!user?.id || !institutionId || !courseCode.trim() || !courseName.trim()) return;
    const { data: course } = await supabase.from('ct_courses').insert({ institution_id: institutionId, code: courseCode.trim(), name: courseName.trim() }).select('*').single();
    if (!course) return;
    const { data: klass } = await supabase.from('ct_classes').insert({ institution_id: institutionId, teacher_id: user.id, course_id: course.id, section: 'A' }).select('id, section, room, schedule, course_id, ct_courses(code, name)').single();
    if (klass) setData((current: any) => ({ ...current, classes: [klass, ...current.classes] }));
    setCourseCode(''); setCourseName('');
  };

  const createAssignment = async () => {
    if (!user?.id || !data.classes[0]?.id || !assignmentTitle.trim()) return;
    const { data: assignment } = await supabase.from('ct_assignments').insert({ teacher_id: user.id, class_id: data.classes[0].id, title: assignmentTitle.trim(), is_published: true }).select('*').single();
    if (assignment) setData((current: any) => ({ ...current, assignments: [assignment, ...current.assignments] }));
    setAssignmentTitle('');
  };

  const updateBuilderQuestion = (index: number, patch: Partial<SurveyQuestion>) => {
    setBuilderQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question));
  };

  const addBuilderQuestion = () => {
    setBuilderQuestions((current) => [...current, { prompt: '', question_type: 'text', options: [], required: false, position: current.length }]);
  };

  const saveSurvey = async (publish = false) => {
    if (!user?.id || !institutionId || !surveyTitle.trim() || builderQuestions.length === 0) return;
    const { data: survey } = await supabase.from('ct_surveys').insert({ institution_id: institutionId, created_by: user.id, title: surveyTitle.trim(), description: surveyDescription || null, target_roles: [surveyTargetRole], status: publish ? 'published' : 'draft', is_active: publish, anonymous: false }).select('*').single();
    if (!survey) return;

    const questionPayload = builderQuestions.map((question, index) => ({
      survey_id: survey.id,
      prompt: question.prompt,
      question_type: question.question_type,
      options: question.question_type === 'single_choice' || question.question_type === 'multi_choice' ? (question.options || []) : [],
      position: index,
      required: question.required ?? false,
    }));

    const { data: savedQuestions } = await supabase.from('ct_survey_questions').insert(questionPayload).select('*');
    setData((current: any) => ({ ...current, surveys: [survey, ...current.surveys], publishedSurveys: publish ? [survey, ...current.publishedSurveys] : current.publishedSurveys, questions: [...current.questions, ...((savedQuestions ?? []).map(normalizeQuestion))] }));
    setSurveyTitle(''); setSurveyDescription(''); setBuilderQuestions([{ prompt: 'How are you doing this week?', question_type: 'text', options: [], required: true, position: 0 }]); setSelectedSurveyId(survey.id); setFlash(publish ? 'Survey published.' : 'Survey draft saved.');
  };

  const submitSurveyResponse = async () => {
    if (!user?.id || !selectedSurvey?.id) return;
    const answers: Record<string, any> = {};
    selectedQuestions.forEach((question: SurveyQuestion) => {
      answers[question.id || question.prompt] = responseValues[question.id || question.prompt] ?? null;
    });
    const { data: response } = await supabase.from('ct_survey_responses').upsert({ survey_id: selectedSurvey.id, user_id: user.id, answers }, { onConflict: 'survey_id,user_id' }).select('*').single();
    if (response) {
      setData((current: any) => ({ ...current, responses: [response, ...current.responses.filter((entry: SurveyResponse) => !(entry.survey_id === response.survey_id && entry.user_id === response.user_id))] }));
      setFlash('Survey response submitted.');
    }
  };

  const renderQuestionInput = (question: SurveyQuestion) => {
    const key = question.id || question.prompt;
    const options = question.options || [];
    if (question.question_type === 'text') {
      return <textarea value={responseValues[key] || ''} onChange={(e) => setResponseValues((current) => ({ ...current, [key]: e.target.value }))} rows={3} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" />;
    }
    if (question.question_type === 'single_choice' || question.question_type === 'yes_no') {
      const values = question.question_type === 'yes_no' ? ['Yes', 'No'] : options;
      return <select value={responseValues[key] || ''} onChange={(e) => setResponseValues((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm"><option value="">Select</option>{values.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    }
    if (question.question_type === 'multi_choice') {
      return <div className="space-y-2">{options.map((option) => { const current = Array.isArray(responseValues[key]) ? responseValues[key] : []; return <label key={option} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={current.includes(option)} onChange={(e) => setResponseValues((existing) => ({ ...existing, [key]: e.target.checked ? [...current, option] : current.filter((entry: string) => entry !== option) }))} /> {option}</label>; })}</div>;
    }
    return <input type="range" min="1" max="5" value={responseValues[key] || 3} onChange={(e) => setResponseValues((current) => ({ ...current, [key]: Number(e.target.value) }))} className="w-full" />;
  };

  const resultsSummary = useMemo(() => {
    const summary: Record<string, Record<string, number>> = {};
    selectedQuestions.forEach((question: SurveyQuestion) => {
      summary[question.id || question.prompt] = {};
    });
    selectedResponses.forEach((response: SurveyResponse) => {
      selectedQuestions.forEach((question: SurveyQuestion) => {
        const key = question.id || question.prompt;
        const answer = response.answers?.[key];
        if (Array.isArray(answer)) {
          answer.forEach((entry) => { summary[key][entry] = (summary[key][entry] || 0) + 1; });
        } else if (answer != null && answer !== '') {
          summary[key][String(answer)] = (summary[key][String(answer)] || 0) + 1;
        }
      });
    });
    return summary;
  }, [selectedQuestions, selectedResponses]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Teacher / Faculty Workspace</h1>
          <p className="mt-2 text-white/80">Create classes, publish assignments, build real surveys with typed questions, collect responses, and review results.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Classes" value={data.classes.length} color="primary" />
          <StatCard label="Assignments" value={data.assignments.length} color="secondary" />
          <StatCard label="Surveys" value={data.surveys.length} color="tertiary" />
          <StatCard label="Responses" value={data.responses.length} color="primary" />
        </div>

        {flash && <div className="rounded-[1rem] bg-primary/10 p-3 text-sm text-primary">{flash}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create class</h2>
            <div className="space-y-3">
              <Input label="Course code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="CS101" />
              <Input label="Course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Intro to Computing" />
              <Button onClick={createClass} className="w-full rounded-full">Create class</Button>
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create assignment</h2>
            <div className="space-y-3">
              <Input label="Assignment title" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} placeholder="Week 1 reflection" />
              <Button onClick={createAssignment} className="w-full rounded-full" disabled={!data.classes[0]}>Publish assignment</Button>
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Survey meta</h2>
            <div className="space-y-3">
              <Input label="Survey title" value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} placeholder="Week 1 pulse check" />
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Description</label>
                <textarea value={surveyDescription} onChange={(e) => setSurveyDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="What this survey is measuring" />
              </div>
              <label className="block text-sm font-jakarta font-700 text-on-surface">Target role</label>
              <select value={surveyTargetRole} onChange={(e) => setSurveyTargetRole(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                {['student', 'parent', 'teacher', 'all'].map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-lexend text-lg font-800 text-on-surface">Survey builder</h2>
              <Button variant="outline" size="sm" className="rounded-full" onClick={addBuilderQuestion}>Add question</Button>
            </div>
            <div className="space-y-4">
              {builderQuestions.map((question, index) => (
                <div key={index} className="rounded-[1rem] bg-surface p-4 space-y-3">
                  <Input label={`Question ${index + 1}`} value={question.prompt} onChange={(e) => updateBuilderQuestion(index, { prompt: e.target.value })} placeholder="Ask something useful" />
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Type</label>
                      <select value={question.question_type} onChange={(e) => updateBuilderQuestion(index, { question_type: e.target.value, options: e.target.value === 'single_choice' || e.target.value === 'multi_choice' ? ['Option 1', 'Option 2'] : [] })} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                        {QUESTION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-jakarta font-700 text-on-surface mt-8">
                      <input type="checkbox" checked={question.required ?? false} onChange={(e) => updateBuilderQuestion(index, { required: e.target.checked })} /> Required
                    </label>
                  </div>
                  {(question.question_type === 'single_choice' || question.question_type === 'multi_choice') && (
                    <Input label="Choices (comma separated)" value={(question.options || []).join(', ')} onChange={(e) => updateBuilderQuestion(index, { options: e.target.value.split(',').map((entry) => entry.trim()).filter(Boolean) })} placeholder="Yes, No, Maybe" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => saveSurvey(false)} className="rounded-full">Save draft</Button>
              <Button variant="secondary" onClick={() => saveSurvey(true)} className="rounded-full">Publish survey</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Classes, assignments, surveys</h2>
            <div className="space-y-3">
              {data.classes.map((klass: any) => <div key={klass.id} className="rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{klass.ct_courses?.code} · {klass.ct_courses?.name}</p><p className="text-sm text-on-surface-variant">Section {klass.section || 'A'}</p></div>)}
              {data.assignments.map((assignment: any) => <div key={assignment.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{assignment.title}</p><Badge label={assignment.is_published ? 'published' : 'draft'} variant="secondary" /></div>)}
              {data.surveys.map((survey: Survey) => <button key={survey.id} onClick={() => setSelectedSurveyId(survey.id)} className="block w-full rounded-[1rem] bg-surface p-4 text-left"><div className="flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{survey.title}</p><Badge label={survey.status || (survey.is_active ? 'active' : 'draft')} variant="tertiary" /></div><p className="mt-1 text-sm text-on-surface-variant">{survey.description || 'No description'}</p></button>)}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-lexend text-lg font-800 text-on-surface">Respondent submit flow</h2>
              <select value={selectedSurvey?.id || ''} onChange={(e) => setSelectedSurveyId(e.target.value)} className="rounded-xl border border-outline-variant bg-surface-lowest px-3 py-2 text-sm">
                {(data.publishedSurveys.length ? data.publishedSurveys : data.surveys).map((survey: Survey) => <option key={survey.id} value={survey.id}>{survey.title}</option>)}
              </select>
            </div>
            {!selectedSurvey ? <p className="text-sm text-on-surface-variant">Create or publish a survey first.</p> : (
              <div className="space-y-4">
                <div>
                  <p className="font-jakarta font-700 text-on-surface">{selectedSurvey.title}</p>
                  <p className="text-sm text-on-surface-variant">{selectedSurvey.description || 'No description'}</p>
                </div>
                {selectedQuestions.map((question: SurveyQuestion, index: number) => (
                  <div key={question.id || index} className="rounded-[1rem] bg-surface p-4">
                    <p className="font-jakarta font-700 text-on-surface">{index + 1}. {question.prompt}</p>
                    <div className="mt-3">{renderQuestionInput(question)}</div>
                  </div>
                ))}
                <Button onClick={submitSurveyResponse} className="rounded-full">Submit response</Button>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Creator results view</h2>
            {!selectedSurvey ? <p className="text-sm text-on-surface-variant">Select a survey to review results.</p> : (
              <div className="space-y-4">
                <div className="rounded-[1rem] bg-surface p-4 flex items-center justify-between"><div><p className="font-jakarta font-700 text-on-surface">{selectedSurvey.title}</p><p className="text-sm text-on-surface-variant">Responses: {selectedResponses.length}</p></div><Badge label={selectedSurvey.status || 'draft'} variant="primary" /></div>
                {selectedQuestions.map((question: SurveyQuestion, index: number) => {
                  const key = question.id || question.prompt;
                  const summary = resultsSummary[key] || {};
                  return (
                    <div key={key} className="rounded-[1rem] bg-surface p-4">
                      <p className="font-jakarta font-700 text-on-surface">{index + 1}. {question.prompt}</p>
                      <div className="mt-2 space-y-2">
                        {Object.keys(summary).length === 0 ? <p className="text-sm text-on-surface-variant">No answers yet.</p> : Object.entries(summary).map(([answer, count]) => <div key={answer} className="flex items-center justify-between text-sm"><span className="text-on-surface-variant">{answer}</span><Badge label={String(count)} variant="secondary" /></div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
