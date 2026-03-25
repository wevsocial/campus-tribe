import { Link } from 'react-router-dom';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';

export default function SchoolPage() {
  return (
    <div className="bg-surface text-on-surface font-body">
      <PublicNav />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative px-8 py-20 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 z-10">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label text-xs font-bold tracking-widest uppercase">
                The Connected School
              </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface">
                Connect, Engage <br />
                <span className="text-secondary italic">&amp; Thrive Together</span>
              </h1>
              <p className="font-body text-lg text-on-surface-variant max-w-lg leading-relaxed">
                Campus Tribe brings the modern school community together. From sports tournaments to study groups, manage every dimension of school life in one powerful platform.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/demo" className="bg-secondary text-white px-8 py-4 rounded-full font-headline font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-secondary/20">
                  Book a Demo
                </Link>
                <button className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-full font-headline font-bold text-lg hover:opacity-80 transition-all">
                  Explore Features
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-container/30 rounded-full blur-3xl"></div>
              <div className="relative z-10 overflow-hidden shadow-2xl rounded-3xl transform -rotate-1">
                <img
                  alt="School students engaged in activities"
                  className="w-full h-[500px] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7AcdfpRQpzzQyjP5fKEFGdMuEnoe9ck082BroDD5SlMUd64HcbNHuXLvDYZ7Pg0sl4RNyOvpUooC5Q2vHC0h8GBx-xXC1QAXeDtA9V7zzmtPmwI4zRr2Mz8Es6SG5-x2WssT52jVNloPyGBHiO0ha6sYcfB_rSbJ1M_IOZ4Vb_3WXLtblH6sSG0SXAXA36hjrOGUg738o-a-83v70YAdoCVGCTt0_z2eBpETzKOyuLbaD8_beTvkn1ijuFcrm4nzygty44eloVMs"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 z-20 bg-surface-container-lowest p-6 rounded-xl shadow-xl flex items-center gap-4 border border-outline-variant/15">
                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">school</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">Trusted Platform</p>
                  <p className="font-label text-xs text-on-surface-variant">500+ Schools Enrolled</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline text-3xl font-bold tracking-tight mb-4">School Features</h2>
              <p className="font-body text-on-surface-variant max-w-2xl">Everything a modern school needs to keep students engaged, safe, and thriving.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden group border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all">
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">how_to_reg</span>
                <h3 className="font-headline text-2xl font-bold mb-4">Secure Attendance Tracking</h3>
                <p className="font-body text-on-surface-variant max-w-md">Real-time attendance with biometric-ready check-in. Automate absence notifications to parents instantly.</p>
                <div className="mt-8 rounded-lg overflow-hidden border border-outline-variant/10">
                  <img alt="School sports" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCM2UVLIZCIrUz3ENLRBXzBVWI4I5cLklFHfhHoRaHY-oMRXJwsB9oitQh0N2qdGK_mAn-3KlOIwsvnxepNvTrmGKA3Z-Qcr7nn3nmrhXeqMo8BCkhUpKzGr6Fpb-JAtPTrhgxcm-PdHsoUKGJ0rhhFJ7RGaq-uQ-qKq3tpDDjjRy1BURYjief0_q5eHGqFMj8m5E2pnz_Iku-JLnK_U2HVW7Sic22oDGdde599LvSi2s55Payh4LecFLJW81IQaHhpYoDWa2Os-Y" />
                </div>
              </div>
              <div className="md:col-span-4 bg-secondary text-white rounded-xl p-8 flex flex-col justify-center text-center">
                <span className="material-symbols-outlined text-5xl mb-6">groups</span>
                <h3 className="font-headline text-2xl font-bold mb-2">Study Groups</h3>
                <p className="opacity-80">Match students by subject, learning style, and schedule.</p>
              </div>
              <div className="md:col-span-4 bg-tertiary-container text-on-tertiary-container rounded-xl p-8 flex flex-col justify-center text-center">
                <span className="material-symbols-outlined text-5xl mb-6">family_restroom</span>
                <h3 className="font-headline text-2xl font-bold mb-2">Parent Portals</h3>
                <p className="opacity-80 text-sm">Give parents a real-time window into their child's school life.</p>
              </div>
              <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 border border-outline-variant/10 shadow-sm">
                <div className="flex-1">
                  <h3 className="font-headline text-2xl font-bold mb-4">Gamified Achievements</h3>
                  <p className="font-body text-on-surface-variant">Drive engagement with house points, badges, and leaderboards that celebrate every student's success.</p>
                  <div className="flex gap-2 mt-6">
                    {['bg-secondary-container', 'bg-primary-container', 'bg-tertiary-container', 'bg-surface-container-highest'].map((c, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full ${c} flex items-center justify-center font-bold text-xs`}>{i === 3 ? '+8' : ''}</div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
                  <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-secondary">emoji_events</span>
                    <span className="text-xs font-label">House Championship - Team A leads with 2,450 pts</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-primary">stars</span>
                    <span className="text-xs font-label">New badge unlocked: Perfect Attendance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <span className="font-label text-xs tracking-widest uppercase text-secondary font-bold">Success Story</span>
                <blockquote className="font-headline text-3xl font-bold text-on-surface leading-snug">
                  "Campus Tribe transformed how our students connect. Engagement is up 40% and parents actually feel part of the school community."
                </blockquote>
                <div className="flex items-center gap-4">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlUl6z2MIkCMBSPrsucAo80DhcOyJ5GT-EE4GFA3irQNxkZCceMDl1PPCdbEzmYUvd6HaEZ2KqOQJVwah9c8O8mCnPA2HmCKmUND7Yehj8TGEoi2EsEKtyNJYepwC4ARnHWsiQCn_usY2qyRIBNjVeEWmlpSJLznKdbidoez0gg7gpRByPPtX587WgMJ091xDmCTLS9kXi7tO8kFw9WGfUmVFJgojKgeDwEHKp-2kzc7o__X7fVz1NkzGCV5eBo"
                    alt="Principal testimonial"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-headline font-bold text-sm">Dr. Sarah Mitchell</p>
                    <p className="font-label text-xs text-on-surface-variant">Principal, Westfield Academy</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { n: '40%', label: 'Engagement Increase' },
                  { n: '500+', label: 'Schools Enrolled' },
                  { n: '98%', label: 'Parent Satisfaction' },
                  { n: '24/7', label: 'Platform Uptime' },
                ].map((s) => (
                  <div key={s.label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm text-center">
                    <div className="font-headline text-4xl font-black text-secondary">{s.n}</div>
                    <div className="font-label text-xs uppercase tracking-wider text-outline mt-2 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto bg-secondary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
              <span className="font-headline font-black text-[14rem] text-white leading-none">SCHOOL</span>
            </div>
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tighter">Ready to transform your school?</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">Join hundreds of forward-thinking schools already using Campus Tribe.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/demo" className="bg-white text-secondary font-headline font-bold px-10 py-4 rounded-full text-lg hover:opacity-90 transition-all shadow-2xl">Book a Demo</Link>
                <Link to="/pricing" className="border-2 border-white text-white font-headline font-bold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all">View Pricing</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
