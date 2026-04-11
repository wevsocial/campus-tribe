import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { X, Bell } from 'lucide-react';

interface Athlete {
  id: string; user_id: string; team_id: string | null; is_free_agent: boolean; waiver_signed: boolean;
  user?: { full_name: string; email: string; gender: string | null } | null;
  team?: { name: string } | null;
}

export default function CoachAthletes() {
  const { institutionId, user } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [teams, setTeams] = useState<Array<{id:string; name:string; league_id:string|null}>>([]);
  const [leagues, setLeagues] = useState<Array<{id:string; name:string}>>([]);
  const [students, setStudents] = useState<Array<{id:string; full_name:string|null; email:string}>>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [loading, setLoading] = useState(true);
  const [waiverAthlete, setWaiverAthlete] = useState<Athlete | null>(null);
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [signing, setSigning] = useState(false);
  const [institutionName, setInstitutionName] = useState('Campus Tribe');

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_sport_participants').select('*, user:ct_users(full_name, email, gender), team:ct_sports_teams(name)').eq('institution_id', institutionId),
      supabase.from('ct_sports_teams').select('id,name,league_id').eq('institution_id', institutionId),
      supabase.from('ct_sports_leagues').select('id,name').eq('institution_id', institutionId),
      supabase.from('ct_users').select('id,full_name,email').eq('institution_id', institutionId).in('role', ['student','athlete','student_rep']),
      supabase.from('ct_institutions').select('name').eq('id', institutionId).maybeSingle(),
    ]).then(([a, t, l, s, inst]) => {
      setAthletes((a.data as Athlete[]) ?? []);
      setTeams((t.data as any[]) ?? []);
      setLeagues((l.data as any[]) ?? []);
      setStudents((s.data as any[]) ?? []);
      if (inst.data?.name) setInstitutionName(inst.data.name);
      setLoading(false);
    });
  }, [institutionId]);

  const recordSignature = async () => {
    if (!waiverAthlete || !waiverChecked) return;
    setSigning(true);
    await supabase.from('ct_sport_participants').update({ waiver_signed: true }).eq('id', waiverAthlete.id);
    setAthletes(prev => prev.map(a => a.id === waiverAthlete.id ? { ...a, waiver_signed: true } : a));
    setSigning(false);
    setWaiverAthlete(null);
    setWaiverChecked(false);
  };

  const sendReminder = async (a: Athlete) => {
    if (!institutionId || !user) return;
    await supabase.from('ct_audit_logs').insert({
      institution_id: institutionId,
      actor_id: user.id,
      action: 'waiver.reminder_sent',
      resource_type: 'sport_participant',
      resource_id: a.id,
      severity: 'info',
      metadata: { athlete_name: a.user?.full_name, athlete_email: a.user?.email },
    });
    alert(`Reminder logged for ${a.user?.full_name || 'athlete'}`);
  };

  const assignAthleteTeam = async (athleteId: string, teamId: string | null) => {
    await supabase.from('ct_sport_participants').update({ team_id: teamId }).eq('id', athleteId);
    setAthletes(prev => prev.map(a => a.id === athleteId ? { ...a, team_id: teamId, team: teamId ? { name: teams.find(t => t.id === teamId)?.name || 'Assigned' } : null } : a));
  };

  const addAthleteFromDirectory = async () => {
    if (!institutionId || !selectedStudent) return;
    const payload: any = {
      user_id: selectedStudent,
      institution_id: institutionId,
      team_id: selectedTeam || null,
      league_id: selectedLeague || null,
      is_free_agent: !selectedTeam,
      waiver_signed: false,
    };
    await supabase.from('ct_sport_participants').insert(payload);
    // reload quick
    const { data } = await supabase.from('ct_sport_participants').select('*, user:ct_users(full_name, email, gender), team:ct_sports_teams(name)').eq('institution_id', institutionId);
    setAthletes((data as Athlete[]) || []);
    setSelectedStudent('');
    setSelectedTeam('');
    setSelectedLeague('');
  };

  const totalMale = athletes.filter(a => a.user?.gender === 'male').length;
  const totalFemale = athletes.filter(a => a.user?.gender === 'female').length;
  const totalUnknown = athletes.filter(a => !a.user?.gender || !['male','female','non_binary'].includes(a.user.gender)).length;

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Athletes</h1>

      {/* Title IX Panel */}
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Title IX Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-lexend font-black text-blue-700">{totalMale}</p>
            <p className="text-sm text-blue-600">Male</p>
          </div>
          <div className="text-center p-3 bg-pink-50 rounded-xl">
            <p className="text-2xl font-lexend font-black text-pink-700">{totalFemale}</p>
            <p className="text-sm text-pink-600">Female</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-lexend font-black text-gray-700">{totalUnknown}</p>
            <p className="text-sm text-gray-600">Unknown/NB</p>
          </div>
        </div>
      </Card>

      {/* Add athlete from directory */}
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Add Athlete from Student Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-low text-sm font-jakarta">
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}
          </select>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} className="px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-low text-sm font-jakarta">
            <option value="">Select league (optional)</option>
            {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-low text-sm font-jakarta">
            <option value="">Select team (optional)</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Button onClick={addAthleteFromDirectory} disabled={!selectedStudent}>Add Athlete</Button>
        </div>
      </Card>

      {athletes.length === 0 ? <EmptyState message="No athletes registered yet." /> : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-low">
                <tr>
                  {['Name', 'Email', 'Team', 'Assign Team', 'Free Agent', 'Waiver', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {athletes.map(a => (
                  <tr key={a.id} className="hover:bg-surface-low/50">
                    <td className="px-4 py-3 font-jakarta font-bold text-on-surface text-sm">{a.user?.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-sm">{a.user?.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-sm">{a.team?.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={a.team_id || ''}
                        onChange={e => assignAthleteTeam(a.id, e.target.value || null)}
                        className="px-2 py-1 rounded-lg border border-outline-variant/40 bg-surface-low text-xs font-jakarta"
                      >
                        <option value="">Unassigned</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={a.is_free_agent ? 'Yes' : 'No'} variant={a.is_free_agent ? 'warning' : 'neutral'} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={a.waiver_signed ? 'Signed' : 'Pending'} variant={a.waiver_signed ? 'success' : 'warning'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!a.waiver_signed && (
                          <Button size="sm" onClick={() => { setWaiverAthlete(a); setWaiverChecked(false); }}>
                            Sign Waiver
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => sendReminder(a)} className="flex items-center gap-1">
                          <Bell size={12} /> Remind
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Waiver Modal */}
      {waiverAthlete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-lexend font-black text-xl text-gray-900">Sign Waiver</h2>
              <button onClick={() => setWaiverAthlete(null)}><X size={20} className="text-gray-500" /></button>
            </div>
            <p className="font-bold text-gray-800 mb-3">{waiverAthlete.user?.full_name || 'Athlete'}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                I, the undersigned, acknowledge the inherent risks of athletic participation and agree to hold Campus Tribe and {institutionName} harmless from injury claims arising from my participation in intramural sports activities.
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={waiverChecked}
                onChange={e => setWaiverChecked(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">Athlete has acknowledged and signed this waiver in person.</span>
            </label>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setWaiverAthlete(null)}>Cancel</Button>
              <Button onClick={recordSignature} disabled={!waiverChecked || signing}>
                {signing ? 'Recording...' : 'Record Signature'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
