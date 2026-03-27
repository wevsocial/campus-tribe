import { Link } from 'react-router-dom';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';

const IMAGES = {
  hero: '/assets/campus-hero.jpg',
  aerial: '/assets/campus-aerial.jpg',
  students: '/assets/campus-students.jpg',
  sports: '/assets/campus-sports.jpg',
  library: '/assets/campus-library.jpg',
  events: '/assets/campus-events.jpg',
  clubs: '/assets/campus-clubs.jpg',
  wellbeing: '/assets/campus-wellbeing.jpg',
  venues: '/assets/campus-venues.jpg',
  teachers: '/assets/campus-teachers.jpg',
  admin: '/assets/campus-admin.jpg',
  matching: '/assets/campus-matching.jpg',
  surveys: '/assets/campus-surveys.jpg',
};

const STATS_CRISIS = [
  { value: '60%', label: 'Students feel chronically lonely' },
  { value: '7hrs+', label: 'Daily avg social media use (Gen Z)' },
  { value: '1 in 4', label: 'Students leave before graduating' },
  { value: '$16B', label: 'Lost annually to student dropouts' },
];

const MODULES = [
  { title: 'Student Discovery Hub', desc: 'Smart peer matching by interests, goals, and personality. Replace the scroll with real connection.', icon: '🔍', img: IMAGES.matching, color: '#0047AB' },
  { title: 'Club & Organization OS', desc: 'Full lifecycle management — recognition, elections, posts, leadership handoff. All in one place.', icon: '🎭', img: IMAGES.clubs, color: '#7C3AED' },
  { title: 'Intramural Sports Platform', desc: 'Leagues, brackets, challenges, scoreboards. The full competitive experience for every sport.', icon: '🏆', img: IMAGES.sports, color: '#FF7F50' },
  { title: 'Admin Operating System', desc: 'AI insights, at-risk detection, survey analytics, multi-campus management. Data that drives outcomes.', icon: '📊', img: IMAGES.admin, color: '#00A86B' },
  { title: 'Venue & Facility Booking', desc: 'Self-serve bookings with conflict detection. No more 3-day email chains for a study room.', icon: '🏛', img: IMAGES.venues, color: '#0047AB' },
];

const ROLES = [
  { title: 'Students', img: IMAGES.students, desc: 'Discover your tribe. Join clubs, track wellness, RSVP to events.' },
  { title: 'Admins & Teachers', img: IMAGES.teachers, desc: 'Run your campus OS. Manage everything from one intelligent dashboard.' },
  { title: 'Coaches', img: IMAGES.sports, desc: 'Coordinate teams, run tournaments, track athlete performance.' },
  { title: 'Parents', img: IMAGES.wellbeing, desc: 'Stay connected to your student\'s campus life. Wellbeing at a glance.' },
];

export default function LandingPage() {
  return (
    <div className="bg-[#F6F6F9] text-[#2D2F31]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0047AB 0%, #1a5fc4 60%, #2066d4 100%)' }}>
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src={IMAGES.aerial} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,71,171,0.95) 0%, rgba(26,95,196,0.85) 60%, rgba(32,102,212,0.75) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,127,80,0.2)', border: '1px solid rgba(255,127,80,0.4)' }}>
              <span className="w-2 h-2 rounded-full bg-[#FF7F50] animate-pulse" />
              <span className="text-[#FF7F50] text-sm font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Built for Gen Z · Now in 8+ Countries</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.02]" style={{ fontFamily: 'Lexend, sans-serif', letterSpacing: '-0.02em' }}>
              Rebuild<br />the Village.
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
              Campus Tribe replaces hollow scrolling with real belonging — events, clubs, sports, wellbeing, and peer connection. All unified.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/demo" className="px-8 py-4 rounded-full font-black text-white text-lg transition-all hover:scale-105" style={{ background: '#FF7F50', boxShadow: '0 20px 50px rgba(255,127,80,0.5)', fontFamily: 'Lexend, sans-serif' }}>
                Book a Demo
              </Link>
              <Link to="/login" className="px-8 py-4 rounded-full font-black text-lg transition-all hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', fontFamily: 'Lexend, sans-serif' }}>
                Sign In →
              </Link>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { v: '19.9M', l: 'Students' },
                { v: '500+', l: 'Institutions' },
                { v: '8+', l: 'Countries' },
              ].map(s => (
                <div key={s.l}>
                  <div className="text-3xl font-black text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>{s.v}</div>
                  <div className="text-blue-200 text-sm mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: 520 }}>
              <img src={IMAGES.hero} alt="Campus students connecting" className="w-full h-full object-cover" />
              {/* Floating cards */}
              <div className="absolute top-6 right-6 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-black">✓</div>
                <div>
                  <div className="text-sm font-black text-gray-800">RSVP Confirmed</div>
                  <div className="text-xs text-gray-500">Spring Sports Meet</div>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="text-sm font-black text-gray-800">New Tournament</div>
                  <div className="text-xs text-gray-500">+248 students joined</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CRISIS STATS ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#2D2F31] mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>
              The Crisis We're Solving
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Institutions can no longer rely on mass email blasts or disjointed campus systems. Students need a platform as engaging as TikTok — but rooted in real relationships.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_CRISIS.map(s => (
              <div key={s.label} className="text-center p-6 rounded-3xl" style={{ background: 'rgba(0,71,171,0.04)', border: '2px solid rgba(0,71,171,0.1)' }}>
                <div className="text-4xl font-black text-[#0047AB] mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>{s.value}</div>
                <div className="text-sm text-gray-600 font-semibold leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 MODULES ────────────────────────────────────── */}
      <section className="py-20 bg-[#F6F6F9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#0047AB]/10 text-[#0047AB] text-sm font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>5 INTEGRATED MODULES</div>
            <h2 className="text-4xl font-black text-[#2D2F31]" style={{ fontFamily: 'Lexend, sans-serif' }}>
              One Platform. Every Need.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((m, i) => (
              <div key={m.title} className={`relative rounded-3xl overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1 ${i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`} style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                <div className="relative h-48 overflow-hidden">
                  <img src={m.img} alt={m.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${m.color}cc 0%, transparent 60%)` }} />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: m.color }}>
                    {m.icon}
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-black text-[#2D2F31] text-lg mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#2D2F31]" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Built for Everyone on Campus
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map(r => (
              <div key={r.title} className="rounded-3xl overflow-hidden group cursor-pointer transition-all hover:-translate-y-1" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
                <div className="h-40 overflow-hidden">
                  <img src={r.img} alt={r.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-black text-[#2D2F31] mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>{r.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ──────────────────────────────────── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0047AB 0%, #1a5fc4 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-5xl mb-8">💬</div>
          <blockquote className="text-2xl lg:text-3xl font-black text-white leading-relaxed mb-8" style={{ fontFamily: 'Lexend, sans-serif' }}>
            "With 60% of students feeling lonely, institutions can no longer rely on mass email blasts or disjointed campus systems. The next decade demands a platform as engaging as TikTok but rooted in real human relationships."
          </blockquote>
          <cite className="text-blue-200 text-sm font-semibold">— Modern Campus Student Engagement Strategies, 2025</cite>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="py-20 bg-[#F6F6F9]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#2D2F31]" style={{ fontFamily: 'Lexend, sans-serif' }}>Simple, Transparent Pricing</h2>
            <p className="text-gray-500 mt-3">Per-student pricing. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { name: 'Campus', price: '$0.75', unit: '/student/mo', color: '#0047AB', features: ['Events & RSVPs', 'Clubs & Sports', 'Venue Booking', 'Wellbeing Tracking', 'Surveys & Polls', 'Student Discovery'], badge: null },
              { name: 'University', price: '$1.25', unit: '/student/mo', color: '#7C3AED', features: ['Everything in Campus', 'Multi-Campus Management', 'AI Insights Engine', 'SSO & LMS Integration', 'Dedicated CSM', 'SLA Guarantee', 'Analytics Connectors'], badge: 'MOST POPULAR' },
            ].map(p => (
              <div key={p.name} className="rounded-3xl p-8 bg-white" style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.08)`, border: p.badge ? `2px solid ${p.color}` : 'none' }}>
                {p.badge && <div className="text-xs font-black px-3 py-1 rounded-full text-white mb-4 inline-block" style={{ background: p.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.badge}</div>}
                <h3 className="text-2xl font-black text-[#2D2F31] mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black" style={{ color: p.color, fontFamily: 'Lexend, sans-serif' }}>{p.price}</span>
                  <span className="text-gray-500 text-sm">{p.unit}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span style={{ color: p.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/demo" className="block text-center py-3 rounded-full font-black text-white transition-all hover:opacity-90" style={{ background: p.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 bg-[#2D2F31]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-white mb-6" style={{ fontFamily: 'Lexend, sans-serif' }}>Start Building Your Tribe</h2>
          <p className="text-xl text-gray-300 mb-10">Join 500+ institutions turning campus loneliness into lifelong friendships.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/demo" className="px-10 py-4 rounded-full font-black text-lg text-white transition-all hover:scale-105" style={{ background: '#FF7F50', boxShadow: '0 20px 50px rgba(255,127,80,0.4)', fontFamily: 'Lexend, sans-serif' }}>
              Book a Free Demo
            </Link>
            <Link to="/pricing" className="px-10 py-4 rounded-full font-black text-lg text-gray-300 transition-all hover:text-white hover:bg-white/10" style={{ border: '2px solid rgba(255,255,255,0.2)', fontFamily: 'Lexend, sans-serif' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
