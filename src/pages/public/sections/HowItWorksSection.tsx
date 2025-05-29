import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CreditCard, 
  Upload, 
  Code, 
  Search, 
  GraduationCap, 
  Rocket,
  CheckCircle,
  ArrowRight 
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: "Registration",
      description: "Fill out our simple registration form with your school's information and select your preferred package.",
      color: "bg-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      number: 2,
      icon: CreditCard,
      title: "Payment",
      description: "Complete payment through Mobile Money, Debit/Credit Card, or Bank Transfer. Receive instant digital receipt.",
      color: "bg-green-600",
      bgColor: "bg-green-50"
    },
    {
      number: 3,
      icon: Upload,
      title: "Content Submission",
      description: "Upload your school's content, photos, and information through our easy-to-use submission portal.",
      color: "bg-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      number: 4,
      icon: Code,
      title: "Website Development",
      description: "Our expert team creates your professional website using modern design principles and best practices.",
      color: "bg-orange-600",
      bgColor: "bg-orange-50"
    }    ,
    {
      number: 5,
      icon: Search,
      title: "Review & Approval",
      description: "Review your completed website and request any changes. We ensure everything meets your expectations.",
      color: "bg-red-600",
      bgColor: "bg-red-50"
    },
    {
      number: 6,
      icon: GraduationCap,
      title: "Training & Handover",
      description: "Receive comprehensive training on managing your website and access to our content management system.",
      color: "bg-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      number: 7,
      icon: Rocket,
      title: "Launch",
      description: "Your school website goes live! Start connecting with students, parents, and the wider community.",
      color: "bg-teal-600",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 px-6 py-2 text-lg">
            Simple Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How DSVI Works
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Get your school online in just 7 simple steps. Our streamlined process ensures 
            quick setup and professional results every time.
          </p>
        </div>
        {/* Steps Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card 
                  key={index} 
                  className="border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-2 ${step.color}`}></div>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className={`h-10 w-10 text-gray-700`} />
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why Choose DSVI Section */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose DSVI?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Quick Setup & Launch</h4>
              <p className="text-gray-600 text-sm">Your website goes live in just 48 hours</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">No Technical Skills Required</h4>
              <p className="text-gray-600 text-sm">Easy-to-use tools for everyone</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Dedicated Support</h4>
              <p className="text-gray-600 text-sm">24/7 support from education specialists</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Cost-Effective Solution</h4>
              <p className="text-gray-600 text-sm">Professional results at affordable prices</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};