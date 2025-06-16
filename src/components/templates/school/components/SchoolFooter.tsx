import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { School } from '@/lib/types';

interface SchoolFooterProps {
  school: School;
}

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Contact', href: '/contact' },
];

export default function SchoolFooter({ school }: SchoolFooterProps) {
  return (
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
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Contact Information</h4>
            <div className="space-y-4">
              {school.contact_info?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{school.contact_info.address}</span>
                </div>
              )}
              {school.contact_info?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{school.contact_info.phone}</span>
                </div>
              )}
              {school.contact_info?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{school.contact_info.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social & Actions */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Connect With Us</h4>
            <div className="space-y-4">
              <div className="flex space-x-3">
                <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0">
                  <MessageCircle className="h-4 w-4" />
                </Button>
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
  );
}
