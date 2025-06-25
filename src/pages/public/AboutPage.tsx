import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Target, Eye, Heart, Users, Globe, 
  Award, ArrowRight, Quote 
} from 'lucide-react';

export default function AboutPage() {
  const handleRegisterClick = () => {
    window.location.href = '/register';
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                About DSVI
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Empowering Liberian Education
                <span className="text-yellow-300"> Through Digital Innovation</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Building digital bridges for every school in Liberia
              </p>
            </div>
          </div>
        </section>

        {/* What is DSVI Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  What is DSVI?
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  The Digital School Visibility Initiative (DSVI) is a groundbreaking program designed to bring every Liberian school into the digital age. We provide professional, affordable website solutions that help schools showcase their achievements, connect with their communities, and access new opportunities for growth and development.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center border-none shadow-lg">
                  <CardHeader>
                    <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <CardTitle>Digital Presence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Creating professional online identities for schools across all 15 counties of Liberia
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-none shadow-lg">
                  <CardHeader>
                    <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <CardTitle>Community Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Bridging the gap between schools, parents, students, and the wider community
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-none shadow-lg">
                  <CardHeader>
                    <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <CardTitle>Growth Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Opening doors to partnerships, funding, and recognition for educational excellence
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Core Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-12">
                {/* Mission */}
                <div className="text-center">
                  <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To democratize digital access for all Liberian educational institutions, ensuring that every school—regardless of size, location, or resources—has a professional online presence that showcases their unique value and connects them to opportunities for growth and impact.
                  </p>
                </div>

                {/* Vision */}
                <div className="text-center">
                  <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    A digitally connected Liberian education system where every school thrives online, fostering transparency, community engagement, and educational excellence that drives national development and positions Liberia as a leader in educational innovation in West Africa.
                  </p>
                </div>

                {/* Core Values */}
                <div className="text-center">
                  <div className="bg-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Core Values</h3>
                  <div className="text-left">
                    <ul className="text-gray-600 space-y-2">
                      <li><strong>Accessibility:</strong> Digital solutions for all schools</li>
                      <li><strong>Excellence:</strong> Professional quality in everything we do</li>
                      <li><strong>Community:</strong> Building connections that matter</li>
                      <li><strong>Innovation:</strong> Leading educational technology in Liberia</li>
                      <li><strong>Impact:</strong> Measurable difference in school visibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Message from the Director */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Message from the Director
                </h2>
              </div>

              <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-green-50">
                <CardContent className="p-12">
                  <div className="flex items-start gap-6">
                    <Quote className="h-12 w-12 text-blue-600 flex-shrink-0 mt-2" />
                    <div>
                      <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
                        "At LIB NO.1, we believe every school, no matter its size or location, deserves a digital presence. Through DSVI, we're building not just websites, but digital access, connection, and opportunities for Liberian education. Thank you for trusting us to support your school's growth."
                      </blockquote>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            Boniface Koffa Weah, Jr.
                          </p>
                          <p className="text-gray-600">
                            Director, Digital School Visibility Initiative (DSVI)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your School's Digital Presence?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Join 150+ schools already benefiting from DSVI's professional website solutions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </section>
    </>
  );
}