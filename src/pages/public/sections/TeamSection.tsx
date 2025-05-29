import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Code, Headphones, Megaphone, Shield } from 'lucide-react';

export const TeamSection: React.FC = () => {
  const teamMembers = [
    {
      name: "Boniface Koffa Weah, Jr.",
      role: "Director, DSVI",
      department: "Leadership",
      avatar: "BW",
      icon: Briefcase,
      description: "Leading DSVI's mission to digitize Liberian education with over 15 years of experience in educational technology."
    },
    {
      name: "Sarah Johnson",
      role: "Lead Developer",
      department: "IT",
      avatar: "SJ",
      icon: Code,
      description: "Full-stack developer specializing in educational platforms and content management systems."
    },
    {
      name: "Michael Thompson",
      role: "Support Manager",
      department: "Support",
      avatar: "MT",
      icon: Headphones,
      description: "Ensuring schools receive exceptional support and training for their digital transformation journey."
    },
    {
      name: "Grace Kollie",
      role: "Marketing Director",
      department: "Marketing",
      avatar: "GK",
      icon: Megaphone,
      description: "Connecting schools with DSVI's services and building awareness across Liberian educational communities."
    },
    {
      name: "James Wilson",
      role: "Quality Assurance",
      department: "IT",
      avatar: "JW",
      icon: Shield,
      description: "Ensuring every school website meets our high standards for quality, security, and performance."
    },
    {
      name: "Mary Peters",
      role: "Training Specialist",
      department: "Support",
      avatar: "MP",
      icon: Users,
      description: "Providing comprehensive training to school administrators on website management and best practices."
    }
  ];

  const departments = [
    { name: "Leadership", color: "bg-blue-100 text-blue-800", count: 1 },
    { name: "IT", color: "bg-green-100 text-green-800", count: 2 },
    { name: "Support", color: "bg-purple-100 text-purple-800", count: 2 },
    { name: "Marketing", color: "bg-orange-100 text-orange-800", count: 1 }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 px-6 py-2 text-lg">
            <Users className="mr-2 h-5 w-5" />
            Meet Our Team
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The People Behind DSVI
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our dedicated team of education technology specialists, developers, and support professionals 
            work tirelessly to bring Liberian schools into the digital age.
          </p>
        </div>

        {/* Department Overview */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {departments.map((dept, index) => (
            <Badge key={index} className={`${dept.color} px-4 py-2 text-sm font-medium`}>
              {dept.name} ({dept.count})
            </Badge>
          ))}
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => {
            const IconComponent = member.icon;
            return (
              <Card key={index} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                      {member.avatar}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-semibold mb-1">{member.role}</p>
                  <Badge className="mb-4 bg-gray-100 text-gray-700 text-xs">
                    {member.department}
                  </Badge>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};