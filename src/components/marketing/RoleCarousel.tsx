import React from 'react';
import { GraduationCap, Trophy, Target, BookOpen, Monitor, Users } from 'lucide-react';

const roles = [
  {
    role: 'Student',
    Icon: GraduationCap,
    headline: 'Your campus, your way.',
    desc: 'Discover clubs, RSVP to events, track wellness, and compete in sports leagues - all in one app.',
    photo: '/assets/campus-hero.jpg',
  },
  {
    role: 'Coach',
    Icon: Trophy,
    headline: 'Run your leagues, effortlessly.',
    desc: 'Schedule games, track standings, enter scores, and keep athletes in the loop.',
    photo: '/assets/campus-students.jpg',
  },
  {
    role: 'Club Leader',
    Icon: Target,
    headline: 'Grow your club.',
    desc: 'Manage members, book venues, plan events, and track your club budget and impact.',
    photo: '/assets/campus-aerial.jpg',
  },
  {
    role: 'Teacher',
    Icon: BookOpen,
    headline: 'Empower every learner.',
    desc: 'Track attendance, manage assignments, communicate with parents, and monitor student wellbeing.',
    photo: '/assets/campus-sports.jpg',
  },
  {
    role: 'IT Admin',
    Icon: Monitor,
    headline: 'Control at your fingertips.',
    desc: 'Manage integrations, SSO, API keys, and platform-wide settings from a clean admin console.',
    photo: '/assets/campus-library.jpg',
  },
  {
    role: 'Parent',
    Icon: Users,
    headline: 'Stay close, always.',
    desc: 'See daily reports, event updates, grades, and message teachers directly from your phone.',
    photo: '/assets/campus-events.jpg',
  },
];

export const RoleCarousel: React.FC = () => {
  const doubled = [...roles, ...roles];

  return (
    <section className="py-24 bg-[#f6f6f9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <p className="text-sm font-semibold text-[#0047AB] mb-3 uppercase tracking-wider">Roles</p>
        <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Lexend, sans-serif' }}>
          Built for <span className="text-[#0047AB] italic">Every Role</span>
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex gap-6 animate-scroll-slow" style={{ width: 'max-content' }}>
          {doubled.map((r, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)', height: 380 }}
            >
              {/* Background photo */}
              <img
                src={r.photo}
                alt={r.role}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="mb-2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <r.Icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">{r.role}</span>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>{r.headline}</h3>
                <p className="text-sm text-white/80 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCarousel;
