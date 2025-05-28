import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PageEditor } from '@/components/cms/PageEditor';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { BottomAppBar } from '@/components/mobile/BottomAppBar';

export default function ResponsiveEditPagePage() {
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
    return <div>Invalid page parameters</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Bar */}
      <MobileTopBar 
        title={`Edit ${formatPageType(pageType)}`}
        subtitle="Manage page content"
        backUrl={`/dsvi-admin/schools/${schoolId}/content`}
      />

      {/* Desktop Header */}
      <div className="hidden md:flex items-center gap-4 p-6">
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

      <div className="p-4 pb-24 md:pb-4">
        <PageEditor
          schoolId={schoolId}
          pageSlug={pageType}
          onSave={handleSave}
        />
      </div>

      {/* Fixed Save Button at Bottom for Mobile */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-background border-t">
        <Button 
          onClick={handleSave}
          className="w-full h-12 text-base"
        >
          Save Page
        </Button>
      </div>

      <BottomAppBar userRole="DSVI_ADMIN" />
    </div>
  );
}
