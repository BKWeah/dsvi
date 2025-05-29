import React from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, GraduationCap, Code, HeadphonesIcon, 
  MegaphoneIcon, ArrowRight, Mail, Linkedin, Github 
} from 'lucide-react';

export default function TeamPage() {
  const handleRegisterClick = () => {
    window.location.href = '/register';
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const teamMembers = [
    // Leadership Team
    {
      name: "Boniface Koffa Weah, Jr.",
      role: "Director",
      department: "Leadership",
      image: "/api/placeholder/300/300",
      bio: "Leading DSVI's mission to digitally empower every Liberian school",
      email: "director@libdsvi.com",
      linkedin: "#"
    },
    {
      name: "Sarah Johnson",
      role: "Deputy Director",
      department: "Leadership", 
      image: "/api/placeholder/300/300",
      bio: "Strategic oversight and operational excellence",
      email: "deputy@libdsvi.com",
      linkedin: "#"
    },    
    // IT Team
    {
      name: "Michael Chen",
      role: "Technical Lead",
      department: "IT",
      image: "/api/placeholder/300/300",
      bio: "Full-stack developer specializing in educational technology",
      email: "tech@libdsvi.com",
      github: "#"
    },
    {
      name: "Fatima Al-Rashid",
      role: "Frontend Developer",
      department: "IT",
      image: "/api/placeholder/300/300",
      bio: "Creating beautiful, responsive user interfaces",
      email: "frontend@libdsvi.com",
      github: "#"
    },
    {
      name: "James Parker",
      role: "Backend Developer",
      department: "IT",
      image: "/api/placeholder/300/300",
      bio: "Building robust, scalable web applications",
      email: "backend@libdsvi.com",
      github: "#"
    },
    
    // Support Team
    {
      name: "Grace Kollie",
      role: "Customer Success Manager",
      department: "Support",
      image: "/api/placeholder/300/300",
      bio: "Ensuring every school's success with our platform",
      email: "support@libdsvi.com",
      linkedin: "#"
    },
    {
      name: "Daniel Roberts",
      role: "Technical Support Specialist",
      department: "Support",
      image: "/api/placeholder/300/300",
      bio: "Providing 24/7 technical assistance to schools",
      email: "help@libdsvi.com",
      linkedin: "#"
    },    
    // Marketing Team
    {
      name: "Emma Williams",
      role: "Marketing Director",
      department: "Marketing",
      image: "/api/placeholder/300/300",
      bio: "Spreading awareness about DSVI across Liberia",
      email: "marketing@libdsvi.com",
      linkedin: "#"
    },
    {
      name: "John Tuweh",
      role: "Community Outreach Coordinator",
      department: "Marketing",
      image: "/api/placeholder/300/300", 
      bio: "Building relationships with schools nationwide",
      email: "outreach@libdsvi.com",
      linkedin: "#"
    }
  ];

  const departments = ["Leadership", "IT", "Support", "Marketing"];

  const getDepartmentIcon = (dept: string) => {
    switch(dept) {
      case "Leadership": return <GraduationCap className="h-6 w-6" />;
      case "IT": return <Code className="h-6 w-6" />;
      case "Support": return <HeadphonesIcon className="h-6 w-6" />;
      case "Marketing": return <MegaphoneIcon className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const getDepartmentColor = (dept: string) => {
    switch(dept) {
      case "Leadership": return "bg-blue-600";
      case "IT": return "bg-green-600";
      case "Support": return "bg-purple-600";
      case "Marketing": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

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
                Meet Our Team
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                The People Behind
                <span className="text-yellow-300"> DSVI's Success</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Dedicated professionals working together to transform Liberian education through digital innovation
              </p>
            </div>
          </div>
        </section>

        {/* Team Sections */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {departments.map((department, deptIndex) => (
                <div key={department} className={`${deptIndex > 0 ? 'mt-20' : ''}`}>
                  <div className="text-center mb-12">
                    <div className={`${getDepartmentColor(department)} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <div className="text-white">
                        {getDepartmentIcon(department)}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {department} Team
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers
                      .filter(member => member.department === department)
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
                Ready to Work with Our Expert Team?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Our dedicated professionals are here to help your school succeed online
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Link to="/register">
                    Onboard Your School
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link to="/contact">Contact Our Team</Link>
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