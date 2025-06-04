import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Star, Award, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaButtons?: Array<{
    text: string;
    href: string;
    variant?: 'default' | 'outline' | 'secondary';
  }>;
  highlights?: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  className?: string;
}

export default function HeroSection({ 
  title, 
  subtitle, 
  backgroundImage,
  ctaButtons = [],
  highlights = [],
  className 
}: HeroSectionProps) {
  const defaultHighlights = [
    { icon: <Star className="h-4 w-4" />, text: "Excellence in Education" },
    { icon: <Award className="h-4 w-4" />, text: "Award Winning Programs" },
    { icon: <Users className="h-4 w-4" />, text: "Experienced Faculty" },
    { icon: <BookOpen className="h-4 w-4" />, text: "Comprehensive Curriculum" },
  ];

  const displayHighlights = highlights.length > 0 ? highlights : defaultHighlights;  
  return (
    <section 
      className={cn(
        "relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage || '/api/placeholder/1920/1080'} 
          alt="School campus"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          {/* CTA Buttons */}
          {ctaButtons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {ctaButtons.map((button, index) => (
                <Button
                  key={index}
                  asChild
                  size="lg"
                  variant={button.variant || 'default'}
                  className="text-lg px-8 py-6 h-auto"
                >
                  <a href={button.href}>{button.text}</a>
                </Button>
              ))}
            </div>
          )}

          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            {displayHighlights.map((highlight, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-2 py-3 px-4 bg-white/10 text-white border-white/20 backdrop-blur-sm"
              >
                {highlight.icon}
                <span className="text-sm font-medium">{highlight.text}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/60" />
        </div>
      </div>
    </section>
  );
}
