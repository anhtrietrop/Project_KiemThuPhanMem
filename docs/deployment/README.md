# 📍 TRIỂN KHAI - Docker, Cloud, CI/CD

**Thư mục:** `docs/deployment/`

---

## 🎯 Mục Đích

Phần này giúp bạn **cài đặt, chạy, và triển khai** dự án.

Bao gồm:

- 🐳 Docker setup cho phát triển cục bộ
- ☁️ Triển khai lên Railway (backend) & Vercel (frontends)
- 🚀 CI/CD tự động hóa
- 🗄️ Migrations & database

---

## 📚 Các Tệp Trong Thư Mục Này

| Tệp                           | Mô Tả                                        | Khi Nào                        |
| ----------------------------- | -------------------------------------------- | ------------------------------ |
| `DOCKER_SETUP_GUIDE.md`       | Setup Docker local (dev environment)         | Cài đặt lần đầu                |
| `DEPLOYMENT_GUIDE.md`         | Triển khai vào production (Railway + Vercel) | Đưa lên production             |
| `RAILWAY_VERCEL_CONFIG.md`    | Cấu hình Railway & Vercel, auto-deploy       | Setup cloud platforms          |
| `DATABASE_MIGRATION_GUIDE.md` | Prisma migrations, seed data                 | Sửa lược đồ database           |
| `CI_CD_SETUP_GUIDE.md`        | GitHub Actions, auto-validation              | Tự động hóa tests trước deploy |
| `DEVOPS_SETUP.md`             | DevOps best practices, monitoring            | Production operations          |

---

## 🔗 Cấu Trúc Triển Khai

```
Local Dev (Docker Compose)
    ↓ git push
Git Repository (GitHub)
    ↓
GitHub Actions (Validate)
    ├─→ Run tests
    ├─→ Lint checks
    └─→ Build validation
    ↓
Railway (Backend + Auto-Migration)
    ↓
Vercel (Frontend-Admin)
Vercel (Frontend-User)
    ↓
🟢 Production Live
```

---

## ⏱️ Lộ Trình Triển Khai

### **🚀 Lần Đầu: Cài Đặt Local**

```
1. DOCKER_SETUP_GUIDE.md (30 phút)
   - Cài Docker Desktop
   - Cài đặt project
   - Chạy docker compose up

2. Kiểm tra: http://localhost:3000 & :3001
   - Admin: http://localhost:3001
   - Store: http://localhost:3000
   - API: http://localhost:3005
```

### **📝 Khi Sửa Database**

```
1. DATABASE_MIGRATION_GUIDE.md
   - Sửa schema
   - Tạo migration
   - Test local
   - Deploy automatic
```

### **☁️ Khi Triển Khai Production**

```
1. CI_CD_SETUP_GUIDE.md (nếu chưa setup)
   - Setup GitHub Actions

2. DEPLOYMENT_GUIDE.md
   - Chuẩn bị code
   - Commit & push

3. RAILWAY_VERCEL_CONFIG.md (nếu cần config)
   - Kiểm tra environment variables
   - Kiểm tra config

4. Theo dõi deployment logs
```

---

## 🔗 Liên Kết Theo Vai Trò

### **👨‍💻 Developer (Phát Triển Cục Bộ)**

```
1. DOCKER_SETUP_GUIDE.md (setup)
2. DATABASE_MIGRATION_GUIDE.md (nếu sửa DB)
3. CI_CD_SETUP_GUIDE.md (hiểu validation)
```

### **🚀 DevOps / Deployment**

```
1. DOCKER_SETUP_GUIDE.md (hiểu cấu trúc)
2. DEPLOYMENT_GUIDE.md (triển khai)
3. RAILWAY_VERCEL_CONFIG.md (cấu hình)
4. CI_CD_SETUP_GUIDE.md (automation)
5. DEVOPS_SETUP.md (production monitoring)
```

### **👔 Project Manager**

```
1. DEPLOYMENT_GUIDE.md (tiến trình triển khai)
2. CI_CD_SETUP_GUIDE.md (hiểu validation)
```

---

## 📊 Các Lệnh Thường Dùng

### **Docker (Local Dev)**

```bash
# Start all containers
docker compose up --build

# Stop
docker compose down

# View logs
docker compose logs -f

# Rebuild specific service
docker compose build backend
```

### **Database Migrations**

```bash
# Apply migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name description

# Reset database (dev only)
npx prisma migrate reset
```

### **Deployment**

```bash
# Trigger Railway deploy
git push origin main
# Railway auto-deploys backend

# Trigger Vercel deploy
git push origin main
# Vercel auto-deploys frontends
```

---

## 🎯 Trạng Thái Triển Khai Hiện Tại

```
✅ Local Docker: Working
   - 4 containers running
   - All services healthy

✅ Railway Backend: Deployed
   - Auto-migrate on push
   - Production database active

✅ Vercel Frontends: Deployed
   - Auto-generate Prisma client
   - Frontend-Admin live
   - Frontend-User live

✅ CI/CD: GitHub Actions
   - Tests validation on PR
   - Auto-deploy on merge
```

---

## 💡 Mẹo

✅ **Lần đầu?** → Bắt đầu với DOCKER_SETUP_GUIDE.md

✅ **Muốn deploy?** → Làm theo DEPLOYMENT_GUIDE.md

✅ **Sửa database?** → DATABASE_MIGRATION_GUIDE.md

✅ **Cần hiểu CI/CD?** → CI_CD_SETUP_GUIDE.md

✅ **Production issue?** → DEVOPS_SETUP.md + logs investigation

---

## 📞 Cần Giúp Đỡ?

- **Docker không chạy?** → DOCKER_SETUP_GUIDE.md (troubleshooting)
- **Migration fail?** → DATABASE_MIGRATION_GUIDE.md
- **Deploy fail?** → DEPLOYMENT_GUIDE.md + logs
- **CI/CD error?** → CI_CD_SETUP_GUIDE.md
- **Production issue?** → DEVOPS_SETUP.md
