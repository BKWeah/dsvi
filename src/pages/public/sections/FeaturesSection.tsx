import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Globe, 
  Palette, 
  Users, 
  Shield, 
  BarChart3, 
  School,
  Smartphone,
  Clock,
  Award,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Globe,
      title: "Professional Websites",
      description: "Beautiful, responsive websites that showcase your school's unique identity and Liberian educational values",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Palette,
      title: "Easy Content Management",
      description: "Intuitive tools that let you update content, add events, and manage information without technical expertise",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Users,
      title: "Student & Parent Portal",
      description: "Dedicated sections for admissions, academics, faculty information, and important announcements",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with automatic backups and reliable hosting for your school's digital presence",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track website performance, visitor engagement, and content effectiveness with detailed analytics",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Perfect display on all devices - desktop, tablet, and mobile for maximum accessibility across Liberia",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ];

  useEffect(() => {
    // Animate title on scroll
    gsap.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          end: "bottom 50%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate cards with stagger effect
    gsap.fromTo(".feature-card", 
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          end: "bottom 50%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything Your School Needs Online
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            From beautiful websites to powerful content management, we provide the complete digital solution 
            for Liberian educational institutions
          </p>
        </div>
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="feature-card border-none shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm group"
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 text-center">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};