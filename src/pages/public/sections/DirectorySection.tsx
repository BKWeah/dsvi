import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, FileText, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const DirectorySection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
    gsap.fromTo(".directory-card", 
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
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Explore the DSVI Ecosystem
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Discover and connect with Liberian schools through our comprehensive directory platform
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Explore Directory Card */}
          <Card className="directory-card border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 bg-white group">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-gray-900 mb-3">
                Explore the DSVI School Directory
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                Find Any Verified Liberian School, Instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-8 leading-relaxed text-base">
                Search through our comprehensive database of verified Liberian schools. Find contact information, programs, and connect with educational institutions across all 15 counties.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-base group-hover:bg-blue-800 transition-colors duration-300"
              >
                <a href="https://directory.libdsvi.com" target="_blank" rel="noopener noreferrer">
                  Browse Directory
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* List Your School Card */}
          <Card className="directory-card border-2 border-green-100 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 bg-white group">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-gray-900 mb-3">
                List Your School in the Directory
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                Join the Network of Verified Schools
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-8 leading-relaxed text-base">
                Add your school to our directory and increase your visibility. Connect with parents, students, and educational partners looking for quality institutions.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-base group-hover:bg-green-800 transition-colors duration-300"
              >
                <a href="https://directory.libdsvi.com/submit" target="_blank" rel="noopener noreferrer">
                  List Your School
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 shadow-sm">
            <FileText className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-gray-700 font-medium text-base">
              Trusted by 150+ verified schools across Liberia
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
