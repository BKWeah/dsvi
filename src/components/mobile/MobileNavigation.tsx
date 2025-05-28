import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  School, 
  Users, 
  Settings, 
  LogOut, 
  FileEdit,
  Info,
  GraduationCap,
  UserCheck,
  Phone,
  X
} from 'lucide-react';

interface MobileNavigationProps {
  userRole: 'DSVI_ADMIN' | 'SCHOOL_ADMIN' | null;
  schoolName?: string;
  onLogout: () => void;
}

export function MobileNavigation({ userRole, schoolName, onLogout }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const DSVIAdminMenuItems = () => (
    <div className="flex flex-col space-y-2 p-4">
      <Link 
        to="/dsvi-admin/schools" 
        onClick={closeMenu}
        className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
          location.pathname.includes('/dsvi-admin/schools') 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent'
        }`}
      >
        <School className="h-5 w-5" />
        <span className="font-medium">Schools</span>
      </Link>
      <Link 
        to="/dsvi-admin/requests" 
        onClick={closeMenu}
        className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
          location.pathname.includes('/dsvi-admin/requests') 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent'
        }`}
      >
        <Users className="h-5 w-5" />
        <span className="font-medium">School Requests</span>
      </Link>
    </div>
  );

  const SchoolAdminMenuItems = () => {
    const pages = [
      { type: 'homepage', label: 'Homepage', icon: Home },
      { type: 'about-us', label: 'About Us', icon: Info },
      { type: 'academics', label: 'Academics', icon: GraduationCap },
      { type: 'admissions', label: 'Admissions', icon: UserCheck },
      { type: 'faculty', label: 'Faculty', icon: Users },
      { type: 'contact', label: 'Contact', icon: Phone }
    ];

    return (
      <div className="flex flex-col space-y-2 p-4">
        {pages.map((page) => {
          const Icon = page.icon;
          const isActive = location.pathname.includes(`/pages/${page.type}`);
          
          return (
            <Link 
              key={page.type}
              to={`/school-admin/pages/${page.type}/edit`} 
              onClick={closeMenu}
              className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">Edit {page.label}</span>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold">
                {userRole === 'DSVI_ADMIN' ? 'DSVI Admin' : 'School CMS'}
              </SheetTitle>
              {schoolName && (
                <SheetDescription className="text-sm text-muted-foreground">
                  {schoolName}
                </SheetDescription>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeMenu}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {userRole === 'DSVI_ADMIN' && <DSVIAdminMenuItems />}
          {userRole === 'SCHOOL_ADMIN' && <SchoolAdminMenuItems />}
        </div>
        
        <div className="border-t p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => {
              onLogout();
              closeMenu();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
