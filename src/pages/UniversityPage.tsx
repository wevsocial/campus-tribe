import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';

export default function UniversityPage() {
  return (
    <div className="bg-background dark:bg-slate-950 text-on-background dark:text-slate-100 min-h-screen">
      <PublicNav />

      {/* Hero */}
      <header className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-1 rounded-full border border-secondary/20">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">Higher Ed Reimagined</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-on-surface dark:text-slate-50 leading-[0.9]">
              FROM <span className="text-primary">ISOLATED</span><br />
              TO <span className="text-secondary italic">CONNECTED.</span>
            </h1>
            <p className="text-xl text-on-surface-variant dark:text-slate-400 max-w-xl leading-relaxed">
              The only student engagement platform built for the kinetic energy of modern campus life. Powered by WevSocial.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register" className="bg-secondary text-white px-10 py-4 rounded-full font-headline text-lg hover:brightness-110 transition-all shadow-lg shadow-secondary/20">
                Request Demo
              </Link>
              <Link to="/demo" className="flex items-center gap-3 font-headline text-lg text-primary px-6 py-4 rounded-full border border-primary/20 hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined">play_circle</span>
                See the Story
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl rotate-[-3deg] border-4 border-white dark:border-slate-700">
                  <img
                    alt="Student Library"
                    className="w-full h-full object-cover"
                    src="/assets/campus-university.jpg"
                  />
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">person_search</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-tight">Status</p>
                    <p className="text-sm font-headline font-bold dark:text-slate-100">Searching for Tribe...</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl rotate-[3deg] border-4 border-white dark:border-slate-700">
                  <img
                    alt="Students Group"
                    className="w-full h-full object-cover"
                    src="/assets/campus-hero.jpg"
                  />
                </div>
                <div className="bg-secondary p-4 rounded-xl shadow-xl flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-label font-bold text-white/70 uppercase tracking-tight">Result</p>
                    <p className="text-sm font-headline font-bold">Matched with Tribe</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Core Ecosystem */}
      <section className="py-24 bg-surface-container-low dark:bg-slate-900" style={{ clipPath: 'polygon(0 0, 100% 5%, 100% 100%, 0 95%)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 space-y-4">
            <h2 className="font-headline text-4xl font-black text-on-surface dark:text-slate-100 tracking-tighter">THE CORE ECOSYSTEM</h2>
            <div className="h-1 w-24 bg-secondary rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Smart Matching */}
            <div className="md:col-span-8 bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-8 flex flex-col justify-between group overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="font-label text-xs font-bold text-secondary tracking-widest uppercase">AI Engine</span>
                  <h3 className="font-headline text-3xl font-bold dark:text-slate-100">Smart Matching</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 max-w-md">AI connects students by interests, goals, and study styles.</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-secondary/20 group-hover:text-secondary transition-colors">psychology</span>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden h-48">
                <img
                  alt="Smart Matching"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  src="/assets/campus-students.jpg"
                />
              </div>
            </div>
            {/* Event Hub */}
            <div className="md:col-span-4 bg-primary text-white rounded-xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-headline text-3xl font-bold mb-4">Event Hub</h3>
                <p className="text-primary-container text-sm leading-relaxed">Create, discover and RSVP to campus events with one tap integration.</p>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl">
                <img
                  alt="Events"
                  className="rounded-xl shadow-lg w-full h-40 object-cover"
                  src="/assets/campus-aerial.jpg"
                />
              </div>
            </div>
            {/* Sports Finder */}
            <div className="md:col-span-4 bg-secondary text-white rounded-xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-headline text-3xl font-bold">Sports Finder</h3>
                <p className="text-white/80 text-sm mt-2">Challenge peers and track athletic life across campus intramurals.</p>
              </div>
              <div className="relative h-40 mt-4 overflow-hidden rounded-xl">
                <img
                  alt="Sports"
                  className="w-full h-full object-cover"
                  src="/assets/campus-sports.jpg"
                />
              </div>
            </div>
            {/* Venue and Wellbeing */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary text-3xl mb-4 block">stadium</span>
                  <h4 className="font-headline text-xl font-bold dark:text-slate-100">Venue Booking</h4>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-2">Reserve spaces instantly for clubs or private study.</p>
                </div>
                <img
                  alt="Venue"
                  className="mt-4 rounded-lg h-32 w-full object-cover"
                  src="/assets/campus-library.jpg"
                />
              </div>
              <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-tertiary text-3xl mb-4 block">health_and_safety</span>
                  <h4 className="font-headline text-xl font-bold dark:text-slate-100">Wellbeing</h4>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-2">Daily mood tracking with real-time analytics.</p>
                </div>
                <img
                  alt="Wellbeing"
                  className="mt-4 rounded-lg h-32 w-full object-cover"
                  src="/assets/campus-events.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Leadership */}
      <section className="py-24 bg-surface dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 dark:text-slate-100">Built for Campus Leadership</h2>
            <p className="text-on-surface-variant dark:text-slate-400 font-medium">Enterprise solutions for every stakeholder.</p>
          </div>
          <div className="space-y-12">
            {/* CIO Section */}
            <div className="bg-primary text-white rounded-[2rem] p-10 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/2 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl">security</span>
                    </div>
                    <div className="font-label text-xs font-bold uppercase tracking-widest text-primary-container">Chief Information Officer</div>
                  </div>
                  <h3 className="font-headline text-4xl font-extrabold tracking-tight">CIO / IT Directors</h3>
                  <p className="text-lg text-primary-container leading-relaxed">Integration, security, shadow IT reduction, and control-based access.</p>
                  <ul className="space-y-4">
                    {['Seamless integration with LMS/SIS', 'ISO 27001 compliant architecture', 'Single Sign-On (SSO) and SAML support', 'Role-based granular access control'].map(item => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary">check_circle</span>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:w-1/2 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 w-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="font-headline font-bold">SECURITY PROTOCOLS</span>
                      <span className="bg-secondary/20 text-secondary text-[10px] px-2 py-1 rounded">ENCRYPTED</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full w-full"><div className="h-full w-full bg-secondary rounded-full"></div></div>
                    <div className="h-2 bg-white/10 rounded-full w-5/6"><div className="h-full w-4/5 bg-white/40 rounded-full"></div></div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-secondary">99.9%</div>
                        <div className="text-[10px] uppercase opacity-60">Uptime</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-secondary">256-bit</div>
                        <div className="text-[10px] uppercase opacity-60">AES</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Retention and Recruitment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container-lowest dark:bg-slate-800 p-10 rounded-[2rem] border-b-8 border-secondary">
                <div className="font-label text-xs font-bold text-secondary mb-4 uppercase">Dean of Students</div>
                <h4 className="font-headline text-3xl font-bold mb-4 dark:text-slate-100">Retention and Life Stats</h4>
                <p className="text-on-surface-variant dark:text-slate-400 mb-8">Detect social isolation early warning signals to improve overall student wellbeing.</p>
                <div className="flex items-end gap-2 h-32">
                  <div className="bg-secondary/40 w-full h-[40%] rounded-t-lg"></div>
                  <div className="bg-secondary/60 w-full h-[65%] rounded-t-lg"></div>
                  <div className="bg-secondary w-full h-[90%] rounded-t-lg relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">+22%</div>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-lowest dark:bg-slate-800 p-10 rounded-[2rem] border-b-8 border-primary">
                <div className="font-label text-xs font-bold text-primary mb-4 uppercase">VP Enrollment</div>
                <h4 className="font-headline text-3xl font-bold mb-4 dark:text-slate-100">The Recruitment Edge</h4>
                <p className="text-on-surface-variant dark:text-slate-400 mb-8">Showcase vibrant campus life during tours through the Tribe Explore portal.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-surface-container-low dark:bg-slate-700 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                    <span className="text-sm font-bold dark:text-slate-200">18% Increase in Admissions Yield</span>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container-low dark:bg-slate-700 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-secondary">diversity_1</span>
                    <span className="text-sm font-bold dark:text-slate-200">4.8/5 Student Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Athletic Director */}
            <div className="bg-on-surface dark:bg-slate-800 text-white rounded-[3rem] p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-r from-secondary/20 to-secondary/40 -skew-x-12"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2">
                  <div className="bg-secondary text-white px-4 py-1 rounded-full font-label text-xs font-bold inline-block mb-6 uppercase">Athletic Director</div>
                  <h3 className="font-headline text-4xl font-extrabold mb-6">Scoreboard-Ready Scheduling</h3>
                  <p className="text-slate-300 mb-8 leading-relaxed">Automate intramural rankings, bracket generation, and venue scheduling. Give non-varsity athletes the elite experience.</p>
                  <Link to="/register" className="bg-secondary text-white px-8 py-3 rounded-full font-headline font-bold hover:brightness-110 transition-all inline-block">Explore Arena</Link>
                </div>
                <div className="lg:w-1/2 w-full">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-headline font-bold">LIVE RANKINGS</span>
                      <span className="font-label text-[10px] opacity-60">SOCCER INTRAMURALS</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                        <span className="font-headline text-lg italic text-secondary">01</span>
                        <div className="flex-1 h-2 bg-white/20 rounded-full"><div className="h-full w-[95%] bg-secondary rounded-full"></div></div>
                        <span className="font-label text-xs">980 PTS</span>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl opacity-70">
                        <span className="font-headline text-lg italic">02</span>
                        <div className="flex-1 h-2 bg-white/20 rounded-full"><div className="h-full w-[80%] bg-white/40 rounded-full"></div></div>
                        <span className="font-label text-xs">840 PTS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Strip */}
      <section className="py-12 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-24 px-8 opacity-30 dark:opacity-20">
          {['Stanford University', 'MIT', 'Oxford', 'Yale', 'UCLA', 'Harvard'].map(name => (
            <span key={name} className="font-headline text-3xl font-black tracking-tighter uppercase whitespace-nowrap">{name}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-secondary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <h2 className="font-headline text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter">THE CAMPUS OF THE FUTURE IS ALREADY HERE.</h2>
              <p className="text-xl text-white/90 font-medium">Join 500+ global institutions fostering meaningful student connection.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="bg-white text-secondary px-12 py-5 rounded-full font-headline text-xl font-black hover:scale-105 transition-transform shadow-xl">Get Started Now</Link>
                <Link to="/demo" className="bg-transparent border-2 border-white/30 text-white px-12 py-5 rounded-full font-headline text-xl font-black hover:bg-white/10 transition-colors">Book Consultation</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
