// src/lib/image-utils.ts

/**
 * Resizes an image file if it exceeds a maximum size, and converts it to a web-optimized format.
 *
 * @param file The image file to process.
 * @param maxSizeInMB The maximum file size in megabytes before resizing is triggered.
 * @param maxWidth The maximum width of the resized image.
 * @param maxHeight The maximum height of the resized image.
 * @param quality The quality of the output JPEG image (0 to 1).
 * @returns A Promise that resolves to the data URI of the processed image.
 */
export function processImage(
    file: File,
    maxSizeInMB: number = 2,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if the file needs resizing
      if (file.size <= maxSizeInMB * 1024 * 1024 && file.type === 'image/jpeg') {
        // If the file is small enough and already a JPEG, just convert to data URI
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
  
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
  
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
  
          if (!ctx) {
            return reject(new Error('Failed to get canvas context'));
          }
  
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convert the canvas content to a JPEG data URI for compatibility with OG image generators
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  