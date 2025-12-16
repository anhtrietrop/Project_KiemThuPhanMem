const {
  uploadFileToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  isCloudinaryConfigured,
} = require("../utills/cloudinary");
const path = require("path");
const fs = require("fs");

/**
 * Upload main image to Cloudinary or local storage
 * POST /api/main-image
 * Body: multipart/form-data with uploadedFile
 */
async function uploadMainImage(req, res) {
  try {
    console.log("📸 Upload main image request received");
    console.log("Files:", req.files ? Object.keys(req.files) : "No files");

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Không có file được tải lên" });
    }

    // Get file from request
    const uploadedFile = req.files.uploadedFile;
    console.log("File details:", {
      name: uploadedFile.name,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
    });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({
        message:
          "Loại file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, GIF",
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > maxSize) {
      return res.status(400).json({
        message: "File quá lớn. Kích thước tối đa là 5MB",
      });
    }

    // Check if Cloudinary is configured
    if (isCloudinaryConfigured) {
      console.log("☁️ Uploading to Cloudinary...");
      try {
        // Upload to Cloudinary
        const result = await uploadFileToCloudinary(
          uploadedFile,
          "products/main"
        );
        console.log("✅ Cloudinary upload successful:", result.url);

        return res.status(200).json({
          message: "Tải ảnh lên thành công",
          url: result.url,
          publicId: result.publicId,
          fileName: uploadedFile.name,
          storage: "cloudinary",
        });
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        // Fall back to local storage
        console.log("⚠️ Falling back to local storage...");
      }
    } else {
      console.log("⚠️ Cloudinary not configured, using local storage");
    }

    // Fallback: Save to local storage
    const uploadDir = path.join(__dirname, "..", "public", "uploads");

    // Create directory if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}_${uploadedFile.name}`;
    // Sanitize filename to prevent traversal
    const safeName = path.basename(uploadedFile.name);
    const uniqueNameSafe = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadDir, uniqueNameSafe);

    // Move or write file to upload directory depending on upload object
    if (typeof uploadedFile.mv === "function") {
      // express-fileupload provides mv()
      await uploadedFile.mv(filePath);
    } else if (uploadedFile.data) {
      // fallback: write buffer to disk
      await fs.promises.writeFile(filePath, uploadedFile.data);
    } else {
      throw new Error("Uploaded file object is missing transfer methods");
    }

    const localUrl = `/uploads/${uniqueNameSafe}`;
    console.log("✅ Local upload successful:", localUrl);

    return res.status(200).json({
      message: "Tải ảnh lên thành công (local)",
      url: localUrl,
      publicId: null,
      fileName: uploadedFile.name,
      storage: "local",
    });
  } catch (error) {
    console.error("❌ Error uploading main image:", error);
    res.status(500).json({
      message: "Lỗi khi tải ảnh lên",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

    if (result.result === "ok") {
      res.status(200).json({ message: "Xóa ảnh thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy ảnh hoặc đã bị xóa" });
    }
  } catch (error) {
    console.error("Error deleting main image:", error);
    res.status(500).json({
      message: "Lỗi khi xóa ảnh",
      error: error.message,
    });
  }
}

module.exports = {
  uploadMainImage,
  deleteMainImage,
};
