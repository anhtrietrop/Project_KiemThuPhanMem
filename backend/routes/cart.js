const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cart');

// GET /api/cart/:userId - Lấy giỏ hàng của user
router.get('/:userId', getCart);

// POST /api/cart/:userId/add - Thêm sản phẩm vào giỏ hàng
router.post('/:userId/add', addToCart);

// PUT /api/cart/:userId/item/:productId - Cập nhật số lượng sản phẩm
router.put('/:userId/item/:productId', updateCartItem);

// DELETE /api/cart/:userId/item/:productId - Xóa sản phẩm khỏi giỏ hàng
router.delete('/:userId/item/:productId', removeFromCart);

// DELETE /api/cart/:userId/clear - Xóa toàn bộ giỏ hàng
router.delete('/:userId/clear', clearCart);

// POST /api/cart/:userId/sync - Đồng bộ giỏ hàng từ local
router.post('/:userId/sync', syncCart);

module.exports = router;
