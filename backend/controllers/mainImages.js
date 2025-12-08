const { uploadFileToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } = require("../utills/cloudinary");

/**
 * Upload main image to Cloudinary
 * POST /api/main-image
 * Body: multipart/form-data with uploadedFile
 */
async function uploadMainImage(req, res) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Không có file được tải lên" });
    }

    // Get file from request
    const uploadedFile = req.files.uploadedFile;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ 
        message: "Loại file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, GIF" 
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > maxSize) {
      return res.status(400).json({ 
        message: "File quá lớn. Kích thước tối đa là 5MB" 
      });
    }

    // Upload to Cloudinary
    const result = await uploadFileToCloudinary(uploadedFile, 'products/main');

    res.status(200).json({ 
      message: "Tải ảnh lên thành công",
      url: result.url,
      publicId: result.publicId,
      fileName: uploadedFile.name
    });
  } catch (error) {
    console.error("Error uploading main image:", error);
    res.status(500).json({ 
      message: "Lỗi khi tải ảnh lên",
      error: error.message 
    });
  }
}

/**
 * Delete image from Cloudinary
 * DELETE /api/main-image/:publicId
 */
async function deleteMainImage(req, res) {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: "Thiếu publicId" });
    }

    // Decode the publicId (it may be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteFromCloudinary(decodedPublicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ message: "Xóa ảnh thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy ảnh hoặc đã bị xóa" });
    }
  } catch (error) {
    console.error("Error deleting main image:", error);
    res.status(500).json({ 
      message: "Lỗi khi xóa ảnh",
      error: error.message 
    });
  }
}

module.exports = {
  uploadMainImage,
  deleteMainImage
};