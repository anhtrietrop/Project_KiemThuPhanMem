const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  markNotificationRead,
  markAllRead,
  bulkMarkAsRead,
  deleteNotification,
  bulkDeleteNotifications,
  getUnreadCount
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Authenticated root list using token user id
router.get('/', authenticate, getUserNotifications);

// Public endpoint - userId is passed in URL, only returns count (not sensitive data)
// MUST be before /:userId to avoid conflict
router.get('/:userId/unread-count', getUnreadCount);

// Public endpoint - get notifications for a specific userId (for frontend without auth token)
router.get('/:userId', getUserNotifications);

router.post('/', createNotification);

// These endpoints accept userId in request body for frontend compatibility
// (frontend doesn't always have auth token available)
router.post('/mark-read', bulkMarkAsRead);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllRead);
router.put('/:id', updateNotification);
router.delete('/bulk', bulkDeleteNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;