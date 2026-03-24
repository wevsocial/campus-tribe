import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="rounded-3xl p-16 text-center"
          style={{ background: 'linear-gradient(135deg, #FF7F50 0%, #ffb08a 100%)' }}
        >
          <h2 className="font-lexend font-900 text-4xl text-white mb-4">
            Revolutionize your campus experience today.
          </h2>
          <p className="text-white/90 text-lg max-w-xl mx-auto mb-10">
            Join hundreds of institutions already using Campus Tribe to connect students, boost engagement, and improve wellbeing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button className="!bg-white !text-secondary hover:!bg-surface" size="lg">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button className="!bg-transparent !border-2 !border-white !text-white hover:!bg-white/10" variant="outline" size="lg">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
