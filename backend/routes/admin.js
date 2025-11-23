const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  listUsers,
  blockUser,
  unblockUser,
  softDeleteUser,
  overview,
  revenue,
  topProducts,
  listOrders
} = require('../controllers/admin');

// All admin routes require auth
router.get('/users', authenticate, listUsers);
router.put('/users/:id/block', authenticate, blockUser);
router.put('/users/:id/unblock', authenticate, unblockUser);
router.delete('/users/:id', authenticate, softDeleteUser);
router.get('/dashboard/overview', authenticate, overview);
router.get('/dashboard/revenue', authenticate, revenue);
router.get('/dashboard/top-products', authenticate, topProducts);
router.get('/orders', authenticate, listOrders);

module.exports = router;
