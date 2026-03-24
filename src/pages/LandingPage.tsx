import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/marketing/HeroSection';
import PillarsSection from '../components/marketing/PillarsSection';
import EcosystemSection from '../components/marketing/EcosystemSection';
import StatsRow from '../components/marketing/StatsRow';
import RoleCarousel from '../components/marketing/RoleCarousel';
import PricingSection from '../components/marketing/PricingSection';
import CTASection from '../components/marketing/CTASection';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsRow />
      <PillarsSection />
      <EcosystemSection />
      <RoleCarousel />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
