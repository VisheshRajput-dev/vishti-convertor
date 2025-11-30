export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'bmp' | 'gif' | 'tiff' | 'avif';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
  processedPreview?: string; // Real-time preview with applied transformations
}

export interface ImageConversionOptions {
  format: ImageFormat;
  quality: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio: boolean;
  // Advanced options
  resizeMode?: 'fit' | 'fill' | 'crop';
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: number; // degrees
  flip?: 'horizontal' | 'vertical' | 'both' | 'none';
  filters?: {
    brightness?: number; // -100 to 100
    contrast?: number; // -100 to 100
    saturation?: number; // -100 to 100
    blur?: number; // 0 to 10
    grayscale?: boolean;
    sepia?: boolean;
  };
  // Target file size compression
  targetFileSize?: {
    enabled: boolean;
    size: number; // size value
    unit: 'KB' | 'MB'; // unit
  };
}

export interface ConversionProgress {
  fileId: string;
  progress: number; // 0-100
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ConvertedFile {
  id: string;
  originalFile: FileMetadata;
  convertedFile: File;
  originalSize: number;
  convertedSize: number;
  format: string;
  downloadUrl: string;
}

