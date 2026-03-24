import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, X, Users, Calendar, MapPin, Heart, Trophy, Zap, Shield, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const pillars = [
  { icon: <Zap size={28} />, title: 'Smart Matching', desc: 'AI-powered club and event recommendations based on interests, schedule, and peer connections.' },
  { icon: <Calendar size={28} />, title: 'Event Hub', desc: 'Discover, RSVP, and manage events across campus — from club meetups to major concerts.' },
  { icon: <Trophy size={28} />, title: 'Sports Finder', desc: 'Find intramural leagues, free agent spots, and real-time scoreboards for every sport.' },
  { icon: <MapPin size={28} />, title: 'Venue Booking', desc: 'Check availability and book campus spaces in minutes with conflict detection.' },
  { icon: <Heart size={28} />, title: 'Wellbeing', desc: 'Daily mood check-ins, peer support circles, and counseling resource links — all in one tab.' },
]

const roles = [
  {
    title: 'Students',
    emoji: '🎓',
    color: 'bg-primary',
    features: ['Discover clubs & events', 'AI recommendations', 'Join sports leagues', 'Wellness check-ins', 'Campus map & venues'],
  },
  {
    title: 'Staff & Teachers',
    emoji: '🏫',
    color: 'bg-tertiary',
    features: ['Monitor engagement', 'Flag at-risk students', 'Create events', 'LMS integration', 'Compliance reports'],
  },
  {
    title: 'Coaches',
    emoji: '🏆',
    color: 'bg-secondary',
    features: ['League management', 'Live scoreboards', 'Team rosters', 'Free agent pool', 'Schedule builder'],
  },
  {
    title: 'CIO / IT Directors',
    emoji: '🔒',
    color: 'bg-on-surface',
    features: ['SSO / SAML', 'FERPA compliance', 'API integrations', 'Security audit logs', 'Role management'],
  },
]

const competitors = [
  { feature: 'Club Management', ct: true, mc: true, ant: true, cg: true, iml: false, canvas: false },
  { feature: 'Intramural Sports', ct: true, mc: false, ant: false, cg: false, iml: true, canvas: false },
  { feature: 'Venue Booking', ct: true, mc: true, ant: true, cg: true, iml: false, canvas: false },
  { feature: 'AI Recommendations', ct: true, mc: false, ant: false, cg: false, iml: false, canvas: false },
  { feature: 'Wellness Check-ins', ct: true, mc: false, ant: false, cg: false, iml: false, canvas: false },
  { feature: 'LMS Integration', ct: true, mc: true, ant: true, cg: false, iml: false, canvas: true },
  { feature: 'FERPA Compliant', ct: true, mc: true, ant: true, cg: true, iml: false, canvas: true },
  { feature: 'Mobile-first UX', ct: true, mc: false, ant: false, cg: true, iml: true, canvas: false },
  { feature: 'At-risk Alerts', ct: true, mc: false, ant: true, cg: false, iml: false, canvas: false },
  { feature: 'Single Platform', ct: true, mc: false, ant: false, cg: false, iml: false, canvas: false },
]

const stats = [
  { value: '19.9M', label: 'Students in higher ed' },
  { value: '$16B', label: 'Lost annually to dropouts' },
  { value: '8+', label: 'Tools replaced' },
  { value: '4.8★', label: 'Avg satisfaction score' },
]

const testimonials = [
  {
    quote: "Campus Tribe replaced 6 different systems for us. Our club participation went up 43% in one semester.",
    author: "Dr. Sarah Chen",
    title: "VP Student Affairs, Westbrook University",
    avatar: "SC",
  },
  {
    quote: "Our intramural signups tripled. Students love the app and coaches finally have real-time scoreboards.",
    author: "Marcus Johnson",
    title: "Athletic Director, Lakeside College",
    avatar: "MJ",
  },
  {
    quote: "SSO setup took 30 minutes. FERPA compliance was out of the box. IT loves it.",
    author: "Priya Sharma",
    title: "CIO, Pacific State University",
    avatar: "PS",
  },
]

const pricing = [
  {
    name: 'Starter',
    price: '$5',
    period: '/student/yr',
    color: 'border-primary/20',
    badge: null,
    features: ['Up to 5,000 students', 'Club & event management', 'Basic analytics', 'Email support', 'Mobile app'],
  },
  {
    name: 'Growth',
    price: '$10',
    period: '/student/yr',
    color: 'border-primary',
    badge: 'Most Popular',
    features: ['Unlimited students', 'Sports & venue booking', 'AI recommendations', 'At-risk alerts', 'LMS integration', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    color: 'border-secondary/40',
    badge: 'Full Suite',
    features: ['Everything in Growth', 'White-label', 'SSO / SAML', 'FERPA compliance', 'Dedicated CSM', 'SLA guarantee'],
  },
]

function PillarCarousel() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % pillars.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {pillars.map((p, i) => (
            <div key={i} className="min-w-full px-4">
              <div className="card max-w-md mx-auto text-center py-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {p.icon}
                </div>
                <h3 className="font-headline font-800 text-xl text-on-surface mb-2">{p.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        {pillars.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-primary w-6' : 'bg-primary/30'}`} />
        ))}
      </div>
    </div>
  )
}

function CheckIcon({ val }: { val: boolean }) {
  return val
    ? <Check size={16} className="text-tertiary mx-auto" />
    : <X size={16} className="text-on-surface-variant/30 mx-auto" />
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero-gradient animate-gradient min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: Math.random() * 200 + 50, height: Math.random() * 200 + 50,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.3 }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-white text-sm font-label font-bold">Now in Beta — Limited Early Access</span>
            </div>
            <h1 className="font-headline font-900 text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
              The OS for<br />Campus Life
            </h1>
            <p className="text-white/80 text-xl leading-relaxed mb-8 max-w-xl">
              One platform for clubs, events, sports, venues, and wellness. Replace 8 tools with one unified campus engagement hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-white text-primary px-8 py-4 rounded-full font-label font-bold text-base hover:bg-white/90 transition-all flex items-center gap-2 justify-center">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <a href="#demo" className="border-2 border-white/50 text-white px-8 py-4 rounded-full font-label font-bold text-base hover:bg-white/10 transition-all text-center">
                Watch Demo
              </a>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="font-headline font-900 text-3xl text-white">{s.value}</div>
                  <div className="text-white/60 text-xs font-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-surface" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-900 text-4xl text-on-surface mb-4">Everything campus life needs</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Five powerful pillars that work together to create a thriving, connected campus community.</p>
          </div>
          <div className="hidden md:grid grid-cols-5 gap-4">
            {pillars.map((p, i) => (
              <div key={i} className="card text-center hover:shadow-card-hover transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {p.icon}
                </div>
                <h3 className="font-headline font-700 text-base text-on-surface mb-2">{p.title}</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden">
            <PillarCarousel />
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-20 bg-surface-lowest" id="university">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-900 text-4xl text-on-surface mb-4">Built for every role on campus</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">One platform, tailored experiences for students, staff, coaches, and IT.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, i) => (
              <div key={i} className="card group hover:shadow-card-hover transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${r.color} flex items-center justify-center text-2xl mb-4`}>
                  {r.emoji}
                </div>
                <h3 className="font-headline font-800 text-lg text-on-surface mb-4">{r.title}</h3>
                <ul className="flex flex-col gap-2">
                  {r.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Check size={14} className="text-tertiary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Comparison */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-900 text-4xl text-on-surface mb-4">How we compare</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">One platform vs. a patchwork of legacy tools.</p>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-surface">
                  <th className="text-left py-3 px-4 font-label font-bold text-on-surface-variant">Feature</th>
                  <th className="py-3 px-3 font-label font-bold text-primary bg-primary/5 rounded-t">Campus Tribe</th>
                  <th className="py-3 px-3 font-label font-bold text-on-surface-variant">Modern Campus</th>
                  <th className="py-3 px-3 font-label font-bold text-on-surface-variant">Anthology</th>
                  <th className="py-3 px-3 font-label font-bold text-on-surface-variant">CampusGroups</th>
                  <th className="py-3 px-3 font-label font-bold text-on-surface-variant">IMLeagues</th>
                  <th className="py-3 px-3 font-label font-bold text-on-surface-variant">Canvas</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((row, i) => (
                  <tr key={i} className="border-b border-surface/50 hover:bg-surface/50">
                    <td className="py-3 px-4 text-on-surface font-label font-bold text-xs">{row.feature}</td>
                    <td className="py-3 px-3 text-center bg-primary/5"><CheckIcon val={row.ct} /></td>
                    <td className="py-3 px-3 text-center"><CheckIcon val={row.mc} /></td>
                    <td className="py-3 px-3 text-center"><CheckIcon val={row.ant} /></td>
                    <td className="py-3 px-3 text-center"><CheckIcon val={row.cg} /></td>
                    <td className="py-3 px-3 text-center"><CheckIcon val={row.iml} /></td>
                    <td className="py-3 px-3 text-center"><CheckIcon val={row.canvas} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-900 text-4xl text-on-surface mb-4">Loved by campus communities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-hero-gradient flex items-center justify-center text-white font-label font-bold text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-label font-bold text-sm text-on-surface">{t.author}</div>
                    <div className="text-on-surface-variant text-xs">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-surface" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-900 text-4xl text-on-surface mb-4">Simple, transparent pricing</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Per-student annual pricing. No surprises, no hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((p, i) => (
              <div key={i} className={`card border-2 ${p.color} relative ${i === 1 ? 'md:-mt-4 md:mb-4' : ''}`}>
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-label font-bold px-3 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-headline font-800 text-lg text-on-surface mb-2">{p.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="font-headline font-900 text-4xl text-on-surface">{p.price}</span>
                    <span className="text-on-surface-variant text-sm pb-1">{p.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-3 mb-8">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Check size={14} className="text-tertiary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center py-3 rounded-full font-label font-bold text-sm transition-all ${i === 1 ? 'bg-primary text-white hover:bg-primary/90' : 'border-2 border-primary/30 text-primary hover:border-primary'}`}>
                  {p.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-hero-gradient animate-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-headline font-900 text-5xl text-white mb-6">Ready to transform your campus?</h2>
          <p className="text-white/80 text-xl mb-8">Join 200+ institutions building more engaged, connected campus communities.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary px-8 py-4 rounded-full font-label font-bold text-base hover:bg-white/90 transition-all flex items-center gap-2 justify-center">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <a href="mailto:hello@campustribe.io" className="border-2 border-white/50 text-white px-8 py-4 rounded-full font-label font-bold text-base hover:bg-white/10 transition-all">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
