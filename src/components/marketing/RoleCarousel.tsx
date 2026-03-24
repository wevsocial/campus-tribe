import React from 'react';

const roles = [
  {
    role: 'Student',
    icon: '🎓',
    headline: 'Your campus, your way.',
    desc: 'Discover clubs, RSVP to events, track wellness, and compete in sports leagues to all in one app.',
    gradient: 'linear-gradient(135deg, #0047AB 0%, #759eff 100%)',
  },
  {
    role: 'Administrator',
    icon: '🏛️',
    headline: 'Insight at your fingertips.',
    desc: 'Monitor engagement, identify at-risk students, and manage events across your entire campus.',
    gradient: 'linear-gradient(135deg, #FF7F50 0%, #ffb08a 100%)',
  },
  {
    role: 'Coach',
    icon: '🏆',
    headline: 'Run your leagues, effortlessly.',
    desc: 'Schedule games, track standings, enter scores, and keep athletes in the loop.',
    gradient: 'linear-gradient(135deg, #00A86B 0%, #5de0b0 100%)',
  },
  {
    role: 'Club Leader',
    icon: '🎯',
    headline: 'Grow your club.',
    desc: 'Manage members, book venues, plan events, and track your club\'s budget and impact.',
    gradient: 'linear-gradient(135deg, #7B2D8B 0%, #c48fd4 100%)',
  },
];

export const RoleCarousel: React.FC = () => {
  const doubled = [...roles, ...roles];

  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <p className="text-sm font-jakarta font-700 text-primary mb-3">Roles</p>
        <h2 className="font-lexend font-900 text-4xl text-on-surface">
          Built for <span className="text-primary italic">Every Role</span>
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex gap-6 w-max animate-role-carousel" style={{ paddingLeft: '1.5rem' }}>
          {doubled.map((role, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 rounded-2xl overflow-hidden shadow-float"
            >
              <div className="h-48 flex items-center justify-center" style={{ background: role.gradient }}>
                <span className="text-7xl">{role.icon}</span>
              </div>
              <div className="bg-surface-lowest p-6">
                <span className="text-xs font-jakarta font-700 text-primary uppercase tracking-wider">{role.role}</span>
                <h3 className="font-lexend font-800 text-xl text-on-surface mt-1 mb-2">{role.headline}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{role.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCarousel;
