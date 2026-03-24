import { useState } from 'react'
import { Users, Calendar, Trophy, Heart, Bell, Search, Filter, Star, MapPin, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const mockClubs = [
  { id: '1', name: 'Photography Club', category: 'Arts', members: 89, activity: 'High', joined: true },
  { id: '2', name: 'Robotics Team', category: 'Engineering', members: 45, activity: 'High', joined: false },
  { id: '3', name: 'Debate Society', category: 'Academic', members: 120, activity: 'Medium', joined: true },
  { id: '4', name: 'Soccer Intramurals', category: 'Sports', members: 200, activity: 'High', joined: false },
  { id: '5', name: 'Coding Bootcamp', category: 'Tech', members: 67, activity: 'Medium', joined: false },
  { id: '6', name: 'Environmental Club', category: 'Activism', members: 55, activity: 'Low', joined: false },
]

const mockEvents = [
  { id: '1', title: 'Spring Welcome Festival', date: 'Mar 25', time: '3:00 PM', location: 'Main Quad', rsvp: true },
  { id: '2', title: 'Robotics Demo Day', date: 'Mar 27', time: '1:00 PM', location: 'Engineering Hall', rsvp: false },
  { id: '3', title: 'Intramural Soccer Finals', date: 'Mar 30', time: '5:00 PM', location: 'Sports Field B', rsvp: false },
  { id: '4', title: 'Mental Health Awareness Week', date: 'Apr 1', time: 'All Day', location: 'Student Center', rsvp: true },
]

const moods = [
  { value: 1, emoji: '😢', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'OK' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Great' },
]

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [clubs, setClubs] = useState(mockClubs)

  const categories = ['All', ...Array.from(new Set(mockClubs.map(c => c.category)))]
  const filteredClubs = clubs.filter(c =>
    (categoryFilter === 'All' || c.category === categoryFilter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleJoin = (id: string) => {
    setClubs(prev => prev.map(c => c.id === id ? { ...c, joined: !c.joined } : c))
  }

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-900 text-2xl text-on-surface">
            Hey {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-on-surface-variant text-sm">Here's what's happening on campus today.</p>
        </div>
        <button className="relative p-2 rounded-lg bg-surface hover:bg-surface/80 transition-colors">
          <Bell size={20} className="text-on-surface-variant" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Clubs Joined', value: clubs.filter(c => c.joined).length, icon: <Users size={18} />, color: 'text-primary bg-primary/10' },
          { label: 'Events Attended', value: 7, icon: <Calendar size={18} />, color: 'text-tertiary bg-tertiary/10' },
          { label: 'Sports Played', value: 2, icon: <Trophy size={18} />, color: 'text-secondary bg-secondary/10' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <div className="font-headline font-900 text-2xl text-on-surface">{s.value}</div>
              <div className="text-on-surface-variant text-xs font-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Club Directory */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-800 text-lg text-on-surface">Club Directory</h2>
              <span className="text-xs text-on-surface-variant font-label">{filteredClubs.length} clubs</span>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search clubs..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-surface rounded-lg focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`text-xs px-3 py-1 rounded-full font-label font-bold transition-all
                    ${categoryFilter === cat ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant hover:bg-primary/10'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {filteredClubs.map(club => (
                <div key={club.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-hero-gradient flex items-center justify-center text-white font-label font-bold text-sm">
                      {club.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-label font-bold text-sm text-on-surface">{club.name}</div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span>{club.category}</span>
                        <span>·</span>
                        <Users size={10} />
                        <span>{club.members}</span>
                        <span>·</span>
                        <span className={`font-bold ${club.activity === 'High' ? 'text-tertiary' : club.activity === 'Medium' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          {club.activity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => toggleJoin(club.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-label font-bold transition-all
                      ${club.joined ? 'bg-tertiary/10 text-tertiary' : 'bg-primary text-white hover:bg-primary/90'}`}>
                    {club.joined ? 'Joined ✓' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Upcoming Events */}
          <div className="card">
            <h2 className="font-headline font-800 text-base text-on-surface mb-4">Upcoming Events</h2>
            <div className="flex flex-col gap-3">
              {mockEvents.map(ev => (
                <div key={ev.id} className="p-3 bg-surface rounded-lg">
                  <div className="font-label font-bold text-sm text-on-surface mb-1">{ev.title}</div>
                  <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1"><Calendar size={10} />{ev.date} at {ev.time}</div>
                    <div className="flex items-center gap-1"><MapPin size={10} />{ev.location}</div>
                  </div>
                  <button className={`mt-2 text-xs px-2 py-1 rounded-full font-label font-bold transition-all
                    ${ev.rsvp ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                    {ev.rsvp ? 'Going ✓' : 'RSVP'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Wellness Check-in */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-secondary" />
              <h2 className="font-headline font-800 text-base text-on-surface">How are you today?</h2>
            </div>
            <div className="flex justify-between">
              {moods.map(m => (
                <button key={m.value} onClick={() => setSelectedMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                    ${selectedMood === m.value ? 'bg-secondary/10 scale-110' : 'hover:bg-surface'}`}>
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] text-on-surface-variant font-label">{m.label}</span>
                </button>
              ))}
            </div>
            {selectedMood && (
              <div className="mt-3 p-2 bg-tertiary/10 rounded-lg text-xs text-tertiary font-label font-bold text-center">
                Check-in recorded! 💚
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
