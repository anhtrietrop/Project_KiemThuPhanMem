/**
 * Test Helpers & Utilities
 * Các hàm tiện ích để sử dụng trong tests
 */

const { getPrismaClient } = require('./setup');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate UUID v4
function uuidv4() {
  return crypto.randomUUID();
}

/**
 * Factory để tạo test data
 */
class TestDataFactory {
  /**
   * Tạo user data mẫu
   */
  static createUserData(overrides = {}) {
    // Remove fullName if present since it doesn't exist in schema
    if (overrides.fullName) {
      delete overrides.fullName;
    }

    return {
      id: uuidv4(),
      email: `test${Date.now()}${Math.random()}@example.com`,
      password: 'password123',
      role: 'user',
      ...overrides,
    };
  }

  /**
   * Tạo product data mẫu
   */
  static createProductData(overrides = {}) {
    // Map 'name' to 'title' for backward compatibility
    if (overrides.name && !overrides.title) {
      overrides.title = overrides.name;
      delete overrides.name;

      // Map 'stock' to 'quantity' for schema compatibility
      if (overrides.stock !== undefined && overrides.quantity === undefined) {
        overrides.quantity = overrides.stock;
        delete overrides.stock;
      }
    }

    const baseData = {
      id: uuidv4(),
      title: `Test Product ${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      description: 'Test product description',
      mainImage: 'https://example.com/image.jpg',
      price: 100000,
      quantity: 50,
      manufacturer: 'Test Manufacturer',
    };

    // Only set default IDs if not provided in overrides
    if (!overrides.categoryId) {
      baseData.categoryId = uuidv4();
    }
    if (!overrides.merchantId) {
      baseData.merchantId = uuidv4();
    }

    return {
      ...baseData,
      ...overrides,
    };
  }

  /**
   * Tạo order data mẫu
   */
  static createOrderData(overrides = {}) {
    return {
      id: uuidv4(),
      name: overrides.name || 'Test',
      lastname: overrides.lastname || 'User',
      phone: overrides.phone || '0123456789',
      email: overrides.email || `test${Date.now()}@example.com`,
      adress: overrides.adress || '123 Test St',
      apartment: overrides.apartment || null,
      status: overrides.status || 'PENDING',
      city: overrides.city || 'Hanoi',
      total: overrides.total || 100000,
      payment_method: overrides.payment_method || 'COD',
      ...overrides,
    };
  }

  /**
   * Tạo category data mẫu
   */
  static createCategoryData(overrides = {}) {
    return {
      id: uuidv4(),
      name: overrides.name || `Category ${Date.now()}`,
      ...overrides,
    };
  }

  /**
   * Tạo merchant data mẫu
   */
  static createMerchantData(overrides = {}) {
    return {
      id: uuidv4(),
      name: overrides.name || `Merchant ${Date.now()}`,
      description: overrides.description || 'Test merchant',
      email: overrides.email || `merchant${Date.now()}@example.com`,
      phone: overrides.phone || '0987654321',
      address: overrides.address || '456 Merchant St',
      status: overrides.status || 'ACTIVE',
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Tạo merchant trong database - alias for backward compatibility
   */
  static async createMerchant(merchantData = {}) {
    return TestDatabaseHelper.createMerchant(merchantData);
  }

  /**
   * Tạo user trong database - alias for backward compatibility
   */
  static async createUser(userData = {}) {
    return TestDatabaseHelper.createUser(userData);
  }
}

/**
 * Database helper functions
 */
class TestDatabaseHelper {
  /**
   * Tạo user trong database
   */
  static async createUser(userData = {}) {
    const prisma = getPrismaClient();
    const data = TestDataFactory.createUserData(userData);

    // Hash password nếu có
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.create({ data });
    return user;
  }

  /**
   * Tạo nhiều users
   */
  static async createUsers(count = 3) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await this.createUser({ name: `Test User ${i + 1}` });
      users.push(user);
    }
    return users;
  }

  /**
   * Tạo product trong database
   */
  static async createProduct(productData = {}) {
    const prisma = getPrismaClient();

    // Auto-create category if not provided
    if (!productData.categoryId) {
      const category = await this.createCategory();
      productData = { ...productData, categoryId: category.id };
    }

    // Ensure merchant exists: if merchantId provided but no merchant record, create one using provided id
    const prismaMerchant = getPrismaClient();
    if (!productData.merchantId) {
      const merchant = await this.createMerchant();
      productData = { ...productData, merchantId: merchant.id };
    } else {
      const existingMerchant = await prismaMerchant.merchant.findUnique({ where: { id: productData.merchantId } });
      if (!existingMerchant) {
        // Create minimal merchant record with supplied id
        await prismaMerchant.merchant.create({
          data: {
            id: productData.merchantId,
            name: productData.merchantName || 'Auto Merchant',
            description: 'Auto-created for product linkage',
            status: 'APPROVED',
            email: null,
            phone: null,
            address: null,
            updatedAt: new Date(),
          }
        });
      }
    }

    const data = TestDataFactory.createProductData(productData);
    console.log('DEBUG: createProduct data:', JSON.stringify(data, null, 2));
    const product = await prisma.product.create({ data });
    return product;
  }

  /**
   * Tạo nhiều products
   */
  static async createProducts(count = 5) {
    const products = [];
    for (let i = 0; i < count; i++) {
      const product = await this.createProduct({
        name: `Test Product ${i + 1}`,
        price: 100000 * (i + 1),
      });
      products.push(product);
    }
    return products;
  }

  /**
   * Tạo category trong database
   */
  static async createCategory(categoryData = {}) {
    const prisma = getPrismaClient();
    const data = TestDataFactory.createCategoryData(categoryData);

    const category = await prisma.category.create({ data });
    return category;
  }

  /**
   * Tạo merchant trong database
   */
  static async createMerchant(merchantData = {}) {
    const prisma = getPrismaClient();
    const data = TestDataFactory.createMerchantData(merchantData);

    const merchant = await prisma.merchant.create({ data });
    return merchant;
  }

  /**
   * Update merchant in database
   */
  static async updateMerchant(merchantId, updateData = {}) {
    const prisma = getPrismaClient();
    const merchant = await prisma.merchant.update({ where: { id: merchantId }, data: updateData });
    return merchant;
  }

  /**
   * Tạo order trong database
   */
  static async createOrder(orderData = {}) {
    const prisma = getPrismaClient();
    const data = TestDataFactory.createOrderData(orderData);

    const order = await prisma.customer_order.create({ data });
    return order;
  }

  /**
   * Update product trong database
   */
  static async updateProduct(productId, updateData) {
    const prisma = getPrismaClient();

    // Map 'name' to 'title' for backward compatibility
    if (updateData.name && !updateData.title) {
      updateData.title = updateData.name;
      delete updateData.name;
    }
    // Map 'stock' to 'quantity' for backward compatibility
    if (updateData.stock !== undefined && updateData.quantity === undefined) {
      updateData.quantity = updateData.stock;
      delete updateData.stock;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
    return product;
  }

  /**
   * Create address in database
   */
  static async createAddress(addressData = {}) {
    const prisma = getPrismaClient();
    const data = {
      id: uuidv4(),
      userId: addressData.userId,
      fullName: addressData.fullName || 'Test User',
      phone: addressData.phone || '0123456789',
      address: addressData.address || '123 Test St',
      city: addressData.city || 'Hanoi',
      district: addressData.district || 'Test District',
      ward: addressData.ward || 'Test Ward',
      isDefault: addressData.isDefault || false,
      ...addressData,
    };

    // Note: Schema doesn't have Address model, return mock for now
    // Tests using this will need to be adjusted
    return data;
  }

  /**
   * Create notification in database
   */
  static async createNotification(notificationData = {}) {
    const prisma = getPrismaClient();
    const data = {
      id: uuidv4(),
      userId: notificationData.userId,
      title: notificationData.title || 'Test Notification',
      message: notificationData.message || 'Test message',
      type: notificationData.type || 'SYSTEM_ALERT',
      isRead: notificationData.isRead || false,
      priority: notificationData.priority || 'NORMAL',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...notificationData,
    };

    const notification = await prisma.notification.create({ data });
    return notification;
  }

  /**
   * Update order
   */
  static async updateOrder(orderId, updateData) {
    if (!orderId) {
      throw new Error('orderId is required for updateOrder');
    }

    const prisma = getPrismaClient();
    const data = { ...updateData };
    if (Object.prototype.hasOwnProperty.call(data, 'paymentStatus')) {
      data.payment_status = data.paymentStatus;
      delete data.paymentStatus;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'paymentMethod')) {
      data.payment_method = data.paymentMethod;
      delete data.paymentMethod;
    }
    const order = await prisma.customer_order.update({
      where: { id: orderId },
      data,
    });
    return order;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    const prisma = getPrismaClient();
    return prisma.user.findUnique({ where: { id: userId } });
  }

  /**
   * Clean up specific user
   */
  static async deleteUser(userId) {
    const prisma = getPrismaClient();
    await prisma.user.delete({ where: { id: userId } });
  }

  /**
   * Clean up specific product
   */
  static async deleteProduct(productId) {
    const prisma = getPrismaClient();
    await prisma.product.delete({ where: { id: productId } });
  }
}

/**
 * JWT Helper
 */
class TestJWTHelper {
  /**
   * Tạo JWT token cho testing
   */
  static generateToken(payload = {}) {
    const jwt = require('jsonwebtoken');
    // If payload is a user object with id property, extract userId from it
    const userId = payload.id || payload.userId || '1';
    const email = payload.email || 'test@example.com';
    const role = payload.role || 'USER';

    const defaultPayload = {
      id: userId,  // Use 'id' to match what controllers expect from req.user
      userId: userId,  // Keep userId for backward compatibility
      email: email,
      role: role,
    };

    return jwt.sign(defaultPayload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  /**
   * Tạo expired token
   */
  static generateExpiredToken(payload = {}) {
    const jwt = require('jsonwebtoken');
    const defaultPayload = {
      userId: 1,
      email: 'test@example.com',
      ...payload,
    };

    return jwt.sign(defaultPayload, process.env.JWT_SECRET, {
      expiresIn: '-1h', // Already expired
    });
  }

  /**
   * Tạo invalid token
   */
  static generateInvalidToken() {
    return 'invalid.jwt.token';
  }
}

/**
 * Mock Service Helpers
 */
class TestMockHelper {
  /**
   * Mock MoMo payment success
   */
  static mockMoMoSuccess() {
    const momoPayment = require('../services/momoPayment');
    momoPayment.createPayment.mockResolvedValue({
      payUrl: 'https://test-payment.momo.vn/mock',
      orderId: 'MOCK_ORDER_123',
      requestId: 'MOCK_REQUEST_123',
      resultCode: 0,
    });
  }

  /**
   * Mock MoMo payment failure
   */
  static mockMoMoFailure() {
    const momoPayment = require('../services/momoPayment');
    momoPayment.createPayment.mockRejectedValue(
      new Error('Payment service unavailable')
    );
  }

  /**
   * Mock email service success
   */
  static mockEmailSuccess() {
    const emailService = require('../services/emailService');
    emailService.sendEmail.mockResolvedValue(true);
  }

  /**
   * Mock email service failure
   */
  static mockEmailFailure() {
    const emailService = require('../services/emailService');
    emailService.sendEmail.mockRejectedValue(
      new Error('Email service unavailable')
    );
  }

  /**
   * Reset all mocks
   */
  static resetAllMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  }
}

/**
 * Assertion Helpers
 */
class TestAssertionHelper {
  /**
   * Verify user object structure
   */
  static assertUserStructure(user) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).not.toHaveProperty('password'); // Password should not be exposed
  }

  /**
   * Verify product object structure
   */
  static assertProductStructure(product) {
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('title'); // Schema uses 'title' not 'name'
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('quantity'); // Schema uses 'quantity' not 'stock'
    expect(product.price).toBeGreaterThanOrEqual(0);
  }

  /**
   * Verify order object structure
   */
  static assertOrderStructure(order) {
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('userId');
    expect(order).toHaveProperty('total');
    expect(order).toHaveProperty('status');
    expect(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED']).toContain(order.status);
  }

  /**
   * Verify error response structure
   */
  static assertErrorResponse(response, expectedStatus, expectedMessage = null) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('error');

    if (expectedMessage) {
      expect(response.body.error).toContain(expectedMessage);
    }
  }
}

/**
 * Wait helper
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Cleanup helper - đảm bảo cleanup resources
 */
async function cleanupAfterTest(resources) {
  const prisma = getPrismaClient();

  // Handle both array and object with Sets
  if (resources && typeof resources === 'object') {
    try {
      // Clean up cart items first (they reference products)
      if (resources.carts && resources.carts.size > 0) {
        for (const id of resources.carts) {
          try {
            await prisma.cartitem.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up wishlists
      if (resources.wishlists && resources.wishlists.size > 0) {
        for (const id of resources.wishlists) {
          try {
            await prisma.wishlist.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up notifications
      if (resources.notifications && resources.notifications.size > 0) {
        for (const id of resources.notifications) {
          try {
            await prisma.notification.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up reviews
      if (resources.reviews && resources.reviews.size > 0) {
        for (const id of resources.reviews) {
          try {
            await prisma.review.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up orders (Delete Order BEFORE Product)
      if (resources.orders && resources.orders.size > 0) {
        for (const id of resources.orders) {
          try {
            // First delete related CustomerOrderProduct items if possible/needed
            // Usually handled by cascade, but good to be aware
            await prisma.customer_order.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up products
      if (resources.products && resources.products.size > 0) {
        for (const id of resources.products) {
          try {
            await prisma.product.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up categories
      if (resources.categories && resources.categories.size > 0) {
        for (const id of resources.categories) {
          try {
            await prisma.category.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up merchants
      if (resources.merchants && resources.merchants.size > 0) {
        for (const id of resources.merchants) {
          try {
            await prisma.merchant.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }

      // Clean up users (last since other things depend on them)
      if (resources.users && resources.users.size > 0) {
        for (const id of resources.users) {
          try {
            await prisma.user.delete({ where: { id } }).catch(() => { });
          } catch (error) {
            // Ignore
          }
        }
      }
    } catch (error) {
      console.warn('Warning: Failed to cleanup resources:', error.message);
    }
  }
}

module.exports = {
  TestDataFactory,
  TestDatabaseHelper,
  TestJWTHelper,
  TestMockHelper,
  TestAssertionHelper,
  wait,
  cleanupAfterTest,
};
