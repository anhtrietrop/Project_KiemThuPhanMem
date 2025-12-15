/**
 * Helper function to get the correct image source URL
 * Supports Cloudinary URLs, API URLs, and local file paths
 * 
 * @param imagePath - The image path or URL
 * @param fallback - Fallback image if imagePath is empty
 * @returns The correct image source URL
 */
export function getImageSrc(imagePath: string | null | undefined, fallback: string = '/product_placeholder.jpg'): string {
  if (!imagePath) {
    return fallback;
  }

  // If it's already a full URL (Cloudinary, API, or any other), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's an /uploads/ path from local backend storage
  if (imagePath.startsWith('/uploads/')) {
    // Prepend API base URL for backend-served images
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    return apiBaseUrl ? `${apiBaseUrl}${imagePath}` : imagePath;
  }

  // If it's a local path starting with /, check if it exists in public folder
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // If it's just a filename without extension or path (e.g., "image1", "product1")
  // Assume it's a Cloudinary image and construct the URL
  const cloudinaryBaseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL;
  if (cloudinaryBaseUrl) {
    // Remove file extension if present
    const fileNameWithoutExt = imagePath.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
    // Construct Cloudinary URL - assuming images are in 'products' folder
    return `${cloudinaryBaseUrl}/image/upload/products/${fileNameWithoutExt}`;
  }

  // Fallback to local path
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
