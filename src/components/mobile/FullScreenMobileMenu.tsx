import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Info, GraduationCap, UserCheck, Users, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSubdomainRouting, generateSchoolUrl } from '@/lib/subdomain-utils';

interface FullScreenMobileMenuProps {
  schoolSlug: string;
  currentPage?: string;
}

export function FullScreenMobileMenu({ schoolSlug, currentPage }: FullScreenMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSubdomain = isSubdomainRouting();

  const menuItems = [
    { 
      slug: 'homepage', 
      label: 'Home', 
      icon: Home, 
      path: isSubdomain ? '/' : generateSchoolUrl(schoolSlug, 'homepage')
    },
    { 
      slug: 'about-us', 
      label: 'About Us', 
      icon: Info, 
      path: isSubdomain ? '/about-us' : generateSchoolUrl(schoolSlug, 'about-us')
    },
    { 
      slug: 'academics', 
      label: 'Academics', 
      icon: GraduationCap, 
      path: isSubdomain ? '/academics' : generateSchoolUrl(schoolSlug, 'academics')
    },
    { 
      slug: 'admissions', 
      label: 'Admissions', 
      icon: UserCheck, 
      path: isSubdomain ? '/admissions' : generateSchoolUrl(schoolSlug, 'admissions')
    },
    { 
      slug: 'faculty', 
      label: 'Faculty', 
      icon: Users, 
      path: isSubdomain ? '/faculty' : generateSchoolUrl(schoolSlug, 'faculty')
    },
    { 
      slug: 'contact', 
      label: 'Contact', 
      icon: Phone, 
      path: isSubdomain ? '/contact' : generateSchoolUrl(schoolSlug, 'contact')
    }
  ];

  return (
    <>
      {/* Menu Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Full Screen Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative h-full bg-background/95 backdrop-blur-xl">
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-background/80"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="pt-20 px-8">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.slug || 
                    (currentPage === 'homepage' && item.slug === 'homepage');
                  
                  return (
                    <a
                      key={item.slug}
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 text-lg",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "hover:bg-accent hover:shadow-md"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
