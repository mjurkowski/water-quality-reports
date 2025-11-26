import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ImagePlus } from 'lucide-react';

export interface PhotoData {
  base64: string;
  mimeType: string;
}

interface PhotoUploadProps {
  photos: PhotoData[];
  onChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  maxFileSizeMB?: number;
}

export function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 5,
  maxFileSizeMB = 5
}: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    // Check if adding files would exceed max
    if (photos.length + files.length > maxPhotos) {
      setError(`Maksymalnie ${maxPhotos} zdjęć`);
      return;
    }

    // Validate and convert files
    const newPhotos: PhotoData[] = [];
    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError(`Plik ${file.name} nie jest obrazem`);
        continue;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        setError(`Plik ${file.name} jest za duży (max ${maxFileSizeMB}MB)`);
        continue;
      }

      // Convert to base64
      try {
        const base64 = await fileToBase64(file);
        newPhotos.push({
          base64,
          mimeType: file.type,
        });
      } catch (err) {
        setError(`Błąd podczas wczytywania pliku ${file.name}`);
      }
    }

    onChange([...photos, ...newPhotos]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
    setError(null);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-2">
      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={!canAddMore}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canAddMore}
          className="w-full"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          {photos.length === 0 ? 'Dodaj zdjęcia' : `Dodaj więcej (${photos.length}/${maxPhotos})`}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={`data:${photo.mimeType};base64,${photo.base64}`}
                alt={`Zdjęcie ${index + 1}`}
                className="w-full h-32 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Usuń zdjęcie"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Format: JPG, PNG, GIF. Max {maxFileSizeMB}MB na zdjęcie. Do {maxPhotos} zdjęć.
      </p>
    </div>
  );
}
