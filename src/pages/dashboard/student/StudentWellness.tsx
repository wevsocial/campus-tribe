import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface WellnessCheck { id: string; date: string; mood: number; energy: number; stress: number; }

const MOODS = ['😢','😟','😐','😊','😄'];

export default function StudentWellness() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<WellnessCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [todayDone, setTodayDone] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('ct_wellbeing_checks').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30)
      .then(({ data }) => {
        const list = data ?? [];
        setChecks(list);
        const today = new Date().toISOString().split('T')[0];
        setTodayDone(list.some(c => c.date === today));
        setLoading(false);
      });
  }, [user?.id]);

  const submit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('ct_wellbeing_checks')
      .upsert({ user_id: user.id, date: today, mood, energy, stress }, { onConflict: 'user_id,date' })
      .select('*').single();
    if (data) {
      setChecks([data, ...checks.filter(c => c.date !== today)]);
      setTodayDone(true);
    }
    setSubmitting(false);
  };

  const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—';

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Wellness Check-In</h1>

      {!todayDone ? (
        <Card variant="primary-tinted">
          <h2 className="font-lexend font-bold text-on-surface mb-4">How are you feeling today?</h2>
          <div className="space-y-4">
            <div>
              <p className="font-jakarta text-sm font-bold text-on-surface-variant mb-2">Mood</p>
              <div className="flex gap-3">
                {MOODS.map((m, i) => (
                  <button key={i} onClick={() => setMood(i+1)}
                    className={`text-2xl p-2 rounded-xl transition-all ${mood===i+1 ? 'bg-primary-container scale-110' : 'opacity-50 hover:opacity-80'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-jakarta text-sm font-bold text-on-surface-variant mb-2">Energy (1-5): {energy}</p>
              <input type="range" min={1} max={5} value={energy} onChange={e=>setEnergy(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <p className="font-jakarta text-sm font-bold text-on-surface-variant mb-2">Stress (1-5): {stress}</p>
              <input type="range" min={1} max={5} value={stress} onChange={e=>setStress(+e.target.value)} className="w-full accent-secondary" />
            </div>
            <Button onClick={submit} isLoading={submitting} className="rounded-full w-full">Submit Check-In</Button>
          </div>
        </Card>
      ) : (
        <Card variant="tertiary-tinted">
          <p className="font-jakarta font-bold text-on-surface text-center">✅ Today's check-in complete!</p>
          <p className="text-sm text-on-surface-variant text-center mt-1">See you tomorrow.</p>
        </Card>
      )}

      {checks.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><p className="font-lexend font-bold text-2xl text-primary">{avg(checks.map(c=>c.mood))}</p><p className="text-xs text-on-surface-variant font-jakarta mt-1">Avg Mood</p></Card>
            <Card><p className="font-lexend font-bold text-2xl text-tertiary">{avg(checks.map(c=>c.energy))}</p><p className="text-xs text-on-surface-variant font-jakarta mt-1">Avg Energy</p></Card>
            <Card><p className="font-lexend font-bold text-2xl text-secondary">{avg(checks.map(c=>c.stress))}</p><p className="text-xs text-on-surface-variant font-jakarta mt-1">Avg Stress</p></Card>
          </div>
          <div>
            <h2 className="font-lexend font-bold text-on-surface mb-3">History (last 30 days)</h2>
            <div className="space-y-2">
              {checks.slice(0,10).map(c => (
                <Card key={c.id} className="flex items-center justify-between py-3">
                  <span className="font-jakarta text-sm text-on-surface-variant">{new Date(c.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-lg">{MOODS[c.mood-1]}</span>
                    <span className="font-jakarta text-xs text-on-surface-variant">E:{c.energy} S:{c.stress}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
      {checks.length === 0 && !todayDone && <EmptyState message="No wellness history yet. Check in daily!" />}
    </div>
  );
}
