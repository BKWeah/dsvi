import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadSectionImage } from '@/lib/database';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  schoolId: string;
  sectionId: string;
  placeholder?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  schoolId,
  sectionId,
  placeholder = "Enter image URL or upload a file"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadSectionImage(schoolId, sectionId, file);
      onChange(imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Current Image Preview */}
      {value && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
            {value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate">{value}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onChange('')}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {/* URL Input */}
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={uploading}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        JPG, PNG, GIF, WebP. Max 5MB
      </p>
    </div>
  );
}
