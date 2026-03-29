import { Link } from 'react-router-dom';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';

const STARTER_FEATURES = [
  'Student hub & club directory',
  'Event management & RSVP',
  'Basic venue booking',
  'Club registration & approvals',
  'Basic polls',
  'Mobile app (iOS + Android)',
];

const GROWTH_FEATURES = [
  'Everything in Starter',
  'Full intramural sports platform',
  'Full survey & polls engine',
  'AI engagement analytics',
  'At-risk student alerts',
  'LMS integration (Canvas/Blackboard)',
  'Admin OS dashboard',
  'Compliance reporting suite',
];

const ENTERPRISE_FEATURES = [
  'Everything in Growth',
  'White-label branding',
  'Custom SSO & ERP integration',
  'Multi-campus management',
  'Dedicated Customer Success Manager',
  'SLA 99.9% uptime guarantee',
  'Annual strategic review',
];

function Check({ white = false }: { white?: boolean }) {
  return (
    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${white ? 'text-white' : 'text-tertiary'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div className="bg-surface text-on-surface font-body">
      <PublicNav />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-jakarta font-700 uppercase tracking-widest mb-6">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            Institutional Access · Annual Prepayment
          </span>
          <h1 className="font-lexend text-5xl md:text-7xl font-900 tracking-tight leading-tight text-on-surface mb-6">
            Transparent pricing.<br />
            <span className="text-primary italic">Real ROI.</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-xl leading-relaxed">
            Per-student annual pricing. One contract replaces 8+ disconnected tools.
            Internal campus payments powered by Helcim.
          </p>
        </section>

        {/* ROI Callout */}
        <section className="max-w-7xl mx-auto px-8 mb-12">
          <div className="bg-tertiary-container rounded-[1.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-lexend font-800 text-xl text-on-tert-cont">
                Expected Year 1 ROI for 10,000-student institution at Growth tier
              </h3>
              <p className="text-on-tert-cont/80 text-sm mt-1">
                $500K–$2M+ recoverable value from retention lift, labor savings, and tool consolidation.
              </p>
            </div>
            <div className="shrink-0">
              <div className="bg-white/40 rounded-[1rem] px-6 py-3 text-center">
                <p className="font-lexend font-900 text-3xl text-tertiary">3–13×</p>
                <p className="text-xs font-jakarta font-700 text-on-tert-cont uppercase tracking-widest mt-1">ROI Year 1</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Grid */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-surface-lowest rounded-[1.5rem] p-8 flex flex-col shadow-sm hover:-translate-y-1 transition-all bg-primary-container/30">
            <div className="mb-8">
              <span className="bg-primary-container text-on-primary-cont px-3 py-1 rounded-full text-xs font-jakarta font-700 uppercase tracking-widest mb-4 inline-block">
                Starter
              </span>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-lexend text-5xl font-900 text-primary">$7.50</span>
                <span className="text-on-surface-variant font-jakarta text-sm uppercase tracking-widest ml-1">/ student / year</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-2">Up to 3,000 students · $22K–$75K ARR</p>
            </div>
            <ul className="space-y-3 mb-10 flex-grow">
              {STARTER_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-on-surface-variant">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="w-full block text-center bg-surface-container-high hover:bg-primary hover:text-white text-on-surface py-3 rounded-full font-lexend font-700 transition-all">
              Get started free
            </Link>
          </div>

          {/* Growth — Most Popular */}
          <div className="relative bg-hero-gradient rounded-[1.5rem] p-8 flex flex-col shadow-2xl shadow-primary/30 hover:-translate-y-2 transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-secondary text-white px-4 py-1 rounded-full text-xs font-jakarta font-700 uppercase tracking-widest shadow-md">
                Most Popular
              </span>
            </div>
            <div className="mb-8">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-jakarta font-700 uppercase tracking-widest mb-4 inline-block">
                Growth
              </span>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-lexend text-5xl font-900 text-white">$15</span>
                <span className="text-white/70 font-jakarta text-sm uppercase tracking-widest ml-1">/ student / year</span>
              </div>
              <p className="text-white/70 text-sm mt-2">3,000–20,000 students · $75K–$300K ARR</p>
            </div>
            <ul className="space-y-3 mb-10 flex-grow">
              {GROWTH_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/90">
                  <Check white />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="w-full block text-center bg-white text-primary py-3 rounded-full font-lexend font-700 hover:opacity-90 transition-all">
              Get started free
            </Link>
          </div>

          {/* Enterprise */}
          <div className="bg-surface-lowest rounded-[1.5rem] p-8 flex flex-col shadow-sm hover:-translate-y-1 transition-all bg-secondary-container/30">
            <div className="mb-8">
              <span className="bg-secondary-container text-on-sec-cont px-3 py-1 rounded-full text-xs font-jakarta font-700 uppercase tracking-widest mb-4 inline-block">
                Enterprise
              </span>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-lexend text-5xl font-900 text-secondary">Custom</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-2">From $22.50/student · 20,000+ students · $300K–$750K+ ARR</p>
            </div>
            <ul className="space-y-3 mb-10 flex-grow">
              {ENTERPRISE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-on-surface-variant">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/demo" className="w-full block text-center bg-secondary text-white py-3 rounded-full font-lexend font-700 hover:opacity-90 transition-all">
              Contact sales
            </Link>
          </div>
        </section>

        {/* Stats & Details */}
        <section className="max-w-7xl mx-auto px-8 mt-20">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-primary rounded-[1.5rem] p-8 text-white">
              <div className="text-white/60 text-xs font-jakarta font-700 uppercase tracking-widest mb-3">Platform Impact</div>
              <h4 className="font-lexend text-2xl font-800 mb-2">Proven ROI at Scale</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Institutions running Campus Tribe see a 14-point retention advantage — 92% retention for
                engaged students vs. 78% for non-engaged. At $28,700 average annual tuition, 500 retained
                students = $14.35M additional tuition revenue.
              </p>
            </div>
            <div className="bg-on-surface rounded-[1.5rem] p-8 text-center">
              <p className="font-jakarta text-xs font-700 uppercase tracking-widest text-outline mb-2">Uptime SLA</p>
              <p className="font-lexend text-5xl font-900 text-white mt-2">99.9%</p>
              <p className="text-xs text-outline mt-2 font-jakarta">Enterprise tier guaranteed</p>
            </div>
            <div className="bg-tertiary rounded-[1.5rem] p-8 text-white text-center">
              <p className="font-jakarta text-xs font-700 uppercase tracking-widest text-white/60 mb-2">Tools Replaced</p>
              <p className="font-lexend text-5xl font-900 mt-2">8+</p>
              <p className="text-xs text-white/60 mt-2 font-jakarta">One contract. Zero integration maintenance.</p>
            </div>

            <div className="md:col-span-4 bg-surface-container-low rounded-[1.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h4 className="font-lexend text-2xl font-800">Payment method</h4>
                <p className="text-on-surface-variant text-sm mt-1">
                  Annual prepayment via bank wire, ACH, or institutional cheque. No credit card required.
                  Internal campus payments (club dues, event tickets, intramural fees) processed via Helcim — 
                  Canadian-first, PCI-DSS Level 1.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link to="/demo" className="bg-primary text-white px-6 py-3 rounded-full font-lexend font-700 hover:opacity-90 transition-all whitespace-nowrap">
                  Book demo
                </Link>
                <Link to="/register" className="bg-surface text-primary border border-primary/20 px-6 py-3 rounded-full font-lexend font-700 hover:bg-primary-container transition-all whitespace-nowrap">
                  Start free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
