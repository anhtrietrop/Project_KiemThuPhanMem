# Database Synchronization Strategy

## 🎯 Mục tiêu

Đảm bảo production database + test database **đồng bộ hoàn toàn** giữa các máy trong team.

---

## 📊 Chiến lược 3 tầng

### 1️⃣ Schema Synchronization (via Prisma Migrations)

✅ **Đã có:** Prisma migrations trong `prisma/migrations/`

- Mọi người chạy `npx prisma migrate dev` → cùng schema
- Tracked trong Git → versioned

### 2️⃣ Test Data Synchronization (via Seed Scripts)

🔄 **Cần thêm:** Database seeding scripts

- Tạo consistent test data cho mọi máy
- Không phụ thuộc vào data production
- Deterministic (chạy nhiều lần → same result)

### 3️⃣ Production Data Synchronization (Optional)

⚠️ **Tùy chọn:** Export/Import production data

- Dùng cho staging/demo environment
- **KHÔNG** dùng cho unit tests

---

## 🔧 Implementation

### A. Test Database Strategy (RECOMMENDED)

**Approach:** Tests tự tạo data, không cần import production

**Ưu điểm:**

- ✅ Isolated: Tests không bị ảnh hưởng bởi production data changes
- ✅ Fast: Không cần import large dataset
- ✅ Predictable: Mỗi test run giống hệt nhau
- ✅ Scalable: Tests chạy parallel without conflicts

**Implementation:**

```javascript
// tests/helpers.js - Test factories tạo data
TestDataFactory.createUser();
TestDataFactory.createProduct();
TestDataFactory.createOrder();

// Mỗi test tự tạo data cần thiết
// Cleanup sau khi test xong
```

**Kết quả:**

- Bạn chạy tests → Pass
- Bạn bè chạy tests → Pass (same behavior)
- Không cần đồng bộ production data

---

### B. Production Database Strategy (OPTIONAL)

**Approach:** Chia sẻ production data snapshot qua Git LFS hoặc cloud storage

**Use cases:**

- Demo environment
- Manual testing với real data
- Bug reproduction

**Implementation:**

#### Option 1: Small Dataset (< 50MB) - Commit vào Git

```bash
# Export minimal seed data
.\export-seed-data.bat

# Commit file
git add database_backup/seed_data.sql
git commit -m "Add seed data for testing"

# Teammates pull và import
git pull
.\import-seed-data.bat
```

#### Option 2: Large Dataset - Dùng Git LFS hoặc Cloud

```bash
# Git LFS (Large File Storage)
git lfs install
git lfs track "database_backup/*.sql"
git add .gitattributes
git add database_backup/full_database_dump.sql
git commit -m "Add large database dump via LFS"

# Or: Upload to cloud (Google Drive, Dropbox, S3)
# Share link với team
```

---

## 🚀 Recommended Workflow

### For Unit/Integration Tests:

```
1. Docker tạo empty test_ecommerce_db
2. Prisma migrate tạo schema
3. Tests tự tạo data cần thiết (via factories)
4. Tests cleanup sau khi chạy xong
✅ 100% reproducible, không cần share data
```

### For Manual Testing / Demo:

```
1. Docker tạo singitronic_nextjs_db
2. Import seed data (nếu cần)
3. Team share same seed data file
✅ Everyone sees same demo data
```

---

## 📋 Files cần tạo

### 1. Seed Script (Essential)

```javascript
// backend/prisma/seed.js
// Tạo minimal data cho development
async function seed() {
  // Admin user
  // Sample categories
  // Sample products
  // Sample orders
}
```

### 2. Export Script (Optional - for sharing)

```batch
REM export-seed-data.bat
REM Export only essential data (không export tất cả)
mysqldump ... --where="id < 100" > seed_data.sql
```

---

## ✅ Best Practices

### DO:

- ✅ Use Prisma migrations cho schema changes
- ✅ Use test factories cho test data
- ✅ Commit seed scripts (code) vào Git
- ✅ Document seed data structure
- ✅ Version seed data nếu cần share

### DON'T:

- ❌ Commit large SQL dumps (> 50MB) directly to Git
- ❌ Share production passwords/secrets
- ❌ Use production data cho unit tests
- ❌ Depend on specific production data IDs in tests

---

## 🔍 Kiểm tra Synchronization

### Schema sync:

```bash
# Mỗi người chạy
npx prisma migrate status
# Should show: "Database is up to date"
```

### Test sync:

```bash
# Mỗi người chạy
npm test
# Should have same pass/fail results
```

### Production data sync (if needed):

```bash
docker compose exec db mysql -u root -prootpassword123 \
  -e "SELECT COUNT(*) FROM product; SELECT COUNT(*) FROM user;"
# Should show same counts
```

---

## 📦 Summary

| Aspect          | Strategy          | Tool             | Synced?     |
| --------------- | ----------------- | ---------------- | ----------- |
| Schema          | Prisma Migrations | Git              | ✅ Yes      |
| Test Data       | Test Factories    | Code in Git      | ✅ Yes      |
| Seed Data       | Seed Scripts      | Git (or Git LFS) | ✅ Yes      |
| Production Data | Optional Export   | Cloud/LFS        | ⚠️ Optional |

**Bottom line:**

- Tests = 100% reproducible without sharing production data
- Development = Share seed data if needed
- Production = Never share, only schema
