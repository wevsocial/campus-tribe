import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

const heroCards = [
  { label: 'Collaborate Better.', gradient: 'linear-gradient(135deg, #0047AB 0%, #759eff 100%)' },
  { label: 'Game On.', gradient: 'linear-gradient(135deg, #FF7F50 0%, #ffb08a 100%)' },
  { label: 'Connect Better.', gradient: 'linear-gradient(135deg, #00A86B 0%, #5de0b0 100%)' },
  { label: 'Find Your Tribe.', gradient: 'linear-gradient(135deg, #7B2D8B 0%, #c48fd4 100%)' },
  { label: 'Varsity Arena.', gradient: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)' },
];

const interestCards = [
  { icon: '🎾', title: 'Tennis Club', body: 'Open tryouts this Saturday', color: '#D6E4FF' },
  { icon: '🤖', title: 'Robotics Hackathon', body: 'Registration closes Apr 12', color: '#FFE4D9' },
  { icon: '✍️', title: 'Writing Contest', body: 'Submit your story by Apr 1', color: '#C8F5E2' },
];

const rankingCards = [
  { rank: '#1', name: 'Elias Vance', score: '2,840 pts', badge: '🥇' },
  { rank: '#3', name: 'Sarah Chen', score: '2,420 pts', badge: '🥉' },
  { rank: '#5', name: 'Marcus Thorne', score: '2,110 pts', badge: '⭐' },
];

export const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-surface flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-container text-primary px-4 py-2 rounded-full text-sm font-jakarta font-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
            Campus Tribe Connect
          </div>
          <h1 className="font-lexend font-900 text-5xl lg:text-6xl text-on-surface leading-tight mb-6">
            Where Campus{' '}
            <br />
            <span className="text-primary italic">Life Connects</span>
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-lg">
            The all-in-one student engagement platform. Smart matching, events, sports leagues, wellness tracking, and more to unified for your campus.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg">Book a Demo</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">Explore Platform</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-8">
            {[
              { value: '19.9M', label: 'Students served' },
              { value: '8+', label: 'Countries' },
              { value: '97%', label: 'Satisfaction rate' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-lexend font-900 text-2xl text-on-surface">{s.value}</p>
                <p className="text-xs font-jakarta text-on-surface-variant mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right - card stack + popups */}
        <div className="relative h-[520px] w-full hidden lg:block">
          {/* Card stack */}
          {heroCards.map((card, i) => (
            <div
              key={i}
              className={`slider-card-${i + 1} absolute inset-0 rounded-2xl overflow-hidden`}
              style={{ background: card.gradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <p className="font-lexend font-900 text-white text-4xl">{card.label}</p>
              </div>
            </div>
          ))}

          {/* Interest popup cards */}
          {interestCards.map((card, i) => (
            <div
              key={i}
              className={`interest-card-${i + 1} absolute bottom-8 left-8 bg-white rounded-xl shadow-rise p-3 flex items-center gap-3 min-w-[220px]`}
            >
              <span className="text-2xl">{card.icon}</span>
              <div>
                <p className="text-sm font-jakarta font-700 text-on-surface">{card.title}</p>
                <p className="text-xs text-on-surface-variant">{card.body}</p>
              </div>
            </div>
          ))}

          {/* Ranking popup cards */}
          {rankingCards.map((card, i) => (
            <div
              key={i}
              className={`rank-card-${i + 1} absolute top-8 right-8 bg-white rounded-xl shadow-rise p-3 flex items-center gap-3 min-w-[200px]`}
            >
              <span className="text-xl">{card.badge}</span>
              <div>
                <p className="text-sm font-jakarta font-700 text-on-surface">{card.rank} {card.name}</p>
                <p className="text-xs text-on-surface-variant">{card.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
