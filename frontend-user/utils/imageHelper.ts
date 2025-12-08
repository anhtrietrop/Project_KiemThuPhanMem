/**
 * Helper function to get the correct image source URL
 * Supports both Cloudinary URLs and local file paths
 * 
 * @param imagePath - The image path or URL
 * @param fallback - Fallback image if imagePath is empty
 * @returns The correct image source URL
 */
export function getImageSrc(imagePath: string | null | undefined, fallback: string = '/product_placeholder.jpg'): string {
  if (!imagePath) {
    return fallback;
  }

  // If it's already a full URL (Cloudinary or any other), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local path, ensure it starts with /
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Otherwise, prepend / for local paths
  return `/${imagePath}`;
}

/**
 * Check if an image URL is from Cloudinary
 * @param url - The image URL to check
 * @returns boolean
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('cloudinary.com');
}

/**
 * Get optimized Cloudinary URL with transformations
 * @param url - Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options;

  // Build transformation string
  const transforms: string[] = [];
  
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);

  if (transforms.length === 0) {
    return url;
  }

  const transformString = transforms.join(',');

  // Insert transformation after /upload/
  return url.replace('/upload/', `/upload/${transformString}/`);
}
