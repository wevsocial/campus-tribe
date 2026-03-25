import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_CLUBS, MOCK_EVENTS, MOCK_WELLNESS, MOCK_NOTIFICATIONS } from '../../lib/mockData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import clsx from 'clsx';

const CLUB_PHOTOS: Record<string, string> = {
  campus: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80&auto=format',
  sports: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80&auto=format',
  arts: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80&auto=format',
  library: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80&auto=format',
  cafeteria: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=80&auto=format',
};

const CLUB_PHOTO_LIST = Object.values(CLUB_PHOTOS);

const activityFeed = [
  { icon: '📅', text: 'Photography Exhibition starts in 3 days', time: '2h ago', type: 'event' },
  { icon: '🤖', text: 'Robotics Club posted new meeting schedule', time: '9h ago', type: 'club' },
  { icon: '🏀', text: 'Dunk Collective won 82-74 vs Three Point Scholars', time: '1d ago', type: 'sports' },
  { icon: '💪', text: 'You maintained a 5-day wellness streak!', time: '1d ago', type: 'wellness' },
  { icon: '📢', text: 'Sustainability Fair registration is now open', time: '2d ago', type: 'event' },
  { icon: '🎬', text: 'Film Society: Parasite screening this Thursday', time: '2d ago', type: 'club' },
  { icon: '⚽', text: 'Soccer league results: Round 8 completed', time: '3d ago', type: 'sports' },
  { icon: '🧘', text: 'New wellness resource: Managing exam stress', time: '3d ago', type: 'wellness' },
];

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [rsvp, setRsvp] = useState<Record<string, string>>({});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const chartData = MOCK_WELLNESS.map((w) => ({
    date: w.date.slice(5),
    mood: w.mood,
    energy: w.energy,
    stress: w.stress,
  }));

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 220 }}>
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80&auto=format"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047AB]/90 via-[#0047AB]/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <p className="text-blue-200 text-sm mb-1">{greeting}</p>
          <h1 className="font-bold text-3xl text-white mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
            {user?.name?.split(' ')[0] || 'Alex'} Johnson 👋
          </h1>
          <p className="text-blue-100 text-sm">Here's what's happening on campus today.</p>
          <div className="flex gap-4 mt-4">
            {[
              { label: '3 Clubs', icon: '🎯' },
              { label: '2 Events this week', icon: '📅' },
              { label: '5-day streak', icon: '🔥' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold">
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Avatar */}
        <div className="absolute top-6 right-8 flex items-center gap-2">
          <img src="https://i.pravatar.cc/48?img=5" alt="Avatar" className="w-12 h-12 rounded-full border-3 border-white shadow-lg" />
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clubs Joined', value: 3, icon: 'groups', color: 'primary' as const },
          { label: 'Events This Week', value: 2, icon: 'calendar_month', color: 'secondary' as const },
          { label: 'Sports Active', value: 1, icon: 'sports_basketball', color: 'tertiary' as const },
          { label: 'Wellness Streak', value: '5 days', icon: 'local_fire_department', color: 'secondary' as const },
        ].map((s) => (
          <StatCard key={s.label} value={s.value} label={s.label} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* Two column */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-lg text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>Activity Feed</h2>
          <Card padding="none" className="overflow-hidden">
            {activityFeed.map((item, i) => (
              <div key={i} className={clsx('flex items-start gap-3 px-5 py-4', i < activityFeed.length - 1 && 'border-b border-gray-100')}>
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{item.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                </div>
                <Badge label={item.type} variant={item.type === 'event' ? 'primary' : item.type === 'sports' ? 'tertiary' : 'neutral'} />
              </div>
            ))}
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Today's schedule */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>Today's Schedule</h2>
            <Card padding="sm">
              {[
                { time: '10:00 AM', event: 'Robotics Club Meeting', loc: 'Bahen 201' },
                { time: '2:00 PM', event: 'Basketball Practice', loc: 'Athletic Centre' },
                { time: '7:00 PM', event: 'Film Screening: Parasite', loc: 'Innis Town Hall' },
              ].map((item, i) => (
                <div key={i} className={clsx('flex gap-3 py-2.5', i < 2 && 'border-b border-gray-100')}>
                  <div className="text-xs font-bold text-[#0047AB] w-16 flex-shrink-0 mt-0.5">{item.time}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.event}</p>
                    <p className="text-xs text-gray-500">{item.loc}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>Upcoming Events</h2>
            <div className="space-y-3">
              {MOCK_EVENTS.filter(e => e.status === 'upcoming').slice(0, 3).map((event) => (
                <Card key={event.id} padding="sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: event.coverGradient }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{new Date(event.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommended Clubs */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>Recommended</h2>
            <div className="space-y-3">
              {MOCK_CLUBS.slice(4, 7).map((club) => (
                <Card key={club.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: club.coverGradient }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{club.name}</p>
                      <p className="text-xs text-gray-500">{club.memberCount} members</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs flex-shrink-0">Join</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discover Clubs */}
      <div className="mb-8" id="discover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-gray-800" style={{ fontFamily: 'Lexend, sans-serif' }}>Discover Clubs</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CLUBS.slice(0, 6).map((club, idx) => (
            <Card key={club.id} padding="none" className="overflow-hidden hover:shadow-lg transition-all cursor-pointer">
              <div className="h-40 relative overflow-hidden">
                <img
                  src={CLUB_PHOTO_LIST[idx % CLUB_PHOTO_LIST.length]}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-4">
                <Badge label={club.category} size="sm" variant="neutral" />
                <h3 className="font-bold text-base text-gray-900 mt-2 mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>{club.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{club.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((n) => (
                      <img key={n} src={`https://i.pravatar.cc/24?img=${idx * 3 + n}`} alt="" className="w-6 h-6 rounded-full border-2 border-white" />
                    ))}
                    <span className="text-xs text-gray-500 ml-3 self-center">{club.memberCount} members</span>
                  </div>
                  <Button size="sm" variant="primary">Join</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="mb-8" id="events">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-gray-800" style={{ fontFamily: 'Lexend, sans-serif' }}>Events</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_EVENTS.slice(0, 6).map((event, idx) => (
            <Card key={event.id} padding="none" className="overflow-hidden">
              <div className="h-40 relative overflow-hidden">
                <img
                  src={CLUB_PHOTO_LIST[(idx + 2) % CLUB_PHOTO_LIST.length]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <Badge label={event.status} variant={event.status === 'upcoming' ? 'primary' : event.status === 'live' ? 'secondary' : 'neutral'} />
                </div>
                {/* Date badge */}
                <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 text-center shadow">
                  <div className="text-xs font-bold text-[#0047AB]">
                    {new Date(event.startTime).toLocaleString('en', { month: 'short' }).toUpperCase()}
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {new Date(event.startTime).getDate()}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1" style={{ fontFamily: 'Lexend, sans-serif' }}>{event.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{event.venueName}</p>
                <p className="text-xs text-gray-400 mb-3">{new Date(event.startTime).toLocaleDateString()}</p>
                {event.status === 'upcoming' && (
                  <div className="flex gap-2">
                    {['Going', 'Maybe', 'Skip'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRsvp((r) => ({ ...r, [event.id]: opt }))}
                        className={clsx(
                          'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                          rsvp[event.id] === opt
                            ? opt === 'Going' ? 'bg-[#00A86B] text-white' : opt === 'Maybe' ? 'bg-amber-400 text-white' : 'bg-red-400 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Wellness */}
      <div id="wellness">
        <h2 className="font-bold text-xl text-gray-800 mb-6" style={{ fontFamily: 'Lexend, sans-serif' }}>Wellness</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sliders */}
          <Card>
            <h3 className="font-bold text-base text-gray-800 mb-5">Today's Check-in</h3>
            <div className="space-y-5">
              {[
                { label: 'Mood', value: mood, onChange: setMood, color: '#0047AB' },
                { label: 'Energy', value: energy, onChange: setEnergy, color: '#00A86B' },
              ].map(({ label, value, onChange, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-800">{label}</span>
                    <span className="text-sm text-gray-500">{value}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full cursor-pointer"
                    style={{ accentColor: color }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low</span><span>High</span>
                  </div>
                </div>
              ))}
              <Button variant="primary" className="w-full mt-2">Save Check-in</Button>
            </div>
          </Card>

          {/* Chart */}
          <Card>
            <h3 className="font-bold text-base text-gray-800 mb-5">7-Day Wellness Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#0047AB" strokeWidth={2} dot={false} name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#00A86B" strokeWidth={2} dot={false} name="Energy" />
                <Line type="monotone" dataKey="stress" stroke="#FF7F50" strokeWidth={2} dot={false} name="Stress" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
