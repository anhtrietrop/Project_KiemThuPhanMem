# HƯỚNG DẪN DATABASE MIGRATION & SEEDING

> **Mục đích:** Quản lý database schema changes và test data cho từng Use Case

## 📋 MỤC LỤC

1. [Prisma Migration Overview](#1-prisma-migration-overview)
2. [Migration Strategy per UC](#2-migration-strategy-per-uc)
3. [Seed Data Management](#3-seed-data-management)
4. [Migration Commands](#4-migration-commands)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. PRISMA MIGRATION OVERVIEW

### 1.1 Prisma là gì?

Prisma là ORM (Object-Relational Mapping) được sử dụng trong project:

- **Schema**: Định nghĩa models trong `backend/prisma/schema.prisma`
- **Migrations**: SQL scripts tự động generate khi schema thay đổi
- **Client**: Type-safe database client

### 1.2 Migration Workflow

```
1. Cập nhật schema.prisma
   ↓
2. Chạy: npx prisma migrate dev --name <migration-name>
   ↓
3. Prisma generates:
   - SQL migration file
   - Updated Prisma Client
   ↓
4. Commit migration files vào Git
   ↓
5. Team members chạy: npx prisma migrate deploy
```

### 1.3 Cấu trúc Migration Files

```
backend/
└── prisma/
    ├── schema.prisma               # Source of truth
    └── migrations/
        ├── migration_lock.toml     # Lock provider
        ├── 20241103_init/
        │   └── migration.sql       # Initial migration
        ├── 20241103_add_cart/
        │   └── migration.sql       # UC2 migration
        └── 20241103_add_orders/
            └── migration.sql       # UC3 migration
```

---

## 2. MIGRATION STRATEGY PER UC

### 2.1 UC1 - Core Features

#### **Models cần thiết:**

```prisma
// backend/prisma/schema.prisma

model User {
  id       String   @id @default(uuid())
  email    String   @unique
  password String?
  role     String?  @default("user")
}

model Product {
  id           String   @id @default(uuid())
  slug         String   @unique
  title        String
  mainImage    String
  price        Float?   @default(0)
  description  String
  categoryId   String
  merchantId   String
}

model Category {
  id       String    @id @default(uuid())
  name     String    @unique
  products Product[]
}

model Merchant {
  id       String    @id @default(uuid())
  name     String
  status   String    @default("ACTIVE")
  products Product[]
}

model Image {
  imageID   String @id @default(uuid())
  productID String
  image     String
}
```

#### **Tạo migration UC1:**

```powershell
# Tại thư mục backend
cd backend

# Tạo migration
npx prisma migrate dev --name uc1_core_features

# Output:
# ✔ Prisma Migrate applied the following migration(s):
#   migrations/
#     └─ 20241103123456_uc1_core_features/
#       └─ migration.sql
```

#### **Commit migration:**

```powershell
git add prisma/migrations/
git commit -m "feat(db): add UC1 core schema - users, products, categories"
```

---

### 2.2 UC2 - Shopping Experience

#### **Models cần thêm:**

```prisma
// Thêm vào schema.prisma

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(uuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int     @default(1)
  @@unique([cartId, productId])
}

model Wishlist {
  id        String  @id @default(uuid())
  productId String
  userId    String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### **Cập nhật models hiện có:**

```prisma
// Thêm relations vào User
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String?
  role          String?        @default("user")
  Wishlist      Wishlist[]     // ← Thêm
  cart          Cart?          // ← Thêm
}

// Thêm relations vào Product
model Product {
  id             String       @id @default(uuid())
  // ... existing fields
  Wishlist       Wishlist[]   // ← Thêm
  cartItems      CartItem[]   // ← Thêm
}
```

#### **Tạo migration UC2:**

```powershell
npx prisma migrate dev --name uc2_shopping_cart_wishlist

git add prisma/migrations/
git commit -m "feat(db): add UC2 schema - cart and wishlist"
```

---

### 2.3 UC3 - Order & Payment

#### **Models cần thêm:**

```prisma
model Customer_order {
  id                      String                   @id @default(uuid())
  name                    String
  lastname                String
  phone                   String
  email                   String
  adress                  String
  city                    String
  status                  String
  payment_status          String?                  @default("PENDING")
  payment_method          String?
  payment_transaction_id  String?
  total                   Int
  dateTime                DateTime?                @default(now())
  updated_at              DateTime?                @updatedAt
  products                customer_order_product[]
}

model customer_order_product {
  id              String         @id @default(uuid())
  customerOrder   Customer_order @relation(fields: [customerOrderId], references: [id])
  customerOrderId String
  product         Product        @relation(fields: [productId], references: [id])
  productId       String
  quantity        Int
}

model MomoPayment {
  id           String    @id @default(uuid())
  orderId      String
  requestId    String    @unique
  amount       Int
  orderInfo    String
  resultCode   Int?      @default(-1)
  transId      String?
  payUrl       String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([orderId])
  @@index([resultCode])
}
```

#### **Tạo migration UC3:**

```powershell
npx prisma migrate dev --name uc3_orders_payment

git add prisma/migrations/
git commit -m "feat(db): add UC3 schema - orders and MoMo payment"
```

---

### 2.4 UC4 - Advanced Features

#### **Models cần thêm:**

```prisma
enum NotificationType {
  ORDER_UPDATE
  PAYMENT_STATUS
  PROMOTION
  SYSTEM_ALERT
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

model Notification {
  id        String               @id @default(uuid())
  userId    String
  user      User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String               @db.Text
  type      NotificationType
  isRead    Boolean              @default(false)
  priority  NotificationPriority @default(NORMAL)
  metadata  Json?
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  @@index([userId])
  @@index([userId, isRead])
}

model SecurityLog {
  id        String   @id @default(uuid())
  event     String
  details   String   @db.Text
  severity  String
  ip        String
  userAgent String   @db.Text
  timestamp DateTime @default(now())

  @@index([event])
  @@index([severity])
  @@index([timestamp])
}

model RateLimitLog {
  id        String   @id @default(uuid())
  key       String
  timestamp DateTime @default(now())

  @@index([key, timestamp])
}
```

#### **Tạo migration UC4:**

```powershell
npx prisma migrate dev --name uc4_notifications_security

git add prisma/migrations/
git commit -m "feat(db): add UC4 schema - notifications and security logs"
```

---

## 3. SEED DATA MANAGEMENT

### 3.1 Seed Scripts Overview

Seed scripts tạo test data cho development:

```
backend/scripts/
├── create-test-user.js       # Admin + test users
├── create-test-data.js       # Products, categories, merchants
└── seed-uc-specific.js       # UC-specific data (sẽ tạo)
```

### 3.2 UC1 - Seed Data

**File mới:** `backend/scripts/seed-uc1.js`

```javascript
// Seed data for UC1 - Core Features
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function seedUC1() {
  console.log("🌱 Seeding UC1 - Core Features...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommerce.com" },
    update: {},
    create: {
      email: "admin@ecommerce.com",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // 2. Create Test Users
  const testPassword = await bcrypt.hash("User123!", 10);
  const user1 = await prisma.user.upsert({
    where: { email: "user1@test.com" },
    update: {},
    create: {
      email: "user1@test.com",
      password: testPassword,
      role: "user",
    },
  });
  console.log("✅ Test user created:", user1.email);

  // 3. Create Categories
  const electronics = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics" },
  });

  const clothing = await prisma.category.upsert({
    where: { name: "Clothing" },
    update: {},
    create: { name: "Clothing" },
  });
  console.log("✅ Categories created");

  // 4. Create Merchant
  const merchant = await prisma.merchant.upsert({
    where: { id: "default-merchant" },
    update: {},
    create: {
      id: "default-merchant",
      name: "Default Store",
      description: "Official store",
      status: "ACTIVE",
    },
  });
  console.log("✅ Merchant created:", merchant.name);

  // 5. Create Products
  const products = [
    {
      title: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      mainImage: "/images/iphone15.jpg",
      price: 999.99,
      costPrice: 800,
      quantity: 50,
      rating: 5,
      description: "Latest iPhone with A17 Pro chip",
      manufacturer: "Apple",
      categoryId: electronics.id,
      merchantId: merchant.id,
    },
    {
      title: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      mainImage: "/images/samsung-s24.jpg",
      price: 899.99,
      costPrice: 700,
      quantity: 30,
      rating: 4,
      description: "Flagship Samsung phone",
      manufacturer: "Samsung",
      categoryId: electronics.id,
      merchantId: merchant.id,
    },
    {
      title: "Nike Air Max",
      slug: "nike-air-max",
      mainImage: "/images/nike-airmax.jpg",
      price: 129.99,
      costPrice: 80,
      quantity: 100,
      rating: 4,
      description: "Comfortable running shoes",
      manufacturer: "Nike",
      categoryId: clothing.id,
      merchantId: merchant.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }
  console.log("✅ Products created:", products.length);

  console.log("🎉 UC1 seed completed!");
}

seedUC1()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Chạy seed UC1:**

```powershell
cd backend
node scripts/seed-uc1.js
```

---

### 3.3 UC2 - Seed Data

**File mới:** `backend/scripts/seed-uc2.js`

```javascript
// Seed data for UC2 - Shopping Experience
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedUC2() {
  console.log("🌱 Seeding UC2 - Shopping Experience...");

  // Lấy user và product từ UC1
  const user = await prisma.user.findUnique({
    where: { email: "user1@test.com" },
  });

  if (!user) {
    console.error("❌ User not found. Run seed-uc1.js first!");
    process.exit(1);
  }

  const products = await prisma.product.findMany({ take: 2 });

  if (products.length === 0) {
    console.error("❌ No products found. Run seed-uc1.js first!");
    process.exit(1);
  }

  // 1. Create Cart with items
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: products[0].id,
      },
    },
    update: {},
    create: {
      cartId: cart.id,
      productId: products[0].id,
      quantity: 2,
    },
  });
  console.log("✅ Cart created with items");

  // 2. Create Wishlist
  await prisma.wishlist.upsert({
    where: {
      id: "wishlist-" + user.id + "-" + products[1].id,
    },
    update: {},
    create: {
      id: "wishlist-" + user.id + "-" + products[1].id,
      userId: user.id,
      productId: products[1].id,
    },
  });
  console.log("✅ Wishlist created");

  console.log("🎉 UC2 seed completed!");
}

seedUC2()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Chạy seed UC2:**

```powershell
node scripts/seed-uc2.js
```

---

### 3.4 UC3 - Seed Data

**File mới:** `backend/scripts/seed-uc3.js`

```javascript
// Seed data for UC3 - Orders & Payment
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedUC3() {
  console.log("🌱 Seeding UC3 - Orders & Payment...");

  const user = await prisma.user.findUnique({
    where: { email: "user1@test.com" },
  });

  const products = await prisma.product.findMany({ take: 2 });

  // 1. Create test order
  const order = await prisma.customer_order.create({
    data: {
      name: "John",
      lastname: "Doe",
      phone: "0123456789",
      email: user.email,
      adress: "123 Test Street",
      city: "Ho Chi Minh City",
      status: "PENDING",
      payment_status: "PENDING",
      payment_method: "COD",
      total: 2199,
    },
  });

  // 2. Add order items
  await prisma.customer_order_product.createMany({
    data: [
      {
        customerOrderId: order.id,
        productId: products[0].id,
        quantity: 2,
      },
      {
        customerOrderId: order.id,
        productId: products[1].id,
        quantity: 1,
      },
    ],
  });
  console.log("✅ Test order created:", order.id);

  // 3. Create MoMo payment record
  await prisma.momoPayment.create({
    data: {
      orderId: order.id,
      requestId: "test-req-" + Date.now(),
      amount: 2199000,
      orderInfo: "Payment for order " + order.id,
      resultCode: -1, // Pending
    },
  });
  console.log("✅ MoMo payment record created");

  console.log("🎉 UC3 seed completed!");
}

seedUC3()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### 3.5 UC4 - Seed Data

**File mới:** `backend/scripts/seed-uc4.js`

```javascript
// Seed data for UC4 - Notifications & Security
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedUC4() {
  console.log("🌱 Seeding UC4 - Advanced Features...");

  const user = await prisma.user.findUnique({
    where: { email: "user1@test.com" },
  });

  // 1. Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Order Shipped",
        message: "Your order #123 has been shipped",
        type: "ORDER_UPDATE",
        priority: "NORMAL",
        isRead: false,
      },
      {
        userId: user.id,
        title: "Payment Successful",
        message: "Your payment of $100 was successful",
        type: "PAYMENT_STATUS",
        priority: "HIGH",
        isRead: false,
      },
    ],
  });
  console.log("✅ Notifications created");

  // 2. Create security logs
  await prisma.securityLog.createMany({
    data: [
      {
        event: "LOGIN_SUCCESS",
        details: "User logged in successfully",
        severity: "INFO",
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0...",
      },
      {
        event: "RATE_LIMIT_EXCEEDED",
        details: "Too many requests from IP",
        severity: "WARNING",
        ip: "192.168.1.100",
        userAgent: "curl/7.68.0",
      },
    ],
  });
  console.log("✅ Security logs created");

  console.log("🎉 UC4 seed completed!");
}

seedUC4()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### 3.6 Seed All UCs

**File mới:** `backend/scripts/seed-all.js`

```javascript
// Seed all UCs in order
const { execSync } = require("child_process");

async function seedAll() {
  console.log("🌱 Starting full seed process...\n");

  const scripts = ["seed-uc1.js", "seed-uc2.js", "seed-uc3.js", "seed-uc4.js"];

  for (const script of scripts) {
    console.log(`\n▶️  Running ${script}...`);
    try {
      execSync(`node scripts/${script}`, { stdio: "inherit" });
    } catch (error) {
      console.error(`❌ Failed to run ${script}`);
      process.exit(1);
    }
  }

  console.log("\n✅ All seeds completed successfully!");
}

seedAll();
```

**Chạy all seeds:**

```powershell
cd backend
node scripts/seed-all.js
```

---

## 4. MIGRATION COMMANDS

### 4.1 Development (Local)

```powershell
# Tại thư mục backend/

# Tạo migration mới từ schema changes
npx prisma migrate dev --name <migration_name>

# Example:
npx prisma migrate dev --name add_user_phone_field

# Apply pending migrations
npx prisma migrate deploy

# Reset database (XÓA TẤT CẢ DATA!)
npx prisma migrate reset

# Generate Prisma Client sau khi update schema
npx prisma generate

# View migration status
npx prisma migrate status
```

### 4.2 Production

```powershell
# KHÔNG dùng migrate dev trên production!
# Chỉ dùng migrate deploy

# Apply migrations
npx prisma migrate deploy

# Rollback: không hỗ trợ tự động
# Phải tạo migration mới để revert changes
```

### 4.3 Docker Environment

```powershell
# Exec vào backend container
docker compose exec backend sh

# Inside container:
npx prisma migrate deploy
node scripts/seed-all.js
exit
```

### 4.4 Git Workflow

```powershell
# Sau khi tạo migration:
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat(db): add cart schema for UC2"
git push

# Team member pull và apply:
git pull
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## 5. TROUBLESHOOTING

### 5.1 Migration Out of Sync

**Lỗi:**

```
Migration `20241103_xxx` cannot be applied.
```

**Giải pháp:**

```powershell
# Reset migrations (CHỈ local development!)
npx prisma migrate reset

# Pull latest migrations từ Git
git pull origin main

# Apply migrations
npx prisma migrate deploy
```

### 5.2 Prisma Client Không Update

**Lỗi:**

```
Type 'Cart' does not exist
```

**Giải pháp:**

```powershell
# Re-generate Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

### 5.3 Seed Script Lỗi Unique Constraint

**Lỗi:**

```
Unique constraint failed on the fields: (`email`)
```

**Giải pháp:**

Dùng `upsert` thay vì `create`:

```javascript
// ❌ BAD
await prisma.user.create({
  data: { email: "test@test.com" },
});

// ✅ GOOD
await prisma.user.upsert({
  where: { email: "test@test.com" },
  update: {},
  create: { email: "test@test.com", password: "..." },
});
```

### 5.4 Migration Conflict

**Lỗi:**

```
Migration conflicts detected
```

**Giải pháp:**

```powershell
# 1. Backup hiện tại
npx prisma migrate status > migration-status.txt

# 2. Pull latest changes
git pull origin uc1

# 3. Resolve schema.prisma conflicts manually

# 4. Generate new migration
npx prisma migrate dev --name resolve_conflicts
```

### 5.5 Foreign Key Constraint Failed

**Lỗi:**

```
Foreign key constraint failed on the field: `userId`
```

**Giải pháp:**

Đảm bảo referenced record tồn tại:

```javascript
// Seed order - kiểm tra user exist trước
const user = await prisma.user.findUnique({
  where: { email: "user1@test.com" },
});

if (!user) {
  throw new Error("User not found. Run seed-uc1.js first!");
}

// Sau đó mới tạo order
await prisma.customer_order.create({
  data: {
    // ... order data
    email: user.email,
  },
});
```

---

## 6. BEST PRACTICES

### 6.1 Migration Naming

```powershell
# ✅ GOOD
npx prisma migrate dev --name add_cart_wishlist
npx prisma migrate dev --name update_user_add_phone
npx prisma migrate dev --name fix_order_status_enum

# ❌ BAD
npx prisma migrate dev --name changes
npx prisma migrate dev --name update
npx prisma migrate dev --name test
```

### 6.2 Schema Organization

```prisma
// Group related models together
// User & Auth models
model User { ... }

// Product models
model Product { ... }
model Category { ... }
model Merchant { ... }

// Shopping models
model Cart { ... }
model CartItem { ... }
model Wishlist { ... }

// Order models
model Customer_order { ... }
model customer_order_product { ... }

// Payment models
model MomoPayment { ... }
```

### 6.3 Testing Migrations

```powershell
# Test migration trên fresh database
docker compose down -v
docker compose up -d db
npx prisma migrate deploy
node scripts/seed-all.js

# Verify data
npx prisma studio
# Mở browser: http://localhost:5555
```

---

## 7. MIGRATION CHECKLIST PER UC

### ✅ UC1 Migration Checklist

- [ ] Schema có User, Product, Category, Merchant models
- [ ] Migration files committed vào Git
- [ ] Seed script tạo admin user
- [ ] Seed script tạo sample products
- [ ] Prisma Client generated
- [ ] Backend API test passed

### ✅ UC2 Migration Checklist

- [ ] Schema có Cart, CartItem, Wishlist models
- [ ] Foreign keys đúng (userId, productId)
- [ ] Unique constraint: cartId + productId
- [ ] Cascade delete configured
- [ ] Seed script tạo sample cart
- [ ] API endpoints test

### ✅ UC3 Migration Checklist

- [ ] Schema có Customer_order, MomoPayment models
- [ ] Order status enum/string valid
- [ ] Payment status fields
- [ ] Indexes on orderId, resultCode
- [ ] Seed script tạo test orders
- [ ] Order workflow tested

### ✅ UC4 Migration Checklist

- [ ] Schema có Notification, SecurityLog models
- [ ] Enum types defined
- [ ] Indexes cho performance
- [ ] Seed script tạo sample notifications
- [ ] Security logs được tạo automatically

---

## 8. QUICK REFERENCE

```powershell
# Workflow hàng ngày:

# 1. Pull latest code
git pull origin uc1

# 2. Apply migrations
cd backend
npx prisma migrate deploy
npx prisma generate

# 3. Seed data (nếu fresh DB)
node scripts/seed-all.js

# 4. Start dev server
npm run dev

# 5. Khi update schema:
# - Edit prisma/schema.prisma
npx prisma migrate dev --name my_changes
git add prisma/
git commit -m "feat(db): description"
git push
```

---

## 9. NEXT STEPS

✅ **Đã hoàn thành:**

- Hiểu Prisma migration workflow
- Migration strategy cho từng UC
- Seed scripts cho test data
- Troubleshooting common issues

📚 **Đọc tiếp:**

- `UC_ANALYSIS.md` - Feature implementation checklist
- `DOCKER_SETUP_GUIDE.md` - Run migrations trong Docker
- `GIT_WORKFLOW_GUIDE.md` - Commit và merge migrations

🚀 **Bắt đầu implement:**

1. Tạo UC1 branch
2. Run migration UC1
3. Seed data
4. Test features
5. Move to UC2
