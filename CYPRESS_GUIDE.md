# HƯỚNG DẪN CHẠY CYPRESS TESTS

## 📋 Yêu cầu

- Node.js v18+
- Dự án đã được cài đặt dependencies
- Backend API đang chạy tại http://localhost:3002
- Frontend User đang chạy tại http://localhost:3000
- Frontend Admin đang chạy tại http://localhost:3001

## 🚀 Khởi động Services

### Bước 1: Start Backend

```bash
cd backend
npm start
# Backend chạy tại: http://localhost:3002
```

### Bước 2: Start Frontend User

```bash
cd frontend-user
npm run dev
# User frontend chạy tại: http://localhost:3000
```

### Bước 3: Start Frontend Admin

```bash
cd frontend-admin
npm run dev
# Admin frontend chạy tại: http://localhost:3001
```

## 🧪 Chạy Cypress Tests

### Option 1: Cypress Interactive Mode (GUI)

```bash
# Mở Cypress Test Runner
npm run cy:open

# Hoặc
npx cypress open
```

Trong GUI:
1. Chọn "E2E Testing"
2. Chọn browser (Chrome recommended)
3. Click vào test file muốn chạy
4. Xem test chạy real-time

### Option 2: Headless Mode (Command Line)

```bash
# Chạy tất cả tests
npm run test:e2e

# Hoặc
npm run cy:run

# Chạy với Chrome
npm run cy:run:chrome

# Chạy với Firefox
npm run cy:run:firefox

# Chạy headed mode (thấy browser)
npm run test:e2e:headed
```

### Option 3: Chạy test cụ thể

```bash
# Chạy 1 file test
npx cypress run --spec "cypress/e2e/01-auth.cy.js"

# Chạy nhiều files
npx cypress run --spec "cypress/e2e/01-auth.cy.js,cypress/e2e/02-crud-products.cy.js"

# Chạy theo pattern
npx cypress run --spec "cypress/e2e/*-api-*.cy.js"
```

## 📁 Cấu trúc Test Files

```
cypress/
├── e2e/
│   ├── 01-auth.cy.js              # Login/Register tests (12 tests)
│   ├── 02-crud-products.cy.js     # CRUD operations (14 tests)
│   ├── 03-authorization.cy.js     # Phân quyền (27 tests)
│   ├── 04-form-validation.cy.js   # Validation (27 tests)
│   ├── 05-search.cy.js           # Search functionality (21 tests)
│   └── 06-api-tests.cy.js        # API testing (30 tests)
├── support/
│   ├── commands.js               # Custom commands
│   └── e2e.js                   # Global config
└── cypress.config.js            # Cypress configuration
```

## 🎯 Test Accounts

```javascript
// User account
Email: user@example.com
Password: user123

// Admin account
Email: admin@example.com
Password: admin123
```

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to localhost:3000"

**Giải pháp:**
1. Kiểm tra frontend user đang chạy
2. Check port không bị chiếm bởi app khác
3. Chạy `npm run dev` trong frontend-user

### Lỗi: "Cannot connect to localhost:3002"

**Giải pháp:**
1. Kiểm tra backend đang chạy
2. Check database connection
3. Chạy `npm start` trong backend

### Lỗi: "Login failed"

**Giải pháp:**
1. Kiểm tra test accounts đã được tạo trong database
2. Chạy seed data: `cd backend && node utills/insertDemoData.js`
3. Chạy admin user: `cd backend && node utills/insertAdminUser.js`

### Lỗi: "Element not found"

**Giải pháp:**
1. UI có thể đã thay đổi, update selectors trong test
2. Tăng timeout: `cy.get('selector', { timeout: 10000 })`
3. Check element có hidden không

## 📊 Xem Test Results

### Video recordings

```bash
# Videos được lưu tại:
cypress/videos/
```

### Screenshots (khi test fail)

```bash
# Screenshots được lưu tại:
cypress/screenshots/
```

### Xem trên Terminal

```bash
# Output hiển thị:
✓ Test passed (số ms)
✗ Test failed (lỗi message)

# Summary:
- Passed: X
- Failed: Y
- Duration: Z seconds
```

## 🎨 Custom Commands

```javascript
// Login commands
cy.loginUser('email@example.com', 'password')
cy.loginAdmin('admin@example.com', 'admin123')
cy.logout()

// Register command
cy.registerUser('new@example.com', 'Password123!', 'John Doe')

// API commands
cy.apiRequest('GET', '/api/products')
cy.waitForAPI('@apiCall')

// Product commands
cy.createProduct({
  title: 'Test Product',
  price: 1000000,
  quantity: 10
})
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Cypress Tests

on: [push]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start services
        run: |
          npm run start:backend &
          npm run start:frontend &
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          wait-on: 'http://localhost:3000, http://localhost:3002'
```

## 📈 Tips & Best Practices

1. **Chạy tests thường xuyên**
   - Sau mỗi lần code mới
   - Trước khi commit/push

2. **Debug tests**
   ```javascript
   cy.pause() // Tạm dừng test
   cy.debug() // Log ra console
   ```

3. **Skip tests tạm thời**
   ```javascript
   it.skip('Test tạm skip', () => {})
   describe.only('Chỉ chạy suite này', () => {})
   ```

4. **Xem network requests**
   - Mở Cypress GUI
   - Click vào command trong log
   - Xem XHR/Fetch requests

5. **Custom viewport**
   ```javascript
   cy.viewport(1920, 1080) // Desktop
   cy.viewport('iphone-6') // Mobile
   ```

## 📞 Support

Nếu gặp vấn đề:
1. Check documentation: https://docs.cypress.io
2. Xem logs trong terminal
3. Debug với Cypress GUI
4. Contact team members

---

**Happy Testing! 🎉**
