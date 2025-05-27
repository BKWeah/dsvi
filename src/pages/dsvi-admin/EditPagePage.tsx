
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PageEditor } from '@/components/cms/PageEditor';

export default function EditPagePage() {
  const { schoolId, pageType } = useParams<{ schoolId: string; pageType: string }>();
  const navigate = useNavigate();

  const handleSave = () => {
    // Navigate back to school content page after save
    navigate(`/dsvi-admin/schools/${schoolId}/content`);
  };

  const formatPageType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!schoolId || !pageType) {
    return <div>Invalid page parameters</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/dsvi-admin/schools/${schoolId}/content`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Content
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
