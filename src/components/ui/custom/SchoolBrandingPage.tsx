import React, { useState, useEffect } from 'react';
import { BrandingInterface } from '@/components/ui/custom/BrandingInterface';
import { ComprehensiveThemeSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface SchoolBrandingPageProps {
  schoolId: string;
  schoolName: string;
  initialThemeSettings?: ComprehensiveThemeSettings;
  initialCustomCSS?: string;
  initialLogoUrl?: string;
}

export const SchoolBrandingPage: React.FC<SchoolBrandingPageProps> = ({
  schoolId,
  schoolName,
  initialThemeSettings,
  initialCustomCSS = '',
  initialLogoUrl = '',
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Example save function - integrate with your existing database functions
  const handleSave = async (
    theme: ComprehensiveThemeSettings,
    customCSS: string,
    logoUrl: string
  ) => {
    setIsSaving(true);
    try {
      // Replace this with your actual API call
      const response = await fetch(`/api/schools/${schoolId}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme_settings: theme,
          custom_css: customCSS,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme');
      }

      toast({
        title: 'Theme Saved',
        description: 'Your school\'s branding has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: 'Save Failed',
        description: 'There was an error saving your theme. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <BrandingInterface
        schoolName={schoolName}
        initialTheme={initialThemeSettings}
        initialCustomCSS={initialCustomCSS}
        initialLogoUrl={initialLogoUrl}
        onSave={handleSave}
      />
      
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Saving theme...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage in your existing admin pages
export default SchoolBrandingPage;

// Example integration with Supabase (if you're using it)
/*
import { supabase } from '@/lib/supabase';

const saveThemeToSupabase = async (schoolId: string, themeData: any) => {
  const { data, error } = await supabase
    .from('schools')
    .update({
      theme_settings: themeData.theme,
      custom_css: themeData.customCSS,
      logo_url: themeData.logoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', schoolId)
    .select();

  if (error) {
    throw error;
  }

  return data;
};
*/

// Example integration component for existing pages
export const BrandingTabIntegration: React.FC<{
  school: any; // Your existing school type
  onUpdate: (updates: any) => void;
}> = ({ school, onUpdate }) => {
  return (
    <SchoolBrandingPage
      schoolId={school.id}
      schoolName={school.name}
      initialThemeSettings={school.theme_settings}
      initialCustomCSS={school.custom_css}
      initialLogoUrl={school.logo_url}
    />
  );
};
