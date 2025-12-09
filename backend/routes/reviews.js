const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews,
  getReviewStats,
  canReviewProduct,
} = require("../controllers/review");

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/product/:productId/stats", getReviewStats);

// Protected routes (require authentication)
router.get("/can-review/:productId", authenticate, canReviewProduct);
router.post("/", authenticate, createReview);
router.get("/my-reviews", authenticate, getUserReviews);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

module.exports = router;
