import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, Users, Calendar, Dumbbell, User, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
}

interface Game {
  id: string;
  home_team_name?: string;
  away_team_name?: string;
  scheduled_at?: string;
  location?: string;
  status?: string;
}

interface TrainingSession {
  id: string;
  title?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  location?: string;
}

interface LeagueStanding {
  id: string;
  name: string;
  wins?: number;
  losses?: number;
  draws?: number;
  points?: number;
}

interface CoachInfo {
  full_name: string | null;
  email: string;
}

interface AthleteProfile {
  is_athlete: boolean;
  athlete_sport: string | null;
  athlete_team_id: string | null;
  athlete_coach_id: string | null;
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-lowest rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-outline-variant/20">
      <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-lexend font-900 text-on-surface">{value}</p>
        <p className="text-xs font-jakarta text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

export default function AthleteDashboard() {
  const { user, profile } = useAuth();
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [training, setTraining] = useState<TrainingSession[]>([]);
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [waiverSubmitting, setWaiverSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  async function loadData() {
    setLoading(true);
    try {
      // Load athlete profile columns
      const { data: ap } = await supabase
        .from('ct_users')
        .select('is_athlete, athlete_sport, athlete_team_id, athlete_coach_id')
        .eq('id', user!.id)
        .maybeSingle();

      if (ap) {
        setAthleteProfile(ap);

        // Check waiver from ct_sport_participants first
        const { data: myParticipations } = await supabase
          .from('ct_sport_participants')
          .select('id, team_id, league_id, is_free_agent, waiver_signed')
          .eq('user_id', user!.id)
          .limit(1);

        const myPart = myParticipations?.[0];
        setWaiverSigned(myPart?.waiver_signed === true || ap.is_athlete === true);

        // Load team info
        const teamIdToUse = myPart?.team_id || ap.athlete_team_id;
        if (teamIdToUse) {
          const { data: team } = await supabase
            .from('ct_sports_teams')
            .select('id, name')
            .eq('id', teamIdToUse)
            .maybeSingle();
          if (team) setTeamName(team.name || '');

          // Load team members via ct_sport_participants
          const { data: participants } = await supabase
            .from('ct_sport_participants')
            .select('user_id')
            .eq('team_id', teamIdToUse)
            .limit(10);

          if (participants?.length) {
            const ids = participants.map((p: { user_id: string }) => p.user_id);
            const { data: members } = await supabase
              .from('ct_users')
              .select('id, full_name, email')
              .in('id', ids);
            setTeamMembers(members || []);
          }

          // Load upcoming games
          const { data: upcomingGames } = await supabase
            .from('ct_sports_games')
            .select('id, home_team_name, away_team_name, scheduled_at, location, status')
            .or(`home_team_id.eq.${teamIdToUse},away_team_id.eq.${teamIdToUse}`)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(3);
          setGames(upcomingGames || []);
        }

        // Load training sessions
        const { data: sessions } = await supabase
          .from('ct_training_sessions')
          .select('id, title, scheduled_at, duration_minutes, location')
          .eq('institution_id', profile?.institution_id || '')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5);
        setTraining(sessions || []);

        // Load coach info
        if (ap.athlete_coach_id) {
          const { data: coachData } = await supabase
            .from('ct_users')
            .select('full_name, email')
            .eq('id', ap.athlete_coach_id)
            .maybeSingle();
          setCoach(coachData || null);
        }
      }

      // Load league standings
      const { data: leagueData } = await supabase
        .from('ct_sports_leagues')
        .select('id, name, wins, losses, draws, points')
        .eq('institution_id', profile?.institution_id || '')
        .limit(8);
      setStandings(leagueData || []);
    } catch (err) {
      console.error('AthleteDashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignWaiver() {
    if (!user?.id) return;
    setWaiverSubmitting(true);
    try {
      await supabase
        .from('ct_users')
        .update({ is_athlete: true })
        .eq('id', user.id);
      // Also update ct_sport_participants
      await supabase
        .from('ct_sport_participants')
        .update({ waiver_signed: true })
        .eq('user_id', user.id);
      setWaiverSigned(true);
    } finally {
      setWaiverSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-lexend font-900 text-2xl text-on-surface">
            Athlete Portal 🏆
          </h1>
          <p className="text-sm font-jakarta text-on-surface-variant mt-1">
            {athleteProfile?.athlete_sport
              ? `Sport: ${athleteProfile.athlete_sport}`
              : 'Your sports dashboard'}
          </p>
        </div>

        {/* Waiver banner */}
        {!waiverSigned && (
          <div id="waiver" className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertCircle className="text-orange-500 mt-0.5 shrink-0" size={22} />
            <div className="flex-1">
              <p className="font-jakarta font-700 text-orange-800">Athlete Waiver Required</p>
              <p className="text-sm font-jakarta text-orange-700 mt-1">
                You must sign the athlete participation waiver before accessing sports features.
              </p>
              <button
                onClick={handleSignWaiver}
                disabled={waiverSubmitting}
                className="mt-3 px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-jakarta font-700 hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {waiverSubmitting ? 'Signing…' : 'Sign Waiver & Activate Athlete Status'}
              </button>
            </div>
          </div>
        )}

        {waiverSigned && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-sm font-jakarta font-700 text-green-700">Athlete waiver signed — you're cleared to compete!</p>
          </div>
        )}

        {/* Stats row */}
        <div id="overview" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Team Members" value={teamMembers.length} icon={<Users size={18} />} />
          <StatCard label="Upcoming Games" value={games.length} icon={<Trophy size={18} />} />
          <StatCard label="Training Sessions" value={training.length} icon={<Dumbbell size={18} />} />
          <StatCard label="League Teams" value={standings.length} icon={<BarChart2 size={18} />} />
        </div>

        {/* My Team */}
        <div id="team" className="bg-surface-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h2 className="font-lexend font-700 text-on-surface">
              My Team{teamName ? ` — ${teamName}` : ''}
            </h2>
          </div>
          {teamMembers.length === 0 ? (
            <p className="text-sm font-jakarta text-on-surface-variant">No team assigned yet. Your coach will add you to a team.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-low">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="text-primary text-xs font-lexend font-900">
                      {(m.full_name || m.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-jakarta font-700 text-on-surface">{m.full_name || 'Athlete'}</p>
                    <p className="text-xs font-jakarta text-on-surface-variant">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Games */}
        <div id="schedule" className="bg-surface-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-primary" />
            <h2 className="font-lexend font-700 text-on-surface">Upcoming Games</h2>
          </div>
          {games.length === 0 ? (
            <p className="text-sm font-jakarta text-on-surface-variant">No upcoming games scheduled.</p>
          ) : (
            <div className="space-y-3">
              {games.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-low">
                  <div>
                    <p className="text-sm font-jakarta font-700 text-on-surface">
                      {g.home_team_name || 'Home'} vs {g.away_team_name || 'Away'}
                    </p>
                    <p className="text-xs font-jakarta text-on-surface-variant">
                      {g.scheduled_at ? new Date(g.scheduled_at).toLocaleString() : 'TBD'}
                      {g.location ? ` · ${g.location}` : ''}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-container text-primary font-jakarta font-700">
                    {g.status || 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Training Schedule */}
        <div id="training" className="bg-surface-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={18} className="text-primary" />
            <h2 className="font-lexend font-700 text-on-surface">Training Schedule</h2>
          </div>
          {training.length === 0 ? (
            <p className="text-sm font-jakarta text-on-surface-variant">No upcoming training sessions.</p>
          ) : (
            <div className="space-y-3">
              {training.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-low">
                  <div>
                    <p className="text-sm font-jakarta font-700 text-on-surface">{s.title || 'Training Session'}</p>
                    <p className="text-xs font-jakarta text-on-surface-variant">
                      {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : 'TBD'}
                      {s.location ? ` · ${s.location}` : ''}
                    </p>
                  </div>
                  {s.duration_minutes && (
                    <span className="text-xs px-2 py-1 rounded-full bg-surface-container text-on-surface-variant font-jakarta">
                      {s.duration_minutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* League Standings */}
        {standings.length > 0 && (
          <div className="bg-surface-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-primary" />
              <h2 className="font-lexend font-700 text-on-surface">League Standings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-jakarta">
                <thead>
                  <tr className="text-on-surface-variant text-xs border-b border-outline-variant/20">
                    <th className="text-left py-2 pr-4">Team</th>
                    <th className="text-center py-2 px-2">W</th>
                    <th className="text-center py-2 px-2">D</th>
                    <th className="text-center py-2 px-2">L</th>
                    <th className="text-center py-2 px-2">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => (
                    <tr key={s.id} className={`border-b border-outline-variant/10 ${i === 0 ? 'font-700 text-primary' : 'text-on-surface'}`}>
                      <td className="py-2 pr-4">{s.name}</td>
                      <td className="text-center py-2 px-2">{s.wins ?? 0}</td>
                      <td className="text-center py-2 px-2">{s.draws ?? 0}</td>
                      <td className="text-center py-2 px-2">{s.losses ?? 0}</td>
                      <td className="text-center py-2 px-2 font-700">{s.points ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coach Card */}
        {coach && (
          <div className="bg-surface-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-primary" />
              <h2 className="font-lexend font-700 text-on-surface">My Coach</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-lexend font-900 text-lg">
                {(coach.full_name || coach.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="font-jakarta font-700 text-on-surface">{coach.full_name || 'Coach'}</p>
                <p className="text-sm font-jakarta text-on-surface-variant">{coach.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
