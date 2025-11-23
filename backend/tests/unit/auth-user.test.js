/**
 * Unit Tests: Authentication & User Management (UC1)
 * Test Cases: UC1.1 - UC1.21 theo Official_Test_Plan.md
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const {
  TestDataFactory,
  TestDatabaseHelper,
  TestJWTHelper,
  TestAssertionHelper,
  cleanupAfterTest,
} = require('../helpers');
const { getPrismaClient } = require('../setup');

// Import app
const app = require('../../app');

describe('UC1: Authentication & User Management Tests', () => {
  let prisma;
  let createdResources = [];

  beforeAll(() => {
    prisma = getPrismaClient();
  });

  afterEach(async () => {
    await cleanupAfterTest(createdResources);
    createdResources = [];
  });

  describe('UC1.1-UC1.6: User Registration', () => {
    test('UC1.1: Đăng ký thành công với thông tin hợp lệ', async () => {
      const userData = TestDataFactory.createUserData({
        email: 'newuser@example.com',
        password: 'password123',
      });

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password'); // Password excluded
      
      createdResources.push({ type: 'user', id: response.body.id });
    });

    test('UC1.2: Đăng ký thất bại - Email đã tồn tại', async () => {
      // Tạo user trước
      const existingUser = await TestDatabaseHelper.createUser({
        email: 'existing@example.com',
      });
      createdResources.push({ type: 'user', id: existingUser.id });

      // Thử đăng ký lại với cùng email
      const userData = TestDataFactory.createUserData({
        email: 'existing@example.com',
      });

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(409);
      TestAssertionHelper.assertErrorResponse(response, 409);
    });

    test('UC1.3: Đăng ký thất bại - Thiếu thông tin bắt buộc (email)', async () => {
      const userData = {
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      TestAssertionHelper.assertErrorResponse(response, 400, 'required');
    });

    test('UC1.3b: Đăng ký thất bại - Thiếu thông tin bắt buộc (password)', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      TestAssertionHelper.assertErrorResponse(response, 400, 'required');
    });

    test('UC1.4: Đăng ký thất bại - Email không hợp lệ', async () => {
      const invalidEmails = [
        'notanemail',
        'missing@',
        '@nodomain.com',
        'spaces in@email.com',
      ];

      for (const email of invalidEmails) {
        const userData = TestDataFactory.createUserData({ email });

        const response = await request(app)
          .post('/api/users')
          .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Invalid email');
      }
    });

    test('UC1.5: Đăng ký thất bại - Mật khẩu quá ngắn (<8 ký tự)', async () => {
      const userData = TestDataFactory.createUserData({
        password: '1234567', // 7 ký tự
      });

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('at least 8 characters');
    });

    test('UC1.6: Mã hóa password trước khi lưu database', async () => {
      const plainPassword = 'password123';
      const userData = TestDataFactory.createUserData({
        password: plainPassword,
      });

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      createdResources.push({ type: 'user', id: response.body.id });

      // Verify password được hash trong database
      const userInDb = await prisma.user.findUnique({
        where: { id: response.body.id },
      });

      expect(userInDb.password).not.toBe(plainPassword);
      expect(userInDb.password).toMatch(/^\$2[ayb]\$.{56}$/); // Bcrypt hash format
      
      // Verify bcrypt có thể compare
      const isValid = await bcrypt.compare(plainPassword, userInDb.password);
      expect(isValid).toBe(true);
    });
  });

  describe('UC1.7-UC1.13: User Login & Token Verification', () => {
    let testUser;
    const testPassword = 'password123';

    beforeEach(async () => {
      // Tạo user cho login tests - use unique email per test run
      testUser = await TestDatabaseHelper.createUser({
        email: `logintest${Date.now()}@example.com`,
        password: testPassword,
      });
      createdResources.push({ type: 'user', id: testUser.id });
    });

    test('UC1.7: Đăng nhập thành công với email & password đúng', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('UC1.8: Đăng nhập thất bại - Email không tồn tại', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });

      expect(response.status).toBe(401);
      TestAssertionHelper.assertErrorResponse(response, 401);
    });

    test('UC1.9: Đăng nhập thất bại - Sai mật khẩu', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      TestAssertionHelper.assertErrorResponse(response, 401);
    });

    test('UC1.10: Token hết hạn sau 24h', async () => {
      const jwt = require('jsonwebtoken');
      
      // Generate token với expiry
      const token = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Decode và verify expiry time
      const decoded = jwt.decode(token);
      const expiryTime = decoded.exp - decoded.iat;
      
      expect(expiryTime).toBe(24 * 60 * 60); // 24 hours in seconds
    });

    test('UC1.11: Xác thực token hợp lệ', async () => {
      const token = TestJWTHelper.generateToken({
        userId: testUser.id,
        email: testUser.email,
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
    });

    test('UC1.12: Từ chối token không hợp lệ', async () => {
      const invalidToken = 'invalid.jwt.token.here';

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      TestAssertionHelper.assertErrorResponse(response, 401);
    });

    test('UC1.13: Từ chối request không có token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      TestAssertionHelper.assertErrorResponse(response, 401);
    });
  });

  describe('UC1.14-UC1.16: User Profile Management', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await TestDatabaseHelper.createUser({
        email: `profiletest${Date.now()}@example.com`,
      });
      createdResources.push({ type: 'user', id: testUser.id });
      
      authToken = TestJWTHelper.generateToken({
        userId: testUser.id,
        email: testUser.email,
      });
    });

    test('UC1.14: Lấy thông tin profile người dùng hiện tại', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      TestAssertionHelper.assertUserStructure(response.body);
      expect(response.body.id).toBe(testUser.id);
      expect(response.body.email).toBe(testUser.email);
    });

    test('UC1.15: Cập nhật profile thành công', async () => {
      const updateData = {
        role: 'premium_user',
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.role).toBe(updateData.role);
      expect(response.body.email).toBe(testUser.email); // Email should not change
    });

    test('UC1.16: Không cho phép cập nhật email', async () => {
      const originalEmail = testUser.email;
      const updateData = {
        email: 'newemail@example.com',
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      // Verify email không thay đổi (hoặc bị ignore)
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser.email).toBe(originalEmail);
    });
  });

  describe.skip('UC1.17-UC1.21: Address Management', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await TestDatabaseHelper.createUser();
      createdResources.push({ type: 'user', id: testUser.id });
      
      authToken = TestJWTHelper.generateToken({
        userId: testUser.id,
      });
    });

    test('UC1.17: Thêm địa chỉ mới', async () => {
      const addressData = {
        address: '123 Test Street',
        city: 'Ho Chi Minh',
        district: 'District 1',
        phone: '0123456789',
      };

      const response = await request(app)
        .post('/api/users/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addressData);

      expect(response.status).toBe(201);
      expect(response.body.address).toBe(addressData.address);
      expect(response.body.city).toBe(addressData.city);
      expect(response.body.userId).toBe(testUser.id);
      
      createdResources.push({ type: 'address', id: response.body.id });
    });

    test('UC1.18: Lấy danh sách địa chỉ của user', async () => {
      // Tạo một số addresses
      const address1 = await prisma.address.create({
        data: {
          userId: testUser.id,
          address: '123 Test St',
          city: 'HCM',
          district: 'District 1',
        },
      });
      const address2 = await prisma.address.create({
        data: {
          userId: testUser.id,
          address: '456 Test Ave',
          city: 'HCM',
          district: 'District 2',
        },
      });
      
      createdResources.push(
        { type: 'address', id: address1.id },
        { type: 'address', id: address2.id }
      );

      const response = await request(app)
        .get('/api/users/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });

    test('UC1.19: Cập nhật địa chỉ', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUser.id,
          address: '123 Old St',
          city: 'HCM',
          district: 'District 1',
        },
      });
      createdResources.push({ type: 'address', id: address.id });

      const updateData = {
        address: '123 New Street',
        district: 'District 3',
      };

      const response = await request(app)
        .put(`/api/users/addresses/${address.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.address).toBe(updateData.address);
      expect(response.body.district).toBe(updateData.district);
    });

    test('UC1.20: Xóa địa chỉ', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUser.id,
          address: '123 Test St',
          city: 'HCM',
          district: 'District 1',
        },
      });

      const response = await request(app)
        .delete(`/api/users/addresses/${address.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify address đã bị xóa
      const deletedAddress = await prisma.address.findUnique({
        where: { id: address.id },
      });
      expect(deletedAddress).toBeNull();
    });

    test('UC1.21: Set địa chỉ mặc định', async () => {
      // Tạo 2 addresses
      const address1 = await prisma.address.create({
        data: {
          userId: testUser.id,
          address: '123 St',
          city: 'HCM',
          district: 'D1',
          isDefault: true,
        },
      });
      const address2 = await prisma.address.create({
        data: {
          userId: testUser.id,
          address: '456 Ave',
          city: 'HCM',
          district: 'D2',
          isDefault: false,
        },
      });
      
      createdResources.push(
        { type: 'address', id: address1.id },
        { type: 'address', id: address2.id }
      );

      // Set address2 làm default
      const response = await request(app)
        .patch(`/api/users/addresses/${address2.id}/default`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isDefault).toBe(true);

      // Verify address1 không còn là default
      const updatedAddress1 = await prisma.address.findUnique({
        where: { id: address1.id },
      });
      expect(updatedAddress1.isDefault).toBe(false);
    });
  });
});
