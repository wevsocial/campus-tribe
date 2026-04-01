import WevSocialLogo from '../../components/ui/WevSocialLogo';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

export default function AboutPage() {
  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        <section className="max-w-7xl mx-auto px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label uppercase tracking-widest font-bold mb-6">
            Our Story
          </div>
          <h1 className="font-headline font-extrabold text-5xl lg:text-7xl text-on-surface dark:text-slate-50 tracking-tight mb-6">
            Built for <span className="text-primary">Students</span>,<br />by People Who Care.
          </h1>
          <p className="text-xl text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Campus Tribe is a product of WevSocial Inc., a social technology company focused on meaningful human connection, modern campus operations, and healthier digital ecosystems.
          </p>
        </section>

        <section className="bg-surface-container-low dark:bg-slate-900 py-20">
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-slate-100 mb-6">Our Mission</h2>
              <p className="text-on-surface-variant dark:text-slate-400 text-lg leading-relaxed mb-6">
                We believe every student deserves to feel connected: to peers, mentors, teachers, staff, and purpose. Too many learners drift through education feeling invisible, overwhelmed, or disconnected from the real communities around them.
              </p>
              <p className="text-on-surface-variant dark:text-slate-400 text-lg leading-relaxed mb-8">
                Campus Tribe exists to change that. We are building the infrastructure for belonging: a privacy-conscious, multi-platform system that brings student life, communication, operations, and support into one living institutional layer.
              </p>
              <div className="grid grid-cols-3 gap-6 text-center">
                {[['3', 'Platform Modes'], ['P0', 'Core Release Focus'], ['1', 'Unified Data Layer']].map(([stat, label]) => (
                  <div key={label} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="font-headline font-black text-3xl text-primary">{stat}</div>
                    <div className="text-sm text-on-surface-variant dark:text-slate-400 font-medium mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <img
                alt="Campus Tribe mission"
                className="w-full h-full object-cover"
                src="/assets/campus-preschool.jpg"
              />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="bg-primary text-white rounded-3xl p-12 text-center">
            <h2 className="font-headline font-bold text-3xl mb-4 flex items-center justify-center gap-2"><WevSocialLogo className="w-7 h-7 text-white/80" /> Powered by WevSocial</h2>
            <p className="text-primary-container max-w-2xl mx-auto leading-relaxed">
              WevSocial is the parent company behind Campus Tribe. The product is being shaped as a real operational system for university, school, and preschool communities, not just a front-end shell. That means real data, real workflows, real onboarding, and a roadmap aligned to measurable student connection and institutional ROI.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
