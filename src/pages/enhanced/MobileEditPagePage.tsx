import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { BottomAppBar } from '@/components/mobile/BottomAppBar';
import { PageEditor } from '@/components/cms/PageEditor';
import { Save } from 'lucide-react';

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
      <div className="min-h-screen bg-background">
        <MobileTopBar title="Error" />
        <div className="p-4">
          <p>Invalid page parameters</p>
        </div>
        <BottomAppBar userRole="DSVI_ADMIN" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileTopBar 
        title={`Edit ${formatPageType(pageType)}`}
        subtitle="Manage page content"
        showBackButton
        onBack={() => navigate(`/dsvi-admin/schools/${schoolId}/content`)}
        actionButton={{
          label: "Save",
          icon: <Save className="h-4 w-4" />,
          onClick: handleSave
        }}
      />
      
      <div className="p-4 pb-24">
        <PageEditor
          schoolId={schoolId}
          pageSlug={pageType}
          onSave={handleSave}
        />
      </div>

      <BottomAppBar userRole="DSVI_ADMIN" />
    </div>
  );
}
