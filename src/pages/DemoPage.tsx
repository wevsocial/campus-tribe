import { Link } from 'react-router-dom';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';

export default function DemoPage() {
  return (
    <div className="bg-surface text-on-surface font-body">
      <PublicNav />
      <main className="pt-24 pb-20 overflow-x-hidden">
        {/* Hero: How Campus Tribe Works */}
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="mb-16">
            <span className="font-label text-xs tracking-widest uppercase text-secondary font-bold bg-secondary-container px-3 py-1 rounded-full">Process Discovery</span>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tight mt-6 leading-none">
              How Campus <br />
              <span style={{background:'linear-gradient(135deg, #0047AB 0%, #759eff 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Tribe Works</span>
            </h1>
          </div>

          {/* Bento Grid Steps */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Step 01 */}
            <div className="md:col-span-4 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500 border border-outline-variant/10 shadow-sm">
              <div>
                <div className="font-headline text-6xl font-black text-primary/10 mb-6">01</div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">Campus Signs Up</h3>
                <p className="text-on-surface-variant leading-relaxed">Admin creates a high-performance institution profile. Seamlessly integrate your existing database via CSV or SSO secure import.</p>
              </div>
              <div className="mt-12 flex items-center text-primary font-bold gap-2 group-hover:gap-4 transition-all">
                <span className="font-label text-sm uppercase tracking-wider">Institution Setup</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="md:col-span-5 bg-primary-container p-8 rounded-xl flex flex-col justify-between text-on-primary-container group hover:scale-[1.02] transition-all duration-500">
              <div>
                <div className="font-headline text-6xl font-black text-on-primary-container/20 mb-6">02</div>
                <h3 className="font-headline text-3xl font-bold mb-4">Students Onboard</h3>
                <p className="leading-relaxed font-medium">Verified .edu join process. Using our Kinetic matching engine, students map interests to discover their personal campus ecosystem immediately.</p>
              </div>
              <div className="mt-12">
                <div className="flex -space-x-4">
                  {[
                    '/assets/campus-university.jpg',
                    '/assets/campus-school.jpg',
                    '/assets/campus-matching.jpg',
                  ].map((src, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-primary bg-slate-200 overflow-hidden">
                      <img alt="User" src={src} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary flex items-center justify-center font-bold text-xs text-on-primary">+4k</div>
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="md:col-span-3 bg-tertiary-container p-8 rounded-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500">
              <div>
                <div className="font-headline text-6xl font-black text-on-tertiary-container/20 mb-6">03</div>
                <h3 className="font-headline text-2xl font-bold text-on-tertiary-container mb-4">Campus Thrives</h3>
                <p className="text-on-tertiary-container/80 leading-relaxed">Events fill to capacity, connections multiply, and institutional wellbeing metrics show measurable growth.</p>
              </div>
              <div className="mt-8 bg-on-tertiary-container/10 p-4 rounded-lg flex items-center gap-4">
                <span className="material-symbols-outlined text-on-tertiary-container">insights</span>
                <div className="font-label text-xs text-on-tertiary-container font-bold">+24% Engagement</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stakeholders */}
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4">Built for Every <span className="text-primary italic">Stakeholder</span></h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto font-medium">A specialized interface for every member of the academic community, ensuring privacy, engagement, and operational excellence.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                  </div>
                  <h4 className="font-headline text-2xl font-bold uppercase tracking-tight">Institution Admin</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ul className="space-y-4">
                    {[['dashboard', 'Engagement Dashboard'], ['edit_calendar', 'CRUD Events & Venues'], ['heat', 'Wellbeing Heat-maps']].map(([icon, label]) => (
                      <li key={label} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-1">{icon}</span>
                        <span className="text-on-surface-variant font-medium">{label}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-4">
                    {[['file_download', 'Exportable PDF Reports'], ['groups', 'Manage Group Activities'], ['poll', 'Run Real-time Surveys']].map(([icon, label]) => (
                      <li key={label} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-1">{icon}</span>
                        <span className="text-on-surface-variant font-medium">{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 rounded-xl overflow-hidden bg-surface-container h-48 relative border border-outline-variant/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 h-24 flex items-end gap-2">
                    {[40, 60, 85, 55, 45].map((h, i) => (
                      <div key={i} className="w-full rounded-t-lg" style={{height:`${h}%`, background:`rgba(0,71,171,${0.2 + i*0.1})`}}></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-8">
                <div className="bg-surface-container-lowest rounded-xl p-8 flex-1 border border-outline-variant/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-on-secondary">
                      <span className="material-symbols-outlined">family_restroom</span>
                    </div>
                    <h4 className="font-headline text-2xl font-bold uppercase tracking-tight">Parent Portal</h4>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {[['visibility', 'Read-only activity view'], ['trending_up', 'Wellbeing trend graphs'], ['lock', 'Privacy-first data protection']].map(([icon, label]) => (
                      <li key={label} className="flex items-center gap-3 text-on-surface-variant font-medium">
                        <span className="material-symbols-outlined text-secondary">{icon}</span> {label}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-secondary-container/30 p-4 rounded-lg flex items-center gap-4 border border-secondary/10">
                    <span className="material-symbols-outlined text-secondary">security</span>
                    <span className="font-label text-xs font-bold text-secondary">ENCRYPTED READ-ONLY ACCESS</span>
                  </div>
                </div>
                <div className="bg-primary p-8 rounded-xl text-on-primary">
                  <h4 className="font-headline text-xl font-bold mb-2">Student Experience</h4>
                  <p className="text-sm opacity-80 mb-6">Tailored for mobile-first engagement and rapid matching.</p>
                  <div className="flex gap-2 flex-wrap">
                    {['Study Partners', 'Daily Mood Log', 'Venue Booking'].map(tag => (
                      <span key={tag} className="bg-on-primary/10 px-3 py-1 rounded-full text-xs font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-8 py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="lg:w-1/2">
              <span className="font-label text-sm text-primary font-bold tracking-widest">METRIC DRIVEN</span>
              <h2 className="font-headline text-4xl md:text-5xl font-black mt-4 mb-6">Real-Time <br />Performance Tracking</h2>
              <p className="text-on-surface-variant text-lg font-medium leading-relaxed">Our platform isn't just a social hub; it's a diagnostic tool for campus health. Monitor atmospheric data in real-time to prevent student isolation and optimize resources.</p>
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div className="font-headline text-5xl font-black text-primary leading-none">94%</div>
                  <div className="font-label text-xs uppercase tracking-wider text-outline mt-2 font-bold">Student Satisfaction</div>
                </div>
                <div>
                  <div className="font-headline text-5xl font-black text-secondary leading-none">12ms</div>
                  <div className="font-label text-xs uppercase tracking-wider text-outline mt-2 font-bold">Matching Latency</div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-inner overflow-hidden border border-outline-variant/10">
                <div className="flex flex-col gap-3">
                  {[
                    { rank: '#1', name: 'Elias Vance', sport: 'Tennis', uni: '1st', intra: '2nd', nat: '15th', rankColor: 'text-primary' },
                    { rank: '#2', name: 'Sarah Jenkins', sport: 'Swimming', uni: '2nd', intra: '1st', nat: '42nd', rankColor: 'text-primary' },
                    { rank: '#3', name: 'Marcus Thorne', sport: 'Basketball', uni: '4th', intra: '3rd', nat: '102nd', rankColor: 'text-primary' },
                    { rank: '#4', name: 'Elena Rossi', sport: 'Volleyball', uni: '1st', intra: '1st', nat: '5th', rankColor: 'text-primary' },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <span className={`font-headline font-bold ${r.rankColor}`}>{r.rank}</span>
                        <div>
                          <div className="font-bold text-sm text-on-surface">{r.name}</div>
                          <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{r.sport}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-center">
                        <div><div className="text-[10px] font-bold text-primary">{r.uni}</div><div className="text-[8px] text-outline uppercase">Uni</div></div>
                        <div><div className="text-[10px] font-bold text-secondary">{r.intra}</div><div className="text-[8px] text-outline uppercase">Intra</div></div>
                        <div><div className="text-[10px] font-bold text-tertiary">{r.nat}</div><div className="text-[8px] text-outline uppercase">Nat</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-8 py-12">
          <div className="bg-on-background rounded-[2rem] p-12 text-center overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h2 className="font-headline text-4xl md:text-6xl font-black text-surface-container-lowest relative z-10">
              Ready to transform your <br /><span className="text-primary-fixed">Campus Tribe?</span>
            </h2>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link to="/register" className="bg-primary text-on-primary px-10 py-4 rounded-full font-black font-headline text-lg hover:bg-primary-dim transition-all shadow-2xl shadow-primary/40">Request Access</Link>
              <button className="text-surface-container-lowest font-bold font-label tracking-widest hover:text-primary-fixed transition-colors">WATCH FULL PRODUCT FILM</button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
