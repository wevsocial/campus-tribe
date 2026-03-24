import React from 'react';

const pillars = [
  { icon: 'diversity_3', title: 'Smart Matching', desc: 'AI-powered matching connects students with clubs, events, and peers.', gradient: 'linear-gradient(135deg, #0047AB 0%, #759eff 100%)' },
  { icon: 'calendar_month', title: 'Event Hub', desc: 'Create, discover, and RSVP to campus events with ease.', gradient: 'linear-gradient(135deg, #FF7F50 0%, #ffb08a 100%)' },
  { icon: 'sports_kabaddi', title: 'Sports Finder', desc: 'Find leagues, track standings, and join intramural teams.', gradient: 'linear-gradient(135deg, #00A86B 0%, #5de0b0 100%)' },
  { icon: 'apartment', title: 'Venue Booking', desc: 'Book campus spaces in seconds — no more paperwork.', gradient: 'linear-gradient(135deg, #7B2D8B 0%, #c48fd4 100%)' },
  { icon: 'volunteer_activism', title: 'Wellbeing', desc: 'Daily mood tracking, wellness resources, and peer support.', gradient: 'linear-gradient(135deg, #E91E63 0%, #f48fb1 100%)' },
  { icon: 'family_restroom', title: 'Parent Portal', desc: 'Keep families connected and informed with real-time updates.', gradient: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)' },
  { icon: 'groups', title: 'Group Activities', desc: 'Coordinate group projects, trips, and collaborative events.', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFCC80 100%)' },
  { icon: 'poll', title: 'Surveys & Polls', desc: 'Gather feedback instantly from your campus community.', gradient: 'linear-gradient(135deg, #009688 0%, #80CBC4 100%)' },
];

export const PillarsSection: React.FC = () => {
  const doubled = [...pillars, ...pillars];

  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <p className="text-sm font-jakarta font-700 text-primary mb-3">What we offer</p>
        <h2 className="font-lexend font-900 text-4xl text-on-surface">
          Pillars of student engagement,{' '}
          <span className="text-primary italic">Unified.</span>
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex gap-6 w-max animate-pillar-scroll"
          style={{ paddingLeft: '1.5rem' }}
        >
          {doubled.map((pillar, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 rounded-2xl overflow-hidden bg-surface-lowest border border-outline-variant/40 shadow-float"
            >
              <div className="h-36 relative flex items-center justify-center" style={{ background: pillar.gradient }}>
                <span className="material-symbols-outlined text-5xl text-white">{pillar.icon}</span>
              </div>
              <div className="p-5">
                <h3 className="font-lexend font-800 text-base text-on-surface mb-2">{pillar.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
