const express = require("express");
const router = express.Router();
const { authenticate, authenticateFlexible } = require("../middleware/auth");
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

// Protected routes (using flexible auth for frontend compatibility)
router.get("/can-review/:productId", authenticateFlexible, canReviewProduct);
router.post("/", authenticateFlexible, createReview);
router.get("/my-reviews", authenticateFlexible, getUserReviews);
router.put("/:id", authenticateFlexible, updateReview);
router.delete("/:id", authenticateFlexible, deleteReview);

module.exports = router;
