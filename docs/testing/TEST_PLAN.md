# BACKEND TEST PLAN - E-COMMERCE PLATFORM

> **Mục đích:** Kịch bản test chi tiết cho toàn bộ backend system

## 📋 MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Unit Tests](#2-unit-tests)
3. [Integration Tests](#3-integration-tests)
4. [E2E Tests](#4-e2e-tests)
5. [Test Coverage Goals](#5-test-coverage-goals)

---

## 1. TỔNG QUAN

### 1.1 Test Strategy

```
Unit Tests (60%)          → Test từng function/method riêng lẻ
Integration Tests (30%)   → Test tương tác giữa các modules
E2E Tests (10%)          → Test toàn bộ flow từ API đến database
```

### 1.2 Test Environment

- **Database:** MySQL Test Database (separate from dev)
- **Mock Services:** MoMo Payment, Email Service
- **Test Data:** Seed data tự động tạo và xóa sau mỗi test

---

## 2. UNIT TESTS

### 2.1 Authentication Module (`src/controllers/authController.js`)

#### **Test Cases:**

```javascript
describe("Auth Controller - Register", () => {
  test("UC1.1: Đăng ký thành công với thông tin hợp lệ", async () => {
    // Input: email, password, name, phone
    // Expected: User created, token returned
  });

  test("UC1.2: Đăng ký thất bại - Email đã tồn tại", async () => {
    // Expected: Error 409 Conflict
  });

  test("UC1.3: Đăng ký thất bại - Thiếu thông tin bắt buộc", async () => {
    // Expected: Error 400 Bad Request
  });

  test("UC1.4: Đăng ký thất bại - Email không hợp lệ", async () => {
    // Expected: Error 400 Bad Request
  });

  test("UC1.5: Đăng ký thất bại - Mật khẩu quá ngắn (<6 ký tự)", async () => {
    // Expected: Error 400 Bad Request
  });

  test("UC1.6: Mã hóa password trước khi lưu database", async () => {
    // Verify: Password is hashed with bcrypt
  });
});

describe("Auth Controller - Login", () => {
  test("UC1.7: Đăng nhập thành công với email & password đúng", async () => {
    // Expected: JWT token returned
  });

  test("UC1.8: Đăng nhập thất bại - Email không tồn tại", async () => {
    // Expected: Error 401 Unauthorized
  });

  test("UC1.9: Đăng nhập thất bại - Sai mật khẩu", async () => {
    // Expected: Error 401 Unauthorized
  });

  test("UC1.10: Token hết hạn sau 24h", async () => {
    // Verify: JWT expiration time
  });
});

describe("Auth Middleware - Verify Token", () => {
  test("UC1.11: Xác thực token hợp lệ", async () => {
    // Expected: User info decoded from token
  });

  test("UC1.12: Từ chối token không hợp lệ", async () => {
    // Expected: Error 401 Unauthorized
  });

  test("UC1.13: Từ chối request không có token", async () => {
    // Expected: Error 401 Unauthorized
  });
});
```

---

### 2.2 User Module (`src/controllers/userController.js`)

#### **Test Cases:**

```javascript
describe("User Controller - Profile", () => {
  test("UC1.14: Lấy thông tin profile người dùng hiện tại", async () => {
    // Expected: User info returned (exclude password)
  });

  test("UC1.15: Cập nhật profile thành công", async () => {
    // Input: name, phone, avatar
    // Expected: Updated user info
  });

  test("UC1.16: Không cho phép cập nhật email", async () => {
    // Expected: Email field ignored
  });
});

describe("User Controller - Address", () => {
  test("UC1.17: Thêm địa chỉ mới", async () => {
    // Input: address, city, district, phone
    // Expected: Address created
  });

  test("UC1.18: Lấy danh sách địa chỉ của user", async () => {
    // Expected: Array of addresses
  });

  test("UC1.19: Cập nhật địa chỉ", async () => {
    // Expected: Address updated
  });

  test("UC1.20: Xóa địa chỉ", async () => {
    // Expected: Address deleted
  });

  test("UC1.21: Set địa chỉ mặc định", async () => {
    // Expected: isDefault = true, others = false
  });
});
```

---

### 2.3 Product Module (`src/controllers/productController.js`)

#### **Test Cases:**

```javascript
describe("Product Controller - CRUD", () => {
  test("UC1.22: Lấy danh sách sản phẩm (pagination)", async () => {
    // Query: page=1, limit=20
    // Expected: Products array + total count
  });

  test("UC1.23: Lấy chi tiết sản phẩm theo ID", async () => {
    // Expected: Product with variants, images, merchant
  });

  test("UC1.24: Tạo sản phẩm mới (Admin/Merchant)", async () => {
    // Input: name, price, category, variants
    // Expected: Product created
  });

  test("UC1.25: Cập nhật sản phẩm", async () => {
    // Expected: Product updated
  });

  test("UC1.26: Xóa sản phẩm (soft delete)", async () => {
    // Expected: Product.deletedAt set
  });

  test("UC1.27: Không cho phép tạo sản phẩm với giá âm", async () => {
    // Expected: Error 400
  });
});

describe("Product Controller - Search & Filter", () => {
  test("UC1.28: Tìm kiếm sản phẩm theo tên", async () => {
    // Query: search="laptop"
    // Expected: Matching products
  });

  test("UC1.29: Lọc sản phẩm theo category", async () => {
    // Query: categoryId=1
    // Expected: Products in category
  });

  test("UC1.30: Lọc sản phẩm theo khoảng giá", async () => {
    // Query: minPrice=100000, maxPrice=500000
    // Expected: Products in price range
  });

  test("UC1.30a: Lọc với minPrice = 0 (từ 0đ)", async () => {
    // Query: minPrice=0
    // Expected: All products (no lower limit)
  });

  test("UC1.30b: Lọc với maxPrice không giới hạn (unlimited)", async () => {
    // Query: minPrice=10000000 (không có maxPrice)
    // Expected: Products >= 10tr, không có upper limit
  });

  test("UC1.30c: Lỗi khi minPrice > maxPrice", async () => {
    // Query: minPrice=500000, maxPrice=100000
    // Expected: Error 400 - minPrice cannot exceed maxPrice
  });

  test("UC1.30d: Lỗi khi minPrice < 0", async () => {
    // Query: minPrice=-1000
    // Expected: Error 400 - minPrice must be >= 0
  });

  test("UC1.31: Sắp xếp sản phẩm (price, createdAt)", async () => {
    // Query: sortBy=price, order=asc
    // Expected: Sorted products
  });

  test("UC1.31a: Lọc theo tình trạng còn hàng (inStock)", async () => {
    // Query: inStock=true, outOfStock=false
    // Expected: Products with quantity > 0
  });

  test("UC1.31b: Lọc theo tình trạng hết hàng (outOfStock)", async () => {
    // Query: inStock=false, outOfStock=true
    // Expected: Products with quantity = 0
  });

  test("UC1.31c: Lọc theo rating tối thiểu", async () => {
    // Query: rating=4.5
    // Expected: Products with rating >= 4.5
  });

  test("UC1.31d: Kết hợp nhiều filter (Category + Price + Stock + Rating)", async () => {
    // Query: category=phones&minPrice=5000000&inStock=true&rating=4
    // Expected: Products matching all criteria
  });
});

describe("Product Controller - Variants", () => {
  test("UC1.32: Lấy danh sách variants của sản phẩm", async () => {
    // Expected: Array of variants with stock
  });

  test("UC1.33: Cập nhật stock của variant", async () => {
    // Expected: Variant stock updated
  });

  test("UC1.34: Không cho phép đặt hàng khi variant hết stock", async () => {
    // Expected: Error 400
  });
});
```

---

### 2.4 Category Module (`src/controllers/categoryController.js`)

#### **Test Cases:**

```javascript
describe("Category Controller", () => {
  test("UC1.35: Lấy danh sách categories", async () => {
    // Expected: Hierarchical category tree
  });

  test("UC1.36: Tạo category mới (Admin)", async () => {
    // Input: name, parentId
    // Expected: Category created
  });

  test("UC1.37: Cập nhật category", async () => {
    // Expected: Category updated
  });

  test("UC1.38: Xóa category (nếu không có sản phẩm)", async () => {
    // Expected: Category deleted
  });

  test("UC1.39: Không cho phép xóa category có sản phẩm", async () => {
    // Expected: Error 400
  });
});
```

---

### 2.5 Merchant Module (`src/controllers/merchantController.js`)

#### **Test Cases:**

```javascript
describe("Merchant Controller - Registration", () => {
  test("UC1.40: Đăng ký merchant mới", async () => {
    // Input: storeName, businessLicense, address
    // Expected: Merchant created with PENDING status
  });

  test("UC1.41: Duyệt merchant (Admin)", async () => {
    // Expected: Merchant status = APPROVED
  });

  test("UC1.42: Từ chối merchant (Admin)", async () => {
    // Expected: Merchant status = REJECTED
  });
});

describe("Merchant Controller - Store Management", () => {
  test("UC1.43: Cập nhật thông tin cửa hàng", async () => {
    // Expected: Merchant info updated
  });

  test("UC1.44: Lấy danh sách sản phẩm của merchant", async () => {
    // Expected: Merchant's products
  });

  test("UC1.45: Lấy thống kê bán hàng của merchant", async () => {
    // Expected: Sales statistics
  });
});
```

---

### 2.6 Cart Module (`src/controllers/cartController.js`)

#### **Test Cases:**

```javascript
describe("Cart Controller - Add/Update/Remove", () => {
  test("UC2.1: Thêm sản phẩm vào giỏ hàng", async () => {
    // Input: productVariantId, quantity
    // Expected: Cart item created
  });

  test("UC2.2: Cập nhật số lượng sản phẩm trong giỏ", async () => {
    // Expected: Cart item quantity updated
  });

  test("UC2.3: Xóa sản phẩm khỏi giỏ hàng", async () => {
    // Expected: Cart item deleted
  });

  test("UC2.4: Xóa toàn bộ giỏ hàng", async () => {
    // Expected: All cart items deleted
  });

  test("UC2.5: Không cho phép thêm quá số lượng tồn kho", async () => {
    // Expected: Error 400
  });
});

describe("Cart Controller - View", () => {
  test("UC2.6: Lấy danh sách sản phẩm trong giỏ", async () => {
    // Expected: Cart items with product info
  });

  test("UC2.7: Tính tổng tiền giỏ hàng", async () => {
    // Expected: Correct total amount
  });

  test("UC2.8: Giỏ hàng tự động cập nhật khi giá sản phẩm thay đổi", async () => {
    // Expected: Latest price applied
  });
});
```

---

### 2.7 Wishlist Module (`src/controllers/wishlistController.js`)

#### **Test Cases:**

```javascript
describe("Wishlist Controller", () => {
  test("UC2.9: Thêm sản phẩm vào wishlist", async () => {
    // Expected: Wishlist item created
  });

  test("UC2.10: Xóa sản phẩm khỏi wishlist", async () => {
    // Expected: Wishlist item deleted
  });

  test("UC2.11: Lấy danh sách wishlist", async () => {
    // Expected: Array of wishlist items
  });

  test("UC2.12: Không cho phép thêm trùng sản phẩm", async () => {
    // Expected: Error 400 or ignore
  });
});
```

---

### 2.8 Review Module (`src/controllers/reviewController.js`)

#### **Test Cases:**

```javascript
describe("Review Controller - CRUD", () => {
  test("UC2.13: Tạo đánh giá sản phẩm", async () => {
    // Input: productId, rating (1-5), comment
    // Expected: Review created
  });

  test("UC2.14: Chỉ cho phép đánh giá sau khi mua hàng", async () => {
    // Expected: Error 403 if no order
  });

  test("UC2.15: Lấy danh sách đánh giá của sản phẩm", async () => {
    // Expected: Reviews with pagination
  });

  test("UC2.16: Cập nhật đánh giá", async () => {
    // Expected: Review updated
  });

  test("UC2.17: Xóa đánh giá (Admin hoặc owner)", async () => {
    // Expected: Review deleted
  });

  test("UC2.18: Tính rating trung bình của sản phẩm", async () => {
    // Expected: Average rating (1-5)
  });
});

describe("Review Controller - Images", () => {
  test("UC2.19: Upload ảnh kèm đánh giá", async () => {
    // Expected: Images uploaded and linked
  });

  test("UC2.20: Giới hạn tối đa 5 ảnh/review", async () => {
    // Expected: Error 400 if > 5 images
  });
});
```

---

### 2.9 Order Module (`src/controllers/orderController.js`)

#### **Test Cases:**

```javascript
describe("Order Controller - Create Order", () => {
  test("UC3.1: Tạo đơn hàng thành công", async () => {
    // Input: cartItems, addressId, paymentMethod
    // Expected: Order created with PENDING status
  });

  test("UC3.2: Kiểm tra stock trước khi tạo đơn", async () => {
    // Expected: Error if out of stock
  });

  test("UC3.3: Tính toán tổng tiền chính xác", async () => {
    // Expected: subtotal + shipping - discount
  });

  test("UC3.4: Tạo OrderItems từ CartItems", async () => {
    // Expected: OrderItems created, Cart cleared
  });

  test("UC3.5: Gửi email xác nhận đơn hàng", async () => {
    // Expected: Email sent (mocked)
  });
});

describe("Order Controller - Order Status", () => {
  test("UC3.6: Cập nhật trạng thái đơn hàng", async () => {
    // Flow: PENDING → CONFIRMED → SHIPPING → DELIVERED
    // Expected: Status updated
  });

  test("UC3.7: Hủy đơn hàng (nếu chưa xác nhận)", async () => {
    // Expected: Order status = CANCELLED, stock restored
  });

  test("UC3.8: Không cho phép hủy đơn đã giao", async () => {
    // Expected: Error 400
  });

  test("UC3.9: Hoàn tiền khi hủy đơn đã thanh toán", async () => {
    // Expected: Refund initiated (mocked)
  });
});

describe("Order Controller - View Orders", () => {
  test("UC3.10: Lấy danh sách đơn hàng của user", async () => {
    // Expected: User's orders with pagination
  });

  test("UC3.11: Lấy chi tiết đơn hàng", async () => {
    // Expected: Order with items, address, tracking
  });

  test("UC3.12: Merchant xem đơn hàng của mình", async () => {
    // Expected: Orders containing merchant's products
  });

  test("UC3.13: Admin xem tất cả đơn hàng", async () => {
    // Expected: All orders with filters
  });
});
```

---

### 2.10 Payment Module (`src/controllers/paymentController.js`)

#### **Test Cases:**

```javascript
describe("Payment Controller - MoMo Integration", () => {
  test("UC3.14: Tạo payment request cho MoMo", async () => {
    // Expected: Payment URL returned
  });

  test("UC3.15: Xử lý MoMo callback (success)", async () => {
    // Expected: Order status = PAID, Payment record created
  });

  test("UC3.16: Xử lý MoMo callback (failed)", async () => {
    // Expected: Order cancelled, user notified
  });

  test("UC3.17: Verify MoMo signature", async () => {
    // Expected: Invalid signature rejected
  });

  test("UC3.18: Thanh toán COD", async () => {
    // Expected: Order created, payment = COD
  });
});

describe("Payment Controller - Transaction History", () => {
  test("UC3.19: Lấy lịch sử giao dịch của user", async () => {
    // Expected: Array of transactions
  });

  test("UC3.20: Admin xem tất cả giao dịch", async () => {
    // Expected: All transactions with filters
  });
});
```

---

### 2.11 Notification Module (`src/controllers/notificationController.js`)

#### **Test Cases:**

```javascript
describe("Notification Controller", () => {
  test("UC4.1: Tạo notification cho user", async () => {
    // Input: userId, type, title, message
    // Expected: Notification created
  });

  test("UC4.2: Lấy danh sách notifications", async () => {
    // Expected: User's notifications, sorted by date
  });

  test("UC4.3: Đánh dấu notification đã đọc", async () => {
    // Expected: isRead = true
  });

  test("UC4.4: Đánh dấu tất cả đã đọc", async () => {
    // Expected: All notifications isRead = true
  });

  test("UC4.5: Xóa notification", async () => {
    // Expected: Notification deleted
  });

  test("UC4.6: Real-time notification qua Socket.IO", async () => {
    // Expected: Event emitted to user (mocked)
  });
});
```

---

### 2.12 Admin Module (`src/controllers/adminController.js`)

#### **Test Cases:**

```javascript
describe("Admin Controller - User Management", () => {
  test("UC4.7: Lấy danh sách users", async () => {
    // Expected: All users with pagination
  });

  test("UC4.8: Khóa/mở khóa user", async () => {
    // Expected: User status updated
  });

  test("UC4.9: Xóa user", async () => {
    // Expected: User soft deleted
  });
});

describe("Admin Controller - Dashboard", () => {
  test("UC4.10: Thống kê tổng quan", async () => {
    // Expected: Total users, orders, revenue
  });

  test("UC4.11: Thống kê doanh thu theo thời gian", async () => {
    // Query: startDate, endDate
    // Expected: Revenue chart data
  });

  test("UC4.12: Top sản phẩm bán chạy", async () => {
    // Expected: Products sorted by sales
  });
});
```

---

## 3. INTEGRATION TESTS

### 3.1 Auth Flow Integration

```javascript
describe("Integration: Complete Auth Flow", () => {
  test("INT1: Register → Login → Access Protected Route", async () => {
    // 1. Register new user
    // 2. Login with credentials
    // 3. Access /api/users/profile with token
    // Expected: Success at all steps
  });

  test("INT2: Login → Update Profile → Logout", async () => {
    // Full user session flow
  });
});
```

---

### 3.2 Shopping Flow Integration

```javascript
describe("Integration: Complete Shopping Flow", () => {
  test("INT3: Browse → Add to Cart → Checkout → Payment", async () => {
    // 1. Search products
    // 2. Add to cart
    // 3. Create order
    // 4. Process payment
    // Expected: Order created, stock updated, cart cleared
  });

  test("INT4: Wishlist → Add to Cart → Purchase", async () => {
    // User saves then buys from wishlist
  });
});
```

---

### 3.3 Order Management Integration

```javascript
describe("Integration: Order Lifecycle", () => {
  test("INT5: Create Order → Confirm → Ship → Deliver", async () => {
    // Full order status flow
  });

  test("INT6: Create Order → Cancel → Refund", async () => {
    // Order cancellation flow
  });
});
```

---

### 3.4 Merchant Flow Integration

```javascript
describe("Integration: Merchant Operations", () => {
  test("INT7: Register Merchant → Add Products → Receive Orders", async () => {
    // Complete merchant flow
  });

  test("INT8: Merchant updates stock → Order fails if out of stock", async () => {
    // Stock management integration
  });
});
```

---

## 4. E2E TESTS

### 4.1 Critical User Journeys

```javascript
describe("E2E: Complete User Journey", () => {
  test("E2E1: New User → Register → Browse → Purchase → Review", async () => {
    // Simulate entire customer journey
  });

  test("E2E2: Merchant → Register → Add Products → Fulfill Orders", async () => {
    // Merchant complete flow
  });

  test("E2E3: Admin → Manage Users → Approve Merchants → View Dashboard", async () => {
    // Admin operations
  });
});
```

---

## 5. TEST COVERAGE GOALS

### 5.1 Coverage Targets

```
Overall Coverage:        ≥ 80%
Controllers:             ≥ 90%
Services/Utils:          ≥ 85%
Middlewares:             ≥ 95%
Routes:                  ≥ 90%
```

### 5.2 Critical Paths (Must be 100%)

- Authentication & Authorization
- Payment Processing
- Order Creation
- Stock Management
- Data Validation

---

## 6. TEST EXECUTION PLAN

### 6.1 Development Phase

```bash
# Run unit tests during development
npm run test:watch

# Run specific test file
npm test -- tests/unit/authController.test.js
```

### 6.2 Before Commit

```bash
# Run all tests
npm test

# Check coverage
npm run test:coverage
```

### 6.3 CI/CD Pipeline

```bash
# GitHub Actions will run:
1. npm test (all tests)
2. Coverage report
3. Upload to Codecov (optional)
```

---

## 7. NEXT STEPS

1. ✅ Setup Jest configuration
2. 📝 Implement Unit Tests (UC1 - UC4)
3. 🔗 Implement Integration Tests
4. 🌐 Implement E2E Tests
5. 📊 Setup Coverage Reports
6. 🚀 Integrate with GitHub Actions

---

**Ghi chú:** Mỗi test case cần:

- ✅ Arrange: Setup test data
- ✅ Act: Execute function
- ✅ Assert: Verify results
- ✅ Cleanup: Reset database/mocks
