import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  storeId: string;
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
}

// Função nativa de compressão para evitar dependências externas que quebram o build
async function compressImageNative(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const compressedFile = new File([blob], newName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/webp', 0.7); // Qualidade 0.7 (70%)
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export function ImageUpload({ 
  storeId, 
  value, 
  onChange, 
  onRemove, 
  folder = 'products',
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 5MB)');
      return;
    }

    setUploading(true);

    try {
      let fileToUpload = file;
      let fileExt = file.name.split('.').pop();

      try {
        fileToUpload = await compressImageNative(file);
        fileExt = 'webp';
      } catch (error) {
        console.error('Erro na compressão, enviando original:', error);
      }

      const fileName = `${storeId}/${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  }, [storeId, folder, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <img 
          src={value} 
          alt="Preview" 
          className="w-full h-full object-cover rounded-lg"
        />
        {onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <label
      className={`
        flex flex-col items-center justify-center w-full h-full min-h-[120px]
        border-2 border-dashed rounded-lg cursor-pointer
        transition-colors
        ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
        ${className}
      `}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      
      {uploading ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Enviando...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
          <Upload className="h-8 w-8" />
          <span className="text-sm text-center">
            Clique ou arraste uma imagem
          </span>
          <span className="text-xs">PNG, JPG até 5MB</span>
        </div>
      )}
    </label>
  );
}

interface MultiImageUploadProps {
  storeId: string;
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function MultiImageUpload({ 
  storeId, 
  images, 
  onChange, 
  maxImages = 5 
}: MultiImageUploadProps) {
  const handleAddImage = (url: string) => {
    if (images.length < maxImages) {
      onChange([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {images.map((url, index) => (
          <div key={index} className="aspect-square">
            <ImageUpload
              storeId={storeId}
              value={url}
              onChange={() => {}}
              onRemove={() => handleRemoveImage(index)}
            />
          </div>
        ))}
        
        {images.length < maxImages && (
          <div className="aspect-square">
            <ImageUpload
              storeId={storeId}
              onChange={handleAddImage}
            />
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} imagens
      </p>
    </div>
  );
}