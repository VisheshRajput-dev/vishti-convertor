import imageCompression from 'browser-image-compression';
import type { ImageFormat, ImageConversionOptions } from '@/types/converter';

export async function convertImageFormat(
  file: File,
  targetFormat: ImageFormat,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        const mimeType = getMimeType(targetFormat);
        const qualityValue = targetFormat === 'png' || targetFormat === 'avif' ? undefined : quality;
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }
            
            const newFileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
            const newFile = new File([blob], newFileName, { type: mimeType });
            resolve(newFile);
          },
          mimeType,
          qualityValue
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(
  file: File,
  options: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    quality?: number;
  } = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    ...options,
  };
  
  try {
    return await imageCompression(file, defaultOptions);
  } catch (error) {
    throw new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function applyImageFilters(
  file: File,
  filters: ImageConversionOptions['filters']
): Promise<File> {
  if (!filters) return file;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Apply filters using canvas filters
        ctx.filter = buildFilterString(filters);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to apply filters'));
              return;
            }
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          },
          file.type,
          0.95
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function buildFilterString(filters: NonNullable<ImageConversionOptions['filters']>): string {
  const parts: string[] = [];
  
  if (filters.brightness !== undefined) {
    parts.push(`brightness(${1 + filters.brightness / 100})`);
  }
  if (filters.contrast !== undefined) {
    parts.push(`contrast(${1 + filters.contrast / 100})`);
  }
  if (filters.saturation !== undefined) {
    parts.push(`saturate(${1 + filters.saturation / 100})`);
  }
  if (filters.blur !== undefined && filters.blur > 0) {
    parts.push(`blur(${filters.blur}px)`);
  }
  if (filters.grayscale) {
    parts.push('grayscale(100%)');
  }
  if (filters.sepia) {
    parts.push('sepia(100%)');
  }
  
  return parts.join(' ') || 'none';
}

export async function rotateImage(file: File, degrees: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate new canvas size for rotation
        const rad = (degrees * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        canvas.width = img.width * cos + img.height * sin;
        canvas.height = img.width * sin + img.height * cos;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to rotate image'));
              return;
            }
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          },
          file.type,
          0.95
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function flipImage(file: File, direction: 'horizontal' | 'vertical' | 'both'): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Apply flip transformation
        if (direction === 'horizontal' || direction === 'both') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        if (direction === 'vertical' || direction === 'both') {
          if (direction === 'both') {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
          } else {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
          }
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to flip image'));
              return;
            }
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          },
          file.type,
          0.95
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function cropImage(
  file: File,
  crop: { x: number; y: number; width: number; height: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(
          img,
          crop.x, crop.y, crop.width, crop.height,
          0, 0, crop.width, crop.height
        );
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to crop image'));
              return;
            }
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          },
          file.type,
          0.95
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function resizeImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    resizeMode?: 'fit' | 'fill' | 'crop';
  }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        const { maxWidth, maxHeight, width: targetWidth, height: targetHeight, maintainAspectRatio = true, resizeMode = 'fit' } = options;
        
        // Calculate target dimensions
        if (targetWidth && targetHeight) {
          width = targetWidth;
          height = targetHeight;
        } else if (maxWidth && width > maxWidth) {
          if (maintainAspectRatio) {
            height = (height * maxWidth) / width;
          }
          width = maxWidth;
        } else if (maxHeight && height > maxHeight) {
          if (maintainAspectRatio) {
            width = (width * maxHeight) / height;
          }
          height = maxHeight;
        }
        
        const canvas = document.createElement('canvas');
        
        if (resizeMode === 'crop' && targetWidth && targetHeight) {
          // Crop to exact dimensions
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (targetWidth - scaledWidth) / 2;
          const y = (targetHeight - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        } else {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to resize image'));
              return;
            }
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          },
          file.type,
          0.9
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function compressToTargetSize(
  file: File,
  targetSizeBytes: number,
  format: ImageFormat
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const img = new Image();
      
      img.onload = async () => {
        const mimeType = getMimeType(format);
        const supportsQuality = format !== 'png' && format !== 'bmp' && format !== 'gif' && format !== 'tiff';
        
        // Helper function to compress with specific quality and dimensions
        const compressWithSettings = async (
          quality: number,
          width?: number,
          height?: number
        ): Promise<File> => {
          return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const finalWidth = width || img.width;
            const finalHeight = height || img.height;
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            
            // Use high-quality image rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
            
            const qualityValue = supportsQuality ? quality : undefined;
            
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                
                const newFileName = file.name.replace(/\.[^/.]+$/, `.${format}`);
                const newFile = new File([blob], newFileName, { type: mimeType });
                resolve(newFile);
              },
              mimeType,
              qualityValue
            );
          });
        };
        
        // First, try with original dimensions and quality adjustment
        let minQuality = 0.01;
        let maxQuality = 1.0;
        let bestFile: File | null = null;
        let bestDiff = Infinity;
        let iterations = 0;
        const maxIterations = 30;
        const tolerance = Math.max(targetSizeBytes * 0.05, 1024); // 5% or 1KB tolerance, whichever is larger
        
        // Binary search for quality
        while (iterations < maxIterations && (maxQuality - minQuality) > 0.005) {
          const testQuality = (minQuality + maxQuality) / 2;
          
          try {
            const testFile = await compressWithSettings(testQuality);
            const sizeDiff = Math.abs(testFile.size - targetSizeBytes);
            
            // If we're within tolerance and under target, this is perfect
            if (testFile.size <= targetSizeBytes && sizeDiff <= tolerance) {
              resolve(testFile);
              return;
            }
            
            // Track the best file (closest to target without exceeding)
            if (testFile.size <= targetSizeBytes) {
              if (sizeDiff < bestDiff) {
                bestFile = testFile;
                bestDiff = sizeDiff;
              }
            }
            
            // Adjust quality based on result
            if (testFile.size > targetSizeBytes) {
              maxQuality = testQuality; // Need lower quality
            } else {
              minQuality = testQuality; // Can try higher quality
            }
          } catch {
            maxQuality = testQuality;
          }
          
          iterations++;
        }
        
        // If we found a good file, return it
        if (bestFile && bestFile.size <= targetSizeBytes) {
          resolve(bestFile);
          return;
        }
        
        // If quality alone isn't enough, try reducing dimensions
        // Calculate target dimensions based on file size ratio
        let scaleFactor = 1.0;
        if (bestFile) {
          // Estimate: file size is roughly proportional to area
          const currentSize = bestFile.size;
          if (currentSize > targetSizeBytes) {
            const targetRatio = targetSizeBytes / currentSize;
            scaleFactor = Math.sqrt(targetRatio) * 0.85; // 0.85 for safety margin
          } else {
            // Already under target, but might need slight reduction for better match
            scaleFactor = 0.95;
          }
        } else {
          // No good file found, estimate from original
          const originalSize = file.size;
          if (originalSize > targetSizeBytes) {
            const targetRatio = targetSizeBytes / originalSize;
            scaleFactor = Math.sqrt(targetRatio) * 0.7; // More aggressive
          } else {
            // Original is already smaller, try slight reduction
            scaleFactor = 0.9;
          }
        }
        
        // Clamp scale factor - be more aggressive for small targets
        const minScale = targetSizeBytes < 100 * 1024 ? 0.05 : 0.1; // 5% for <100KB, 10% otherwise
        scaleFactor = Math.max(minScale, Math.min(1.0, scaleFactor));
        const newWidth = Math.max(50, Math.round(img.width * scaleFactor));
        const newHeight = Math.max(50, Math.round(img.height * scaleFactor));
        
        // Try again with reduced dimensions
        minQuality = 0.01;
        maxQuality = 1.0;
        bestFile = null;
        bestDiff = Infinity;
        iterations = 0;
        
        while (iterations < maxIterations && (maxQuality - minQuality) > 0.005) {
          const testQuality = (minQuality + maxQuality) / 2;
          
          try {
            const testFile = await compressWithSettings(testQuality, newWidth, newHeight);
            const sizeDiff = Math.abs(testFile.size - targetSizeBytes);
            
            // If we're within tolerance and under target, this is perfect
            if (testFile.size <= targetSizeBytes && sizeDiff <= tolerance) {
              resolve(testFile);
              return;
            }
            
            // Track the best file (closest to target without exceeding)
            if (testFile.size <= targetSizeBytes) {
              if (sizeDiff < bestDiff) {
                bestFile = testFile;
                bestDiff = sizeDiff;
              }
            }
            
            // Adjust quality based on result
            if (testFile.size > targetSizeBytes) {
              maxQuality = testQuality; // Need lower quality
            } else {
              minQuality = testQuality; // Can try higher quality
            }
          } catch {
            maxQuality = testQuality;
          }
          
          iterations++;
        }
        
        // Return best file found, or minimum quality with reduced dimensions
        if (bestFile && bestFile.size <= targetSizeBytes) {
          resolve(bestFile);
          return;
        }
        
        // Last resort: try even more aggressive compression
        // If still too large, reduce dimensions further
        let finalWidth = newWidth;
        let finalHeight = newHeight;
        let finalQuality = 0.1;
        
        // Try progressively smaller dimensions if needed
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            const testFile = await compressWithSettings(finalQuality, finalWidth, finalHeight);
            
            if (testFile.size <= targetSizeBytes) {
              resolve(testFile);
              return;
            }
            
            // Still too large, reduce dimensions more
            finalWidth = Math.max(50, Math.round(finalWidth * 0.8));
            finalHeight = Math.max(50, Math.round(finalHeight * 0.8));
            finalQuality = Math.max(0.01, finalQuality * 0.9);
          } catch {
            break;
          }
        }
        
        // Final attempt with minimum settings
        try {
          const finalFile = await compressWithSettings(0.01, finalWidth, finalHeight);
          resolve(finalFile);
        } catch {
          reject(new Error('Failed to compress to target size'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function convertAndCompressImage(
  file: File,
  options: ImageConversionOptions
): Promise<File> {
  let processedFile = file;
  
  // Apply filters first
  if (options.filters) {
    processedFile = await applyImageFilters(processedFile, options.filters);
  }
  
  // Apply rotation
  if (options.rotate && options.rotate !== 0) {
    processedFile = await rotateImage(processedFile, options.rotate);
  }
  
  // Apply flip
  if (options.flip && options.flip !== 'none') {
    processedFile = await flipImage(processedFile, options.flip);
  }
  
  // Apply crop
  if (options.crop) {
    processedFile = await cropImage(processedFile, options.crop);
  }
  
  // Resize if needed
  if (options.maxWidth || options.maxHeight || options.resizeMode) {
    processedFile = await resizeImage(processedFile, {
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      maintainAspectRatio: options.maintainAspectRatio,
      resizeMode: options.resizeMode || 'fit',
    });
  }
  
  // Target file size compression (takes priority over quality)
  if (options.targetFileSize?.enabled && options.targetFileSize.size > 0) {
    const targetSizeBytes = options.targetFileSize.unit === 'MB' 
      ? options.targetFileSize.size * 1024 * 1024
      : options.targetFileSize.size * 1024;
    
    processedFile = await compressToTargetSize(processedFile, targetSizeBytes, options.format);
  } else if (options.quality < 1) {
    // Compress if quality is less than 100 (only if target size not set)
    const qualityDecimal = options.quality / 100;
    processedFile = await compressImage(processedFile, {
      maxSizeMB: options.quality < 50 ? 0.5 : 1,
      maxWidthOrHeight: options.maxWidth || options.maxHeight || 1920,
      quality: qualityDecimal,
    });
  }
  
  // Convert format if needed (only if target size compression wasn't used)
  if (!options.targetFileSize?.enabled) {
    const currentFormat = getImageFormat(processedFile);
    if (currentFormat !== options.format) {
      processedFile = await convertImageFormat(processedFile, options.format, options.quality / 100);
    }
  }
  
  return processedFile;
}

function getImageFormat(file: File): ImageFormat {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  
  if (type.includes('jpeg') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg';
  if (type.includes('png') || name.endsWith('.png')) return 'png';
  if (type.includes('webp') || name.endsWith('.webp')) return 'webp';
  if (type.includes('bmp') || name.endsWith('.bmp')) return 'bmp';
  if (type.includes('gif') || name.endsWith('.gif')) return 'gif';
  if (type.includes('tiff') || name.endsWith('.tiff') || name.endsWith('.tif')) return 'tiff';
  if (type.includes('avif') || name.endsWith('.avif')) return 'avif';
  
  return 'png'; // default
}

function getMimeType(format: ImageFormat): string {
  const mimeTypes: Record<ImageFormat, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    bmp: 'image/bmp',
    gif: 'image/gif',
    tiff: 'image/tiff',
    avif: 'image/avif',
  };
  
  return mimeTypes[format] || 'image/png';
}
