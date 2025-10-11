# 🚀 Hướng dẫn chạy nhanh

## Cách 1: Tự động (Windows)

### Bước 1: Tạo file cấu hình môi trường

```bash
# Double click file này hoặc chạy trong terminal:
create-env-files.bat
```

Script này sẽ tự động tạo các file:
- `backend/.env` với port 3002
- `frontend-user/.env.local` với port 3000
- `frontend-admin/.env.local` với port 3001

**⚠️ Lưu ý:** Sau khi chạy, cập nhật thông tin database trong `backend/.env`

### Bước 2: Setup dependencies

```bash
# Double click file này hoặc chạy trong terminal:
setup-all.bat
```

### Bước 3: Setup Database

```bash
cd backend
npx prisma migrate dev
cd utills
node insertDemoData.js
cd ../..
```

### Bước 4: Chạy tất cả

```bash
# Double click file này hoặc chạy trong terminal:
start-all.bat
```

## 🎯 Cấu hình Port (Đã tách riêng)

- **Backend**: http://localhost:3002
- **Frontend User**: http://localhost:3000
- **Frontend Admin**: http://localhost:3001

**✅ Lợi ích:**
- Session độc lập cho User và Admin
- Có thể đăng nhập User ở tab này, Admin ở tab khác cùng lúc
- Không bị xung đột cookies

## Cách 2: Thủ công

### Terminal 1 - Backend

```bash
cd backend
npm install
# Tạo file .env (dùng create-env-files.bat)
npx prisma migrate dev
cd utills && node insertDemoData.js && cd ..
node app.js
```

### Terminal 2 - Frontend User

```bash
cd frontend-user
npm install
npx prisma generate
# Tạo file .env.local (dùng create-env-files.bat)
npm run dev
```

### Terminal 3 - Frontend Admin

```bash
cd frontend-admin
npm install
npx prisma generate
# Tạo file .env.local (dùng create-env-files.bat)
npm run dev
```

## ✅ Kiểm tra

Mở trình duyệt:

- User: http://localhost:3000
- Admin: http://localhost:3001
- Backend API: http://localhost:3002/health

## 🔐 Đăng nhập

Kiểm tra file `backend/utills/insertDemoData.js` để xem thông tin đăng nhập mặc định.

### User Account
- Tạo mới tại: http://localhost:3000/register
- Hoặc dùng demo account từ insertDemoData.js
- **LƯU Ý**: Phải đăng nhập mới thanh toán được

### Admin Account  
- **QUAN TRỌNG**: Chỉ tài khoản có `role='admin'` mới truy cập được
- Tạo trong database với `role='admin'`
- User thường KHÔNG thể truy cập Admin Panel
- Tự động logout nếu không phải admin

### Thay đổi Authentication
- ❌ Đã bỏ đăng nhập OAuth (Google, GitHub)
- ✅ Chỉ dùng Email/Password
- 🔒 Checkout yêu cầu đăng nhập
- 🔒 Admin Panel yêu cầu admin role

## ❓ Gặp lỗi?

Xem file README.md phần Troubleshooting.
