import React from 'react';
import { Users, Calendar, Trophy, Building2, Heart, UserCheck, Target, BarChart2 } from 'lucide-react';

const pillars = [
  { Icon: Users,      title: 'Smart Matching',   desc: 'AI-powered matching connects students with clubs, events, and peers.', gradient: 'linear-gradient(135deg, #0047AB 0%, #759eff 100%)' },
  { Icon: Calendar,   title: 'Event Hub',         desc: 'Create, discover, and RSVP to campus events with ease.', gradient: 'linear-gradient(135deg, #FF7F50 0%, #ffb08a 100%)' },
  { Icon: Trophy,     title: 'Sports Finder',     desc: 'Find leagues, track standings, and join intramural teams.', gradient: 'linear-gradient(135deg, #00A86B 0%, #5de0b0 100%)' },
  { Icon: Building2,  title: 'Venue Booking',     desc: 'Book campus spaces in seconds. No more paperwork.', gradient: 'linear-gradient(135deg, #7B2D8B 0%, #c48fd4 100%)' },
  { Icon: Heart,      title: 'Wellbeing',         desc: 'Daily mood tracking, wellness resources, and peer support.', gradient: 'linear-gradient(135deg, #E91E63 0%, #f48fb1 100%)' },
  { Icon: UserCheck,  title: 'Parent Portal',     desc: 'Keep families connected and informed with real-time updates.', gradient: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)' },
  { Icon: Target,     title: 'Group Activities',  desc: 'Coordinate group projects, trips, and collaborative events.', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFCC80 100%)' },
  { Icon: BarChart2,  title: 'Surveys & Polls',   desc: 'Gather feedback instantly from your campus community.', gradient: 'linear-gradient(135deg, #009688 0%, #80CBC4 100%)' },
];

export const PillarsSection: React.FC = () => {
  const doubled = [...pillars, ...pillars];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <p className="text-sm font-semibold text-[#0047AB] mb-3 uppercase tracking-wider">What we offer</p>
        <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Lexend, sans-serif' }}>
          Pillars of student engagement,{' '}
          <span className="text-[#0047AB] italic">Unified.</span>
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex gap-6 animate-scroll" style={{ width: 'max-content' }}>
          {doubled.map((pillar, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 rounded-2xl overflow-hidden bg-white border border-gray-100"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
            >
              <div className="h-36 relative flex items-center justify-center" style={{ background: pillar.gradient }}>
                <pillar.Icon size={48} className="text-white" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-base text-gray-900 mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>{pillar.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
