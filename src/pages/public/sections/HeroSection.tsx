import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, GraduationCap, Globe, Users, Star } from 'lucide-react';
import { gsap } from 'gsap';

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLElement>; // Add heroRef prop
}

export const HeroSection: React.FC<HeroSectionProps> = ({ heroRef }) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Set initial states
    gsap.set([badgeRef.current, titleRef.current, subtitleRef.current, statsRef.current, buttonsRef.current, trustRef.current], {
      opacity: 0,
      y: 50
    });

    // Animate elements in sequence
    tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
      .to(titleRef.current, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.3")
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.2")
      .to(statsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.2")
      .to(buttonsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.2")
      .to(trustRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.2");

    // Floating animation for background elements
    gsap.to(".floating-element", {
      y: -20,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    });
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-pulse floating-element"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-yellow-300 rounded-full animate-bounce floating-element"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-green-300 rounded-full animate-pulse floating-element"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 border-2 border-blue-300 rounded-full animate-bounce floating-element"></div>
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div ref={badgeRef}>
            <Badge className="mb-8 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300 text-lg px-6 py-2">
              <GraduationCap className="mr-2 h-5 w-5" />
              🎓 A Website for Every School
            </Badge>
          </div>
          
          {/* Main Heading - Updated to match User Flow */}
          <h1 ref={titleRef} className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-green-200 bg-clip-text text-transparent">
              Transform Your School's
            </span>
            <br />
            <span className="text-yellow-300">
              Digital Presence
            </span>
          </h1>          
          
          {/* Subtitle - Updated to match User Flow */}
          <p ref={subtitleRef} className="text-xl md:text-2xl lg:text-3xl mb-12 text-blue-100 font-light max-w-4xl mx-auto leading-relaxed">
            Professional websites and digital solutions for every Liberian school, 
            <br />
            <span className="text-yellow-200 font-semibold">no matter its size or location</span>
          </p>
          
          {/* Stats Section - Updated with User Flow requirements */}
          <div ref={statsRef} className="grid md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-yellow-300 mb-2">150+</div>
              <div className="text-blue-100">Total Schools</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-green-300 mb-2">15</div>
              <div className="text-blue-100">Counties Reached</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-blue-300 mb-2">48hr</div>
              <div className="text-blue-100">Setup Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-purple-300 mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
          </div>
          
          {/* CTA Buttons - Updated with exact User Flow CTA */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-bold shadow-2xl"
              >
                Onboard Your School
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-bold"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn How It Works
            </Button>
          </div>          
          
          {/* Trust Indicators */}
          <div ref={trustRef} className="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-200">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm">Rated 5/5 by Schools</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Trusted by 150+ Schools</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">Serving All Liberia</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse floating-element"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl animate-pulse floating-element"></div>
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-blue-300/20 rounded-full blur-2xl animate-bounce floating-element"></div>
      <div className="absolute top-1/3 right-20 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl animate-pulse floating-element"></div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
