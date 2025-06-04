import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubdomainInfo, getCurrentSchoolSlug, isSubdomainRouting } from '@/lib/subdomain-utils';
import { useSubdomainSchool } from '@/hooks/useSubdomainSchool';

export function SubdomainTestPage() {
  const [info, setInfo] = useState<any>(null);
  const { school, loading, error } = useSubdomainSchool();

  useEffect(() => {
    setInfo(getSubdomainInfo());
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Subdomain Routing Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current URL</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Hostname:</strong> {window.location.hostname}</p>
          <p><strong>Pathname:</strong> {window.location.pathname}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detection Results</CardTitle>
        </CardHeader>
        <CardContent>
          {info && (
            <>
              <p><strong>School Slug:</strong> {info.schoolSlug || 'None'}</p>
              <p><strong>Is Subdomain:</strong> <Badge variant={info.isSubdomain ? 'default' : 'secondary'}>{info.isSubdomain ? 'Yes' : 'No'}</Badge></p>
              <p><strong>Domain:</strong> {info.domain}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>School Data</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {school && <p><strong>School:</strong> {school.name} ({school.slug})</p>}
          {!loading && !error && !school && <p>No school found</p>}
        </CardContent>
      </Card>
    </div>
  );
}
