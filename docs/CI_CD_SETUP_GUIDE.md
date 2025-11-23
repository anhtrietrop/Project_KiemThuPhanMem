# CI/CD Setup Guide - GitHub Actions & Jest Testing

> **Tài liệu hướng dẫn:** Setup và sử dụng CI/CD pipeline với GitHub Actions và Jest

---

## 📚 MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Cài đặt Jest Testing](#2-cài-đặt-jest-testing)
3. [Cấu hình GitHub Actions](#3-cấu-hình-github-actions)
4. [Chạy Tests Local](#4-chạy-tests-local)
5. [Workflow CI/CD](#5-workflow-cicd)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. TỔNG QUAN

### 1.1 Kiến trúc CI/CD

```
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Repository                         │
│                                                               │
│  Push/PR → GitHub Actions → Run Tests → Build → Deploy      │
└──────────────────────────────────────────────────────────────┘

Workflow:
1. Developer push code hoặc tạo Pull Request
2. GitHub Actions tự động trigger
3. Run tests (Unit, Integration, E2E)
4. Generate coverage report
5. Build applications
6. Report results
```

### 1.2 Tech Stack

| Component         | Technology     | Purpose                        |
| ----------------- | -------------- | ------------------------------ |
| Testing Framework | Jest           | Unit & Integration tests       |
| API Testing       | Supertest      | HTTP API endpoint testing      |
| CI/CD Platform    | GitHub Actions | Automated testing & deployment |
| Database          | MySQL          | Test database (isolated)       |
| Coverage          | Jest Coverage  | Code coverage reports          |

---

## 2. CÀI ĐẶT JEST TESTING

### 2.1 Đã cài đặt sẵn trong project

Backend đã được setup với các dependencies:

```json
{
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "jest": "^30.2.0",
    "supertest": "^7.1.4"
  }
}
```

### 2.2 Cấu trúc thư mục

```
backend/
├── jest.config.js          # Jest configuration
├── tests/
│   ├── setup.js           # Global test setup
│   ├── unit/              # Unit tests
│   │   └── sample.test.js
│   ├── integration/       # Integration tests
│   └── e2e/              # End-to-end tests
├── controllers/          # Code to be tested
├── routes/
└── middleware/
```

### 2.3 Jest Configuration

File `backend/jest.config.js`:

```javascript
module.exports = {
  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: ["**/tests/**/*.test.js"],

  // Coverage configuration
  collectCoverageFrom: [
    "controllers/**/*.js",
    "routes/**/*.js",
    "middleware/**/*.js",
    "utills/**/*.js",
    "!**/node_modules/**",
    "!**/tests/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },

  // Test behavior
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

### 2.4 Test Setup File

File `backend/tests/setup.js` chứa configuration chung cho tất cả tests:

```javascript
// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";

// Global hooks
beforeAll(async () => {
  console.log("🧪 Test suite starting...");
  // Initialize test database
  // Clear test data
});

afterAll(async () => {
  console.log("✅ Test suite completed");
  // Close database connections
});

beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## 3. CẤU HÌNH GITHUB ACTIONS

### 3.1 Workflow File

File `.github/workflows/ci.yml` định nghĩa CI/CD pipeline:

**Vị trí:** `.github/workflows/ci.yml`

**Triggers:**

- Push to `main` hoặc `develop` branch
- Pull Request to `main` hoặc `develop`

### 3.2 Pipeline Architecture

```yaml
CI Pipeline:
├── Job 1: test-backend
│   ├── Setup MySQL service
│   ├── Install dependencies
│   ├── Run database migrations
│   ├── Run tests
│   └── Generate coverage
├── Job 2: test-frontend-admin
│   ├── Install dependencies
│   ├── Run linter
│   └── Build application
├── Job 3: test-frontend-user
│   ├── Install dependencies
│   ├── Run linter
│   └── Build application
└── Job 4: build-status
    └── Check all jobs passed
```

### 3.3 Matrix Strategy

Tests chạy trên nhiều Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

Điều này đảm bảo code tương thích với nhiều phiên bản Node.js.

### 3.4 MySQL Service

GitHub Actions tự động khởi tạo MySQL container cho testing:

```yaml
services:
  mysql:
    image: mysql:8.0
    env:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: test_db
      MYSQL_USER: test_user
      MYSQL_PASSWORD: test_password
    ports:
      - 3306:3306
```

### 3.5 Environment Variables

Tests sử dụng environment variables:

```yaml
env:
  NODE_ENV: test
  DATABASE_URL: mysql://test_user:test_password@127.0.0.1:3306/test_db
  JWT_SECRET: test-jwt-secret-key
```

---

## 4. CHẠY TESTS LOCAL

### 4.1 Commands

```powershell
# Navigate to backend
cd backend

# Run all tests
npm test

# Run tests in watch mode (auto re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/unit/sample.test.js

# Run tests matching pattern
npm test -- --testNamePattern="Auth"
```

### 4.2 Coverage Report

Sau khi chạy `npm run test:coverage`, report được tạo tại:

```
backend/coverage/
├── lcov-report/
│   └── index.html      # HTML report (mở bằng browser)
├── lcov.info           # Coverage data
└── coverage-summary.json
```

**Xem coverage report:**

```powershell
# Windows
start backend/coverage/lcov-report/index.html

# Hoặc mở bằng browser
# File → Open → backend/coverage/lcov-report/index.html
```

### 4.3 Test Output

```
PASS  tests/unit/sample.test.js
  Sample Test Suite
    Basic JavaScript Operations
      ✓ should add two numbers correctly (2 ms)
      ✓ should multiply numbers correctly (1 ms)
    String Operations
      ✓ should concatenate strings (1 ms)
      ✓ should check string contains substring
    Array Operations
      ✓ should create array with correct length
      ✓ should filter array correctly (1 ms)
    Object Operations
      ✓ should create object with properties
      ✓ should compare objects
    Async Operations
      ✓ should resolve promise (1 ms)
      ✓ should handle async function
    Error Handling
      ✓ should throw error (2 ms)
      ✓ should handle rejected promise (1 ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        0.523 s
```

---

## 5. WORKFLOW CI/CD

### 5.1 Khi Push Code

```
1. Developer commit & push code
   ↓
2. GitHub Actions nhận event
   ↓
3. Checkout code từ repository
   ↓
4. Setup Node.js environment
   ↓
5. Install dependencies (npm ci)
   ↓
6. Setup MySQL test database
   ↓
7. Run Prisma migrations
   ↓
8. Run tests
   ↓
9. Generate coverage report
   ↓
10. Upload artifacts & reports
    ↓
11. Report status (Success/Failure)
```

### 5.2 Khi tạo Pull Request

```
1. Developer tạo Pull Request
   ↓
2. GitHub Actions trigger automatically
   ↓
3. Run full test suite
   ↓
4. Show test results in PR
   ↓
5. Require tests pass trước khi merge
```

### 5.3 Viewing Results

**1. Trên GitHub:**

- Vào tab **Actions** trong repository
- Click vào workflow run
- Xem logs của từng job
- Download artifacts (coverage reports)

**2. Pull Request Checks:**

- PR hiển thị status của tests
- ✅ Green checkmark = All tests passed
- ❌ Red X = Tests failed
- 🟡 Yellow dot = Running

**3. Badges (Optional):**

Thêm badge vào README.md:

```markdown
![CI](https://github.com/anhtrietrop/Project_KiemThuPhanMem/workflows/CI%2FCD%20Pipeline/badge.svg)
```

### 5.4 Branch Protection Rules

**Khuyến nghị:** Setup branch protection cho `main`:

```
Settings → Branches → Add rule

Rule settings:
☑ Require a pull request before merging
☑ Require status checks to pass before merging
  ☑ test-backend
  ☑ test-frontend-admin
  ☑ test-frontend-user
☑ Require conversation resolution before merging
```

---

## 6. TROUBLESHOOTING

### 6.1 Tests fail locally nhưng pass trên CI

**Nguyên nhân:** Environment differences

**Giải pháp:**

```powershell
# Đảm bảo dùng đúng Node.js version
node --version  # Should match CI (18.x or 20.x)

# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install

# Đảm bảo dùng test database
$env:NODE_ENV="test"
npm test
```

### 6.2 MySQL connection failed trong CI

**Nguyên nhân:** Database chưa sẵn sàng

**Giải pháp:** Workflow đã có step "Wait for MySQL":

```yaml
- name: Wait for MySQL
  run: |
    for i in {1..30}; do
      if mysqladmin ping -h"127.0.0.1" -P3306 -utest_user -ptest_password &> /dev/null; then
        echo "MySQL is ready"
        break
      fi
      echo "Waiting for MySQL..."
      sleep 2
    done
```

### 6.3 Coverage threshold not met

**Lỗi:** `Jest: "global" coverage threshold for lines (80%) not met: 65%`

**Giải pháp:**

```powershell
# Check coverage report
npm run test:coverage

# Xem file nào chưa được test đủ
# Mở: coverage/lcov-report/index.html

# Viết thêm tests cho các file có coverage thấp
```

### 6.4 Test timeout

**Lỗi:** `Timeout - Async callback was not invoked within the 5000 ms timeout`

**Giải pháp:**

```javascript
// Trong test file
jest.setTimeout(10000); // 10 seconds

// Hoặc trong jest.config.js
module.exports = {
  testTimeout: 10000,
};

// Hoặc cho từng test
test("slow test", async () => {
  // ...
}, 15000); // 15 seconds timeout
```

### 6.5 Module not found

**Lỗi:** `Cannot find module '../controllers/authController'`

**Giải pháp:**

```javascript
// Kiểm tra path import
const authController = require("../controllers/authController"); // ❌
const authController = require("../../controllers/authController"); // ✅

// Hoặc dùng absolute paths
const authController = require("@/controllers/authController");
```

### 6.6 Prisma schema sync issues

**Lỗi:** `Prisma schema out of sync`

**Giải pháp:**

```powershell
# Regenerate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate dev
```

---

## 7. BEST PRACTICES

### 7.1 Writing Tests

```javascript
// ✅ Good
describe("User Authentication", () => {
  test("should register user with valid data", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
  });
});

// ❌ Bad
test("test1", () => {
  expect(1 + 1).toBe(2);
});
```

### 7.2 Test Isolation

```javascript
// ✅ Clean up after each test
afterEach(async () => {
  await User.destroy({ where: {} });
  jest.clearAllMocks();
});

// ❌ Tests depend on each other
let userId; // Shared state
test('create user', async () => {
  const user = await User.create({...});
  userId = user.id; // Bad!
});
```

### 7.3 Mocking

```javascript
// ✅ Mock external services
jest.mock("../services/emailService", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

// ✅ Mock database
jest.mock("../utills/db", () => ({
  query: jest.fn(),
}));
```

### 7.4 Test Coverage Goals

```
Unit Tests:       70-80% coverage
Integration Tests: Focus on critical paths
E2E Tests:        Main user journeys

Prioritize:
1. Authentication & Authorization
2. Payment processing
3. Order management
4. Data validation
```

---

## 8. QUICK REFERENCE

### 8.1 Commands Cheat Sheet

```powershell
# Testing
npm test                      # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # With coverage
npm test -- --verbose        # Detailed output
npm test -- path/to/test.js  # Specific file

# CI/CD
git push origin main         # Trigger CI on push
git push origin feature/*    # Trigger CI on PR

# Coverage
start coverage/lcov-report/index.html  # View report
```

### 8.2 File Locations

```
Project Root/
├── .github/workflows/ci.yml           # CI/CD config
├── backend/
│   ├── jest.config.js                 # Jest config
│   ├── tests/
│   │   ├── setup.js                   # Test setup
│   │   ├── unit/*.test.js             # Unit tests
│   │   ├── integration/*.test.js      # Integration tests
│   │   └── e2e/*.test.js             # E2E tests
│   └── coverage/                      # Coverage reports
```

### 8.3 Useful Links

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

## 9. LIÊN QUAN

### Tài liệu khác:

- [`backend/docs/ChienLuocSinhTest.md`](../backend/docs/ChienLuocSinhTest.md) - Chiến lược sinh test cases
- [`backend/docs/TEST_BEST_PRACTICES.md`](../backend/docs/TEST_BEST_PRACTICES.md) - Best practices cho testing
- [`backend/docs/TEST_PLAN.md`](../backend/docs/TEST_PLAN.md) - Test plan chi tiết (nếu có)

## 10. NEXT STEPS

- [ ] Viết unit tests cho Auth module
- [ ] Viết integration tests cho API endpoints
- [ ] Setup E2E tests với Playwright (optional)
- [ ] Tích hợp Codecov cho coverage tracking
- [ ] Setup automated deployment sau khi tests pass
- [ ] Add pre-commit hooks với Husky

---

**Cập nhật lần cuối:** November 22, 2025  
**Maintainer:** Project Team
