import { Button } from '@/components/ui/button';
import { FileDropzone } from './FileDropzone';
import { FilePreview } from './FilePreview';
import { ImageConversionSettings } from './ConversionSettings';
import { useImageConverter } from '@/hooks/useImageConverter';
import { validateImageFile } from '@/lib/fileUtils';
import { toast } from 'sonner';
import { Image, Play, Trash2 } from 'lucide-react';

export function ImageConverter() {
  const {
    files,
    convertedFiles,
    progress,
    options,
    setOptions,
    addFiles,
    removeFile,
    convertAll,
    downloadConverted,
    clearAll,
  } = useImageConverter();

  const handleFilesAdded = (newFiles: File[]) => {
    const validFiles: File[] = [];
    
    newFiles.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    });

    if (validFiles.length > 0) {
      addFiles(validFiles);
      toast.success(`Added ${validFiles.length} file(s)`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Image className="h-6 w-6" />
            Image Converter & Editor
          </h2>
          <p className="text-muted-foreground mt-1">
            Convert, compress, resize, rotate, flip, and apply filters to images
          </p>
        </div>
        {files.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={convertAll} disabled={files.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              Convert All
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-1">
          <ImageConversionSettings options={options} onChange={setOptions} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <FileDropzone
            onFilesAdded={handleFilesAdded}
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp', '.gif', '.tiff'],
            }}
            maxFiles={10}
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((file) => {
                const converted = convertedFiles.find(f => f.id === file.id);
                const fileProgress = progress[file.id];
                
                return (
                  <FilePreview
                    key={file.id}
                    file={file}
                    converted={converted}
                    progress={fileProgress}
                    onRemove={() => removeFile(file.id)}
                    onDownload={() => downloadConverted(file.id)}
                    isImage={true}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {files.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images added yet. Drop or select images to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

