import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Trophy, 
  Users, 
  BookOpen, 
  Star, 
  Award,
  Target,
  Heart
} from 'lucide-react';

interface HighlightItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

interface HighlightsSectionProps {
  title?: string;
  subtitle?: string;
  highlights?: HighlightItem[];
  className?: string;
}

export default function HighlightsSection({ 
  title = "Why Choose Our School",
  subtitle = "Excellence in education with proven results",
  highlights,
  className 
}: HighlightsSectionProps) {
  
  const defaultHighlights: HighlightItem[] = [
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "100% WAEC Pass Rate",
      description: "Outstanding academic performance with all students passing their examinations",
      badge: "Achievement",
      color: 'green'
    },    {
      icon: <Award className="h-8 w-8" />,
      title: "STEM Excellence",
      description: "State-of-the-art science, technology, engineering and mathematics programs",
      badge: "Programs",
      color: 'blue'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Faculty",
      description: "Highly qualified teachers with years of experience in education",
      badge: "Team",
      color: 'purple'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Character Building",
      description: "Developing moral values and leadership skills alongside academics",
      badge: "Values",
      color: 'red'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Scholarship Programs",
      description: "Financial assistance available for deserving students",
      badge: "Support",
      color: 'orange'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Modern Facilities",
      description: "Well-equipped classrooms, laboratories, and library resources",
      badge: "Infrastructure",
      color: 'blue'
    }
  ];

  const displayHighlights = highlights || defaultHighlights;
  
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };
  
  return (
    <section className={`py-16 bg-gradient-to-br from-slate-50 to-blue-50 ${className || ''}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayHighlights.map((highlight, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${getColorClasses(highlight.color || 'blue')}`}>
                    {highlight.icon}
                  </div>
                  {highlight.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {highlight.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {highlight.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {highlight.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button size="lg" className="px-8 py-6 text-lg">
            Learn More About Our Programs
          </Button>
        </div>
      </div>
    </section>
  );
}
