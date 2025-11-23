# Test Database Setup Guide

## 🎯 Mục tiêu

Tạo database `test_ecommerce_db` để chạy 107 test cases tự động.

## ⚡ Quick Start (3 Options)

### 🐳 Option 1: Sử dụng Docker (KHUYẾN NGHỊ - Có sẵn data production)

**Ưu điểm:**

- ✅ Tự động import data từ production
- ✅ Isolated environment
- ✅ Dễ reset và cleanup

**Cách làm:**

```powershell
# Chạy script tự động
.\create-test-database-docker.bat
```

Hoặc thủ công:

```powershell
# 1. Start Docker containers
docker compose up -d

# 2. Tạo test database
docker compose exec db mysql -u root -prootpassword123 -e "CREATE DATABASE test_ecommerce_db;"

# 3. Import data (nếu có backup)
docker compose exec -T db mysql -u root -prootpassword123 test_ecommerce_db < database_backup\full_database_dump.sql

# 4. Cập nhật .env.test
# DATABASE_URL="mysql://root:rootpassword123@localhost:3306/test_ecommerce_db"
```

### 💻 Option 2: Sử dụng Local MySQL (Có sẵn data production)

**Ưu điểm:**

- ✅ Import data từ production database
- ✅ Tận dụng MySQL đang chạy

**Cách làm:**

```powershell
# Chạy script tự động
.\create-test-database.bat
```

Hoặc thủ công trong MySQL Workbench/Command Line:

```sql
-- 1. Tạo test database
CREATE DATABASE IF NOT EXISTS test_ecommerce_db;

-- 2. Import từ backup (nếu có file .sql)
-- File > Run SQL Script > chọn database_backup\full_database_dump.sql
-- Hoặc: mysql -u root test_ecommerce_db < database_backup\full_database_dump.sql
```

### 🆕 Option 3: Tạo Database Trống (Tests tự tạo data)

**Ưu điểm:**

- ✅ Đơn giản nhất
- ✅ Tests sẽ tự động tạo data cần thiết

**Cách làm:**

```sql
-- Chỉ cần tạo database
CREATE DATABASE IF NOT EXISTS test_ecommerce_db;
```

## 📝 Cấu hình .env.test

Sau khi tạo database, cập nhật `backend\.env.test`:

**Nếu dùng Docker:**

```env
DATABASE_URL="mysql://root:rootpassword123@localhost:3306/test_ecommerce_db"
```

**Nếu dùng Local MySQL:**

```env
DATABASE_URL="mysql://root:@localhost:3306/test_ecommerce_db"
```

## 🧪 Chạy Tests

```powershell
cd backend

# Chạy tất cả tests
npm test

# Chạy với coverage report
npm run test:coverage

# Chạy tests cho module cụ thể
npm test -- auth-user.test.js
npm test -- cart-wishlist.test.js

# Watch mode (development)
npm test -- --watch
```

## 🔍 Kiểm tra Database đã tạo thành công

**Docker:**

```powershell
docker compose exec db mysql -u root -prootpassword123 -e "SHOW DATABASES LIKE 'test%'; USE test_ecommerce_db; SHOW TABLES;"
```

**Local MySQL:**

```powershell
mysql -u root -e "SHOW DATABASES LIKE 'test%'; USE test_ecommerce_db; SHOW TABLES;"
```

**MySQL Workbench:**

- Connect to localhost
- Refresh schemas
- Xem `test_ecommerce_db` trong danh sách

## 📊 Test Data

### Nếu import từ production:

- ✅ Có sẵn users, products, categories, orders
- ✅ Tests sẽ chạy với real data structure
- ⚠️ Tests sẽ cleanup data sau mỗi run

### Nếu tạo database trống:

- ✅ Tests tự động tạo mock data
- ✅ Isolated, không ảnh hưởng production
- ✅ Consistent test data mỗi lần chạy

## ⚠️ Lưu ý

1. **KHÔNG dùng production database cho testing**

   - Tests sẽ xóa và modify data
   - Luôn dùng database riêng: `test_ecommerce_db`

2. **Database cleanup:**

   - Tests tự động cleanup sau mỗi test suite
   - Không cần manual cleanup

3. **Port conflicts:**
   - Docker MySQL: port 3306
   - Đảm bảo không có service khác dùng port này

## 🆘 Troubleshooting

### Lỗi: "Authentication failed"

```powershell
# Kiểm tra credentials trong .env.test
# Docker: root / rootpassword123
# Local: root / (empty password)
```

### Lỗi: "Database does not exist"

```powershell
# Chạy lại script tạo database
.\create-test-database.bat
# hoặc
.\create-test-database-docker.bat
```

### Lỗi: "Cannot find mysql.exe"

- **Option 1:** Dùng Docker (recommended)
- **Option 2:** Dùng MySQL Workbench GUI
- **Option 3:** Add MySQL bin folder to PATH

## 📚 Files hỗ trợ

- `create-test-database.bat` - Tạo test DB với Local MySQL
- `create-test-database-docker.bat` - Tạo test DB với Docker
- `create-test-db.sql` - SQL script manual
- `.env.test` - Test environment config
- `TEST_DATABASE_SETUP.md` - File này

## ✅ Checklist

- [ ] Test database đã được tạo
- [ ] `.env.test` đã được cấu hình đúng credentials
- [ ] MySQL/Docker đang chạy
- [ ] `npm install` đã chạy xong
- [ ] Chạy `npm test` để verify
