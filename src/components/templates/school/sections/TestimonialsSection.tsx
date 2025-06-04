import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  className?: string;
}

export default function TestimonialsSection({ 
  title = "What Our Community Says",
  subtitle = "Hear from parents, students, and graduates about their experience",
  testimonials,
  className 
}: TestimonialsSectionProps) {
  
  const defaultTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Mrs. Adebayo',
      role: 'Parent',
      content: 'This school has transformed my daughter\'s academic journey. The teachers are dedicated and the environment is truly conducive for learning.',
      rating: 5
    },
    {
      id: '2',
      name: 'David Okafor',
      role: 'Graduate, Class of 2023',
      content: 'The STEM program here prepared me excellently for university. I\'m now studying Engineering at the University of Lagos.',
      rating: 5
    },    {
      id: '3',
      name: 'Mrs. Johnson',
      role: 'Parent',
      content: 'The character building aspect of this school is remarkable. My son has developed strong leadership skills and moral values.',
      rating: 5
    },
    {
      id: '4',
      name: 'Fatima Ibrahim',
      role: 'Current Student',
      content: 'I love the supportive environment and the way teachers encourage us to reach our full potential in every subject.',
      rating: 5
    }
  ];

  const displayTestimonials = testimonials || defaultTestimonials;

  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className={`py-16 bg-white ${className || ''}`}>
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {displayTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-blue-200 mb-4" />
                
                {/* Testimonial Content */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed text-lg">
                  "{testimonial.content}"
                </blockquote>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
