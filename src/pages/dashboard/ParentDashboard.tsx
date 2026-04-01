import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../components/ui/NotificationPrefsPanel';

type Child = { id: string; full_name: string; room: string | null; teacher_id: string | null; parent_id: string | null; allergies?: string | null };
type Survey = { id: string; title: string; description: string | null; target_roles?: string[] | null; status?: string | null; is_active?: boolean | null };
type SurveyQuestion = { id: string; survey_id: string; prompt: string; question_type: string; options: string[] | null };

export default function ParentDashboard() {
  const { user, institutionId, profile } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [childrenRes, announcementsRes, unlinkedChildrenRes, surveysRes] = await Promise.all([
      supabase.from('ct_children').select('*').eq('parent_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_announcements').select('id, title, audience, created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(10),
      supabase.from('ct_children').select('*').eq('institution_id', institutionId).is('parent_id', null).order('created_at', { ascending: false }).limit(10),
      supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).or('status.eq.published,is_active.eq.true').order('created_at', { ascending: false }),
    ]);
    const children = childrenRes.data ?? [];
    const childIds = children.map((child: any) => child.id);
    const surveys = (surveysRes.data ?? []).filter((survey: Survey) => !survey.target_roles || survey.target_roles.includes('parent') || survey.target_roles.includes('all'));
    const surveyIds = surveys.map((survey: Survey) => survey.id);
    const [reportsRes, parentUpdatesRes, questionsRes, eventsRes] = await Promise.all([
      childIds.length ? supabase.from('ct_daily_reports').select('*').in('child_id', childIds).order('report_date', { ascending: false }).limit(20) : Promise.resolve({ data: [] as any[] }),
      childIds.length ? supabase.from('ct_parent_updates').select('*').eq('institution_id', institutionId).in('child_id', childIds).order('created_at', { ascending: false }).limit(20) : Promise.resolve({ data: [] as any[] }),
      surveyIds.length ? supabase.from('ct_survey_questions').select('*').in('survey_id', surveyIds).order('position') : Promise.resolve({ data: [] as any[] }),
      supabase.from('ct_events').select('id,title,event_date,location').eq('institution_id', institutionId).gte('event_date', new Date().toISOString()).order('event_date').limit(10),
    ]);
    return {
      children,
      reports: reportsRes.data ?? [],
      announcements: announcementsRes.data ?? [],
      unlinkedChildren: unlinkedChildrenRes.data ?? [],
      parentUpdates: parentUpdatesRes.data ?? [],
      surveys,
      questions: questionsRes.data ?? [],
      events: eventsRes.data ?? [],
    };
  }, { children: [], reports: [], announcements: [], unlinkedChildren: [], parentUpdates: [], surveys: [], questions: [], events: [] } as any, { requireInstitution: true });

  const [childName, setChildName] = useState('');
  const [room, setRoom] = useState('');
  const [selectedClaimChildId, setSelectedClaimChildId] = useState('');
  const [parentNoteChildId, setParentNoteChildId] = useState('');
  const [parentNoteType, setParentNoteType] = useState('follow_up');
  const [parentNote, setParentNote] = useState('');
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [responseValues, setResponseValues] = useState<Record<string, any>>({});
  const [flash, setFlash] = useState('');

  const selectedSurvey = useMemo(() => data.surveys.find((survey: Survey) => survey.id === selectedSurveyId) || data.surveys[0] || null, [data.surveys, selectedSurveyId]);
  const selectedSurveyQuestions = useMemo(() => data.questions.filter((question: SurveyQuestion) => question.survey_id === selectedSurvey?.id), [data.questions, selectedSurvey]);

  const addChild = async () => {
    if (!user?.id || !institutionId || !childName.trim()) return;
    const { data: child } = await supabase.from('ct_children').insert({ institution_id: institutionId, parent_id: user.id, full_name: childName.trim(), room: room.trim() || null }).select('*').single();
    if (child) setData((current: any) => ({ ...current, children: [child, ...current.children] }));
    setChildName(''); setRoom('');
  };

  const claimChild = async () => {
    if (!user?.id || !selectedClaimChildId) return;
    const { data: child } = await supabase.from('ct_children').update({ parent_id: user.id }).eq('id', selectedClaimChildId).is('parent_id', null).select('*').single();
    if (child) setData((current: any) => ({ ...current, children: [child, ...current.children], unlinkedChildren: current.unlinkedChildren.filter((entry: Child) => entry.id !== child.id) }));
    setSelectedClaimChildId('');
  };

  const addParentUpdate = async () => {
    if (!institutionId || !parentNoteChildId || !parentNote.trim() || !user?.id) return;
    const { data: update } = await supabase.from('ct_parent_updates').insert({ institution_id: institutionId, child_id: parentNoteChildId, author_id: user.id, audience: 'teacher', note_type: parentNoteType, note: parentNote.trim() }).select('*').single();
    if (update) {
      setData((current: any) => ({ ...current, parentUpdates: [update, ...current.parentUpdates] }));
      // Notify the teacher via in-app notification
      const child = data.children.find((c: any) => c.id === parentNoteChildId);
      if (child?.teacher_id) {
        await supabase.from('ct_notifications').insert({
          user_id: child.teacher_id,
          type: 'parent_message',
          title: 'Message from Parent',
          body: `Parent note about ${child.full_name}: ${parentNote.trim().substring(0, 100)}${parentNote.length > 100 ? '...' : ''}`,
          institution_id: institutionId,
        });
      }
    }
    setParentNote('');
  };

  const submitSurveyResponse = async () => {
    if (!user?.id || !selectedSurvey) return;
    const answers: Record<string, any> = {};
    selectedSurveyQuestions.forEach((question: SurveyQuestion) => {
      answers[question.id] = responseValues[question.id] ?? null;
    });
    await supabase.from('ct_survey_responses').upsert({ survey_id: selectedSurvey.id, user_id: user.id, answers }, { onConflict: 'survey_id,user_id' });
    setFlash('Survey submitted.');
  };

  const renderQuestionInput = (question: SurveyQuestion) => {
    const options = question.options || [];
    if (question.question_type === 'text') return <textarea value={responseValues[question.id] || ''} onChange={(e) => setResponseValues((current) => ({ ...current, [question.id]: e.target.value }))} rows={3} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" />;
    if (question.question_type === 'single_choice' || question.question_type === 'yes_no') return <select value={responseValues[question.id] || ''} onChange={(e) => setResponseValues((current) => ({ ...current, [question.id]: e.target.value }))} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm"><option value="">Select</option>{(question.question_type === 'yes_no' ? ['Yes', 'No'] : options).map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    if (question.question_type === 'multi_choice') return <div className="space-y-2">{options.map((option) => { const current = Array.isArray(responseValues[question.id]) ? responseValues[question.id] : []; return <label key={option} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={current.includes(option)} onChange={(e) => setResponseValues((existing) => ({ ...existing, [question.id]: e.target.checked ? [...current, option] : current.filter((entry: string) => entry !== option) }))} /> {option}</label>; })}</div>;
    return <input type="range" min="1" max="5" value={responseValues[question.id] || 3} onChange={(e) => setResponseValues((current) => ({ ...current, [question.id]: Number(e.target.value) }))} className="w-full" />;
  };

  
// Hash-based scroll navigation (driven by DashboardLayout sidebar)
React.useEffect(() => {
  const scrollToHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  // Small delay to let content render first
  const t = setTimeout(scrollToHash, 150);
  window.addEventListener('hashchange', scrollToHash);
  return () => { clearTimeout(t); window.removeEventListener('hashchange', scrollToHash); };
}, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Parent Workspace</h1>
          <p className="mt-2 text-white/80">Link children, read richer daily reports, keep a parent-teacher note trail, and answer published surveys.</p>
        </div>

        {flash && <div className="rounded-[1rem] bg-primary/10 p-3 text-sm text-primary">{flash}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create or link child</h2>
            <div className="space-y-3">
              <Input label="Child full name" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Emma Lawson" />
              <Input label="Room / class" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Sunshine Room" />
              <Button onClick={addChild} className="w-full rounded-full">Add child</Button>
              <label className="block text-sm font-jakarta font-700 text-on-surface">Or claim existing invited child</label>
              <select value={selectedClaimChildId} onChange={(e) => setSelectedClaimChildId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface">
                <option value="">Select unlinked child</option>
                {data.unlinkedChildren.map((child: Child) => <option key={child.id} value={child.id}>{child.full_name}{child.room ? ` · ${child.room}` : ''}</option>)}
              </select>
              <Button variant="outline" onClick={claimChild} className="w-full rounded-full" disabled={!selectedClaimChildId}>Claim child link</Button>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Children</h2>
            {data.children.length === 0 ? <p className="text-sm text-on-surface-variant">No linked children yet. Add a child or claim an invited child link.</p> : data.children.map((child: Child) => <div key={child.id} className="mb-3 rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{child.full_name}</p><Badge label={child.room || 'unassigned room'} variant="secondary" /></div><p className="mt-1 text-sm text-on-surface-variant">Teacher assigned: {child.teacher_id ? 'Yes' : 'Not yet'}{child.allergies ? ` · Allergies: ${child.allergies}` : ''}</p></div>)}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Richer daily reports</h2>
            {data.reports.length === 0 ? <p className="text-sm text-on-surface-variant">No daily reports yet. Once teachers publish reports, they will appear here.</p> : data.reports.map((report: any) => <div key={report.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{report.report_date}</p><p className="text-sm text-on-surface-variant">Mood: {report.mood || '-'} · Nap: {report.nap_duration_minutes || 0} min</p><p className="text-sm text-on-surface-variant">Meals: {report.meals?.summary || report.meals?.lunch || 'No meal summary'}</p><p className="mt-1 text-sm text-on-surface-variant">Activities: {(report.activities || []).join(', ') || 'None listed'}</p><p className="mt-1 text-sm text-on-surface-variant">{report.teacher_note || 'No teacher note'}</p></div>)}
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Parent-teacher update trail</h2>
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-jakarta font-700 text-on-surface">Child</label>
              <select value={parentNoteChildId} onChange={(e) => setParentNoteChildId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                <option value="">Select child</option>
                {data.children.map((child: Child) => <option key={child.id} value={child.id}>{child.full_name}</option>)}
              </select>
              <label className="block text-sm font-jakarta font-700 text-on-surface">Note type</label>
              <select value={parentNoteType} onChange={(e) => setParentNoteType(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                {['follow_up', 'pickup', 'health', 'learning', 'behaviour', 'update'].map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
              </select>
              <textarea value={parentNote} onChange={(e) => setParentNote(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" placeholder="Share pickup changes, health notes, or a follow-up for the teacher." />
              <Button onClick={addParentUpdate} className="w-full rounded-full">Send note to teacher</Button>
            </div>
            {data.parentUpdates.length === 0 ? <p className="text-sm text-on-surface-variant">No notes yet.</p> : data.parentUpdates.map((entry: any) => <div key={entry.id} className="mb-3 rounded-[1rem] bg-surface p-4"><div className="flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{entry.note_type.replace('_', ' ')}</p><Badge label={entry.audience} variant="tertiary" /></div><p className="mt-2 text-sm text-on-surface-variant">{entry.note}</p></div>)}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Parent surveys</h2>
            {data.surveys.length === 0 ? <p className="text-sm text-on-surface-variant">No published parent surveys yet.</p> : <div className="space-y-3">{data.surveys.map((survey: Survey) => <button key={survey.id} onClick={() => setSelectedSurveyId(survey.id)} className="block w-full rounded-[1rem] bg-surface p-4 text-left"><div className="flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{survey.title}</p><Badge label={survey.status || (survey.is_active ? 'active' : 'draft')} variant="primary" /></div><p className="text-sm text-on-surface-variant">{survey.description || 'No description'}</p></button>)}</div>}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Survey submit</h2>
            {!selectedSurvey ? <p className="text-sm text-on-surface-variant">Select a survey on the left.</p> : <div className="space-y-4"><div><p className="font-jakarta font-700 text-on-surface">{selectedSurvey.title}</p><p className="text-sm text-on-surface-variant">{selectedSurvey.description || 'No description'}</p></div>{selectedSurveyQuestions.map((question: SurveyQuestion) => <div key={question.id} className="rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{question.prompt}</p><div className="mt-3">{renderQuestionInput(question)}</div></div>)}<Button onClick={submitSurveyResponse} className="rounded-full">Submit survey</Button></div>}
          </Card>
        </div>
        {/* Settings: Profile Photo + Notification Prefs */}
        <div id="settings" className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Profile Photo</h2>
            {user?.id && <ProfilePhotoUpload userId={user.id} currentUrl={profile?.avatar_url as string | null} displayName={profile?.full_name || user.email} />}
          </Card>
          <Card>
            {user?.id && <NotificationPrefsPanel userId={user.id} institutionId={institutionId} role="parent" />}
          </Card>
        </div>
        {/* Upcoming Events */}
        <Card className="mt-6">
          <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Upcoming Campus Events</h2>
          {(data.events || []).length === 0 ? (
            <p className="text-sm text-on-surface-variant">No upcoming events at your institution.</p>
          ) : (data.events as any[]).map((event) => (
            <div key={event.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between">
              <div>
                <p className="font-jakarta font-700 text-on-surface">{event.title}</p>
                <p className="text-sm text-on-surface-variant">{event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBD'}{event.location ? ` · ${event.location}` : ''}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </DashboardLayout>
  );
}
