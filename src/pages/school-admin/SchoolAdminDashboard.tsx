import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSchoolById } from '@/lib/database';
import { School as SchoolType } from '@/lib/types';

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

  if (loading) return <div className="p-6">Loading...</div>;

  if (!school) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No School Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Contact DSVI admin for school assignment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pages = ['homepage', 'about-us', 'academics', 'admissions', 'faculty', 'contact'];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{school.name} - Dashboard</CardTitle>
          <p className="text-muted-foreground">Manage your school's website content</p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Website Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pages.map((page) => (
              <div key={page} className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/school-admin/pages/${page}/edit`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit {page.replace('-', ' ')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/s/${school.slug}/${page}`} target="_blank">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
