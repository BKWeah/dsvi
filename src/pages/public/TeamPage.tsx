import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Mail, Linkedin, Github, ChevronDown, ArrowRight } from 'lucide-react';
import { teamMembers, departments, getDepartmentIcon, getDepartmentColor } from '@/data/teamData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeamPage() {
  const { department: departmentParam } = useParams<{ department: string }>();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    if (departmentParam) {
      let formattedDept = departmentParam.toLowerCase();
      if (formattedDept === "it") {
        formattedDept = "IT"; // Special case for "IT" department
      } else {
        formattedDept = formattedDept.charAt(0).toUpperCase() + formattedDept.slice(1);
      }
      setSelectedDepartment(formattedDept);
    } else {
      setSelectedDepartment("Leadership"); // Default to Leadership if no param
    }
  }, [departmentParam]);

  // Removed handleRegisterClick and handleLoginClick as Navigation component handles its own routing
  // Removed scrollToSection as navigation is now handled by react-router-dom

  return (
    <>
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

        {/* Dropdown Navigation for Team Sections */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-lg px-6 py-3">
                  Jump to Section <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {departments.map((department) => (
                  <DropdownMenuItem 
                    key={department.name} 
                    onClick={() => navigate(`/team/${department.name.toLowerCase()}`)}
                  >
                    {department.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        {/* Team Sections */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {selectedDepartment && (
                <div key={selectedDepartment} id={selectedDepartment.toLowerCase().replace(/\s/g, '-')}>
                  <div className="text-center mb-12">
                    <div className={`${getDepartmentColor(selectedDepartment)} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <div className="text-white">
                        {React.createElement(getDepartmentIcon(selectedDepartment), { className: "h-6 w-6" })}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {selectedDepartment} Team
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers
                      .filter(member => member.department === selectedDepartment)
                      .map((member, index) => {
                        const IconComponent = member.icon;
                        return (
                          <Card key={index} className={`border-none shadow-lg hover:shadow-xl transition-shadow ${member.isVacant ? 'opacity-75' : ''}`}>
                            <CardHeader className="text-center">
                              <div className="relative mb-6">
                                {member.hasPhoto ? (
                                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-gradient-to-br from-blue-600 to-green-600">
                                    <img 
                                      src={member.name === "B. K. Weah, Jr." ? "/updates_assets/B. K. Weah Pro.jpg" : 
                                           member.name === "John Gyawu" ? "/updates_assets/MR. JOHN GYAWU.jpg" : 
                                           ""} 
                                      alt={member.name}
                                      className="w-full h-full object-cover object-top"
                                      style={{ objectPosition: '50% 0%' }}
                                    />
                                  </div>
                                ) : (
                                  <div className={`w-24 h-24 ${member.isVacant ? 'bg-gray-400' : 'bg-gradient-to-br from-blue-600 to-green-600'} rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl`}>
                                    {member.isVacant ? '?' : member.avatar}
                                  </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                  <IconComponent className="h-4 w-4 text-gray-600" />
                                </div>
                              </div>
                              <CardTitle className={`text-xl ${member.isVacant ? 'text-gray-500' : 'text-gray-900'}`}>
                                {member.name}
                              </CardTitle>
                              <p className={`font-semibold mb-1 ${member.isVacant ? 'text-gray-400' : 'text-blue-600'}`}>{member.role}</p>
                              <Badge className={`mb-4 text-xs ${member.isVacant ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-700'}`}>
                                {member.department}
                              </Badge>
                            </CardHeader>
                            <CardContent className="text-center">
                              <p className={`text-sm leading-relaxed mb-4 ${member.isVacant ? 'text-gray-500' : 'text-gray-600'}`}>
                                {member.description}
                              </p>
                              {member.isVacant && (
                                <p className="text-xs text-red-500 mt-2 font-medium">Position Available</p>
                              )}
                              {!member.isVacant && (
                                <div className="flex justify-center gap-3">
                                  {member.email && (
                                    <Button variant="outline" size="sm" className="p-2">
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  )}
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
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    }
                  </div>
                </div>
              )}
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
    </>
  );
}
