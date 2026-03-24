import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PricingSection from '../components/marketing/PricingSection';
import ComparisonTable from '../components/marketing/ComparisonTable';
import CTASection from '../components/marketing/CTASection';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <PricingSection />
        <ComparisonTable />
        <CTASection />
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
