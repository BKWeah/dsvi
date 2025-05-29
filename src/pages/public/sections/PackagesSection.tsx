import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap } from 'lucide-react';

import { Link } from 'react-router-dom';

interface PackageSectionProps {
}

export const PackagesSection: React.FC<PackageSectionProps> = () => {
  const packages = [
    {
      name: "Standard Package",
      price: "$100",
      period: "/year",
      popular: false,
      features: [
        "Professional website design",
        "5 pages (Home, About, Programs, Contact, News)",
        "Mobile-responsive design",
        "Basic SEO optimization",
        "Contact forms",
        "Social media integration",
        "1 GB storage",
        "Basic analytics",
        "Email support"
      ],
      icon: Zap,
      color: "border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "Advanced Template 1",
      price: "$150",
      period: "/year",
      popular: true,
      features: [
        "Everything in Standard",
        "10 pages with custom layouts",
        "Advanced SEO optimization",
        "Student portal integration",
        "Event calendar",
        "Photo galleries",
        "5 GB storage",
        "Advanced analytics",
        "Priority support",
        "Custom color scheme"
      ],
      icon: Star,
      color: "border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      name: "Advanced Template 2",
      price: "$200",
      period: "/year",
      popular: false,
      features: [
        "Everything in Template 1",
        "Unlimited pages",
        "E-learning platform integration",
        "Online admission system",
        "Payment gateway integration",
        "Multi-language support",
        "10 GB storage",
        "Custom domain included",
        "24/7 premium support",
        "Monthly design updates"
      ],
      icon: Crown,
      color: "border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 px-6 py-2 text-lg">
            Affordable Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Website Packages
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Choose the perfect package for your school's needs. All packages include professional design, 
            ongoing support, and everything you need to succeed online.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => {
            const IconComponent = pkg.icon;
            return (
              <div key={index} className={`relative ${pkg.popular ? 'transform scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <Card className={`border-2 ${pkg.color} shadow-lg hover:shadow-2xl transition-all duration-300 bg-white h-full`}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{pkg.name}</CardTitle>
                    <div className="flex items-baseline justify-center mt-4">
                      <span className="text-4xl font-black text-gray-900">{pkg.price}</span>
                      <span className="text-gray-500 ml-1">{pkg.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="w-full">
                      <Button 
                        className={`w-full ${pkg.buttonColor} text-white font-bold py-3 transform hover:scale-105 transition-all duration-300`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Add-ons Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Additional Services</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Custom Domain</h4>
              <p className="text-gray-600 text-sm mb-2">yourschool.com</p>
              <p className="font-bold text-blue-600">+$25/year</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">SSL Certificate</h4>
              <p className="text-gray-600 text-sm mb-2">Enhanced security</p>
              <p className="font-bold text-blue-600">+$15/year</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Extra Storage</h4>
              <p className="text-gray-600 text-sm mb-2">5GB additional</p>
              <p className="font-bold text-blue-600">+$20/year</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Priority Support</h4>
              <p className="text-gray-600 text-sm mb-2">24/7 premium help</p>
              <p className="font-bold text-blue-600">+$30/year</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
