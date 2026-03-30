import React, { useEffect, useState } from 'react';
import { SmilePlus, Smile, Meh, Frown, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import StatCard from '../../../components/ui/StatCard';
import { StatSkeleton, LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Survey {
  id: string; title: string; description: string | null;
  anonymous: boolean | null; status: string; created_at: string;
}
interface Question {
  id: string; survey_id: string; prompt: string; question_type: string;
  options: string[] | null; position: number;
}
interface WellbeingCheck { id: string; user_id: string; date: string; mood: number; energy: number; stress: number; }

const MOOD = [
  { val: 5, Icon: SmilePlus, label: 'Great',    color: 'text-green-500' },
  { val: 4, Icon: Smile,     label: 'Good',     color: 'text-lime-500' },
  { val: 3, Icon: Meh,       label: 'Okay',     color: 'text-yellow-500' },
  { val: 2, Icon: Frown,     label: 'Low',      color: 'text-orange-500' },
  { val: 1, Icon: Frown,     label: 'Very Low', color: 'text-red-500' },
];

export default function StudentWellness() {
  const { user } = useAuth();
  const [checks, setChecks]   = useState<WellbeingCheck[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mood, setMood]       = useState(3);
  const [energy, setEnergy]   = useState(3);
  const [stress, setStress]   = useState(3);
  const [flash, setFlash]     = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from('ct_wellbeing_checks').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(14),
      supabase.from('ct_surveys').select('*').in('status', ['active', 'published']).order('created_at', { ascending: false }).limit(5),
    ]).then(async ([wb, sv]) => {
      setChecks(wb.data ?? []);
      const surveyList = sv.data ?? [];
      setSurveys(surveyList);
      if (surveyList.length > 0) {
        const ids = surveyList.map((s: Survey) => s.id);
        const { data: qs } = await supabase.from('ct_survey_questions').select('*').in('survey_id', ids).order('position');
        setQuestions(qs ?? []);
      }
      setLoading(false);
    });
  }, [user?.id]);

  const submit = async () => {
    if (!user?.id) return;
    const today = new Date().toISOString().slice(0, 10);
    if (checks.some(c => c.date === today)) {
      showFlash("You've already checked in today! See you tomorrow");
      return;
    }
    const { data } = await supabase.from('ct_wellbeing_checks')
      .insert({ user_id: user.id, date: today, mood, energy, stress })
      .select('*').single();
    if (data) {
      setChecks([data, ...checks]);
      showFlash('Check-in saved! Consistency builds insights');
    }
  };

  const submitSurvey = async () => {
    if (!activeSurvey || !user?.id) return;
    const isAnon = activeSurvey.anonymous;
    await supabase.from('ct_survey_responses').insert({
      survey_id: activeSurvey.id,
      user_id: isAnon ? null : user.id,
      answers,
    });
    setSubmitted(true);
  };

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 4000); };

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton /></div>;

  const todayChecked = checks.some(c => c.date === new Date().toISOString().slice(0, 10));
  const avgMood = checks.length ? Math.round(checks.slice(0,7).reduce((a,b)=>a+b.mood,0)/Math.min(checks.length,7)*10)/10 : null;

  const surveyQs = activeSurvey ? questions.filter(q => q.survey_id === activeSurvey.id).sort((a,b)=>a.position-b.position) : [];

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Wellbeing</h1>

      {flash && <div className="bg-tertiary-container text-tertiary rounded-2xl px-4 py-3 text-sm font-jakarta font-bold">{flash}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={checks.length} label="Total check-ins" color="tertiary" />
        <StatCard value={avgMood ?? '—'} label="7-day avg mood" color="primary" />
        <StatCard value={surveys.length} label="Active surveys" color="secondary" />
      </div>

      {/* Daily check-in */}
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-1">Daily Check-in</h2>
        <p className="text-sm text-on-surface-variant font-jakarta mb-4">
          {todayChecked ? "✅ Already checked in today! Come back tomorrow." : "How are you doing today?"}
        </p>

        {!todayChecked && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-2">Mood</p>
              <div className="flex gap-2 flex-wrap">
                {MOOD.map(m => (
                  <button key={m.val} onClick={() => setMood(m.val)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${mood === m.val ? 'bg-primary text-white' : 'bg-surface-low hover:bg-primary-container'}`}>
                    <m.Icon size={22} className={mood === m.val ? "text-white" : m.color} />
                    <span className="text-xs font-jakarta font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-2">Energy: {energy}/5</p>
                <input type="range" min={1} max={5} value={energy} onChange={e => setEnergy(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-2">Stress: {stress}/5</p>
                <input type="range" min={1} max={5} value={stress} onChange={e => setStress(+e.target.value)} className="w-full accent-secondary" />
              </div>
            </div>
            <Button onClick={submit} className="w-full rounded-full">Save Check-in</Button>
          </div>
        )}

        {/* History sparkline */}
        {checks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <p className="text-xs font-jakarta font-bold text-on-surface-variant uppercase tracking-widest mb-3">Last {Math.min(checks.length,7)} days</p>
            <div className="flex gap-2 items-end h-16">
              {checks.slice(0,7).reverse().map((c,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary rounded-full transition-all" style={{ height: `${(c.mood/5)*100}%`, minHeight: 4 }} />
                  {(() => { const mo = MOOD.find(m=>m.val===c.mood); return mo ? <mo.Icon size={14} className={mo.color} /> : null; })()}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Wellness resources */}
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">🆘 Wellness Resources</h2>
        <div className="space-y-2">
          {[
            { label: 'Counseling Services', desc: 'Book a session with a campus counselor', link: '#' },
            { label: 'Crisis Line', desc: '24/7 mental health support — call anytime', link: '#' },
            { label: 'Peer Support Program', desc: 'Connect with trained student peer mentors', link: '#' },
            { label: 'Mindfulness & Meditation', desc: 'Guided sessions and workshops on campus', link: '#' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-tertiary-container">
              <div>
                <p className="font-jakarta font-bold text-on-surface text-sm">{r.label}</p>
                <p className="text-xs text-on-surface-variant">{r.desc}</p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full flex-shrink-0">Visit →</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Active surveys */}
      {surveys.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Wellbeing Surveys</h2>
          <div className="space-y-3">
            {surveys.map(s => (
              <Card key={s.id} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface">{s.title}</p>
                  {s.description && <p className="text-sm text-on-surface-variant line-clamp-1">{s.description}</p>}
                  {s.anonymous && <span className="text-xs text-tertiary font-jakarta font-bold mt-1 inline-block">🔒 Anonymous</span>}
                </div>
                <Button size="sm" className="rounded-full flex-shrink-0" onClick={() => { setActiveSurvey(s); setAnswers({}); setSubmitted(false); }}>
                  Take Survey
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Survey modal */}
      {activeSurvey && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-lowest rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4"><CheckCircle size={48} className="text-green-500" /></div>
                <h3 className="font-lexend text-xl font-bold">Thank you!</h3>
                <p className="text-on-surface-variant mt-2">Your response has been recorded.</p>
                <Button onClick={() => setActiveSurvey(null)} className="mt-4 rounded-full">Close</Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-lexend font-bold text-on-surface">{activeSurvey.title}</h3>
                  <button onClick={() => setActiveSurvey(null)} className="text-on-surface-variant hover:text-on-surface text-xl font-bold">✕</button>
                </div>
                {activeSurvey.anonymous && <Badge label="🔒 Anonymous" variant="success" />}
                <div className="space-y-4 mt-4">
                  {surveyQs.map((q, idx) => (
                    <div key={q.id} className="bg-surface-low p-4 rounded-xl">
                      <p className="font-jakarta font-bold text-sm mb-3">{idx+1}. {q.prompt}</p>
                      {q.question_type === 'text' && (
                        <textarea rows={3} value={answers[q.id]||''} onChange={e=>setAnswers({...answers,[q.id]:e.target.value})}
                          className="w-full rounded-xl border border-outline-variant p-3 text-sm bg-surface-lowest" />
                      )}
                      {q.question_type === 'rating' && (
                        <div className="flex gap-2">{[1,2,3,4,5].map(n=>(
                          <button key={n} onClick={()=>setAnswers({...answers,[q.id]:n})}
                            className={`w-10 h-10 rounded-full text-lg transition-all ${answers[q.id]>=n?'opacity-100':'opacity-30'}`}>⭐</button>
                        ))}</div>
                      )}
                      {q.question_type === 'likert' && (
                        <div className="flex flex-wrap gap-2">
                          {['Strongly Agree','Agree','Neutral','Disagree','Strongly Disagree'].map(opt=>(
                            <button key={opt} onClick={()=>setAnswers({...answers,[q.id]:opt})}
                              className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-bold ${answers[q.id]===opt?'bg-primary text-white':'bg-surface-high hover:bg-primary-container'}`}>{opt}</button>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'nps' && (
                        <div className="flex flex-wrap gap-1">
                          {Array.from({length:11},(_,n)=>(
                            <button key={n} onClick={()=>setAnswers({...answers,[q.id]:n})}
                              className={`w-9 h-9 rounded-full text-sm font-bold ${answers[q.id]===n?'bg-primary text-white':'bg-surface-high hover:bg-primary-container'}`}>{n}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={submitSurvey} className="w-full rounded-full mt-4">Submit Response</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
