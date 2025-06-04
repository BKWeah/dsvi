import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { School } from '@/lib/types';

interface SchoolFooterProps {
  school: School;
}

const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Contact', href: '/contact' },
];

export default function SchoolFooter({ school }: SchoolFooterProps) {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {school.logo_url && (
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} Logo`} 
                  className="h-8 w-auto brightness-0 invert"
                />
              )}
              <h3 className="text-lg font-bold">{school.name}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empowering students to reach their full potential through quality education and character development.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3">
              {school.contact_info?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 mt-1 text-slate-400" />
                  <span className="text-slate-300 text-sm">{school.contact_info.address}</span>
                </div>
              )}
              {school.contact_info?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{school.contact_info.phone}</span>
                </div>
              )}
              {school.contact_info?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{school.contact_info.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social & Actions */}
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="space-y-4">
              <div className="flex space-x-3">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8 bg-slate-800" />
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-1">
            <span>Built with ❤️ by</span>
            <a 
              href="https://dsvi.com" 
              className="text-white hover:text-primary transition-colors font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              DSVI
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
