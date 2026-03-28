import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

export default function ParentDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [childrenRes, reportsRes, announcementsRes] = await Promise.all([
      supabase.from('ct_children').select('*').eq('parent_id', userId).eq('institution_id', institutionId),
      supabase.from('ct_daily_reports').select('*').order('report_date', { ascending: false }).limit(10),
      supabase.from('ct_announcements').select('id, title, audience, created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(10),
    ]);
    const children = childrenRes.data ?? [];
    const childIds = new Set(children.map((child: any) => child.id));
    return { children, reports: (reportsRes.data ?? []).filter((report: any) => childIds.has(report.child_id)), announcements: announcementsRes.data ?? [] };
  }, { children: [], reports: [], announcements: [] } as any);

  const [childName, setChildName] = useState('');
  const [room, setRoom] = useState('');

  const addChild = async () => {
    if (!user?.id || !institutionId || !childName.trim()) return;
    const { data: child } = await supabase.from('ct_children').insert({ institution_id: institutionId, parent_id: user.id, full_name: childName.trim(), room: room.trim() || null }).select('*').single();
    if (child) setData((current: any) => ({ ...current, children: [child, ...current.children] }));
    setChildName(''); setRoom('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Parent Workspace</h1>
          <p className="mt-2 text-white/80">Link a child, view daily reports, and stay updated with school or preschool announcements.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Link child</h2>
            <div className="space-y-3">
              <Input label="Child full name" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Emma Lawson" />
              <Input label="Room / class" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Sunshine Room" />
              <Button onClick={addChild} className="w-full rounded-full">Add child</Button>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Children</h2>
            {data.children.length === 0 ? <p className="text-sm text-on-surface-variant">No linked children yet. Add a child or wait for your institution to invite/link one for you.</p> : data.children.map((child: any) => <div key={child.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{child.full_name}</p><p className="text-sm text-on-surface-variant">Room: {child.room || 'Not assigned'}</p></div>)}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Daily Reports</h2>
            {data.reports.length === 0 ? <p className="text-sm text-on-surface-variant">No daily reports yet. Once teachers publish reports, they will appear here.</p> : data.reports.map((report: any) => <div key={report.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{report.report_date}</p><p className="text-sm text-on-surface-variant">Mood: {report.mood || '—'} · Nap: {report.nap_duration_minutes || 0} min</p><p className="mt-1 text-sm text-on-surface-variant">{report.teacher_note || 'No teacher note'}</p></div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Announcements</h2>
            {data.announcements.length === 0 ? <p className="text-sm text-on-surface-variant">No announcements yet.</p> : data.announcements.map((announcement: any) => <div key={announcement.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{announcement.title}</p><p className="text-sm text-on-surface-variant">Audience: {announcement.audience || 'All'} </p></div>)}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
