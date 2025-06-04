import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { School, PageContent } from '@/lib/types';
import { Mail, Phone, Linkedin, GraduationCap, Award, Users } from 'lucide-react';

interface FacultyPageProps {
  school: School;
  pageContent?: PageContent;
}

export default function FacultyPage({ school, pageContent }: FacultyPageProps) {
  const facultyMembers = [
    {
      name: 'Dr. Mary Adebayo',
      title: 'Principal',
      department: 'Administration',
      qualifications: 'Ph.D. Educational Leadership, M.Ed. Curriculum Development',
      experience: '25+ years',
      bio: 'Dr. Adebayo brings over two decades of educational leadership experience, with a passion for transforming lives through quality education.',
      image: '/api/placeholder/200/200',
      email: 'principal@school.edu.ng',
      specialties: ['Educational Leadership', 'Curriculum Development', 'School Management']
    },
    {
      name: 'Mr. James Okafor',
      title: 'Vice Principal (Academics)',
      department: 'Administration',
      qualifications: 'M.Ed. Mathematics Education, B.Sc. Mathematics',
      experience: '18+ years',
      bio: 'A dedicated mathematics educator with expertise in curriculum development and academic excellence strategies.',
      image: '/api/placeholder/200/200',
      email: 'vp.academics@school.edu.ng',
      specialties: ['Mathematics', 'Academic Planning', 'Assessment']
    },    {
      name: 'Mrs. Sarah Johnson',
      title: 'Head of Science Department',
      department: 'Science',
      qualifications: 'M.Sc. Chemistry, B.Ed. Science Education',
      experience: '15+ years',
      bio: 'Passionate about making science accessible and exciting for all students through innovative teaching methods.',
      image: '/api/placeholder/200/200',
      email: 'science.head@school.edu.ng',
      specialties: ['Chemistry', 'Laboratory Management', 'STEM Education']
    },
    {
      name: 'Mr. David Adamu',
      title: 'English & Literature Teacher',
      department: 'Languages',
      qualifications: 'M.A. English Literature, B.A. English Language',
      experience: '12+ years',
      bio: 'Dedicated to fostering a love for language and literature while developing critical thinking skills.',
      image: '/api/placeholder/200/200',
      email: 'english@school.edu.ng',
      specialties: ['English Literature', 'Creative Writing', 'Public Speaking']
    },
    {
      name: 'Mrs. Grace Emeka',
      title: 'Primary School Coordinator',
      department: 'Primary Education',
      qualifications: 'M.Ed. Primary Education, B.Ed. Early Childhood',
      experience: '16+ years',
      bio: 'Specializes in creating nurturing learning environments that support the holistic development of young learners.',
      image: '/api/placeholder/200/200',
      email: 'primary@school.edu.ng',
      specialties: ['Early Childhood Development', 'Literacy', 'Classroom Management']
    },
    {
      name: 'Mr. Paul Nwosu',
      title: 'ICT Coordinator',
      department: 'Technology',
      qualifications: 'B.Sc. Computer Science, Cert. Educational Technology',
      experience: '10+ years',
      bio: 'Passionate about integrating technology into education and preparing students for the digital future.',
      image: '/api/placeholder/200/200',
      email: 'ict@school.edu.ng',
      specialties: ['Computer Programming', 'Digital Literacy', 'Educational Technology']
    }
  ];

  const departments = [
    { name: 'Administration', color: 'bg-blue-100 text-blue-800' },
    { name: 'Science', color: 'bg-green-100 text-green-800' },
    { name: 'Languages', color: 'bg-purple-100 text-purple-800' },
    { name: 'Primary Education', color: 'bg-orange-100 text-orange-800' },
    { name: 'Technology', color: 'bg-indigo-100 text-indigo-800' }
  ];
  const getDepartmentColor = (department: string) => {
    const dept = departments.find(d => d.name === department);
    return dept?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Faculty & Staff</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">
            Meet our dedicated team of educators who are committed to inspiring and 
            nurturing the next generation of leaders and innovators.
          </p>
        </div>
      </section>

      {/* Faculty Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Commitment to Excellence</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our faculty represents a diverse group of passionate educators who bring years of experience, 
              advanced qualifications, and innovative teaching methods to the classroom. Each member is 
              dedicated to creating an environment where every student can thrive academically and personally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Highly Qualified</h3>
              <p className="text-gray-600">Advanced degrees and professional certifications</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Experienced</h3>
              <p className="text-gray-600">Years of classroom experience and proven results</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Student-Centered</h3>
              <p className="text-gray-600">Focused on individual student growth and success</p>
            </div>
          </div>
        </div>
      </section>
      {/* Faculty Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get to know the dedicated professionals who make learning an inspiring journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facultyMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6">
                  {/* Profile Section */}
                  <div className="text-center mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback className="text-lg bg-primary text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-primary font-semibold mb-2">{member.title}</p>
                    <Badge className={getDepartmentColor(member.department)}>
                      {member.department}
                    </Badge>
                  </div>

                  {/* Experience & Qualifications */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Experience</h4>
                      <p className="text-sm text-gray-600">{member.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Qualifications</h4>
                      <p className="text-sm text-gray-600">{member.qualifications}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                  </div>

                  {/* Specialties */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, specIndex) => (
                        <Badge key={specIndex} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
