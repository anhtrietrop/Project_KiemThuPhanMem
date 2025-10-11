# 🎯 Tóm Tắt Cấu Hình Port

## ✅ Đã hoàn thành tách port cho Frontend User và Frontend Admin

### 📊 Cấu hình Port mới

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3002 | http://localhost:3002 |
| Frontend User | 3000 | http://localhost:3000 |
| Frontend Admin | 3001 | http://localhost:3001 |

## 🔧 Các file đã được cập nhật

### 1. Backend
- ✅ `backend/app.js` - Port đổi từ 3001 → 3002
- ✅ CORS đã được cấu hình để chấp nhận cả 2 frontend origins

### 2. Frontend Admin
- ✅ `frontend-admin/package.json` - Scripts đã thêm flag `-p 3001`
  ```json
  "dev": "next dev -p 3001"
  "start": "next start -p 3001"
  ```

### 3. Frontend User
- ✅ `frontend-user/package.json` - Scripts đã thêm flag `-p 3000`
  ```json
  "dev": "next dev -p 3000"
  "start": "next start -p 3000"
  ```

### 4. Scripts tự động
- ✅ `start-all.bat` - Đã cập nhật để chạy đúng ports
- ✅ `create-env-files.bat` - Script mới để tạo file cấu hình môi trường

### 5. Documentation
- ✅ `QUICK-START.md` - Đã cập nhật hướng dẫn
- ✅ `ENV-SETUP-GUIDE.md` - Hướng dẫn chi tiết cấu hình môi trường

## 🚀 Cách sử dụng

### Bước 1: Tạo file môi trường
```bash
create-env-files.bat
```

### Bước 2: Cập nhật thông tin database
Mở file `backend/.env` và cập nhật `DATABASE_URL`

### Bước 3: Chạy ứng dụng
```bash
start-all.bat
```

## 🎉 Lợi ích

### ✅ Session độc lập
- Mỗi frontend có port riêng biệt
- Cookies không bị xung đột giữa User và Admin

### ✅ Đăng nhập đồng thời
- **Tab 1**: Đăng nhập User tại http://localhost:3000
- **Tab 2**: Đăng nhập Admin tại http://localhost:3001
- Cả 2 session hoạt động độc lập, không can thiệp lẫn nhau

### ✅ Phát triển dễ dàng
- Restart một service không ảnh hưởng services khác
- Debug riêng biệt cho từng frontend
- Dễ dàng test authentication flows

## 🔐 Authentication Flow

### Kịch bản sử dụng
```
1. User đăng nhập tại localhost:3000
   → Cookie được lưu cho domain localhost:3000
   
2. Mở tab mới, truy cập localhost:3001
   → Admin đăng nhập hoàn toàn độc lập
   → Cookie được lưu cho domain localhost:3001
   
3. Cả 2 session hoạt động song song
   → User có thể mua hàng
   → Admin có thể quản lý orders
```

## ⚙️ Cấu hình Backend CORS

Backend đã được cấu hình để chấp nhận requests từ cả 2 frontends:

```javascript
const allowedOrigins = [
  'http://localhost:3000', // Frontend User
  'http://localhost:3001', // Frontend Admin
];
```

## 📝 Lưu ý quan trọng

1. **Không được chạy 2 services trên cùng port**
   - Kiểm tra không có service nào đang dùng port 3000, 3001, 3002

2. **File .env không được commit**
   - Các file `.env` và `.env.local` đã có trong `.gitignore`
   - Sử dụng `create-env-files.bat` để tạo lại khi cần

3. **NextAuth Configuration**
   - Mỗi frontend có `NEXTAUTH_URL` riêng
   - `NEXTAUTH_SECRET` nên giống nhau hoặc khác nhau tùy yêu cầu bảo mật

## 🐛 Troubleshooting

### Port đã được sử dụng
```
Error: Port 3000 is already in use
```
**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F
```

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Giải pháp:**
- Kiểm tra backend đang chạy trên port 3002
- Kiểm tra file .env.local có `NEXT_PUBLIC_API_BASE_URL=http://localhost:3002`

### Session không lưu
**Giải pháp:**
- Kiểm tra `NEXTAUTH_URL` trong file .env.local
- Clear cookies trong browser
- Restart cả backend và frontend

## 📚 Tài liệu tham khảo

- [ENV-SETUP-GUIDE.md](./ENV-SETUP-GUIDE.md) - Hướng dẫn chi tiết cấu hình
- [QUICK-START.md](./QUICK-START.md) - Hướng dẫn khởi chạy nhanh
- [README.md](./README.md) - Tài liệu dự án chính

---

**Ngày cập nhật:** October 11, 2025
**Phiên bản:** 2.0 - Port Configuration Update

