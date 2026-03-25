import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { CheckCircle, Users, BookOpen, Activity, Bell, Calendar, Award, ChevronRight } from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Class Management', desc: 'Teachers manage rosters, assignments, and grades in one place. Parents stay informed automatically.' },
  { icon: Users, title: 'Student Clubs & Activities', desc: 'From debate to drama, students discover and join school clubs with a swipe.' },
  { icon: Activity, title: 'Attendance Tracking', desc: 'Digital attendance with instant parent notifications and trend reports for counselors.' },
  { icon: Bell, title: 'Parent Communication', desc: 'Two-way messaging, permission slips, and event RSVPs -- parents never miss a beat.' },
  { icon: Calendar, title: 'Event Scheduling', desc: 'School-wide calendar with sports days, fairs, and performances all in one view.' },
  { icon: Award, title: 'Student Recognition', desc: 'Leaderboards, badges, and achievement tracking to motivate every learner.' },
];

const testimonials = [
  { name: 'Principal Rivera', school: 'Westwood Middle School', quote: 'Campus Tribe cut our admin overhead by 60%. Teachers focus on teaching, not paperwork.' },
  { name: 'Ms. Chen', school: 'Lakeview High School', quote: 'Parent engagement doubled in our first semester. The messaging tools are a game changer.' },
  { name: 'Coach Davis', school: 'Ridgeline Academy', quote: 'Managing sports schedules and rosters used to take hours. Now it takes minutes.' },
];

const stats = [
  { value: '94%', label: 'Parent engagement rate' },
  { value: '3x', label: 'Faster attendance processing' },
  { value: '40%', label: 'Reduction in admin workload' },
  { value: '500+', label: 'K-12 schools enrolled' },
];

export default function SchoolPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f9]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#FF6B35] relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80&auto=format"
            alt="School"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center text-white">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              For K-12 Schools
            </div>
            <h1 className="font-lexend font-extrabold text-5xl lg:text-6xl leading-tight mb-6">
              Every Student Thrives.
              <br />
              Every Parent Connected.
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-lg">
              Campus Tribe for Schools brings together attendance, clubs, sports, parent messaging, and academic tools into one beautifully simple platform designed for grades 6-12.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" className="bg-white text-[#FF7F50] hover:bg-white/90">Book a Demo</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">View Pricing</Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 space-y-4">
              {[
                { icon: '📊', title: 'Class Average: 87%', sub: 'Grade 10A - Math', change: '+4% this month', color: 'text-green-300' },
                { icon: '📅', title: 'Science Fair', sub: 'Tomorrow, 9:00 AM', change: '47 students registered', color: 'text-yellow-300' },
                { icon: '🏆', title: 'Basketball Finals', sub: 'Westwood vs Lakeview', change: 'Friday 4:00 PM', color: 'text-blue-300' },
              ].map((card) => (
                <div key={card.title} className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="text-3xl">{card.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{card.title}</div>
                    <div className="text-white/70 text-sm">{card.sub}</div>
                  </div>
                  <div className={`text-sm font-medium ${card.color}`}>{card.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-lexend font-extrabold text-4xl text-[#FF7F50]">{s.value}</div>
              <div className="text-gray-500 mt-1 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-lexend font-extrabold text-4xl text-gray-900 mb-4">Everything Your School Needs</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">One platform connecting students, teachers, parents, and administrators with the tools they need every day.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={24} className="text-[#FF7F50]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role breakdown */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-lexend font-extrabold text-4xl text-gray-900 text-center mb-16">Built for Every Role</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Students', emoji: '🎒', color: 'bg-blue-50 border-blue-100', perks: ['Join clubs and teams', 'Track grades and assignments', 'RSVP to school events', 'Earn badges and rewards'] },
              { role: 'Teachers', emoji: '📚', color: 'bg-orange-50 border-orange-100', perks: ['Digital attendance', 'Assignment management', 'Parent communication', 'Performance analytics'] },
              { role: 'Parents', emoji: '👨‍👩‍👧', color: 'bg-green-50 border-green-100', perks: ['Real-time notifications', 'Attendance visibility', 'Permission slip signing', 'Direct teacher messaging'] },
              { role: 'Principals', emoji: '🏫', color: 'bg-purple-50 border-purple-100', perks: ['School-wide analytics', 'Staff management', 'Event oversight', 'Budget tracking'] },
            ].map((r) => (
              <div key={r.role} className={`rounded-2xl p-6 border ${r.color}`}>
                <div className="text-4xl mb-3">{r.emoji}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{r.role}</h3>
                <ul className="space-y-2">
                  {r.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-[#00A86B] flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#f6f6f9]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-lexend font-extrabold text-4xl text-gray-900 text-center mb-16">Trusted by School Leaders</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                <p className="text-gray-600 text-base leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.school}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#FF7F50] to-[#e05a25] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-lexend font-extrabold text-4xl mb-4">Ready to Transform Your School?</h2>
          <p className="text-xl text-white/90 mb-8">Join 500+ K-12 schools using Campus Tribe to engage students and connect communities.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <button className="bg-white text-[#FF7F50] font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2">
                Start Free Trial <ChevronRight size={18} />
              </button>
            </Link>
            <Link to="/pricing">
              <button className="border border-white/50 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
                See Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
