import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface League { id: string; name: string; sport: string | null; status: string; }
interface Team { id: string; name: string; wins: number; losses: number; points: number; }

export default function StudentSports() {
  const { user, institutionId } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isFreeAgent, setIsFreeAgent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    Promise.all([
      supabase.from('ct_sports_leagues').select('id,name,sport,status').eq('institution_id', institutionId).eq('status', 'active'),
      supabase.from('ct_sports_teams').select('id,name,wins,losses,points').eq('institution_id', institutionId).order('points', { ascending: false }).limit(10),
      supabase.from('ct_sport_participants').select('id').eq('user_id', user.id).eq('is_free_agent', true).limit(1),
    ]).then(([l, t, fa]) => {
      setLeagues(l.data ?? []);
      setTeams(t.data ?? []);
      setIsFreeAgent((fa.data ?? []).length > 0);
      setLoading(false);
    });
  }, [institutionId, user?.id]);

  const toggleFreeAgent = async () => {
    if (!user?.id || !institutionId || leagues.length === 0) return;
    if (isFreeAgent) {
      await supabase.from('ct_sport_participants').delete().eq('user_id', user.id).eq('is_free_agent', true);
      setIsFreeAgent(false);
    } else {
      await supabase.from('ct_sport_participants').insert({ user_id: user.id, institution_id: institutionId, league_id: leagues[0].id, is_free_agent: true });
      setIsFreeAgent(true);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Sports</h1>

      <Card variant="primary-tinted" className="flex items-center justify-between">
        <div>
          <p className="font-jakarta font-bold text-on-surface">Free Agent Pool</p>
          <p className="text-sm text-on-surface-variant">Join to be picked up by a team</p>
        </div>
        <Button size="sm" variant={isFreeAgent ? 'outline' : 'primary'} onClick={toggleFreeAgent} className="rounded-full">
          {isFreeAgent ? 'Leave Pool' : 'Join Pool'}
        </Button>
      </Card>

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Active Leagues</h2>
        {leagues.length === 0 ? <EmptyState message="No active leagues right now." /> : (
          <div className="space-y-3">
            {leagues.map(l => (
              <Card key={l.id} className="flex items-center justify-between">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{l.name}</p>
                  <p className="text-sm text-on-surface-variant">{l.sport}</p>
                </div>
                <Badge label="Active" variant="success" />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Standings</h2>
        {teams.length === 0 ? <EmptyState message="No team standings yet." /> : (
          <Card padding="none">
            <table className="w-full">
              <thead className="bg-surface-low"><tr>{['#','Team','W','L','Pts'].map(h=><th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-on-surface-variant uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-outline-variant/20">
                {teams.map((t, i) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 text-on-surface-variant font-jakarta text-sm">{i+1}</td>
                    <td className="px-4 py-3 font-jakarta font-bold text-on-surface">{t.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{t.wins}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{t.losses}</td>
                    <td className="px-4 py-3 font-jakarta font-bold text-primary">{t.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
