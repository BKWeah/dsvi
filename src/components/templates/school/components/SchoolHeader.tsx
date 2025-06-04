import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { School } from '@/lib/types';

interface SchoolHeaderProps {
  school: School;
}

const navigationItems = [
  { label: 'Home', href: '/', key: 'home' },
  { label: 'About Us', href: '/about', key: 'about' },
  { label: 'Academics', href: '/academics', key: 'academics' },
  { label: 'Admissions', href: '/admissions', key: 'admissions' },
  { label: 'Faculty & Staff', href: '/faculty', key: 'faculty' },
  { label: 'Contact', href: '/contact', key: 'contact' },
];

export default function SchoolHeader({ school }: SchoolHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top contact bar - hidden on mobile */}
      <div className="hidden md:block bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-6">{school.contact_info?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3" />
                  <span>{school.contact_info.phone}</span>
                </div>
              )}              {school.contact_info?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>{school.contact_info.email}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button size="sm" variant="outline" className="h-7">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            {school.logo_url && (
              <img 
                src={school.logo_url} 
                alt={`${school.name} Logo`} 
                className="h-8 w-auto"
              />
            )}
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-primary">{school.name}</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.key}>
                  <NavigationMenuLink
                    href={item.href}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>          
          {/* Mobile Navigation */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navigationItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    className="flex items-center space-x-2 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 mt-4 border-t">
                  <Button className="w-full">Apply Now</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
