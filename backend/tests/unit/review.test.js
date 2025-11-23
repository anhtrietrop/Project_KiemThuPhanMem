const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prisma/prismaClient');
const {
  TestDataFactory,
  TestDatabaseHelper,
  TestJWTHelper,
  cleanupAfterTest,
} = require('../helpers');

describe('UC2.13-UC2.20: Review System Tests', () => {
  // Review model implemented - testing review functionality
  let createdResources = {
    users: new Set(),
    products: new Set(),
    reviews: new Set(),
    orders: new Set(),
    merchants: new Set(),
    categories: new Set(),
  };

  let user, token, product, merchant, category;

  beforeAll(async () => {
    // Create test merchant
    merchant = await TestDatabaseHelper.createMerchant({
      name: 'Review Test Shop',
      status: 'ACTIVE',
    });
    createdResources.merchants.add(merchant.id);

    // Create test category
    category = await TestDatabaseHelper.createCategory({
      name: 'Review Test Category',
    });
    createdResources.categories.add(category.id);

    // Create test user
    user = await TestDatabaseHelper.createUser({
      email: 'reviewuser@test.com',
      password: 'password123',
    });
    createdResources.users.add(user.id);
    token = TestJWTHelper.generateToken(user);

    // Create test product
    product = await TestDatabaseHelper.createProduct({
      title: 'Review Test Product',
      price: 300000,
      quantity: 100,
      categoryId: category.id,
      merchantId: merchant.id,
    });
    createdResources.products.add(product.id);
  });

  afterAll(async () => {
    await cleanupAfterTest(createdResources);
  });

  test('UC2.13: Tạo đánh giá sản phẩm', async () => {
    // Create order first (user must purchase to review)
    const order = await prisma.customer_order.create({
      data: {
        id: require('crypto').randomUUID(),
        userId: user.id,
        name: 'Test',
        lastname: 'User',
        phone: '0123456789',
        email: user.email,
        adress: '123 Test St',
        city: 'Test City',
        status: 'delivered', // Must be delivered to review
        total: 300000,
        payment_method: 'COD',
      }
    });
    createdResources.orders.add(order.id);

    // Create order_product relation
    await prisma.customer_order_product.create({
      data: {
        id: require('crypto').randomUUID(),
        customerOrderId: order.id,
        productId: product.id,
        quantity: 1,
      }
    });

    // Create review
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product.id,
        rating: 5,
        comment: 'Sản phẩm rất tốt, đúng như mô tả!',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.productId).toBe(product.id);
    expect(response.body.userId).toBe(user.id);
    expect(response.body.rating).toBe(5);
    expect(response.body.comment).toBe('Sản phẩm rất tốt, đúng như mô tả!');

    createdResources.reviews.add(response.body.id);
  });

  test('UC2.14: Chỉ cho phép đánh giá sau khi mua hàng', async () => {
    // Create new user who hasn't purchased
    const newUser = await TestDataFactory.createUser({
      email: 'nopurchase@test.com',
      password: 'password123',
      fullName: 'No Purchase User',
    });
    createdResources.users.add(newUser.id);
    const newToken = TestJWTHelper.generateToken(newUser);

    // Try to create review without purchasing
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${newToken}`)
      .send({
        productId: product.id,
        rating: 4,
        comment: 'Trying to review without purchase',
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/purchase|order|buy/i);
  });

  test('UC2.15: Lấy danh sách đánh giá của sản phẩm', async () => {
    const response = await request(app)
      .get(`/api/reviews/product/${product.id}`)
      .query({
        page: 1,
        limit: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reviews');
    expect(Array.isArray(response.body.reviews)).toBe(true);
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('averageRating');

    // Verify review data structure
    if (response.body.reviews.length > 0) {
      const review = response.body.reviews[0];
      expect(review).toHaveProperty('id');
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('comment');
      expect(review).toHaveProperty('user');
      expect(review).toHaveProperty('createdAt');
    }
  });

  test('UC2.16: Cập nhật đánh giá', async () => {
    // Create order and review first
    const address = await TestDatabaseHelper.createAddress({
      userId: user.id,
      fullName: 'Review Update User',
      phone: '0987654321',
      address: '456 Update Street',
      city: 'Update City',
      district: 'Update District',
      ward: 'Update Ward',
      isDefault: false,
    });
    createdResources.addresses.add(address.id);

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        ],
        paymentMethod: 'COD',
      });
    createdResources.orders.add(orderResponse.body.id);

    await TestDatabaseHelper.updateOrder(orderResponse.body.id, {
      status: 'DELIVERED',
    });

    const reviewResponse = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product.id,
        rating: 3,
        comment: 'Sản phẩm bình thường',
      });

    const reviewId = reviewResponse.body.id;
    createdResources.reviews.add(reviewId);

    // Update review
    const updateResponse = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        comment: 'Đã cập nhật: Sản phẩm rất tốt sau khi dùng thêm!',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.rating).toBe(5);
    expect(updateResponse.body.comment).toBe('Đã cập nhật: Sản phẩm rất tốt sau khi dùng thêm!');
  });

  test('UC2.17: Xóa đánh giá (Admin hoặc owner)', async () => {
    // Create review
    const address = await TestDatabaseHelper.createAddress({
      userId: user.id,
      fullName: 'Delete Review User',
      phone: '0111222333',
      address: '789 Delete Street',
      city: 'Delete City',
      district: 'Delete District',
      ward: 'Delete Ward',
      isDefault: false,
    });
    createdResources.addresses.add(address.id);

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        ],
        paymentMethod: 'COD',
      });
    createdResources.orders.add(orderResponse.body.id);

    await TestDatabaseHelper.updateOrder(orderResponse.body.id, {
      status: 'DELIVERED',
    });

    const reviewResponse = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product.id,
        rating: 2,
        comment: 'Review to be deleted',
      });

    const reviewId = reviewResponse.body.id;

    // Delete review as owner
    const deleteResponse = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toMatch(/deleted|removed/i);

    // Verify review is deleted
    const verifyResponse = await request(app)
      .get(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(verifyResponse.status).toBe(404);
  });

  test('UC2.18: Tính rating trung bình của sản phẩm', async () => {
    // Create multiple reviews with different ratings
    const users = [];
    const address = await TestDatabaseHelper.createAddress({
      userId: user.id,
      fullName: 'Rating Test User',
      phone: '0444555666',
      address: '321 Rating Street',
      city: 'Rating City',
      district: 'Rating District',
      ward: 'Rating Ward',
      isDefault: false,
    });
    createdResources.addresses.add(address.id);

    for (let i = 1; i <= 3; i++) {
      const testUser = await TestDataFactory.createUser({
        email: `ratinguser${i}@test.com`,
        password: 'password123',
        fullName: `Rating User ${i}`,
      });
      createdResources.users.add(testUser.id);
      const testToken = TestJWTHelper.generateToken(testUser);

      // Create order for each user
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          addressId: address.id,
          items: [
            {
              productId: product.id,
              quantity: 1,
              price: product.price,
            },
          ],
          paymentMethod: 'COD',
        });
      createdResources.orders.add(orderResponse.body.id);

      await TestDatabaseHelper.updateOrder(orderResponse.body.id, {
        status: 'DELIVERED',
      });

      // Create review with rating i+2 (3, 4, 5)
      const reviewResponse = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          productId: product.id,
          rating: i + 2,
          comment: `Review with rating ${i + 2}`,
        });

      createdResources.reviews.add(reviewResponse.body.id);
    }

    // Get product reviews and check average
    const response = await request(app)
      .get(`/api/reviews/product/${product.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('averageRating');
    
    // Average of ratings 3, 4, 5 = 4.0
    const expectedAverage = 4.0;
    expect(response.body.averageRating).toBeCloseTo(expectedAverage, 1);
    expect(response.body.averageRating).toBeGreaterThanOrEqual(1);
    expect(response.body.averageRating).toBeLessThanOrEqual(5);
  });

  test('UC2.19: Upload ảnh kèm đánh giá', async () => {
    // Create order first
    const address = await TestDatabaseHelper.createAddress({
      userId: user.id,
      fullName: 'Image Review User',
      phone: '0777888999',
      address: '654 Image Street',
      city: 'Image City',
      district: 'Image District',
      ward: 'Image Ward',
      isDefault: false,
    });
    createdResources.addresses.add(address.id);

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        ],
        paymentMethod: 'COD',
      });
    createdResources.orders.add(orderResponse.body.id);

    await TestDatabaseHelper.updateOrder(orderResponse.body.id, {
      status: 'DELIVERED',
    });

    // Create review with images
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product.id,
        rating: 5,
        comment: 'Sản phẩm tốt, có hình minh họa',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('images');
    expect(Array.isArray(response.body.images)).toBe(true);
    expect(response.body.images.length).toBe(2);

    createdResources.reviews.add(response.body.id);
  });

  test('UC2.20: Giới hạn tối đa 5 ảnh/review', async () => {
    // Create order first
    const address = await TestDatabaseHelper.createAddress({
      userId: user.id,
      fullName: 'Max Image User',
      phone: '0999000111',
      address: '987 Max Image Street',
      city: 'Max City',
      district: 'Max District',
      ward: 'Max Ward',
      isDefault: false,
    });
    createdResources.addresses.add(address.id);

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        ],
        paymentMethod: 'COD',
      });
    createdResources.orders.add(orderResponse.body.id);

    await TestDatabaseHelper.updateOrder(orderResponse.body.id, {
      status: 'DELIVERED',
    });

    // Try to create review with more than 5 images
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product.id,
        rating: 4,
        comment: 'Trying to upload too many images',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg',
          'https://example.com/image4.jpg',
          'https://example.com/image5.jpg',
          'https://example.com/image6.jpg', // 6th image - should fail
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/5 images|maximum|limit/i);
  });
});
