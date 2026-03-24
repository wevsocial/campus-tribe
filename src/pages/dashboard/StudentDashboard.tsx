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
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-lexend font-900 text-3xl text-on-surface">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-on-surface-variant mt-1">Here's what's happening on campus today.</p>
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
          <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Activity Feed</h2>
          <Card padding="none" className="overflow-hidden">
            {activityFeed.map((item, i) => (
              <div key={i} className={clsx('flex items-start gap-3 px-5 py-4', i < activityFeed.length - 1 && 'border-b border-outline-variant/30')}>
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface">{item.text}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.time}</p>
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
            <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Today's Schedule</h2>
            <Card padding="sm">
              {[
                { time: '10:00 AM', event: 'Robotics Club Meeting', loc: 'Bahen 201' },
                { time: '2:00 PM', event: 'Basketball Practice', loc: 'Athletic Centre' },
                { time: '7:00 PM', event: 'Film Screening: Parasite', loc: 'Innis Town Hall' },
              ].map((item, i) => (
                <div key={i} className={clsx('flex gap-3 py-2.5', i < 2 && 'border-b border-outline-variant/20')}>
                  <div className="text-xs font-jakarta font-700 text-primary w-16 flex-shrink-0 mt-0.5">{item.time}</div>
                  <div>
                    <p className="text-sm font-jakarta text-on-surface">{item.event}</p>
                    <p className="text-xs text-on-surface-variant">{item.loc}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {MOCK_EVENTS.filter(e => e.status === 'upcoming').slice(0, 3).map((event) => (
                <Card key={event.id} padding="sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: event.coverGradient }} />
                    <div className="min-w-0">
                      <p className="text-sm font-jakarta font-700 text-on-surface truncate">{event.title}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(event.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommended Clubs */}
          <div>
            <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Recommended</h2>
            <div className="space-y-3">
              {MOCK_CLUBS.slice(4, 7).map((club) => (
                <Card key={club.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: club.coverGradient }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-jakarta font-700 text-on-surface truncate">{club.name}</p>
                      <p className="text-xs text-on-surface-variant">{club.memberCount} members</p>
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
          <h2 className="font-lexend font-800 text-xl text-on-surface">Discover Clubs</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CLUBS.slice(0, 6).map((club) => (
            <Card key={club.id} padding="none" className="overflow-hidden hover:shadow-rise transition-all cursor-pointer">
              <div className="h-24" style={{ background: club.coverGradient }} />
              <div className="p-4">
                <Badge label={club.category} size="sm" variant="neutral" />
                <h3 className="font-lexend font-800 text-base text-on-surface mt-2 mb-1">{club.name}</h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{club.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">{club.memberCount} members</span>
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
          <h2 className="font-lexend font-800 text-xl text-on-surface">Events</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_EVENTS.slice(0, 6).map((event) => (
            <Card key={event.id} padding="none" className="overflow-hidden">
              <div className="h-28 relative" style={{ background: event.coverGradient }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <Badge label={event.status} variant={event.status === 'upcoming' ? 'primary' : event.status === 'live' ? 'secondary' : 'neutral'} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-lexend font-800 text-sm text-on-surface mb-1 line-clamp-1">{event.title}</h3>
                <p className="text-xs text-on-surface-variant mb-1">{event.venueName}</p>
                <p className="text-xs text-on-surface-variant mb-3">{new Date(event.startTime).toLocaleDateString()}</p>
                {event.status === 'upcoming' && (
                  <div className="flex gap-2">
                    {['Going', 'Maybe', 'Skip'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRsvp((r) => ({ ...r, [event.id]: opt }))}
                        className={clsx(
                          'flex-1 py-1.5 rounded-lg text-xs font-jakarta font-700 transition-all',
                          rsvp[event.id] === opt
                            ? opt === 'Going' ? 'bg-tertiary text-white' : opt === 'Maybe' ? 'bg-amber-400 text-white' : 'bg-red-400 text-white'
                            : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest'
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
        <h2 className="font-lexend font-800 text-xl text-on-surface mb-6">Wellness</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sliders */}
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-5">Today's Check-in</h3>
            <div className="space-y-5">
              {[
                { label: 'Mood', value: mood, onChange: setMood, color: '#0047AB' },
                { label: 'Energy', value: energy, onChange: setEnergy, color: '#00A86B' },
              ].map(({ label, value, onChange, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-jakarta font-700 text-on-surface">{label}</span>
                    <span className="text-sm font-jakarta text-on-surface-variant">{value}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                    style={{ accentColor: color }}
                  />
                  <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                    <span>Low</span><span>High</span>
                  </div>
                </div>
              ))}
              <Button variant="primary" className="w-full mt-2">Save Check-in</Button>
            </div>
          </Card>

          {/* Chart */}
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-5">7-Day Wellness Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BFC3D4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4A4E63' }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: '#4A4E63' }} />
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
