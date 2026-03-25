import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Camera, Shield, Users, BarChart2, Star } from 'lucide-react';

const features = [
  {
    icon: <BarChart2 size={28} className="text-[#FF8C42]" />,
    title: 'Daily Reports',
    desc: 'Parents get real-time updates on meals, nap times, and activities - right from their phone.',
  },
  {
    icon: <Camera size={28} className="text-[#FF8C42]" />,
    title: 'Parent Portal',
    desc: 'Photo sharing, pickup authorization, secure messaging with teachers - all in one place.',
  },
  {
    icon: <Users size={28} className="text-[#FF8C42]" />,
    title: 'Staff Tools',
    desc: 'Activity planning, child profiles, developmental milestone tracking built for teachers.',
  },
  {
    icon: <Shield size={28} className="text-[#FF8C42]" />,
    title: 'Safety First',
    desc: 'Pickup authorization, emergency contacts, visitor logs - keeping children secure every moment.',
  },
];

const roles = [
  {
    emoji: '👨‍👩‍👧',
    title: 'Parents',
    subtitle: 'Stay connected every moment',
    points: ['Real-time daily reports', 'Photo updates throughout the day', 'Direct messaging with teachers', 'Pickup authorization management'],
  },
  {
    emoji: '🧑‍🏫',
    title: 'Teachers and Staff',
    subtitle: 'Everything you need to nurture',
    points: ['Child profile management', 'Developmental milestone tracking', 'Activity and lesson planning', 'Quick daily report submission'],
  },
  {
    emoji: '🏫',
    title: 'Directors and Admin',
    subtitle: 'Run your center with confidence',
    points: ['Full center overview dashboard', 'Staff scheduling and management', 'Enrollment and waitlist tracking', 'Compliance and reporting tools'],
  },
];

const galleryPhotos = [
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b24?w=400&q=80',
  'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=400&q=80',
  'https://images.unsplash.com/photo-1564144006388-615f4a736e4f?w=400&q=80',
  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80',
  'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&q=80',
];

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'Free forever',
    highlight: false,
    features: ['Up to 30 children', 'Basic daily reports', 'Parent notifications', 'Staff profiles'],
  },
  {
    name: 'Growth',
    price: '$149',
    period: 'per month',
    highlight: true,
    features: ['Up to 150 children', 'Full parent portal', 'Photo sharing', 'Daily reports', 'Milestone tracking', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored pricing',
    highlight: false,
    features: ['Multi-center management', 'Custom branding', 'SSO integration', 'Dedicated success manager', 'API access'],
  },
];

export default function PreschoolPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-orange-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFB347, #FF8C42)' }}>
            <Sun size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">Campus Tribe <span className="text-[#FF8C42]">Preschool</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-gray-600 hover:text-[#FF8C42] transition-colors">Features</a>
          <a href="#gallery" className="text-sm text-gray-600 hover:text-[#FF8C42] transition-colors">Gallery</a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-[#FF8C42] transition-colors">Pricing</a>
          <Link to="/login" className="text-sm font-medium text-white px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #FFB347, #FF8C42)' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=1400&q=80"
            alt="Preschool"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,140,66,0.88) 0%, rgba(255,179,71,0.75) 50%, rgba(255,140,66,0.55) 100%)' }} />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="text-xl">🌟</span>
              Trusted by 500+ childcare centers
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>
              A Safe, Nurturing Space<br />for Little Learners
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Daily reports, parent updates, activity planning, and staff coordination - all in one warm, intuitive platform.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl text-[#FF8C42] font-bold text-lg shadow-lg hover:shadow-xl transition-all bg-white"
              >
                Start Free Trial
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl font-bold text-lg border-2 border-white text-white hover:bg-white/10 transition-all"
              >
                Book a Tour
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Everything a childcare center needs
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Designed with warmth, built for trust. Every feature was shaped by real preschool teachers and parents.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-orange-50 rounded-2xl p-6 border border-orange-100"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #FFB347, #FF8C42)' }}>
                <span className="text-white">{f.icon}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF3E0)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>Built for everyone in the village</h2>
            <p className="text-xl text-gray-500">It takes a village to raise a child. Our platform supports every member.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-md border border-orange-100"
              >
                <div className="text-5xl mb-4">{r.emoji}</div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">{r.title}</h3>
                <p className="text-[#FF8C42] font-medium text-sm mb-5">{r.subtitle}</p>
                <ul className="space-y-2">
                  {r.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                      <Star size={14} className="text-[#FFB347] fill-[#FFB347] flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>A day in the life</h2>
          <p className="text-xl text-gray-500">Every moment is worth capturing and sharing with families.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryPhotos.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden aspect-square"
            >
              <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF3E0)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>Simple, transparent pricing</h2>
            <p className="text-xl text-gray-500">Start for free. Grow at your own pace. No surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-3xl p-8 ${plan.highlight ? 'text-white shadow-2xl scale-105' : 'bg-white shadow-md border border-orange-100'}`}
                style={plan.highlight ? { background: 'linear-gradient(135deg, #FFB347, #FF8C42)' } : {}}
              >
                <h3 className={`font-bold text-xl mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className={`text-4xl font-extrabold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Lexend, sans-serif' }}>{plan.price}</div>
                <div className={`text-sm mb-6 ${plan.highlight ? 'text-white/80' : 'text-gray-400'}`}>{plan.period}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                      <span className={plan.highlight ? 'text-white' : 'text-[#FF8C42]'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${plan.highlight ? 'bg-white text-[#FF8C42] hover:bg-orange-50' : 'text-white hover:opacity-90'}`}
                  style={!plan.highlight ? { background: 'linear-gradient(135deg, #FFB347, #FF8C42)' } : {}}
                >
                  {plan.price === '$0' ? 'Get Started Free' : plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFB347, #FF8C42)' }}>
            <Sun size={18} className="text-white" />
          </div>
          <span className="font-bold text-white">Campus Tribe Preschool</span>
        </div>
        <p className="text-gray-400 text-sm">2026 Campus Tribe Inc. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link>
          <Link to="/school" className="text-gray-400 hover:text-white text-sm transition-colors">K-12</Link>
          <Link to="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</Link>
        </div>
      </footer>
    </div>
  );
}
