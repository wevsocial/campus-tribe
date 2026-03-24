import React from 'react';

const stats = [
  { value: '19.9M', label: 'Students Engaged', sublabel: 'Across all campuses' },
  { value: '$16B', label: 'Economic Impact', sublabel: 'In institutional savings' },
  { value: '8+', label: 'Countries', sublabel: 'And growing fast' },
];

export const StatsRow: React.FC = () => {
  return (
    <section className="py-16 bg-surface-lowest border-y border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.value} className="py-4">
              <p className="font-lexend font-900 text-6xl text-primary">{s.value}</p>
              <p className="font-lexend font-800 text-lg text-on-surface mt-2">{s.label}</p>
              <p className="text-sm text-on-surface-variant mt-1">{s.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsRow;
