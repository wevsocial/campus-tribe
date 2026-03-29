import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { QrCode, X } from 'lucide-react';

interface Survey { id: string; title: string; description: string | null; status: string; anonymous: boolean; response_count?: number; }

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none';

export default function TeacherSurveys() {
  const { user, institutionId } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', anonymous: false });
  const [creating, setCreating] = useState(false);
  const [liveSurvey, setLiveSurvey] = useState<Survey | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).eq('created_by', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setSurveys(data ?? []); setLoading(false); });
  }, [institutionId, user?.id]);

  // Live poll response polling
  useEffect(() => {
    if (!liveSurvey) return;
    const fetchCount = () => {
      supabase.from('ct_survey_responses').select('id', { count: 'exact' }).eq('survey_id', liveSurvey.id)
        .then(({ count }) => setLiveCount(count ?? 0));
    };
    fetchCount();
    const interval = setInterval(fetchCount, 3000);
    return () => clearInterval(interval);
  }, [liveSurvey]);

  const createSurvey = async () => {
    if (!form.title.trim() || !institutionId || !user?.id) return;
    setCreating(true);
    const { data } = await supabase.from('ct_surveys')
      .insert({ ...form, institution_id: institutionId, created_by: user.id, status: 'draft' }).select('*').single();
    if (data) { setSurveys([data, ...surveys]); setForm({ title: '', description: '', anonymous: false }); }
    setCreating(false);
  };

  const publish = async (id: string) => {
    await supabase.from('ct_surveys').update({ status: 'published' }).eq('id', id);
    setSurveys(surveys.map(s => s.id === id ? { ...s, status: 'published' } : s));
  };

  const surveyUrl = liveSurvey ? `${window.location.origin}/survey/${liveSurvey.id}` : '';
  const qrUrl = liveSurvey ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}` : '';

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Surveys</h1>

      {/* Live poll fullscreen overlay — Module 11 */}
      {liveSurvey && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8">
          <button onClick={() => setLiveSurvey(null)} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="text-center space-y-6 max-w-md">
            <div>
              <p className="text-white/60 font-jakarta text-sm uppercase tracking-widest mb-2">Live Poll</p>
              <h2 className="font-lexend font-900 text-white text-3xl">{liveSurvey.title}</h2>
            </div>
            <div className="bg-white rounded-2xl p-4 inline-block">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-white/70 font-jakarta text-sm">Scan to respond</p>
            <div className="bg-white/10 rounded-2xl py-6 px-8 text-center">
              <p className="font-lexend font-900 text-5xl text-white">{liveCount}</p>
              <p className="text-white/60 font-jakarta text-sm mt-1">responses so far</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-jakarta">Live — updates every 3s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Create Survey</h2>
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Survey title" className={inputCls} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" rows={2} className={`${inputCls} resize-none`} />
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
              <div className="flex items-center gap-2 flex-shrink-0">
                {s.status === 'draft' && <Button size="sm" onClick={() => publish(s.id)} className="rounded-full">Publish</Button>}
                {s.status === 'published' && (
                  <Button size="sm" variant="outline" className="rounded-full flex items-center gap-1" onClick={() => setLiveSurvey(s)}>
                    <QrCode size={14} />
                    Present Live
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
