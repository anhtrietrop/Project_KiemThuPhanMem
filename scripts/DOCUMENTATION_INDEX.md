# 📖 Project Documentation Index

Quick navigation cho tất cả documentation trong project.

---

## 🚀 Quick Start

| File                                                  | Description              | Use When              |
| ----------------------------------------------------- | ------------------------ | --------------------- |
| [README.md](../README.md)                             | Project overview         | Bắt đầu project       |
| [DATABASE_SYNC_README.md](../DATABASE_SYNC_README.md) | Database quick reference | Làm việc với database |
| [scripts/README.md](./README.md)                      | Scripts guide            | Chạy scripts          |

**Most used commands:**

```bash
# Docker
docker-manager start    # Start all
docker-manager status   # Check status
docker-manager logs     # View logs

# Database
db init      # Initialize
db status    # Check status
db studio    # Open GUI
```

---

## 📚 Documentation by Topic

### 🗄️ Database & Migrations

| File                                                  | Purpose         | Detail Level             |
| ----------------------------------------------------- | --------------- | ------------------------ |
| [DATABASE_SYNC_README.md](../DATABASE_SYNC_README.md) | Quick reference | ⭐⭐⭐ Essential         |
| [DATABASE_SYNC_GUIDE.md](../DATABASE_SYNC_GUIDE.md)   | Complete guide  | ⭐⭐⭐⭐⭐ Comprehensive |
| [SETUP_COMPLETE.md](../SETUP_COMPLETE.md)             | Setup summary   | ⭐⭐⭐ Good overview     |
| [HOW_TO_SYNC_DATABASE.md](../HOW_TO_SYNC_DATABASE.md) | Old guide       | ❌ Deprecated            |

**Read order:**

1. DATABASE_SYNC_README.md (quick start)
2. SETUP_COMPLETE.md (overview)
3. DATABASE_SYNC_GUIDE.md (deep dive if needed)

---

### 🐳 Docker

| File                                                  | Purpose            |
| ----------------------------------------------------- | ------------------ |
| [docker-compose.yml](../docker-compose.yml)           | Development config |
| [docker-compose.prod.yml](../docker-compose.prod.yml) | Production config  |
| [DOCKER_QUICKSTART.md](../DOCKER_QUICKSTART.md)       | Docker guide       |

**Quick commands:**

```bash
docker-manager start     # Start
docker-manager rebuild   # Rebuild
docker-manager clean     # Clean up
```

---

### 🚀 Deployment

| File                                                        | Purpose               |
| ----------------------------------------------------------- | --------------------- |
| [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)               | Full deployment guide |
| [RAILWAY_VERCEL_CONFIG.md](../RAILWAY_VERCEL_CONFIG.md)     | Railway/Vercel setup  |
| [backend/railway.json](../backend/railway.json)             | Railway config        |
| [frontend-admin/vercel.json](../frontend-admin/vercel.json) | Vercel admin config   |
| [frontend-user/vercel.json](../frontend-user/vercel.json)   | Vercel user config    |

**Deployment flow:**

```bash
git push origin main
# → Railway auto-deploys backend + migrations
# → Vercel auto-deploys frontends
```

---

### 💰 Payment Integration

| File                                                      | Purpose            |
| --------------------------------------------------------- | ------------------ |
| [MOMO_INTEGRATION_GUIDE.md](../MOMO_INTEGRATION_GUIDE.md) | MoMo payment setup |

---

### 📜 Scripts

| File                                                      | Purpose              |
| --------------------------------------------------------- | -------------------- |
| [scripts/README.md](./README.md)                          | Scripts overview     |
| [scripts/deprecated/README.md](./deprecated/README.md)    | Old scripts          |
| [SCRIPTS_REORGANIZATION.md](../SCRIPTS_REORGANIZATION.md) | Reorganization notes |

**Active scripts:**

- `scripts/database/` - Database management
- `scripts/docker/` - Docker utilities

**Wrapper commands:**

- `db.bat` - Database operations
- `docker-manager.bat` - Docker operations

---

### 🔧 Development

| File                                                                | Purpose          |
| ------------------------------------------------------------------- | ---------------- |
| [backend/TEST_DATABASE_SETUP.md](../backend/TEST_DATABASE_SETUP.md) | Test DB setup    |
| [backend/docs/TEST_PLAN.md](../backend/docs/TEST_PLAN.md)           | Testing strategy |
| [DOCUMENTATION_SUMMARY.md](../DOCUMENTATION_SUMMARY.md)             | Doc summary      |

---

### 📊 CI/CD

| File                                                                                    | Purpose          |
| --------------------------------------------------------------------------------------- | ---------------- |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml)                                 | CI pipeline      |
| [.github/workflows/database-migration.yml](../.github/workflows/database-migration.yml) | Migration checks |
| [docs/CI_CD_SETUP_GUIDE.md](../docs/CI_CD_SETUP_GUIDE.md)                               | CI/CD setup      |

---

### 🗂️ Architecture

| File                                                                    | Purpose            |
| ----------------------------------------------------------------------- | ------------------ |
| [docs/UC_ANALYSIS.md](../docs/UC_ANALYSIS.md)                           | Use case analysis  |
| [docs/DATABASE_MIGRATION_GUIDE.md](../docs/DATABASE_MIGRATION_GUIDE.md) | Migration patterns |
| [docs/DATABASE_SYNC_STRATEGY.md](../docs/DATABASE_SYNC_STRATEGY.md)     | Sync strategy      |

---

## 🎯 By Use Case

### "Tôi muốn..."

#### ...setup project lần đầu

1. [README.md](../README.md) - Overview
2. [DATABASE_SYNC_README.md](../DATABASE_SYNC_README.md) - Database setup
3. Run: `docker-manager start && db init`

#### ...tạo migration mới

1. Edit `backend/prisma/schema.prisma`
2. Run: `db dev`
3. Commit changes
4. [DATABASE_SYNC_GUIDE.md](../DATABASE_SYNC_GUIDE.md) - Detailed guide

#### ...deploy lên production

1. [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
2. [RAILWAY_VERCEL_CONFIG.md](../RAILWAY_VERCEL_CONFIG.md)
3. Run: `git push origin main` (auto-deploys!)

#### ...fix migration lỗi

1. [DATABASE_SYNC_GUIDE.md](../DATABASE_SYNC_GUIDE.md) - Troubleshooting section
2. [SETUP_COMPLETE.md](../SETUP_COMPLETE.md) - Common fixes

#### ...hiểu scripts

1. [scripts/README.md](./README.md)
2. [SCRIPTS_REORGANIZATION.md](../SCRIPTS_REORGANIZATION.md)

#### ...setup payment

1. [MOMO_INTEGRATION_GUIDE.md](../MOMO_INTEGRATION_GUIDE.md)

---

## 📁 File Organization

```
project/
├── README.md                          ← Start here
├── DATABASE_SYNC_README.md            ← Database quick ref ⭐
├── DATABASE_SYNC_GUIDE.md             ← Database complete guide
├── SETUP_COMPLETE.md                  ← Setup summary
├── SCRIPTS_REORGANIZATION.md          ← Scripts info
│
├── DEPLOYMENT_GUIDE.md                ← Deploy guide
├── RAILWAY_VERCEL_CONFIG.md           ← Platform configs
├── MOMO_INTEGRATION_GUIDE.md          ← Payment setup
├── DOCKER_QUICKSTART.md               ← Docker guide
├── DOCUMENTATION_SUMMARY.md           ← Doc summary
│
├── docker-compose.yml                 ← Docker dev
├── docker-compose.prod.yml            ← Docker prod
│
├── db.bat                             ← Database CLI ⭐
├── docker-manager.bat                 ← Docker CLI ⭐
│
├── scripts/
│   ├── README.md                      ← Scripts guide ⭐
│   ├── database/                      ← DB scripts
│   ├── docker/                        ← Docker scripts
│   └── deprecated/                    ← Old scripts
│
├── backend/
│   ├── railway.json                   ← Railway config
│   ├── prisma/schema.prisma           ← DB schema
│   ├── prisma/migrations/             ← Migrations
│   └── docs/                          ← Backend docs
│
├── frontend-admin/
│   └── vercel.json                    ← Vercel config
│
├── frontend-user/
│   └── vercel.json                    ← Vercel config
│
└── docs/
    ├── CI_CD_SETUP_GUIDE.md
    ├── DATABASE_MIGRATION_GUIDE.md
    └── ...
```

---

## ⭐ Most Important Files

1. **README.md** - Project overview
2. **DATABASE_SYNC_README.md** - Quick database reference
3. **scripts/README.md** - Scripts guide
4. **db.bat** / **docker-manager.bat** - CLI tools
5. **DEPLOYMENT_GUIDE.md** - Deploy instructions

---

## 🔄 Update History

- **2025-12-03**: Scripts reorganization, new wrapper commands
- **2025-12**: Database sync system implementation
- **2024**: Initial project setup

---

**Tip:** Bookmark this file để quick access tất cả documentation! 📌
