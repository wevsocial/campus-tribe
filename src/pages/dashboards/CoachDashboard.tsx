import { useState } from 'react'
import { Trophy, Users, Calendar, Plus, Edit2, CheckCircle } from 'lucide-react'

const leagues = [
  { id: '1', name: '5-a-Side Soccer', sport: 'Soccer', season: 'Spring 2026', status: 'active', teams: 8, games: 24 },
  { id: '2', name: 'Basketball 3v3', sport: 'Basketball', season: 'Spring 2026', status: 'registration', teams: 5, games: 0 },
  { id: '3', name: 'Volleyball', sport: 'Volleyball', season: 'Spring 2026', status: 'active', teams: 6, games: 18 },
]

const standings = [
  { rank: 1, team: 'Thunder FC', wins: 6, losses: 1, ties: 1, pts: 19 },
  { rank: 2, team: 'Blue Wolves', wins: 5, losses: 2, ties: 1, pts: 16 },
  { rank: 3, team: 'Rocket Squad', wins: 4, losses: 3, ties: 1, pts: 13 },
  { rank: 4, team: 'Campus United', wins: 3, losses: 4, ties: 1, pts: 10 },
  { rank: 5, team: 'The Legends', wins: 2, losses: 5, ties: 1, pts: 7 },
  { rank: 6, team: 'Night Owls', wins: 1, losses: 6, ties: 1, pts: 4 },
]

const upcomingGames = [
  { home: 'Thunder FC', away: 'Blue Wolves', date: 'Mar 26', time: '6:00 PM', venue: 'Field A' },
  { home: 'Rocket Squad', away: 'Campus United', date: 'Mar 26', time: '7:30 PM', venue: 'Field A' },
  { home: 'The Legends', away: 'Night Owls', date: 'Mar 28', time: '5:00 PM', venue: 'Field B' },
]

const recentGames = [
  { home: 'Thunder FC', away: 'Campus United', homeScore: 3, awayScore: 1, date: 'Mar 22' },
  { home: 'Blue Wolves', away: 'The Legends', homeScore: 2, awayScore: 0, date: 'Mar 22' },
  { home: 'Rocket Squad', away: 'Night Owls', homeScore: 4, awayScore: 2, date: 'Mar 19' },
]

export default function CoachDashboard() {
  const [selectedLeague, setSelectedLeague] = useState('1')
  const [liveScore, setLiveScore] = useState({ home: 0, away: 0 })

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-900 text-2xl text-on-surface">Intramural Sports Hub</h1>
          <p className="text-on-surface-variant text-sm">Manage leagues, games, and teams</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New League
        </button>
      </div>

      {/* Leagues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {leagues.map(l => (
          <div key={l.id} onClick={() => setSelectedLeague(l.id)}
            className={`card cursor-pointer transition-all hover:shadow-card-hover ${selectedLeague === l.id ? 'border-2 border-primary' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                {l.sport === 'Soccer' ? '⚽' : l.sport === 'Basketball' ? '🏀' : '🏐'}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-label font-bold
                ${l.status === 'active' ? 'bg-tertiary/10 text-tertiary' : 'bg-secondary/10 text-secondary'}`}>
                {l.status === 'active' ? 'Active' : 'Registration'}
              </span>
            </div>
            <h3 className="font-headline font-800 text-base text-on-surface mb-1">{l.name}</h3>
            <p className="text-on-surface-variant text-xs mb-3">{l.season}</p>
            <div className="flex gap-4">
              <div className="text-xs text-on-surface-variant"><span className="font-label font-bold text-on-surface">{l.teams}</span> teams</div>
              <div className="text-xs text-on-surface-variant"><span className="font-label font-bold text-on-surface">{l.games}</span> games played</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-secondary" />
            <h2 className="font-headline font-800 text-base text-on-surface">5-a-Side Soccer Standings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface text-left">
                  {['#', 'Team', 'W', 'L', 'T', 'PTS'].map(h => (
                    <th key={h} className="pb-3 font-label font-bold text-on-surface-variant text-xs pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map(row => (
                  <tr key={row.rank} className="border-b border-surface/50 hover:bg-surface/50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-label font-bold
                        ${row.rank === 1 ? 'bg-yellow-100 text-yellow-600' : row.rank === 2 ? 'bg-gray-100 text-gray-500' : row.rank === 3 ? 'bg-orange-100 text-orange-500' : 'text-on-surface-variant'}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-label font-bold text-sm text-on-surface">{row.team}</td>
                    <td className="py-3 pr-4 text-xs text-on-surface-variant">{row.wins}</td>
                    <td className="py-3 pr-4 text-xs text-on-surface-variant">{row.losses}</td>
                    <td className="py-3 pr-4 text-xs text-on-surface-variant">{row.ties}</td>
                    <td className="py-3 font-label font-bold text-sm text-primary">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Scorecard */}
        <div className="card">
          <h2 className="font-headline font-800 text-base text-on-surface mb-4">Live Scorecard</h2>
          <div className="bg-on-surface rounded-xl p-4 text-center mb-4">
            <div className="text-white/60 text-xs font-label mb-3">LIVE · Thunder FC vs Blue Wolves</div>
            <div className="flex items-center justify-around">
              <div>
                <div className="font-headline font-900 text-5xl text-white">{liveScore.home}</div>
                <div className="text-white/60 text-xs font-label mt-1">Thunder FC</div>
              </div>
              <div className="text-white/40 font-headline font-900 text-2xl">:</div>
              <div>
                <div className="font-headline font-900 text-5xl text-white">{liveScore.away}</div>
                <div className="text-white/60 text-xs font-label mt-1">Blue Wolves</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setLiveScore(s => ({ ...s, home: s.home + 1 }))}
              className="py-2 bg-primary text-white rounded-lg text-xs font-label font-bold hover:bg-primary/90 transition-colors">
              + Home Goal
            </button>
            <button onClick={() => setLiveScore(s => ({ ...s, away: s.away + 1 }))}
              className="py-2 bg-secondary text-white rounded-lg text-xs font-label font-bold hover:bg-secondary/90 transition-colors">
              + Away Goal
            </button>
            <button onClick={() => setLiveScore(s => ({ ...s, home: Math.max(0, s.home - 1) }))}
              className="py-2 bg-surface text-on-surface-variant rounded-lg text-xs font-label font-bold hover:bg-red-50 hover:text-red-500 transition-colors">
              Undo Home
            </button>
            <button onClick={() => setLiveScore(s => ({ ...s, away: Math.max(0, s.away - 1) }))}
              className="py-2 bg-surface text-on-surface-variant rounded-lg text-xs font-label font-bold hover:bg-red-50 hover:text-red-500 transition-colors">
              Undo Away
            </button>
          </div>
          <button className="w-full mt-3 py-2 bg-tertiary text-white rounded-lg text-xs font-label font-bold hover:bg-tertiary/90 transition-colors flex items-center justify-center gap-1">
            <CheckCircle size={14} /> Finalize Score
          </button>

          {/* Recent Results */}
          <div className="mt-4 pt-4 border-t border-surface">
            <h3 className="font-label font-bold text-xs text-on-surface-variant mb-3">Recent Results</h3>
            <div className="flex flex-col gap-2">
              {recentGames.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant truncate">{g.home}</span>
                  <span className="font-label font-bold text-on-surface mx-2">{g.homeScore} - {g.awayScore}</span>
                  <span className="text-on-surface-variant truncate text-right">{g.away}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Games */}
      <div className="card mt-6">
        <h2 className="font-headline font-800 text-base text-on-surface mb-4">Upcoming Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingGames.map((g, i) => (
            <div key={i} className="p-4 bg-surface rounded-lg">
              <div className="text-xs text-on-surface-variant font-label mb-2">{g.date} · {g.time} · {g.venue}</div>
              <div className="flex items-center justify-between">
                <span className="font-label font-bold text-sm text-on-surface">{g.home}</span>
                <span className="text-xs text-on-surface-variant font-headline font-bold">VS</span>
                <span className="font-label font-bold text-sm text-on-surface">{g.away}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
