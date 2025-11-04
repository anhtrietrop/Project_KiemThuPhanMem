# PHÂN TÍCH USE CASES - DỰ ÁN E-COMMERCE

> **Mục đích:** So sánh implementation hiện tại với yêu cầu Use Cases và tạo checklist verification

## 📋 TỔNG QUAN USE CASES

Dựa trên phân tích cấu trúc code, database schema và best practices e-commerce, dự án được chia thành 4 Use Cases:

### **UC1 - CORE FEATURES (Nền tảng cơ bản)**

Chức năng nền tảng để hệ thống hoạt động được

### **UC2 - SHOPPING EXPERIENCE (Trải nghiệm mua sắm)**

Các tính năng tăng trải nghiệm người dùng

### **UC3 - ORDER & PAYMENT (Đặt hàng & Thanh toán)**

Quy trình mua hàng và thanh toán

### **UC4 - ADVANCED FEATURES (Tính năng nâng cao)**

Tính năng tối ưu, bảo mật, monitoring

---

## 🎯 UC1 - CORE FEATURES (Nền tảng cơ bản)

### **1.1 User Authentication & Authorization**

#### ✅ Features đã có:

- **User Model** (`backend/prisma/schema.prisma`):
  ```prisma
  model User {
    id       String   @id @default(uuid())
    email    String   @unique
    password String?
    role     String?  @default("user")
  }
  ```
- **Auth Routes** (`backend/routes/users.js`)
- **NextAuth Integration** (`frontend-user/app/api/auth/[...nextauth]/route.ts`)
- **Role-based access** (user/admin)

#### 📝 Checklist verification:

```powershell
# 1. Kiểm tra User routes tồn tại
Select-String -Path .\backend\routes\users.js -Pattern "register|login" -SimpleMatch

# 2. Test register API
curl -X POST http://localhost:3002/api/users/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test123!","role":"user"}'

# 3. Test login (frontend)
# Mở http://localhost:3000/login và đăng nhập
```

#### ⚠️ Cần kiểm tra:

- [ ] Password hashing (bcrypt) có hoạt động không
- [ ] Session/JWT token có được tạo sau login không
- [ ] Protected routes có require authentication không

---

### **1.2 Product Management (CRUD)**

#### ✅ Features đã có:

- **Product Model** với đầy đủ fields:
  ```prisma
  model Product {
    id           String   @id @default(uuid())
    slug         String   @unique
    title        String
    mainImage    String
    price        Float?   @default(0)
    costPrice    Float?
    quantity     Int      @default(0)
    rating       Int      @default(0)
    description  String
    manufacturer String
    categoryId   String
    merchantId   String
  }
  ```
- **Product Controller** (`backend/controllers/products.js`)
- **Product Routes** (`backend/routes/products.js`)
- **Admin UI** (`frontend-admin/app/(dashboard)/products/*`)

#### 📝 Checklist verification:

```powershell
# 1. List products
curl http://localhost:3002/api/products

# 2. Get single product
curl http://localhost:3002/api/products/{product-id}

# 3. Admin: Create product (cần auth token)
# Mở http://localhost:3001/login -> login as admin
# Navigate to Products -> Add New Product
```

#### ⚠️ Cần kiểm tra:

- [ ] GET /api/products (list all)
- [ ] GET /api/products/:id (detail)
- [ ] POST /api/products (admin only)
- [ ] PUT /api/products/:id (admin only)
- [ ] DELETE /api/products/:id (admin only)

---

### **1.3 Category Management**

#### ✅ Features đã có:

- **Category Model**:
  ```prisma
  model Category {
    id       String    @id @default(uuid())
    name     String    @unique
    products Product[]
  }
  ```
- **Category Controller** (`backend/controllers/category.js`)
- **Category Routes** (`backend/routes/category.js`)

#### 📝 Checklist verification:

```powershell
# List categories
curl http://localhost:3002/api/category

# Filter products by category
curl http://localhost:3002/api/products?categoryId={category-id}
```

#### ⚠️ Cần kiểm tra:

- [ ] GET /api/category
- [ ] POST /api/category (admin)
- [ ] Products được gắn category đúng không

---

### **1.4 Product Images**

#### ✅ Features đã có:

- **Image Model**:
  ```prisma
  model Image {
    imageID   String @id @default(uuid())
    productID String
    image     String
  }
  ```
- **Product Images Controller** (`backend/controllers/productImages.js`)
- **Main Image Controller** (`backend/controllers/mainImages.js`)
- **Image Routes** (`backend/routes/productImages.js`, `backend/routes/mainImages.js`)

#### 📝 Checklist verification:

```powershell
# Get product images
curl http://localhost:3002/api/productImages/{product-id}

# Frontend: Product detail page hiển thị ảnh
# Mở http://localhost:3000/product/{slug}
```

#### ⚠️ Cần kiểm tra:

- [ ] Upload ảnh (admin) hoạt động
- [ ] Main image hiển thị trong list
- [ ] Gallery images hiển thị trong detail

---

### **1.5 Search & Filter**

#### ✅ Features đã có:

- **Search Controller** (`backend/controllers/search.js`)
- **Search Routes** (`backend/routes/search.js`)
- **Frontend Search** (`frontend-user/app/search/*`)

#### 📝 Checklist verification:

```powershell
# Search products
curl "http://localhost:3002/api/search?q=laptop"

# Frontend: Search bar
# Mở http://localhost:3000 -> nhập từ khóa vào search
```

#### ⚠️ Cần kiểm tra:

- [ ] Search by keyword
- [ ] Filter by category
- [ ] Filter by price range
- [ ] Sort by price/rating

---

### **1.6 Merchant Management**

#### ✅ Features đã có:

- **Merchant Model**:
  ```prisma
  model Merchant {
    id          String   @id @default(uuid())
    name        String
    description String?
    status      String   @default("ACTIVE")
    products    Product[]
  }
  ```
- **Merchant Controller** (`backend/controllers/merchant.js`)
- **Merchant Routes** (`backend/routes/merchant.js`)

#### 📝 Checklist verification:

```powershell
# List merchants
curl http://localhost:3002/api/merchant

# Get merchant products
curl http://localhost:3002/api/merchant/{merchant-id}/products
```

---

## 🛒 UC2 - SHOPPING EXPERIENCE

### **2.1 Shopping Cart**

#### ✅ Features đã có:

- **Cart Model**:

  ```prisma
  model Cart {
    id        String     @id @default(uuid())
    userId    String     @unique
    items     CartItem[]
  }

  model CartItem {
    id        String  @id @default(uuid())
    cartId    String
    productId String
    quantity  Int     @default(1)
  }
  ```

- **Cart Controller** (`backend/controllers/cart.js`)
- **Cart Routes** (`backend/routes/cart.js`)
- **Cart UI** (`frontend-user/app/cart/*`)

#### 📝 Checklist verification:

```powershell
# 1. Get user cart (cần login)
curl http://localhost:3002/api/cart `
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 2. Add item to cart
curl -X POST http://localhost:3002/api/cart/items `
  -H "Content-Type: application/json" `
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" `
  -d '{"productId":"xxx","quantity":2}'

# 3. Frontend test
# Login -> thêm sản phẩm vào giỏ -> mở /cart
```

#### ⚠️ Cần kiểm tra:

- [ ] GET /api/cart (user's cart)
- [ ] POST /api/cart/items (add item)
- [ ] PUT /api/cart/items/:id (update quantity)
- [ ] DELETE /api/cart/items/:id (remove item)
- [ ] Cart persist khi logout/login lại

---

### **2.2 Wishlist**

#### ✅ Features đã có:

- **Wishlist Model**:
  ```prisma
  model Wishlist {
    id        String  @id @default(uuid())
    productId String
    userId    String
  }
  ```
- **Wishlist Controller** (`backend/controllers/wishlist.js`)
- **Wishlist Routes** (`backend/routes/wishlist.js`)
- **Wishlist UI** (`frontend-user/app/wishlist/*`)

#### 📝 Checklist verification:

```powershell
# Get user wishlist
curl http://localhost:3002/api/wishlist `
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Add to wishlist
curl -X POST http://localhost:3002/api/wishlist `
  -H "Content-Type: application/json" `
  -d '{"productId":"xxx"}'
```

#### ⚠️ Cần kiểm tra:

- [ ] GET /api/wishlist
- [ ] POST /api/wishlist (add)
- [ ] DELETE /api/wishlist/:id (remove)
- [ ] Wishlist icon/button trong product card

---

### **2.3 Product Rating (nếu có)**

#### ⚠️ Cần kiểm tra:

- Database có field `Product.rating`
- Nhưng chưa thấy API endpoint để user submit rating/review
- **TODO:** Cần implement rating/review system nếu yêu cầu

---

## 📦 UC3 - ORDER & PAYMENT

### **3.1 Order Management**

#### ✅ Features đã có:

- **Customer Order Model**:
  ```prisma
  model Customer_order {
    id              String   @id @default(uuid())
    name            String
    lastname        String
    phone           String
    email           String
    adress          String
    city            String
    status          String
    payment_status  String?  @default("PENDING")
    payment_method  String?
    total           Int
    products        customer_order_product[]
  }
  ```
- **Order Controller** (`backend/controllers/customer_orders.js`)
- **Order Routes** (`backend/routes/customer_orders.js`)
- **Order UI** (`frontend-user/app/my-orders/*`, `frontend-user/app/checkout/*`)

#### 📝 Checklist verification:

```powershell
# Get user orders
curl http://localhost:3002/api/customer_orders `
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Create order
curl -X POST http://localhost:3002/api/customer_orders `
  -H "Content-Type: application/json" `
  -d '{
    "name":"John",
    "lastname":"Doe",
    "phone":"0123456789",
    "email":"john@example.com",
    "adress":"123 Street",
    "city":"HCM",
    "status":"PENDING",
    "total":500000,
    "products":[{"productId":"xxx","quantity":2}]
  }'
```

#### ⚠️ Cần kiểm tra:

- [ ] GET /api/customer_orders (user's orders)
- [ ] POST /api/customer_orders (create)
- [ ] GET /api/customer_orders/:id (detail)
- [ ] PUT /api/customer_orders/:id (update status - admin)
- [ ] Order status workflow (PENDING -> PROCESSING -> SHIPPED -> DELIVERED)

---

### **3.2 Payment Integration - MoMo**

#### ✅ Features đã có:

- **MomoPayment Model**:
  ```prisma
  model MomoPayment {
    id          String   @id @default(uuid())
    orderId     String
    requestId   String   @unique
    amount      Int
    resultCode  Int?     @default(-1)
    transId     String?
  }
  ```
- **MoMo Controller** (`backend/controllers/momoPayment.js`)
- **MoMo Routes** (`backend/routes/momoPayment.js`)
- **Security Utils** (`backend/utills/momoSecurity.js`, `backend/utills/momoValidation.js`)
- **Payment UI** (`frontend-user/app/payment/*`)

#### 📝 Checklist verification:

```powershell
# Create payment request
curl -X POST http://localhost:3002/api/momo/create-payment `
  -H "Content-Type: application/json" `
  -d '{
    "orderId":"order-123",
    "amount":500000,
    "orderInfo":"Payment for order #123"
  }'

# Check payment status
curl http://localhost:3002/api/momo/check-status/{requestId}
```

#### ⚠️ Cần kiểm tra:

- [ ] POST /api/momo/create-payment
- [ ] POST /api/momo/callback (IPN từ MoMo)
- [ ] GET /api/momo/check-status/:requestId
- [ ] Payment redirect flow hoạt động
- [ ] **QUAN TRỌNG:** Có MoMo Partner Code và Secret Key trong .env chưa

---

### **3.3 Order State Machine**

#### ✅ Features đã có:

- **PlantUML Diagram** (`docs/order-statechart.puml`)
- Workflow states trong code

#### 📝 Checklist verification:

- [ ] Xem diagram PlantUML để hiểu flow
- [ ] Verify states: PENDING -> PROCESSING -> SHIPPING -> DELIVERED
- [ ] Cancel order flow
- [ ] Refund flow (nếu có)

---

## 🔧 UC4 - ADVANCED FEATURES

### **4.1 Notification System**

#### ✅ Features đã có:

- **Notification Model**:
  ```prisma
  model Notification {
    id       String            @id @default(uuid())
    userId   String
    title    String
    message  String            @db.Text
    type     NotificationType
    isRead   Boolean           @default(false)
    priority NotificationPriority @default(NORMAL)
  }
  ```
- **Notification Controller** (`backend/controllers/notificationController.js`)
- **Notification Routes** (`backend/routes/notifications.js`)
- **Notification UI** (`frontend-user/app/notifications/*`)

#### 📝 Checklist verification:

```powershell
# Get notifications
curl http://localhost:3002/api/notifications `
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Mark as read
curl -X PUT http://localhost:3002/api/notifications/{id}/read
```

---

### **4.2 Rate Limiting & Security**

#### ✅ Features đã có:

- **Rate Limiter Middleware** (`backend/middleware/rateLimiter.js`, `backend/middleware/advancedRateLimiter.js`)
- **Security Logging** (`backend/middleware/requestLogger.js`)
- **Security Log Model**:
  ```prisma
  model SecurityLog {
    id        String   @id @default(uuid())
    event     String
    severity  String
    ip        String
  }
  ```

#### 📝 Checklist verification:

```powershell
# Test rate limiting (gửi nhiều request liên tục)
for ($i=1; $i -le 20; $i++) {
  curl http://localhost:3002/api/products
  Start-Sleep -Milliseconds 100
}
# Expect: 429 Too Many Requests sau một số requests
```

---

### **4.3 Logging System**

#### ✅ Features đã có:

- **Request Logger** (`backend/middleware/requestLogger.js`)
- **Log Files** (`backend/logs/`)
- **View Logs Script** (`backend/view-logs.js`)

#### 📝 Checklist verification:

```powershell
# View logs
cd .\backend
node .\view-logs.js
```

---

## 📊 TỔNG KẾT IMPLEMENTATION STATUS

### UC1 - CORE FEATURES

| Feature        | Status        | Priority |
| -------------- | ------------- | -------- |
| User Auth      | ✅ Hoàn thành | HIGH     |
| Product CRUD   | ✅ Hoàn thành | HIGH     |
| Category       | ✅ Hoàn thành | HIGH     |
| Product Images | ✅ Hoàn thành | MEDIUM   |
| Search         | ✅ Hoàn thành | MEDIUM   |
| Merchant       | ✅ Hoàn thành | LOW      |

### UC2 - SHOPPING EXPERIENCE

| Feature               | Status         | Priority |
| --------------------- | -------------- | -------- |
| Shopping Cart         | ✅ Hoàn thành  | HIGH     |
| Wishlist              | ✅ Hoàn thành  | MEDIUM   |
| Product Rating/Review | ⚠️ Chưa có API | LOW      |

### UC3 - ORDER & PAYMENT

| Feature             | Status        | Priority |
| ------------------- | ------------- | -------- |
| Order Management    | ✅ Hoàn thành | HIGH     |
| MoMo Payment        | ✅ Hoàn thành | HIGH     |
| Order State Machine | ✅ Hoàn thành | MEDIUM   |

### UC4 - ADVANCED FEATURES

| Feature          | Status        | Priority |
| ---------------- | ------------- | -------- |
| Notifications    | ✅ Hoàn thành | MEDIUM   |
| Rate Limiting    | ✅ Hoàn thành | HIGH     |
| Security Logging | ✅ Hoàn thành | HIGH     |

---

## ✅ CHECKLIST TỔNG THỂ - VERIFICATION STEPS

### Bước 1: Setup môi trường

```powershell
# Clone repo (nếu chưa có)
git clone https://github.com/anhtrietrop/Project_KiemThuPhanMem.git
cd Project_KiemThuPhanMem

# Install dependencies
cd backend
npm install
cd ../frontend-user
yarn install
cd ../frontend-admin
yarn install
cd ..
```

### Bước 2: Setup Database

```powershell
# Start MySQL (hoặc dùng Docker - xem DOCKER_SETUP_GUIDE.md)
# Tạo database: singitronic_nextjs_db

# Run migrations
cd backend
npx prisma migrate deploy
```

### Bước 3: Seed Data

```powershell
cd backend
node .\scripts\create-test-user.js
node .\scripts\create-test-data.js
```

### Bước 4: Start Services

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend User
cd frontend-user
yarn dev

# Terminal 3: Frontend Admin
cd frontend-admin
yarn dev
```

### Bước 5: Manual Testing

#### UC1 Testing:

- [ ] Mở http://localhost:3000/register -> đăng ký user mới
- [ ] Login với user vừa tạo
- [ ] Browse products tại homepage
- [ ] Xem chi tiết 1 product
- [ ] Login admin http://localhost:3001 (email: admin@test.com)
- [ ] Tạo product mới từ admin panel

#### UC2 Testing:

- [ ] Add product to cart
- [ ] Update quantity trong cart
- [ ] Remove item from cart
- [ ] Add product to wishlist
- [ ] View wishlist

#### UC3 Testing:

- [ ] Checkout từ cart
- [ ] Điền thông tin shipping
- [ ] Chọn payment method (COD/MoMo)
- [ ] Complete order
- [ ] View order trong My Orders
- [ ] Admin: View và update order status

#### UC4 Testing:

- [ ] View notifications
- [ ] Mark notification as read
- [ ] Test rate limiting (spam requests)
- [ ] Check logs trong backend/logs/

---

## 🚀 NEXT STEPS

1. **Đọc tiếp:** `DOCKER_SETUP_GUIDE.md` - Hướng dẫn setup Docker local
2. **Git workflow:** `GIT_WORKFLOW_GUIDE.md` - Branching strategy
3. **Database:** `DATABASE_MIGRATION_GUIDE.md` - Migration cho từng UC

## 📝 GHI CHÚ

- File này được tạo tự động dựa trên phân tích code
- Nếu tài liệu Google Docs của nhóm có yêu cầu khác, cần cập nhật
- Một số endpoint cần verify bằng cách test thực tế
