const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prisma/prismaClient');
const {
  TestDataFactory,
  TestDatabaseHelper,
  TestJWTHelper,
  cleanupAfterTest,
} = require('../helpers');

describe('UC4: Notification & Admin Functions Tests', () => {
  let createdResources = {
    users: new Set(),
    notifications: new Set(),
    products: new Set(),
    merchants: new Set(),
    categories: new Set(),
    orders: new Set(),
  };

  afterAll(async () => {
    await cleanupAfterTest(createdResources);
  });

  describe('UC4.1-UC4.6: Notification System', () => {
    let user, token;

    beforeAll(async () => {
      user = await TestDataFactory.createUser({
        email: 'notificationuser@test.com',
        password: 'password123'
      });
      createdResources.users.add(user.id);
      token = TestJWTHelper.generateToken(user);
    });

    test('UC4.1: Tạo notification cho user', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .send({
          userId: user.id,
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'INFO',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(user.id);
      expect(response.body.title).toBe('Test Notification');
      expect(response.body.isRead).toBe(false);

      createdResources.notifications.add(response.body.id);
    });

    test('UC4.2: Lấy danh sách notifications', async () => {
      // Create some notifications
      await TestDatabaseHelper.createNotification({
        userId: user.id,
        title: 'Notification 1',
        message: 'Message 1',
        type: 'INFO',
      });

      await TestDatabaseHelper.createNotification({
        userId: user.id,
        title: 'Notification 2',
        message: 'Message 2',
        type: 'ORDER_UPDATE',
      });

      // Get notifications
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
      expect(response.body.notifications.length).toBeGreaterThan(0);

      // Verify notifications are sorted by date (newest first)
      if (response.body.notifications.length > 1) {
        const firstDate = new Date(response.body.notifications[0].createdAt);
        const secondDate = new Date(response.body.notifications[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });

    test('UC4.3: Đánh dấu notification đã đọc', async () => {
      // Create notification
      const notification = await TestDatabaseHelper.createNotification({
        userId: user.id,
        title: 'Unread Notification',
        message: 'Mark as read test',
        type: 'INFO',
        isRead: false,
      });
      createdResources.notifications.add(notification.id);

      // Mark as read
      const response = await request(app)
        .put(`/api/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.isRead).toBe(true);
    });

    test('UC4.4: Đánh dấu tất cả đã đọc', async () => {
      // Create multiple unread notifications
      await TestDatabaseHelper.createNotification({
        userId: user.id,
        title: 'Unread 1',
        message: 'Message 1',
        type: 'INFO',
        isRead: false,
      });

      await TestDatabaseHelper.createNotification({
        userId: user.id,
        title: 'Unread 2',
        message: 'Message 2',
        type: 'INFO',
        isRead: false,
      });

      // Mark all as read
      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/marked as read|updated/i);

      // Verify all notifications are read
      const verifyResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      verifyResponse.body.notifications.forEach((notification) => {
        expect(notification.isRead).toBe(true);
      });
    });

    test('UC4.5: Xóa notification', async () => {
      // Create notification
      const notification = await TestDatabaseHelper.createNotification({
        userId: user.id,
        title: 'To Be Deleted',
        message: 'This will be deleted',
        type: 'INFO',
      });

      // Delete notification
      const response = await request(app)
        .delete(`/api/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted|removed/i);

      // Verify notification is deleted
      const verifyResponse = await request(app)
        .get(`/api/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(verifyResponse.status).toBe(404);
    });

    test('UC4.6: Real-time notification qua Socket.IO', async () => {
      // Mock Socket.IO is already configured in setup.js
      const response = await request(app)
        .post('/api/notifications')
        .send({
          userId: user.id,
          title: 'Real-time Notification',
          message: 'This should emit socket event',
          type: 'ORDER_UPDATE',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');

      // In real implementation, verify socket.emit was called
      // For now, just verify notification was created
      createdResources.notifications.add(response.body.id);
    });
  });

  describe('UC4.7-UC4.12: Admin Functions', () => {
    let adminUser, adminToken;

    beforeAll(async () => {
      adminUser = await TestDataFactory.createUser({
        email: 'superadmin@test.com',
        password: 'password123',
        role: 'ADMIN',
      });
      createdResources.users.add(adminUser.id);
      adminToken = TestJWTHelper.generateToken(adminUser);
    });

    test('UC4.7: Lấy danh sách users', async () => {
      // Create some test users
      for (let i = 1; i <= 3; i++) {
        const testUser = await TestDataFactory.createUser({
          email: `testuser${i}@test.com`,
          password: 'password123'
        });
        createdResources.users.add(testUser.id);
      }

      // Get all users
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    test('UC4.8: Khóa/mở khóa user', async () => {
      // Create test user
      const testUser = await TestDataFactory.createUser({
        email: 'toblock@test.com',
        password: 'password123',
        status: 'ACTIVE',
      });
      createdResources.users.add(testUser.id);

      // Block user
      const blockResponse = await request(app)
        .put(`/api/admin/users/${testUser.id}/block`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Violation of terms',
        });

      expect(blockResponse.status).toBe(200);
      expect(blockResponse.body.status).toBe('BLOCKED');

      // Unblock user
      const unblockResponse = await request(app)
        .put(`/api/admin/users/${testUser.id}/unblock`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(unblockResponse.status).toBe(200);
      expect(unblockResponse.body.status).toBe('ACTIVE');
    });

    test('UC4.9: Xóa user', async () => {
      // Create test user
      const testUser = await TestDataFactory.createUser({
        email: 'todelete@test.com',
        password: 'password123',
      });
      createdResources.users.add(testUser.id);

      // Soft delete user
      const response = await request(app)
        .delete(`/api/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted|removed/i);

      // Verify user is soft deleted
      const user = await TestDatabaseHelper.getUserById(testUser.id);
      expect(user.deletedAt).not.toBeNull();
    });

    test('UC4.10: Thống kê tổng quan', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalProducts');
      expect(response.body).toHaveProperty('totalMerchants');

      // Verify all values are numbers
      expect(typeof response.body.totalUsers).toBe('number');
      expect(typeof response.body.totalOrders).toBe('number');
      expect(typeof response.body.totalRevenue).toBe('number');
      expect(typeof response.body.totalProducts).toBe('number');
      expect(typeof response.body.totalMerchants).toBe('number');
    });

    test('UC4.11: Thống kê doanh thu theo thời gian', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date();

      const response = await request(app)
        .get('/api/admin/dashboard/revenue')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: 'day', // day, week, month
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify chart data structure
      if (response.body.data.length > 0) {
        const dataPoint = response.body.data[0];
        expect(dataPoint).toHaveProperty('date');
        expect(dataPoint).toHaveProperty('revenue');
        expect(typeof dataPoint.revenue).toBe('number');
      }

      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.total).toBe('number');
    });

    test('UC4.12: Top sản phẩm bán chạy', async () => {
      // Create test data
      const merchant = await TestDataFactory.createMerchant({
        name: 'Top Products Store',
        status: 'APPROVED',
      });
      createdResources.merchants.add(merchant.id);

      const category = await TestDatabaseHelper.createCategory({
        name: 'Top Products Category'
      });
      createdResources.categories.add(category.id);

      // Create products
      for (let i = 1; i <= 3; i++) {
        const product = await TestDatabaseHelper.createProduct({
          name: `Top Product ${i}`,
          price: 100000 * i,
          quantity: 100,
          categoryId: category.id,
          merchantId: merchant.id
        });
        createdResources.products.add(product.id);
      }

      // Get top products
      const response = await request(app)
        .get('/api/admin/dashboard/top-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          limit: 10,
          period: '30days', // 7days, 30days, 90days, all
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);

      // Verify product data structure
      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('totalSold');
        expect(product).toHaveProperty('revenue');
        expect(typeof product.totalSold).toBe('number');
        expect(typeof product.revenue).toBe('number');

        // Verify products are sorted by sales
        if (response.body.products.length > 1) {
          const firstProduct = response.body.products[0];
          const secondProduct = response.body.products[1];
          expect(firstProduct.totalSold).toBeGreaterThanOrEqual(
            secondProduct.totalSold
          );
        }
      }
    });
  });
});
