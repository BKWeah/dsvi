import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, CreditCard, Upload, Code, Eye, GraduationCap, 
  Rocket, ArrowRight, CheckCircle, Clock, Zap, Shield, HeadphonesIcon
} from 'lucide-react';

export default function HowItWorksPage() {
  const handleRegisterClick = () => {
    window.location.href = '/register';
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const steps = [
    {
      number: 1,
      title: "Registration",
      description: "Complete our simple registration form with your school's basic information and select your preferred package.",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-blue-600",
      duration: "5 minutes"
    },
    {
      number: 2,
      title: "Payment",
      description: "Secure payment via Mobile Money, Debit/Credit Card, or Bank Transfer. Receive instant digital receipt.",
      icon: <CreditCard className="h-8 w-8" />,
      color: "bg-green-600",
      duration: "2 minutes"
    },
    {
      number: 3,
      title: "Content Submission",
      description: "Upload your school's content, photos, and information using our user-friendly submission portal.",
      icon: <Upload className="h-8 w-8" />,
      color: "bg-purple-600",
      duration: "30 minutes"
    },    {
      number: 4,
      title: "Website Development",
      description: "Our expert development team creates your professional website with your school's unique branding.",
      icon: <Code className="h-8 w-8" />,
      color: "bg-orange-600",
      duration: "24-48 hours"
    },
    {
      number: 5,
      title: "Review & Approval",
      description: "Preview your website, request any changes, and approve the final version before going live.",
      icon: <Eye className="h-8 w-8" />,
      color: "bg-indigo-600",
      duration: "2-4 hours"
    },
    {
      number: 6,
      title: "Training & Handover",
      description: "Receive comprehensive training on managing your website content and accessing your admin panel.",
      icon: <GraduationCap className="h-8 w-8" />,
      color: "bg-pink-600",
      duration: "1 hour"
    },
    {
      number: 7,
      title: "Launch",
      description: "Your professional school website goes live! Start attracting students, parents, and opportunities.",
      icon: <Rocket className="h-8 w-8" />,
      color: "bg-red-600",
      duration: "Instant"
    }
  ];

  const benefits = [
    {
      title: "Quick Setup & Launch",
      description: "From registration to live website in just 48 hours",
      icon: <Zap className="h-12 w-12 text-yellow-600" />
    },
    {
      title: "No Technical Skills Required",
      description: "We handle all the technical aspects while you focus on education",
      icon: <CheckCircle className="h-12 w-12 text-green-600" />
    },
    {
      title: "Dedicated Support",
      description: "24/7 customer support throughout the entire process",
      icon: <HeadphonesIcon className="h-12 w-12 text-blue-600" />
    },
    {
      title: "Cost-Effective Solution",
      description: "Professional website starting at just $100/year",
      icon: <Shield className="h-12 w-12 text-purple-600" />
    }
  ];

  return (
    <>
      {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                Simple Process
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                How DSVI
                <span className="text-yellow-300"> Works</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                From registration to launch in just 7 simple steps. We make it easy for every Liberian school to get online.
              </p>
            </div>
          </div>
        </section>

        {/* Steps Timeline */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Your Journey to Digital Success
                </h2>
                <p className="text-xl text-gray-600">
                  Follow these simple steps to get your school's professional website
                </p>
              </div>

              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center gap-8">
                    {/* Step Number and Icon */}
                    <div className="flex-shrink-0">
                      <div className={`${step.color} w-20 h-20 rounded-full flex items-center justify-center text-white`}>
                        {step.icon}
                      </div>
                    </div>

                    {/* Step Content */}
                    <Card className="flex-1 border-none shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">
                            Step {step.number}: {step.title}
                          </CardTitle>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.duration}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{step.description}</p>
                      </CardContent>
                    </Card>

                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-10 mt-20 w-0.5 h-8 bg-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose DSVI Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Why Choose DSVI?
                </h2>
                <p className="text-xl text-gray-600">
                  We make the process simple, fast, and affordable for every Liberian school
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="mx-auto mb-4">
                        {benefit.icon}
                      </div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Digital Journey?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Join 150+ schools that have already transformed their online presence with DSVI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Link to="/register">
                    Start Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link to="/packages">View Packages</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}