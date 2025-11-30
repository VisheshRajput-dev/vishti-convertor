import { useState, useCallback, useEffect } from 'react';
import type { FileMetadata, ImageConversionOptions, ConvertedFile, ConversionProgress } from '@/types/converter';
import { convertAndCompressImage } from '@/lib/imageProcessor';
import { generateImagePreview } from '@/lib/imagePreview';
import { downloadFile, revokePreviewUrl } from '@/lib/fileUtils';
import { toast } from 'sonner';

export function useImageConverter() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [progress, setProgress] = useState<Record<string, ConversionProgress>>({});
  const [options, setOptions] = useState<ImageConversionOptions>({
    format: 'png',
    quality: 80,
    maintainAspectRatio: true,
    resizeMode: 'fit',
    flip: 'none',
    filters: {},
    targetFileSize: {
      enabled: false,
      size: 1,
      unit: 'MB',
    },
  });

  const addFiles = useCallback((newFiles: File[]) => {
    const fileMetadata = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setFiles(prev => [...prev, ...fileMetadata]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview && file.preview.startsWith('blob:')) {
        revokePreviewUrl(file.preview);
      }
      // processedPreview is a data URL, no need to revoke
      return prev.filter(f => f.id !== id);
    });
    
    setConvertedFiles(prev => {
      const converted = prev.find(f => f.id === id);
      if (converted?.downloadUrl) {
        revokePreviewUrl(converted.downloadUrl);
      }
      return prev.filter(f => f.id !== id);
    });
    
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  }, []);

  const convertFile = useCallback(async (fileMetadata: FileMetadata) => {
    const { id, file } = fileMetadata;
    
    setProgress(prev => ({
      ...prev,
      [id]: { fileId: id, progress: 0, status: 'processing' },
    }));

    try {
      const convertedFile = await convertAndCompressImage(file, options);
      const downloadUrl = URL.createObjectURL(convertedFile);
      
      const converted: ConvertedFile = {
        id,
        originalFile: fileMetadata,
        convertedFile,
        originalSize: file.size,
        convertedSize: convertedFile.size,
        format: options.format,
        downloadUrl,
      };
      
      setConvertedFiles(prev => {
        const existing = prev.find(f => f.id === id);
        if (existing?.downloadUrl) {
          revokePreviewUrl(existing.downloadUrl);
        }
        return [...prev.filter(f => f.id !== id), converted];
      });
      
      setProgress(prev => ({
        ...prev,
        [id]: { fileId: id, progress: 100, status: 'completed' },
      }));
      
      toast.success(`Converted ${fileMetadata.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
      setProgress(prev => ({
        ...prev,
        [id]: { fileId: id, progress: 0, status: 'error', error: errorMessage },
      }));
      toast.error(`Failed to convert ${fileMetadata.name}: ${errorMessage}`);
    }
  }, [options]);

  const convertAll = useCallback(async () => {
    for (const file of files) {
      await convertFile(file);
    }
  }, [files, convertFile]);

  const downloadConverted = useCallback((id: string) => {
    const converted = convertedFiles.find(f => f.id === id);
    if (converted) {
      downloadFile(converted.convertedFile, converted.convertedFile.name);
    }
  }, [convertedFiles]);

  // Generate real-time previews when options change
  useEffect(() => {
    const updatePreviews = async () => {
      for (const file of files) {
        try {
          const previewUrl = await generateImagePreview(file.file, options);
          
          setFiles(prev => prev.map(f => {
            if (f.id === file.id) {
              // processedPreview is a data URL, no need to revoke old one
              return { ...f, processedPreview: previewUrl };
            }
            return f;
          }));
        } catch (error) {
          console.warn(`Failed to generate preview for ${file.name}:`, error);
        }
      }
    };

    if (files.length > 0) {
      // Debounce preview updates
      const timeoutId = setTimeout(updatePreviews, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [options, files]);

  const clearAll = useCallback(() => {
    files.forEach(file => {
      if (file.preview && file.preview.startsWith('blob:')) {
        revokePreviewUrl(file.preview);
      }
      // processedPreview is a data URL, no need to revoke
    });
    convertedFiles.forEach(converted => {
      if (converted.downloadUrl) revokePreviewUrl(converted.downloadUrl);
    });
    setFiles([]);
    setConvertedFiles([]);
    setProgress({});
  }, [files, convertedFiles]);

  return {
    files,
    convertedFiles,
    progress,
    options,
    setOptions,
    addFiles,
    removeFile,
    convertFile,
    convertAll,
    downloadConverted,
    clearAll,
  };
}

