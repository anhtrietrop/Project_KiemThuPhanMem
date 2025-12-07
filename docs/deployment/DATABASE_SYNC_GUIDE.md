# 🔄 Database Synchronization Guide

**Vị Trí:** `docs/deployment/DATABASE_SYNC_GUIDE.md`  
**Consolidates:** DATABASE_SYNC_README.md + DATABASE_SYNC_GUIDE.md + HOW_TO_SYNC_DATABASE.md  
**Cập Nhật:** 7/12/2025

---

## 📋 Tổng Quan

Với **MySQL** và **Prisma ORM**, việc đồng bộ database giữa các môi trường (Local, Docker, Railway, Vercel) được thực hiện qua **Prisma Migrations**.

### Quy Trình Chung

```
Schema Changes (schema.prisma)
    ↓
Create Migration (local)
    ↓
Commit & Push to Git
    ↓
GitHub Actions (validate)
    ↓
Auto-deploy migrations (Railway + Vercel)
```

---

## ⚡ Quick Start (TL;DR)

### Các Lệnh Thường Dùng

```bash
# 1. Khởi tạo database lần đầu
sync-database.bat init

# 2. Sửa schema → Tạo migration
sync-database.bat dev

# 3. Pull code mới có migration → Apply
sync-database.bat deploy

# 4. Rebuild Docker → Đồng bộ DB
sync-database.bat docker

# 5. Commit & Push → Auto-deploy!
git push origin main
```

---

## 🛠️ Chi Tiết Từng Tình Huống

### Tình Huống 1: Khởi Tạo Database Lần Đầu

**Khi nào:** Setup project mới, hoặc sau khi rebuild Docker

**Bước Thực Hiện:**

```bash
# Cách 1: Tự động (khuyến nghị)
sync-database.bat init
# → Database schema được tạo
# → Migrations được mark as applied
# → Data được import từ backup (nếu có)
# → Containers được restart

# Cách 2: Thủ công
cd backend
npx prisma db push
npx prisma migrate resolve --applied <migration_name>

# Cách 3: Chỉ schema, không có data
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma generate
```

**Kết Quả:**

- ✅ Database schema được tạo từ Prisma
- ✅ Migrations được mark as applied
- ✅ Data được import từ backup (nếu có)
- ✅ Containers được restart
- ✅ Prisma Client được generate

---

### Tình Huống 2: Sửa Schema (Development)

**Khi nào:** Bạn cần thêm table, field, relationship mới

**Bước Thực Hiện:**

```bash
# 1. Sửa schema
code backend/prisma/schema.prisma
# Ví dụ: Thêm field payment_status vào Order model

# 2. Tạo migration
sync-database.bat dev
# Hoặc thủ công:
# cd backend
# npx prisma migrate dev --name add_payment_status

# 3. Nhập tên migration (nếu được hỏi)
# → add_payment_status

# 4. Test local
npm run dev
# Kiểm tra ứng dụng chạy bình thường

# 5. Commit & Push
git add .
git commit -m "feat: add payment_status to orders"
git push origin main
```

**Kết Quả:**

- ✅ Migration được tạo: `backend/prisma/migrations/<timestamp>_add_payment_status/`
- ✅ Migration được apply vào database local
- ✅ Prisma Client được generate
- ✅ Đồng bộ sang frontend-admin và frontend-user
- ✅ GitHub Action kiểm tra migration
- ✅ Railway/Vercel tự động apply migration khi deploy

**File được tạo:**

```
backend/prisma/migrations/
├── 20241207120000_add_payment_status/
│   └── migration.sql
└── migration_lock.toml
```

---

### Tình Huống 3: Pull Code Mới Có Migration

**Khi nào:** Teammate đã push migration mới, bạn pull code

**Bước Thực Hiện:**

```bash
# 1. Pull code mới
git pull origin main

# 2. Apply migration vào database local
sync-database.bat deploy
# Hoặc thủ công:
# cd backend
# npx prisma migrate deploy
# npx prisma generate

# 3. Restart dev server
npm run dev
```

**Kết Quả:**

- ✅ Migration được apply vào database
- ✅ Prisma Client được generate
- ✅ Ứng dụng hoạt động với schema mới

---

### Tình Huống 4: Đồng Bộ Database Trong Docker

**Khi nào:** Sau khi rebuild Docker hoặc có migration mới

**Bước Thực Hiện:**

```bash
# Cách 1: Script tự động
sync-database.bat docker

# Cách 2: Thủ công
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma generate
docker compose restart backend frontend-admin frontend-user

# Cách 3: Rebuild toàn bộ
docker compose down
docker compose up --build
```

**Kết Quả:**

- ✅ Database được đồng bộ
- ✅ Prisma Client được generate
- ✅ Containers được restart
- ✅ Ứng dụng chạy với schema mới

---

### Tình Huống 5: Deploy lên Railway (Backend)

**Tự động:** Railway đã config sẵn trong `backend/railway.json`

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Quy Trình:**

```bash
# 1. Commit & Push code
git add .
git commit -m "feat: add new table"
git push origin main

# 2. Railway tự động:
#    ✓ Build: npm install && npx prisma generate
#    ✓ Deploy: npx prisma migrate deploy && npm start

# 3. Kết quả:
#    ✓ Migrations được apply vào production DB
#    ✓ Backend được restart với schema mới
```

**Không cần làm gì thêm!** ✅

---

### Tình Huống 6: Deploy lên Vercel (Frontends)

**Tự động:** Vercel đã config trong `frontend-admin/vercel.json` và `frontend-user/vercel.json`

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

**Quy Trình:**

```bash
# 1. Commit & Push code
git push origin main

# 2. Vercel tự động:
#    ✓ Build: prisma generate && next build
#    ✓ Deploy: next start

# 3. Kết Quả:
#    ✓ Prisma Client được generate từ migrations
#    ✓ Frontend được build & deploy
```

**Lưu Ý:** Frontend chỉ cần Prisma Client, không apply migrations (migrations được apply bởi Backend trên Railway)

---

## 📋 Complete Workflow (Thực Tế)

### Developer A: Sửa Schema & Push

```bash
# 1. Sửa schema
code backend/prisma/schema.prisma
# Thêm field: paymentMethod: string

# 2. Tạo & test migration
cd backend
npx prisma migrate dev --name add_payment_method
npm run dev
# ✓ Test OK

# 3. Commit & Push
git add .
git commit -m "feat: add payment_method field"
git push origin main
```

### Developer B: Pull & Sync

```bash
# 1. Pull code
git pull origin main

# 2. Apply migration
cd backend
npx prisma migrate deploy
npx prisma generate

# 3. Restart & test
npm run dev
# ✓ Ứng dụng hoạt động OK
```

### Production: Auto Deploy

```
GitHub (main branch)
    ↓
GitHub Actions (validate)
    ↓
Railway (backend)
    └─ npx prisma migrate deploy
    └─ npm start
    ↓
Vercel (frontends)
    └─ prisma generate
    └─ next build
    ↓
✅ LIVE
```

---

## 🔄 Test Data Sync Across Team

### Strategy 1: Seed Scripts (Khuyến Nghị) ✅

**Cách Hoạt Động:**

1. Bạn viết code tạo sample data (`backend/prisma/seed.js`)
2. Commit code vào Git
3. Mọi người pull code, chạy `npm run db:seed`
4. → Mọi người có **GIỐNG HỆT** test data

**Ưu Điểm:**

- ✅ 100% reproducible
- ✅ Fast (< 10 seconds)
- ✅ Không cần share file lớn
- ✅ Tests luôn pass giống nhau
- ✅ CI/CD luôn stable

**Cách Dùng:**

```bash
# Setup lần đầu
.\create-test-database-docker.bat  # Tạo empty DB
.\seed-test-database.bat           # Populate sample data

# Mỗi khi tests fail
npm run db:seed
npm test

# Kết Quả:
# ✓ Tất cả tests pass
# ✓ Data giống nhau
```

---

### Strategy 2: Share Production Snapshot (Tùy Chọn) ⚠️

**Cách Hoạt Động:**

1. Export production data: `.\export-database.bat`
2. Share file qua Git LFS hoặc Google Drive
3. Mọi người import: `.\import-to-docker.bat`

**Khi Nào Dùng:**

- Demo với real data
- Bug reproduction
- Manual testing

**KHÔNG Dùng Cho:**

- ❌ Unit tests (quá lớn, chậm)
- ❌ CI/CD (không stable)
- ❌ Production data exposure (security)

```bash
# Export
.\export-database.bat

# Share file (database_backup.sql)

# Import
.\import-to-docker.bat

# ⚠️ Lưu ý: Chỉ cho testing, không cho production
```

---

## 🚨 Troubleshooting

### Lỗi 1: "Migration Applied Twice"

```
Error: Migration "20240101000000_add_table" already applied
```

**Nguyên Nhân:** Bạn chạy `migrate deploy` 2 lần

**Cách Khắc Phục:**

```bash
# Không làm gì, thường OK
# Hoặc reset nếu cần
npx prisma migrate reset  # ⚠️ Xóa tất cả data!
```

---

### Lỗi 2: "Schema Drift"

```
Error: Database schema drift detected
```

**Nguyên Nhân:** DB schema không khớp với schema.prisma

**Cách Khắc Phục:**

```bash
# 1. Kiểm tra schema
npx prisma schema validate

# 2. Reconcile
npx prisma migrate resolve --rolled-back <migration_name>

# 3. Hoặc reset
npx prisma migrate reset
```

---

### Lỗi 3: "Cannot Create Migration"

```
Error: [P3018] A migration failed when applied to the shadow database
```

**Nguyên Nhân:** Migration SQL có lỗi

**Cách Khắc Phục:**

```bash
# 1. Kiểm tra file migration.sql
code backend/prisma/migrations/<timestamp>_<name>/migration.sql

# 2. Fix SQL
# Ví dụ: Sai cú pháp, type không được support

# 3. Retry
npx prisma migrate dev

# 4. Nếu vẫn fail, reset & redo
npx prisma migrate reset
npx prisma migrate dev --name <new_name>
```

---

### Lỗi 4: "Connection Refused"

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Nguyên Nhân:** MySQL không chạy

**Cách Khắc Phục:**

```bash
# 1. Kiểm tra Docker
docker ps

# 2. Start Docker (nếu chưa)
docker compose up -d

# 3. Kiểm tra DB connection
docker compose logs db

# 4. Retry
npx prisma migrate deploy
```

---

## 📚 Tham Khảo

- **Prisma Docs:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs

---

## 🔗 Liên Kết Liên Quan

- 📄 `docs/deployment/DATABASE_MIGRATION_GUIDE.md` - Chi tiết migrations
- 📄 `docs/architecture/DATABASE_SYNC_STRATEGY.md` - Chiến lược sync
- 📄 `backend/prisma/schema.prisma` - Database schema
- 📄 `backend/railway.json` - Railway config

---

## ✅ Checklist Setup Database

- [ ] Khởi tạo database lần đầu
- [ ] Test local: `npm run dev`
- [ ] Tạo test data: `npm run db:seed`
- [ ] Chạy tests: `npm test` (pass?)
- [ ] Docker working: `docker compose up -d`
- [ ] DB in Docker: `sync-database.bat docker`
- [ ] Deploy to Railway: (auto on push)
- [ ] Deploy to Vercel: (auto on push)

---

**Document Complete:** ✅  
**Consolidates:** 3 files (SYNC_README + SYNC_GUIDE + HOW_TO_SYNC)  
**All Content Preserved:** ✅
