import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageSelect: (files: File[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({ onImageSelect, maxImages = 3, className }: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, maxImages - images.length);
    
    if (newFiles.length + images.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Images must be smaller than 5MB",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    const updatedImages = [...images, ...validFiles];
    const updatedPreviews = [...previews, ...newPreviews];

    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImageSelect(updatedImages);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImageSelect(updatedImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={openCamera}
            disabled={images.length >= maxImages}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={images.length >= maxImages}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Gallery
          </Button>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Add photos to help identify the issue
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Up to {maxImages} images, 5MB each
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}