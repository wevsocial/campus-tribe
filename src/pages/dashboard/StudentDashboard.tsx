import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_CLUBS, MOCK_EVENTS, MOCK_WELLNESS, MOCK_PEERS, MOCK_CLUB_POSTS } from '../../lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = [
  { id: 'home', label: '🏠 Home' },
  { id: 'events', label: '📅 Events' },
  { id: 'clubs', label: '🎭 Clubs' },
  { id: 'sports', label: '🏆 Sports' },
  { id: 'venues', label: '🏛 Venues' },
  { id: 'discover', label: '🔍 Discover Peers' },
  { id: 'feed', label: '📰 Club Feed' },
  { id: 'wellbeing', label: '💚 Wellbeing' },
  { id: 'journey', label: '🗺 My Journey' },
];

const MOCK_VENUES = [
  { id: 'v-1', name: 'Main Auditorium', capacity: 800, location: 'Building A', available: true, img: '/assets/campus-venues.jpg' },
  { id: 'v-2', name: 'Library Study Room 3', capacity: 12, location: 'Library', available: true, img: '/assets/campus-library.jpg' },
  { id: 'v-3', name: 'Athletic Centre Court B', capacity: 200, location: 'Athletic Centre', available: false, img: '/assets/campus-sports.jpg' },
  { id: 'v-4', name: 'Innovation Hub', capacity: 50, location: 'Tech Building', available: true, img: '/assets/campus-admin.jpg' },
];

const MOCK_SPORTS = [
  { id: 'sp-1', name: 'Basketball — Dunk Collective', sport: 'Basketball', members: 12, record: '8-2', rank: 1 },
  { id: 'sp-2', name: 'Soccer — Blue Wolves', sport: 'Soccer', members: 18, record: '6-4', rank: 3 },
  { id: 'sp-3', name: 'Badminton Club', sport: 'Badminton', members: 8, record: '5-3', rank: 2 },
  { id: 'sp-4', name: 'Tennis Squad', sport: 'Tennis', members: 6, record: '7-1', rank: 1 },
];

const JOURNEY = [
  { year: '2020–2022', inst: 'Riverside High School', type: 'High School', degree: 'Ontario Secondary School Diploma', status: 'completed' },
  { year: '2022–Present', inst: 'University of Toronto', type: 'University', degree: 'B.Sc. Computer Science', status: 'current' },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('home');
  const [mood, setMood] = useState<number | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set(['evt-1']));
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set(['club-1', 'club-3']));
  const [joinedSports, setJoinedSports] = useState<Set<string>>(new Set(['sp-1']));
  const [connections, setConnections] = useState<Set<string>>(new Set());
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const [bookingVenue, setBookingVenue] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const chartData = MOCK_WELLNESS.map(w => ({ date: w.date.slice(5), mood: w.mood, energy: w.energy }));

  const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

  const renderHome = () => (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden" style={{ height: 220 }}>
        <img src="/assets/campus-hero.jpg" alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,71,171,0.92) 0%, rgba(0,71,171,0.7) 60%, transparent 100%)' }} />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <p className="text-blue-200 text-sm mb-1">{greeting}</p>
          <h1 className="font-bold text-3xl text-white mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
            {user?.name?.split(' ')[0] || 'Alex'} 👋
          </h1>
          <p className="text-blue-100 text-sm">Here's what's happening on campus today.</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            {[{ label: `${joinedClubs.size} Clubs`, icon: '🎭' }, { label: `${rsvps.size} RSVPs`, icon: '📅' }, { label: '5-day streak', icon: '🔥' }].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold">
                <span>{s.icon}</span><span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Clubs" value={joinedClubs.size} color="primary" />
        <StatCard label="RSVPs" value={rsvps.size} color="secondary" />
        <StatCard label="Connections" value={connections.size} color="tertiary" />
        <StatCard label="Wellbeing Streak" value="5d" color="primary" />
      </div>

      {/* Mood check-in */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>How are you feeling today?</h3>
        {moodSaved ? (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <span className="text-2xl">✅</span> Thanks for checking in! Your wellbeing matters.
          </div>
        ) : (
          <div className="flex gap-4">
            {MOODS.map((emoji, i) => (
              <button key={i} onClick={() => { setMood(i + 1); setMoodSaved(true); }}
                className={`text-3xl transition-all hover:scale-125 ${mood === i + 1 ? 'scale-125' : ''}`}>
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3" style={{ fontFamily: 'Lexend, sans-serif' }}>Upcoming Events</h3>
        <div className="space-y-3">
          {MOCK_EVENTS.slice(0, 4).map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl p-4 flex items-center justify-between" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0047AB]/10 flex flex-col items-center justify-center text-[#0047AB] font-bold text-xs">
                  <span>{new Date(ev.startTime).toLocaleDateString('en', { month: 'short' })}</span>
                  <span className="text-lg leading-none">{new Date(ev.startTime).getDate()}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{ev.title}</div>
                  <div className="text-xs text-gray-500">{ev.venueName || ""} · {ev.category}</div>
                </div>
              </div>
              <button onClick={() => setRsvps(prev => { const s = new Set(prev); s.has(ev.id) ? s.delete(ev.id) : s.add(ev.id); return s; })}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${rsvps.has(ev.id) ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-[#0047AB]/10'}`}>
                {rsvps.has(ev.id) ? '✓ Going' : 'RSVP'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden mb-2" style={{ height: 180 }}>
        <img src="/assets/campus-events.jpg" alt="Events" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047AB]/80 to-transparent flex items-center px-8">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>Campus Events</h2>
        </div>
      </div>
      {MOCK_EVENTS.map(ev => (
        <div key={ev.id} className="bg-white rounded-2xl p-5 flex items-start justify-between gap-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="flex gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl bg-[#0047AB]/10 flex flex-col items-center justify-center text-[#0047AB] font-bold flex-shrink-0">
              <span className="text-xs">{new Date(ev.startTime).toLocaleDateString('en', { month: 'short' })}</span>
              <span className="text-xl leading-tight">{new Date(ev.startTime).getDate()}</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800 mb-1">{ev.title}</div>
              <div className="text-sm text-gray-500 mb-2">{ev.venueName || ""}</div>
              <div className="flex gap-2 flex-wrap">
                <Badge label={ev.category} variant="primary" />
                {ev.rsvpCount ? <Badge label={`${ev.rsvpCount} going`} variant="neutral" /> : null}
              </div>
            </div>
          </div>
          <button onClick={() => setRsvps(prev => { const s = new Set(prev); s.has(ev.id) ? s.delete(ev.id) : s.add(ev.id); return s; })}
            className={`text-sm font-bold px-5 py-2 rounded-full transition-all whitespace-nowrap ${rsvps.has(ev.id) ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-[#0047AB] hover:text-white'}`}>
            {rsvps.has(ev.id) ? '✓ Going' : 'RSVP'}
          </button>
        </div>
      ))}
    </div>
  );

  const renderClubs = () => (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden mb-2" style={{ height: 160 }}>
        <img src="/assets/campus-clubs.jpg" alt="Clubs" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/80 to-transparent flex items-center px-8">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>Clubs & Organizations</h2>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_CLUBS.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-bold text-gray-800 mb-1">{c.name}</div>
                <div className="text-xs text-gray-500">{c.category} · {c.memberCount} members</div>
              </div>
              <button onClick={() => setJoinedClubs(prev => { const s = new Set(prev); s.has(c.id) ? s.delete(c.id) : s.add(c.id); return s; })}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${joinedClubs.has(c.id) ? 'bg-red-50 text-red-500' : 'bg-[#0047AB]/10 text-[#0047AB] hover:bg-[#0047AB] hover:text-white'}`}>
                {joinedClubs.has(c.id) ? 'Leave' : 'Join'}
              </button>
            </div>
            {c.description && <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>}
            {(c as any).nextMeeting && <div className="mt-2 text-xs text-[#0047AB] font-semibold">📅 Next: {(c as any).nextMeeting}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSports = () => (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden mb-2" style={{ height: 160 }}>
        <img src="/assets/campus-sports.jpg" alt="Sports" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF7F50]/80 to-transparent flex items-center px-8">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>Intramural Sports</h2>
        </div>
      </div>
      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>🥇 Leaderboard</h3>
        <div className="space-y-2">
          {MOCK_SPORTS.sort((a,b) => a.rank - b.rank).map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
              <span className={`text-sm font-black w-6 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                <div className="text-xs text-gray-500">{t.sport} · {t.members} members</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#00A86B]">{t.record}</div>
                <button onClick={() => setJoinedSports(prev => { const s = new Set(prev); s.has(t.id) ? s.delete(t.id) : s.add(t.id); return s; })}
                  className={`text-xs font-bold px-3 py-1 rounded-full mt-1 ${joinedSports.has(t.id) ? 'bg-red-50 text-red-500' : 'bg-[#0047AB]/10 text-[#0047AB]'}`}>
                  {joinedSports.has(t.id) ? 'Leave' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVenues = () => (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden mb-2" style={{ height: 160 }}>
        <img src="/assets/campus-venues.jpg" alt="Venues" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047AB]/80 to-transparent flex items-center px-8">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>Venue Booking</h2>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_VENUES.map(v => (
          <div key={v.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="h-32 overflow-hidden">
              <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-bold text-gray-800">{v.name}</div>
                  <div className="text-xs text-gray-500">📍 {v.location} · 👥 {v.capacity}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {v.available ? '● Available' : '✗ Booked'}
                </span>
              </div>
              {bookingVenue === v.id ? (
                <div className="space-y-2">
                  <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="Purpose (e.g. Study group)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => setBookingVenue(null)} className="flex-1 bg-[#0047AB] text-white rounded-lg py-2 text-sm font-bold">Confirm</button>
                    <button onClick={() => setBookingVenue(null)} className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <button disabled={!v.available} onClick={() => setBookingVenue(v.id)}
                  className={`w-full mt-2 py-2 rounded-lg text-sm font-bold transition-all ${v.available ? 'bg-[#0047AB] text-white hover:bg-blue-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  {v.available ? 'Book Now' : 'Unavailable'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDiscover = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>Discover Peers</h2>
        <p className="text-gray-500 text-sm">Find study buddies, teammates, and friends on campus</p>
      </div>
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[['all','All'],['study_buddy','📚 Study Buddy'],['teammate','🏅 Teammate'],['friend','👋 Friend'],['mentor','🎓 Mentor']].map(([val,label]) => (
          <button key={val} className="text-xs font-bold px-4 py-2 rounded-full bg-[#0047AB]/10 text-[#0047AB] hover:bg-[#0047AB] hover:text-white transition-all">{label}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PEERS.map(p => (
          <div key={p.id} className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0" style={{ background: p.avatarColor }}>
                {p.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-500">{p.major} · Year {p.year}</div>
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1" style={{ background: '#FF7F50/20', color: '#FF7F50', backgroundColor: 'rgba(255,127,80,0.15)' }}>
                  {p.lookingFor.replace('_',' ')}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {p.interests.map(i => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#0047AB]/8 text-[#0047AB]" style={{ backgroundColor: 'rgba(0,71,171,0.08)' }}>{i}</span>
              ))}
            </div>
            <button onClick={() => setConnections(prev => { const s = new Set(prev); s.has(p.id) ? s.delete(p.id) : s.add(p.id); return s; })}
              className={`w-full py-2 rounded-full text-sm font-bold transition-all ${connections.has(p.id) ? 'bg-green-100 text-green-700' : 'bg-[#0047AB] text-white hover:bg-blue-800'}`}>
              {connections.has(p.id) ? '✅ Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeed = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-gray-800 mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>Club Feed</h2>
        <p className="text-gray-500 text-sm">Updates from your clubs</p>
      </div>
      {MOCK_CLUB_POSTS.map(post => {
        const typeColor: Record<string,string> = { achievement: 'bg-yellow-100 text-yellow-700', event: 'bg-blue-100 text-[#0047AB]', update: 'bg-gray-100 text-gray-600' };
        return (
          <div key={post.id} className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0047AB]/10 flex items-center justify-center text-[#0047AB] font-black flex-shrink-0">
                {post.author[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-800 text-sm">{post.author}</span>
                  <span className="text-gray-400 text-xs">in</span>
                  <span className="font-bold text-[#0047AB] text-sm">{post.clubName}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor[post.type]}`}>{post.type}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{post.time}</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.content}</p>
            <button onClick={() => setPostLikes(prev => ({ ...prev, [post.id]: (prev[post.id] ?? post.likes) + 1 }))}
              className="text-sm text-gray-400 hover:text-[#FF7F50] transition-colors font-semibold">
              ❤️ {postLikes[post.id] ?? post.likes}
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderWellbeing = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>How are you feeling today?</h3>
        {moodSaved ? (
          <p className="text-green-600 font-semibold">✅ Thanks for checking in! Keep going.</p>
        ) : (
          <div className="flex gap-4">{MOODS.map((e,i) => <button key={i} onClick={() => { setMood(i+1); setMoodSaved(true); }} className="text-4xl hover:scale-125 transition-transform">{e}</button>)}</div>
        )}
      </div>
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>7-Day Mood & Energy Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[1,5]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#0047AB" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
            <Line type="monotone" dataKey="energy" stroke="#FF7F50" strokeWidth={2} dot={{ r: 3 }} name="Energy" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Avg Mood', value: '4.1/5', icon: '😊' },{ label: 'Check-in Streak', value: '5 days', icon: '🔥' },{ label: 'Resources Used', value: '3', icon: '📚' }].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-black text-gray-800 text-lg" style={{ fontFamily: 'Lexend, sans-serif' }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJourney = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>My Education Journey</h2>
        <p className="text-gray-500 text-sm">Your academic story — from first school to graduation and beyond</p>
      </div>
      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0047AB] to-[#00A86B]" />
        <div className="space-y-6">
          {JOURNEY.map((j,i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${j.status === 'current' ? 'bg-[#0047AB] border-[#0047AB] shadow-lg shadow-blue-300' : 'bg-white border-gray-300'}`} />
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-gray-800" style={{ fontFamily: 'Lexend, sans-serif' }}>{j.inst}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{j.degree}</div>
                    <div className="text-xs text-gray-400 mt-1">{j.year} · {j.type}</div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${j.status === 'current' ? 'bg-[#0047AB]/10 text-[#0047AB]' : 'bg-gray-100 text-gray-500'}`}>
                    {j.status === 'current' ? '● Current' : '✓ Completed'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="relative">
            <div className="absolute -left-5 w-4 h-4 rounded-full bg-gradient-to-br from-[#0047AB] to-[#00A86B] opacity-40" />
            <p className="text-gray-400 italic text-sm pl-2 pt-1">Your story continues…</p>
          </div>
        </div>
      </div>
      <div className="bg-[#0047AB]/5 rounded-2xl p-5 border border-[#0047AB]/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <div className="font-bold text-gray-800 text-sm">Portable Profile</div>
            <p className="text-xs text-gray-500 mt-0.5">Your profile, clubs, sports records and achievements travel with you to every institution in the Campus Tribe network.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const sections: Record<string, () => React.ReactNode> = {
    home: renderHome,
    events: renderEvents,
    clubs: renderClubs,
    sports: renderSports,
    venues: renderVenues,
    discover: renderDiscover,
    feed: renderFeed,
    wellbeing: renderWellbeing,
    journey: renderJourney,
  };

  return (
    <DashboardLayout>
      {/* Tab nav */}
      <div className="flex gap-1 flex-wrap mb-6 pb-4 border-b border-gray-100 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all ${tab === t.id ? 'bg-[#0047AB] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {t.label}
          </button>
        ))}
      </div>
      {sections[tab]?.() ?? null}
    </DashboardLayout>
  );
}
