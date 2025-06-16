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

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* School Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                {school.logo_url && (
                  <img 
                    src={school.logo_url} 
                    alt={`${school.name} Logo`} 
                    className="h-10 w-auto brightness-0 invert"
                  />
                )}
                <h3 className="text-xl font-bold text-white leading-tight">{school.name}</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Empowering students to reach their full potential through quality education and character development.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Home</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">About Us</a></li>
                <li><a href="/academics" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Academics</a></li>
                <li><a href="/admissions" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Admissions</a></li>
                <li><a href="/faculty" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Faculty</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300 text-sm">123 Education Street, Academic City</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300 text-sm">info@testschool.edu</span>
                </div>
              </div>
            </div>

            {/* Social & Actions */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">Connect With Us</h4>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </button>
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.342-.09.375-.294 1.199-.334 1.363-.053.225-.172.271-.402.162-1.499-.69-2.436-2.878-2.436-4.633 0-3.777 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.295-.744 2.86-.269 1.031-1.002 2.323-1.492 3.106C9.635 23.564 10.794 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </button>
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.065 0C18.595 0 24 5.405 24 11.935c0 6.531-5.405 11.935-11.935 11.935S.131 18.466.131 11.935C.131 5.405 5.536.001 12.065.001zm2.31 18.477v-6.12H16.4v-1.469h-2.026V9.505c0-.625.325-.959.893-.959h1.136V7.047h-1.668c-1.533 0-2.36.896-2.36 2.375v1.465h-1.399v1.469h1.399v6.12h1.931z"/>
                    </svg>
                  </button>
                </div>
                <a 
                  href="/apply" 
                  className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline inline-flex items-center"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 bg-gray-950">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                <p>&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
                <div className="flex space-x-4">
                  <a href="/terms" className="hover:text-white transition-colors no-underline hover:underline">Terms of Use</a>
                  <a href="/privacy" className="hover:text-white transition-colors no-underline hover:underline">Privacy Policy</a>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span>Built with ❤️ by</span>
                <a 
                  href="https://libdsvi.com" 
                  className="text-gray-300 hover:text-white transition-colors font-medium no-underline hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DSVI
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
