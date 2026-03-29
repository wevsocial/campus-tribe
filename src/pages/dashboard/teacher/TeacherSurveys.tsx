import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Survey { id: string; title: string; description: string | null; status: string; anonymous: boolean; response_count?: number; }

export default function TeacherSurveys() {
  const { user, institutionId } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', anonymous: false });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).eq('created_by', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setSurveys(data ?? []); setLoading(false); });
  }, [institutionId, user?.id]);

  const createSurvey = async () => {
    if (!form.title.trim() || !institutionId || !user?.id) return;
    setCreating(true);
    const { data } = await supabase.from('ct_surveys')
      .insert({ ...form, institution_id: institutionId, created_by: user.id, status: 'draft' })
      .select('*').single();
    if (data) { setSurveys([data, ...surveys]); setForm({ title: '', description: '', anonymous: false }); }
    setCreating(false);
  };

  const publish = async (id: string) => {
    await supabase.from('ct_surveys').update({ status: 'published' }).eq('id', id);
    setSurveys(surveys.map(s => s.id === id ? { ...s, status: 'published' } : s));
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Surveys</h1>
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Create Survey</h2>
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Survey title"
            className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none resize-none" />
          <label className="flex items-center gap-2 font-jakarta text-sm text-on-surface cursor-pointer">
            <input type="checkbox" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} className="accent-primary" />
            Anonymous responses
          </label>
          <Button onClick={createSurvey} isLoading={creating} className="rounded-full">Create Survey</Button>
        </div>
      </Card>
      {surveys.length === 0 ? <EmptyState icon="📋" message="No surveys yet. Create one above." /> : (
        <div className="space-y-3">
          {surveys.map(s => (
            <Card key={s.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-jakarta font-bold text-on-surface">{s.title}</p>
                <div className="flex gap-2 mt-1">
                  {s.anonymous && <Badge label="Anonymous" variant="neutral" />}
                  <Badge label={s.status} variant={s.status === 'published' ? 'success' : 'warning'} />
                </div>
              </div>
              {s.status === 'draft' && <Button size="sm" onClick={() => publish(s.id)} className="rounded-full">Publish</Button>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
