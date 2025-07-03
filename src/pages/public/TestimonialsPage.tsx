import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight, TrendingUp, Users, Eye } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TestimonialsPage() {
  const testimonialsRef = useRef<HTMLElement>(null);
  const transformationsRef = useRef<HTMLElement>(null);
  const beforeAfterRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Animate testimonial cards
    gsap.fromTo(".testimonial-card", 
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 80%",
          end: "bottom 50%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate transformation stats
    gsap.fromTo(".transformation-stat", 
      { opacity: 0, scale: 0.8, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: transformationsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate before/after images
    gsap.fromTo(".before-after-card", 
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.3,
        scrollTrigger: {
          trigger: beforeAfterRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const testimonials = [
    {
      name: "Martha Johnson",
      position: "Principal",
      school: "Liberty High School",
      county: "Montserrado",
      rating: 5,
      text: "DSVI transformed our school's online presence completely! We went from having no website to a professional platform that showcases our achievements. Parent engagement increased by 300% and we've received inquiries from international partners.",
      image: "/api/placeholder/100/100",
      results: "300% increase in parent engagement"
    },
    {
      name: "Samuel Koffa",
      position: "Director",
      school: "Saint Paul Elementary",
      county: "Margibi", 
      rating: 5,
      text: "The website DSVI created for us is not just beautiful—it's functional. We can easily update content, post announcements, and manage our online presence. Our enrollment increased by 40% this academic year.",
      image: "/api/placeholder/100/100",
      results: "40% enrollment increase"
    },
    {
      name: "Grace Williams",
      position: "Administrator",
      school: "Future Leaders Academy",
      county: "Nimba",
      rating: 5,
      text: "DSVI's team made the entire process seamless. From registration to launch took exactly 48 hours as promised. The ongoing support has been exceptional, and our community now sees us as a modern, forward-thinking institution.",
      image: "/api/placeholder/100/100",
      results: "Enhanced community reputation"
    },
    {
      name: "James Tuweh",
      position: "Principal",
      school: "Bong County Technical Institute",
      county: "Bong",
      rating: 5,
      text: "Before DSVI, we struggled to communicate with parents and showcase our programs. Now we have a professional online presence that helps us attract quality students and maintain better communication with stakeholders.",
      image: "/api/placeholder/100/100",
      results: "Improved stakeholder communication"
    },
    {
      name: "Mary Kollie",
      position: "Director",
      school: "River Cess Community School",
      county: "River Cess",
      rating: 5,
      text: "Being in a rural area, we thought we'd be left behind digitally. DSVI proved us wrong! Our website has connected us to resources and opportunities we never knew existed. We've even received donations from alumni abroad.",
      image: "/api/placeholder/100/100",
      results: "Connected to global opportunities"
    },
    {
      name: "Joseph Roberts",
      position: "Principal",
      school: "Grand Bassa Prep Academy",
      county: "Grand Bassa",
      rating: 5,
      text: "The before and after transformation is incredible. We went from having outdated flyers to a modern, mobile-responsive website that parents access daily. DSVI didn't just build us a website—they built us a digital future.",
      image: "/api/placeholder/100/100",
      results: "Complete digital transformation"
    }
  ];

  const transformationStats = [
    {
      title: "Website Visitors",
      before: "0",
      after: "2,500+",
      icon: <Eye className="h-8 w-8" />,
      description: "Monthly visitors across school websites"
    },
    {
      title: "Parent Engagement",
      before: "Limited",
      after: "300%+",
      icon: <Users className="h-8 w-8" />,
      description: "Increase in parent-school interaction"
    },
    {
      title: "Enrollment Inquiries",
      before: "Few",
      after: "150%+",
      icon: <TrendingUp className="h-8 w-8" />,
      description: "Growth in admission applications"
    }
  ];

  const beforeAfterCases = [
    {
      schoolName: "Liberty High School",
      county: "Montserrado",
      beforeDescription: "No online presence, limited parent communication",
      afterDescription: "Professional website with student portal, news updates, and online applications",
      beforeImage: "/api/placeholder/400/300",
      afterImage: "/api/placeholder/400/300",
      impact: "300% increase in parent engagement, 2 international partnerships"
    },
    {
      schoolName: "Future Leaders Academy", 
      county: "Nimba",
      beforeDescription: "Outdated printed materials, difficult information access",
      afterDescription: "Modern responsive website with event calendar and photo galleries",
      beforeImage: "/api/placeholder/400/300", 
      afterImage: "/api/placeholder/400/300",
      impact: "40% enrollment increase, enhanced community reputation"
    },
    {
      schoolName: "River Cess Community School",
      county: "River Cess", 
      beforeDescription: "Rural school with no digital presence or communication tools",
      afterDescription: "Connected school with online presence reaching global alumni network",
      beforeImage: "/api/placeholder/400/300",
      afterImage: "/api/placeholder/400/300", 
      impact: "International donations received, expanded resource access"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">
            Success Stories
          </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Real Schools, Real
              <span className="text-yellow-300"> Transformations</span>
            </h1>
            <p className="text-xl">Authentic testimonials and measurable results from schools across Liberia</p>
          </div>
        </section>

        {/* Transformation Statistics */}
        <section ref={transformationsRef} className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Transformation Snapshots
                </h2>
                <p className="text-xl text-gray-600">Measurable impact across our school network</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {transformationStats.map((stat, index) => (
                  <Card key={index} className="transformation-stat text-center border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-blue-600">
                          {stat.icon}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-4 mb-2">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Before</div>
                            <div className="text-lg font-bold text-red-600">{stat.before}</div>
                          </div>
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                          <div className="text-center">
                            <div className="text-sm text-gray-500">After</div>
                            <div className="text-2xl font-bold text-green-600">{stat.after}</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quote Cards from Schools */}
        <section ref={testimonialsRef} className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  What School Leaders Say
                </h2>
                <p className="text-xl text-gray-600">Authentic testimonials from educators across Liberia</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="testimonial-card border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-blue-600 font-bold text-lg">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                          <p className="text-sm text-gray-600 font-medium">{testimonial.position}, {testimonial.school}</p>
                          <p className="text-xs text-blue-600">{testimonial.county} County</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2 mb-4">
                        <Quote className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                        <p className="text-gray-700 italic leading-relaxed">{testimonial.text}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-800">
                          🎯 Result: {testimonial.results}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Before/After Screenshots */}
        <section ref={beforeAfterRef} className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Before & After Transformations
                </h2>
                <p className="text-xl text-gray-600">See the dramatic improvements in school digital presence</p>
              </div>

              <div className="space-y-16">
                {beforeAfterCases.map((case_, index) => (
                  <div key={index} className="before-after-card">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{case_.schoolName}</h3>
                      <Badge variant="outline">{case_.county} County</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      {/* Before */}
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-red-600 mb-4">BEFORE</h4>
                        <div className="bg-gray-200 rounded-lg p-4 mb-4 h-48 flex items-center justify-center">
                          <div className="text-gray-500 text-center">
                            <div className="text-4xl mb-2">📄</div>
                            <p className="text-sm">No Digital Presence</p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{case_.beforeDescription}</p>
                      </div>

                      {/* After */}
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-green-600 mb-4">AFTER</h4>
                        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg p-4 mb-4 h-48 flex items-center justify-center">
                          <div className="text-blue-600 text-center">
                            <div className="text-4xl mb-2">🌐</div>
                            <p className="text-sm font-medium">Professional Website</p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{case_.afterDescription}</p>
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 font-medium">
                          📈 Impact: {case_.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl mb-8">
              Join these schools and transform your digital presence today
            </p>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/register">
                Onboard Your School
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
    </>
  );
}