# 🔄 Database Synchronization Guide

## Tổng quan

Với MySQL và Prisma, việc đồng bộ database giữa các môi trường (Local, Docker, Railway, Vercel) được thực hiện qua **Prisma Migrations**.

## 📋 Quy trình chung

```
Schema Changes (schema.prisma)
    ↓
Create Migration (local)
    ↓
Commit & Push to Git
    ↓
Auto-deploy migrations (Railway/Vercel)
```

---

## 🛠️ Các tình huống thường gặp

### 1️⃣ Tạo Migration Mới (Development)

**Khi nào:** Khi bạn thay đổi `schema.prisma` (thêm model, field, relationship...)

```bash
# Cách 1: Sử dụng script tự động
sync-database.bat dev

# Cách 2: Thủ công
cd backend
npx prisma migrate dev --name add_payment_table
npx prisma generate

# Copy sang frontends
xcopy /E /I /Y "prisma\migrations" "..\frontend-admin\prisma\migrations\"
xcopy /E /I /Y "prisma\migrations" "..\frontend-user\prisma\migrations\"
xcopy /Y "prisma\schema.prisma" "..\frontend-admin\prisma\"
xcopy /Y "prisma\schema.prisma" "..\frontend-user\prisma\"
```

**Kết quả:**

- Tạo file migration SQL trong `backend/prisma/migrations/`
- Apply migration vào database local
- Generate Prisma Client
- Đồng bộ sang frontend-admin và frontend-user

---

### 2️⃣ Đồng bộ Database Local với Migration mới

**Khi nào:** Khi bạn pull code mới có migration từ teammate

```bash
# Apply migrations
sync-database.bat deploy

# Hoặc thủ công
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

### 3️⃣ Đồng bộ Database trong Docker

**Khi nào:** Sau khi rebuild Docker hoặc có migration mới

```bash
# Cách 1: Script tự động
sync-database.bat docker

# Cách 2: Thủ công
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma generate

# Restart containers để load Prisma Client mới
docker compose restart backend frontend-admin frontend-user
```

---

### 4️⃣ Deploy lên Railway (Backend)

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

**Quy trình:**

1. Push code lên Git
2. Railway tự động:
   - Run `npm install && npx prisma generate`
   - Run `npx prisma migrate deploy` (apply migrations)
   - Start backend với `npm start`

**Không cần làm gì thêm!** ✅

---

### 5️⃣ Deploy lên Vercel (Frontends)

**Tự động:** Vercel đã config trong `frontend-admin/vercel.json` và `frontend-user/vercel.json`

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

**Quy trình:**

1. Push code lên Git
2. Vercel tự động:
   - Run `npm install`
   - Run `prisma generate` (tạo Prisma Client từ migrations)
   - Run `next build`

**Lưu ý:** Frontend chỉ cần Prisma Client, không apply migrations (migrations được apply bởi Backend trên Railway)

---

## 🔄 Workflow hoàn chỉnh

### A. Thay đổi Schema (Developer)

```bash
# 1. Sửa schema.prisma
code backend/prisma/schema.prisma

# 2. Tạo migration
sync-database.bat dev
# Nhập tên migration: add_momo_payment_table

# 3. Test local
npm run dev

# 4. Commit và push
git add .
git commit -m "feat: add MoMo payment table"
git push origin main
```

### B. Đồng bộ khi Pull code (Teammate)

```bash
# 1. Pull code
git pull origin main

# 2. Apply migrations mới
sync-database.bat deploy

# 3. Restart dev server
npm run dev
```

### C. Đồng bộ Docker

```bash
# 1. Rebuild Docker (nếu cần)
docker compose down -v
docker compose up -d --build

# 2. Apply migrations
sync-database.bat docker

# 3. Verify
docker compose logs -f backend
```

### D. Production Deploy

**Automatic!** Chỉ cần:

```bash
git push origin main
```

Railway và Vercel tự động:

- Pull code mới
- Apply migrations (Railway backend)
- Generate Prisma Client
- Deploy

---

## 🆘 Xử lý vấn đề

### ❌ Lỗi: "Migration failed - schema drift detected"

**Nguyên nhân:** Database production khác với migrations

**Giải pháp:**

```bash
# Option 1: Tạo migration để fix drift
npx prisma migrate dev --create-only --name fix_schema_drift
# Edit migration SQL nếu cần
npx prisma migrate deploy

# Option 2: Reset database (ONLY in dev!)
sync-database.bat reset
```

---

### ❌ Lỗi: "P3006: Migration already applied"

**Nguyên nhân:** Migration đã chạy rồi nhưng `_prisma_migrations` table không sync

**Giải pháp:**

```bash
# Mark migration as applied without running SQL
npx prisma migrate resolve --applied <migration_name>
```

---

### ❌ Lỗi: Docker container không có migrations

**Nguyên nhân:** Migrations chưa được copy vào Docker image

**Giải pháp:**

```bash
# 1. Check Dockerfile
# Đảm bảo có: COPY prisma ./prisma/

# 2. Rebuild
docker compose up -d --build

# 3. Apply migrations
docker compose exec backend npx prisma migrate deploy
```

---

### ❌ Railway/Vercel deploy failed do migration error

**Giải pháp:**

**Railway:**

```bash
# 1. Check logs
railway logs

# 2. Rollback migration nếu cần
railway run npx prisma migrate resolve --rolled-back <migration_name>

# 3. Redeploy
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

**Vercel:**

- Vercel không apply migrations, chỉ generate client
- Nếu lỗi, check Railway backend đã apply migration chưa

---

## 📊 Migration Best Practices

### ✅ DO

1. **Luôn tạo migration cho mọi schema change**

   ```bash
   npx prisma migrate dev --name descriptive_name
   ```

2. **Commit migrations vào Git**

   ```bash
   git add backend/prisma/migrations/
   ```

3. **Test migration trước khi push**

   ```bash
   # Test trên database local
   sync-database.bat reset
   npm run dev
   ```

4. **Review migration SQL**

   ```bash
   # Check file trong prisma/migrations/<timestamp>_<name>/migration.sql
   ```

5. **Sử dụng migration deploy cho production**
   ```bash
   npx prisma migrate deploy
   # NEVER use "migrate dev" in production!
   ```

### ❌ DON'T

1. **Không sửa migration đã commit**

   - Tạo migration mới để fix

2. **Không dùng `prisma db push` cho production**

   - Chỉ dùng cho prototype nhanh

3. **Không skip migration step**

   - Mọi thay đổi phải qua migration

4. **Không share database giữa dev và production**
   - Mỗi môi trường 1 database riêng

---

## 🔗 Cấu trúc Migration Files

```
backend/
  prisma/
    migrations/
      migration_lock.toml          # Lock file (commit vào Git)
      20240320142857_init/         # Migration đầu tiên
        migration.sql
      20240418151340_add_orders/   # Migration tiếp theo
        migration.sql
      20241203_add_momo_payment/   # Migration mới nhất
        migration.sql
    schema.prisma                  # Source of truth
```

**Luôn commit toàn bộ folder `migrations/`!**

---

## 🌍 Database URLs cho từng môi trường

### Local Development

```env
# .env
DATABASE_URL="mysql://root:password@localhost:3306/mydb"
```

### Docker

```env
# .env.docker
DATABASE_URL="mysql://root:rootpassword123@db:3306/singitronic_nextjs_db"
```

### Railway (Production Backend)

```env
# Railway auto-provides
DATABASE_URL="mysql://user:pass@containers-us-west-xxx.railway.app:3306/railway"
```

### Vercel (Frontend - same as Railway)

```env
# Vercel Environment Variables
DATABASE_URL="<copy from Railway>"
```

---

## 🎯 Quick Commands Reference

```bash
# Tạo migration mới
sync-database.bat dev

# Apply migrations
sync-database.bat deploy

# Sync Docker database
sync-database.bat docker

# Reset database (dev only)
sync-database.bat reset

# Check migration status
cd backend
npx prisma migrate status

# View database in browser
npx prisma studio
```

---

## 📞 Support

Nếu gặp vấn đề:

1. Check migration status: `npx prisma migrate status`
2. View logs: `docker compose logs backend` hoặc `railway logs`
3. Review migration SQL files
4. Check DATABASE_URL in environment variables

---

**Tóm lại:**

- ✅ **Local/Docker:** Sử dụng `sync-database.bat`
- ✅ **Railway/Vercel:** Tự động qua Git push (đã config sẵn)
- ✅ **Mọi thay đổi schema:** Qua Prisma Migrate
- ✅ **Không cần đồng bộ thủ công** giữa Railway và Vercel (cùng dùng 1 MySQL database)
