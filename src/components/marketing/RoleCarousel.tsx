import React from 'react';

const roles = [
  {
    role: 'Student',
    icon: '🎓',
    headline: 'Your campus, your way.',
    desc: 'Discover clubs, RSVP to events, track wellness, and compete in sports leagues - all in one app.',
    photo: '/assets/campus-hero.jpg',
  },
  {
    role: 'Coach',
    icon: '🏆',
    headline: 'Run your leagues, effortlessly.',
    desc: 'Schedule games, track standings, enter scores, and keep athletes in the loop.',
    photo: '/assets/campus-students.jpg',
  },
  {
    role: 'Club Leader',
    icon: '🎯',
    headline: 'Grow your club.',
    desc: 'Manage members, book venues, plan events, and track your club budget and impact.',
    photo: '/assets/campus-aerial.jpg',
  },
  {
    role: 'Teacher',
    icon: '📚',
    headline: 'Empower every learner.',
    desc: 'Track attendance, manage assignments, communicate with parents, and monitor student wellbeing.',
    photo: '/assets/campus-sports.jpg',
  },
  {
    role: 'IT Admin',
    icon: '💻',
    headline: 'Control at your fingertips.',
    desc: 'Manage integrations, SSO, API keys, and platform-wide settings from a clean admin console.',
    photo: '/assets/campus-library.jpg',
  },
  {
    role: 'Parent',
    icon: '👨‍👩‍👧',
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
          {doubled.map((role, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)', height: 380 }}
            >
              {/* Background photo */}
              <img
                src={role.photo}
                alt={role.role}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="text-4xl mb-2">{role.icon}</div>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">{role.role}</span>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>{role.headline}</h3>
                <p className="text-sm text-white/80 leading-relaxed">{role.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCarousel;
