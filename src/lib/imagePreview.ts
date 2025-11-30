import type { ImageConversionOptions } from '@/types/converter';

export async function generateImagePreview(
  file: File,
  options: ImageConversionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate dimensions based on resize options
        if (options.maxWidth || options.maxHeight) {
          const maxWidth = options.maxWidth || Infinity;
          const maxHeight = options.maxHeight || Infinity;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            if (options.maintainAspectRatio) {
              width = width * ratio;
              height = height * ratio;
            } else {
              width = options.maxWidth || width;
              height = options.maxHeight || height;
            }
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Apply filters
        if (options.filters) {
          ctx.filter = buildFilterString(options.filters);
        }
        
        // Apply transformations
        ctx.save();
        
        // Move to center for rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Apply rotation
        if (options.rotate && options.rotate !== 0) {
          ctx.rotate((options.rotate * Math.PI) / 180);
        }
        
        // Apply flip
        let scaleX = 1;
        let scaleY = 1;
        if (options.flip === 'horizontal' || options.flip === 'both') {
          scaleX = -1;
        }
        if (options.flip === 'vertical' || options.flip === 'both') {
          scaleY = -1;
        }
        if (scaleX !== 1 || scaleY !== 1) {
          ctx.scale(scaleX, scaleY);
        }
        
        // Draw image
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
        
        ctx.restore();
        
        // Apply crop if specified
        if (options.crop) {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = options.crop.width;
          cropCanvas.height = options.crop.height;
          const cropCtx = cropCanvas.getContext('2d');
          if (cropCtx) {
            cropCtx.drawImage(
              canvas,
              options.crop.x,
              options.crop.y,
              options.crop.width,
              options.crop.height,
              0,
              0,
              options.crop.width,
              options.crop.height
            );
            resolve(cropCanvas.toDataURL('image/png'));
            return;
          }
        }
        
        resolve(canvas.toDataURL('image/png'));
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

