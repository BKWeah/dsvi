import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from '@/components/ui/alert-dialog'; 
import { AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Upload, Link, Eye, MoveUp, MoveDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';
import { GallerySectionConfig } from '@/lib/types';

interface GalleryEditorProps {
  config: GallerySectionConfig;
  onUpdate: (config: GallerySectionConfig) => void;
  schoolId: string;
  sectionId: string;
}

interface GalleryImage {
  url: string;
  alt: string;
  title?: string;
  description?: string;
}

export function GalleryEditor({ config, onUpdate, schoolId, sectionId }: GalleryEditorProps) {
  const [editingImage, setEditingImage] = useState<{ index: number; image: GalleryImage } | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const images = config.images || [];

  const handleAddImage = (method: 'upload' | 'url') => {    if (method === 'url') {
      if (!newImageUrl.trim() || !newImageAlt.trim()) {
        toast({
          title: "Error",
          description: "Please provide both image URL and alt text",
          variant: "destructive",
        });
        return;
      }

      const newImage: GalleryImage = {
        url: newImageUrl.trim(),
        alt: newImageAlt.trim(),
        title: '',
        description: ''
      };

      onUpdate({
        ...config,
        images: [...images, newImage]
      });

      setNewImageUrl('');
      setNewImageAlt('');
      setAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Image added to gallery",
      });
    }
  };

  const handleImageUpload = (url: string) => {
    const newImage: GalleryImage = {
      url,
      alt: `Gallery image ${images.length + 1}`,
      title: '',
      description: ''
    };

    onUpdate({
      ...config,
      images: [...images, newImage]
    });

    setAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Image uploaded and added to gallery",
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onUpdate({
      ...config,
      images: updatedImages
    });
    
    toast({
      title: "Success",
      description: "Image removed from gallery",
    });
  };

  const handleEditImage = (index: number, updatedImage: GalleryImage) => {
    const updatedImages = images.map((img, i) => 
      i === index ? updatedImage : img
    );
    
    onUpdate({
      ...config,
      images: updatedImages
    });
    
    setEditingImage(null);
    
    toast({
      title: "Success",
      description: "Image details updated",
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];
    
    onUpdate({
      ...config,
      images: updatedImages
    });
  };

  return (
    <div className="space-y-6">
      {/* Gallery Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gallery Images</h3>
          <p className="text-sm text-muted-foreground">
            Manage your gallery images with drag & drop reordering
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <ImageUpload
                  label="Upload Image"
                  value=""
                  onChange={handleImageUpload}
                  schoolId={schoolId}
                  sectionId={`${sectionId}-gallery`}
                  placeholder="Click to upload or drag & drop"
                />
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageAlt">Alt Text</Label>
                  <Input
                    id="imageAlt"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>
                <Button 
                  onClick={() => handleAddImage('url')} 
                  className="w-full"
                  disabled={!newImageUrl.trim() || !newImageAlt.trim()}
                >
                  Add Image
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No images in gallery yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first image to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video relative group">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingImage({ index, image })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                  >
                    <a href={image.url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Image</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this image from the gallery?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveImage(index)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {image.title || image.alt}
                    </p>
                    {image.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveImage(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Position {index + 1}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Image Dialog */}
      {editingImage && (
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Image Details</DialogTitle>
            </DialogHeader>
            <EditImageForm
              image={editingImage.image}
              onSave={(updatedImage) => handleEditImage(editingImage.index, updatedImage)}
              onCancel={() => setEditingImage(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Edit Image Form Component
interface EditImageFormProps {
  image: GalleryImage;
  onSave: (image: GalleryImage) => void;
  onCancel: () => void;
}

function EditImageForm({ image, onSave, onCancel }: EditImageFormProps) {
  const [formData, setFormData] = useState<GalleryImage>({ ...image });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-alt">Alt Text *</Label>
        <Input
          id="edit-alt"
          value={formData.alt}
          onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
          placeholder="Describe the image for accessibility"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Optional title for the image"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Input
          id="edit-description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
