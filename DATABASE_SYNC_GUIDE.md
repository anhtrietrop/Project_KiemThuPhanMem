# 🔄 Hướng Dẫn Đồng Bộ Database giữa Local và Docker

## 📋 Tình huống của bạn

- **Development (code trên máy local)**: MySQL local tại `localhost:3306` - có data thật
- **Demo/Nộp bài (máy khác)**: Docker MySQL tại `localhost:3307` - cần data giống hệt

## 🎯 Quy trình đồng bộ

### **Workflow A: Development trên máy local**

1. Code và test với MySQL local (có data)

   ```
   backend/.env: DATABASE_URL="mysql://root:@localhost:3306/singitronic_nextjs_db"
   ```

2. Chạy backend local:
   ```bash
   cd backend
   npm run dev
   # Kết nối tới MySQL local port 3306
   ```

### **Workflow B: Chuẩn bị Demo/Nộp bài**

#### Bước 1: Export database từ MySQL local

**Cách 1: Dùng script tự động**

```bash
./export-database.bat
# Nhập mật khẩu MySQL khi được hỏi
# → Tạo file backup_singitronic.sql
```

**Cách 2: Dùng MySQL Workbench GUI**

1. Mở MySQL Workbench
2. Server → Data Export
3. Chọn database: `singitronic_nextjs_db`
4. Export to Self-Contained File: `backup_singitronic.sql`
5. Start Export

**Cách 3: Manual command (nếu biết đường dẫn MySQL)**

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p singitronic_nextjs_db > backup_singitronic.sql
```

#### Bước 2: Import vào Docker MySQL

```bash
# Đảm bảo Docker đang chạy
docker compose up -d

# Import data
./import-to-docker.bat

# Kiểm tra data đã import thành công
docker compose exec db mysql -u root -prootpassword123 -e "USE singitronic_nextjs_db; SELECT COUNT(*) FROM Product;"
```

#### Bước 3: Test Docker environment

```bash
# Kiểm tra API với Docker database
curl http://localhost:3002/api/products

# Mở frontend
start http://localhost:3000
start http://localhost:3001
```

---

## 🚀 Khi demo/nộp bài trên máy khác

### Bước 1: Copy toàn bộ project

```bash
# Copy cả folder Project_KiemThuPhanMem
# Bao gồm file backup_singitronic.sql
```

### Bước 2: Chạy trên máy mới

```bash
# 1. Start Docker containers
docker compose up -d

# 2. Import database
./import-to-docker.bat

# 3. Verify
curl http://localhost:3002/api/products
```

**✅ Kết quả**: Data giống hệt máy development!

---

## 📂 File cần commit lên Git

```
✅ docker-compose.yml
✅ .env.docker (template)
✅ backend/Dockerfile
✅ frontend-user/Dockerfile
✅ frontend-admin/Dockerfile
✅ backup_singitronic.sql (QUAN TRỌNG!)
✅ export-database.bat
✅ import-to-docker.bat
✅ setup-all.bat
✅ start-all.bat
❌ .env (chứa secrets, đã trong .gitignore)
❌ backend/.env (local config)
```

---

## 🔧 Troubleshooting

### Vấn đề 1: mysqldump not found

**Giải pháp**: Dùng MySQL Workbench GUI để export (dễ nhất)

### Vấn đề 2: Import failed

```bash
# Kiểm tra Docker MySQL đang chạy
docker compose ps

# Xem logs
docker compose logs db --tail=50

# Restart nếu cần
docker compose restart db
```

### Vấn đề 3: Data không hiển thị sau khi import

```bash
# Restart backend để reconnect database
docker compose restart backend

# Clear cache và test lại
curl http://localhost:3002/api/products
```

---

## 📋 Checklist trước khi demo

- [ ] Export database thành công (`backup_singitronic.sql` có dung lượng > 0KB)
- [ ] Import vào Docker thành công (không có lỗi)
- [ ] API trả về data đúng: `curl http://localhost:3002/api/products`
- [ ] Frontend hiển thị sản phẩm: `http://localhost:3000`
- [ ] Admin portal login được: `http://localhost:3001`
- [ ] Git đã commit tất cả file cần thiết
- [ ] `backup_singitronic.sql` đã được commit lên Git

---

## 🎓 Khi nộp bài cho giáo viên

### Chuẩn bị:

1. ✅ Code đầy đủ trên GitHub
2. ✅ File `backup_singitronic.sql` trong repo
3. ✅ File `DOCKER_QUICKSTART.md` hướng dẫn chạy
4. ✅ Tài liệu phân tích UC trong `docs/`

### Hướng dẫn chạy cho giáo viên:

```bash
# Clone repo
git clone <your-repo-url>
cd Project_KiemThuPhanMem

# Start Docker + Import data
docker compose up -d
./import-to-docker.bat

# Truy cập
http://localhost:3000  (User Frontend)
http://localhost:3001  (Admin Portal)
http://localhost:3002/api/products  (Backend API)
```

**⏱️ Thời gian setup**: ~5 phút (bao gồm cả download Docker images)

---

## 💡 Tips

### Cập nhật data thường xuyên:

```bash
# Sau mỗi lần thêm data quan trọng
./export-database.bat
git add backup_singitronic.sql
git commit -m "chore: update database backup with latest data"
git push
```

### Giữ 2 môi trường song song:

- **Local development**: MySQL local (:3306) - tốc độ nhanh, dễ debug
- **Docker environment**: MySQL Docker (:3307) - giống production, dễ deploy

### Automation (Optional):

Thêm vào `package.json`:

```json
{
  "scripts": {
    "export-db": "export-database.bat",
    "import-db": "import-to-docker.bat",
    "sync-db": "export-database.bat && import-to-docker.bat"
  }
}
```

---

## ✅ Tóm tắt

| Mục đích           | Database        | Port | Cách chạy                                      |
| ------------------ | --------------- | ---- | ---------------------------------------------- |
| Development (code) | MySQL Local     | 3306 | `npm run dev`                                  |
| Demo/Nộp bài       | MySQL Docker    | 3307 | `docker compose up`                            |
| Đồng bộ data       | Export → Import | -    | `export-database.bat` + `import-to-docker.bat` |

**🎯 Kết quả**: Code trên máy local, demo trên máy khác với **data giống hệt nhau**!
