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

export default function AdminDashboard() {
  const { user, institutionId } = useAuth();
  const { data, setData } = useDashboardData(async ({ institutionId, userId }) => {
    const [institutionRes, membersRes, clubsRes, announcementsRes] = await Promise.all([
      supabase.from('ct_institutions').select('*').eq('id', institutionId).maybeSingle(),
      supabase.from('ct_users').select('id, full_name, email, role').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_announcements').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
    ]);
    return { institution: institutionRes.data ?? null, members: membersRes.data ?? [], clubs: clubsRes.data ?? [], announcements: announcementsRes.data ?? [], userId };
  }, { institution: null, members: [], clubs: [], announcements: [], userId: null } as any);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [clubName, setClubName] = useState('');

  const createAnnouncement = async () => {
    if (!user?.id || !institutionId || !announcementTitle.trim()) return;
    const { data: announcement } = await supabase.from('ct_announcements').insert({ institution_id: institutionId, author_id: user.id, title: announcementTitle.trim(), status: 'published', audience: 'all' }).select('*').single();
    if (announcement) setData((current: any) => ({ ...current, announcements: [announcement, ...current.announcements] }));
    setAnnouncementTitle('');
  };

  const createClubRequest = async () => {
    if (!user?.id || !institutionId || !clubName.trim()) return;
    const { data: club } = await supabase.from('ct_clubs').insert({ institution_id: institutionId, created_by: user.id, leader_id: user.id, name: clubName.trim(), is_approved: false }).select('*').single();
    if (club) setData((current: any) => ({ ...current, clubs: [club, ...current.clubs] }));
    setClubName('');
  };

  const approveClub = async (clubId: string) => {
    await supabase.from('ct_clubs').update({ is_approved: true }).eq('id', clubId);
    setData((current: any) => ({ ...current, clubs: current.clubs.map((club: any) => club.id === clubId ? { ...club, is_approved: true } : club) }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
          <h1 className="font-lexend text-3xl font-900">Admin Workspace</h1>
          <p className="mt-2 text-white/80">Manage your institution, publish announcements, and approve club registrations with real data.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Institution" value={data.institution?.name || 'Setup needed'} color="primary" />
          <StatCard label="Members" value={data.members.length} color="secondary" />
          <StatCard label="Clubs" value={data.clubs.length} color="tertiary" />
          <StatCard label="Announcements" value={data.announcements.length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create announcement</h2>
            <Input label="Announcement title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Campus opens registration next week" />
            <Button onClick={createAnnouncement} className="mt-3 w-full rounded-full">Publish announcement</Button>
          </Card>
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Create club request</h2>
            <Input label="Club name" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Debate Club" />
            <Button onClick={createClubRequest} className="mt-3 w-full rounded-full">Create pending club</Button>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Pending / Active Clubs</h2>
            {data.clubs.length === 0 ? <p className="text-sm text-on-surface-variant">No clubs yet. Create the first one or wait for student leaders to submit requests.</p> : data.clubs.map((club: any) => <div key={club.id} className="mb-3 rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-3"><div><p className="font-jakarta font-700 text-on-surface">{club.name}</p><p className="text-sm text-on-surface-variant">{club.is_approved ? 'Approved' : 'Pending approval'}</p></div>{club.is_approved ? <Badge label="approved" variant="tertiary" /> : <Button onClick={() => approveClub(club.id)} className="rounded-full">Approve</Button>}</div>)}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Members & Announcements</h2>
            {data.members.length === 0 ? <p className="text-sm text-on-surface-variant">No members yet. Share your invite/access code with staff and students.</p> : data.members.slice(0, 8).map((member: any) => <div key={member.id} className="mb-3 rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{member.full_name || member.email}</p><p className="text-sm text-on-surface-variant">{member.role} · {member.email}</p></div>)}
            {data.announcements.length > 0 && <div className="mt-4 space-y-3">{data.announcements.slice(0, 4).map((announcement: any) => <div key={announcement.id} className="rounded-[1rem] bg-surface p-4"><p className="font-jakarta font-700 text-on-surface">{announcement.title}</p><p className="text-sm text-on-surface-variant">{announcement.status || 'published'}</p></div>)}</div>}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
