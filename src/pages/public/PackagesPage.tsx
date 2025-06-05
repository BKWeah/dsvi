import React from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Check, Star, Crown, Zap, ArrowRight, Globe, 
  Palette, Users, Shield, BarChart3, HeadphonesIcon
} from 'lucide-react';

export default function PackagesPage() {
  const handleRegisterClick = () => {
    window.location.href = '/register';
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const packages = [
    {
      name: "Standard Package",
      price: "$100",
      period: "/year",
      description: "Perfect for most schools looking to establish their digital presence",
      popular: true,
      features: [
        "Professional Website Design",
        "Mobile Responsive Layout",
        "Basic Content Management",
        "Contact Forms",
        "School Information Pages",
        "Photo Gallery",
        "News & Announcements",
        "Basic SEO Optimization",
        "SSL Certificate",
        "1 Year Hosting Included",
        "Email Support",
        "Basic Training Session"
      ],
      icon: <Globe className="h-8 w-8" />,
      color: "border-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },    {
      name: "Prime Essentials Package",
      price: "$200",
      period: "/year",
      description: "Enhanced features with modern design and advanced functionality",
      popular: false,
      features: [
        "Everything in Standard Package",
        "Premium Template Design",
        "Advanced Content Management",
        "Student Portal Integration",
        "Event Calendar",
        "Online Application Forms",
        "Advanced Photo Galleries",
        "Social Media Integration",
        "Advanced SEO Optimization",
        "Analytics Dashboard",
        "Priority Email Support",
        "2-Hour Training Session",
        "Custom Color Schemes"
      ],
      icon: <Star className="h-8 w-8" />,
      color: "border-green-500",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      name: "Prime Elite Package",
      price: "$350",
      period: "/year", 
      description: "Premium solution with all features and premium support",
      popular: false,
      features: [
        "Everything in Advanced Template 1",
        "Custom Design Elements",
        "Multi-language Support",
        "Advanced Student Management",
        "Online Payment Integration",
        "Live Chat Support",
        "Custom Domain Setup",
        "Advanced Analytics",
        "Email Marketing Tools",
        "Staff Directory",
        "24/7 Phone Support",
        "4-Hour Training Session",
        "Quarterly Design Updates"
      ],
      icon: <Crown className="h-8 w-8" />,
      color: "border-purple-500",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  const addOns = [
    { name: "Custom Domain Setup", price: "$25", description: "yourschool.com domain setup and configuration" },
    { name: "Logo Design", price: "$50", description: "Professional logo design for your school" },
    { name: "Additional Pages", price: "$15", description: "Per additional page beyond standard package" },
    { name: "E-commerce Integration", price: "$100", description: "Online store for school merchandise and fees" },
    { name: "Advanced Analytics", price: "$30", description: "Detailed website performance reports" },
    { name: "Priority Support", price: "$40", description: "24/7 priority customer support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onRegisterClick={handleRegisterClick}
        onLoginClick={handleLoginClick}
      />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                Pricing Plans
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Choose Your
                <span className="text-yellow-300"> Perfect Package</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Affordable, professional website solutions designed specifically for Liberian schools
              </p>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Website Packages
                </h2>
                <p className="text-xl text-gray-600">
                  Choose the package that best fits your school's needs and budget
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {packages.map((pkg, index) => (
                  <Card key={index} className={`relative border-2 ${pkg.color} ${pkg.popular ? 'ring-2 ring-blue-200' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-6">
                      <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                        <div className="text-blue-600">
                          {pkg.icon}
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                      <div className="text-4xl font-bold text-gray-900 mt-2">
                        {pkg.price}
                        <span className="text-lg font-normal text-gray-600">{pkg.period}</span>
                      </div>
                      <p className="text-gray-600 mt-2">{pkg.description}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button asChild size="lg" className={`w-full ${pkg.buttonColor} text-white`}>
                        <Link to="/register">
                          Register Your School
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Add-ons & Extras
                </h2>
                <p className="text-xl text-gray-600">
                  Enhance your website with these optional features
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {addOns.map((addon, index) => (
                  <Card key={index} className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {addon.name}
                          </h3>
                          <p className="text-gray-600">{addon.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {addon.price}
                          </div>
                          <div className="text-sm text-gray-500">one-time</div>
                        </div>
                      </div>
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
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Choose your package and launch your school's professional website today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Link to="/register">
                    Register Your School
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link to="/contact">Have Questions?</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}