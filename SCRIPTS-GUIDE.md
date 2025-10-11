# 🛠️ Hướng Dẫn Sử Dụng Scripts

## Danh sách Scripts

### 1. `create-env-files.bat` - Tạo file cấu hình
**Mô tả:** Tự động tạo các file `.env` và `.env.local` cho tất cả services

**Khi nào dùng:**
- Lần đầu setup project
- Khi xóa nhầm file .env
- Khi muốn reset cấu hình về mặc định

**Cách dùng:**
```bash
# Double click file hoặc:
create-env-files.bat
```

**Kết quả:**
- Tạo `backend/.env` với port 3002
- Tạo `frontend-user/.env.local` với port 3000
- Tạo `frontend-admin/.env.local` với port 3001

**Lưu ý:** ⚠️ Nhớ cập nhật `DATABASE_URL` trong `backend/.env` sau khi chạy

---

### 2. `setup-all.bat` - Cài đặt dependencies
**Mô tả:** Cài đặt `node_modules` cho cả 3 projects (backend, frontend-user, frontend-admin)

**Khi nào dùng:**
- Lần đầu clone project
- Sau khi xóa node_modules
- Khi thêm dependencies mới

**Cách dùng:**
```bash
# Double click file hoặc:
setup-all.bat
```

**Thời gian:** Khoảng 3-5 phút (tùy tốc độ internet)

---

### 3. `check-ports.bat` - Kiểm tra ports
**Mô tả:** Kiểm tra xem các port 3000, 3001, 3002 có đang được sử dụng không

**Khi nào dùng:**
- Trước khi chạy `start-all.bat`
- Khi gặp lỗi "Port already in use"
- Khi muốn kiểm tra trạng thái ports

**Cách dùng:**
```bash
# Double click file hoặc:
check-ports.bat
```

**Kết quả:**
```
✓ Port 3000 is available
✓ Port 3001 is available
✓ Port 3002 is available
```

Hoặc:
```
❌ Port 3000 is already in use
```

**Nếu port bị chiếm:**
1. Tìm PID: `netstat -ano | findstr :3000`
2. Kill process: `taskkill /PID [PID] /F`
3. Hoặc dùng `stop-all.bat`

---

### 4. `start-all.bat` - Chạy tất cả services
**Mô tả:** Khởi động Backend, Frontend User, và Frontend Admin cùng lúc

**Yêu cầu:**
- Đã chạy `create-env-files.bat`
- Đã chạy `setup-all.bat`
- Database đã được setup

**Cách dùng:**
```bash
# Double click file hoặc:
start-all.bat
```

**Kết quả:**
- 3 cửa sổ terminal mới được mở
- Backend chạy trên port 3002
- Frontend User chạy trên port 3000
- Frontend Admin chạy trên port 3001

**Truy cập:**
- http://localhost:3000 - User
- http://localhost:3001 - Admin
- http://localhost:3002 - Backend API

---

### 5. `stop-all.bat` - Dừng tất cả services
**Mô tả:** Dừng tất cả processes đang chạy trên các ports của project

**Khi nào dùng:**
- Sau khi xong việc coding
- Khi muốn restart lại toàn bộ
- Khi port bị chiếm không rõ lý do

**Cách dùng:**
```bash
# Double click file hoặc:
stop-all.bat
```

**Kết quả:**
```
✓ Stopped processes on port 3000
✓ Stopped processes on port 3001
✓ Stopped processes on port 3002
✓ Cleaned up Node processes
```

**⚠️ Lưu ý:** Script này sẽ kill TẤT CẢ processes Node.js đang chạy

---

## 📋 Workflow thông thường

### Lần đầu setup project

```bash
1. create-env-files.bat     # Tạo file cấu hình
2. Cập nhật DATABASE_URL    # Trong backend/.env
3. setup-all.bat            # Cài dependencies
4. Setup database           # Chạy migrations và insert data
5. start-all.bat            # Chạy tất cả services
```

### Hàng ngày

```bash
# Sáng: Bắt đầu làm việc
start-all.bat

# Code code code...

# Tối: Kết thúc
stop-all.bat
```

### Khi gặp lỗi

```bash
# Port bị chiếm
1. check-ports.bat          # Kiểm tra
2. stop-all.bat             # Dừng tất cả
3. start-all.bat            # Chạy lại

# Dependencies lỗi
1. Xóa node_modules ở 3 folders
2. setup-all.bat            # Cài lại
3. start-all.bat            # Chạy lại
```

---

## 🎯 Quick Commands

### Chạy từng service riêng lẻ

**Backend:**
```bash
cd backend
node app.js
```

**Frontend User:**
```bash
cd frontend-user
npm run dev
```

**Frontend Admin:**
```bash
cd frontend-admin
npm run dev
```

### Restart một service

**Chỉ restart Backend:**
```bash
# Trong terminal đang chạy backend, nhấn Ctrl+C
# Sau đó chạy lại:
node app.js
```

**Chỉ restart Frontend:**
```bash
# Trong terminal đang chạy frontend, nhấn Ctrl+C
# Sau đó chạy lại:
npm run dev
```

---

## ❓ FAQ

**Q: Tôi có thể chỉ chạy Backend và một Frontend không?**
A: Có, bạn chỉ cần mở 2 terminals và chạy riêng:
```bash
# Terminal 1
cd backend && node app.js

# Terminal 2
cd frontend-user && npm run dev
```

**Q: Script có hoạt động trên Mac/Linux không?**
A: Không, các script `.bat` chỉ cho Windows. Bạn cần chạy từng lệnh thủ công.

**Q: Tôi có thể đổi port không?**
A: Có, nhưng cần cập nhật nhiều nơi:
- `backend/app.js` - PORT
- `backend/.env` - PORT
- `frontend-*/.env.local` - NEXT_PUBLIC_API_BASE_URL, NEXTAUTH_URL
- `backend/app.js` - allowedOrigins (CORS)
- package.json scripts (nếu đổi frontend ports)

**Q: Sau khi chạy start-all.bat, tôi có thể đóng terminal chính không?**
A: Có, các service đang chạy trong terminal riêng của chúng.

**Q: Làm sao biết service đã chạy thành công?**
A: 
- Backend: Thấy "Server running on port 3002"
- Frontend: Thấy "Ready on http://localhost:3000" hoặc "...3001"
- Hoặc truy cập http://localhost:3002/health để test API

---

## 🔗 Tài liệu liên quan

- [QUICK-START.md](./QUICK-START.md) - Hướng dẫn chạy nhanh
- [ENV-SETUP-GUIDE.md](./ENV-SETUP-GUIDE.md) - Chi tiết cấu hình môi trường
- [PORT-CONFIGURATION-SUMMARY.md](./PORT-CONFIGURATION-SUMMARY.md) - Giải thích cấu hình ports
- [README.md](./README.md) - Documentation chính

---

**Cập nhật:** October 11, 2025

