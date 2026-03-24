import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { MOCK_LEAGUES, MOCK_TEAMS, MOCK_GAMES } from '../../lib/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CoachDashboard: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState(MOCK_LEAGUES[1]);
  const [scoreModal, setScoreModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(MOCK_GAMES[4]);

  const leagueTeams = MOCK_TEAMS.filter(t => t.leagueId === selectedLeague.id)
    .sort((a, b) => b.points - a.points);

  const leagueGames = MOCK_GAMES.filter(g => g.leagueId === selectedLeague.id);

  const chartData = leagueTeams.map(t => ({
    name: t.name.split(' ')[0],
    points: t.points,
    wins: t.wins,
  }));

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-lexend font-900 text-3xl text-on-surface">Coach Dashboard</h1>
        <p className="text-on-surface-variant mt-1">Intramural Sports Coordinator</p>
      </div>

      {/* Leagues */}
      <div className="mb-6">
        <h2 className="font-lexend font-800 text-lg text-on-surface mb-3">Leagues</h2>
        <div className="flex gap-3 flex-wrap">
          {MOCK_LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league)}
              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-jakarta font-700 transition-all ${
                selectedLeague.id === league.id
                  ? 'border-primary bg-primary-container text-primary'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
              }`}
            >
              {league.sport} · {league.season}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                league.status === 'active' ? 'bg-tertiary text-white' : 'bg-surface-high text-on-surface-variant'
              }`}>
                {league.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Standings */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="font-lexend font-800 text-base text-on-surface">Standings to {selectedLeague.name}</h3>
              <Button size="sm" variant="primary" onClick={() => setScoreModal(true)}>Enter Score</Button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/30">
                  {['#', 'Team', 'W', 'L', 'Pts'].map((h) => (
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

        {/* Points Chart */}
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

      {/* Games */}
      <div>
        <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Games Schedule</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {leagueGames.map((game) => (
            <Card key={game.id}>
              <div className="flex items-center justify-between mb-3">
                <Badge
                  label={game.status}
                  variant={game.status === 'live' ? 'secondary' : game.status === 'completed' ? 'neutral' : 'primary'}
                  dot={game.status === 'live'}
                />
                <span className="text-xs text-on-surface-variant">{new Date(game.scheduledAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-sm font-jakarta font-700 text-on-surface">{game.homeTeamName}</p>
                  {game.homeScore !== undefined && (
                    <p className="text-2xl font-lexend font-900 text-primary mt-1">{game.homeScore}</p>
                  )}
                </div>
                <div className="px-4 text-on-surface-variant text-sm font-jakarta">vs</div>
                <div className="text-center flex-1">
                  <p className="text-sm font-jakarta font-700 text-on-surface">{game.awayTeamName}</p>
                  {game.awayScore !== undefined && (
                    <p className="text-2xl font-lexend font-900 text-primary mt-1">{game.awayScore}</p>
                  )}
                </div>
              </div>
              {game.status !== 'completed' && (
                <button
                  className="w-full mt-3 py-2 rounded-xl text-xs font-jakarta font-700 border border-outline-variant text-on-surface-variant hover:bg-surface-low transition-colors"
                  onClick={() => { setSelectedGame(game); setScoreModal(true); }}
                >
                  Enter Score
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>

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
    </DashboardLayout>
  );
};

export default CoachDashboard;
