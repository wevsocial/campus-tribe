import React from 'react';

const tiers = [
  {
    icon: 'school',
    title: 'University & College',
    desc: 'Full-featured platform for large institutions with advanced analytics, sports leagues, and enterprise integrations.',
    features: ['Smart Matching', 'Sports Leagues', 'Analytics Dashboard', 'Venue Booking', 'Parent Portal'],
    gradient: 'linear-gradient(135deg, #0047AB 0%, #759eff 100%)',
    textColor: 'text-white',
  },
  {
    icon: 'menu_book',
    title: 'High School',
    desc: 'Perfect for schools looking to boost student engagement with clubs, events, and wellness tools.',
    features: ['Club Management', 'Event Hub', 'Wellness Tracker', 'Surveys & Polls', 'Student Profiles'],
    gradient: 'linear-gradient(135deg, #FF7F50 0%, #ffb08a 100%)',
    textColor: 'text-white',
  },
  {
    icon: 'child_care',
    title: 'Preschool & K-8',
    desc: 'Lightweight parent communication and activity coordination tools designed for young learners.',
    features: ['Parent Portal', 'Activity Scheduling', 'Attendance', 'Announcements', 'Photo Sharing'],
    gradient: 'linear-gradient(135deg, #00A86B 0%, #5de0b0 100%)',
    textColor: 'text-white',
  },
];

export const EcosystemSection: React.FC = () => {
  return (
    <section className="py-24 bg-surface-low" id="university">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-jakarta font-700 text-primary mb-3">Ecosystem</p>
          <h2 className="font-lexend font-900 text-4xl text-on-surface mb-4">
            Everything your campus needs
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            One platform that adapts to your institution's size, type, and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.title}
              className="rounded-2xl overflow-hidden shadow-float group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-rise"
            >
              <div className="p-8" style={{ background: tier.gradient }}>
                <span
                  className={`material-symbols-outlined text-5xl ${tier.textColor} mb-4 block transition-transform duration-300 group-hover:rotate-12`}
                >
                  {tier.icon}
                </span>
                <h3 className={`font-lexend font-900 text-2xl ${tier.textColor} mb-3`}>{tier.title}</h3>
                <p className={`text-sm leading-relaxed ${tier.textColor} opacity-90`}>{tier.desc}</p>
              </div>
              <div className="bg-surface-lowest p-6">
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-on-surface">
                      <span className="text-tertiary font-jakarta font-800">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
