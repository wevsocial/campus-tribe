import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

export default function StaffDashboard() {
  const { user, institutionId, profile } = useAuth();
  const isPreschool = (profile?.institution_type || profile?.platform_type) === 'preschool';
  const [childId, setChildId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState('4');
  const [activities, setActivities] = useState('Outdoor play, storytime');
  const [teacherNote, setTeacherNote] = useState('');
  const [mealNote, setMealNote] = useState('Lunch finished well');

  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [childrenRes, reportsRes, classesRes, announcementsRes] = await Promise.all([
      supabase.from('ct_children').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_daily_reports').select('*, ct_children(full_name)').eq('teacher_id', userId).order('report_date', { ascending: false }).limit(20),
      supabase.from('ct_classes').select('id, section, room, schedule, ct_courses(code, name)').eq('teacher_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_announcements').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(10),
    ]);
    return {
      children: childrenRes.data ?? [],
      reports: reportsRes.data ?? [],
      classes: classesRes.data ?? [],
      announcements: announcementsRes.data ?? [],
    };
  }, { children: [], reports: [], classes: [], announcements: [] } as any);

  const childOptions = useMemo(() => data.children, [data.children]);

  const createDailyReport = async () => {
    if (!user?.id || !childId || !reportDate) return;
    const payload = {
      child_id: childId,
      teacher_id: user.id,
      report_date: reportDate,
      mood: Number(mood),
      meals: { summary: mealNote },
      activities: activities.split(',').map((entry) => entry.trim()).filter(Boolean),
      teacher_note: teacherNote || null,
    };
    const { data: report } = await supabase.from('ct_daily_reports').insert(payload).select('*, ct_children(full_name)').single();
    if (report) setData((current: any) => ({ ...current, reports: [report, ...current.reports] }));
    setTeacherNote('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">{isPreschool ? 'Preschool Staff Workspace' : 'Staff Workspace'}</h1>
          <p className="mt-2 text-white/80">{isPreschool ? 'Publish daily child reports, monitor classroom activity, and keep parents informed with real records.' : 'Manage classes, announcements, and student operations with institution-backed data.'}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Children" value={data.children.length} color="primary" />
          <StatCard label="Daily reports" value={data.reports.length} color="secondary" />
          <StatCard label="Classes" value={data.classes.length} color="tertiary" />
          <StatCard label="Announcements" value={data.announcements.length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Card>
            <h2 className="font-lexend text-lg font-800 text-on-surface">Create daily report</h2>
            <div className="mt-4 space-y-3">
              <label className="text-sm font-jakarta font-700 text-on-surface">Child</label>
              <select value={childId} onChange={(e) => setChildId(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select child</option>
                {childOptions.map((child: any) => <option key={child.id} value={child.id}>{child.full_name}</option>)}
              </select>
              <Input label="Report date" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
              <label className="text-sm font-jakarta font-700 text-on-surface">Mood</label>
              <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="1">1 · Very low</option>
                <option value="2">2 · Low</option>
                <option value="3">3 · Okay</option>
                <option value="4">4 · Good</option>
                <option value="5">5 · Excellent</option>
              </select>
              <Input label="Activities" value={activities} onChange={(e) => setActivities(e.target.value)} placeholder="Outdoor play, painting, nap time" />
              <Input label="Meal summary" value={mealNote} onChange={(e) => setMealNote(e.target.value)} placeholder="Snack and lunch notes" />
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Teacher note</label>
                <textarea value={teacherNote} onChange={(e) => setTeacherNote(e.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Share notable moments, milestones, or follow-up needs." />
              </div>
              <Button onClick={createDailyReport} className="w-full rounded-full">Publish report</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Recent daily reports</h2>
            {data.reports.length === 0 ? <p className="text-sm text-on-surface-variant">No reports yet. Create the first daily report to start the parent communication trail.</p> : data.reports.map((report: any) => (
              <div key={report.id} className="mb-3 rounded-[1rem] bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-jakarta font-700 text-on-surface">{report.ct_children?.full_name || 'Child report'}</p>
                  <Badge label={`Mood ${report.mood || '—'}`} variant="secondary" />
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">{report.report_date} · {(report.activities || []).join(', ') || 'No activities listed'}</p>
                <p className="mt-2 text-sm text-on-surface-variant">{report.teacher_note || 'No teacher note yet.'}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
