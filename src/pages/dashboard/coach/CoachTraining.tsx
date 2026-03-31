import { useEffect, useState } from 'react';
import { Plus, Loader2, CheckCircle, Dumbbell } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

interface TrainingSession {
  id: string;
  scheduled_at: string;
  duration_minutes: number | null;
  title: string | null;
  focus_area: string | null;
  notes: string | null;
  team_id: string | null;
  team?: { name: string };
}

interface Team { id: string; name: string; }

export default function CoachTraining() {
  const { institutionId } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    team_id: '',
    scheduled_at: '',
    duration_minutes: '60',
    title: '',
    focus_area: '',
  });

  const load = async () => {
    if (!institutionId) return;
    setLoading(true);
    const [{ data: sessData }, { data: teamData }] = await Promise.all([
      supabase
        .from('ct_training_sessions')
        .select('id,scheduled_at,duration_minutes,focus_area,notes,team_id,title')
        .eq('institution_id', institutionId)
        .order('scheduled_at', { ascending: false })
        .limit(50),
      supabase
        .from('ct_teams')
        .select('id,name')
        .eq('institution_id', institutionId),
    ]);
    const teamMap: Record<string, { name: string }> = {};
    for (const t of (teamData || [])) teamMap[t.id] = { name: t.name };
    setSessions(
      (sessData || []).map(s => ({ ...s, team: s.team_id ? teamMap[s.team_id] : undefined }))
    );
    setTeams(teamData || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [institutionId]);

  const save = async () => {
    if (!form.scheduled_at || !institutionId) return;
    setSaving(true);
    await supabase.from('ct_training_sessions').insert({
      team_id: form.team_id || null,
      scheduled_at: form.scheduled_at,
      duration_minutes: parseInt(form.duration_minutes) || 60,
      title: form.title || 'Training Session',
      focus_area: form.focus_area || null,
      institution_id: institutionId,
    });
    setForm({ team_id: '', scheduled_at: '', duration_minutes: '60', title: '', focus_area: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  };



  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #FF7F50, #ff6030)' }}>
        <h1 className="font-lexend font-900 text-2xl mb-1">Training Sessions</h1>
        <p className="font-jakarta text-white/80 text-sm">Schedule and track team training sessions</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 transition-colors"
        >
          <Plus size={16} /> New Session
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-float border border-outline-variant/30">
          <h3 className="font-lexend font-700 text-on-surface mb-4">Schedule Training Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Team</label>
              <select
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800"
                value={form.team_id}
                onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}
              >
                <option value="">No specific team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Date and Time</label>
              <input
                type="datetime-local"
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800"
                value={form.scheduled_at}
                onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Duration (minutes)</label>
              <input
                type="number"
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800"
                value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Title</label>
              <input
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800"
                placeholder="e.g. Pre-Season Training"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Focus Area</label>
              <input
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800"
                placeholder="e.g. Passing drills, conditioning..."
                value={form.focus_area}
                onChange={e => setForm(f => ({ ...f, focus_area: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-secondary text-white font-jakarta font-700 text-sm hover:bg-secondary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Schedule Session'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-5 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-secondary" size={32} /></div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-float border border-outline-variant/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary-container">
                    <Dumbbell size={18} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-lexend font-700 text-on-surface">
                      {s.team?.name || 'All Teams'} Training
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(s.scheduled_at).toLocaleString()}
                    </p>
                    {s.title && (
                      <p className="text-xs text-on-surface-variant">{s.title}</p>
                    )}
                    {s.focus_area && (
                      <p className="text-xs text-secondary mt-1">{s.focus_area}</p>
                    )}
                    {s.duration_minutes && (
                      <p className="text-xs text-on-surface-variant">{s.duration_minutes} min</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary-container text-secondary font-jakarta font-700">
                    <CheckCircle size={12} /> Scheduled
                  </span>
                </div>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant font-jakarta">
              No training sessions scheduled yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
