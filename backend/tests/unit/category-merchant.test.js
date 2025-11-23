const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prisma/prismaClient');
const {
  TestDataFactory,
  TestDatabaseHelper,
  TestJWTHelper,
  cleanupAfterTest,
} = require('../helpers');

describe('UC1.35-UC1.45: Category & Merchant Management Tests', () => {
  // TODO: Fix slug and field mismatches
  let createdResources = {
    users: new Set(),
    merchants: new Set(),
    categories: new Set(),
    products: new Set(),
  };

  afterAll(async () => {
    await cleanupAfterTest(createdResources);
  });

  describe('UC1.35-UC1.39: Category Management', () => {
    let adminUser, adminToken;

    beforeAll(async () => {
      // Create admin user
      adminUser = await TestDataFactory.createUser({
        email: 'categoryadmin@test.com',
        password: 'password123',
        role: 'ADMIN',
      });
      createdResources.users.add(adminUser.id);
      adminToken = TestJWTHelper.generateToken(adminUser);
    });

    test('UC1.35: Lấy danh sách categories', async () => {
      // Create some categories
      const category1 = await TestDatabaseHelper.createCategory({ name: 'Electronics' });
      createdResources.categories.add(category1.id);
      const category2 = await TestDatabaseHelper.createCategory({ name: 'Fashion' });
      createdResources.categories.add(category2.id);

      const response = await request(app).get('/api/categories');
      expect(response.status).toBe(200);
      const categories = response.body;
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThanOrEqual(2);
      const cat = categories[0];
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name');
    });

    test('UC1.36: Tạo category mới (Admin)', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Books' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Books');
      createdResources.categories.add(response.body.id);
    });

    test('UC1.37: Cập nhật category', async () => {
      const category = await TestDatabaseHelper.createCategory({ name: 'Old Category Name' });
      createdResources.categories.add(category.id);
      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Category Name' });
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Category Name');
    });

    test('UC1.38: Xóa category (nếu không có sản phẩm)', async () => {
      const category = await TestDatabaseHelper.createCategory({ name: 'Empty Category' });
      createdResources.categories.add(category.id);
      const response = await request(app)
        .delete(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(204);
      const verifyResponse = await request(app).get(`/api/categories/${category.id}`);
      expect(verifyResponse.status).toBe(404);
    });

    test('UC1.39: Không cho phép xóa category có sản phẩm', async () => {
      // Create category
      const category = await TestDatabaseHelper.createCategory({
        name: 'Category With Products',
      });
      createdResources.categories.add(category.id);

      // Create merchant
      const merchant = await TestDataFactory.createMerchant({
        name: 'Test Merchant',
        status: 'APPROVED',
      });
      createdResources.merchants.add(merchant.id);

      // Add product to category
      const product = await TestDatabaseHelper.createProduct({
        name: 'Test Product',
        price: 100000,
        stock: 10,
        categoryId: category.id,
        merchantId: merchant.id,
      });
      createdResources.products.add(product.id);

      // Try to delete category
      const response = await request(app)
        .delete(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/products|cannot delete|has products/i);
    });
  });

  describe('UC1.40-UC1.45: Merchant Management', () => {
    let adminUser, adminToken, merchantUser, merchantToken, merchant;

    beforeAll(async () => {
      // Create admin user
      adminUser = await TestDataFactory.createUser({
        email: 'merchantadmin@test.com',
        password: 'password123',
        role: 'ADMIN',
      });
      createdResources.users.add(adminUser.id);
      adminToken = TestJWTHelper.generateToken(adminUser);

      // Create merchant user
      merchantUser = await TestDataFactory.createUser({
        email: 'merchantowner@test.com',
        password: 'password123',
        role: 'MERCHANT',
      });
      createdResources.users.add(merchantUser.id);
      merchantToken = TestJWTHelper.generateToken(merchantUser);
    });

    test('UC1.40: Đăng ký merchant mới', async () => {
      // Adapted to existing /api/merchants POST and actual schema fields
      const response = await request(app)
        .post('/api/merchants')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          name: 'My New Store',
          address: '123 Business Street',
          phone: '0123456789',
          email: 'store@example.com',
          description: 'We sell quality products'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('My New Store');
      // Controller defaults status to ACTIVE
      expect(response.body.status).toBe('ACTIVE');

      merchant = response.body;
      createdResources.merchants.add(merchant.id);
    });

    test('UC1.41: Duyệt merchant (Admin)', async () => {
      const pendingMerchant = await TestDataFactory.createMerchant({
        name: 'Pending Approval Store',
        status: 'ACTIVE'
      });
      createdResources.merchants.add(pendingMerchant.id);

      const response = await request(app)
        .post(`/api/merchants/${pendingMerchant.id}/approve`)
        .set('Authorization', `Bearer ${merchantToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'APPROVED');
    });

    test('UC1.42: Từ chối merchant (Admin)', async () => {
      const rejectMerchant = await TestDataFactory.createMerchant({
        name: 'Reject Me Store',
        status: 'ACTIVE'
      });
      createdResources.merchants.add(rejectMerchant.id);

      const response = await request(app)
        .post(`/api/merchants/${rejectMerchant.id}/reject`)
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({ reason: 'Incomplete documents' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'REJECTED');
      expect(response.body).toHaveProperty('rejectionReason');
    });

    test('UC1.43: Cập nhật thông tin cửa hàng', async () => {
      const approvedMerchant = await TestDataFactory.createMerchant({
        name: 'Update Test Store',
        status: 'ACTIVE'
      });
      createdResources.merchants.add(approvedMerchant.id);

      const response = await request(app)
        .put(`/api/merchants/${approvedMerchant.id}`)
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          name: 'Updated Store Name',
          address: '456 New Address',
          description: 'Updated description',
          phone: '0999888777'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Store Name');
      expect(response.body.address).toBe('456 New Address');
      expect(response.body.phone).toBe('0999888777');
    });

    test('UC1.44: Lấy danh sách sản phẩm của merchant (qua GET /api/merchants/:id)', async () => {
      const testMerchant = await TestDataFactory.createMerchant({
        name: 'Products Test Store',
        status: 'ACTIVE'
      });
      createdResources.merchants.add(testMerchant.id);

      const category = await TestDatabaseHelper.createCategory({ name: 'Merchant Products Category' });
      createdResources.categories.add(category.id);

      for (let i = 1; i <= 3; i++) {
        const product = await TestDatabaseHelper.createProduct({
          name: `Merchant Product ${i}`,
          price: 100000 * i,
          quantity: 50,
          categoryId: category.id,
          merchantId: testMerchant.id,
        });
        createdResources.products.add(product.id);
      }

      const response = await request(app)
        .get(`/api/merchants/${testMerchant.id}`)
        .set('Authorization', `Bearer ${merchantToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThanOrEqual(3);
      response.body.products.forEach(p => expect(p.merchantId).toBe(testMerchant.id));
    });

    test('UC1.45: Lấy thống kê bán hàng của merchant', async () => {
      const statsMerchant = await TestDataFactory.createMerchant({
        name: 'Stats Store',
        status: 'ACTIVE'
      });
      createdResources.merchants.add(statsMerchant.id);

      const category = await TestDatabaseHelper.createCategory({ name: 'Stats Category' });
      createdResources.categories.add(category.id);

      // Create products and associated orders (with join rows) to generate statistics
      for (let i = 1; i <= 2; i++) {
        const product = await TestDatabaseHelper.createProduct({
          name: `Stats Product ${i}`,
          price: 50000 * i,
          quantity: 20,
          categoryId: category.id,
          merchantId: statsMerchant.id,
        });
        createdResources.products.add(product.id);

        // Create an order then link product via customer_order_product
        const order = await TestDatabaseHelper.createOrder({
          status: 'COMPLETED',
          total: product.price * i,
          email: `stats${i}@example.com`
        });
        // Link product to order with purchased quantity
        await prisma.customer_order_product.create({
          data: {
            customerOrderId: order.id,
            productId: product.id,
            quantity: i,
          }
        });
      }

      const response = await request(app)
        .get(`/api/merchants/${statsMerchant.id}/statistics`)
        .set('Authorization', `Bearer ${merchantToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('statistics');
      expect(response.body.statistics).toHaveProperty('totalProducts');
      expect(response.body.statistics).toHaveProperty('totalOrders');
      expect(response.body.statistics).toHaveProperty('totalSales');
      expect(response.body.statistics.totalProducts).toBeGreaterThanOrEqual(2);
      expect(response.body.statistics.totalOrders).toBeGreaterThanOrEqual(2);
    });
  });
});
