# 🔄 Database Sync - Quick Start

## TL;DR

```bash
# Khởi tạo database lần đầu (từ backup)
sync-database.bat init

# Thay đổi schema → Tạo migration
sync-database.bat dev

# Đồng bộ database local
sync-database.bat deploy

# Đồng bộ Docker
sync-database.bat docker

# Deploy production → Tự động!
git push origin main
```

---

## 🎯 Workflow chuẩn

### 0. Khởi tạo Database lần đầu ⭐

**Khi nào:** Setup project mới, hoặc sau khi rebuild Docker

```bash
# Cách 1: Tự động (khuyến nghị)
sync-database.bat init

# Cách 2: Thủ công
restore-database.bat docker

# Cách 3: Chỉ schema, không có data
cd backend
npx prisma db push
npx prisma migrate resolve --applied <migration_name>
```

**Kết quả:**

- ✅ Database schema được tạo từ Prisma
- ✅ Migrations được mark as applied
- ✅ Data được import từ backup (nếu có)
- ✅ Containers được restart

--- 1. Development (Thay đổi schema)

```bash
# Bước 1: Sửa schema
code backend/prisma/schema.prisma

# Bước 2: Tạo migration
sync-database.bat dev
# → Nhập tên: add_payment_status

# Bước 3: Test
npm run dev

# Bước 4: Commit
git add .
git commit -m "feat: add payment status to orders"
git push
```

**Kết quả:**

- ✅ Migration được tạo và test local
- ✅ Đồng bộ sang frontend-admin và frontend-user
- ✅ GitHub Action kiểm tra migration
- ✅ Railway/Vercel tự động apply migration khi deploy

---

### 2. Team Member (Pull code mới)

```bash
# Pull code có migration mới
git pull origin main

# Apply migration
sync-database.bat deploy

# Restart dev
npm run dev
```

---

### 3. Docker Sync

```bash
# Sau khi rebuild Docker hoặc có migration mới
sync-database.bat docker

# Hoặc thủ công
docker compose exec backend npx prisma migrate deploy
docker compose restart backend frontend-admin frontend-user
```

---

### 4. Production Deploy

**Tự động 100%!** Chỉ cần:

```bash
git push origin main
```

**Railway sẽ:**

1. Pull code mới
2. Run `npx prisma generate`
3. Run `npx prisma migrate deploy` (apply migrations)
4. Start backend

**Vercel sẽ:**

1. Pull code mới
2. Run `prisma generate` (generate client từ migrations)
3. Build Next.js apps

---

## ⚡ Quick Commands

```bash
# Khởi tạo database từ đầu
sync-database.bat init

# Restore database từ backup
restore-database.bat docker

# Kiểm tra migration status
migrate.bat status

# Validate migrations (check dangerous operations)
migrate.bat validate

# Mở Prisma Studio (GUI database)
migrate.bat studio

# Format schema file
migrate.bat format

# Reset database (DEV ONLY!)
sync-database.bat reset
```

---

## 🔍 Kiểm tra trước khi deploy

```bash
# 1. Validate migrations
cd backend
npm run migrate:validate

# 2. Check status
npx prisma migrate status

# 3. Review migration SQL
code prisma/migrations/<latest_migration>/migration.sql
```

---

## 🆘 Troubleshooting

### ❌ "Migration failed - schema drift"

```bash
# Tạo migration để fix drift
cd backend
npx prisma migrate dev --create-only --name fix_drift
# Review và edit migration SQL nếu cần
npx prisma migrate deploy
```

### ❌ Docker không có migrations

```bash
# Rebuild với migrations
docker compose down -v
docker compose up -d --build
sync-database.bat docker
```

### ❌ Railway deploy failed

```bash
# Check logs
railway logs

# Rollback migration
railway run npx prisma migrate resolve --rolled-back <migration_name>

# Redeploy
git commit --allow-empty -m "redeploy"
git push
```

---

## 📚 Chi tiết đầy đủ

Xem **DATABASE_SYNC_GUIDE.md** để biết:

- Cách xử lý migrations phức tạp
- Best practices
- Troubleshooting chi tiết
- Multi-environment setup

---

## ✅ Đã Config Sẵn

- ✅ Railway auto-migrate on deploy
- ✅ Vercel auto-generate Prisma Client
- ✅ Docker auto-migrate on container start
- ✅ GitHub Actions validate migrations on PR
- ✅ Scripts tự động cho mọi workflow

**Bạn chỉ cần focus vào code, migrations sẽ được handle tự động!** 🚀
