const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadFileToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl, isCloudinaryUrl } = require("../utills/cloudinary");

async function getSingleProductImages(request, response) {
  const { id } = request.params;
  const images = await prisma.image.findMany({
    where: { productID: id },
  });
  if (!images) {
    return response.json({ error: "Images not found" }, { status: 404 });
  }
  return response.json(images);
}

/**
 * Create a new product image
 * Supports both URL string and file upload
 */
async function createImage(request, response) {
  try {
    const { productID, image } = request.body;
    
    let imageUrl = image;
    let publicId = null;

    // If file is uploaded, upload to Cloudinary
    if (request.files && request.files.uploadedFile) {
      const uploadedFile = request.files.uploadedFile;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(uploadedFile.mimetype)) {
        return response.status(400).json({ 
          error: "Loại file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, GIF" 
        });
      }

      // Upload to Cloudinary
      const result = await uploadFileToCloudinary(uploadedFile, 'products/gallery');
      imageUrl = result.url;
      publicId = result.publicId;
    }

    const createImage = await prisma.image.create({
      data: {
        productID,
        image: imageUrl,
      },
    });
    return response.status(201).json({ 
      ...createImage, 
      publicId,
      isCloudinary: isCloudinaryUrl(imageUrl)
    });
  } catch (error) {
    console.error("Error creating image:", error);
    return response.status(500).json({ error: "Error creating image" });
  }
}

async function updateImage(request, response) {
  try {
    const { id } = request.params;
    const { productID, image } = request.body;

    // Checking whether photo exists for the given product id
    const existingImage = await prisma.image.findFirst({
      where: {
        productID: id,
      },
    });

    if (!existingImage) {
      return response
        .status(404)
        .json({ error: "Image not found for the provided productID" });
    }

    let newImageUrl = image;
    let publicId = null;

    // If file is uploaded, upload to Cloudinary
    if (request.files && request.files.uploadedFile) {
      // Delete old image from Cloudinary if it was uploaded there
      if (isCloudinaryUrl(existingImage.image)) {
        const oldPublicId = extractPublicIdFromUrl(existingImage.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId).catch(err => {
            console.error("Error deleting old image:", err);
          });
        }
      }

      const uploadedFile = request.files.uploadedFile;
      const result = await uploadFileToCloudinary(uploadedFile, 'products/gallery');
      newImageUrl = result.url;
      publicId = result.publicId;
    }

    const updatedImage = await prisma.image.update({
      where: {
        imageID: existingImage.imageID,
      },
      data: {
        productID: productID,
        image: newImageUrl,
      },
    });

    return response.json({
      ...updatedImage,
      publicId,
      isCloudinary: isCloudinaryUrl(newImageUrl)
    });
  } catch (error) {
    console.error("Error updating image:", error);
    return response.status(500).json({ error: "Error updating image" });
  }
}

async function deleteImage(request, response) {
  try {
    const { id } = request.params;
    
    // Find all images for the product first
    const images = await prisma.image.findMany({
      where: {
        productID: String(id),
      },
    });

    // Delete images from Cloudinary
    for (const img of images) {
      if (isCloudinaryUrl(img.image)) {
        const publicId = extractPublicIdFromUrl(img.image);
        if (publicId) {
          await deleteFromCloudinary(publicId).catch(err => {
            console.error("Error deleting image from Cloudinary:", err);
          });
        }
      }
    }

    // Delete from database
    await prisma.image.deleteMany({
      where: {
        productID: String(id),
      },
    });
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    return response.status(500).json({ error: "Error deleting image" });
  }
}

/**
 * Upload additional product images to Cloudinary
 * POST /api/images/upload
 */
async function uploadProductImage(request, response) {
  try {
    if (!request.files || !request.files.uploadedFile) {
      return response.status(400).json({ error: "Không có file được tải lên" });
    }

    const uploadedFile = request.files.uploadedFile;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return response.status(400).json({ 
        error: "Loại file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, GIF" 
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (uploadedFile.size > maxSize) {
      return response.status(400).json({ 
        error: "File quá lớn. Kích thước tối đa là 5MB" 
      });
    }

    const result = await uploadFileToCloudinary(uploadedFile, 'products/gallery');

    return response.status(200).json({
      message: "Tải ảnh lên thành công",
      url: result.url,
      publicId: result.publicId,
      fileName: uploadedFile.name
    });
  } catch (error) {
    console.error("Error uploading product image:", error);
    return response.status(500).json({ error: "Lỗi khi tải ảnh lên" });
  }
}

module.exports = {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
  uploadProductImage,
};
