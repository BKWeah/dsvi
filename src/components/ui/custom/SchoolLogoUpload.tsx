import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Eye, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadSchoolLogo } from '@/lib/database';

interface SchoolLogoUploadProps {
  value: string;
  onChange: (url: string) => void;
  schoolId: string;
}

export function SchoolLogoUpload({ value, onChange, schoolId }: SchoolLogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const simulateProgress = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const fileSize = file.size;
      const duration = Math.min(Math.max(fileSize / 500000, 1000), 5000);
      const steps = 50;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = Math.min((currentStep / steps) * 95, 95);
        setUploadProgress(progress);

        if (currentStep >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  };
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      toast({
        title: "Invalid file",
        description: "Please select an image file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Start progress simulation
      const progressPromise = simulateProgress(file);
      
      // Start actual upload
      const uploadPromise = uploadSchoolLogo(schoolId, file);
      
      // Wait for both to complete
      const [_, logoUrl] = await Promise.all([progressPromise, uploadPromise]);
      
      // Complete progress
      setUploadProgress(100);
      
      onChange(logoUrl);
      toast({
        title: "Success",
        description: "School logo uploaded successfully",
      });
      
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    onChange('');
    toast({ title: "Logo removed", description: "School logo has been removed" });
  };
  return (
    <div className="space-y-4">
      <Label>School Logo</Label>
      
      {/* Logo Preview */}
      {value && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border shadow-sm flex items-center justify-center">
              <img src={value} alt="School Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Current Logo</p>
              <p className="text-xs text-muted-foreground truncate mt-1">{value}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="w-3 h-3 mr-1" />
              {showPreview ? 'Hide' : 'Preview'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
              <X className="w-3 h-3 mr-1" />
              Remove
            </Button>
          </div>
          
          {/* Large Preview */}
          {showPreview && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Logo Preview:</p>
              <div className="w-48 h-48 border rounded-lg bg-white p-4 flex items-center justify-center">
                <img src={value} alt="School Logo Preview" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}
      {/* Upload Section */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <CheckCircle className={`w-4 h-4 ${uploadProgress === 100 ? 'text-green-500' : ''}`} />
              {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading...'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {value ? 'Replace Logo' : 'Upload Logo'}
            </>
          )}
        </Button>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uploading logo...</span>
              <span className="font-medium">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Or enter logo URL:</Label>
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/logo.png"
            disabled={uploading}
          />
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        
        <p className="text-xs text-muted-foreground">
          Recommended: PNG with transparent background, 200x200px minimum. Max 5MB.
        </p>
      </div>
    </div>
  );
}
