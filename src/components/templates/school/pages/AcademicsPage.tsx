import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, PageContent } from '@/lib/types';
import { 
  BookOpen, 
  Microscope, 
  Calculator, 
  Globe, 
  Palette, 
  Music,
  Laptop,
  Users,
  Award
} from 'lucide-react';

interface AcademicsPageProps {
  school: School;
  pageContent?: PageContent;
}

export default function AcademicsPage({ school, pageContent }: AcademicsPageProps) {
  const gradeLevels = [
    {
      title: 'Nursery (Ages 3-5)',
      description: 'Foundation learning through play-based activities, early literacy, and social development.',
      subjects: ['Basic Literacy', 'Numeracy', 'Creative Arts', 'Physical Development'],
      icon: <Users className="h-8 w-8" />
    },
    {
      title: 'Primary (Ages 6-11)',
      description: 'Comprehensive curriculum building core academic skills and critical thinking.',
      subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Creative Arts'],
      icon: <BookOpen className="h-8 w-8" />
    },
    {
      title: 'Junior Secondary (Ages 12-14)',
      description: 'Preparatory education for senior secondary with subject specialization.',
      subjects: ['Core Subjects', 'Basic Technology', 'Home Economics', 'Agricultural Science'],
      icon: <Microscope className="h-8 w-8" />
    },
    {
      title: 'Senior Secondary (Ages 15-17)',
      description: 'Advanced preparation for WAEC/NECO examinations and university entrance.',
      subjects: ['Science Track', 'Arts Track', 'Commercial Track'],
      icon: <Award className="h-8 w-8" />
    }
  ];
  const specialPrograms = [
    {
      icon: <Microscope className="h-12 w-12" />,
      title: 'STEM Excellence',
      description: 'Advanced Science, Technology, Engineering, and Mathematics program with modern laboratory facilities.',
      features: ['Modern Science Labs', 'Robotics Club', 'Coding Classes', 'Science Olympiad']
    },
    {
      icon: <Palette className="h-12 w-12" />,
      title: 'Creative Arts',
      description: 'Comprehensive arts program nurturing creativity and artistic expression.',
      features: ['Visual Arts', 'Music & Drama', 'Creative Writing', 'Art Exhibitions']
    },
    {
      icon: <Laptop className="h-12 w-12" />,
      title: 'ICT Program',
      description: 'Digital literacy and computer science education for the modern world.',
      features: ['Computer Labs', 'Programming', 'Digital Design', 'Tech Innovation']
    },
    {
      icon: <Globe className="h-12 w-12" />,
      title: 'Global Studies',
      description: 'International perspective with language learning and cultural exchange.',
      features: ['Foreign Languages', 'Cultural Studies', 'Model UN', 'Exchange Programs']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Academic Excellence</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Our comprehensive academic program is designed to challenge, inspire, and prepare 
            students for success in higher education and beyond.
          </p>
        </div>
      </section>

      {/* Academic Philosophy */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Academic Philosophy</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              We believe in holistic education that develops not just academic knowledge, but also 
              critical thinking, creativity, and character. Our curriculum is designed to meet 
              international standards while being relevant to our local context.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Rigorous Curriculum</h3>
                <p className="text-gray-600">Comprehensive academic program aligned with national and international standards</p>
              </div>              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Personalized Learning</h3>
                <p className="text-gray-600">Individual attention and support to help every student reach their potential</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Excellence Focus</h3>
                <p className="text-gray-600">Commitment to achieving outstanding results in all academic endeavors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grade Levels */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Grade Levels</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Progressive learning journey from early childhood through senior secondary education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gradeLevels.map((level, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    {level.icon}
                  </div>
                  <CardTitle className="text-lg">{level.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{level.description}</p>
                  <div className="space-y-2">
                    {level.subjects.map((subject, subIndex) => (
                      <Badge key={subIndex} variant="secondary" className="mr-2 mb-2">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Special Programs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Special Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enhanced learning opportunities that go beyond the traditional curriculum.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialPrograms.map((program, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="text-primary flex-shrink-0">
                    {program.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{program.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{program.description}</p>
                    <div className="space-y-2">
                      {program.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="outline" className="mr-2 mb-2">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
