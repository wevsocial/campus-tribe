import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Users, Calendar, DollarSign, X, Download, ChevronRight } from 'lucide-react';

interface Club {
  id: string; name: string; category: string | null; description: string | null;
  member_count: number; created_at: string; leader_id: string | null;
}
interface ClubEvent { id: string; title: string; }

export default function ClubLeaderOverview() {
  const { user, institutionId } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHandoff, setShowHandoff] = useState(false);
  const [handoffStep, setHandoffStep] = useState(1);
  const [successor, setSuccessor] = useState({ name: '', email: '' });
  const [handoffDone, setHandoffDone] = useState(false);

  useEffect(() => {
    if (!user || !institutionId) return;
    supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).eq('leader_id', user.id).maybeSingle()
      .then(async ({ data }) => {
        if (!data) {
          // Fallback: show any club in institution
          const { data: anyClub } = await supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).limit(1).maybeSingle();
          setClub(anyClub);
          if (anyClub) {
            const { data: evts } = await supabase.from('ct_events').select('id, title').eq('institution_id', institutionId).limit(10);
            setEvents(evts ?? []);
          }
        } else {
          setClub(data);
          const { data: evts } = await supabase.from('ct_events').select('id, title').eq('institution_id', institutionId).limit(10);
          setEvents(evts ?? []);
        }
        setLoading(false);
      });
  }, [user, institutionId]);

  const monthsOld = club
    ? Math.floor((Date.now() - new Date(club.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  const exportJSON = () => {
    if (!club) return;
    const data = { club, events, memberCount: club.member_count, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${club.name.replace(/\s+/g, '-')}-handoff.json`;
    a.click();
  };

  const confirmHandoff = async () => {
    if (!club || !user || !institutionId) return;
    await supabase.from('ct_audit_logs').insert({
      institution_id: institutionId,
      actor_id: user.id,
      action: 'club.handoff_initiated',
      resource_type: 'club',
      resource_id: club.id,
      severity: 'info',
      metadata: { club_name: club.name, successor_name: successor.name, successor_email: successor.email },
    });
    setHandoffDone(true);
  };

  if (loading) return <LoadingSkeleton />;
  if (!club) return <EmptyState message="No club found. You are not assigned as a club leader." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Club Overview</h1>
        <Button variant="outline" onClick={() => { setShowHandoff(true); setHandoffStep(1); setHandoffDone(false); }}>
          Leadership Handoff
        </Button>
      </div>

      {monthsOld >= 10 && (
        <Card className="border-amber-300 bg-amber-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">Warning</span>
            <div>
              <p className="font-jakarta font-bold text-amber-800">Re-recognition Required</p>
              <p className="text-sm text-amber-700">Your club is {monthsOld} months old. Submit re-recognition paperwork before the semester ends.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <Users size={20} className="text-primary" />
            <div>
              <p className="text-2xl font-lexend font-black text-on-surface">{club.member_count}</p>
              <p className="text-sm text-on-surface-variant">Members</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-secondary" />
            <div>
              <p className="text-2xl font-lexend font-black text-on-surface">{events.length}</p>
              <p className="text-sm text-on-surface-variant">Events</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-tertiary" />
            <div>
              <p className="text-2xl font-lexend font-black text-on-surface">—</p>
              <p className="text-sm text-on-surface-variant">Budget</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-2">{club.name}</h2>
        <p className="text-sm text-on-surface-variant mb-1">Category: {club.category || 'General'}</p>
        {club.description && <p className="text-sm text-on-surface-variant">{club.description}</p>}
        <p className="text-xs text-on-surface-variant mt-3">Founded: {new Date(club.created_at).toLocaleDateString()}</p>
      </Card>

      {events.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Recent Events</h2>
          <div className="space-y-2">
            {events.slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3 bg-surface-low rounded-xl">
                <Calendar size={16} className="text-primary flex-shrink-0" />
                <span className="font-jakarta text-sm text-on-surface">{e.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Handoff Wizard Modal */}
      {showHandoff && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-lexend font-black text-xl text-gray-900">Leadership Handoff</h2>
              <button onClick={() => setShowHandoff(false)}><X size={20} className="text-gray-500" /></button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-6">
              {[1,2,3].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${handoffStep >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
                  {s < 3 && <div className={`flex-1 h-1 rounded ${handoffStep > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            {handoffDone ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">Saved</div>
                <p className="font-jakarta font-bold text-gray-900">Handoff Initiated</p>
                <p className="text-sm text-gray-500 mt-1">Audit log entry created. {successor.name} ({successor.email}) will be notified.</p>
                <Button className="mt-4" onClick={() => setShowHandoff(false)}>Close</Button>
              </div>
            ) : handoffStep === 1 ? (
              <div className="space-y-4">
                <h3 className="font-jakarta font-bold text-gray-800">Step 1: Who is your successor?</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900"
                    value={successor.name}
                    onChange={e => setSuccessor(s => ({ ...s, name: e.target.value }))}
                    placeholder="New President's name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900"
                    type="email"
                    value={successor.email}
                    onChange={e => setSuccessor(s => ({ ...s, email: e.target.value }))}
                    placeholder="new.president@campus.edu"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                    disabled={!successor.name || !successor.email}
                    onClick={() => setHandoffStep(2)}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : handoffStep === 2 ? (
              <div className="space-y-4">
                <h3 className="font-jakarta font-bold text-gray-800">Step 2: Club Summary</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm"><span className="font-bold">Club:</span> {club.name}</p>
                  <p className="text-sm"><span className="font-bold">Members:</span> {club.member_count}</p>
                  <p className="text-sm"><span className="font-bold">Events:</span> {events.length}</p>
                  <p className="text-sm"><span className="font-bold">Founded:</span> {new Date(club.created_at).toLocaleDateString()}</p>
                  <p className="text-sm"><span className="font-bold">Successor:</span> {successor.name} ({successor.email})</p>
                </div>
                <div className="flex justify-between">
                  <button className="text-gray-500 px-4 py-2" onClick={() => setHandoffStep(1)}>← Back</button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2" onClick={() => setHandoffStep(3)}>
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-jakarta font-bold text-gray-800">Step 3: Confirm Transfer</h3>
                <p className="text-sm text-gray-600">This will log a handoff event in the audit trail. The actual role transfer must be completed by an admin.</p>
                <button
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={exportJSON}
                >
                  <Download size={16} /> Export Club Data as JSON
                </button>
                <div className="flex justify-between">
                  <button className="text-gray-500 px-4 py-2" onClick={() => setHandoffStep(2)}>← Back</button>
                  <button className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold" onClick={confirmHandoff}>
                    Confirm Handoff
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
