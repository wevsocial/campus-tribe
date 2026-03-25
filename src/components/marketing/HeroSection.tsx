import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-[#f6f6f9] relative overflow-hidden flex flex-col">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0047AB22 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,71,171,0.08)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0047AB] flex items-center justify-center">
            <span className="text-white font-bold text-sm">CT</span>
          </div>
          <span className="font-lexend font-800 text-[#0047AB] text-lg">Campus Tribe</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-[#0047AB] transition">University</Link>
          <Link to="/school" className="text-sm font-semibold text-gray-700 hover:text-[#0047AB] transition">School</Link>
          <Link to="/preschool" className="text-sm font-semibold text-gray-700 hover:text-[#0047AB] transition">Preschool</Link>
          <Link to="/pricing" className="text-sm font-semibold text-gray-700 hover:text-[#0047AB] transition">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-[#0047AB] transition px-4 py-2">Login</Link>
          <Link to="/register" className="bg-[#0047AB] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="flex items-center max-w-7xl mx-auto px-6 pt-32 pb-20 gap-16 w-full flex-1">
        {/* Left */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-pulse" />
            <span className="text-sm font-semibold text-[#0047AB]">Campus Tribe Connect</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Where Campus
            <br />
            <span className="text-[#0047AB]">Life Connects</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
            The all-in-one student engagement platform. Smart matching, events, sports leagues, wellness tracking, and more.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <button className="bg-[#0047AB] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition shadow-md">
                Book a Demo
              </button>
            </Link>
            <Link to="/pricing">
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-[#0047AB] hover:text-[#0047AB] transition">
                Explore Platform
              </button>
            </Link>
          </div>

          <div className="flex gap-10 mt-12">
            {[
              { value: '19.9M', label: 'Students Engaged' },
              { value: '$16B', label: 'Economic Impact' },
              { value: '8+', label: 'Countries' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Lexend, sans-serif' }}>{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Floating app mockup */}
        <motion.div
          className="flex-1 hidden lg:flex justify-center items-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
            style={{ maxWidth: 480, width: '100%' }}
          >
            {/* Floating notification card */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-xl flex items-center gap-2 z-10 border border-gray-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">RSVP Confirmed</div>
                <div className="text-xs text-gray-500">Spring Sports Meet</div>
              </div>
            </div>

            {/* Floating avatar badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-xl flex items-center gap-2 z-10 border border-gray-100">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((n) => (
                  <img key={n} src={`https://i.pravatar.cc/32?img=${n + 10}`} alt="" className="w-7 h-7 rounded-full border-2 border-white" />
                ))}
              </div>
              <div className="text-xs font-semibold text-gray-800">+248 joined today</div>
            </div>

            {/* Main mockup card */}
            <div
              className="rounded-2xl p-6 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #0047AB 0%, #2056ba 100%)' }}
            >
              {/* Fake dashboard header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-white/70 text-xs mb-0.5">Welcome back</div>
                  <div className="text-white font-bold text-sm">Alex Johnson</div>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                  <img src="https://i.pravatar.cc/32?img=5" alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Chart bars */}
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="text-white text-xs font-medium mb-3 opacity-80">Weekly Engagement</div>
                <div className="flex items-end gap-2" style={{ height: 80 }}>
                  {[45, 70, 55, 90, 65, 80, 50].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-white/30"
                      style={{ height: `${h}%`, minHeight: 4 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="flex-1 text-center text-white/50 text-[10px]">{d}</div>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white/10 rounded-xl p-3">
                  <div className="text-white/60 text-xs mb-1">Events Today</div>
                  <div className="text-white text-2xl font-bold">8</div>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3">
                  <div className="text-white/60 text-xs mb-1">Active Clubs</div>
                  <div className="text-white text-2xl font-bold">24</div>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3">
                  <div className="text-white/60 text-xs mb-1">Streak</div>
                  <div className="text-white text-2xl font-bold">7d</div>
                </div>
              </div>

              {/* Mini event card */}
              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF7F50] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  APR<br />
                  <span className="text-xs font-normal leading-none">18</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate">Spring Sports Championship</div>
                  <div className="text-white/60 text-xs">Athletic Centre · 2:00 PM</div>
                </div>
                <div className="bg-green-400 text-white text-[10px] font-bold px-2 py-1 rounded-full">Going</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
