# 📁 Scripts Directory

Tổ chức các scripts quản lý database, Docker và utilities.

## 📂 Cấu trúc

```
scripts/
├── database/              ← Scripts quản lý database (ACTIVE)
│   ├── sync-database.bat      # Main migration management
│   ├── restore-database.bat   # Database restore from backup
│   └── migrate.bat            # Quick migration commands
│
├── docker/                ← Scripts quản lý Docker (ACTIVE)
│   └── check-ports.bat        # Check port availability
│
└── deprecated/            ← Scripts cũ (KHÔNG DÙNG NỮA)
    ├── import-to-docker.bat
    ├── import-to-railway.bat
    ├── export-database.bat
    ├── create-test-database.bat
    ├── create-test-database-docker.bat
    └── seed-test-database.bat
```

---

## 🚀 Quick Commands (Root Level)

Để dễ sử dụng, project có 2 wrapper scripts ở root:

### 1. `db.bat` - Database Management

```bash
# Khởi tạo database
db init

# Tạo migration mới
db dev

# Apply migrations
db deploy

# Sync Docker database
db docker

# Kiểm tra status
db status

# Mở Prisma Studio
db studio

# Validate migrations
db validate

# Reset database (dev only)
db reset

# Restore từ backup
db restore
```

### 2. `docker-manager.bat` - Docker Management

```bash
# Start containers
docker-manager start

# Stop containers
docker-manager stop

# Restart containers
docker-manager restart

# Rebuild all
docker-manager rebuild

# View logs
docker-manager logs
docker-manager logs backend

# Check status
docker-manager status

# Check ports
docker-manager check

# Clean up
docker-manager clean
```

---

## 📦 Scripts Chi Tiết

### Database Scripts (`scripts/database/`)

#### `sync-database.bat`

**Main migration management script**

```bash
# Usage
scripts\database\sync-database.bat <command>

# Commands
dev      - Tạo migration mới từ schema changes
deploy   - Apply migrations to database
docker   - Apply migrations in Docker container
reset    - Reset database and reapply all migrations
init     - Initialize database from scratch
```

**Examples:**

```bash
# Thay đổi schema.prisma rồi tạo migration
scripts\database\sync-database.bat dev
# → Nhập tên: add_payment_status

# Apply pending migrations
scripts\database\sync-database.bat deploy

# Sync Docker database
scripts\database\sync-database.bat docker

# Khởi tạo từ đầu
scripts\database\sync-database.bat init
```

---

#### `restore-database.bat`

**Restore database từ backup files**

```bash
# Usage
scripts\database\restore-database.bat <target>

# Targets
docker   - Restore to Docker MySQL
local    - Restore to local MySQL
```

**Examples:**

```bash
# Restore vào Docker
scripts\database\restore-database.bat docker

# Restore vào local MySQL
scripts\database\restore-database.bat local
```

**Process:**

1. Drop và recreate database
2. Push schema từ Prisma (`prisma db push`)
3. Mark migrations as applied
4. Import data từ `database_backup/data_only.sql`
5. Restart containers

---

#### `migrate.bat`

**Quick migration utility commands**

```bash
# Usage
scripts\database\migrate.bat <command>

# Commands
status    - Check migration status
validate  - Validate for dangerous operations
studio    - Open Prisma Studio (database GUI)
format    - Format schema.prisma file
```

**Examples:**

```bash
# Check migration status
scripts\database\migrate.bat status

# Open Prisma Studio
scripts\database\migrate.bat studio

# Validate migrations
scripts\database\migrate.bat validate
```

---

### Docker Scripts (`scripts/docker/`)

#### `check-ports.bat`

**Check port availability**

Kiểm tra các ports cần thiết:

- 3000 (Frontend User)
- 3001 (Frontend Admin)
- 3002 (Backend API)
- 3306/3307 (MySQL)

```bash
scripts\docker\check-ports.bat
```

---

## 🗑️ Deprecated Scripts

Scripts trong `scripts/deprecated/` **KHÔNG DÙNG NỮA**, được thay thế bởi:

| Old Script                        | Replaced By                           |
| --------------------------------- | ------------------------------------- |
| `import-to-docker.bat`            | `restore-database.bat docker`         |
| `import-to-railway.bat`           | Railway auto-deploy (railway.json)    |
| `export-database.bat`             | Can keep, but rarely used             |
| `create-test-database.bat`        | `db init` hoặc `restore-database.bat` |
| `create-test-database-docker.bat` | `restore-database.bat docker`         |
| `seed-test-database.bat`          | `npm run db:seed` (backend)           |

**Lý do deprecated:**

- ✅ Scripts mới sử dụng Prisma Migrate (chuẩn, an toàn hơn)
- ✅ Tự động đồng bộ migrations
- ✅ Tích hợp CI/CD
- ✅ Consistent across environments

---

## 🔄 Migration Workflow

### Development

```bash
# 1. Sửa schema
code backend/prisma/schema.prisma

# 2. Tạo migration
db dev
# hoặc: scripts\database\sync-database.bat dev

# 3. Test
npm run dev

# 4. Commit
git add .
git commit -m "feat: add new field"
git push
```

### Team Member Pull

```bash
# 1. Pull code
git pull

# 2. Apply migrations
db deploy
# hoặc: scripts\database\sync-database.bat deploy

# 3. Restart
npm run dev
```

### Docker Setup

```bash
# 1. Start Docker
docker-manager start

# 2. Init database
db init
# hoặc: scripts\database\sync-database.bat init

# 3. Check
db status
```

---

## 🛠️ Development Tips

### Quick Commands Reference

```bash
# DATABASE
db init          # Setup fresh database
db dev           # Create migration
db deploy        # Apply migrations
db docker        # Sync Docker DB
db status        # Check status
db studio        # Open GUI
db validate      # Check safety
db reset         # Reset DB (dev only)

# DOCKER
docker-manager start     # Start all
docker-manager stop      # Stop all
docker-manager restart   # Restart
docker-manager rebuild   # Rebuild + start
docker-manager logs      # View logs
docker-manager status    # Check status
docker-manager check     # Check ports
docker-manager clean     # Clean up
```

### Common Tasks

**Setup mới:**

```bash
docker-manager start
db init
db studio  # Verify data
```

**Thay đổi schema:**

```bash
# Edit schema.prisma
db dev
npm run dev  # Test
```

**Pull code mới:**

```bash
git pull
db deploy
npm run dev
```

**Reset Docker:**

```bash
docker-manager clean
docker-manager start
db init
```

---

## 📚 Documentation Links

- **DATABASE_SYNC_GUIDE.md** - Chi tiết đầy đủ
- **DATABASE_SYNC_README.md** - Quick reference
- **SETUP_COMPLETE.md** - Setup summary

---

## ⚠️ Important Notes

1. **Luôn dùng wrapper commands** (`db`, `docker-manager`) thay vì gọi trực tiếp scripts
2. **Không xóa folder deprecated** - giữ lại để reference nếu cần
3. **Migrations phải qua Git** - commit migrations vào repo
4. **Production tự động** - Railway/Vercel tự apply migrations

---

**Scripts đã được tổ chức lại để dễ quản lý và maintain! 🎉**
