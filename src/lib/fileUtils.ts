import type { FileMetadata } from '@/types/converter';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function createFileMetadata(file: File, id?: string): FileMetadata {
  return {
    id: id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    file,
    preview: isImageFile(file) ? URL.createObjectURL(file) : undefined,
  };
}

export function downloadFile(file: File, filename: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function revokePreviewUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/tiff'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }
  
  return { valid: true };
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 500 * 1024 * 1024; // 500MB
  const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|avi|mov|mkv)$/i)) {
    return { valid: false, error: 'Unsupported video format' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 500MB limit' };
  }
  
  return { valid: true };
}

