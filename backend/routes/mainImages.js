const express = require("express");
const router = express.Router();
const { uploadMainImage, deleteMainImage } = require("../controllers/mainImages");

router.route("/").post(uploadMainImage);
router.route("/:publicId").delete(deleteMainImage);

module.exports = router;
