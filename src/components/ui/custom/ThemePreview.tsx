import React from 'react';
import { ComprehensiveThemeSettings } from '@/lib/types';
import { getThemeClasses, getThemeColor } from '@/lib/theme-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ThemePreviewProps {
  theme: ComprehensiveThemeSettings;
  logoUrl?: string;
  schoolName?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ 
  theme, 
  logoUrl = '',
  schoolName = 'Your School Name'
}) => {
  const themeClasses = getThemeClasses(theme);

  const previewStyle = {
    fontFamily: theme.typography?.fontFamily?.primary || 'Inter, system-ui, sans-serif',
    backgroundColor: theme.colors?.background || '#ffffff',
    color: theme.colors?.text?.primary || '#000000',
    fontSize: theme.typography?.fontSize?.base || '1rem',
    lineHeight: theme.typography?.lineHeight?.normal || 1.5,
  };

  const navigationStyle = {
    backgroundColor: theme.navigation?.background || '#ffffff',
    color: theme.navigation?.textColor || '#000000',
    height: theme.navigation?.height || '64px',
    borderBottom: `1px solid ${theme.navigation?.borderColor || '#e5e7eb'}`,
    boxShadow: theme.navigation?.dropShadow !== false ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
  };

  const heroStyle = {
    minHeight: theme.hero?.minHeight || '400px',
    textAlign: theme.hero?.textAlign || 'center',
    backgroundColor: theme.hero?.style === 'gradient' 
      ? `linear-gradient(135deg, ${theme.colors?.primary || '#3b82f6'}, ${theme.colors?.secondary || '#64748b'})`
      : theme.colors?.primary || '#3b82f6',
    color: '#ffffff',
    position: 'relative',
  } as React.CSSProperties;

  const cardStyle = {
    backgroundColor: theme.components?.cards?.background || '#ffffff',
    borderColor: theme.components?.cards?.borderColor || '#e5e7eb',
    borderRadius: theme.components?.cards?.borderRadius || '0.5rem',
    border: `1px solid ${theme.components?.cards?.borderColor || '#e5e7eb'}`,
  };

  const buttonStyle = {
    backgroundColor: theme.colors?.primary || '#3b82f6',
    borderRadius: theme.components?.buttons?.borderRadius || '0.375rem',
    fontSize: theme.components?.buttons?.fontSize || '0.875rem',
    padding: theme.components?.buttons?.padding || '0.5rem 1rem',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
  };

  const footerStyle = {
    backgroundColor: theme.footer?.background || '#1f2937',
    color: theme.footer?.textColor || '#ffffff',
    borderTop: `1px solid ${theme.footer?.borderColor || '#374151'}`,
    padding: '2rem 0',
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
      <div className="bg-gray-100 p-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          Theme Preview
        </h3>
      </div>
      
      <div style={previewStyle} className="min-h-[600px]">
        {/* Navigation Preview */}
        <div style={navigationStyle} className="flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo" 
                style={{ height: theme.navigation?.logoSize || '40px' }}
                className="object-contain"
              />
            )}
            <span 
              className="font-semibold text-lg"
              style={{ fontFamily: theme.typography?.fontFamily?.display }}
            >
              {schoolName}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="hover:opacity-70">Home</a>
            <a href="#" className="hover:opacity-70">About</a>
            <a href="#" className="hover:opacity-70">Academics</a>
            <a href="#" className="hover:opacity-70">Admissions</a>
            <a href="#" className="hover:opacity-70">Contact</a>
          </nav>
        </div>

        {/* Hero Section Preview */}
        <div style={heroStyle} className="flex items-center justify-center relative">
          {(theme.hero?.style === 'image' || theme.hero?.style === 'video') && (
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: theme.hero?.overlayColor || '#000000',
                opacity: theme.hero?.overlayOpacity || 0.3,
              }}
            />
          )}
          <div className="relative z-10 text-center px-6">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ 
                fontFamily: theme.typography?.fontFamily?.display,
                fontSize: theme.typography?.fontSize?.['4xl'] || '2.25rem',
                fontWeight: theme.typography?.fontWeight?.bold || 700,
                lineHeight: theme.typography?.lineHeight?.tight || 1.25,
              }}
            >
              Welcome to {schoolName}
            </h1>
            <p 
              className="text-xl mb-8 opacity-90"
              style={{ 
                fontSize: theme.typography?.fontSize?.xl || '1.25rem',
                lineHeight: theme.typography?.lineHeight?.normal || 1.5,
              }}
            >
              Excellence in Education, Innovation in Learning
            </p>
            <button 
              style={buttonStyle}
              className="hover:opacity-90 transition-opacity"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Content Section Preview */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Sample Cards */}
              {[
                { title: 'Academic Excellence', content: 'Rigorous curriculum designed to challenge and inspire students.' },
                { title: 'Modern Facilities', content: 'State-of-the-art classrooms and laboratories for optimal learning.' },
                { title: 'Dedicated Faculty', content: 'Experienced educators committed to student success.' }
              ].map((item, index) => (
                <div key={index} style={cardStyle} className="p-6">
                  <h3 
                    className="text-lg font-semibold mb-3"
                    style={{ 
                      fontFamily: theme.typography?.fontFamily?.display,
                      fontSize: theme.typography?.fontSize?.lg || '1.125rem',
                      color: theme.colors?.text?.primary,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: theme.colors?.text?.secondary,
                      lineHeight: theme.typography?.lineHeight?.normal || 1.5,
                    }}
                  >
                    {item.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Sample Form */}
            <div style={cardStyle} className="p-6 max-w-md mx-auto">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ 
                  fontFamily: theme.typography?.fontFamily?.display,
                  color: theme.colors?.text?.primary,
                }}
              >
                Contact Us
              </h3>
              <div className="space-y-4">
                <Input 
                  placeholder="Your Name"
                  style={{
                    borderRadius: theme.components?.forms?.borderRadius || '0.375rem',
                    borderColor: theme.components?.forms?.borderColor || '#d1d5db',
                  }}
                />
                <Input 
                  placeholder="Email Address"
                  style={{
                    borderRadius: theme.components?.forms?.borderRadius || '0.375rem',
                    borderColor: theme.components?.forms?.borderColor || '#d1d5db',
                  }}
                />
                <button style={buttonStyle} className="w-full hover:opacity-90 transition-opacity">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Preview */}
        <div style={footerStyle}>
          <div className="max-w-6xl mx-auto px-6">
            {theme.footer?.style === 'columns' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold mb-3">Quick Links</h4>
                  <ul className="space-y-2 text-sm opacity-80">
                    <li><a href="#" className="hover:opacity-100">About Us</a></li>
                    <li><a href="#" className="hover:opacity-100">Academics</a></li>
                    <li><a href="#" className="hover:opacity-100">Admissions</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Resources</h4>
                  <ul className="space-y-2 text-sm opacity-80">
                    <li><a href="#" className="hover:opacity-100">Student Portal</a></li>
                    <li><a href="#" className="hover:opacity-100">Parent Resources</a></li>
                    <li><a href="#" className="hover:opacity-100">Faculty</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contact</h4>
                  <div className="text-sm opacity-80">
                    <p>123 Education Street</p>
                    <p>Learning City, LC 12345</p>
                    <p>Phone: (555) 123-4567</p>
                  </div>
                </div>
              </div>
            ) : theme.footer?.style === 'centered' ? (
              <div className="text-center">
                <h4 className="font-semibold mb-4">{schoolName}</h4>
                <p className="text-sm opacity-80 mb-4">
                  Excellence in Education, Innovation in Learning
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <a href="#" className="hover:opacity-100">Privacy Policy</a>
                  <a href="#" className="hover:opacity-100">Terms of Service</a>
                  <a href="#" className="hover:opacity-100">Contact</a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm opacity-80">
                    © 2024 {schoolName}. All rights reserved.
                  </p>
                </div>
                <div className="flex gap-6 text-sm">
                  <a href="#" className="hover:opacity-100">Privacy Policy</a>
                  <a href="#" className="hover:opacity-100">Terms</a>
                  <a href="#" className="hover:opacity-100">Contact</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {theme.typography?.fontFamily?.primary?.split(',')[0] || 'Inter'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {theme.navigation?.style || 'default'} nav
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {theme.hero?.style || 'default'} hero
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {theme.footer?.style || 'simple'} footer
          </Badge>
        </div>
      </div>
    </div>
  );
};
