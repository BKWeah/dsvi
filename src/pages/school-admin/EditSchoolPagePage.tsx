import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PageEditor } from '@/components/cms/PageEditor';
import { useAuth } from '@/contexts/AuthContext';

export default function EditSchoolPagePage() {
  const { pageType } = useParams<{ pageType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get school ID from user metadata
  const schoolId = user?.user_metadata?.school_id;

  const handleSave = () => {
    // Navigate back to school admin home after save
    navigate('/school-admin');
  };

  const formatPageType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!schoolId || !pageType) {
    return <div>Invalid page parameters or missing school assignment</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/school-admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit {formatPageType(pageType)}</h1>
          <p className="text-muted-foreground">Manage the sections and content for this page</p>
        </div>
      </div>

      <PageEditor
        schoolId={schoolId}
        pageSlug={pageType}
        onSave={handleSave}
      />
    </div>
  );
}
