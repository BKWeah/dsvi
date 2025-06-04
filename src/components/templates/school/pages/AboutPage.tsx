import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { School, PageContent } from '@/lib/types';
import { Target, Eye, Heart, Award, Users, Calendar } from 'lucide-react';

interface AboutPageProps {
  school: School;
  pageContent?: PageContent;
}

export default function AboutPage({ school, pageContent }: AboutPageProps) {
  const leadership = [
    {
      name: 'Dr. Mary Adebayo',
      title: 'Principal',
      image: '/api/placeholder/150/150',
      bio: 'With over 20 years in education, Dr. Adebayo brings exceptional leadership and vision to our school community.'
    },
    {
      name: 'Mr. James Okafor',
      title: 'Vice Principal (Academics)',
      image: '/api/placeholder/150/150',
      bio: 'A dedicated educator with expertise in curriculum development and academic excellence.'
    },
    {
      name: 'Mrs. Sarah Johnson',
      title: 'Administrator',
      image: '/api/placeholder/150/150',
      bio: 'Ensuring smooth operations and fostering a supportive environment for both students and staff.'
    }
  ];

  const achievements = [
    'Outstanding WAEC Performance - 100% Pass Rate (2020-2024)',
    'Regional Science Competition Champions (2023)',
    'Best Private School Award - State Level (2022)',
    'Excellence in Character Development Recognition (2024)',
    'Top 10 Schools in Mathematics Olympiad (2023)',
    'Community Service Excellence Award (2022-2024)'
  ];
  const coreValues = [
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Excellence',
      description: 'We strive for the highest standards in all we do'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Integrity',
      description: 'We uphold honesty and moral principles in our actions'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community',
      description: 'We foster a supportive and inclusive environment'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About {school.name}</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover our rich history, unwavering commitment to excellence, and the dedicated team 
            that makes our school a place where students thrive academically and personally.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mission */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To provide quality education that empowers students to become responsible, 
                  innovative, and confident leaders who contribute positively to society.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To be the leading educational institution that nurtures academic excellence, 
                  character development, and global citizenship in every student.
                </p>
              </CardContent>
            </Card>
            {/* Core Values */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coreValues.map((value, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-primary">{value.icon}</div>
                      <div className="text-left">
                        <h4 className="font-semibold">{value.title}</h4>
                        <p className="text-sm text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* School History */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                Founded in 1995, {school.name} has been a beacon of educational excellence for over 
                two decades. What started as a small community school with a vision to provide 
                quality education has grown into one of the most respected educational institutions 
                in the region.
              </p>
              <p className="mb-6">
                Our journey has been marked by continuous growth, innovation, and an unwavering 
                commitment to student success. From our humble beginnings with just 50 students, 
                we now serve over 800 students across all grade levels.
              </p>
              <p>
                Today, we stand proud of our achievements while remaining focused on our mission 
                to nurture the next generation of leaders, thinkers, and changemakers.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Leadership Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Leadership</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated team of educational leaders who guide our school's vision and mission.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={leader.image} alt={leader.name} />
                    <AvatarFallback className="text-lg bg-primary text-white">
                      {leader.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                  <Badge variant="secondary" className="mb-4">{leader.title}</Badge>
                  <p className="text-gray-600 leading-relaxed">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Achievements</h2>
            <p className="text-xl text-gray-600 mb-12">
              Recognition and awards that reflect our commitment to excellence in education.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Award className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
