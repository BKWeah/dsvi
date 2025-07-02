import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { StatsSection } from './sections/StatsSection';
import { CTASection } from './sections/CTASection';
import { Footer } from './components/Footer';

export const NewHomePage: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onLoginClick={handleLoginClick}
        heroRef={heroRef}
      />
      
      <main>
        <section id="home">
          <HeroSection heroRef={heroRef} />
        </section>
        
        <section id="features">
          <FeaturesSection />
        </section>
        
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        
        <section id="stats">
          <StatsSection />
        </section>
        
        <section id="cta">
          <CTASection />
        </section>
      </main>

      <Footer />
    </div>
  );
};
