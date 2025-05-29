import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Globe, Award, School, Clock, Shield, Heart } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const stats = [
    {
      number: "150",
      suffix: "+",
      label: "Schools Served",
      description: "Trusted by educational institutions across Liberia",
      icon: School,
      color: "text-blue-600",
      animatedValue: 0
    },
    {
      number: "15",
      suffix: "",
      label: "Counties Reached", 
      description: "Serving schools in all major Liberian counties",
      icon: Globe,
      color: "text-green-600",
      animatedValue: 0
    },
    {
      number: "48",
      suffix: "hr",
      label: "Setup Time",
      description: "From registration to live website launch",
      icon: Clock,
      color: "text-orange-600",
      animatedValue: 0
    },
    {
      number: "24",
      suffix: "/7",
      label: "Support Available",
      description: "Dedicated support team always ready to help",
      icon: Heart,
      color: "text-pink-600",
      animatedValue: 0
    }
  ];

  useEffect(() => {
    // Animate the section entrance
    gsap.fromTo(sectionRef.current, 
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 50%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate stats cards
    gsap.fromTo(".stat-card", 
      { opacity: 0, y: 50, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.2,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate counters
    stats.forEach((stat, index) => {
      const element = document.querySelector(`#stat-number-${index}`);
      if (element) {
        gsap.fromTo({ value: 0 }, 
          { value: parseInt(stat.number) },
          {
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
              element.textContent = Math.floor(this.targets()[0].value).toString();
            },
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-green-300 rounded-full animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300 text-lg px-6 py-2">
            <TrendingUp className="mr-2 h-5 w-5" />
            Making Digital Impact Across Liberia
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our Impact Numbers
          </h2>
          <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Real results from our work with Liberian schools. These numbers represent 
            transformed educational experiences and empowered communities.
          </p>
        </div>

        <div ref={statsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={index}
                className="stat-card bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 text-center group"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-black mb-2 text-yellow-300">
                  <span id={`stat-number-${index}`}>0</span>
                  <span>{stat.suffix}</span>
                </div>
                <div className="text-xl font-semibold mb-3 text-white">
                  {stat.label}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-2xl font-semibold text-yellow-200 mb-4">
            Ready to become part of these numbers?
          </p>
          <p className="text-blue-100 text-lg">
            Your school could be the next success story in our growing network across all 15 counties of Liberia.
          </p>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
    </section>
  );
};