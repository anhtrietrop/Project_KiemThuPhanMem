# BEST PRACTICES - Test Setup & Environment Management

> **Tài liệu:** Các best practices để setup test environment, mock services, và quản lý resources

---

## 📚 MỤC LỤC

1. [Environment Management](#1-environment-management)
2. [Database Testing](#2-database-testing)
3. [Service Mocking](#3-service-mocking)
4. [Resource Cleanup](#4-resource-cleanup)
5. [Common Patterns](#5-common-patterns)

---

## 1. ENVIRONMENT MANAGEMENT

### 1.1 Sử dụng `.env.test`

**✅ ĐÚNG:**

```javascript
// tests/setup.js
require("dotenv").config({ path: ".env.test" });

// Verify critical variables
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL không được set");
  process.exit(1);
}
```

**❌ SAI:**

```javascript
// Hardcode environment variables
process.env.DATABASE_URL = "mysql://root:password@localhost:3306/db";
```

### 1.2 Cấu trúc `.env.test`

```env
# Test Environment - KHÔNG commit sensitive data thật

# Database - RIÊNG BIỆT với production
DATABASE_URL="mysql://test_user:test_password@localhost:3306/test_db"

# JWT - Test secret
JWT_SECRET="test-jwt-secret-do-not-use-in-production"

# External Services - Mock
DISABLE_EXTERNAL_CALLS=true
MOCK_SERVICES=true

# MoMo Payment - Test credentials (không hoạt động)
MOMO_ACCESS_KEY="test_key"
MOMO_SECRET_KEY="test_secret"

# Email - Mock
EMAIL_HOST="smtp.test.com"
```

### 1.3 Validation

```javascript
// Verify environment trước khi chạy test
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Verify test database (không phải production)
if (process.env.DATABASE_URL.includes("production")) {
  throw new Error("❌ DANGER: Cannot run tests on production database!");
}
```

---

## 2. DATABASE TESTING

### 2.1 Isolated Test Database

**Nguyên tắc quan trọng:**

- ✅ Luôn dùng database RIÊNG cho testing
- ✅ Database test phải hoàn toàn TÁCH BIỆT với dev/production
- ✅ Auto cleanup sau mỗi test suite

```javascript
// ✅ ĐÚNG
const TEST_DB_URL = "mysql://test_user:test_pass@localhost:3306/test_ecommerce";

// ❌ SAI - Dùng chung database
const DB_URL = "mysql://root:password@localhost:3306/ecommerce"; // NGUY HIỂM!
```

### 2.2 Database Connection Management

```javascript
let prisma;
const activeConnections = new Set();

async function initializeTestDatabase() {
  const { PrismaClient } = require("@prisma/client");

  prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: ["error"], // Chỉ log errors trong test
  });

  // Track connection để cleanup sau
  activeConnections.add(prisma);

  await prisma.$connect();
  console.log("✅ Connected to test database");

  return prisma;
}

async function disconnectTestDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    activeConnections.delete(prisma);
    console.log("🔌 Disconnected from test database");
  }
}
```

### 2.3 Database Cleanup

```javascript
async function cleanTestDatabase() {
  // Xóa theo thứ tự để respect foreign key constraints
  const tablesToClean = [
    "OrderItem", // Child tables first
    "Order",
    "Payment",
    "CartItem",
    "Product",
    "User", // Parent tables last
  ];

  for (const table of tablesToClean) {
    try {
      await prisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany(
        {}
      );
    } catch (error) {
      if (!error.message.includes("does not exist")) {
        console.warn(`⚠️  Could not clean ${table}:`, error.message);
      }
    }
  }

  console.log("🧹 Test database cleaned");
}
```

### 2.4 Test Data Factory

```javascript
// ✅ ĐÚNG: Dùng factory để tạo consistent test data
class TestDataFactory {
  static createUserData(overrides = {}) {
    return {
      email: `test${Date.now()}@example.com`, // Unique email
      password: "password123",
      name: "Test User",
      ...overrides,
    };
  }
}

// Sử dụng
const userData = TestDataFactory.createUserData({
  email: "specific@test.com",
});

// ❌ SAI: Hardcode data, dễ bị conflict
const userData = {
  email: "test@example.com", // Sẽ bị duplicate!
  password: "password123",
};
```

---

## 3. SERVICE MOCKING

### 3.1 Mock External Services

**Nguyên tắc:**

- ✅ Luôn mock các service bên ngoài (payment, email, SMS)
- ✅ Mock giúp tests chạy nhanh và không phụ thuộc internet
- ✅ Mock giúp test các trường hợp lỗi

```javascript
// ✅ ĐÚNG: Mock trong setup.js
jest.mock(
  "../services/momoPayment",
  () => ({
    createPayment: jest.fn().mockResolvedValue({
      payUrl: "https://test-payment.momo.vn/mock",
      orderId: "MOCK_ORDER_123",
    }),
    verifySignature: jest.fn().mockReturnValue(true),
  }),
  { virtual: true }
);

jest.mock(
  "../services/emailService",
  () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  }),
  { virtual: true }
);
```

### 3.2 Mock Helper Functions

```javascript
class TestMockHelper {
  // Mock success scenario
  static mockMoMoSuccess() {
    const momoPayment = require("../services/momoPayment");
    momoPayment.createPayment.mockResolvedValue({
      resultCode: 0,
      message: "Success",
      payUrl: "https://test-payment.momo.vn/mock",
    });
  }

  // Mock failure scenario
  static mockMoMoFailure() {
    const momoPayment = require("../services/momoPayment");
    momoPayment.createPayment.mockRejectedValue(
      new Error("Payment service unavailable")
    );
  }

  // Mock network timeout
  static mockMoMoTimeout() {
    const momoPayment = require("../services/momoPayment");
    momoPayment.createPayment.mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), 5000);
      });
    });
  }
}
```

### 3.3 Verify Mock Calls

```javascript
test("should call MoMo payment service", async () => {
  // Arrange
  TestMockHelper.mockMoMoSuccess();

  // Act
  await createPayment({ orderId: 123, amount: 100000 });

  // Assert: Verify mock được gọi
  const momoPayment = require("../services/momoPayment");
  expect(momoPayment.createPayment).toHaveBeenCalledTimes(1);
  expect(momoPayment.createPayment).toHaveBeenCalledWith({
    orderId: 123,
    amount: 100000,
  });
});
```

### 3.4 Reset Mocks

```javascript
afterEach(() => {
  // ✅ QUAN TRỌNG: Clear mocks sau mỗi test
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Hoặc dùng helper
afterEach(() => {
  TestMockHelper.resetAllMocks();
});
```

---

## 4. RESOURCE CLEANUP

### 4.1 Track Resources

```javascript
// Global tracking
const activeConnections = new Set();
const createdResources = new Set();

// Track connection
function trackConnection(connection) {
  activeConnections.add(connection);
}

// Track created resource
function trackResource(resource) {
  createdResources.add(resource);
}
```

### 4.2 Cleanup After Each Test

```javascript
describe('User Tests', () => {
  let createdUsers = [];

  afterEach(async () => {
    // Cleanup created users
    for (const userId of createdUsers) {
      try {
        await prisma.user.delete({ where: { id: userId } });
      } catch (error) {
        console.warn('Failed to cleanup user:', error.message);
      }
    }
    createdUsers = [];
  });

  test('create user', async () => {
    const user = await prisma.user.create({...});
    createdUsers.push(user.id); // Track for cleanup

    // Test logic...
  });
});
```

### 4.3 Cleanup Helper Function

```javascript
async function cleanupAfterTest(resources) {
  const prisma = getPrismaClient();

  for (const resource of resources) {
    try {
      if (resource.type === "user" && resource.id) {
        await prisma.user.delete({ where: { id: resource.id } });
      } else if (resource.type === "product" && resource.id) {
        await prisma.product.delete({ where: { id: resource.id } });
      }
    } catch (error) {
      // Log warning nhưng không fail test
      console.warn(`Failed to cleanup ${resource.type}:`, error.message);
    }
  }
}

// Sử dụng
describe("Tests", () => {
  let resources = [];

  afterEach(async () => {
    await cleanupAfterTest(resources);
    resources = [];
  });

  test("example", async () => {
    const user = await createUser();
    resources.push({ type: "user", id: user.id });
    // ...
  });
});
```

### 4.4 Global Cleanup

```javascript
afterAll(async () => {
  // 1. Clean test data
  await cleanTestDatabase();

  // 2. Close all connections
  for (const connection of activeConnections) {
    try {
      if (connection.$disconnect) {
        await connection.$disconnect();
      }
    } catch (error) {
      console.warn("Failed to close connection:", error.message);
    }
  }
  activeConnections.clear();

  // 3. Clean up resources
  for (const resource of createdResources) {
    try {
      if (typeof resource.cleanup === "function") {
        await resource.cleanup();
      }
    } catch (error) {
      console.warn("Failed to cleanup resource:", error.message);
    }
  }
  createdResources.clear();

  console.log("✅ All resources cleaned up");
});
```

---

## 5. COMMON PATTERNS

### 5.1 Pattern: Setup-Execute-Verify-Teardown

```javascript
test('complete pattern example', async () => {
  // SETUP (Arrange)
  const user = await TestDatabaseHelper.createUser();
  const token = TestJWTHelper.generateToken({ userId: user.id });
  TestMockHelper.mockEmailSuccess();
  const resources = [{ type: 'user', id: user.id }];

  try {
    // EXECUTE (Act)
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [...] });

    // VERIFY (Assert)
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('orderId');

    resources.push({ type: 'order', id: response.body.orderId });
  } finally {
    // TEARDOWN (Cleanup)
    await cleanupAfterTest(resources);
  }
});
```

### 5.2 Pattern: Test Isolation

```javascript
// ✅ ĐÚNG: Mỗi test độc lập
describe("Product Tests", () => {
  test("test 1", async () => {
    const product = await createProduct(); // Tạo riêng
    // Test logic
    await deleteProduct(product.id); // Cleanup riêng
  });

  test("test 2", async () => {
    const product = await createProduct(); // Tạo riêng
    // Test logic
    await deleteProduct(product.id); // Cleanup riêng
  });
});

// ❌ SAI: Tests phụ thuộc lẫn nhau
let sharedProduct; // NGUY HIỂM!

beforeAll(async () => {
  sharedProduct = await createProduct();
});

test("test 1", () => {
  // Dùng sharedProduct
});

test("test 2", () => {
  // Dùng sharedProduct - Test này phụ thuộc test 1!
});
```

### 5.3 Pattern: Async Cleanup với Timeout

```javascript
async function cleanupWithTimeout(cleanupFn, timeoutMs = 5000) {
  return Promise.race([
    cleanupFn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Cleanup timeout")), timeoutMs)
    ),
  ]);
}

// Sử dụng
afterAll(async () => {
  try {
    await cleanupWithTimeout(async () => {
      await cleanTestDatabase();
      await disconnectTestDatabase();
    }, 10000);
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
});
```

### 5.4 Pattern: Conditional Testing

```javascript
const skipIfNoDatabase = process.env.DATABASE_URL ? test : test.skip;

skipIfNoDatabase("database test", async () => {
  // Test này chỉ chạy khi có DATABASE_URL
});

// Hoặc
if (process.env.CI) {
  test.skip("test chậm, skip trong CI", () => {
    // ...
  });
}
```

---

## 6. CHECKLIST

### Trước khi chạy tests:

- [ ] `.env.test` đã được tạo và config đúng
- [ ] Test database KHÁC với production database
- [ ] External services đã được mock
- [ ] Prisma Client đã được generated

### Trong test:

- [ ] Mỗi test tạo data riêng (không share state)
- [ ] Track resources được tạo để cleanup
- [ ] Mock external calls (payment, email, API)
- [ ] Assertions đầy đủ và rõ ràng

### Sau tests:

- [ ] Database connections được đóng
- [ ] Test data được xóa sạch
- [ ] Mocks được reset
- [ ] Không có memory leaks

---

## 7. DEBUGGING TIPS

### 7.1 Enable Debug Logs

```bash
# Enable debug mode
DEBUG_TESTS=true npm test

# Hoặc trong code
if (process.env.DEBUG_TESTS) {
  console.log('Debug info:', data);
}
```

### 7.2 Inspect Database

```javascript
afterEach(async () => {
  if (process.env.DEBUG_TESTS) {
    const users = await prisma.user.findMany();
    console.log("Users in DB:", users.length);
  }
});
```

### 7.3 Check for Hanging Tests

```javascript
// Set aggressive timeout để detect hanging tests
jest.setTimeout(5000); // 5 seconds

// Log khi test start/end
beforeEach(() => {
  console.log(`▶️  Starting: ${expect.getState().currentTestName}`);
});

afterEach(() => {
  console.log(`✓ Completed: ${expect.getState().currentTestName}`);
});
```

---

**Cập nhật:** November 22, 2025  
**Best Practices Version:** 1.0
