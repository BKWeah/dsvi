import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, PageContent } from '@/lib/types';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar, 
  DollarSign,
  Users,
  Download,
  Phone,
  Mail
} from 'lucide-react';

interface AdmissionsPageProps {
  school: School;
  pageContent?: PageContent;
}

export default function AdmissionsPage({ school, pageContent }: AdmissionsPageProps) {
  const admissionSteps = [
    {
      step: 1,
      title: 'Submit Application',
      description: 'Complete and submit the online application form with required documents.',
      icon: <FileText className="h-8 w-8" />
    },
    {
      step: 2,
      title: 'Assessment',
      description: 'Attend the entrance examination and interview session.',
      icon: <Users className="h-8 w-8" />
    },
    {
      step: 3,
      title: 'Review',
      description: 'Application review and evaluation by our admissions committee.',
      icon: <CheckCircle className="h-8 w-8" />
    },
    {
      step: 4,
      title: 'Decision',
      description: 'Receive admission decision and enrollment instructions.',
      icon: <Calendar className="h-8 w-8" />
    }
  ];
  const requirements = [
    {
      level: 'Nursery & Primary',
      documents: [
        'Completed application form',
        'Birth certificate copy',
        'Medical report',
        'Passport photographs (4 copies)',
        'Previous school report (if applicable)'
      ],
      age: '3-11 years'
    },
    {
      level: 'Junior Secondary',
      documents: [
        'Completed application form',
        'Primary school leaving certificate',
        'Common entrance result (if available)',
        'Birth certificate copy',
        'Medical report',
        'Passport photographs (4 copies)'
      ],
      age: '11-14 years'
    },
    {
      level: 'Senior Secondary',
      documents: [
        'Completed application form',
        'Junior WAEC result',
        'School testimonial',
        'Birth certificate copy',
        'Medical report',
        'Passport photographs (4 copies)'
      ],
      age: '14-17 years'
    }
  ];

  const tuitionFees = [
    { level: 'Nursery', termFee: '₦45,000', annualFee: '₦135,000' },
    { level: 'Primary', termFee: '₦55,000', annualFee: '₦165,000' },
    { level: 'Junior Secondary', termFee: '₦65,000', annualFee: '₦195,000' },
    { level: 'Senior Secondary', termFee: '₦75,000', annualFee: '₦225,000' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Admissions</h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Join our community of learners and begin your journey toward academic excellence 
            and personal growth. We welcome students who are ready to thrive.
          </p>
        </div>
      </section>
      {/* How to Apply */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How to Apply</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our admission process is designed to be straightforward and transparent.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {admissionSteps.map((step, index) => (
                <Card key={index} className="text-center relative">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & Deadlines */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Requirements & Deadlines</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check the specific requirements for your child's grade level.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {requirements.map((req, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{req.level}</CardTitle>
                  <Badge variant="secondary" className="mx-auto w-fit">
                    Ages {req.age}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Required Documents:</h4>
                  <ul className="space-y-2">
                    {req.documents.map((doc, docIndex) => (
                      <li key={docIndex} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Tuition & Fees */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tuition & Fees</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transparent pricing for quality education. Scholarships available for qualifying students.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-4 text-lg font-semibold">Grade Level</th>
                        <th className="pb-4 text-lg font-semibold text-center">Per Term</th>
                        <th className="pb-4 text-lg font-semibold text-center">Annual Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tuitionFees.map((fee, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="py-4 font-medium">{fee.level}</td>
                          <td className="py-4 text-center text-primary font-semibold">{fee.termFee}</td>
                          <td className="py-4 text-center text-green-600 font-semibold">{fee.annualFee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Scholarship Opportunities
                  </h3>
                  <p className="text-gray-700 mb-4">
                    We offer merit-based scholarships for outstanding students and need-based financial assistance 
                    for families who qualify. Contact our admissions office to learn more about available opportunities.
                  </p>
                  <Button variant="outline">Learn About Scholarships</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Apply Now Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Apply?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Take the first step towards joining our academic community. Start your application today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Start Application
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-white text-white hover:bg-white hover:text-primary">
              <Download className="h-5 w-5 mr-2" />
              Download Brochure
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <Phone className="h-5 w-5" />
              <span>Call: {school.contact_info?.phone || '+234 XXX XXX XXXX'}</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Mail className="h-5 w-5" />
              <span>Email: {school.contact_info?.email || 'admissions@school.edu.ng'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
