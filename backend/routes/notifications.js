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

router.get('/:userId/unread-count', authenticate, getUnreadCount);
// Get single notification by id
router.get('/:id', authenticate, getNotificationById);
// Optional: list notifications for a specific userId via a distinct path to avoid conflicts
router.get('/user/:userId', authenticate, getUserNotifications);
router.post('/', createNotification);
router.post('/mark-read', authenticate, bulkMarkAsRead);
router.put('/:id/read', authenticate, markNotificationRead);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id', authenticate, updateNotification);
router.delete('/bulk', authenticate, bulkDeleteNotifications);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;