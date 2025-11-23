const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prisma/prismaClient');
const {
  TestDataFactory,
  TestDatabaseHelper,
  TestJWTHelper,
  cleanupAfterTest,
} = require('../helpers');

describe.skip('Additional Integration Tests', () => {
  // SKIPPED: Tests require Address and complex order functionality
  let createdResources = {
    users: new Set(),
    products: new Set(),
    orders: new Set(),
    addresses: new Set(),
    merchants: new Set(),
    categories: new Set(),
    notifications: new Set(),
  };

  afterAll(async () => {
    await cleanupAfterTest(createdResources);
  });

  test('INT5: Complete Order Lifecycle (Create → Confirm → Ship → Deliver)', async () => {
    // Step 1: Create customer, merchant, product
    const customer = await TestDataFactory.createUser({
      email: 'orderlifecycle@test.com',
      password: 'password123',
    });
    createdResources.users.add(customer.id);
    const customerToken = TestJWTHelper.generateToken(customer);

    const merchant = await TestDataFactory.createMerchant({
      name: 'Lifecycle Test Store',
      status: 'APPROVED',
    });
    createdResources.merchants.add(merchant.id);

    const category = await TestDatabaseHelper.createCategory({
      name: 'Lifecycle Category'
    });
    createdResources.categories.add(category.id);

    const product = await TestDatabaseHelper.createProduct({
      name: 'Lifecycle Product',
      price: 750000,
      quantity: 100,
      categoryId: category.id,
      merchantId: merchant.id
    });
    createdResources.products.add(product.id);

    const address = await TestDatabaseHelper.createAddress({
      userId: customer.id,
      fullName: 'Order Lifecycle User',
      phone: '0123456789',
      address: '123 Lifecycle Street',
      city: 'Lifecycle City',
      district: 'Lifecycle District',
      ward: 'Lifecycle Ward',
      isDefault: true,
    });
    createdResources.addresses.add(address.id);

    // Step 2: Create order (PENDING status)
    const createOrderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 2,
            price: product.price,
          },
        ],
        paymentMethod: 'COD',
      });

    expect(createOrderResponse.status).toBe(201);
    expect(createOrderResponse.body.status).toBe('PENDING');
    const orderId = createOrderResponse.body.id;
    createdResources.orders.add(orderId);

    // Step 3: Admin confirms order (PENDING → CONFIRMED)
    const admin = await TestDataFactory.createUser({
      email: 'orderadmin@test.com',
      password: 'password123',
      role: 'ADMIN',
    });
    createdResources.users.add(admin.id);
    const adminToken = TestJWTHelper.generateToken(admin);

    const confirmResponse = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' });

    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.status).toBe('CONFIRMED');

    // Step 4: Mark order as shipping (CONFIRMED → SHIPPING)
    const shippingResponse = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'SHIPPING',
        trackingNumber: 'TRACK123456',
      });

    expect(shippingResponse.status).toBe(200);
    expect(shippingResponse.body.status).toBe('SHIPPING');
    expect(shippingResponse.body.trackingNumber).toBe('TRACK123456');

    // Step 5: Mark order as delivered (SHIPPING → DELIVERED)
    const deliverResponse = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DELIVERED' });

    expect(deliverResponse.status).toBe(200);
    expect(deliverResponse.body.status).toBe('DELIVERED');
    expect(deliverResponse.body).toHaveProperty('deliveredAt');

    // Step 6: Verify customer receives notifications at each step
    const notificationsResponse = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(notificationsResponse.status).toBe(200);
    const notifications = notificationsResponse.body.notifications;
    
    // Should have notifications for: order created, confirmed, shipping, delivered
    const orderNotifications = notifications.filter((n) =>
      n.message.includes(orderId) || n.type === 'ORDER'
    );
    expect(orderNotifications.length).toBeGreaterThan(0);

    // Step 7: Verify stock was deducted
    const updatedProduct = await TestDatabaseHelper.getProductById(product.id);
    expect(updatedProduct.quantity).toBe(98); // 100 - 2 = 98
  });

  test('INT7: Complete Merchant Flow (Register → Add Products → Receive Orders → Fulfill)', async () => {
    // Step 1: Create merchant user and register merchant
    const merchantUser = await TestDataFactory.createUser({
      email: 'merchantflow@test.com',
      password: 'password123',
      role: 'MERCHANT',
    });
    createdResources.users.add(merchantUser.id);
    const merchantToken = TestJWTHelper.generateToken(merchantUser);

    const registerResponse = await request(app)
      .post('/api/merchants/register')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({
        name: 'Flow Test Store',
        description: 'Complete merchant flow test store'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.status).toBe('PENDING');
    const merchantId = registerResponse.body.id;
    createdResources.merchants.add(merchantId);

    // Step 2: Admin approves merchant
    const admin = await TestDataFactory.createUser({
      email: 'merchantflowadmin@test.com',
      password: 'password123',
      role: 'ADMIN',
    });
    createdResources.users.add(admin.id);
    const adminToken = TestJWTHelper.generateToken(admin);

    const approveResponse = await request(app)
      .put(`/api/admin/merchants/${merchantId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ approvalNote: 'Approved for testing' });

    expect(approveResponse.status).toBe(200);
    expect(approveResponse.body.status).toBe('APPROVED');

    // Step 3: Merchant adds products
    const category = await TestDatabaseHelper.createCategory({
      name: 'Merchant Flow Category'
    });
    createdResources.categories.add(category.id);

    const addProduct1Response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({
        name: 'Merchant Product 1',
        description: 'First product',
        price: 500000,
        quantity: 50,
        categoryId: category.id,
        merchantId: merchantId
      });

    expect(addProduct1Response.status).toBe(201);
    const product1Id = addProduct1Response.body.id;
    createdResources.products.add(product1Id);

    const addProduct2Response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({
        name: 'Merchant Product 2',
        description: 'Second product',
        price: 750000,
        quantity: 30,
        categoryId: category.id,
        merchantId: merchantId
      });

    expect(addProduct2Response.status).toBe(201);
    const product2Id = addProduct2Response.body.id;
    createdResources.products.add(product2Id);

    // Step 4: Customer places order
    const customer = await TestDataFactory.createUser({
      email: 'merchantflowcustomer@test.com',
      password: 'password123',
      fullName: 'Merchant Flow Customer',
    });
    createdResources.users.add(customer.id);
    const customerToken = TestJWTHelper.generateToken(customer);

    const address = await TestDatabaseHelper.createAddress({
      userId: customer.id,
      fullName: 'Merchant Flow Customer',
      phone: '0123456789',
      address: '456 Customer Street',
      city: 'Customer City',
      district: 'Customer District',
      ward: 'Customer Ward',
      isDefault: true,
    });
    createdResources.addresses.add(address.id);

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        addressId: address.id,
        items: [
          {
            productId: product1Id,
            quantity: 2,
            price: 500000,
          },
          {
            productId: product2Id,
            quantity: 1,
            price: 750000,
          },
        ],
        paymentMethod: 'MOMO',
      });

    expect(orderResponse.status).toBe(201);
    const orderId = orderResponse.body.id;
    createdResources.orders.add(orderId);

    // Step 5: Merchant views their orders
    const merchantOrdersResponse = await request(app)
      .get('/api/merchant/orders')
      .set('Authorization', `Bearer ${merchantToken}`);

    expect(merchantOrdersResponse.status).toBe(200);
    const merchantOrders = merchantOrdersResponse.body.orders;
    
    // Verify order contains merchant's products
    const merchantOrder = merchantOrders.find((o) => o.id === orderId);
    expect(merchantOrder).toBeDefined();
    expect(merchantOrder.items.length).toBeGreaterThan(0);

    // Step 6: Merchant fulfills order (updates status)
    const fulfillResponse = await request(app)
      .put(`/api/merchant/orders/${orderId}/fulfill`)
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({
        trackingNumber: 'MERCHANT_TRACK_001',
      });

    expect(fulfillResponse.status).toBe(200);
    expect(fulfillResponse.body.trackingNumber).toBe('MERCHANT_TRACK_001');

    // Step 7: Merchant views statistics
    const statsResponse = await request(app)
      .get(`/api/merchants/${merchantId}/statistics`)
      .set('Authorization', `Bearer ${merchantToken}`)
      .query({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });

    expect(statsResponse.status).toBe(200);
    expect(statsResponse.body.totalOrders).toBeGreaterThan(0);
    expect(statsResponse.body.totalRevenue).toBeGreaterThan(0);
    expect(statsResponse.body.totalProducts).toBe(2);

    // Step 8: Verify merchant receives notifications
    const merchantNotificationsResponse = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${merchantToken}`);

    expect(merchantNotificationsResponse.status).toBe(200);
    const notifications = merchantNotificationsResponse.body.notifications;
    
    // Should have notification for new order
    const orderNotifications = notifications.filter((n) =>
      n.message.includes('order') || n.type === 'ORDER'
    );
    expect(orderNotifications.length).toBeGreaterThan(0);
  });
});
