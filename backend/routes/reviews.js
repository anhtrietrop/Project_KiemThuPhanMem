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
} = require("../controllers/review");

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/product/:productId/stats", getReviewStats);

// Protected routes (require authentication)
router.post("/", authenticate, createReview);
router.get("/my-reviews", authenticate, getUserReviews);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

module.exports = router;
