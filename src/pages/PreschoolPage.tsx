import { Link } from 'react-router-dom';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';
import { DemoRequestForm } from '../components/marketing/DemoRequestForm';

export default function PreschoolPage() {
  return (
    <div className="bg-surface text-on-surface font-body">
      <PublicNav />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative px-8 py-20 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 z-10">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label text-xs font-bold tracking-widest uppercase">
                The Nurturing Academy for Early Years
              </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface">
                Early Years, <br />
                <span className="text-primary italic">Better Connected.</span>
              </h1>
              <p className="font-body text-lg text-on-surface-variant max-w-lg leading-relaxed">
                The premium digital ecosystem for modern preschools. Bridging the gap between developmental milestones and daily daycare management through editorial-grade technology.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/demo" className="bg-secondary text-white px-8 py-4 rounded-full font-headline font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-secondary/20">
                  Book a Demo
                </Link>
                <Link to="/register?platform=preschool" className="bg-surface text-primary px-8 py-4 rounded-full font-headline font-bold text-lg hover:bg-primary-container transition-all border border-primary/20">
                  Get Started Free
                </Link>
                <button className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-full font-headline font-bold text-lg hover:opacity-80 transition-all">
                  Explore Features
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-tertiary-container/30 rounded-full blur-3xl"></div>
              <div className="relative z-10 overflow-hidden shadow-2xl rounded-[4rem_1.5rem_6rem_2rem] transform rotate-2">
                <picture><source type="image/webp" srcSet="/assets/campus-preschool.webp" /><img
                  alt="Preschool children playing together"
                  className="w-full h-[500px] object-cover"
                  src="/assets/campus-preschool.jpg"
                /></picture>
              </div>
              <div className="absolute -bottom-8 -left-8 z-20 bg-surface-container-lowest p-6 rounded-xl shadow-xl flex items-center gap-4 border border-outline-variant/15">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container">favorite</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">100% Secure</p>
                  <p className="font-label text-xs text-on-surface-variant">Trusted by 2k+ Directors</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Features */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline text-3xl font-bold tracking-tight mb-4">The Command Center</h2>
              <p className="font-body text-on-surface-variant max-w-2xl">Streamlining daycare operations with precision-engineered tools for transparency and child safety.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
              <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden group border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="material-symbols-outlined text-primary text-4xl mb-4">hub</span>
                    <h3 className="font-headline text-2xl font-bold mb-4">Parent Engagement Portal</h3>
                    <p className="font-body text-on-surface-variant max-w-md">Real-time updates, community threads, and secure event scheduling in one centralized hub.</p>
                  </div>
                  <div className="mt-8 rounded-lg overflow-hidden border border-outline-variant/10">
                    <picture><source type="image/webp" srcSet="/assets/campus-parent.webp" /><img alt="Parent engagement interface" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" src="/assets/campus-parent.jpg" /></picture>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 bg-primary text-on-primary rounded-xl p-8 flex flex-col justify-center text-center">
                <span className="material-symbols-outlined text-5xl mb-6">edit_note</span>
                <h3 className="font-headline text-2xl font-bold mb-2">Daily Logs</h3>
                <p className="opacity-80">Naps, meals, and activities logged with clinical precision.</p>
              </div>
              <div className="md:col-span-4 bg-tertiary text-on-tertiary rounded-xl p-8 flex flex-col justify-center text-center" style={{color:'#caffdc'}}>
                <span className="material-symbols-outlined text-5xl mb-6">trending_up</span>
                <h3 className="font-headline text-2xl font-bold mb-2">Milestones</h3>
                <p className="opacity-80 text-sm">Automated child development tracking against global standards.</p>
              </div>
              <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 border border-outline-variant/10 shadow-sm">
                <div className="flex-1">
                  <h3 className="font-headline text-2xl font-bold mb-4">Encrypted Moments</h3>
                  <p className="font-body text-on-surface-variant">Instant photo sharing with end-to-end encryption. Only verified guardians can view the gallery.</p>
                  <div className="flex gap-2 mt-6">
                    {['bg-secondary-container', 'bg-primary-container', 'bg-tertiary-container'].map((c, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full ${c}`}></div>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs">+12</div>
                  </div>
                </div>
                <div className="flex-1 w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
                  <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-tertiary">verified_user</span>
                    <span className="text-xs font-label">Photo Uploaded: Outdoor Play</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-primary">mark_chat_unread</span>
                    <span className="text-xs font-label">New Message from Lead Teacher</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Persona Trust */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-6 p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/5">
              <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-3xl">corporate_fare</span>
              </div>
              <h4 className="font-headline text-2xl font-extrabold text-on-surface">For Directors</h4>
              <p className="font-body text-on-surface-variant leading-relaxed">Scale your operations with administrative clarity. Manage staffing ratios, billing, and parent communications in a single, high-performance interface.</p>
              <ul className="space-y-3 font-label text-sm font-bold text-primary">
                {['Automated Billing', 'Staff Scheduling', 'Compliance Tracking'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span> {f}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-6 p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/5">
              <div className="w-14 h-14 bg-secondary-container/30 text-secondary flex items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-3xl">family_restroom</span>
              </div>
              <h4 className="font-headline text-2xl font-extrabold text-on-surface">For Parents</h4>
              <p className="font-body text-on-surface-variant leading-relaxed">Eliminate "drop-off anxiety." Receive high-fidelity photos and real-time alerts. Watch your child develop through beautiful, data-driven milestone maps.</p>
              <ul className="space-y-3 font-label text-sm font-bold text-secondary">
                {['Live Daily Feed', 'Milestone Charts', 'Direct Messenger'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span> {f}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-6 p-8 rounded-xl bg-on-surface text-surface-container-lowest">
              <div className="w-14 h-14 bg-tertiary-container text-on-tertiary-container flex items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-3xl">security</span>
              </div>
              <h4 className="font-headline text-2xl font-extrabold">Safety Infrastructure</h4>
              <div className="space-y-4">
                {[['Data Security', 'AES-256'], ['Cloud Backup', '99.9%'], ['Identity Verify', 'MFA']].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/20 pb-2">
                    <span className="font-label text-xs uppercase tracking-widest opacity-70">{label}</span>
                    <span className="font-headline font-bold text-lg">{val}</span>
                  </div>
                ))}
              </div>
              <p className="font-body text-sm opacity-60 italic">Your child's privacy is our top priority.</p>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-24 bg-surface-container-high/30">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-xl">
                <h2 className="font-headline text-4xl font-black tracking-tighter text-on-surface leading-none mb-6">Momentum in Action</h2>
                <p className="font-body text-on-surface-variant text-lg">Experience the vibrant life of Campus Tribe preschools through our vibrant gallery.</p>
              </div>
              <button className="font-headline font-bold text-primary flex items-center gap-2 hover:gap-4 transition-all">
                View Success Stories <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="aspect-square bg-surface-container-highest rounded-xl overflow-hidden shadow-lg">
                <picture><source type="image/webp" srcSet="/assets/campus-toddler2.webp" /><img alt="Child painting" className="w-full h-full object-cover" src="/assets/campus-toddler2.jpg" /></picture>
              </div>
              <div className="aspect-[3/4] bg-surface-container-highest rounded-xl overflow-hidden shadow-lg md:mt-12">
                <picture><source type="image/webp" srcSet="/assets/campus-toddler2.webp" /><img alt="Children at play" className="w-full h-full object-cover" src="/assets/campus-toddler2.jpg" /></picture>
              </div>
              <div className="aspect-square bg-surface-container-highest rounded-xl overflow-hidden shadow-lg">
                <picture><source type="image/webp" srcSet="/assets/campus-preschool.webp" /><img alt="Teacher guided activity" className="w-full h-full object-cover" src="/assets/campus-preschool.jpg" /></picture>
              </div>
              <div className="aspect-[3/4] bg-surface-container-highest rounded-xl overflow-hidden shadow-lg md:-mt-12">
                <picture><source type="image/webp" srcSet="/assets/campus-wellbeing.webp" /><img alt="Outdoor play area" className="w-full h-full object-cover" src="/assets/campus-wellbeing.jpg" /></picture>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-container opacity-90"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-primary tracking-tighter">Ready to Elevate Your Academy?</h2>
              <p className="font-body text-on-primary/80 text-lg max-w-2xl mx-auto">Join the tribe of elite preschools defining the future of early childhood education.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <input className="px-6 py-4 rounded-full bg-white/10 border-none text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 w-full sm:w-80" placeholder="Enter your work email" type="email" />
                <button className="bg-secondary text-white px-8 py-4 rounded-full font-headline font-bold text-lg hover:opacity-90 transition-all">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <DemoRequestForm />
      <PublicFooter />
    </div>
  );
}
