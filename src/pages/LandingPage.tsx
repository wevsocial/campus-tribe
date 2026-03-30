import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';
import { DemoRequestForm } from '../components/marketing/DemoRequestForm';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pillars = [
    { title: 'Smart Matching', icon: 'psychology', img: '/assets/campus-matching.jpg' },
    { title: 'Event Hub', icon: 'event', img: '/assets/campus-events.jpg' },
    { title: 'Sports Finder', icon: 'sports_soccer', img: '/assets/campus-sports.jpg' },
    { title: 'Venue Booking', icon: 'location_on', img: '/assets/campus-venues.jpg' },
    { title: 'Wellbeing Checks', icon: 'favorite', img: '/assets/campus-wellbeing.jpg' },
    { title: 'Parent Portal', icon: 'family_restroom', img: '/assets/campus-parent.jpg' },
    { title: 'Group Activities', icon: 'groups', img: '/assets/campus-clubs.jpg' },
    { title: 'Surveys & Polls', icon: 'poll', img: '/assets/campus-surveys.jpg' },
  ];
  const roles = [
    { title: 'Students', desc: 'Discover events, clubs, and peers that match your vibe.', img: '/assets/campus-students.jpg' },
    { title: 'Admins & Teachers', desc: 'Manage events, track wellbeing, and build community.', img: '/assets/campus-teachers.jpg' },
    { title: 'Coaches', desc: 'Coordinate teams, book venues, and track athlete rankings.', img: '/assets/campus-coach.jpg' },
    { title: 'IT Directors', desc: 'One platform, zero headaches. SSO, APIs, and compliance built in.', img: '/assets/campus-admin.jpg' },
  ];
  const pillarsDouble = [...pillars, ...pillars];
  const rolesDouble = [...roles, ...roles];

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-hero-copy]', {
        y: 22,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      });

      gsap.from('[data-fade-up]', {
        scrollTrigger: {
          trigger: '[data-fade-up]',
          start: 'top 85%',
        },
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
      });

      gsap.to('[data-parallax-orb]', {
        yPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-hero-section]',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="bg-surface text-on-surface font-body">
      <PublicNav />
      <main className="pt-24 overflow-hidden">
        {/* Hero */}
        <section data-hero-section className="relative max-w-7xl mx-auto px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div data-parallax-orb className="pointer-events-none absolute -left-16 top-28 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div data-hero-copy className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label uppercase tracking-widest font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Campus Tribe Connect
            </div>
            <h1 data-hero-copy className="font-headline font-extrabold text-5xl lg:text-7xl leading-[1.05] tracking-tight text-on-surface">
              Where Campus <br />
              <span className="text-primary italic">Life Connects</span>
            </h1>
            <p data-hero-copy className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
              The all-in-one student engagement platform. Events, venues, clubs, sports, wellbeing: unified in one platform your students will actually use.
            </p>
            <div data-hero-copy className="flex flex-wrap gap-4">
              <Link to="/register" className="bg-primary text-on-primary font-headline font-bold px-8 py-4 rounded-full text-lg shadow-xl shadow-primary/30 hover:opacity-90 transition-all">Get Started Free</Link>
              <Link to="/university" className="bg-surface-container-high text-on-surface font-headline font-bold px-8 py-4 rounded-full text-lg hover:bg-surface-container-highest transition-all">See Platform</Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative h-[600px] flex items-center justify-center" style={{perspective:'1000px'}}>
            {/* Interest cards */}
            {[
              { icon: 'sports_tennis', label: 'Interest added - Tennis', delay: '0s', color: 'bg-tertiary-container text-on-tertiary-container' },
              { icon: 'smart_toy', label: 'Robotics club - Hackathon tonight', delay: '3s', color: 'bg-secondary-container text-secondary' },
              { icon: 'edit_note', label: 'Writing contest - Deadline tomorrow', delay: '6s', color: 'bg-primary-container text-on-primary-container' },
            ].map((c, i) => (
              <div key={i} className="absolute left-1/4 bottom-0 z-50 w-72 interest-card" style={{animationDelay: c.delay}}>
                <div className="bg-surface-container-lowest shadow-2xl p-4 rounded-xl flex items-center gap-4 border-2 border-primary/10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.color}`}>
                    <span className="material-symbols-outlined text-sm">{c.icon}</span>
                  </div>
                  <div>
                    <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase">Activity Feed</p>
                    <p className="font-headline font-bold text-xs">{c.label}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Ranking cards */}
            {[
              { rank: '#1', color: 'text-primary', name: 'Elias Vance', sport: 'Tennis', pts: '4,280 Points', delay: '0s' },
              { rank: '#3', color: 'text-secondary', name: 'Sarah Chen', sport: 'Badminton', pts: '3,950 Points', delay: '4s' },
              { rank: '#5', color: 'text-tertiary', name: 'Marcus Thorne', sport: 'Squash', pts: '3,120 Points', delay: '8s' },
            ].map((r, i) => (
              <div key={i} className="absolute right-0 top-0 z-50 w-64 ranking-card" style={{animationDelay: r.delay}}>
                <div className="bg-surface-container-lowest shadow-2xl p-4 rounded-xl flex items-center gap-4 border-2 border-primary/10">
                  <div className="text-center w-10">
                    <p className="text-[8px] font-label font-bold text-slate-400 uppercase">Rank</p>
                    <p className={`font-headline font-black text-xl ${r.color}`}>{r.rank}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div>
                    <p className="text-[8px] font-label font-bold text-slate-400 uppercase">{r.name} &bull; {r.sport}</p>
                    <p className="font-headline font-bold text-sm text-on-surface">{r.pts}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Main slider stack */}
            <div className="relative w-full max-w-sm aspect-[3/4]">
              {[
                { src: '/assets/campus-hero.jpg', label: 'Collaborate Better.' },
                { src: '/assets/campus-aerial.jpg', label: 'Connect Better IRL.' },
                { src: '/assets/campus-school.jpg', label: 'Find Your Tribe.' },
                { src: '/assets/campus-sports.jpg', label: 'Game On.' },
                { src: '/assets/campus-university.jpg', label: 'Varsity Arena.' },
              ].map((card, i) => (
                <div key={i} className="slider-card bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-surface-container">
                  <img alt={card.label} className="w-full h-full object-cover" src={card.src} />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent text-white">
                    <p className="font-headline font-bold text-2xl">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-surface-container-low py-10 border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '60%', label: 'feel lonely on campus' },
              { stat: '7hrs+', label: 'daily social media use' },
              { stat: '1 in 4', label: 'students dropout' },
              { stat: '$16B', label: 'lost annually in disengagement' },
            ].map(({ stat, label }) => (
              <div key={stat}>
                <p className="font-lexend font-extrabold text-3xl text-primary">{stat}</p>
                <p className="text-on-surface-variant text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ecosystem */}
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight">Everything your campus needs</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Scalable solutions across all educational tiers, designed with precision and engagement in mind.</p>
            </div>
            <div data-fade-up className="grid md:grid-cols-3 gap-8">
              {[
                { tier: 'University', color: 'text-secondary', border: 'hover:border-secondary/20', iconBg: 'bg-secondary-container text-secondary', icon: 'school', title: 'Higher Ed Hub', desc: 'Empowering adults with sophisticated networking, career alignment, and elite sports coordination.', features: ['Varsity Sports Engine', 'Alumni Career Network', 'Venue Booking API'], btn: 'University Access', btnClass: 'border border-secondary text-secondary hover:bg-secondary hover:text-white', to: '/' },
                { tier: 'School', color: 'text-primary', border: 'hover:border-primary/20', iconBg: 'bg-primary-container text-on-primary-container', icon: 'history_edu', title: 'Secondary Suite', desc: 'Building community and focus during the most transformative years of a student\'s life.', features: ['Club & Society Manager', 'Wellbeing Pulse Checks', 'House Points Tracking'], btn: 'School Portal', btnClass: 'bg-primary text-white hover:opacity-90', to: '/school' },
                { tier: 'Preschool', color: 'text-tertiary', border: 'hover:border-tertiary/20', iconBg: 'bg-tertiary-container text-on-tertiary-container', icon: 'child_care', title: 'Early Years Engage', desc: 'Bridging the gap between educators and parents through safe, interactive communication.', features: ['Secure Photo Sharing', 'Developmental Milestones', 'Guardian Notifications'], btn: 'Preschool Access', btnClass: 'border border-tertiary text-tertiary hover:bg-tertiary hover:text-white', to: '/preschool' },
              ].map((card) => (
                <div key={card.tier} className={`group bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent ${card.border} hover:-translate-y-2`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform ${card.iconBg}`}>
                    <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                  </div>
                  <span className={`font-label font-bold text-xs uppercase tracking-widest ${card.color}`}>{card.tier}</span>
                  <h3 className="font-headline font-bold text-2xl mt-2 mb-4">{card.title}</h3>
                  <p className="text-on-surface-variant mb-6">{card.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {card.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={card.to} className={`block w-full py-3 rounded-full font-headline font-bold text-center transition-colors ${card.btnClass}`}>{card.btn}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 mb-16">
            <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight">
              Pillars of student engagement, <span className="text-primary italic">Unified.</span>
            </h2>
          </div>
          <div data-fade-up className="overflow-hidden">
            <div className="pillar-track-continuous">
              {pillarsDouble.map((p, i) => (
                <div key={i} className="flex-shrink-0 w-72 mx-4 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
                  <div className="h-44 overflow-hidden">
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">{p.icon}</span>
                    <span className="font-headline font-bold text-sm">{p.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="bg-surface-container-low py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 mb-16 text-center">
            <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight">Built for <span className="text-primary italic">Every Role</span></h2>
            <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto">From students discovering their place to IT directors securing the ecosystem.</p>
          </div>
          <div data-fade-up className="overflow-hidden">
            <div className="role-track">
              {rolesDouble.map((r, i) => (
                <div key={i} className="flex-shrink-0 w-80 mx-4 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
                  <div className="h-52 overflow-hidden">
                    <img src={r.img} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-headline font-bold text-lg mb-2">{r.title}</h4>
                    <p className="text-on-surface-variant text-sm">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto orange-editorial-gradient rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
              <span className="font-headline font-black text-[18rem] text-white leading-none">TRIBE</span>
            </div>
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-white tracking-tighter">Revolutionize your campus experience today.</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">Join 200+ institutions already transforming student life with Campus Tribe.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="bg-white text-secondary font-headline font-bold px-10 py-4 rounded-full text-lg hover:opacity-90 transition-all shadow-2xl">Get Started Free</Link>
                <Link to="/demo" className="border-2 border-white text-white font-headline font-bold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all">Watch Demo</Link>
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
