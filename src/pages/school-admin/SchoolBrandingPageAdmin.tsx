import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { BrandingInterface } from '@/components/ui/custom/BrandingInterface';
import { ComprehensiveThemeSettings } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getSchoolById } from '@/lib/database';

export default function SchoolBrandingPageAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Track the current theme state for floating save button
  const [currentTheme, setCurrentTheme] = useState<ComprehensiveThemeSettings>({});
  const [currentCustomCSS, setCurrentCustomCSS] = useState('');
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');

  // Get school ID from user metadata
  const schoolId = user?.user_metadata?.school_id;

  useEffect(() => {
    if (schoolId) {
      fetchSchoolData();
    } else {
      setLoading(false);
    }
  }, [schoolId]);

  // Monitor toast notifications to adjust save button position
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const toastElements = document.querySelectorAll('[data-sonner-toaster] [data-sonner-toast]');
      if (toastElements.length > 0) {
        document.body.classList.add('toast-present');
      } else {
        document.body.classList.remove('toast-present');
      }
    });

    // Start observing
    const toastContainer = document.querySelector('[data-sonner-toaster]');
    if (toastContainer) {
      observer.observe(toastContainer, { childList: true, subtree: true });
    }

    // Cleanup
    return () => {
      observer.disconnect();
      document.body.classList.remove('toast-present');
    };
  }, []);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      const schoolData = await getSchoolById(schoolId!);
      if (schoolData?.school) {
        setSchool(schoolData.school);
        // Initialize current state
        setCurrentTheme(schoolData.school.theme_settings || {});
        setCurrentCustomCSS(schoolData.school.custom_css || '');
        setCurrentLogoUrl(schoolData.school.logo_url || '');
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load school data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async (
    theme: ComprehensiveThemeSettings,
    customCSS: string,
    logoUrl: string
  ) => {
    if (!schoolId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          theme_settings: theme,
          custom_css: customCSS,
          logo_url: logoUrl,
          theme_version: (school?.theme_version || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', schoolId);

      if (error) {
        throw error;
      }

      // Update local state
      setSchool((prev: any) => ({
        ...prev,
        theme_settings: theme,
        custom_css: customCSS,
        logo_url: logoUrl,
        theme_version: (prev?.theme_version || 0) + 1,
      }));

      setHasUnsavedChanges(false);

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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading branding settings...</p>
        </div>
      </div>
    );
  }

  if (!school || !schoolId) {
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
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">School not found or not assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out" id="floating-save-button">
          <style jsx>{`
            @keyframes rainbow-border {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .rainbow-border {
              background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
              background-size: 400%;
              animation: rainbow-border 2s ease infinite;
              padding: 2px;
              border-radius: 50px;
            }
            .save-button-inner {
              background: white;
              border-radius: 48px;
              padding: 12px 24px;
              font-weight: 600;
              color: #1f2937;
              transition: all 0.2s ease;
            }
            .save-button-inner:hover {
              background: #f9fafb;
              transform: translateY(-1px);
            }
            /* Mobile responsive */
            @media (max-width: 768px) {
              #floating-save-button {
                bottom: calc(5rem + env(safe-area-inset-bottom));
                right: 1rem;
                left: 1rem;
                z-index: 60;
              }
              .rainbow-border {
                width: 100%;
                border-radius: 12px;
              }
              .save-button-inner {
                width: 100%;
                border-radius: 10px;
                padding: 16px 24px;
                text-align: center;
                font-size: 16px;
                font-weight: 600;
              }
            }
            /* Push up when toast notifications are present */
            .toast-present #floating-save-button {
              bottom: calc(5rem + 6rem + env(safe-area-inset-bottom)) !important;
            }
          `}</style>
          <div className="rainbow-border">
            <Button
              onClick={() => handleSave(currentTheme, currentCustomCSS, currentLogoUrl)}
              disabled={isSaving}
              className="save-button-inner flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ background: 'white', color: '#1f2937' }}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

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
          <h1 className="text-3xl font-bold">School Branding & Theme</h1>
          <p className="text-muted-foreground">
            Customize your school's public website appearance and branding
          </p>
        </div>
      </div>

      <BrandingInterface
        schoolName={school.name}
        initialTheme={school.theme_settings}
        initialCustomCSS={school.custom_css || ''}
        initialLogoUrl={school.logo_url || ''}
        onSave={handleSave}
        onUnsavedChanges={setHasUnsavedChanges}
        onThemeChange={setCurrentTheme}
        onCustomCSSChange={setCurrentCustomCSS}
        onLogoChange={setCurrentLogoUrl}
      />
      
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Saving theme...</p>
          </div>
        </div>
      )}
    </div>
  );
}
