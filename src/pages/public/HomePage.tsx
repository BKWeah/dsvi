import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Users, Globe, Palette, Shield, BarChart3, 
  CheckCircle, ArrowRight, School, Star, Phone, Mail, MessageSquare,
  Search, FileText, Plus
} from 'lucide-react';

interface HomePageProps {
  setHeroRef: (ref: React.RefObject<HTMLElement>) => void;
}

export default function HomePage({ setHeroRef }: HomePageProps) {
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroSectionRef.current) {
      setHeroRef(heroSectionRef);
    }
  }, [setHeroRef]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        ref={heroSectionRef}
        className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              🎓 Building Digital Access for Liberian Education
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your School's
              <span className="text-yellow-300"> Digital Presence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Professional websites and digital solutions for every Liberian school, 
              no matter its size or location
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link to="/register">
                  Onboard Your School
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link to="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Making Digital Impact Across Liberia
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
                <div className="text-blue-100">Schools Served</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">15</div>
                <div className="text-blue-100">Counties Reached</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">48hr</div>
                <div className="text-blue-100">Setup Time</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Everything Your School Needs Online */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your School Needs Online
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From beautiful websites to powerful content management, we provide the complete digital solution for Liberian educational institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Professional Websites</CardTitle>
                <CardDescription>
                  Beautiful, responsive websites that showcase your school's unique identity and Liberian educational values
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Palette className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Easy Content Management</CardTitle>
                <CardDescription>
                  Intuitive tools that let you update content, add events, and manage information without technical expertise
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Student & Parent Portal</CardTitle>
                <CardDescription>
                  Dedicated sections for admissions, academics, faculty information, and important announcements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with automatic backups and reliable hosting for your school's digital presence
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track website performance, visitor engagement, and content effectiveness with detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <School className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Mobile Optimized</CardTitle>
                <CardDescription>
                  Perfect display on all devices - desktop, tablet, and mobile for maximum accessibility across Liberia
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/register">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DSVI Directory Promotion Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore the DSVI Ecosystem
            </h2>
            <p className="text-xl text-gray-600">
              Discover and connect with Liberian schools through our comprehensive directory platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Explore Directory Card */}
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">
                  Explore the DSVI School Directory
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Find Any Verified Liberian School, Instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Search through our comprehensive database of verified Liberian schools. Find contact information, programs, and connect with educational institutions across all 15 counties.
                </p>
                <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/directory">
                    Browse Directory
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* List Your School Card */}
            <Card className="border-2 border-green-100 hover:border-green-300 transition-colors duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">
                  List Your School in the Directory
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Join the Network of Verified Schools
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Add your school to our directory and increase your visibility. Connect with parents, students, and educational partners looking for quality institutions.
                </p>
                <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <Link to="/directory-listing">
                    List Your School
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 rounded-full">
              <FileText className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-gray-700 font-medium">
                Trusted by 150+ verified schools across Liberia
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
