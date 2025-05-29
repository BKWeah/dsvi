import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Star, Users, Clock } from 'lucide-react';

import { Link } from 'react-router-dom';

interface CTASectionProps {
}

export const CTASection: React.FC<CTASectionProps> = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-green-300 rounded-full animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-8 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300 text-lg px-6 py-3">
            🚀 Ready to Get Started?
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            Transform Your School's 
            <span className="text-yellow-300"> Digital Future</span>
            <br />
            <span className="text-2xl md:text-3xl font-normal text-blue-100">
              Join 150+ Schools Already Thriving Online
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Don't let your school fall behind in the digital age. Get your professional website, 
            connect with your community, and showcase your educational excellence today.
          </p>
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Clock className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-2">48 Hours</div>
              <div className="text-blue-100 text-sm">From Registration to Launch</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Users className="h-8 w-8 text-green-300 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-2">24/7 Support</div>
              <div className="text-blue-100 text-sm">Dedicated Education Specialists</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Star className="h-8 w-8 text-blue-300 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-2">5-Star Rated</div>
              <div className="text-blue-100 text-sm">Trusted by Schools Nationwide</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 px-12 py-4 text-xl font-bold shadow-2xl"
              >
                Register Your School Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">No Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">48-Hour Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">Dedicated Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">150+ Happy Schools</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
    </section>
  );
};
