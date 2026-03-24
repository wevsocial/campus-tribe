import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Play, ChevronRight, ChevronLeft, Users, Calendar, Activity, BarChart2, Award, Shield } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Student Discovery',
    subtitle: 'Smart matching finds your tribe',
    icon: Users,
    color: '#0047AB',
    description: 'Students take a quick interest survey and our AI instantly surfaces the clubs, events, and activities that match them best. No more endless scrolling -- relevant recommendations, right away.',
    mockup: 'student-discovery',
    highlights: ['AI-powered club matching', 'Interest-based filtering', 'One-tap RSVP and join'],
  },
  {
    id: 2,
    title: 'Event Management',
    subtitle: 'From planning to attendance in minutes',
    icon: Calendar,
    color: '#FF7F50',
    description: 'Club leaders and admins create events with rich details, capacity controls, and venue booking all in one flow. Students RSVP, get reminders, and check in with a QR code.',
    mockup: 'event-management',
    highlights: ['Integrated venue booking', 'QR code check-in', 'Automated reminders'],
  },
  {
    id: 3,
    title: 'Attendance and Grades',
    subtitle: 'Teachers save 3 hours per week',
    icon: Activity,
    color: '#00A86B',
    description: 'Teachers mark attendance in seconds with a single tap per student. Grades sync with the GPA calculator. Parents get instant alerts when a student is absent.',
    mockup: 'attendance',
    highlights: ['One-tap attendance marking', 'Parent instant alerts', 'GPA auto-calculation'],
  },
  {
    id: 4,
    title: 'Analytics Dashboard',
    subtitle: 'Data that drives better decisions',
    icon: BarChart2,
    color: '#7B2D8B',
    description: 'Deans and admins see engagement trends, club growth, enrollment numbers, and at-risk student flags -- all in a visual dashboard that updates in real time.',
    mockup: 'analytics',
    highlights: ['Real-time engagement metrics', 'At-risk student detection', 'Exportable reports'],
  },
  {
    id: 5,
    title: 'Leaderboards and Rewards',
    subtitle: 'Recognition that motivates',
    icon: Award,
    color: '#E65100',
    description: 'Students earn points for attending events, joining clubs, and maintaining wellness streaks. Public leaderboards and achievement badges create healthy, fun competition across campus.',
    mockup: 'leaderboard',
    highlights: ['Engagement point system', 'Custom badge creation', 'Institution-wide leaderboards'],
  },
  {
    id: 6,
    title: 'Security and IT Control',
    subtitle: 'Enterprise-grade from day one',
    icon: Shield,
    color: '#1565C0',
    description: 'IT admins control RBAC permissions, manage SSO integration (Google, Microsoft, SAML), audit all system actions, and generate API keys for custom integrations.',
    mockup: 'security',
    highlights: ['SAML / SSO integration', 'Full audit logging', 'RBAC permission matrix'],
  },
];

const MockupContent: React.FC<{ mockup: string; color: string }> = ({ mockup, color }) => {
  const mockups: Record<string, React.ReactNode> = {
    'student-discovery': (
      <div className="space-y-3">
        <div className="text-sm text-gray-500 mb-4">Recommended for Alex Kim based on interests</div>
        {[
          { name: 'Robotics Club', match: '98% match', members: 67, tag: 'STEM' },
          { name: 'Photography Society', match: '94% match', members: 142, tag: 'Arts' },
          { name: 'Basketball League', match: '91% match', members: 89, tag: 'Sports' },
        ].map((club) => (
          <div key={club.name} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl" style={{ background: color + '20' }} />
              <div>
                <div className="font-medium text-gray-900 text-sm">{club.name}</div>
                <div className="text-xs text-gray-400">{club.members} members</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{club.match}</span>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-full text-white" style={{ background: color }}>Join</button>
            </div>
          </div>
        ))}
      </div>
    ),
    'event-management': (
      <div className="space-y-3">
        {[
          { title: 'Photography Exhibition', date: 'Apr 3, 2:00 PM', rsvp: 47, cap: 60, status: 'Open' },
          { title: 'Robotics Demo Night', date: 'Apr 7, 6:00 PM', rsvp: 55, cap: 60, status: 'Almost Full' },
          { title: 'Campus Sustainability Fair', date: 'Apr 12, 10:00 AM', rsvp: 23, cap: 200, status: 'Open' },
        ].map((e) => (
          <div key={e.title} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900 text-sm">{e.title}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{e.status}</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">{e.date}</div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${(e.rsvp / e.cap) * 100}%`, background: color }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">{e.rsvp} / {e.cap} RSVPs</div>
          </div>
        ))}
      </div>
    ),
    'attendance': (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Present', value: 28, color: '#00A86B' },
            { label: 'Absent', value: 2, color: '#EF4444' },
            { label: 'Late', value: 1, color: '#F59E0B' },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: s.color + '15' }}>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        {[
          { name: 'Alex Kim', status: 'present' },
          { name: 'Sarah Chen', status: 'late' },
          { name: 'Marcus Thorne', status: 'absent' },
          { name: 'Priya Sharma', status: 'present' },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">{s.name[0]}</div>
              <span className="text-sm font-medium text-gray-800">{s.name}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              s.status === 'present' ? 'bg-green-100 text-green-700' :
              s.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>{s.status}</span>
          </div>
        ))}
      </div>
    ),
    'analytics': (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Active Students', value: '2,847', change: '+12%' },
            { label: 'Club Participation', value: '78%', change: '+5%' },
            { label: 'Event RSVPs', value: '1,204', change: '+23%' },
            { label: 'Wellness Score', value: '8.2/10', change: '+0.4' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="text-xl font-bold text-gray-900">{m.value}</div>
              <div className="text-xs text-gray-400">{m.label}</div>
              <div className="text-xs text-green-600 font-medium mt-1">{m.change} this month</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-2">Engagement Trend (Last 7 Days)</div>
          <div className="flex items-end gap-1 h-16">
            {[40, 55, 48, 70, 62, 80, 75].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: color }} />
            ))}
          </div>
        </div>
      </div>
    ),
    'leaderboard': (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-600 mb-2">Top Engaged Students -- March 2026</div>
        {[
          { rank: 1, name: 'Elias Vance', points: 2840, badge: '🥇', avatar: 'E' },
          { rank: 2, name: 'Priya Sharma', points: 2650, badge: '🥈', avatar: 'P' },
          { rank: 3, name: 'Sarah Chen', points: 2420, badge: '🥉', avatar: 'S' },
          { rank: 4, name: 'Marcus Thorne', points: 2110, badge: '⭐', avatar: 'M' },
          { rank: 5, name: 'Alex Kim', points: 1980, badge: '⭐', avatar: 'A' },
        ].map((s) => (
          <div key={s.rank} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-100">
            <span className="text-lg">{s.badge}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: color }}>{s.avatar}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{s.name}</div>
            </div>
            <div className="text-sm font-bold" style={{ color }}>{s.points.toLocaleString()} pts</div>
          </div>
        ))}
      </div>
    ),
    'security': (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Users', value: '4,291', icon: '👤' },
            { label: 'Roles', value: '8', icon: '🔑' },
            { label: 'Audit Logs', value: '12,847', icon: '📋' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <div className="text-xl">{s.icon}</div>
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-3">Recent Audit Events</div>
          <div className="space-y-2">
            {[
              { action: 'User login', user: 'admin@demo.com', time: '2m ago', type: 'info' },
              { action: 'Role updated', user: 'it@demo.com', time: '15m ago', type: 'warning' },
              { action: 'API key generated', user: 'dev@demo.com', time: '1h ago', type: 'info' },
            ].map((log) => (
              <div key={log.action} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{log.action}</span>
                <span className="text-gray-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };
  return <>{mockups[mockup] || null}</>;
};

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <div className="min-h-screen bg-[#f6f6f9]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Play size={14} />
            Interactive Demo
          </div>
          <h1 className="font-lexend font-extrabold text-5xl text-gray-900 mb-4">See Campus Tribe in Action</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Walk through the key features that 500,000+ students, teachers, and admins use every day. No signup required.</p>
        </div>
      </section>

      {/* Step tabs */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Tab nav */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeStep === i ? 'text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
                style={activeStep === i ? { background: s.color } : {}}
              >
                <s.icon size={14} />
                {s.title}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: info */}
            <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-sm">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: step.color + '15' }}>
                <step.icon size={24} style={{ color: step.color }} />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: step.color }}>Step {step.id} of {steps.length}</div>
              <h2 className="font-lexend font-extrabold text-3xl text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-500 text-sm mb-4">{step.subtitle}</p>
              <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>
              <div className="space-y-2">
                {step.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: step.color }}>
                      <ChevronRight size={12} className="text-white" />
                    </div>
                    {h}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors"
                    style={{ background: step.color }}
                  >
                    Next Feature <ChevronRight size={16} />
                  </button>
                ) : (
                  <Link to="/register">
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: step.color }}>
                      Get Started Free <ChevronRight size={16} />
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: mockup */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-black/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 bg-white rounded-full px-3 py-1 text-xs text-gray-400 ml-2">campus-tribe.app</div>
              </div>
              <MockupContent mockup={step.mockup} color={step.color} />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-gradient-to-br from-[#0047AB] to-[#2056ba] rounded-2xl p-10 text-white">
            <h3 className="font-lexend font-extrabold text-3xl mb-3">Ready to Transform Your Campus?</h3>
            <p className="text-white/80 text-lg mb-6">Join 500+ institutions already using Campus Tribe.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <button className="bg-white text-[#0047AB] font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors">
                  Start Free Trial
                </button>
              </Link>
              <Link to="/pricing">
                <button className="border border-white/40 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
                  View Pricing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
