# 🧪 Nền Tảng Kiểm Thử - Module Users/Auth

**Tệp:** `01_USERS_AUTH_MODULE.md`  
**Độ Khó:** ⭐ Dễ (Khuyến nghị đọc đầu tiên)  
**Thời Gian:** 45-60 phút  
**Cập Nhật:** 7/12/2025

---

## 📌 Tổng Quan Module

### Mục Đích

Module **Users/Auth** quản lý:

- 👤 Đăng ký người dùng (Register)
- 🔑 Đăng nhập (Login) với JWT token
- 🔐 Đặt lại mật khẩu (Password Reset)
- 👥 Quản lý hồ sơ người dùng (Profile)
- 🛡️ Xác thực & phân quyền (Role-based)

### Các Thành Phần Chính

```
Frontend (Next.js)
    ↓
API Request (HTTP POST)
    ↓
Backend (Express.js)
    ↓
Auth Controller (xử lý logic)
    ↓
Database (MySQL)
    ↓ (Response + JWT Token)
Frontend (Lưu token vào localStorage)
```

### Các File Liên Quan

- **Test File:** `backend/tests/unit/auth.logic.test.js`
- **Controller:** `backend/controllers/users.js`
- **Middleware:** `backend/middleware/auth.js`
- **Database:** `backend/prisma/schema.prisma` (User model)
- **Frontend:** `frontend-user/app/login/page.tsx`

---

## 📋 Phân Tích Yêu Cầu

### Yêu Cầu Chức Năng (FR - Functional Requirements)

| ID  | Yêu Cầu           | Mô Tả                                  | Priority      |
| --- | ----------------- | -------------------------------------- | ------------- |
| FR1 | User Registration | Tạo tài khoản mới với email & password | 🔴 Cao        |
| FR2 | User Login        | Xác thực email/password, phát hành JWT | 🔴 Cao        |
| FR3 | JWT Verification  | Kiểm tra token hợp lệ, không hết hạn   | 🔴 Cao        |
| FR4 | Get User Profile  | Lấy thông tin người dùng từ token      | 🟡 Trung Bình |
| FR5 | Update Profile    | Sửa tên, avatar, điều kiện người dùng  | 🟡 Trung Bình |
| FR6 | Password Reset    | Đặt lại mật khẩu cũ                    | 🟡 Trung Bình |
| FR7 | Logout            | Xóa token từ frontend                  | 🟢 Thấp       |

### Yêu Cầu Phi Chức Năng (NFR - Non-Functional Requirements)

| ID   | Yêu Cầu           | Mô Tả                                         | Đo Lường            |
| ---- | ----------------- | --------------------------------------------- | ------------------- |
| NFR1 | Password Security | Mã hóa password (bcrypt), không lưu plaintext | ✅ Mandatory        |
| NFR2 | Token Expiry      | JWT hết hạn sau 24 giờ                        | ~1440 phút          |
| NFR3 | Rate Limiting     | Tối đa 5 login fail trong 15 phút             | < 5/15min           |
| NFR4 | Response Time     | Login response < 500ms                        | < 500ms             |
| NFR5 | Email Unique      | Email không trùng lặp trong hệ thống          | 1 email : 1 account |

---

## 🎯 Chiến Lược Kiểm Thử

### Unit Tests (Kiểm Thử Đơn Vị)

Kiểm tra từng hàm độc lập:

```
✅ registerUser()        - Tạo user mới
✅ loginUser()           - Đăng nhập, phát JWT
✅ verifyToken()         - Kiểm tra token
✅ getUserProfile()      - Lấy profile
✅ updateProfile()       - Cập nhật thông tin
✅ resetPassword()       - Đặt lại mật khẩu
```

### Integration Tests (Kiểm Thử Tích Hợp)

Kiểm tra quy trình toàn bộ:

```
✅ Register → Login → Get Profile (Happy Path)
✅ Login with invalid credentials → Error message
✅ Expired token → Unauthorized response
```

### Test Data (Dữ Liệu Kiểm Thử)

**Tài khoản Test Có Sẵn:**

```javascript
// Valid user
const validUser = {
  email: "john@example.com",
  password: "SecurePass123!",
  name: "John Doe",
};

// Invalid emails
const invalidEmails = [
  "plainaddress", // Không có @
  "user@", // Thiếu domain
  "user@domain", // Thiếu TLD
  "user@.com", // Thiếu domain name
];

// Invalid passwords
const invalidPasswords = [
  "123456", // Quá ngắn (< 8 chars)
  "abcdefgh", // Không có số
  "12345678", // Không có chữ
];
```

---

## 🌳 Sơ Đồ Kiến Trúc (PlantUML)

### Sơ Đồ Quy Trình Đăng Ký (Register Flow)

```
@startuml
actor User
participant "Frontend\n(UI)" as Frontend
participant "API\n(Backend)" as Backend
database "Database\n(MySQL)" as DB

User -> Frontend: Enter email, password
activate Frontend
Frontend -> Backend: POST /auth/register\n{email, password, name}
activate Backend

Backend -> Backend: Validate input\n(email format, password strength)
alt Validation Failed
  Backend --> Frontend: 400 Bad Request
  Frontend --> User: Show error message
else Validation Passed
  Backend -> Backend: Hash password (bcrypt)
  Backend -> DB: INSERT User\n(email, hashed_password)
  activate DB
  alt Email already exists
    DB --> Backend: Error: Duplicate email
    Backend --> Frontend: 409 Conflict
    Frontend --> User: Email already registered
  else Success
    DB --> Backend: User created (id, email)
    Backend -> Backend: Generate JWT token
    Backend --> Frontend: 201 Created + Token
    deactivate DB
    Frontend --> User: Redirect to dashboard\nSave token to localStorage
  end
end
deactivate Backend
deactivate Frontend
@enduml
```

### Sơ Đồ Quy Trình Đăng Nhập (Login Flow)

```
@startuml
actor User
participant "Frontend" as Frontend
participant "Backend" as Backend
database "Database" as DB

User -> Frontend: Enter email, password
activate Frontend
Frontend -> Backend: POST /auth/login\n{email, password}
activate Backend

Backend -> DB: SELECT * FROM User\nWHERE email = ?
activate DB
alt User not found
  DB --> Backend: null
  Backend --> Frontend: 401 Unauthorized
  Frontend --> User: Email or password incorrect
else User found
  DB --> Backend: User {id, email, password_hash}
  Backend -> Backend: Compare password\nbcrypt.compare(input, stored)
  alt Password matches
    Backend -> Backend: Create JWT token\n(payload: id, email, role)
    Backend --> Frontend: 200 OK + Token
    Frontend --> User: Redirect to dashboard\nSave token
  else Password incorrect
    Backend --> Frontend: 401 Unauthorized
    Frontend --> User: Email or password incorrect
  end
end
deactivate DB
deactivate Backend
deactivate Frontend
@enduml
```

### Sơ Đồ Kiến Trúc Dữ Liệu (Database)

```
@startuml
entity User {
  id : int (PK)
  --
  email : string (UNIQUE)
  password : string (hashed)
  name : string
  avatar : string (nullable)
  role : enum [USER, ADMIN]
  isActive : boolean
  createdAt : timestamp
  updatedAt : timestamp
}

entity UserSession {
  id : int (PK)
  --
  userId : int (FK)
  token : string
  expiresAt : timestamp
  createdAt : timestamp
}

User ||--o{ UserSession : has
@enduml
```

---

## 🧪 Thiết Kế Kiểm Thử

### Test Cases Chi Tiết

#### **TC1: Đăng Ký Người Dùng Mới (Happy Path)**

| Mục                 | Chi Tiết                                                                              |
| ------------------- | ------------------------------------------------------------------------------------- |
| **ID**              | TC-AUTH-001                                                                           |
| **Tên**             | Đăng ký user mới thành công                                                           |
| **Điều Kiện Trước** | Database trống hoặc email chưa tồn tại                                                |
| **Bước Thực Hiện**  | 1. POST /auth/register với email=john@example.com, password=SecurePass123!, name=John |
| **Kết Quả Kỳ Vọng** | ✅ Status 201, Response có JWT token, User được lưu vào DB                            |
| **Data**            | Valid email, 8+ chars password, non-empty name                                        |

#### **TC2: Đăng Ký Email Trùng Lặp**

| Mục                 | Chi Tiết                                                       |
| ------------------- | -------------------------------------------------------------- |
| **ID**              | TC-AUTH-002                                                    |
| **Tên**             | Đăng ký với email đã tồn tại → Error                           |
| **Điều Kiện Trước** | User john@example.com đã tồn tại trong DB                      |
| **Bước Thực Hiện**  | 1. POST /auth/register với email=john@example.com (đã tồn tại) |
| **Kết Quả Kỳ Vọng** | ❌ Status 409 Conflict, Message: "Email already registered"    |
| **Data**            | Email: john@example.com (đã tồn tại)                           |

#### **TC3: Đăng Ký Email Không Hợp Lệ**

| Mục                 | Chi Tiết                                       |
| ------------------- | ---------------------------------------------- |
| **ID**              | TC-AUTH-003                                    |
| **Tên**             | Đăng ký với email invalid                      |
| **Điều Kiện Trước** | N/A                                            |
| **Bước Thực Hiện**  | 1. POST /auth/register với email=invalid-email |
| **Kết Quả Kỳ Vọng** | ❌ Status 400, Message: "Invalid email format" |
| **Data**            | Email không hợp lệ: plainaddress, user@, etc.  |

#### **TC4: Đăng Ký Mật Khẩu Yếu**

| Mục                 | Chi Tiết                                                         |
| ------------------- | ---------------------------------------------------------------- |
| **ID**              | TC-AUTH-004                                                      |
| **Tên**             | Đăng ký với password yếu                                         |
| **Điều Kiện Trước** | N/A                                                              |
| **Bước Thực Hiện**  | 1. POST /auth/register với password=123456 (< 8 chars)           |
| **Kết Quả Kỳ Vọng** | ❌ Status 400, Message: "Password must be at least 8 characters" |
| **Data**            | Weak passwords: 123456, abcdefgh, 12345678                       |

#### **TC5: Đăng Nhập Thành Công**

| Mục                 | Chi Tiết                                                                |
| ------------------- | ----------------------------------------------------------------------- |
| **ID**              | TC-AUTH-005                                                             |
| **Tên**             | Đăng nhập với email/password đúng                                       |
| **Điều Kiện Trước** | User john@example.com tồn tại, password=SecurePass123!                  |
| **Bước Thực Hiện**  | 1. POST /auth/login với email=john@example.com, password=SecurePass123! |
| **Kết Quả Kỳ Vọng** | ✅ Status 200, Response có JWT token, Token có user info                |
| **Data**            | Valid credentials                                                       |

#### **TC6: Đăng Nhập Email Không Tồn Tại**

| Mục                 | Chi Tiết                                              |
| ------------------- | ----------------------------------------------------- |
| **ID**              | TC-AUTH-006                                           |
| **Tên**             | Đăng nhập với email không tồn tại                     |
| **Điều Kiện Trước** | Email invalid@example.com không tồn tại               |
| **Bước Thực Hiện**  | 1. POST /auth/login với email=invalid@example.com     |
| **Kết Quả Kỳ Vọng** | ❌ Status 401, Message: "Email or password incorrect" |
| **Data**            | Non-existent email                                    |

#### **TC7: Đăng Nhập Mật Khẩu Sai**

| Mục                 | Chi Tiết                                              |
| ------------------- | ----------------------------------------------------- |
| **ID**              | TC-AUTH-007                                           |
| **Tên**             | Đăng nhập mật khẩu sai                                |
| **Điều Kiện Trước** | User john@example.com tồn tại                         |
| **Bước Thực Hiện**  | 1. POST /auth/login với password=WrongPassword123!    |
| **Kết Quả Kỳ Vọng** | ❌ Status 401, Message: "Email or password incorrect" |
| **Data**            | Wrong password                                        |

#### **TC8: Kiểm Tra Token Hợp Lệ**

| Mục                 | Chi Tiết                                                     |
| ------------------- | ------------------------------------------------------------ |
| **ID**              | TC-AUTH-008                                                  |
| **Tên**             | Gửi request với JWT token hợp lệ                             |
| **Điều Kiện Trước** | Có JWT token từ login, token chưa hết hạn                    |
| **Bước Thực Hiện**  | 1. GET /api/profile với header Authorization: Bearer {token} |
| **Kết Quả Kỳ Vọng** | ✅ Status 200, Trả về user profile                           |
| **Data**            | Valid JWT token                                              |

#### **TC9: Token Hết Hạn**

| Mục                 | Chi Tiết                                                             |
| ------------------- | -------------------------------------------------------------------- |
| **ID**              | TC-AUTH-009                                                          |
| **Tên**             | Gửi request với expired token                                        |
| **Điều Kiện Trước** | JWT token đã hết hạn (> 24 giờ)                                      |
| **Bước Thực Hiện**  | 1. GET /api/profile với header Authorization: Bearer {expired_token} |
| **Kết Quả Kỳ Vọng** | ❌ Status 401, Message: "Token expired"                              |
| **Data**            | Expired JWT token                                                    |

#### **TC10: Token Không Hợp Lệ**

| Mục                 | Chi Tiết                                                               |
| ------------------- | ---------------------------------------------------------------------- |
| **ID**              | TC-AUTH-010                                                            |
| **Tên**             | Gửi request với token không hợp lệ                                     |
| **Điều Kiện Trước** | N/A                                                                    |
| **Bước Thực Hiện**  | 1. GET /api/profile với header Authorization: Bearer invalid.token.123 |
| **Kết Quả Kỳ Vọng** | ❌ Status 401, Message: "Invalid token"                                |
| **Data**            | Malformed JWT token                                                    |

---

## 📝 Các Trường Hợp Kiểm Thử Lỗi (Error Cases)

### Sai Định Dạng Input

```javascript
// Missing fields
{
  // Thiếu email
  password: "SecurePass123!"
}

// Invalid email
{
  email: "not-an-email",
  password: "SecurePass123!"
}

// Weak password
{
  email: "john@example.com",
  password: "123"  // Quá ngắn
}
```

### Lỗi Server

```javascript
// Database connection error
// Expected: 500 Internal Server Error

// Token generation failed
// Expected: 500 Internal Server Error

// Password hashing failed
// Expected: 500 Internal Server Error
```

---

## 💻 Ví Dụ Code (Từ Project Thực Tế)

### File Test Thực Tế: `backend/tests/unit/auth.logic.test.js`

```javascript
// ============================================
// 1. TEST REGISTRATION
// ============================================

describe("User Registration", () => {
  test("should register a new user with valid credentials", async () => {
    const newUser = {
      email: "newuser@example.com",
      password: "SecurePass123!",
      name: "New User",
    };

    const response = await authService.register(newUser);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("token");
    expect(response.data.user.email).toBe(newUser.email);
  });

  test("should reject duplicate email", async () => {
    const existingUser = {
      email: "john@example.com",
      password: "SecurePass123!",
      name: "John",
    };

    // Register first time
    await authService.register(existingUser);

    // Try register again with same email
    const response = await authService.register(existingUser);

    expect(response.status).toBe(409);
    expect(response.error).toContain("already registered");
  });

  test("should reject invalid email format", async () => {
    const invalidUser = {
      email: "invalid-email",
      password: "SecurePass123!",
      name: "User",
    };

    const response = await authService.register(invalidUser);

    expect(response.status).toBe(400);
    expect(response.error).toContain("Invalid email");
  });

  test("should reject weak password", async () => {
    const weakPasswordUser = {
      email: "test@example.com",
      password: "123456", // < 8 chars
      name: "User",
    };

    const response = await authService.register(weakPasswordUser);

    expect(response.status).toBe(400);
    expect(response.error).toContain("Password must be");
  });
});

// ============================================
// 2. TEST LOGIN
// ============================================

describe("User Login", () => {
  test("should login successfully with valid credentials", async () => {
    const user = {
      email: "john@example.com",
      password: "SecurePass123!",
    };

    const response = await authService.login(user);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("token");
    expect(response.data.token).toMatch(/^eyJ/); // JWT format
  });

  test("should return 401 for non-existent email", async () => {
    const response = await authService.login({
      email: "nonexistent@example.com",
      password: "SomePassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.error).toContain("Email or password incorrect");
  });

  test("should return 401 for incorrect password", async () => {
    const response = await authService.login({
      email: "john@example.com",
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.error).toContain("Email or password incorrect");
  });
});

// ============================================
// 3. TEST TOKEN VERIFICATION
// ============================================

describe("JWT Token Verification", () => {
  let validToken;

  beforeAll(async () => {
    // Login để lấy valid token
    const loginResponse = await authService.login({
      email: "john@example.com",
      password: "SecurePass123!",
    });
    validToken = loginResponse.data.token;
  });

  test("should verify valid token", async () => {
    const result = await authService.verifyToken(validToken);

    expect(result.valid).toBe(true);
    expect(result.payload).toHaveProperty("id");
    expect(result.payload).toHaveProperty("email");
  });

  test("should reject expired token", async () => {
    // Tạo token hết hạn
    const expiredToken = jwt.sign(
      { id: 1, email: "test@example.com" },
      process.env.JWT_SECRET,
      { expiresIn: "-1h" } // Negative = expired
    );

    const result = await authService.verifyToken(expiredToken);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  test("should reject invalid token", async () => {
    const result = await authService.verifyToken("invalid.token.format");

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid");
  });
});

// ============================================
// 4. TEST GET PROFILE
// ============================================

describe("Get User Profile", () => {
  test("should return user profile with valid token", async () => {
    const loginResponse = await authService.login({
      email: "john@example.com",
      password: "SecurePass123!",
    });

    const profileResponse = await authService.getProfile(
      loginResponse.data.token
    );

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.data).toHaveProperty("id");
    expect(profileResponse.data).toHaveProperty("email");
    expect(profileResponse.data).toHaveProperty("name");
  });

  test("should return 401 without token", async () => {
    const response = await authService.getProfile(null);

    expect(response.status).toBe(401);
  });
});
```

### Cách Viết Test (Mẫu)

```javascript
// =============================================
// TEMPLATE: Cách Viết Test Unit
// =============================================

describe("Module Name", () => {
  // Setup: Chạy trước mỗi test
  beforeEach(() => {
    // Khởi tạo dữ liệu test
  });

  // Teardown: Chạy sau mỗi test
  afterEach(() => {
    // Dọn dẹp dữ liệu test
  });

  // Test case: Happy path (thành công)
  test("should [action] when [condition]", async () => {
    // Arrange: Chuẩn bị dữ liệu
    const input = { email: "test@example.com", password: "Pass123!" };

    // Act: Thực hiện hành động
    const result = await functionUnderTest(input);

    // Assert: Kiểm tra kết quả
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty("token");
  });

  // Test case: Error case
  test("should return [error] when [condition]", async () => {
    const input = { email: "invalid", password: "123" };

    const result = await functionUnderTest(input);

    expect(result.status).toBe(400);
    expect(result.error).toContain("Invalid");
  });
});
```

---

## 🛠️ Hướng Dẫn Thực Thi

### Cách Chạy Tests Cho Module Auth

```bash
# 1. Vào thư mục backend
cd backend

# 2. Cài đặt dependencies (nếu chưa)
npm install

# 3. Thiết lập test database
npm run test:setup

# 4. Chạy tests cho Auth module
npm test -- auth.logic.test.js

# 5. Xem kết quả
# Output sẽ hiển thị:
# ✓ User Registration (4 tests)
# ✓ User Login (3 tests)
# ✓ Token Verification (3 tests)
# ✓ Get Profile (2 tests)
# Total: 12 tests passed
```

### Lệnh Chi Tiết

```bash
# Chạy test với output chi tiết
npm test -- auth.logic.test.js --verbose

# Chạy test với coverage
npm test -- auth.logic.test.js --coverage

# Chạy test & watch mode (tự động khi sửa)
npm test -- auth.logic.test.js --watch

# Chạy test cụ thể bằng tên
npm test -- --testNamePattern="should login successfully"

# Chạy test debug mode
node --inspect-brk ./node_modules/jest/bin/jest.js auth.logic.test.js
```

### Output Kỳ Vọng

```
PASS  tests/unit/auth.logic.test.js

  User Registration
    ✓ should register a new user (45ms)
    ✓ should reject duplicate email (32ms)
    ✓ should reject invalid email (28ms)
    ✓ should reject weak password (25ms)

  User Login
    ✓ should login successfully (38ms)
    ✓ should return 401 for non-existent email (35ms)
    ✓ should return 401 for incorrect password (33ms)

  JWT Token Verification
    ✓ should verify valid token (22ms)
    ✓ should reject expired token (18ms)
    ✓ should reject invalid token (20ms)

  Get User Profile
    ✓ should return user profile (40ms)
    ✓ should return 401 without token (15ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Time:        2.345 s
```

---

## 🐛 Gỡ Lỗi & Vấn Đề Thường Gặp

### Vấn Đề 1: "Test Timeout"

```
Error: Timeout - Async callback was not invoked within 5000ms
```

**Nguyên Nhân:**

- Database chưa setup
- JWT secret không được cấu hình
- Network không kết nối được DB

**Cách Khắc Phục:**

```bash
# 1. Setup database
npm run test:setup

# 2. Kiểm tra .env file có JWT_SECRET?
cat .env

# 3. Chạy lại test
npm test -- auth.logic.test.js
```

### Vấn Đề 2: "Password Hashing Failed"

```
Error: bcrypt hash error
```

**Nguyên Nhân:**

- bcrypt package không được cài
- Password quá dài (> 72 chars)

**Cách Khắc Phục:**

```bash
# Cài bcrypt
npm install bcrypt

# Hoặc kiểm tra password không quá 72 chars
```

### Vấn Đề 3: "JWT Token Not Generated"

```
Error: Cannot read property 'token' of undefined
```

**Nguyên Nhân:**

- JWT_SECRET environment variable không được set
- jsonwebtoken package chưa cài

**Cách Khắc Phục:**

```bash
# Kiểm tra .env
echo $JWT_SECRET

# Hoặc set JWT_SECRET
export JWT_SECRET="your-secret-key"

# Cài jsonwebtoken
npm install jsonwebtoken
```

### Vấn Đề 4: "Database Connection Error"

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Nguyên Nhân:**

- MySQL docker container không chạy
- Database URL sai trong .env

**Cách Khắc Phục:**

```bash
# Start Docker containers
docker compose up -d

# Kiểm tra database URL trong .env
cat .env | grep DATABASE_URL

# Test kết nối database
npm run test:setup
```

### Vấn Đề 5: Test Fail Với "Duplicate Email"

```
FAIL tests/unit/auth.logic.test.js
  ✕ should reject duplicate email (45ms)

Expected: 409
Received: 201
```

**Nguyên Nhân:**

- Test trước đó không dọn dẹp dữ liệu
- Email test không bị xóa

**Cách Khắc Phục:**

```javascript
// Thêm afterEach vào test file
afterEach(async () => {
  // Xóa tất cả users test
  await User.deleteMany({});
});

// Hoặc reset database
npm run test:setup
```

### Debugging Tips

```javascript
// 1. Thêm console.log để xem giá trị
console.log("Token:", response.data.token);

// 2. Sử dụng .only để chạy test cụ thể
test.only("should login successfully", async () => {
  // Test này chạy riêng
});

// 3. Sử dụng .skip để bỏ qua test
test.skip("should reject expired token", async () => {
  // Test này bị bỏ qua
});

// 4. Sử dụng debug mode
// npm test -- --inspect-brk auth.logic.test.js
// Sau đó mở DevTools: chrome://inspect
```

---

## 🔗 Liên Kết Tệp Liên Quan

### Tệp Test Thực Tế

- 📄 `backend/tests/unit/auth.logic.test.js` - Unit tests để reference

### Code Chính (Backend)

- 📄 `backend/controllers/users.js` - Register, login, get profile logic
- 📄 `backend/middleware/auth.js` - JWT verification middleware
- 📄 `backend/routes/auth.js` - Auth API routes

### Database

- 📄 `backend/prisma/schema.prisma` - User model definition
- 📄 `backend/prisma/migrations/` - Database schema versions

### Frontend

- 📄 `frontend-user/app/login/page.tsx` - Login UI
- 📄 `frontend-user/app/register/page.tsx` - Register UI
- 📄 `frontend-user/lib/auth.ts` - Frontend auth utilities

### Tài Liệu Liên Quan

- 📖 `docs/testing/reference/TEST_PLAN.md` - Chi tiết test plan
- 📖 `docs/testing/reference/TEST_BEST_PRACTICES.md` - Best practices viết tests
- 📖 `docs/architecture/UC_ANALYSIS.md` - Use case analysis (UC1)

---

## 📖 Tham Khảo Thêm

### JWT (JSON Web Token)

- **Cấu trúc:** `header.payload.signature`
- **Hạn sử dụng:** Thường 24 giờ
- **Không lưu mật khẩu:** Chỉ lưu user ID & role

### bcrypt Password Hashing

- **Độ an toàn:** Salt rounds = 10
- **Thời gian:** ~100ms per hash
- **Không thể đảo ngược:** One-way encryption

### HTTP Status Codes

- `200 OK` - Thành công
- `201 Created` - Tạo thành công
- `400 Bad Request` - Input không hợp lệ
- `401 Unauthorized` - Chưa xác thực
- `409 Conflict` - Email trùng lặp
- `500 Server Error` - Lỗi server

---

## ✅ Mục Tiêu Sau Khi Hoàn Thành

Sau khi đọc & thực hành module này, bạn sẽ:

✅ Hiểu cách kiểm thử feature login/register  
✅ Biết cách viết unit tests với Jest  
✅ Hiểu JWT token & password hashing  
✅ Có thể chạy tests & gỡ lỗi  
✅ Có thể viết tests cho module khác

---

## 📞 Cần Giúp Đỡ?

- **Test fail?** → Xem "Gỡ Lỗi & Vấn Đề Thường Gặp"
- **Không hiểu JWT?** → Xem "Tham Khảo Thêm"
- **Cần chạy tests?** → Xem "Hướng Dẫn Thực Thi"
- **Muốn xem code?** → Xem "Liên Kết Tệp Liên Quan"

---

**Module Hoàn Thành:** ✅  
**Tiếp Tục:** 02_PRODUCTS_MODULE.md
