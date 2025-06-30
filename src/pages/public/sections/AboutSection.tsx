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
              About LDSI
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            <div className="text-left max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                Founded on <span className="font-semibold text-blue-600">March 14, 2025</span>, the Liberia Digital Service Initiative (LDSI) launched with its first service, the Digital School Visibility Initiative (DSVI), as a direct response to the urgent need for schools and organizations in Liberia to establish a professional and effective digital presence. Powered by <span className="font-semibold text-green-600">LIB No. 1 Business Center</span>, LDSI delivers accessible, intuitive, and affordable digital tools through its three service arms: DSVI, DSVI School Directory, and DVI.
              </p>
              <p>
                LDSI is more than a business effort, it's a mission to make digital access practical and impactful. LIB No. 1 Business Center, founded by CEO <span className="font-semibold">John Gyawu</span>, has long championed accessible technology in Liberia's electronics sector. Through LDSI, it expands that commitment into education and enterprise development.
              </p>
              <p>
                Led by <span className="font-semibold">Boniface Koffa Weah, Jr.</span>, LDSI's services are focused on real results: meaningful communication between institutions and communities, enhanced credibility with stakeholders, and platforms that empower schools and organizations to thrive in a connected world.
              </p>
              <p>
                DSVI and the DSVI School Directory are crafted for schools ready to engage, inform, and grow with confidence. Each site is custom-built to support leadership, showcase learning, and connect with parents and the broader community.
              </p>
              <p>
                DVI, in turn, empowers non-school institutions, from businesses to non-profits, to step into the digital space with clarity and professionalism, enhancing both visibility and trust.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};