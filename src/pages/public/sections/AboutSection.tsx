import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, Heart, Target, Eye, Users } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 px-6 py-2 text-lg">
              About DSVI
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            <div className="text-left max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                Founded on <span className="font-semibold text-blue-600">March 14, 2025</span>, the Digital School Visibility Initiative (DSVI) is a practical response to a pressing need: helping Liberian schools establish a meaningful and professional presence online. Powered by <span className="font-semibold text-green-600">LIB No. 1 Business Center</span>, DSVI offers schools custom-built websites, intuitive, reliable, and affordable, starting at just <span className="font-bold text-orange-600">$100 per year</span>.
              </p>
              <p>
                The initiative stems from more than business ambition. LIB No. 1 Business Center, a well-regarded name in Liberia's electronics sector, established by CEO <span className="font-semibold">John Gyawu</span>, has long understood the value of accessible technology. With DSVI, the company has extended its reach, applying its technical strengths to support the education sector in a direct and measurable way.
              </p>
              <p>
                Led by Director <span className="font-semibold">Boniface Koffa Weah, Jr.</span>, the team behind DSVI is focused on real outcomes: clear communication between schools and communities, increased credibility in the eyes of partners and stakeholders, and the practical benefits of a digital platform tailored for education.
              </p>
              <p>
                DSVI is built for schools that want to move forward, those ready to be seen, to inform, and to operate with greater confidence in a connected world. Each site is a reflection of the school it represents, carefully crafted to support administrators, engage parents, and showcase the work happening in classrooms every day.
              </p>
              <p className="font-semibold text-blue-800">
                We don't offer empty promises. We deliver working solutions, backed by experience, driven by purpose, and designed to last.
              </p>
            </div>
          </div>

          {/* Mission, Vision, Values Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To democratize digital access for Liberian schools by providing affordable, professional websites 
                  that enhance educational visibility and community engagement.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  A digitally connected Liberian education system where every school has the tools to showcase 
                  their excellence and connect with their communities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Core Values</h3>
                <p className="text-gray-600 leading-relaxed">
                  Excellence, Accessibility, Innovation, Community Focus, and Sustainable Growth drive 
                  everything we do for Liberian education.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Director's Message */}
          <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-600 to-green-600 text-white overflow-hidden">
            <CardContent className="p-12 relative">
              <div className="absolute top-6 left-6 opacity-20">
                <Quote className="h-16 w-16" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-8 text-center">Message from the Director</h3>
                <blockquote className="text-xl leading-relaxed mb-8 text-center italic">
                  "At LIB NO.1, we believe every school, no matter its size or location, deserves a digital presence. 
                  Through DSVI, we're building not just websites, but digital access, connection, and opportunities 
                  for Liberian education. Thank you for trusting us to support your school's growth."
                </blockquote>
                <div className="text-center">
                  <p className="text-2xl font-bold">Boniface Koffa Weah, Jr.</p>
                  <p className="text-yellow-200 text-lg">Director, DSVI</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-10">
                <Users className="h-24 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};