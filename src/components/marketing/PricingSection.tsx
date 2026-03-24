import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    desc: 'Perfect for small clubs and pilot programs.',
    features: [
      { label: 'Up to 500 students', included: true },
      { label: 'Basic club management', included: true },
      { label: 'Event Hub', included: true },
      { label: 'Email notifications', included: true },
      { label: 'Sports leagues', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: 'Wellness tracker', included: false },
      { label: 'Venue booking', included: false },
      { label: 'Parent portal', included: false },
      { label: 'Priority support', included: false },
    ],
    cta: 'Start Free',
    featured: false,
    gradient: '',
  },
  {
    name: 'Growth',
    price: '$299',
    period: '/month',
    desc: 'For growing institutions ready to scale engagement.',
    features: [
      { label: 'Up to 15,000 students', included: true },
      { label: 'Full club management', included: true },
      { label: 'Event Hub + RSVP', included: true },
      { label: 'Push + email notifications', included: true },
      { label: 'Sports leagues', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Wellness tracker', included: true },
      { label: 'Venue booking', included: true },
      { label: 'Parent portal', included: false },
      { label: 'Priority support', included: false },
    ],
    cta: 'Get Growth',
    featured: true,
    gradient: 'bg-hero-gradient',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Full-scale for universities with 15k+ students.',
    features: [
      { label: 'Unlimited students', included: true },
      { label: 'Full club management', included: true },
      { label: 'Event Hub + RSVP', included: true },
      { label: 'All notification channels', included: true },
      { label: 'Sports leagues + multi-campus', included: true },
      { label: 'Advanced analytics + AI', included: true },
      { label: 'Wellness + mental health tools', included: true },
      { label: 'Venue booking + calendar sync', included: true },
      { label: 'Parent portal', included: true },
      { label: 'Dedicated support + SLA', included: true },
    ],
    cta: 'Contact Sales',
    featured: false,
    gradient: '',
  },
];

export const PricingSection: React.FC = () => {
  return (
    <section className="py-24 bg-surface" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-jakarta font-700 text-primary mb-3">Pricing</p>
          <h2 className="font-lexend font-900 text-4xl text-on-surface mb-4">Simple, transparent pricing</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">No hidden fees. Cancel anytime. Start free and upgrade as you grow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl overflow-hidden ${plan.featured ? 'shadow-rise scale-105' : 'shadow-float border border-outline-variant/40'}`}
            >
              {plan.featured ? (
                <div className={`${plan.gradient} p-8`}>
                  <span className="text-xs font-jakarta font-700 text-white/80 uppercase tracking-widest">Most Popular</span>
                  <p className="font-lexend font-900 text-3xl text-white mt-2">{plan.name}</p>
                  <p className="text-white/80 text-sm mt-1">{plan.desc}</p>
                  <div className="mt-4">
                    <span className="font-lexend font-900 text-5xl text-white">{plan.price}</span>
                    <span className="text-white/70">{plan.period}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-lowest p-8">
                  <p className="font-lexend font-900 text-xl text-on-surface">{plan.name}</p>
                  <p className="text-on-surface-variant text-sm mt-1">{plan.desc}</p>
                  <div className="mt-4">
                    <span className="font-lexend font-900 text-4xl text-on-surface">{plan.price}</span>
                    <span className="text-on-surface-variant text-sm">{plan.period}</span>
                  </div>
                </div>
              )}

              <div className="bg-surface-lowest p-8 pt-6">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-3 text-sm">
                      {f.included ? (
                        <Check size={16} className="text-tertiary flex-shrink-0" />
                      ) : (
                        <Minus size={16} className="text-outline-variant flex-shrink-0" />
                      )}
                      <span className={f.included ? 'text-on-surface' : 'text-on-surface-variant'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <button
                    className={`w-full py-3 rounded-xl font-jakarta font-700 text-sm transition-all ${
                      plan.featured
                        ? 'bg-primary text-white hover:bg-primary-dim'
                        : 'border border-outline-variant text-on-surface hover:bg-surface-low'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
