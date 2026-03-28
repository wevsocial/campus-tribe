import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

export default function TeacherDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [classesRes, assignmentsRes, surveysRes, announcementsRes] = await Promise.all([
      supabase.from('ct_classes').select('id, section, room, schedule, course_id, ct_courses(code, name)').eq('teacher_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_assignments').select('*').eq('teacher_id', userId).order('created_at', { ascending: false }),
      supabase.from('ct_surveys').select('*').eq('created_by', userId).order('created_at', { ascending: false }),
      supabase.from('ct_announcements').select('*').eq('author_id', userId).order('created_at', { ascending: false }),
    ]);
    return { classes: classesRes.data ?? [], assignments: assignmentsRes.data ?? [], surveys: surveysRes.data ?? [], announcements: announcementsRes.data ?? [] };
  }, { classes: [], assignments: [], surveys: [], announcements: [] } as any);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [surveyTitle, setSurveyTitle] = useState('');

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

  const createSurvey = async () => {
    if (!user?.id || !institutionId || !surveyTitle.trim()) return;
    const { data: survey } = await supabase.from('ct_surveys').insert({ institution_id: institutionId, created_by: user.id, title: surveyTitle.trim(), questions: [{ type: 'text', label: 'How are you doing?' }], is_active: true }).select('*').single();
    if (survey) setData((current: any) => ({ ...current, surveys: [survey, ...current.surveys] }));
    setSurveyTitle('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Teacher / Faculty Workspace</h1>
          <p className="mt-2 text-white/80">Create classes, publish assignments, and run surveys using live institutional data.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Classes" value={data.classes.length} color="primary" />
          <StatCard label="Assignments" value={data.assignments.length} color="secondary" />
          <StatCard label="Surveys" value={data.surveys.length} color="tertiary" />
          <StatCard label="Announcements" value={data.announcements.length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create first class</h2>
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
              {!data.classes[0] && <p className="text-xs text-on-surface-variant">Create a class first.</p>}
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create survey / poll</h2>
            <div className="space-y-3">
              <Input label="Survey title" value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} placeholder="Week 1 pulse check" />
              <Button onClick={createSurvey} className="w-full rounded-full">Create survey</Button>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Classes</h2>
            {data.classes.length === 0 ? <p className="text-sm text-on-surface-variant">No classes yet. Create your first class shell to begin managing students.</p> : data.classes.map((klass: any) => <div key={klass.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{klass.ct_courses?.code} · {klass.ct_courses?.name}</p><p className="text-sm text-on-surface-variant">Section {klass.section || 'A'}</p></div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Assignments</h2>
            {data.assignments.length === 0 ? <p className="text-sm text-on-surface-variant">No assignments yet. Publish your first assignment after creating a class.</p> : data.assignments.map((assignment: any) => <div key={assignment.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{assignment.title}</p><Badge label={assignment.is_published ? 'published' : 'draft'} variant="secondary" /></div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Surveys</h2>
            {data.surveys.length === 0 ? <p className="text-sm text-on-surface-variant">No surveys yet. Create a quick poll to collect student feedback.</p> : data.surveys.map((survey: any) => <div key={survey.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between"><p className="font-jakarta font-700 text-on-surface">{survey.title}</p><Badge label={survey.is_active ? 'active' : 'closed'} variant="tertiary" /></div>)}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
