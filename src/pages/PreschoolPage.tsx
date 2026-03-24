import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Heart, Star, Users, Camera, MessageCircle, Calendar, Shield, Smile, ChevronRight } from 'lucide-react';

const features = [
  { icon: Heart, title: 'Daily Reports', desc: 'Parents receive beautiful daily summaries of their child\'s mood, meals, naps, and activities -- with photos.', color: 'bg-pink-50', iconColor: 'text-pink-500' },
  { icon: Camera, title: 'Photo Gallery', desc: 'Secure, private photo sharing. Staff upload moments from the day; parents view and download from their phone.', color: 'bg-yellow-50', iconColor: 'text-yellow-500' },
  { icon: MessageCircle, title: 'Parent Messaging', desc: 'Direct two-way messaging between parents and teachers. Real-time, secure, and organized by child.', color: 'bg-blue-50', iconColor: 'text-blue-500' },
  { icon: Calendar, title: 'Activity Scheduling', desc: 'Storytime, art class, music -- all scheduled and shared. Parents know exactly what their child is doing.', color: 'bg-purple-50', iconColor: 'text-purple-500' },
  { icon: Users, title: 'Staff Management', desc: 'Director tools for staff scheduling, certifications, and performance tracking. All in one dashboard.', color: 'bg-green-50', iconColor: 'text-green-500' },
  { icon: Shield, title: 'Safe & Secure', desc: 'FERPA-compliant, SOC 2 certified. Your child\'s data is encrypted and never shared with third parties.', color: 'bg-orange-50', iconColor: 'text-orange-500' },
];

const activities = [
  { time: '8:00 AM', activity: 'Arrival and Free Play', emoji: '🧸' },
  { time: '9:00 AM', activity: 'Circle Time and Morning Song', emoji: '🎵' },
  { time: '9:30 AM', activity: 'Art and Craft Workshop', emoji: '🎨' },
  { time: '10:30 AM', activity: 'Snack Time', emoji: '🍎' },
  { time: '11:00 AM', activity: 'Outdoor Play and Exploration', emoji: '🌳' },
  { time: '12:00 PM', activity: 'Lunch', emoji: '🥗' },
  { time: '1:00 PM', activity: 'Naptime', emoji: '😴' },
  { time: '3:00 PM', activity: 'Story Reading and Pickup', emoji: '📚' },
];

const testimonials = [
  { name: 'Jennifer Lawson', role: 'Parent, Sunshine Preschool', quote: 'I love getting the daily photo updates. It feels like I\'m there with my daughter even when I\'m at work.' },
  { name: 'Director Kim', role: 'Little Stars Learning Center', quote: 'Campus Tribe helped us cut down on paperwork by 80%. Our teachers spend more time with children now.' },
  { name: 'Maria Santos', role: 'Parent, Bright Minds Academy', quote: 'The messaging feature is amazing. I can reach Ms. Thompson instantly if I have a concern about Lily.' },
];

export default function PreschoolPage() {
  return (
    <div className="min-h-screen bg-[#fffbf7]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20" style={{ background: 'linear-gradient(135deg, #FFE4D9 0%, #FFF0E8 50%, #E8F5E9 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white text-orange-500 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <Smile size={16} className="text-orange-400" />
              For Preschools and Early Learning
            </div>
            <h1 className="font-lexend font-extrabold text-5xl lg:text-6xl leading-tight text-gray-900 mb-6">
              Little Ones.
              <br />
              <span className="text-orange-400">Big Connections.</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
              Campus Tribe for Preschools keeps parents in the loop and staff organized. Daily reports, photo sharing, messaging, and activity tracking -- all in one joyful platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <button className="bg-orange-400 text-white font-semibold px-8 py-3 rounded-full hover:bg-orange-500 transition-colors flex items-center gap-2 shadow-md">
                  Start Free Trial <ChevronRight size={18} />
                </button>
              </Link>
              <Link to="/pricing">
                <button className="border border-orange-200 text-orange-500 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors">
                  See Pricing
                </button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block space-y-3">
            {/* Daily report card mock */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-2xl">🌟</div>
                <div>
                  <div className="font-semibold text-gray-900">Daily Report - Emma</div>
                  <div className="text-gray-400 text-sm">Tuesday, March 24</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Mood', value: 'Happy', emoji: '😊' },
                  { label: 'Lunch', value: 'Finished', emoji: '🍱' },
                  { label: 'Nap', value: '2 hrs', emoji: '😴' },
                ].map((item) => (
                  <div key={item.label} className="bg-orange-50 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-800">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
                Ms. Rodriguez: Emma had a wonderful day! She loved the finger painting activity and made a beautiful butterfly. 🦋
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
              <div className="flex items-center gap-3">
                <Camera size={20} className="text-green-500" />
                <div className="font-medium text-gray-800">3 new photos from today</div>
              </div>
              <div className="flex gap-2 mt-3">
                {['🖼', '🖼', '🖼'].map((_, i) => (
                  <div key={i} className="flex-1 h-16 rounded-xl" style={{ background: ['#DBEAFE', '#DCFCE7', '#FEF3C7'][i] }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '98%', label: 'Parent satisfaction rate' },
            { value: '5 min', label: 'Daily report creation' },
            { value: '2,000+', label: 'Preschools enrolled' },
            { value: '500k+', label: 'Happy families' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-lexend font-extrabold text-4xl text-orange-400">{s.value}</div>
              <div className="text-gray-500 mt-1 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-lexend font-extrabold text-4xl text-gray-900 mb-4">Everything You Need to Care and Connect</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Purpose-built for early childhood education. Simple enough for busy parents, powerful enough for directors.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={24} className={f.iconColor} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Daily Schedule */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-lexend font-extrabold text-4xl text-gray-900 mb-4">Share the Whole Day, Effortlessly</h2>
            <p className="text-gray-500 text-lg">Staff log activities as they happen. Parents see a beautiful timeline in their app.</p>
          </div>
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.time} className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 border border-orange-100">
                <div className="text-2xl">{a.emoji}</div>
                <div className="w-20 text-sm font-medium text-orange-400 flex-shrink-0">{a.time}</div>
                <div className="text-gray-700 font-medium">{a.activity}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #FFF7F3 0%, #F0FAF5 100%)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-lexend font-extrabold text-4xl text-gray-900 text-center mb-16">Parents and Directors Love Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-base leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center" style={{ background: 'linear-gradient(135deg, #FF7F50, #FFA07A)' }}>
        <div className="max-w-3xl mx-auto px-6 text-white">
          <h2 className="font-lexend font-extrabold text-4xl mb-4">Connect Your Preschool Community Today</h2>
          <p className="text-xl text-white/90 mb-8">Join 2,000+ preschools building stronger bonds between families and educators.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <button className="bg-white text-orange-500 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors shadow-md">
                Start for Free
              </button>
            </Link>
            <Link to="/demo">
              <button className="border border-white/50 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
                Watch a Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
