import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';

type SurveyQuestion = { id: string; survey_id: string; prompt: string; question_type: string; options?: string[] | null; required?: boolean; position: number };
type ActiveSurvey = { id: string; title: string; description: string | null; anonymous?: boolean | null; is_anonymous?: boolean | null; status?: string | null };
type SportsLeague = { id: string; name: string; sport?: string | null; format?: string | null; season?: string | null; status?: string | null };
type SportsGame = { id: string; league_id: string | null; home_team_id?: string | null; away_team_id?: string | null; scheduled_at?: string | null; status?: string | null; home_score?: number | null; away_score?: number | null };
type SportParticipant = { id: string; league_id: string | null; team_id?: string | null; is_free_agent?: boolean | null };

const INTEREST_OPTIONS = [
  { id: 'sports', label: '⚽ Sports & Athletics', category: 'sports' },
  { id: 'music', label: '🎵 Music & Arts', category: 'arts' },
  { id: 'tech', label: '💻 Technology & Coding', category: 'academic' },
  { id: 'volunteering', label: '🤝 Volunteering', category: 'social' },
  { id: 'debate', label: '🎤 Debate & Public Speaking', category: 'academic' },
  { id: 'fitness', label: '🏋️ Fitness & Wellness', category: 'sports' },
  { id: 'photography', label: '📷 Photography & Film', category: 'arts' },
  { id: 'gaming', label: '🎮 Gaming & Esports', category: 'social' },
  { id: 'entrepreneurship', label: '🚀 Entrepreneurship', category: 'academic' },
  { id: 'cultural', label: '🌍 Cultural Exchange', category: 'social' },
  { id: 'environment', label: '🌱 Environment & Sustainability', category: 'social' },
  { id: 'cooking', label: '👨‍🍳 Food & Cooking', category: 'arts' },
];

const MOOD_OPTIONS = [
  { value: '5', emoji: '😄', label: 'Great' },
  { value: '4', emoji: '😊', label: 'Good' },
  { value: '3', emoji: '😐', label: 'Okay' },
  { value: '2', emoji: '😔', label: 'Low' },
  { value: '1', emoji: '😞', label: 'Very Low' },
];

export default function StudentDashboard() {
  const { user, institutionId, profile, refreshProfile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [savingInterests, setSavingInterests] = useState(false);
  const [mood, setMood] = useState('3');
  const [flash, setFlash] = useState('');
  const [surveyModal, setSurveyModal] = useState<ActiveSurvey | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const { data, setData } = useDashboardData(async ({ userId, institutionId }) => {
    const [clubsRes, membershipsRes, eventsRes, rsvpsRes, wellbeingRes, userRes, leaguesRes, participantsRes, surveysRes] = await Promise.all([
      supabase.from('ct_clubs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(20),
      supabase.from('ct_club_members').select('*').eq('user_id', userId),
      supabase.from('ct_events').select('*').eq('institution_id', institutionId).order('start_time', { ascending: true }).limit(15),
      supabase.from('ct_event_rsvps').select('*').eq('user_id', userId),
      supabase.from('ct_wellbeing_checks').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
      supabase.from('ct_users').select('interests, onboarding_complete').eq('id', userId).maybeSingle(),
      supabase.from('ct_sports_leagues').select('*').eq('institution_id', institutionId).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('ct_sport_participants').select('*').eq('user_id', userId),
      supabase.from('ct_surveys').select('*').eq('institution_id', institutionId).eq('status', 'published').order('created_at', { ascending: false }),
    ]);

    const userProfile = userRes.data;
    const needsOnboarding = !userProfile?.onboarding_complete && (!userProfile?.interests || (userProfile.interests as string[]).length === 0);
    const leagues = leaguesRes.data ?? [];
    const leagueIds = leagues.map((l: SportsLeague) => l.id);
    const gamesRes = leagueIds.length
      ? await supabase.from('ct_sports_games').select('*').in('league_id', leagueIds).gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(20)
      : { data: [] };
    const surveyIds = (surveysRes.data ?? []).map((s: ActiveSurvey) => s.id);
    const questionsRes = surveyIds.length
      ? await supabase.from('ct_survey_questions').select('*').in('survey_id', surveyIds).order('position')
      : { data: [] };
    return {
      clubs: clubsRes.data ?? [],
      memberships: membershipsRes.data ?? [],
      events: eventsRes.data ?? [],
      rsvps: rsvpsRes.data ?? [],
      wellbeing: wellbeingRes.data ?? [],
      userInterests: (userProfile?.interests as string[]) || [],
      needsOnboarding,
      leagues,
      participants: participantsRes.data ?? [],
      upcomingGames: gamesRes.data ?? [],
      activeSurveys: surveysRes.data ?? [],
      surveyQuestions: questionsRes.data ?? [],
    };
  }, { clubs: [], memberships: [], events: [], rsvps: [], wellbeing: [], userInterests: [], needsOnboarding: false, leagues: [], participants: [], upcomingGames: [], activeSurveys: [], surveyQuestions: [] } as any);

  const joinFreeAgent = async (leagueId: string) => {
    if (!user?.id || !institutionId) return;
    const already = data.participants.some((p: SportParticipant) => p.league_id === leagueId);
    if (already) return;
    const { data: participant } = await supabase
      .from('ct_sport_participants')
      .insert({ user_id: user.id, league_id: leagueId, institution_id: institutionId, is_free_agent: true })
      .select('*').single();
    if (participant) {
      setData((c: any) => ({ ...c, participants: [...c.participants, participant] }));
      setFlash('You joined as a free agent! A coach will assign you to a team.');
      setTimeout(() => setFlash(''), 3000);
    }
  };

  const openSurveyModal = (survey: ActiveSurvey) => {
    setSurveyModal(survey);
    setSurveyAnswers({});
    setSurveySubmitted(false);
  };

  const submitSurveyResponse = async () => {
    if (!surveyModal) return;
    const isAnon = surveyModal.anonymous || surveyModal.is_anonymous;
    const answers: Record<string, any> = {};
    const questions = (data.surveyQuestions as SurveyQuestion[]).filter(q => q.survey_id === surveyModal.id);
    questions.forEach(q => { answers[q.id] = surveyAnswers[q.id] ?? null; });
    await supabase.from('ct_survey_responses').insert({
      survey_id: surveyModal.id,
      user_id: isAnon ? null : (user?.id ?? null),
      answers,
    });
    setSurveySubmitted(true);
  };

  // Show onboarding if needed
  React.useEffect(() => {
    if (data.needsOnboarding) setShowOnboarding(true);
  }, [data.needsOnboarding]);

  // Club recommendations based on interests
  const recommendedClubs = useMemo(() => {
    const interests = data.userInterests as string[];
    if (!interests || interests.length === 0) return data.clubs.slice(0, 6);
    const interestCategories = INTEREST_OPTIONS
      .filter(opt => interests.includes(opt.id))
      .map(opt => opt.label.split(' ').slice(1).join(' ').toLowerCase());

    const scored = (data.clubs as any[]).map((club: any) => {
      const clubText = `${club.name} ${club.category || ''} ${club.description || ''}`.toLowerCase();
      const score = interestCategories.filter(cat => clubText.includes(cat.split(' ')[0])).length;
      return { ...club, score };
    });

    return scored.sort((a: any, b: any) => b.score - a.score).slice(0, 8);
  }, [data.clubs, data.userInterests]);

  const saveInterests = async () => {
    if (!user?.id || selectedInterests.length === 0) return;
    setSavingInterests(true);
    await supabase.from('ct_users').update({ interests: selectedInterests, onboarding_complete: true }).eq('id', user.id);
    setData((current: any) => ({ ...current, userInterests: selectedInterests, needsOnboarding: false }));
    setShowOnboarding(false);
    setSavingInterests(false);
    setFlash('Welcome! We\'ve personalized your experience based on your interests.');
    setTimeout(() => setFlash(''), 4000);
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const joinClub = async (clubId: string) => {
    if (!user?.id || !institutionId) return;
    if (data.memberships.some((m: any) => m.club_id === clubId)) return;
    const { data: membership } = await supabase
      .from('ct_club_members')
      .insert({ club_id: clubId, user_id: user.id, institution_id: institutionId, role: 'member', status: 'active' })
      .select('*').single();
    if (membership) {
      setData((current: any) => ({ ...current, memberships: [...current.memberships, membership] }));
      setFlash('You\'ve joined the club!');
      setTimeout(() => setFlash(''), 3000);
    }
  };

  const rsvpEvent = async (eventId: string) => {
    if (!user?.id) return;
    if (data.rsvps.some((r: any) => r.event_id === eventId)) return;
    const { data: rsvp } = await supabase
      .from('ct_event_rsvps')
      .insert({ event_id: eventId, user_id: user.id, status: 'going' })
      .select('*').single();
    if (rsvp) {
      setData((current: any) => ({ ...current, rsvps: [...current.rsvps, rsvp] }));
      setFlash('RSVP confirmed! You\'ll get a reminder before the event.');
      setTimeout(() => setFlash(''), 3000);
    }
  };

  const submitWellbeing = async () => {
    if (!user?.id) return;
    const today = new Date().toISOString().slice(0, 10);
    const exists = data.wellbeing.some((w: any) => w.date === today);
    if (exists) { setFlash('You\'ve already checked in today. See you tomorrow!'); setTimeout(() => setFlash(''), 3000); return; }
    const { data: checkin } = await supabase
      .from('ct_wellbeing_checks')
      .insert({ user_id: user.id, date: today, mood: Number(mood), energy: Number(mood), stress: 6 - Number(mood) })
      .select('*').single();
    if (checkin) {
      setData((current: any) => ({ ...current, wellbeing: [checkin, ...current.wellbeing] }));
      setFlash('Check-in saved! Keep it up — consistency builds insights.');
      setTimeout(() => setFlash(''), 3000);
    }
  };

  // Onboarding Modal
  if (showOnboarding) {
    return (
      <DashboardLayout>
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="font-lexend text-3xl font-900 text-on-surface">Welcome to Campus Tribe!</h2>
              <p className="mt-2 text-on-surface-variant">Tell us what you love and we'll help you find your community.</p>
            </div>

            {onboardingStep === 0 && (
              <>
                <p className="font-jakarta font-700 text-sm text-on-surface-variant uppercase tracking-widest mb-4">
                  What are your interests? (pick all that apply)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {INTEREST_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleInterest(option.id)}
                      className={`p-4 rounded-[1rem] text-left transition-all text-sm font-jakarta font-700 ${
                        selectedInterests.includes(option.id)
                          ? 'bg-primary text-white'
                          : 'bg-surface text-on-surface hover:bg-primary-container'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={saveInterests}
                    disabled={selectedInterests.length === 0 || savingInterests}
                    isLoading={savingInterests}
                    className="flex-1 rounded-full"
                  >
                    {selectedInterests.length === 0 ? 'Select at least one' : `Find My Clubs (${selectedInterests.length} selected)`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setShowOnboarding(false); }}
                    className="rounded-full"
                  >
                    Skip
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Background dashboard */}
        <div className="opacity-30 pointer-events-none space-y-6">
          <div className="rounded-[1.5rem] bg-primary p-8 text-white h-32" />
          <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-container rounded-xl" />)}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero header */}
        <div className="rounded-[1.5rem] bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <h1 className="font-lexend text-3xl font-900">
            Hey {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-2 text-white/80">Your campus life, all in one place.</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-jakarta font-700 transition-all"
            >
              ✨ Update interests
            </button>
          </div>
        </div>

        {flash && (
          <div className="rounded-[1rem] bg-primary/10 p-4 text-sm text-primary font-jakarta font-700">
            {flash}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Clubs joined" value={data.memberships.length} color="primary" />
          <StatCard label="Event RSVPs" value={data.rsvps.length} color="secondary" />
          <StatCard label="Wellbeing logs" value={data.wellbeing.length} color="tertiary" />
          <StatCard label="Available clubs" value={data.clubs.length} color="primary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Wellbeing check-in */}
          <Card>
            <h2 className="mb-3 font-lexend text-lg font-800 text-on-surface">Today's check-in</h2>
            <div className="flex gap-2 flex-wrap mb-3">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-[1rem] transition-all ${
                    mood === option.value ? 'bg-primary text-white' : 'bg-surface hover:bg-primary-container'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs font-jakarta font-700">{option.label}</span>
                </button>
              ))}
            </div>
            <Button onClick={submitWellbeing} className="w-full rounded-full">Save check-in</Button>
            {data.wellbeing.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest mb-2">Last 7 days</p>
                <div className="flex gap-1 items-end h-12">
                  {(data.wellbeing as any[]).slice(0, 7).reverse().map((entry: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary rounded-full"
                        style={{ height: `${(entry.mood / 5) * 100}%`, minHeight: '4px' }}
                        title={`Mood: ${entry.mood}/5 on ${entry.date}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Recommended clubs */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-lexend text-lg font-800 text-on-surface">
                {data.userInterests?.length > 0 ? '✨ Recommended for you' : 'Club directory'}
              </h2>
              {data.userInterests?.length > 0 && (
                <span className="text-xs text-on-surface-variant">Based on your interests</span>
              )}
            </div>
            {recommendedClubs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🏛️</p>
                <p className="text-sm text-on-surface-variant">No clubs yet. Ask your admin to create some!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recommendedClubs.map((club: any) => {
                  const joined = data.memberships.some((m: any) => m.club_id === club.id);
                  return (
                    <div key={club.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-jakarta font-700 text-on-surface truncate">{club.name}</p>
                        <p className="text-sm text-on-surface-variant truncate">{club.category || 'General'}</p>
                      </div>
                      <Button onClick={() => joinClub(club.id)} disabled={joined} className="rounded-full shrink-0" size="sm">
                        {joined ? '✓ Joined' : 'Join'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Events feed */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">🗓️ Upcoming events</h2>
            {data.events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-sm text-on-surface-variant">No events yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(data.events as any[]).map((event: any) => {
                  const going = data.rsvps.some((r: any) => r.event_id === event.id);
                  return (
                    <div key={event.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-jakarta font-700 text-on-surface truncate">{event.title}</p>
                        <p className="text-sm text-on-surface-variant">
                          {event.start_time ? new Date(event.start_time).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                          {event.location ? ` · ${event.location}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge label={event.status || 'upcoming'} variant="secondary" />
                        <Button onClick={() => rsvpEvent(event.id)} disabled={going} className="rounded-full" size="sm">
                          {going ? '✓ Going' : 'RSVP'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent check-ins */}
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">💚 Wellbeing history</h2>
            {data.wellbeing.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">💚</p>
                <p className="text-sm text-on-surface-variant">Submit your first check-in to start tracking your wellbeing.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(data.wellbeing as any[]).map((entry: any) => {
                  const moodOption = MOOD_OPTIONS.find(m => m.value === String(entry.mood));
                  return (
                    <div key={entry.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between">
                      <div>
                        <p className="font-jakarta font-700 text-on-surface">{entry.date}</p>
                        <p className="text-sm text-on-surface-variant">Energy: {entry.energy}/5 · Stress: {entry.stress}/5</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl">{moodOption?.emoji || '😐'}</span>
                        <p className="text-xs text-on-surface-variant">{moodOption?.label || 'Okay'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
        {/* Sports & Leagues */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">🏆 Sports & Leagues</h2>
            {(data.leagues as SportsLeague[]).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No active leagues yet.</p>
            ) : (
              <div className="space-y-3">
                {(data.leagues as SportsLeague[]).map((league) => {
                  const isParticipant = (data.participants as SportParticipant[]).some(p => p.league_id === league.id);
                  return (
                    <div key={league.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-jakarta font-700 text-on-surface">{league.name}</p>
                        <p className="text-sm text-on-surface-variant">{league.sport || 'Sport'} · {league.format || 'Round Robin'} · {league.season || ''}</p>
                      </div>
                      <Button onClick={() => joinFreeAgent(league.id)} disabled={isParticipant} className="rounded-full shrink-0" size="sm">
                        {isParticipant ? '✓ Joined' : 'Join free agent'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Card>
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">📅 Upcoming Games</h2>
            {(data.upcomingGames as SportsGame[]).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No upcoming games scheduled.</p>
            ) : (
              <div className="space-y-2">
                {(data.upcomingGames as SportsGame[]).slice(0, 8).map((game) => (
                  <div key={game.id} className="rounded-[1rem] bg-surface p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-jakarta font-700 text-on-surface text-sm">
                        {game.scheduled_at ? new Date(game.scheduled_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </p>
                    </div>
                    <Badge label={game.status || 'scheduled'} variant="secondary" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Active Surveys */}
        <Card>
          <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">📋 Active Surveys</h2>
          {(data.activeSurveys as ActiveSurvey[]).length === 0 ? (
            <p className="text-sm text-on-surface-variant">No active surveys right now. Check back later!</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.activeSurveys as ActiveSurvey[]).map((survey) => (
                <div key={survey.id} className="rounded-[1rem] bg-surface p-5 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-jakarta font-700 text-on-surface">{survey.title}</p>
                      {(survey.anonymous || survey.is_anonymous) && (
                        <span className="text-xs bg-tertiary-container text-on-tert-cont px-2 py-0.5 rounded-full font-jakarta font-700">Anonymous</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">{survey.description || 'Share your thoughts.'}</p>
                    <p className="text-xs text-on-surface-variant mt-1">⏱ Est. 2–3 min</p>
                  </div>
                  <Button onClick={() => openSurveyModal(survey)} className="rounded-full w-full" size="sm">Take Survey</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Survey Modal */}
        {surveyModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              {surveySubmitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="font-lexend text-2xl font-800 text-on-surface">Thank you!</h3>
                  <p className="text-on-surface-variant mt-2">Your response has been recorded.</p>
                  <Button onClick={() => setSurveyModal(null)} className="mt-6 rounded-full">Close</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-lexend text-xl font-800 text-on-surface">{surveyModal.title}</h3>
                      {surveyModal.description && <p className="text-sm text-on-surface-variant mt-1">{surveyModal.description}</p>}
                    </div>
                    <button onClick={() => setSurveyModal(null)} className="text-on-surface-variant hover:text-on-surface text-xl">✕</button>
                  </div>
                  <div className="space-y-4">
                    {(data.surveyQuestions as SurveyQuestion[])
                      .filter(q => q.survey_id === surveyModal.id)
                      .sort((a, b) => a.position - b.position)
                      .map((question, idx) => (
                        <div key={question.id} className="rounded-[1rem] bg-surface p-4">
                          <p className="font-jakarta font-700 text-on-surface mb-3">{idx + 1}. {question.prompt}</p>
                          {question.question_type === 'text' && (
                            <textarea value={surveyAnswers[question.id] || ''} onChange={e => setSurveyAnswers(c => ({ ...c, [question.id]: e.target.value }))} rows={3} className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" />
                          )}
                          {question.question_type === 'rating' && (
                            <div className="flex gap-2">
                              {[1,2,3,4,5].map(n => (
                                <button key={n} onClick={() => setSurveyAnswers(c => ({ ...c, [question.id]: n }))} className={`text-2xl transition-all ${surveyAnswers[question.id] >= n ? 'opacity-100' : 'opacity-30'}`}>⭐</button>
                              ))}
                            </div>
                          )}
                          {question.question_type === 'likert' && (
                            <div className="flex flex-wrap gap-2">
                              {['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'].map(opt => (
                                <button key={opt} onClick={() => setSurveyAnswers(c => ({ ...c, [question.id]: opt }))} className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-700 transition-all ${surveyAnswers[question.id] === opt ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-primary-container'}`}>{opt}</button>
                              ))}
                            </div>
                          )}
                          {question.question_type === 'nps' && (
                            <div className="flex flex-wrap gap-1">
                              {Array.from({ length: 11 }, (_, n) => (
                                <button key={n} onClick={() => setSurveyAnswers(c => ({ ...c, [question.id]: n }))} className={`w-9 h-9 rounded-full text-sm font-jakarta font-700 transition-all ${surveyAnswers[question.id] === n ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-primary-container'}`}>{n}</button>
                              ))}
                            </div>
                          )}
                          {(question.question_type === 'single_choice' || question.question_type === 'yes_no') && (
                            <div className="flex flex-wrap gap-2">
                              {(question.question_type === 'yes_no' ? ['Yes', 'No'] : (question.options || [])).map(opt => (
                                <button key={opt} onClick={() => setSurveyAnswers(c => ({ ...c, [question.id]: opt }))} className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-700 transition-all ${surveyAnswers[question.id] === opt ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-primary-container'}`}>{opt}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                  <Button onClick={submitSurveyResponse} className="w-full rounded-full mt-6">Submit Response</Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
