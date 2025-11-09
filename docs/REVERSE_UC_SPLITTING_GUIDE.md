# 🔄 HƯỚNG DẪN TÁCH DỰ ÁN HOÀN CHỈNH THÀNH CÁC UC BRANCHES

> **Tình huống:** Bạn đã có dự án hoàn chỉnh trên `main` (UC1-UC4 full), cần tách thành các branches riêng biệt để demo/kiểm thử từng UC như thể đang build lần lượt.

---

## 🎯 MỤC TIÊU

```
main (UC1+UC2+UC3+UC4 - Full project hiện tại)
    ↓ Tách thành
uc1 (Chỉ UC1: Auth, Products, Categories, Search)
    ↓
uc2 (UC1 + UC2: thêm Cart, Wishlist)
    ↓
uc3 (UC1 + UC2 + UC3: thêm Orders, MoMo Payment)
    ↓
uc4 (UC1 + UC2 + UC3 + UC4: Full - giống main)
```

---

## 📋 CHUẨN BỊ

### Bước 1: Backup toàn bộ project

```powershell
# Tạo backup branch
git checkout main
git branch backup-full-project
git push origin backup-full-project

# Hoặc clone sang folder khác
cd C:\DoAnMau
git clone Project_KiemThuPhanMem Project_KiemThuPhanMem_BACKUP
```

### Bước 2: Xem danh sách features hiện có

Dựa trên `UC_ANALYSIS.md`:

**UC1 Features:**

- ✅ User Authentication (`backend/routes/users.js`, `backend/controllers/users.js`)
- ✅ Products CRUD (`backend/routes/products.js`, `backend/controllers/products.js`)
- ✅ Categories (`backend/routes/category.js`)
- ✅ Search (`backend/routes/search.js`)
- ✅ Merchant (`backend/routes/merchant.js`)
- ✅ Product Images (`backend/routes/productImages.js`, `backend/routes/mainImages.js`)

**UC2 Features (thêm vào UC1):**

- ✅ Cart (`backend/routes/cart.js`, `backend/controllers/cart.js`)
- ✅ Wishlist (`backend/routes/wishlist.js`, `backend/controllers/wishlist.js`)

**UC3 Features (thêm vào UC2):**

- ✅ Orders (`backend/routes/customer_orders.js`, `backend/controllers/customer_orders.js`)
- ✅ MoMo Payment (`backend/routes/momoPayment.js`, `backend/controllers/momoPayment.js`)

**UC4 Features (thêm vào UC3):**

- ✅ Notifications (`backend/routes/notifications.js`, `backend/controllers/notificationController.js`)
- ✅ Security Logging (`backend/middleware/rateLimiter.js`, `backend/middleware/requestLogger.js`)

---

## 🔨 CHIẾN LƯỢC TÁCH UC

### **Option A: Tạo branches và xóa code từng bước (RECOMMENDED)**

Tạo branches từ `main`, sau đó xóa features không thuộc UC đó.

### **Option B: Cherry-pick commits từ history**

Nếu bạn có commit history rõ ràng từng UC.

### **Option C: Manual copy files theo checklist**

Tạo branches mới, copy files theo từng UC.

---

## 🚀 THỰC HIỆN - OPTION A (Recommended)

### **BƯỚC 1: Tạo UC4 branch (giống main)**

```powershell
git checkout main
git checkout -b uc4
git push -u origin uc4
```

✅ UC4 = Full project (giống main)

---

### **BƯỚC 2: Tạo UC3 branch (xóa UC4 features)**

```powershell
git checkout main
git checkout -b uc3
```

#### Xóa UC4 features:

```powershell
# 1. Xóa Notification routes
git rm backend/routes/notifications.js
git rm backend/controllers/notificationController.js

# 2. Xóa Security middleware (giữ lại basic rate limiting)
# Không xóa hoàn toàn, chỉ disable advanced features
# Edit backend/app.js - comment out advanced rate limiter

# 3. Xóa Notification model khỏi Prisma schema
# Edit backend/prisma/schema.prisma - comment out Notification, RateLimitLog, SecurityLog models

# 4. Xóa frontend notification pages
git rm -r frontend-user/app/notifications
git rm frontend-user/components/modules/notification

# 5. Commit
git add .
git commit -m "feat(uc3): remove UC4 features (notifications, advanced security)"
git push -u origin uc3
```

**UC3 checklist:**

- ✅ UC1: Auth, Products, Categories
- ✅ UC2: Cart, Wishlist
- ✅ UC3: Orders, MoMo Payment
- ❌ UC4: Notifications, Advanced Security

---

### **BƯỚC 3: Tạo UC2 branch (xóa UC3 features)**

```powershell
git checkout uc3
git checkout -b uc2
```

#### Xóa UC3 features:

```powershell
# 1. Xóa Order routes
git rm backend/routes/customer_orders.js;
git rm backend/routes/customer_order_product.js;
git rm backend/controllers/customer_orders.js;
git rm backend/controllers/customer_order_product.js
# 2. Xóa MoMo Payment
git rm backend/routes/momoPayment.js;
git rm backend/controllers/momoPayment.js;
git rm -r backend/utills/momoSecurity.js;
git rm -r backend/middleware/momoErrorHandler.js

# 3. Xóa Order models khỏi Prisma schema
# Edit backend/prisma/schema.prisma - comment out Customer_order, customer_order_product, MomoPayment

# 4. Xóa frontend order/payment pages
git rm -r frontend-user/app/my-orders;
git rm -r frontend-user/app/order;
git rm -r frontend-user/app/checkout;
git rm -r frontend-user/app/payment

# 5. Commit
git add .;
git commit -m "feat(uc2): remove UC3 features (orders, payment)";
git push -u origin uc2
```

**UC2 checklist:**

- ✅ UC1: Auth, Products, Categories
- ✅ UC2: Cart, Wishlist
- ❌ UC3: Orders, MoMo
- ❌ UC4: Notifications

---

### **BƯỚC 4: Tạo UC1 branch (chỉ giữ core features)**

```powershell
git checkout uc2
git checkout -b uc1
```

#### Xóa UC2 features:

```powershell
# 1. Xóa Cart routes
git rm backend/routes/cart.js
git rm backend/controllers/cart.js

# 2. Xóa Wishlist routes
git rm backend/routes/wishlist.js
git rm backend/controllers/wishlist.js

# 3. Xóa Cart, Wishlist models khỏi Prisma schema
# Edit backend/prisma/schema.prisma - comment out Cart, CartItem, Wishlist

# 4. Xóa frontend cart/wishlist pages
git rm -r frontend-user/app/cart
git rm -r frontend-user/app/wishlist
git rm frontend-user/components/modules/cart
git rm frontend-user/components/modules/wishlist

# 5. Commit
git add .
git commit -m "feat(uc1): core features only (auth, products, categories, search)"
git push -u origin uc1
```

**UC1 checklist:**

- ✅ UC1: Auth, Products, Categories, Search, Merchant
- ❌ UC2: Cart, Wishlist
- ❌ UC3: Orders, Payment
- ❌ UC4: Notifications

---

## 📝 PRISMA SCHEMA STRATEGY

Vì không thể xóa models khỏi schema (sẽ break relationships), tốt nhất là:

### **Tạo schema riêng cho từng UC:**

```powershell
# UC1
cp backend/prisma/schema.prisma backend/prisma/schema-uc1.prisma
# Edit schema-uc1.prisma - chỉ giữ: User, Product, Category, Image, Merchant

# UC2
cp backend/prisma/schema.prisma backend/prisma/schema-uc2.prisma
# Edit schema-uc2.prisma - UC1 + Cart, CartItem, Wishlist

# UC3
cp backend/prisma/schema.prisma backend/prisma/schema-uc3.prisma
# Edit schema-uc3.prisma - UC2 + Customer_order, customer_order_product, MomoPayment

# UC4
cp backend/prisma/schema.prisma backend/prisma/schema-uc4.prisma
# = Full schema
```

**Trong mỗi UC branch:**

```powershell
# UC1 branch
git checkout uc1
mv backend/prisma/schema-uc1.prisma backend/prisma/schema.prisma
git add backend/prisma/schema.prisma
git commit -m "chore(prisma): use UC1 schema"

# UC2 branch
git checkout uc2
mv backend/prisma/schema-uc2.prisma backend/prisma/schema.prisma
git add backend/prisma/schema.prisma
git commit -m "chore(prisma): use UC2 schema"

# Tương tự cho UC3, UC4
```

---

## 🗄️ DATABASE STRATEGY

Mỗi UC cần database riêng để demo:

### **Option 1: Multiple databases**

```env
# UC1: .env
DATABASE_URL="mysql://root:@localhost:3306/singitronic_uc1"

# UC2: .env
DATABASE_URL="mysql://root:@localhost:3306/singitronic_uc2"

# UC3: .env
DATABASE_URL="mysql://root:@localhost:3306/singitronic_uc3"

# UC4: .env
DATABASE_URL="mysql://root:@localhost:3306/singitronic_uc4"
```

### **Option 2: Docker với different ports**

Tạo `docker-compose.uc1.yml`:

```yaml
version: "3.8"

services:
  db:
    image: mysql:8.0
    container_name: singitronic_db_uc1
    ports:
      - "3307:3306" # UC1 port
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword123
      MYSQL_DATABASE: singitronic_uc1
    volumes:
      - mysql_data_uc1:/var/lib/mysql

  backend:
    build: ./backend
    container_name: singitronic_backend_uc1
    ports:
      - "3002:3002"
    depends_on:
      - db
    environment:
      DATABASE_URL: mysql://root:rootpassword123@db:3306/singitronic_uc1

volumes:
  mysql_data_uc1:
```

Tương tự cho UC2 (port 3308), UC3 (3309), UC4 (3310).

---

## 🧪 VERIFICATION CHECKLIST

### **Sau khi tạo UC1 branch:**

```powershell
git checkout uc1

# 1. Check routes tồn tại
ls backend/routes/
# Should have: users.js, products.js, category.js, search.js, merchant.js, productImages.js
# Should NOT have: cart.js, wishlist.js, customer_orders.js, momoPayment.js, notifications.js

# 2. Check Prisma schema
cat backend/prisma/schema.prisma
# Should have: User, Product, Category, Image, Merchant
# Should NOT have: Cart, Wishlist, Customer_order, MoMo, Notification

# 3. Test Docker
docker compose -f docker-compose.uc1.yml up -d
docker compose exec backend npx prisma migrate dev --name uc1_initial

# 4. Test API
curl http://localhost:3002/api/products
curl http://localhost:3002/api/category

# 5. Test frontend
# UC1 should have: homepage, products, search, login/register
# UC1 should NOT have: cart, wishlist, checkout, my-orders
```

### **Tương tự cho UC2, UC3, UC4**

---

## 📚 TẠO DOCUMENTATION CHO TỪNG UC

### **UC1 README:**

```powershell
git checkout uc1
```

Tạo `UC1_README.md`:

````markdown
# UC1 - Core Features

## Features

- ✅ User Authentication (register, login, session)
- ✅ Product Management (CRUD)
- ✅ Category Management
- ✅ Search & Filter
- ✅ Merchant Management
- ✅ Product Images

## NOT Included (sẽ có trong UC2-UC4)

- ❌ Shopping Cart
- ❌ Wishlist
- ❌ Orders
- ❌ Payment
- ❌ Notifications

## Setup

```bash
docker compose -f docker-compose.uc1.yml up -d
docker compose exec backend npx prisma migrate dev
node backend/scripts/seed-uc1.js
```
````

## Test

- Products: http://localhost:3000
- Admin: http://localhost:3001
- API: http://localhost:3002/api/products

````

Commit:
```powershell
git add UC1_README.md
git commit -m "docs: add UC1 README"
git push
````

Tương tự tạo `UC2_README.md`, `UC3_README.md`, `UC4_README.md` cho các branches khác.

---

## 🔐 BRANCH PROTECTION

Setup trên GitHub:

1. Repo Settings → Branches → Add rule

### **Protect UC branches:**

- Branch name pattern: `uc*` (matches uc1, uc2, uc3, uc4)
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ❌ Allow force pushes (để có thể rebase nếu cần)

### **Protect main:**

- ✅ Require pull request
- ✅ Require status checks
- ❌ Allow force pushes (NEVER!)

---

## 🔄 WORKFLOW DEMO CHO GIÁO VIÊN

### **Demo UC1:**

```powershell
# 1. Checkout UC1
git checkout uc1

# 2. Start Docker
docker compose -f docker-compose.uc1.yml up -d

# 3. Show features
# - Homepage with products
# - Search
# - Login/Register
# - Admin panel (products CRUD)

# 4. Show what's NOT there
# - No cart button
# - No wishlist
# - No checkout
```

### **Demo UC2:**

```powershell
git checkout uc2
docker compose -f docker-compose.uc2.yml up -d

# Show UC1 features + UC2 additions:
# - ✅ Cart functionality
# - ✅ Wishlist
# - ❌ Still no checkout/orders
```

### **Demo UC3:**

```powershell
git checkout uc3
docker compose -f docker-compose.uc3.yml up -d

# Show UC1+UC2 + UC3:
# - ✅ Checkout process
# - ✅ Orders management
# - ✅ MoMo payment
# - ❌ No notifications yet
```

### **Demo UC4:**

```powershell
git checkout uc4
docker compose up -d  # Full docker-compose.yml

# Show FULL features (giống main)
```

---

## 📦 SEED DATA CHO TỪNG UC

Tạo seed scripts riêng:

### **backend/scripts/seed-uc1.js:**

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding UC1 data...");

  // 1. Users
  await prisma.user.createMany({
    data: [
      { email: "user@test.com", password: "hashed", role: "user" },
      { email: "admin@test.com", password: "hashed", role: "admin" },
    ],
  });

  // 2. Categories
  await prisma.category.createMany({
    data: [{ name: "Laptops" }, { name: "Phones" }],
  });

  // 3. Merchants
  await prisma.merchant.createMany({
    data: [{ name: "Main Store" }],
  });

  // 4. Products (10 products)
  // ... create products

  console.log("✅ UC1 seed completed!");
}

main();
```

### **backend/scripts/seed-uc2.js:**

```javascript
// Chạy seed-uc1.js trước, sau đó thêm:

async function seedUC2() {
  console.log("🌱 Seeding UC2 additional data...");

  // 1. Cart for test user
  const user = await prisma.user.findFirst({ where: { role: "user" } });
  const cart = await prisma.cart.create({
    data: { userId: user.id },
  });

  // 2. Cart items
  const products = await prisma.product.findMany({ take: 3 });
  for (const product of products) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: 1,
      },
    });
  }

  // 3. Wishlist
  // ...

  console.log("✅ UC2 seed completed!");
}
```

Tương tự cho UC3, UC4.

---

## ⚠️ COMMON PITFALLS

### **1. Prisma schema conflicts:**

**Problem:** Xóa model khỏi schema nhưng code vẫn import.

**Solution:**

```powershell
# Search tất cả imports
grep -r "prisma.notification" backend/
# Xóa hoặc comment out
```

### **2. Frontend routes 404:**

**Problem:** Frontend vẫn có links đến features chưa có.

**Solution:**

```powershell
# UC1: Comment out cart/wishlist links in Header.tsx
# UC2: Comment out checkout links
```

### **3. Docker port conflicts:**

**Problem:** Multiple UCs chạy cùng lúc conflict ports.

**Solution:** Dùng different ports cho mỗi UC (3307, 3308, 3309, 3310).

---

## 🎯 QUICK REFERENCE

### **Commands:**

```powershell
# Tạo tất cả UC branches
git checkout main
git checkout -b uc4 && git push -u origin uc4
git checkout main
git checkout -b uc3 && git push -u origin uc3
git checkout main
git checkout -b uc2 && git push -u origin uc2
git checkout main
git checkout -b uc1 && git push -u origin uc1

# Switch giữa UCs
git checkout uc1  # Demo UC1
git checkout uc2  # Demo UC2
git checkout uc3  # Demo UC3
git checkout uc4  # Demo UC4

# Start Docker cho UC cụ thể
docker compose -f docker-compose.uc1.yml up -d
docker compose -f docker-compose.uc2.yml up -d
```

### **Verification:**

```powershell
# Check current UC
git branch --show-current

# Check routes
ls backend/routes/

# Check Prisma models
cat backend/prisma/schema.prisma | grep "model "

# Check frontend pages
ls frontend-user/app/
```

---

## 📅 TIMELINE ĐỀ XUẤT

| Week | Task                                 | Branch |
| ---- | ------------------------------------ | ------ |
| 1    | Tạo UC1 branch, xóa UC2-UC4 features | uc1    |
| 1    | Test UC1 thoroughly                  | uc1    |
| 2    | Tạo UC2 từ UC1, thêm Cart/Wishlist   | uc2    |
| 2    | Test UC2                             | uc2    |
| 3    | Tạo UC3 từ UC2, thêm Orders/Payment  | uc3    |
| 3    | Test UC3                             | uc3    |
| 4    | Tạo UC4 từ UC3, thêm Notifications   | uc4    |
| 4    | Final testing                        | all    |
| 5    | Demo cho giáo viên                   | all    |

---

## ✅ SUCCESS CRITERIA

Sau khi hoàn thành, bạn sẽ có:

- ✅ 4 UC branches độc lập
- ✅ Mỗi UC có Docker setup riêng
- ✅ Mỗi UC có seed data riêng
- ✅ Mỗi UC có README documentation
- ✅ Branch protection setup
- ✅ Có thể demo từng UC độc lập
- ✅ Có thể switch giữa UCs dễ dàng
- ✅ Database riêng biệt cho mỗi UC (optional)

---

## 🚀 NEXT STEPS

1. **Đọc file này kỹ**
2. **Backup project hiện tại** (tạo branch `backup-full-project`)
3. **Bắt đầu từ UC4** (easiest - giống main)
4. **Tạo UC3** (xóa UC4 features)
5. **Tạo UC2** (xóa UC3 features)
6. **Tạo UC1** (xóa UC2 features)
7. **Verify từng UC**
8. **Setup branch protection**
9. **Tạo documentation cho mỗi UC**
10. **Ready to demo!** 🎉

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Check `UC_ANALYSIS.md` - danh sách features từng UC
2. Check Git logs: `git log --oneline`
3. Restore từ backup: `git checkout backup-full-project`
4. Ask for help!

---

**Good luck với việc tách UC! 💪**
