import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Announcement { id: string; title: string; body: string | null; created_at: string; }

export default function StudentRepAnnouncements() {
  const { user, institutionId } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '' });

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_announcements').select('id,title,body,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false })
      .then(({ data }) => { setAnnouncements(data ?? []); setLoading(false); });
  }, [institutionId]);

  const post = async () => {
    if (!form.title.trim() || !institutionId || !user?.id) return;
    const { data } = await supabase.from('ct_announcements').insert({ ...form, institution_id: institutionId, created_by: user.id, status: 'published' }).select('id,title,body,created_at').single();
    if (data) { setAnnouncements([data, ...announcements]); setForm({ title: '', body: '' }); }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Announcements</h1>
      <Card>
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title"
            className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none" />
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Body..." rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none resize-none" />
          <Button onClick={post} className="rounded-full">Post Announcement</Button>
        </div>
      </Card>
      {announcements.length === 0 ? <EmptyState icon="📢" message="No announcements yet." /> : (
        <div className="space-y-3">
          {announcements.map(a => (
            <Card key={a.id}>
              <p className="font-jakarta font-bold text-on-surface">{a.title}</p>
              {a.body && <p className="text-sm text-on-surface-variant mt-1">{a.body}</p>}
              <p className="text-xs text-on-surface-variant mt-2">{new Date(a.created_at).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
