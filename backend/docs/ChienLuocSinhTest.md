# CHIẾN LƯỢC & LỸ THUẬT SINH TEST CASES

> **Mục đích:** Giải thích các kỹ thuật, phương pháp và quy trình để sinh ra test cases hiệu quả

---

## 📚 MỤC LỤC

1. [Các Kỹ Thuật Test Cơ Bản](#1-các-kỹ-thuật-test-cơ-bản)
2. [Phương Pháp Phân Tích Yêu Cầu](#2-phương-pháp-phân-tích-yêu-cầu)
3. [Áp Dụng Vào Project](#3-áp-dụng-vào-project)
4. [Ví Dụ Cụ Thể](#4-ví-dụ-cụ-thể)

---

## 1. CÁC KỸ THUẬT TEST CƠ BẢN

### 1.1 Equivalence Partitioning (Phân vùng tương đương)

**Lý thuyết:**

- Chia input thành các nhóm có **cùng hành vi**
- Chọn **1 giá trị đại diện** cho mỗi nhóm
- Giảm số lượng test cases nhưng vẫn đảm bảo độ bao phủ

**Ví dụ:** Đăng ký user với email

```
Input: Email
Phân vùng:
├── Valid emails:     "user@example.com", "test123@gmail.com"
├── Invalid format:   "notanemail", "missing@", "@nodomain.com"
└── Empty/null:       "", null, undefined

Test cases (chọn 1 đại diện/nhóm):
✅ TC1: email = "valid@example.com"     → Expect: Success
❌ TC2: email = "invalid-format"        → Expect: Error 400
❌ TC3: email = ""                      → Expect: Error 400
```

---

### 1.2 Boundary Value Analysis (Phân tích giá trị biên)

**Lý thuyết:**

- Test các giá trị **tại biên** và **gần biên**
- Lỗi thường xuất hiện tại **ranh giới** của các điều kiện

**Ví dụ:** Password length (min: 6, max: 50 ký tự)

```
Boundary values:
├── Below min:    5 characters   ❌
├── At min:       6 characters   ✅
├── Above min:    7 characters   ✅
├── Below max:    49 characters  ✅
├── At max:       50 characters  ✅
└── Above max:    51 characters  ❌

Test cases:
TC1: password = "12345"      (5 chars)  → Error 400
TC2: password = "123456"     (6 chars)  → Success
TC3: password = "1234567"    (7 chars)  → Success
TC4: password = "a"*49       (49 chars) → Success
TC5: password = "a"*50       (50 chars) → Success
TC6: password = "a"*51       (51 chars) → Error 400
```

**Áp dụng vào Auth Controller:**

```javascript
describe("Auth - Password Length Boundary", () => {
  test("UC1.5a: Password 5 ký tự (dưới min)", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "12345" });
    expect(response.status).toBe(400);
  });

  test("UC1.5b: Password 6 ký tự (tại min)", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "123456" });
    expect(response.status).toBe(201);
  });

  test("UC1.5c: Password 51 ký tự (trên max)", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "a".repeat(51) });
    expect(response.status).toBe(400);
  });
});
```

---

### 1.3 Decision Table Testing (Bảng quyết định)

**Lý thuyết:**

- Test **tổ hợp các điều kiện** logic
- Đảm bảo tất cả **nhánh logic** được test

**Ví dụ:** Đăng nhập user

```
Conditions:
├── Email exists?         (Yes/No)
├── Password correct?     (Yes/No)
└── Account active?       (Yes/No)

Decision Table:
┌────────────────┬──────────┬──────────┬───────────┬────────────┐
│ Test Case      │ Email    │ Password │ Active    │ Result     │
├────────────────┼──────────┼──────────┼───────────┼────────────┤
│ TC1 (Success)  │ Yes      │ Correct  │ Yes       │ Login OK   │
│ TC2            │ No       │ -        │ -         │ Error 401  │
│ TC3            │ Yes      │ Wrong    │ -         │ Error 401  │
│ TC4            │ Yes      │ Correct  │ No        │ Error 403  │
└────────────────┴──────────┴──────────┴───────────┴────────────┘
```

**Code implementation:**

```javascript
describe("Auth - Login Decision Table", () => {
  beforeEach(async () => {
    // Setup: Create test users
    await User.create({
      email: "active@example.com",
      password: await bcrypt.hash("correct123", 10),
      isActive: true,
    });
    await User.create({
      email: "inactive@example.com",
      password: await bcrypt.hash("correct123", 10),
      isActive: false,
    });
  });

  test("TC1: Email exists + Password correct + Active → Success", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "active@example.com", password: "correct123" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("TC2: Email not exists → Error 401", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "anything" });
    expect(response.status).toBe(401);
  });

  test("TC3: Email exists + Password wrong → Error 401", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "active@example.com", password: "wrongpass" });
    expect(response.status).toBe(401);
  });

  test("TC4: Email exists + Password correct + Inactive → Error 403", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "inactive@example.com", password: "correct123" });
    expect(response.status).toBe(403);
    expect(response.body.message).toContain("Account is inactive");
  });
});
```

---

### 1.4 State Transition Testing (Kiểm thử chuyển trạng thái)

**Lý thuyết:**

- Test **luồng chuyển trạng thái** của hệ thống
- Đảm bảo **tất cả transitions hợp lệ** và **từ chối transitions không hợp lệ**

**Ví dụ:** Order Status Lifecycle

```
States:
PENDING → CONFIRMED → SHIPPING → DELIVERED
           ↓
        CANCELLED

Valid transitions:
PENDING → CONFIRMED     ✅
PENDING → CANCELLED     ✅
CONFIRMED → SHIPPING    ✅
CONFIRMED → CANCELLED   ✅
SHIPPING → DELIVERED    ✅
SHIPPING → CANCELLED    ❌ (Not allowed)
DELIVERED → CANCELLED   ❌ (Not allowed)

Test cases:
TC1: PENDING → CONFIRMED        → Success
TC2: PENDING → CANCELLED        → Success
TC3: CONFIRMED → SHIPPING       → Success
TC4: SHIPPING → DELIVERED       → Success
TC5: SHIPPING → CANCELLED       → Error 400
TC6: DELIVERED → CANCELLED      → Error 400
```

**Code implementation:**

```javascript
describe("Order - State Transition Testing", () => {
  let order;

  beforeEach(async () => {
    order = await Order.create({
      userId: 1,
      total: 100000,
      status: "PENDING",
    });
  });

  test("TC1: PENDING → CONFIRMED (Valid)", async () => {
    const response = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .send({ status: "CONFIRMED" });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("CONFIRMED");
  });

  test("TC2: PENDING → CANCELLED (Valid)", async () => {
    const response = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .send({ status: "CANCELLED" });
    expect(response.status).toBe(200);
  });

  test("TC5: SHIPPING → CANCELLED (Invalid)", async () => {
    await order.update({ status: "SHIPPING" });
    const response = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .send({ status: "CANCELLED" });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Cannot cancel order in shipping");
  });

  test("TC6: DELIVERED → CANCELLED (Invalid)", async () => {
    await order.update({ status: "DELIVERED" });
    const response = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .send({ status: "CANCELLED" });
    expect(response.status).toBe(400);
  });
});
```

---

### 1.5 Error Guessing (Dự đoán lỗi)

**Lý thuyết:**

- Dựa vào **kinh nghiệm** và **suy luận** để tìm lỗi
- Test các **trường hợp bất thường** mà user có thể gặp

**Ví dụ:** Add to Cart

```
Các lỗi có thể xảy ra:
├── Product không tồn tại
├── Product đã bị xóa (soft delete)
├── Variant out of stock
├── Số lượng <= 0
├── Số lượng > stock
├── User chưa đăng nhập
├── Product của chính merchant (không thể tự mua)
└── Duplicate cart item (thêm 2 lần cùng lúc)

Test cases:
TC1: Add product không tồn tại      → Error 404
TC2: Add product đã xóa             → Error 410
TC3: Add với quantity = 0           → Error 400
TC4: Add với quantity > stock       → Error 400
TC5: Add without authentication     → Error 401
TC6: Merchant tự add product        → Error 403
TC7: Duplicate simultaneous add     → Handle race condition
```

---

## 2. PHƯƠNG PHÁP PHÂN TÍCH YÊU CẦU

### 2.1 Từ User Story đến Test Cases

**Bước 1: Phân tích User Story**

```
User Story (UC1):
"Là người dùng, tôi muốn đăng ký tài khoản để có thể mua hàng"

Acceptance Criteria:
✅ User nhập email, password, name, phone
✅ Email phải unique
✅ Password >= 6 ký tự
✅ Hệ thống tạo tài khoản và trả về JWT token
✅ Gửi email xác nhận (optional)
```

**Bước 2: Áp dụng kỹ thuật**

```
1. Equivalence Partitioning:
   - Valid inputs
   - Invalid inputs (missing fields, wrong format)
   - Edge cases (empty, null)

2. Boundary Value Analysis:
   - Password: min=6, max=50

3. Decision Table:
   - Email unique? Password valid? Name valid?

4. Error Guessing:
   - SQL injection trong email
   - XSS trong name
   - Concurrent registration với cùng email
```

**Bước 3: Sinh Test Cases**

```javascript
// Từ phân tích trên → sinh ra:
describe("UC1: User Registration", () => {
  // Happy path
  test("UC1.1: Đăng ký thành công với thông tin hợp lệ");

  // Equivalence Partitioning - Invalid inputs
  test("UC1.2: Email đã tồn tại → Error 409");
  test("UC1.3: Thiếu email → Error 400");
  test("UC1.4: Email không hợp lệ → Error 400");

  // Boundary Value Analysis
  test("UC1.5: Password 5 ký tự → Error 400");
  test("UC1.6: Password 6 ký tự → Success");
  test("UC1.7: Password 51 ký tự → Error 400");

  // Error Guessing
  test("UC1.8: Email chứa SQL injection → Sanitized");
  test("UC1.9: Name chứa XSS → Sanitized");
  test("UC1.10: Concurrent registration → Chỉ 1 thành công");
});
```

---

### 2.2 Từ API Endpoint đến Test Cases

**Phân tích API:**

```
POST /api/auth/register
Request body:
{
  email: string (required, unique, valid email format),
  password: string (required, 6-50 chars),
  name: string (required, 2-100 chars),
  phone: string (optional, valid phone format)
}

Responses:
201 Created: { token, user }
400 Bad Request: Validation errors
409 Conflict: Email already exists
500 Server Error: Database error
```

**Sinh Test Cases từ spec:**

```javascript
describe("POST /api/auth/register", () => {
  // Test mỗi response code
  test("Returns 201 when valid data provided");
  test("Returns 400 when email missing");
  test("Returns 400 when email invalid format");
  test("Returns 400 when password < 6 chars");
  test("Returns 409 when email already exists");

  // Test mỗi field trong request
  test("Validates email format");
  test("Validates password length");
  test("Validates name presence");
  test("Phone is optional");

  // Test response body
  test("Returns JWT token in response");
  test("Returns user object without password");
});
```

---

## 3. ÁP DỤNG VÀO PROJECT

### 3.1 Quy Trình Sinh Test Cases

```
Step 1: Đọc Requirements/User Stories
   ↓
Step 2: Phân tích API endpoints + Database schema
   ↓
Step 3: Áp dụng kỹ thuật testing
   ├── Equivalence Partitioning
   ├── Boundary Value Analysis
   ├── Decision Table
   ├── State Transition
   └── Error Guessing
   ↓
Step 4: Viết test cases theo template
   ↓
Step 5: Implement tests với Jest + Supertest
   ↓
Step 6: Run tests + Coverage report
```

---

### 3.2 Template Sinh Test Cases

```markdown
## Module: [Tên Module]

### Endpoint: [Method] [URL]

#### Input Analysis:

- **Required fields:** field1, field2
- **Optional fields:** field3
- **Validation rules:**
  - field1: min=X, max=Y, format=Z
  - field2: enum=[A, B, C]

#### Equivalence Partitions:

1. Valid inputs: ...
2. Invalid inputs: ...
3. Edge cases: ...

#### Boundary Values:

- Field1: [min-1, min, min+1, max-1, max, max+1]

#### Decision Table:

| Condition1 | Condition2 | Result |
| ---------- | ---------- | ------ |
| ...        | ...        | ...    |

#### Test Cases:

- TC1: Happy path
- TC2: Missing required field
- TC3: Invalid format
- TC4: Boundary values
- TC5: Error scenarios
```

---

## 4. VÍ DỤ CỤ THỂ: PRODUCT SEARCH

### 4.1 Phân Tích Yêu Cầu

```
Feature: Tìm kiếm sản phẩm
Endpoint: GET /api/products/search?q=keyword&category=id&minPrice=X&maxPrice=Y

Query Parameters:
- q (search keyword): string, optional
- category: integer, optional
- minPrice: number, optional, >= 0
- maxPrice: number, optional, >= minPrice
- sortBy: enum[price, createdAt, rating], default=createdAt
- order: enum[asc, desc], default=desc
- page: integer, >= 1, default=1
- limit: integer, 1-100, default=20
```

### 4.2 Áp Dụng Kỹ Thuật

**1. Equivalence Partitioning:**

```
Search keyword (q):
├── Valid: "laptop", "điện thoại", "MacBook Pro"
├── Empty: "", null, undefined → return all products
├── No results: "xyzabc123" → return []
└── Special chars: "<script>", "'; DROP TABLE--" → sanitized

Category:
├── Valid: 1, 2, 3 (existing IDs)
├── Invalid: 999 (non-existent) → return []
└── Invalid format: "abc", null → ignore or error

Price range:
├── Valid: minPrice=100000, maxPrice=500000
├── Invalid: minPrice > maxPrice → error
├── Negative: minPrice=-100 → error
└── Both missing → no filter
```

**2. Boundary Value Analysis:**

```
Price (giả sử range 0 - 100,000,000):
├── minPrice: [-1, 0, 1, 99999999, 100000000, 100000001]
└── maxPrice: [-1, 0, 1, 99999999, 100000000, 100000001]

Limit (range 1-100):
├── [0, 1, 2, 99, 100, 101]
```

**3. Decision Table:**

```
┌─────┬────────┬──────────┬───────────┬────────────┬────────────┐
│ TC  │ Keyword│ Category │ Price     │ Sort       │ Expected   │
├─────┼────────┼──────────┼───────────┼────────────┼────────────┤
│ 1   │ Valid  │ Valid    │ Valid     │ Valid      │ Results    │
│ 2   │ Empty  │ -        │ -         │ -          │ All items  │
│ 3   │ Valid  │ Invalid  │ -         │ -          │ Empty []   │
│ 4   │ -      │ -        │ Min>Max   │ -          │ Error 400  │
│ 5   │ -      │ -        │ -         │ Invalid    │ Default    │
└─────┴────────┴──────────┴───────────┴────────────┴────────────┘
```

### 4.3 Implement Tests

```javascript
describe("Product Search - Equivalence Partitioning", () => {
  test("UC1.28a: Tìm với keyword hợp lệ", async () => {
    const response = await request(app).get("/api/products/search?q=laptop");
    expect(response.status).toBe(200);
    expect(response.body.products).toBeInstanceOf(Array);
    expect(
      response.body.products.every((p) =>
        p.name.toLowerCase().includes("laptop")
      )
    ).toBe(true);
  });

  test("UC1.28b: Tìm với keyword rỗng → trả về tất cả", async () => {
    const response = await request(app).get("/api/products/search?q=");
    expect(response.status).toBe(200);
    expect(response.body.total).toBeGreaterThan(0);
  });

  test("UC1.28c: Keyword không tìm thấy → array rỗng", async () => {
    const response = await request(app).get(
      "/api/products/search?q=nonexistentkeyword123"
    );
    expect(response.status).toBe(200);
    expect(response.body.products).toEqual([]);
    expect(response.body.total).toBe(0);
  });

  test("UC1.28d: Keyword chứa XSS → sanitized", async () => {
    const response = await request(app).get(
      '/api/products/search?q=<script>alert("xss")</script>'
    );
    expect(response.status).toBe(200);
    // Verify không execute script, chỉ search text thường
  });
});

describe("Product Search - Boundary Value Analysis", () => {
  test("UC1.30a: minPrice = -1 → Error 400", async () => {
    const response = await request(app).get("/api/products/search?minPrice=-1");
    expect(response.status).toBe(400);
  });

  test("UC1.30b: minPrice = 0 → Success", async () => {
    const response = await request(app).get("/api/products/search?minPrice=0");
    expect(response.status).toBe(200);
  });

  test("UC1.30c: limit = 0 → Error 400", async () => {
    const response = await request(app).get("/api/products/search?limit=0");
    expect(response.status).toBe(400);
  });

  test("UC1.30d: limit = 1 → Success, 1 item", async () => {
    const response = await request(app).get("/api/products/search?limit=1");
    expect(response.status).toBe(200);
    expect(response.body.products.length).toBeLessThanOrEqual(1);
  });

  test("UC1.30e: limit = 101 → Error 400", async () => {
    const response = await request(app).get("/api/products/search?limit=101");
    expect(response.status).toBe(400);
  });
});

describe("Product Search - Decision Table", () => {
  test("TC4: minPrice > maxPrice → Error 400", async () => {
    const response = await request(app).get(
      "/api/products/search?minPrice=500000&maxPrice=100000"
    );
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("minPrice cannot exceed maxPrice");
  });
});
```

---

## 5. CHECKLIST SINH TEST CASES

Khi sinh test cho một feature mới, hãy đi qua checklist này:

```
□ Happy path (flow thành công)
□ Required fields validation
  □ Missing fields
  □ Empty values
  □ Null/undefined
□ Data type validation
  □ Wrong types (string vs number)
  □ Invalid formats (email, phone, date)
□ Boundary values
  □ Min - 1
  □ Min
  □ Min + 1
  □ Max - 1
  □ Max
  □ Max + 1
□ Business rules
  □ Uniqueness constraints
  □ Foreign key references
  □ Enum values
□ Authorization
  □ Unauthenticated user
  □ Unauthorized user (wrong role)
  □ Correct permissions
□ Error scenarios
  □ Database errors
  □ Network errors
  □ Race conditions
□ Security
  □ SQL injection
  □ XSS
  □ CSRF
  □ Rate limiting
```

---

## 6. CÔNG CỤ HỖ TRỢ

### 6.1 Tạo Test Data

```javascript
// Factory pattern để tạo test data
const UserFactory = {
  create: (overrides = {}) => ({
    email: `test${Date.now()}@example.com`,
    password: "password123",
    name: "Test User",
    phone: "0123456789",
    ...overrides,
  }),
};

// Sử dụng
const validUser = UserFactory.create();
const userWithInvalidEmail = UserFactory.create({ email: "invalid" });
```

### 6.2 Helper Functions

```javascript
// Helper để test API
const testAPI = {
  register: (userData) =>
    request(app).post("/api/auth/register").send(userData),
  login: (credentials) =>
    request(app).post("/api/auth/login").send(credentials),
  getProfile: (token) =>
    request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`),
};

// Sử dụng
test("Register then login flow", async () => {
  const user = UserFactory.create();
  await testAPI.register(user);
  const loginRes = await testAPI.login({
    email: user.email,
    password: user.password,
  });
  expect(loginRes.body).toHaveProperty("token");
});
```

---

## 7. KẾT LUẬN

**Quy trình tổng quát:**

```
Requirements → Phân tích → Áp dụng kỹ thuật → Sinh test cases → Implement → Run → Report
```

**Lưu ý quan trọng:**

1. **Không cần test 100% mọi trường hợp** - focus vào critical paths
2. **Test cases phải maintainable** - dễ đọc, dễ sửa
3. **Tự động hóa tối đa** - integration với CI/CD
4. **Coverage không phải mục tiêu cuối** - quality > quantity

---

**Next Steps:**

- [ ] Đọc kỹ lý thuyết trên
- [ ] Chọn 1 module để thực hành (khuyến nghị: Auth)
- [ ] Áp dụng từng kỹ thuật để sinh test cases
- [ ] Implement tests với Jest
- [ ] Review và refactor
