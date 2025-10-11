# 🔴 FIX: "Failed to fetch" Error

## ⚡ Quick Fix (5 phút)

### Nguyên nhân:
Backend đang sử dụng **Prisma client cũ** còn expect các fields `company`, `country`, `postalCode` đã bị xóa.

### Giải pháp nhanh:

**Bước 1:** Dừng tất cả services
- Trong terminal backend: `Ctrl + C`
- Trong terminal frontend-user: `Ctrl + C`  
- Trong terminal frontend-admin: `Ctrl + C`

**Hoặc dùng script:**
```bash
stop-all.bat
```

**Bước 2:** Chạy script tự động
```bash
restart-after-schema-change.bat
```

**Bước 3:** Chờ script generate xong, sau đó chạy:
```bash
start-all.bat
```

---

## 🛠️ Cách Thủ Công (nếu script không hoạt động)

### 1️⃣ Dừng Backend
Trong terminal đang chạy backend, nhấn `Ctrl + C`

Nếu không đóng được:
```bash
taskkill /F /IM node.exe
```

### 2️⃣ Generate Prisma Client cho Backend
```bash
cd backend
npx prisma generate
```

✅ **Thành công khi thấy:**
```
✔ Generated Prisma Client
```

❌ **Nếu lỗi EPERM:**
- Backend vẫn đang chạy → Kill process: `taskkill /F /IM node.exe`
- Thử lại: `npx prisma generate`

### 3️⃣ Generate Prisma Client cho Frontend User
```bash
cd frontend-user
npx prisma generate
```

### 4️⃣ Generate Prisma Client cho Frontend Admin
```bash
cd frontend-admin
npx prisma generate
```

### 5️⃣ Restart Backend
```bash
cd backend
node app.js
```

✅ **Backend chạy thành công khi thấy:**
```
Server running on port 3002
Rate limiting and request logging enabled
```

### 6️⃣ Restart Frontend User
```bash
cd frontend-user
npm run dev
```

### 7️⃣ Restart Frontend Admin
```bash
cd frontend-admin
npm run dev
```

---

## 🧪 Kiểm tra sau khi restart

### 1. Backend Health Check
Truy cập: http://localhost:3002/health

✅ **Kết quả đúng:**
```json
{
  "status": "OK",
  "timestamp": "...",
  "rateLimiting": "enabled"
}
```

### 2. Frontend User
Truy cập: http://localhost:3000

✅ Trang load bình thường
✅ Có thể thêm sản phẩm vào cart
✅ Checkout form không còn Company, Country, Postal Code

### 3. Frontend Admin
Truy cập: http://localhost:3001

✅ Trang login load bình thường
✅ Sau khi login, order list hiển thị đúng
✅ Xem chi tiết order không còn Company, Country, Postal Code

### 4. Test tạo order mới
1. Vào frontend-user: http://localhost:3000
2. Thêm sản phẩm vào cart
3. Đăng nhập (nếu chưa)
4. Vào checkout
5. Điền form (chỉ còn 6 fields bắt buộc):
   - Name ✓
   - Lastname ✓
   - Phone ✓
   - Email ✓
   - Address ✓
   - City ✓
   - Apartment (optional)
6. Submit order

✅ **Thành công:** "Order created successfully!"

❌ **Nếu vẫn "Failed to fetch":**
- Check backend có đang chạy không
- Check console backend có error không
- Check lại đã generate Prisma client chưa

---

## 📋 Checklist Troubleshooting

- [ ] Đã dừng tất cả services (backend + 2 frontends)
- [ ] Đã chạy `npx prisma generate` trong `backend/`
- [ ] Đã chạy `npx prisma generate` trong `frontend-user/`
- [ ] Đã chạy `npx prisma generate` trong `frontend-admin/`
- [ ] Đã restart backend → thấy "Server running on port 3002"
- [ ] Đã restart frontend-user → thấy "Ready on http://localhost:3000"
- [ ] Đã restart frontend-admin → thấy "Ready on http://localhost:3001"
- [ ] Backend health check OK: http://localhost:3002/health
- [ ] Có thể truy cập frontend-user
- [ ] Có thể truy cập frontend-admin
- [ ] Test tạo order mới thành công

---

## 🆘 Vẫn không được?

### Kiểm tra lỗi cụ thể:

**Lỗi 1: "Unknown field `company`"**
→ Backend chưa generate lại Prisma client
→ Giải pháp: Quay lại bước 2 (Generate Prisma Client)

**Lỗi 2: "Port 3002 already in use"**
→ Backend cũ vẫn đang chạy
→ Giải pháp: 
```bash
netstat -ano | findstr :3002
taskkill /PID [PID] /F
```

**Lỗi 3: Console warning "controlled/uncontrolled input"**
→ Đã được sửa trong code
→ Giải pháp: Restart frontend để load code mới

**Lỗi 4: Backend crash khi start**
→ Check console backend xem lỗi gì
→ Có thể do database connection issue
→ Check `backend/.env` có `DATABASE_URL` đúng không

---

## 📞 Debug Commands

### Kiểm tra process đang chạy:
```bash
# Windows
tasklist | findstr node
netstat -ano | findstr :3002
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Xem log backend:
```bash
cd backend
node app.js
# Xem console output
```

### Xem Prisma client version:
```bash
cd backend
npx prisma -v
```

### Force regenerate:
```bash
cd backend
rm -rf node_modules/.prisma
npx prisma generate
```

---

**Cập nhật:** October 11, 2025
**Tài liệu liên quan:** FORM-FIELDS-REMOVAL-SUMMARY.md

