import React from 'react';

const rows = [
  { feature: 'Student profiles & matching', ct: true, competitor1: true, competitor2: false },
  { feature: 'Club management', ct: true, competitor1: true, competitor2: true },
  { feature: 'Event Hub with RSVP', ct: true, competitor1: true, competitor2: false },
  { feature: 'Sports leagues & standings', ct: true, competitor1: false, competitor2: false },
  { feature: 'Venue booking', ct: true, competitor1: 'partial', competitor2: false },
  { feature: 'Wellness tracker', ct: true, competitor1: false, competitor2: false },
  { feature: 'Parent portal', ct: true, competitor1: false, competitor2: 'partial' },
  { feature: 'AI-powered analytics', ct: true, competitor1: 'partial', competitor2: false },
  { feature: 'Surveys & polls', ct: true, competitor1: true, competitor2: false },
  { feature: 'Mobile-first design', ct: true, competitor1: true, competitor2: true },
  { feature: 'Custom branding', ct: true, competitor1: 'partial', competitor2: false },
  { feature: 'Single sign-on (SSO)', ct: true, competitor1: true, competitor2: false },
];

function Indicator({ value }: { value: boolean | string }) {
  if (value === true) return <span className="text-tertiary text-lg">✓</span>;
  if (value === false) return <span className="text-secondary text-lg">✗</span>;
  return <span className="text-amber-500 text-lg">⟡</span>;
}

export const ComparisonTable: React.FC = () => {
  return (
    <section className="py-24 bg-surface-low">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-jakarta font-700 text-primary mb-3">Comparison</p>
          <h2 className="font-lexend font-900 text-4xl text-on-surface mb-4">
            How we stack up
          </h2>
          <p className="text-on-surface-variant">See why Campus Tribe is the most complete student engagement platform.</p>
        </div>

        <div className="bg-surface-lowest rounded-2xl overflow-hidden border border-outline-variant/40 shadow-float">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/40">
                <th className="text-left py-4 px-6 text-sm font-jakarta font-700 text-on-surface-variant w-1/2">Feature</th>
                <th className="py-4 px-4 text-sm font-jakarta font-700 text-primary">Campus Tribe</th>
                <th className="py-4 px-4 text-sm font-jakarta font-700 text-on-surface-variant">Competitor A</th>
                <th className="py-4 px-4 text-sm font-jakarta font-700 text-on-surface-variant">Competitor B</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-surface-lowest' : 'bg-surface'}>
                  <td className="py-3 px-6 text-sm text-on-surface">{row.feature}</td>
                  <td className="py-3 px-4 text-center"><Indicator value={row.ct} /></td>
                  <td className="py-3 px-4 text-center"><Indicator value={row.competitor1} /></td>
                  <td className="py-3 px-4 text-center"><Indicator value={row.competitor2} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-4">⟡ = Partial or limited support</p>
      </div>
    </section>
  );
};

export default ComparisonTable;
