# ⚠️ Deprecated Scripts

Scripts trong folder này **KHÔNG DÙNG NỮA** và đã được thay thế bởi các scripts mới.

## 🔄 Migration Guide

| Old Script                        | Thay thế bởi             | Command                                                          |
| --------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| `import-to-docker.bat`            | `restore-database.bat`   | `db restore` hoặc `scripts\database\restore-database.bat docker` |
| `import-to-railway.bat`           | Railway auto-deploy      | Push code → Railway tự động migrate                              |
| `export-database.bat`             | Manual mysqldump         | Hoặc giữ lại nếu cần                                             |
| `create-test-database.bat`        | `sync-database.bat init` | `db init`                                                        |
| `create-test-database-docker.bat` | `restore-database.bat`   | `db restore`                                                     |
| `seed-test-database.bat`          | npm script               | `npm run db:seed` (trong backend)                                |

---

## ❌ Tại sao deprecated?

### 1. **Không dùng Prisma Migrations**

Scripts cũ import SQL trực tiếp → không track migration history

### 2. **Không đồng bộ**

Mỗi môi trường (local, Docker, Railway) có script riêng → dễ sai lệch

### 3. **Hard-coded credentials**

`import-to-railway.bat` có hard-coded database credentials → không an toàn

### 4. **Không tự động**

Cần chạy thủ công, không integrate với CI/CD

---

## ✅ Scripts mới tốt hơn như thế nào?

### 1. **Prisma Migrations**

```bash
db dev      # Tạo migration từ schema changes
db deploy   # Apply migrations (safe, tracked)
```

### 2. **Unified workflow**

```bash
db init     # Khởi tạo mọi môi trường giống nhau
db docker   # Sync Docker
```

### 3. **Environment variables**

Không hard-code credentials, dùng `.env` files

### 4. **Auto-deployment**

Railway/Vercel tự động apply migrations khi deploy

---

## 📦 Nếu vẫn cần dùng

**Chỉ giữ lại để reference**, nhưng khuyến nghị dùng scripts mới:

```bash
# Thay vì
scripts\deprecated\import-to-docker.bat

# Dùng
db restore
# hoặc
scripts\database\restore-database.bat docker
```

---

## 🗑️ Có thể xóa không?

**Có**, nhưng nên giữ lại trong vài sprint để:

- Reference nếu cần
- So sánh với scripts mới
- Rollback nếu có vấn đề

Sau khi confirm scripts mới hoạt động tốt (2-3 tuần), có thể xóa folder này.

---

**Sử dụng scripts mới trong `../database/` để quản lý database! 🚀**
