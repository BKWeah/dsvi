import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { AboutSection } from './sections/AboutSection';
import { TeamSection } from './sections/TeamSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { PackagesSection } from './sections/PackagesSection';
import { StatsSection } from './sections/StatsSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { FAQSection } from './sections/FAQSection';
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
        
        <section id="about">
          <AboutSection />
        </section>
        
        <section id="team">
          <TeamSection />
        </section>
        
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        
        <section id="packages">
          <PackagesSection />
        </section>
        
        <section id="stats">
          <StatsSection />
        </section>
        
        <section id="testimonials">
          <TestimonialsSection />
        </section>
        
        <section id="faq">
          <FAQSection />
        </section>
        
        <section id="cta">
          <CTASection />
        </section>
      </main>

      <Footer />
    </div>
  );
};
