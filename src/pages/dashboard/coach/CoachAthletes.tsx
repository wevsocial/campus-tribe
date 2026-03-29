import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { FileText, Check } from 'lucide-react';

interface Athlete {
  id: string; user_id: string; is_free_agent: boolean; league_id: string; waiver_signed?: boolean;
  user?: { full_name: string; email: string } | null;
}

const WAIVER_TEXT = `ATHLETIC PARTICIPATION WAIVER AND RELEASE OF LIABILITY

I, the undersigned participant, acknowledge that participation in intramural sports and athletic activities involves inherent risks including but not limited to physical injury, illness, or property damage.

By signing below, I hereby:
1. Voluntarily agree to participate in intramural athletics.
2. Release, waive, and discharge the institution, its officers, employees, and agents from any and all claims arising from participation.
3. Agree to abide by all rules and codes of conduct set forth by the Athletics Department.
4. Confirm I am physically fit and have no medical conditions that would prevent safe participation.
5. Consent to emergency medical treatment if required.

This waiver is binding on my heirs, assigns, and legal representatives.`;

export default function CoachAthletes() {
  const { institutionId } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [waiverAthlete, setWaiverAthlete] = useState<Athlete | null>(null);
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_sport_participants')
      .select('*, user:ct_users(full_name,email)')
      .eq('institution_id', institutionId)
      .then(({ data }) => { setAthletes((data as Athlete[]) ?? []); setLoading(false); });
  }, [institutionId]);

  const signWaiver = async () => {
    if (!waiverAthlete || !waiverAgreed) return;
    setSigning(true);
    await supabase.from('ct_sport_participants').update({ waiver_signed: true }).eq('id', waiverAthlete.id);
    setAthletes(athletes.map(a => a.id === waiverAthlete.id ? { ...a, waiver_signed: true } : a));
    setSigning(false);
    setWaiverAthlete(null);
    setWaiverAgreed(false);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Athletes</h1>
        <span className="font-jakarta text-sm text-on-surface-variant">
          {athletes.length} registered · {athletes.filter(a => a.waiver_signed).length} waiver signed
        </span>
      </div>

      {/* Waiver modal */}
      {waiverAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-lowest rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-primary" />
              <h2 className="font-lexend font-bold text-on-surface">Athletic Participation Waiver</h2>
            </div>
            <p className="text-xs text-on-surface-variant font-jakarta">For: {waiverAthlete.user?.full_name || waiverAthlete.user?.email}</p>
            <div className="bg-surface-low rounded-xl p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs font-jakarta text-on-surface-variant whitespace-pre-wrap leading-relaxed">{WAIVER_TEXT}</pre>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={waiverAgreed} onChange={e => setWaiverAgreed(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="font-jakarta text-sm text-on-surface">I agree to the terms of this waiver</span>
            </label>
            <div className="flex gap-3">
              <Button onClick={signWaiver} isLoading={signing} disabled={!waiverAgreed} className="rounded-full flex-1 flex items-center gap-2">
                <Check size={14} /> Sign Waiver
              </Button>
              <Button variant="outline" onClick={() => { setWaiverAthlete(null); setWaiverAgreed(false); }} className="rounded-full">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {athletes.length === 0 ? <EmptyState icon="🏃" message="No athletes registered yet." /> : (
        <div className="space-y-2">
          {athletes.map(a => (
            <Card key={a.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="font-jakarta font-bold text-secondary text-xs">
                    {(a.user?.full_name || a.user?.email || '?').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-jakarta font-bold text-on-surface text-sm truncate">{a.user?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-on-surface-variant truncate">{a.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {a.is_free_agent && <Badge label="Free Agent" variant="warning" />}
                {a.waiver_signed ? (
                  <Badge label="Waiver ✓" variant="success" />
                ) : (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setWaiverAthlete(a); setWaiverAgreed(false); }}>
                    Sign Waiver
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
