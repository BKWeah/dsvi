import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, GraduationCap, Code, HeadphonesIcon, 
  MegaphoneIcon, Mail, Linkedin, Github 
} from 'lucide-react';
import { School } from '@/lib/types';

interface SchoolTeamPageProps {
  school: School;
  subsectionId?: string;
}

const TEAM_SUBSECTIONS = [
  { id: 'leadership', label: 'Leadership' },
  { id: 'operations', label: 'Operations' },
  { id: 'it', label: 'IT' },
  { id: 'support', label: 'Support' },
  { id: 'media', label: 'Media' },
];

export default function SchoolTeamPage({ school, subsectionId }: SchoolTeamPageProps) {
  useEffect(() => {
    if (subsectionId) {
      const element = document.getElementById(subsectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [subsectionId]);

  const teamMembers = [
    // Placeholder Team Members for School
    {
      name: "Principal Jane Doe",
      role: "Principal",
      department: "Leadership",
      image: "/api/placeholder/300/300",
      bio: "Leading the school's academic and administrative vision.",
      email: "principal@school.com",
      linkedin: "#"
    },
    {
      name: "Mr. Alex Smith",
      role: "Head of Operations",
      department: "Operations",
      image: "/api/placeholder/300/300",
      bio: "Ensuring the smooth daily operations of the school.",
      email: "operations@school.com",
      linkedin: "#"
    },
    {
      name: "Ms. Emily White",
      role: "IT Coordinator",
      department: "IT",
      image: "/api/placeholder/300/300",
      bio: "Managing school technology and digital learning resources.",
      email: "it@school.com",
      github: "#"
    },
    {
      name: "Mrs. Linda Green",
      role: "Student Support Counselor",
      department: "Support",
      image: "/api/placeholder/300/300",
      bio: "Providing guidance and support to students.",
      email: "support@school.com",
      linkedin: "#"
    },
    {
      name: "Mr. David Brown",
      role: "Media Specialist",
      department: "Media",
      image: "/api/placeholder/300/300",
      bio: "Handling school communications and public relations.",
      email: "media@school.com",
      linkedin: "#"
    },
  ];

  const getDepartmentIcon = (dept: string) => {
    switch(dept) {
      case "Leadership": return <GraduationCap className="h-6 w-6" />;
      case "Operations": return <Users className="h-6 w-6" />;
      case "IT": return <Code className="h-6 w-6" />;
      case "Support": return <HeadphonesIcon className="h-6 w-6" />;
      case "Media": return <MegaphoneIcon className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const getDepartmentColor = (dept: string) => {
    switch(dept) {
      case "Leadership": return "bg-blue-600";
      case "Operations": return "bg-yellow-600";
      case "IT": return "bg-green-600";
      case "Support": return "bg-purple-600";
      case "Media": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                Meet Our Team
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                The People Behind
                <span className="text-yellow-300"> {school.name}'s Success</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Dedicated professionals working together to provide excellent education
              </p>
            </div>
          </div>
        </section>

        {/* Team Sections */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {TEAM_SUBSECTIONS.map((subsection, deptIndex) => (
                <div key={subsection.id} id={subsection.id} className={`${deptIndex > 0 ? 'mt-20' : ''}`}>
                  <div className="text-center mb-12">
                    <div className={`${getDepartmentColor(subsection.label)} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <div className="text-white">
                        {getDepartmentIcon(subsection.label)}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {subsection.label} Team
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers
                      .filter(member => member.department === subsection.label)
                      .map((member, index) => (
                        <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                          <CardHeader className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="h-12 w-12 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">{member.name}</CardTitle>
                            <p className="text-blue-600 font-medium">{member.role}</p>
                          </CardHeader>
                          <CardContent className="text-center">
                            <p className="text-gray-600 mb-4">{member.bio}</p>
                            <div className="flex justify-center gap-3">
                              <Button variant="outline" size="sm" className="p-2">
                                <Mail className="h-4 w-4" />
                              </Button>
                              {member.linkedin && (
                                <Button variant="outline" size="sm" className="p-2">
                                  <Linkedin className="h-4 w-4" />
                                </Button>
                              )}
                              {member.github && (
                                <Button variant="outline" size="sm" className="p-2">
                                  <Github className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Connect with Our Team?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Reach out to learn more about {school.name}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Link to={`/s/${school.slug}/contact`}>
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
