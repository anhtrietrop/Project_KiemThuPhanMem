const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️ Cloudinary not configured. Image uploads will fall back to local storage.');
  console.warn('Missing env vars:', {
    CLOUDINARY_CLOUD_NAME: !!cloudName,
    CLOUDINARY_API_KEY: !!apiKey,
    CLOUDINARY_API_SECRET: !!apiSecret
  });
}

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original file name for reference
 * @param {string} folder - Cloudinary folder to upload to (e.g., 'products', 'categories')
 * @returns {Promise<Object>} - Cloudinary upload result
 */
async function uploadToCloudinary(fileBuffer, fileName, folder = 'products') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `singitronic/${folder}`,
        resource_type: 'auto',
        public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`, // Remove extension
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Resize if too large
          { quality: 'auto:good' }, // Auto quality optimization
          { fetch_format: 'auto' }, // Auto format (webp, etc.)
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload a file from express-fileupload to Cloudinary
 * @param {Object} file - Express-fileupload file object
 * @param {string} folder - Cloudinary folder to upload to
 * @returns {Promise<Object>} - Cloudinary upload result
 */
async function uploadFileToCloudinary(file, folder = 'products') {
  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  try {
    const result = await uploadToCloudinary(file.data, file.name, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public_id of the image
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - public_id or null if not a Cloudinary URL
 */
function extractPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.ext
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
function isCloudinaryUrl(url) {
  return url && typeof url === 'string' && url.includes('cloudinary.com');
}

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean}
 */
function checkCloudinaryConfig() {
  return isCloudinaryConfigured;
}

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadFileToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  isCloudinaryUrl,
  checkCloudinaryConfig,
  isCloudinaryConfigured,
};
