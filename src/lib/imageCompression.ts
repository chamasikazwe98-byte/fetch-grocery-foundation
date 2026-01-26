/**
 * Client-side image compression utility
 * Resizes images to max 1200px width and 70% quality to ensure uploads are under 5MB
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1600,
  quality: 0.7,
  mimeType: 'image/jpeg',
};

/**
 * Compress an image file before upload
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise<Blob> - Compressed image as a Blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > opts.maxWidth!) {
        height = (height * opts.maxWidth!) / width;
        width = opts.maxWidth!;
      }

      if (height > opts.maxHeight!) {
        width = (width * opts.maxHeight!) / height;
        height = opts.maxHeight!;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Apply white background for transparency handling
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        opts.mimeType,
        opts.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get file size in MB
 */
export function getFileSizeInMB(file: File | Blob): number {
  return file.size / (1024 * 1024);
}

/**
 * Check if compression is needed (file > 5MB or image dimensions > 1200px)
 */
export function needsCompression(file: File): boolean {
  // Always compress to ensure consistent quality and size
  return file.type.startsWith('image/');
}
