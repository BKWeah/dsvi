import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "John Doe",
      role: "Principal",
      school: "Lincoln Elementary School",
      rating: 5,
      text: "DSVI transformed our school's online presence, making it easier for parents and students to connect. Their professional service is unmatched in Liberia!",
      avatar: "JD"
    },
    {
      name: "Sarah Johnson",
      role: "Administrator", 
      school: "Riverside High School",
      rating: 5,
      text: "The support team is incredible. They helped us migrate all our content and trained our staff. Our enrollment inquiries have increased by 40%!",
      avatar: "SJ"
    },
    {
      name: "Michael Brown",
      role: "Director",
      school: "Oak Valley Academy",
      rating: 5,
      text: "As a small private school, we needed an affordable solution that didn't compromise on quality. DSVI delivered exactly what we needed!",
      avatar: "MB"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-6 py-2 text-lg">
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Educators Say About DSVI
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Trusted by educational institutions across Liberia. Here's what our partners have to say about their experience with DSVI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <Quote className="h-8 w-8 text-blue-200 absolute -top-2 -left-2" />
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed relative z-10">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600 font-medium">{testimonial.school}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};