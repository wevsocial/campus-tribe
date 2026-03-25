import { Link } from 'react-router-dom';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';

export default function PricingPage() {
  return (
    <div className="bg-surface text-on-surface font-body">
      <PublicNav />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-8 py-16 text-center">
          <span className="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 block">Institutional Access</span>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface mb-6">
            Empower your entire<br />
            <span className="text-primary italic">educational ecosystem.</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-xl leading-relaxed">
            Transparent, per-student pricing designed to scale with your institution. No hidden fees, no lock-in.
          </p>
        </section>

        {/* Free Banner */}
        <section className="max-w-7xl mx-auto px-8 mb-12">
          <div className="bg-tertiary-container rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-headline font-bold text-xl text-on-tertiary-container leading-tight">Free for Parents and Students</h3>
              <p className="text-on-tertiary-container/80 text-sm mt-1">Core features available at zero cost, forever.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Social matching', 'Event RSVPs', 'Wellbeing logs', 'Activity feeds'].map(tag => (
                <span key={tag} className="bg-white/40 px-4 py-1.5 rounded-full text-xs font-bold text-on-tertiary-container font-label uppercase tracking-wider">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Grid */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* University */}
          <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col transition-all hover:-translate-y-2 border border-outline-variant/10 shadow-sm">
            <div className="mb-8">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-xs font-bold font-label uppercase tracking-widest mb-4 inline-block">University</span>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-headline font-black text-on-surface">$12</span>
                <span className="text-on-surface-variant font-label text-sm uppercase">/ student / year</span>
              </div>
            </div>
            <p className="text-on-surface font-semibold mb-6">Comprehensive campus life suite.</p>
            <div className="space-y-4 mb-10 flex-grow">
              {['Automated Roommate Matching', 'Alumni Networking Hubs', 'Inter-Campus Tournament Engine', 'Advanced Student Analytics'].map(f => (
                <div key={f} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span className="text-sm text-on-surface-variant">{f}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3 rounded-full font-headline font-bold transition-colors">Select University</button>
          </div>

          {/* School - Featured */}
          <div className="editorial-gradient rounded-xl p-8 flex flex-col text-on-primary transition-all hover:-translate-y-2 shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined" style={{fontSize:'120px'}}>school</span>
            </div>
            <div className="relative z-10">
              <div className="mb-8">
                <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold font-label uppercase tracking-widest mb-4 inline-block">School</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-headline font-black">$8</span>
                  <span className="text-on-primary/70 font-label text-sm uppercase">/ student / year</span>
                </div>
              </div>
              <p className="font-semibold mb-6">House systems &amp; safety.</p>
              <div className="space-y-4 mb-10 flex-grow">
                {['Gamified House Leaderboards', 'Safe-Pass Gate Control', 'Anti-Bullying Incident Reporting', 'Extracurricular Activity Mgmt'].map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-white text-xl">check_circle</span>
                    <span className="text-sm text-on-primary/90">{f}</span>
                  </div>
                ))}
              </div>
              <button className="w-full bg-white text-primary py-3 rounded-full font-headline font-bold hover:bg-on-primary transition-colors">Select School</button>
            </div>
          </div>

          {/* Preschool */}
          <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col transition-all hover:-translate-y-2 border border-outline-variant/10 shadow-sm">
            <div className="mb-8">
              <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-lg text-xs font-bold font-label uppercase tracking-widest mb-4 inline-block">Preschool</span>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-headline font-black text-on-surface">$5</span>
                <span className="text-on-surface-variant font-label text-sm uppercase">/ student / year</span>
              </div>
            </div>
            <p className="text-on-surface font-semibold mb-6">Parent loops &amp; safety.</p>
            <div className="space-y-4 mb-10 flex-grow">
              {['Real-time Parent Activity Loops', 'Digital Sign-in/Sign-out', 'Daily Milestones & Photos', 'Nutritional & Sleep Tracking'].map(f => (
                <div key={f} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span className="text-sm text-on-surface-variant">{f}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3 rounded-full font-headline font-bold transition-colors">Select Preschool</button>
          </div>
        </section>

        {/* Bento Details */}
        <section className="max-w-7xl mx-auto px-8 mt-24">
          <h2 className="font-headline text-4xl font-bold mb-12 text-center">Engineered for Academic Vitality</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">security</span>
                <h4 className="font-headline text-2xl font-bold mb-2">Uncompromising Safety</h4>
                <p className="text-on-surface-variant">Our core architecture includes encrypted communication channels and strict identity verification for all institutional members.</p>
              </div>
            </div>
            <div className="bg-on-surface text-surface-container rounded-xl p-8">
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant" style={{color:'#acadaf'}}>Uptime SLA</p>
              <p className="font-headline text-5xl font-black text-white mt-2">99.9%</p>
            </div>
            <div className="bg-primary text-on-primary rounded-xl p-8">
              <p className="font-label text-xs uppercase tracking-widest opacity-70">Campus Support</p>
              <p className="font-headline text-5xl font-black mt-2">24/7</p>
              <p className="text-sm opacity-70 mt-2">Dedicated success team for every institution</p>
            </div>
            <div className="md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h4 className="font-headline text-2xl font-bold">Need a custom quote?</h4>
                <p className="text-on-surface-variant">For large districts or multi-campus networks, we offer enterprise pricing.</p>
              </div>
              <Link to="/demo" className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-bold hover:opacity-90 transition-all whitespace-nowrap">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
