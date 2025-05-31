import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Code, Headphones, Megaphone, Shield } from 'lucide-react';

export const TeamSection: React.FC = () => {
  const teamMembers = [
    // Leadership
    {
      name: "John Gyawu",
      role: "Establishment Executive",
      department: "Leadership",
      avatar: "JG",
      icon: Briefcase,
      description: "Originator and steward of DSVI's long-term mission, driving strategic direction, public trust, and institutional impact."
    },
    {
      name: "B. K. Weah, Jr.",
      role: "Director",
      department: "Leadership", 
      avatar: "BW",
      icon: Briefcase,
      description: "B. K. Weah, Jr. is a Liberian entrepreneur and leader who combines clear vision with practical leadership. He works at the intersection of technology, education, and social progress. For nearly 20 years, he has contributed to education, business, and social development in Liberia. He leads the Digital School Visibility Initiative (DSVI), uniting different teams and ensuring their daily work supports a larger goal. Beyond managing operations, he focuses on building strong teams and fostering organizational growth. His aim is to make a lasting, positive impact on Liberia's schools.",
      hasPhoto: true
    },
    // Operations
    {
      name: "Archie Wento",
      role: "Operations Manager",
      department: "Operations",
      avatar: "AW",
      icon: Users,
      description: "Coordinates workflow, logistics, and project delivery across teams to ensure smooth execution of services."
    },
    {
      name: "Vacant",
      role: "Finance Manager",
      department: "Operations",
      avatar: "FM",
      icon: Shield,
      description: "Manages financial planning, budgeting, and compliance to keep DSVI fiscally sound and accountable.",
      isVacant: true
    },
    // IT Team
    {
      name: "Om Jaiswal",
      role: "Lead Developer",
      department: "IT",
      avatar: "OJ",
      icon: Code,
      description: "Full-stack developer specializing in modern web technologies and educational platform development. Leads technical architecture and development processes."
    },
    {
      name: "Oluwaseun Shobayo",
      role: "Lead Developer",
      department: "IT",
      avatar: "OS",
      icon: Code,
      description: "Experienced developer focused on scalable web solutions and user experience optimization. Specializes in frontend technologies and system integration."
    },
    {
      name: "Vacant",
      role: "UI/UX Specialist",
      department: "IT",
      avatar: "UX",
      icon: Code,
      description: "Designs intuitive, accessible, and engaging user interfaces for school websites and internal platforms.",
      isVacant: true
    },
    {
      name: "Vacant",
      role: "Quality Assurance Specialist",
      department: "IT",
      avatar: "QA",
      icon: Shield,
      description: "Ensures every deliverable meets internal standards and is error-free across functionality, presentation, and content.",
      isVacant: true
    },
    {
      name: "Vacant",
      role: "Content & Data Coordinator",
      department: "IT",
      avatar: "CD",
      icon: Users,
      description: "Responsible for uploading, organizing, and managing school-provided content across their respective websites.",
      isVacant: true
    },
    // Support
    {
      name: "Vacant",
      role: "Training Specialist",
      department: "Support",
      avatar: "TS",
      icon: Users,
      description: "Provides comprehensive training to school administrators on website management and best practices.",
      isVacant: true
    },
    {
      name: "Vacant",
      role: "Support Manager",
      department: "Support",
      avatar: "SM",
      icon: Headphones,
      description: "Handles ongoing post-launch technical and service support for client schools.",
      isVacant: true
    },
    // Media
    {
      name: "Ansu Sheriff",
      role: "Photographer & Visual Content Creator",
      department: "Media",
      avatar: "AS",
      icon: Megaphone,
      description: "Captures and produces high-quality visual content to support both DSVI's brand and school website presentation."
    }
  ];

  const departments = [
    { name: "Leadership", color: "bg-blue-100 text-blue-800", count: 2 },
    { name: "Operations", color: "bg-green-100 text-green-800", count: 2 },
    { name: "IT", color: "bg-purple-100 text-purple-800", count: 5 },
    { name: "Support", color: "bg-orange-100 text-orange-800", count: 2 },
    { name: "Media", color: "bg-pink-100 text-pink-800", count: 1 }
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
              <Card key={index} className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white ${member.isVacant ? 'opacity-75' : ''}`}>
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    {member.hasPhoto && member.name === "B. K. Weah, Jr." ? (
                      <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-gradient-to-br from-blue-600 to-green-600">
                        <img 
                          src="/updates_assets/B. K. Weah Pro.jpg" 
                          alt="B. K. Weah, Jr."
                          className="w-full h-full object-cover object-top"
                          style={{ objectPosition: '50% 0%' }}
                        />
                      </div>
                    ) : (
                      <div className={`w-20 h-20 ${member.isVacant ? 'bg-gray-400' : 'bg-gradient-to-br from-blue-600 to-green-600'} rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl`}>
                        {member.isVacant ? '?' : member.avatar}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${member.isVacant ? 'text-gray-500' : 'text-gray-900'}`}>
                    {member.name}
                  </h3>
                  <p className={`font-semibold mb-1 ${member.isVacant ? 'text-gray-400' : 'text-blue-600'}`}>{member.role}</p>
                  <Badge className={`mb-4 text-xs ${member.isVacant ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-700'}`}>
                    {member.department}
                  </Badge>
                  <p className={`text-sm leading-relaxed ${member.isVacant ? 'text-gray-500' : 'text-gray-600'}`}>
                    {member.description}
                  </p>
                  {member.isVacant && (
                    <p className="text-xs text-red-500 mt-2 font-medium">Position Available</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};