import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function FileDropzone({
  onFilesAdded,
  accept,
  maxFiles = 10,
  className,
  disabled = false,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles.slice(0, maxFiles));
      }
    },
    [onFilesAdded, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed cursor-pointer transition-colors',
        isDragActive && 'border-primary bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          {isDragActive ? (
            <File className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum {maxFiles} files
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

