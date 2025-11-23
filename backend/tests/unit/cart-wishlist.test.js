const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prisma/prismaClient');
const {
  TestDataFactory,
  TestDatabaseHelper,
  TestJWTHelper,
  cleanupAfterTest,
} = require('../helpers');

describe('UC2: Cart & Wishlist Management Tests', () => {
  // TODO: Fix API routes mismatch - Cart API needs userId in URL
  let createdResources = {
    users: new Set(),
    products: new Set(),
    carts: new Set(),
    wishlists: new Set(),
    merchants: new Set(),
    categories: new Set(),
  };

  afterAll(async () => {
    await cleanupAfterTest(createdResources);
  });

  describe('UC2.1-UC2.8: Cart Management', () => {
    let user, token, product, merchant, category;

    beforeAll(async () => {
      // Create test merchant
      merchant = await TestDatabaseHelper.createMerchant({
        name: 'Cart Test Shop',
        status: 'ACTIVE',
      });
      createdResources.merchants.add(merchant.id);

      // Create test category
      category = await TestDatabaseHelper.createCategory({
        name: 'Cart Test Category',
      });
      createdResources.categories.add(category.id);

      // Create test user
      user = await TestDatabaseHelper.createUser({
        email: 'cartuser@test.com',
        password: 'password123',
      });
      createdResources.users.add(user.id);
      token = TestJWTHelper.generateToken(user);

      // Create test product with quantity (not stock)
      product = await TestDatabaseHelper.createProduct({
        title: 'Cart Test Product',
        price: 100000,
        quantity: 50,
        categoryId: category.id,
        merchantId: merchant.id
      });
      createdResources.products.add(product.id);
    });

    test('UC2.1: Thêm sản phẩm vào giỏ hàng', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product.id,
          quantity: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.productId).toBe(product.id);
      expect(response.body.quantity).toBe(2);
      expect(response.body.userId).toBe(user.id);

      createdResources.carts.add(response.body.id);
    });

    test('UC2.2: Cập nhật số lượng sản phẩm trong giỏ', async () => {
      // Add product to cart first
      const addResponse = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product.id,
          quantity: 1,
        });

      const cartItemId = addResponse.body.id;
      createdResources.carts.add(cartItemId);

      // Update quantity
      const updateResponse = await request(app)
        .put(`/api/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quantity: 5,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.quantity).toBe(5);
    });

    test('UC2.3: Xóa sản phẩm khỏi giỏ hàng', async () => {
      // Add product to cart first
      const addResponse = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product.id,
          quantity: 1,
        });

      const cartItemId = addResponse.body.id;

      // Delete cart item
      const deleteResponse = await request(app)
        .delete(`/api/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toMatch(/deleted|removed/i);

      // Verify item is deleted
      const verifyResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      const deletedItem = verifyResponse.body.items?.find(
        (item) => item.id === cartItemId
      );
      expect(deletedItem).toBeUndefined();
    });

    test('UC2.4: Xóa toàn bộ giỏ hàng', async () => {
      // Add multiple products to cart
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product.id, quantity: 2 });

      // Clear entire cart
      const clearResponse = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(clearResponse.status).toBe(200);
      expect(clearResponse.body.message).toMatch(/cleared|empty/i);

      // Verify cart is empty
      const verifyResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(verifyResponse.body.items).toHaveLength(0);
    });

    test('UC2.5: Không cho phép thêm quá số lượng tồn kho', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product.id,
          quantity: 1000, // Exceeds stock (50)
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/stock|inventory|available/i);
    });

    test('UC2.6: Lấy danh sách sản phẩm trong giỏ', async () => {
      // Clear cart first
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      // Add products
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product.id, quantity: 3 });

      // Get cart items
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
      
      // Verify product info is included
      const cartItem = response.body.items[0];
      expect(cartItem).toHaveProperty('product');
      expect(cartItem.product.title).toBe(product.title);
    });

    test('UC2.7: Tính tổng tiền giỏ hàng', async () => {
      // Clear cart first
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      // Add products
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product.id, quantity: 3 });

      // Get cart with total
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      
      // Verify calculation: 3 * 100000 = 300000
      const expectedTotal = 3 * product.price;
      expect(response.body.total).toBe(expectedTotal);
    });

    test('UC2.8: Giỏ hàng tự động cập nhật khi giá sản phẩm thay đổi', async () => {
      // Clear cart and add product
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product.id, quantity: 2 });

      // Get initial total
      const initialResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      const initialTotal = initialResponse.body.total;

      // Update product price
      await TestDatabaseHelper.updateProduct(product.id, {
        price: 150000, // Changed from 100000
      });

      // Get cart again - should reflect new price
      const updatedResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      const newTotal = updatedResponse.body.total;
      
      // New total should be 2 * 150000 = 300000
      expect(newTotal).toBe(300000);
      expect(newTotal).toBeGreaterThan(initialTotal);

      // Reset product price
      await TestDatabaseHelper.updateProduct(product.id, {
        price: 100000,
      });
    });
  });

  describe('UC2.9-UC2.12: Wishlist Management', () => {
    let user, token, product, merchant, category;

    beforeAll(async () => {
      // Create test merchant
      merchant = await TestDatabaseHelper.createMerchant({
        name: 'Wishlist Test Shop',
        status: 'ACTIVE',
      });
      createdResources.merchants.add(merchant.id);

      // Create test category
      category = await TestDatabaseHelper.createCategory({
        name: 'Wishlist Test Category',
      });
      createdResources.categories.add(category.id);

      // Create test user
      user = await TestDatabaseHelper.createUser({
        email: 'wishlistuser@test.com',
        password: 'password123',
      });
      createdResources.users.add(user.id);
      token = TestJWTHelper.generateToken(user);

      // Create test product
      product = await TestDatabaseHelper.createProduct({
        title: 'Wishlist Test Product',
        price: 200000,
        quantity: 30,
        categoryId: category.id,
        merchantId: merchant.id
      });
      createdResources.products.add(product.id);
    });

    test('UC2.9: Thêm sản phẩm vào wishlist', async () => {
      const response = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product.id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.productId).toBe(product.id);
      expect(response.body.userId).toBe(user.id);

      createdResources.wishlists.add(response.body.id);
    });

    test('UC2.10: Xóa sản phẩm khỏi wishlist', async () => {
      // Add product to wishlist first
      const addResponse = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product.id,
        });

      const wishlistItemId = addResponse.body.id;

      // Delete from wishlist
      const deleteResponse = await request(app)
        .delete(`/api/wishlist/${wishlistItemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toMatch(/deleted|removed/i);

      // Verify item is deleted
      const verifyResponse = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      const deletedItem = verifyResponse.body.items?.find(
        (item) => item.id === wishlistItemId
      );
      expect(deletedItem).toBeUndefined();
    });

    test('UC2.11: Lấy danh sách wishlist', async () => {
      // Clear wishlist first
      const existingItems = await prisma.wishlist.findMany({
        where: { userId: user.id },
      });
      for (const item of existingItems) {
        await prisma.wishlist.delete({ where: { id: item.id } });
      }

      // Add product to wishlist
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product.id });

      // Get wishlist
      const response = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);

      // Verify product info is included
      const wishlistItem = response.body.items[0];
      expect(wishlistItem).toHaveProperty('product');
      expect(wishlistItem.product.title).toBe(product.title);
    });

    test('UC2.12: Không cho phép thêm trùng sản phẩm', async () => {
      // Add product to wishlist first time
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product.id });

      // Try to add same product again
      const response = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product.id });

      // Should either return 400 error or 200 (already exists)
      expect([200, 400, 409]).toContain(response.status);
      
      if (response.status === 400 || response.status === 409) {
        expect(response.body.error).toMatch(/already|exists|duplicate/i);
      }
    });
  });
});
