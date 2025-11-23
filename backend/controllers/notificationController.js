const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { randomUUID } = require('crypto');

const VALID_TYPES = ['ORDER_UPDATE', 'PAYMENT_STATUS', 'PROMOTION', 'SYSTEM_ALERT', 'INFO'];
const VALID_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

function resolveUserId(req, explicit) {
  const id = explicit || req.user?.id || req.user?.userId;
  return id ? String(id) : undefined;
}

const getUserNotifications = async (req, res) => {
  try {
    const userId = resolveUserId(req, req.params.userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { type, isRead, search, page = 1, limit = 10 } = req.query;
    let { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const where = { userId, ...(type && { type }), ...(isRead !== undefined && { isRead: isRead === 'true' }), ...(search && { OR: [ { title: { contains: search } }, { message: { contains: search } } ] }) };
    const skip = (parseInt(page) - 1) * parseInt(limit); const take = parseInt(limit);
    const allowedSortFields = new Set(['createdAt', 'updatedAt', 'priority', 'type', 'isRead', 'title']);
    if (!allowedSortFields.has(String(sortBy))) sortBy = 'createdAt';
    const normalizedOrder = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy = {}; orderBy[sortBy] = normalizedOrder;
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy, skip, take }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);
    res.json({ notifications, total, page: parseInt(page), totalPages: Math.ceil(total / take), unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error); res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const createNotification = async (req, res) => {
  try {
    const { userId: rawUserId, title, message, type, priority = 'NORMAL', metadata } = req.body;
    const userId = rawUserId ? String(rawUserId) : undefined;
    if (!userId || !title || !message || !type) return res.status(400).json({ error: 'Missing required fields: userId, title, message, type' });
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Invalid notification type' });
    if (!VALID_PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid notification priority' });
    const user = await prisma.user.findUnique({ where: { id: userId } }); if (!user) return res.status(404).json({ error: 'User not found' });
    const serializedMetadata = metadata && typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;
    const notification = await prisma.notification.create({ data: { id: randomUUID(), userId, title, message, type, priority, metadata: serializedMetadata, updatedAt: new Date() } });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error); res.status(500).json({ error: 'Failed to create notification' });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification by id:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
};

const markNotificationRead = async (req, res) => {
  try { const { id } = req.params; const notification = await prisma.notification.update({ where: { id }, data: { isRead: true, updatedAt: new Date() } }); res.json(notification); } catch (error) { if (error.code === 'P2025') return res.status(404).json({ error: 'Notification not found' }); console.error('Error marking notification read:', error); res.status(500).json({ error: 'Failed to mark notification read' }); }
};

const updateNotification = async (req, res) => {
  try { const { id } = req.params; const { isRead } = req.body; if (typeof isRead !== 'boolean') return res.status(400).json({ error: 'isRead must be a boolean value' }); const notification = await prisma.notification.update({ where: { id }, data: { isRead, updatedAt: new Date() } }); res.json(notification); } catch (error) { if (error.code === 'P2025') return res.status(404).json({ error: 'Notification not found' }); console.error('Error updating notification:', error); res.status(500).json({ error: 'Failed to update notification' }); }
};

const markAllRead = async (req, res) => {
  try { const userId = resolveUserId(req); if (!userId) return res.status(401).json({ error: 'Unauthorized' }); const result = await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, updatedAt: new Date() } }); res.json({ message: `${result.count} notifications marked as read`, updatedCount: result.count }); } catch (error) { console.error('Error marking all read:', error); res.status(500).json({ error: 'Failed to mark all read' }); }
};

const bulkMarkAsRead = async (req, res) => {
  try { const { notificationIds, userId } = req.body; const effectiveUserId = resolveUserId(req, userId); if (!Array.isArray(notificationIds) || notificationIds.length === 0) return res.status(400).json({ error: 'notificationIds must be a non-empty array' }); if (!effectiveUserId) return res.status(400).json({ error: 'userId is required' }); const updateResult = await prisma.notification.updateMany({ where: { id: { in: notificationIds }, userId: effectiveUserId }, data: { isRead: true, updatedAt: new Date() } }); res.json({ message: `${updateResult.count} notifications marked as read`, updatedCount: updateResult.count }); } catch (error) { console.error('Error bulk marking notifications as read:', error); res.status(500).json({ error: 'Failed to mark notifications as read' }); }
};

const deleteNotification = async (req, res) => {
  try { const { id } = req.params; const { userId } = req.body; const effectiveUserId = resolveUserId(req, userId); const notification = await prisma.notification.findFirst({ where: { id, userId: effectiveUserId } }); if (!notification) return res.status(404).json({ error: 'Notification not found' }); await prisma.notification.delete({ where: { id } }); res.json({ message: 'Notification deleted successfully' }); } catch (error) { console.error('Error deleting notification:', error); res.status(500).json({ error: 'Failed to delete notification' }); }
};

const bulkDeleteNotifications = async (req, res) => {
  try { const { notificationIds, userId } = req.body; const effectiveUserId = resolveUserId(req, userId); if (!Array.isArray(notificationIds) || notificationIds.length === 0) return res.status(400).json({ error: 'notificationIds must be a non-empty array' }); if (!effectiveUserId) return res.status(400).json({ error: 'userId is required' }); const deleteResult = await prisma.notification.deleteMany({ where: { id: { in: notificationIds }, userId: effectiveUserId } }); res.json({ message: `${deleteResult.count} notifications deleted`, deletedCount: deleteResult.count }); } catch (error) { console.error('Error bulk deleting notifications:', error); res.status(500).json({ error: 'Failed to delete notifications' }); }
};

const getUnreadCount = async (req, res) => {
  try { const userId = resolveUserId(req, req.params.userId); if (!userId) return res.status(401).json({ error: 'Unauthorized' }); const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } }); res.json({ unreadCount }); } catch (error) { console.error('Error fetching unread count:', error); res.status(500).json({ error: 'Failed to fetch unread count' }); }
};

module.exports = { getUserNotifications, getNotificationById, createNotification, updateNotification, markNotificationRead, markAllRead, bulkMarkAsRead, deleteNotification, bulkDeleteNotifications, getUnreadCount };
