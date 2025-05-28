import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ExternalLink, Home, Info, GraduationCap, UserCheck, Users, Phone, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSchoolById } from '@/lib/database';
import { School as SchoolType } from '@/lib/types';
import { MobileCard } from '@/components/mobile/MobileCard';

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schoolId = user?.user_metadata?.school_id;
    if (schoolId) {
      getSchoolById(schoolId).then(data => {
        if (data?.school) setSchool(data.school);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const pages = [
    { type: 'homepage', label: 'Homepage', icon: Home, color: 'bg-blue-500' },
    { type: 'about-us', label: 'About Us', icon: Info, color: 'bg-green-500' },
    { type: 'academics', label: 'Academics', icon: GraduationCap, color: 'bg-purple-500' },
    { type: 'admissions', label: 'Admissions', icon: UserCheck, color: 'bg-orange-500' },
    { type: 'faculty', label: 'Faculty', icon: Users, color: 'bg-indigo-500' },
    { type: 'contact', label: 'Contact', icon: Phone, color: 'bg-red-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No School Assigned</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Contact DSVI admin for school assignment.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      {/* School Header - Mobile Optimized */}
      <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">
            {school.name}
          </CardTitle>
          <p className="text-blue-100 text-sm">
            School Content Management Dashboard
          </p>
        </CardHeader>
      </Card>

      {/* Quick Stats - Mobile Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{pages.length}</div>
            <div className="text-xs text-muted-foreground">Total Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">Live</div>
            <div className="text-xs text-muted-foreground">Website Status</div>
          </CardContent>
        </Card>
      </div>

      {/* Pages Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold">Website Pages</h2>
          <Badge variant="outline" className="text-xs">
            {pages.length} pages
          </Badge>
        </div>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <div key={page.type} className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/school-admin/pages/${page.type}/edit`}>
                    <Icon className="h-4 w-4 mr-2" />
                    Edit {page.label}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/s/${school.slug}/${page.type}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 pb-24">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <MobileCard
                key={page.type}
                title={page.label}
                subtitle={`Edit ${page.label.toLowerCase()} content`}
                className="border-l-4 border-l-primary"
                actions={[
                  {
                    label: "Edit Page",
                    icon: <Edit className="h-3 w-3" />,
                    variant: "default",
                    onClick: () => window.open(`/school-admin/pages/${page.type}/edit`, '_self')
                  },
                  {
                    label: "Preview",
                    icon: <ExternalLink className="h-3 w-3" />,
                    variant: "outline",
                    onClick: () => window.open(`/s/${school.slug}/${page.type}`, '_blank')
                  }
                ]}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${page.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: 2 days ago
                  </div>
                </div>
              </MobileCard>
            );
          })}
          
          {/* Branding Card for Mobile */}
          <MobileCard
            title="Branding & Theme"
            subtitle="Customize your school's appearance and branding"
            className="border-l-4 border-l-purple-500"
            actions={[
              {
                label: "Customize",
                icon: <Palette className="h-3 w-3" />,
                variant: "default",
                onClick: () => window.open(`/school-admin/branding`, '_self')
              }
            ]}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <Palette className="h-4 w-4" />
              </div>
              <div className="text-xs text-muted-foreground">
                Customize colors, fonts, and layout
              </div>
            </div>
          </MobileCard>
        </div>
      </div>

      {/* Quick Actions - Desktop Only */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open(`/s/${school.slug}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Live Website
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open(`/school-admin/pages/homepage/edit`, '_self')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Quick Edit Homepage
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open(`/school-admin/branding`, '_self')}
          >
            <Palette className="h-4 w-4 mr-2" />
            Customize Branding & Theme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
