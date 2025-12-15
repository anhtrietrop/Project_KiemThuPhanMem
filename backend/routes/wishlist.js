const express = require("express");
const router = express.Router();
const { authenticate, authenticateFlexible } = require('../middleware/auth');
const {
  getAllWishlistByUserId,
  getAllWishlist,
  createWishItem,
  deleteWishItem,
  deleteWishItemById,
  getSingleProductFromWishlist
} = require("../controllers/wishlist");

// Auth-based routes - convert userId to String
router.post('/', authenticateFlexible, (req, res, next) => {
  req.body.userId = String(req.user.id || req.user.userId);
  createWishItem(req, res, next);
});

router.get('/', authenticateFlexible, (req, res, next) => {
  req.params.userId = String(req.user.id || req.user.userId);
  getAllWishlistByUserId(req, res, next);
});

router.delete('/:id', authenticateFlexible, deleteWishItemById);

// Param-based routes
router.route("/:userId").get(getAllWishlistByUserId);
router.route("/:userId/:productId").get(getSingleProductFromWishlist).delete(deleteWishItem);

module.exports = router;
