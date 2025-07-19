import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PageEditor } from '@/components/cms/PageEditor';

export default function MobileEditPagePage() {
  const { schoolId, pageType } = useParams<{ schoolId: string; pageType: string }>();
  const navigate = useNavigate();

  const handleSave = () => {
    navigate(`/dsvi-admin/schools/${schoolId}/content`);
  };

  const formatPageType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!schoolId || !pageType) {
    return (
      <div className="min-h-screen bg-background p-4">
        <p>Invalid page parameters</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dsvi-admin/schools/${schoolId}/content`)}
              className="p-2 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold">Edit {formatPageType(pageType)}</h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Manage the sections and content for this page
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 pb-24">
        <PageEditor
          schoolId={schoolId}
          pageSlug={pageType}
          onSave={handleSave}
        />
      </div>

      {/* Fixed Save Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden">
        <Button 
          onClick={handleSave}
          className="w-full h-12 text-base"
        >
          Save Page
        </Button>
      </div>
    </div>
  );
}
