import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { MOCK_LEAGUES, MOCK_TEAMS, MOCK_GAMES } from '../../lib/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Plus, Star } from 'lucide-react';

const athletes = [
  { id: 1, name: 'Marcus Johnson', position: 'Point Guard', speed: 88, strength: 72, endurance: 91, form: 84, avatar: 41 },
  { id: 2, name: 'Tyler Brooks', position: 'Center', speed: 65, strength: 95, endurance: 78, form: 88, avatar: 42 },
  { id: 3, name: 'Devon Clarke', position: 'Shooting Guard', speed: 90, strength: 70, endurance: 85, form: 79, avatar: 43 },
  { id: 4, name: 'Jamal Reid', position: 'Power Forward', speed: 74, strength: 89, endurance: 80, form: 85, avatar: 44 },
  { id: 5, name: 'Antoine Williams', position: 'Small Forward', speed: 82, strength: 78, endurance: 88, form: 91, avatar: 45 },
];

const weeklySchedule: Record<string, Record<string, { title: string; color: string } | null>> = {
  Mon: { Morning: { title: 'Cardio Drills', color: '#0047AB' }, Afternoon: null, Evening: { title: 'Scrimmage', color: '#FF7F50' } },
  Tue: { Morning: null, Afternoon: { title: 'Weight Training', color: '#00A86B' }, Evening: null },
  Wed: { Morning: { title: 'Film Review', color: '#7B2D8B' }, Afternoon: { title: 'Skill Drills', color: '#0047AB' }, Evening: null },
  Thu: { Morning: null, Afternoon: { title: 'Weight Training', color: '#00A86B' }, Evening: { title: 'Practice Game', color: '#FF7F50' } },
  Fri: { Morning: { title: 'Recovery', color: '#78909C' }, Afternoon: null, Evening: null },
  Sat: { Morning: null, Afternoon: { title: 'Full Scrimmage', color: '#E91E63' }, Evening: null },
  Sun: { Morning: null, Afternoon: null, Evening: null },
};

const performanceTrend = [
  { week: 'Wk 1', score: 71 },
  { week: 'Wk 2', score: 74 },
  { week: 'Wk 3', score: 72 },
  { week: 'Wk 4', score: 78 },
  { week: 'Wk 5', score: 80 },
  { week: 'Wk 6', score: 77 },
  { week: 'Wk 7', score: 83 },
  { week: 'Wk 8', score: 86 },
];

const matchResults = [
  { id: 1, opponent: 'Innis Hoopers', ourScore: 82, theirScore: 74, date: 'Mar 10', result: 'W' },
  { id: 2, opponent: 'Robarts Rim Busters', ourScore: 68, theirScore: 71, date: 'Mar 12', result: 'L' },
  { id: 3, opponent: 'Athletic Aces', ourScore: 77, theirScore: 60, date: 'Mar 17', result: 'W' },
  { id: 4, opponent: 'Bahen Ballers', ourScore: 88, theirScore: 55, date: 'Mar 19', result: 'W' },
];

const tabs = ['Leagues', 'Team Roster', 'Training Schedule', 'Performance Analytics', 'Match Results'];

function ratingStars(score: number) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

const CoachDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Leagues');
  const [selectedLeague, setSelectedLeague] = useState(MOCK_LEAGUES[1]);
  const [scoreModal, setScoreModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(MOCK_GAMES[4]);
  const [addResultModal, setAddResultModal] = useState(false);

  const leagueTeams = MOCK_TEAMS.filter(t => t.leagueId === selectedLeague.id).sort((a, b) => b.points - a.points);
  const leagueGames = MOCK_GAMES.filter(g => g.leagueId === selectedLeague.id);
  const chartData = leagueTeams.map(t => ({ name: t.name.split(' ')[0], points: t.points, wins: t.wins }));

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 200 }}>
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80&auto=format"
          alt="Sports"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <h1 className="font-bold text-3xl text-white mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>Coach Dashboard</h1>
          <p className="text-gray-300 text-sm">Intramural Sports Coordinator</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-[#0047AB] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Leagues Tab */}
      {activeTab === 'Leagues' && (
        <div>
          <div className="mb-6">
            <h2 className="font-lexend font-800 text-lg text-on-surface mb-3">Leagues</h2>
            <div className="flex gap-3 flex-wrap">
              {MOCK_LEAGUES.map((league) => (
                <button
                  key={league.id}
                  onClick={() => setSelectedLeague(league)}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-jakarta font-700 transition-all ${selectedLeague.id === league.id ? 'border-primary bg-primary-container text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}
                >
                  {league.sport} - {league.season}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${league.status === 'active' ? 'bg-tertiary text-white' : 'bg-surface-high text-on-surface-variant'}`}>
                    {league.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card padding="none" className="overflow-hidden">
                <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
                  <h3 className="font-lexend font-800 text-base text-on-surface">Standings - {selectedLeague.name}</h3>
                  <Button size="sm" variant="primary" onClick={() => setScoreModal(true)}>Enter Score</Button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-low border-b border-outline-variant/30">
                      {['#', 'Team', 'W', 'L', 'Pts'].map(h => (
                        <th key={h} className="py-3 px-4 text-xs font-jakarta font-700 text-on-surface-variant text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leagueTeams.map((team, i) => (
                      <tr key={team.id} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                        <td className="py-3 px-4 text-sm text-on-surface-variant font-jakarta">{i + 1}</td>
                        <td className="py-3 px-4 text-sm font-jakarta font-700 text-on-surface">
                          {i === 0 && <span className="mr-1">🥇</span>}
                          {team.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-tertiary font-jakarta font-700">{team.wins}</td>
                        <td className="py-3 px-4 text-sm text-secondary font-jakarta">{team.losses}</td>
                        <td className="py-3 px-4 text-sm font-jakarta font-700 text-on-surface">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
            <div>
              <Card>
                <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Team Points</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#BFC3D4" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#4A4E63' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#4A4E63' }} width={70} />
                    <Tooltip />
                    <Bar dataKey="points" fill="#0047AB" radius={[0, 4, 4, 0]} name="Points" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Games Schedule</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {leagueGames.map((game) => (
                <Card key={game.id}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge label={game.status} variant={game.status === 'live' ? 'secondary' : game.status === 'completed' ? 'neutral' : 'primary'} dot={game.status === 'live'} />
                    <span className="text-xs text-on-surface-variant">{new Date(game.scheduledAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-sm font-jakarta font-700 text-on-surface">{game.homeTeamName}</p>
                      {game.homeScore !== undefined && <p className="text-2xl font-lexend font-900 text-primary mt-1">{game.homeScore}</p>}
                    </div>
                    <div className="px-4 text-on-surface-variant text-sm font-jakarta">vs</div>
                    <div className="text-center flex-1">
                      <p className="text-sm font-jakarta font-700 text-on-surface">{game.awayTeamName}</p>
                      {game.awayScore !== undefined && <p className="text-2xl font-lexend font-900 text-primary mt-1">{game.awayScore}</p>}
                    </div>
                  </div>
                  {game.status !== 'completed' && (
                    <button className="w-full mt-3 py-2 rounded-xl text-xs font-jakarta font-700 border border-outline-variant text-on-surface-variant hover:bg-surface-low transition-colors" onClick={() => { setSelectedGame(game); setScoreModal(true); }}>
                      Enter Score
                    </button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Roster Tab */}
      {activeTab === 'Team Roster' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lexend font-800 text-lg text-on-surface">Athlete Roster</h2>
            <Button size="sm" variant="primary" icon={<Plus size={14} />}>Add Athlete</Button>
          </div>
          <Card padding="none" className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/30">
                  {['Athlete', 'Position', 'Speed', 'Strength', 'Endurance', 'Form', 'Rating', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-jakarta font-700 text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {athletes.map((a, i) => {
                  const overall = Math.round((a.speed + a.strength + a.endurance + a.form) / 4);
                  return (
                    <tr key={a.id} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://i.pravatar.cc/36?img=${a.avatar}`} alt={a.name} className="w-9 h-9 rounded-full object-cover" />
                          <span className="text-sm font-jakarta font-700 text-on-surface">{a.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-on-surface-variant">{a.position}</td>
                      <td className="py-3 px-4 text-sm font-jakarta font-700 text-[#0047AB]">{a.speed}</td>
                      <td className="py-3 px-4 text-sm font-jakarta font-700 text-[#FF7F50]">{a.strength}</td>
                      <td className="py-3 px-4 text-sm font-jakarta font-700 text-[#00A86B]">{a.endurance}</td>
                      <td className="py-3 px-4 text-sm font-jakarta font-700 text-[#7B2D8B]">{a.form}</td>
                      <td className="py-3 px-4">{ratingStars(overall)}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">Add Score</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Training Schedule Tab */}
      {activeTab === 'Training Schedule' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lexend font-800 text-lg text-on-surface">Weekly Training Schedule</h2>
            <Button size="sm" variant="primary" icon={<Plus size={14} />}>Add Session</Button>
          </div>
          <Card padding="none" className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/30">
                  <th className="text-left py-3 px-4 text-xs font-jakarta font-700 text-on-surface-variant w-28">Slot</th>
                  {Object.keys(weeklySchedule).map(day => (
                    <th key={day} className="text-center py-3 px-2 text-xs font-jakarta font-700 text-on-surface-variant">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Morning', 'Afternoon', 'Evening'].map(slot => (
                  <tr key={slot} className="border-b border-outline-variant/20">
                    <td className="py-3 px-4 text-sm font-jakarta font-700 text-on-surface-variant">{slot}</td>
                    {Object.keys(weeklySchedule).map(day => {
                      const session = weeklySchedule[day][slot];
                      return (
                        <td key={day} className="py-2 px-2 text-center">
                          {session ? (
                            <div className="rounded-lg px-2 py-1.5 text-white text-xs font-medium" style={{ backgroundColor: session.color }}>
                              {session.title}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-300">--</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Performance Analytics Tab */}
      {activeTab === 'Performance Analytics' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Team Performance Over 8 Weeks</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BFC3D4" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#4A4E63' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#4A4E63' }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0047AB" strokeWidth={2.5} dot={{ r: 4, fill: '#0047AB' }} name="Team Score" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <div className="grid md:grid-cols-3 gap-4">
            {athletes.map(a => {
              const overall = Math.round((a.speed + a.strength + a.endurance + a.form) / 4);
              return (
                <Card key={a.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={`https://i.pravatar.cc/40?img=${a.avatar}`} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-jakarta font-700 text-sm text-on-surface">{a.name}</div>
                      <div className="text-xs text-on-surface-variant">{a.position}</div>
                    </div>
                    <div className="ml-auto text-lg font-lexend font-900 text-[#0047AB]">{overall}</div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Speed', value: a.speed, color: '#0047AB' },
                      { label: 'Strength', value: a.strength, color: '#FF7F50' },
                      { label: 'Endurance', value: a.endurance, color: '#00A86B' },
                      { label: 'Form', value: a.form, color: '#7B2D8B' },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant w-16">{m.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-1.5 rounded-full" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                        </div>
                        <span className="text-xs font-jakarta font-700" style={{ color: m.color }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Match Results Tab */}
      {activeTab === 'Match Results' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lexend font-800 text-lg text-on-surface">Match Results</h2>
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setAddResultModal(true)}>
              Add Result
            </Button>
          </div>
          <div className="space-y-3">
            {matchResults.map(m => (
              <Card key={m.id}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-lexend font-900 text-lg ${m.result === 'W' ? 'bg-green-100 text-green-700' : m.result === 'L' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {m.result}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs font-jakarta font-700 text-on-surface">Dunk Collective</div>
                        <div className="text-2xl font-lexend font-900 text-[#0047AB]">{m.ourScore}</div>
                      </div>
                      <div className="text-on-surface-variant font-jakarta text-sm">vs</div>
                      <div className="text-center">
                        <div className="text-xs font-jakarta font-700 text-on-surface">{m.opponent}</div>
                        <div className="text-2xl font-lexend font-900 text-gray-500">{m.theirScore}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant">{m.date}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Score Entry Modal */}
      <Modal isOpen={scoreModal} onClose={() => setScoreModal(false)} title="Enter Game Score" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">{selectedGame?.homeTeamName} vs {selectedGame?.awayTeamName}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">{selectedGame?.homeTeamName}</label>
              <input type="number" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-center text-2xl font-lexend font-900 text-primary focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">{selectedGame?.awayTeamName}</label>
              <input type="number" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-center text-2xl font-lexend font-900 text-primary focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setScoreModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => setScoreModal(false)}>Save Score</Button>
          </div>
        </div>
      </Modal>

      {/* Add Result Modal */}
      <Modal isOpen={addResultModal} onClose={() => setAddResultModal(false)} title="Add Match Result" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Opponent</label>
            <input type="text" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Team name..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Our Score</label>
              <input type="number" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Their Score</label>
              <input type="number" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Date</label>
            <input type="date" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAddResultModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => setAddResultModal(false)}>Save Result</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default CoachDashboard;
