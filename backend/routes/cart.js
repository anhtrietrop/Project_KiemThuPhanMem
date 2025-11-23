const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cart');

// Auth-based routes - extract userId from token and convert to String
router.get('/', authenticate, (req, res, next) => {
  req.params.userId = String(req.user.id || req.user.userId);
  getCart(req, res, next);
});

router.post('/', authenticate, (req, res, next) => {
  req.params.userId = String(req.user.id || req.user.userId);
  addToCart(req, res, next);
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const prisma = require('../utills/db');
    const cartItem = await prisma.cartitem.update({
      where: { id },
      data: { quantity },
      include: { product: true }
    });
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = require('../utills/db');
    await prisma.cartitem.delete({ where: { id } });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear entire cart for authenticated user
router.delete('/', authenticate, async (req, res) => {
  try {
    const prisma = require('../utills/db');
    const userId = String(req.user.id || req.user.userId);
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(200).json({ message: 'Cart is already empty' });
    await prisma.cartitem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Original param-based routes (backward compat)
router.get('/:userId', getCart);
router.post('/:userId/add', addToCart);
router.put('/:userId/item/:productId', updateCartItem);
router.delete('/:userId/item/:productId', removeFromCart);
router.delete('/:userId/clear', clearCart);
router.post('/:userId/sync', syncCart);

module.exports = router;

