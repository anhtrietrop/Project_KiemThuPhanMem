# 🔄 How to Sync Database Across Team

## Quick Answer

**YES**, production database + test database **CÓ THỂ đồng bộ 100%** giữa các máy!

---

## 🎯 2 Strategies

### Strategy 1: Test Data via Seed Scripts (RECOMMENDED) ✅

**Cách hoạt động:**

1. Bạn viết code tạo sample data (`prisma/seed.js`)
2. Commit code vào Git
3. Mọi người pull code, chạy `npm run db:seed`
4. → Everyone có **GIỐNG HỆT** data

**Ưu điểm:**

- ✅ 100% reproducible
- ✅ Fast (< 10 seconds)
- ✅ Không cần share file lớn
- ✅ Tests luôn pass giống nhau

**Cách dùng:**

```bash
# Setup lần đầu
.\create-test-database-docker.bat  # Tạo empty DB
.\seed-test-database.bat           # Populate với sample data

# Tests sẽ pass trên tất cả máy
npm test
```

---

### Strategy 2: Share Production Data Snapshot (OPTIONAL) ⚠️

**Cách hoạt động:**

1. Export production data: `.\export-database.bat`
2. Share file qua Git LFS hoặc Google Drive
3. Mọi người import: `.\import-to-docker.bat`

**Khi nào dùng:**

- Demo với real data
- Bug reproduction
- Manual testing

**KHÔNG dùng cho:**

- ❌ Unit tests (quá lớn, chậm)
- ❌ CI/CD (không stable)

---

## 📋 Setup Instructions

### Lần đầu tiên (One-time setup):

```bash
# 1. Clone repository
git clone <repo>
cd Project_KiemThuPhanMem

# 2. Start Docker
docker compose up -d

# 3. Create test database + seed data
.\create-test-database-docker.bat
.\seed-test-database.bat

# 4. Run tests (should pass!)
cd backend
npm test
```

### Mỗi khi pull code mới:

```bash
# Pull latest changes
git pull

# Update database schema (if changed)
cd backend
npx prisma migrate deploy

# Re-seed if needed (optional)
npm run db:seed

# Run tests
npm test
```

---

## ✅ What's Synced?

| Item            | How                      | Synced?      |
| --------------- | ------------------------ | ------------ |
| Database Schema | Prisma migrations (Git)  | ✅ 100%      |
| Test Data       | Seed script (Git)        | ✅ 100%      |
| Docker Config   | docker-compose.yml (Git) | ✅ 100%      |
| Test Code       | .test.js files (Git)     | ✅ 100%      |
| Production Data | Optional (Git LFS/Cloud) | ⚠️ If needed |

---

## 🚀 Files Created

### 1. `prisma/seed.js`

Creates consistent sample data:

- Admin user (admin@singitronic.com / admin123)
- 5 test users (user1@test.com / admin123)
- 5 categories
- 30 products
- 3 sample orders
- 5 reviews

### 2. `seed-test-database.bat`

Automated script to:

- Run migrations
- Populate data
- Verify success

### 3. `docs/DATABASE_SYNC_STRATEGY.md`

Full technical documentation

---

## 🧪 Test Results

**Before seeding:**

```
❌ Tests fail with "no data found"
❌ Different results on different machines
```

**After seeding:**

```
✅ All tests pass consistently
✅ Same results on all machines
✅ Reproducible test environment
```

---

## 🔍 Verify Sync

**Check schema:**

```bash
npx prisma migrate status
# Should show: "Database is up to date"
```

**Check data:**

```bash
docker compose exec db mysql -u root -prootpassword123 test_ecommerce_db -e "SELECT COUNT(*) as products FROM product; SELECT COUNT(*) as users FROM user;"
```

Everyone should see:

- Products: 30
- Users: 6 (5 test users + 1 admin)

**Check tests:**

```bash
npm test
# Same pass/fail results on all machines
```

---

## 💡 Best Practices

### DO:

✅ Commit `prisma/seed.js` to Git
✅ Run `npm run db:seed` after pulling schema changes  
✅ Use seed data for development
✅ Keep seed data minimal (< 1000 records)

### DON'T:

❌ Commit large SQL dumps to Git (unless using LFS)
❌ Share production passwords
❌ Depend on specific production data in tests
❌ Skip migrations

---

## 🆘 Troubleshooting

**Problem:** Bạn có data khác với teammate

**Solution:**

```bash
# Reset về clean state
docker compose down -v
docker compose up -d
.\create-test-database-docker.bat
.\seed-test-database.bat
npm test  # Should match now
```

**Problem:** Tests pass trên máy bạn, fail trên máy bạn bè

**Solution:**

```bash
# Both run:
npx prisma migrate status  # Must show "up to date"
npm run db:seed            # Must complete successfully
npm test                   # Should have same results
```

---

## 📊 Summary

✅ **Schema sync:** Via Prisma migrations (Git)
✅ **Test data sync:** Via seed scripts (Git)  
✅ **Tests reproducibility:** 100% identical results
⚠️ **Production data:** Optional, for demo only

**Bottom line:**
Database **100% đồng bộ** giữa các máy using Git + Docker + Seed scripts!
