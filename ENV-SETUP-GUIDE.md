# Hướng Dẫn Cấu Hình Environment Variables

## Cấu trúc Port đã được tách riêng:
- **Backend**: Port 3002
- **Frontend User**: Port 3000
- **Frontend Admin**: Port 3001

## Bước 1: Tạo file `.env.local` cho Frontend Admin

Tạo file `frontend-admin/.env.local` với nội dung:

```env
# Frontend Admin - Port 3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

## Bước 2: Tạo file `.env.local` cho Frontend User

Tạo file `frontend-user/.env.local` với nội dung:

```env
# Frontend User - Port 3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

## Bước 3: Tạo file `.env` cho Backend

Tạo file `backend/.env` với nội dung:

```env
# Backend - Port 3002
PORT=3002
NODE_ENV=development

# Frontend URLs
FRONTEND_USER_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3001

# Database (cập nhật thông tin database của bạn)
DATABASE_URL="postgresql://user:password@localhost:5432/web_electronic?schema=public"
```

## Bước 4: Chạy ứng dụng

### Cách 1: Sử dụng script tự động
```bash
start-all.bat
```

### Cách 2: Chạy thủ công từng service

**Terminal 1 - Backend:**
```bash
cd backend
node app.js
```

**Terminal 2 - Frontend User:**
```bash
cd frontend-user
npm run dev
```

**Terminal 3 - Frontend Admin:**
```bash
cd frontend-admin
npm run dev
```

## Kiểm tra

Sau khi chạy, bạn có thể truy cập:
- Frontend User: http://localhost:3000
- Frontend Admin: http://localhost:3001
- Backend API: http://localhost:3002

## Lợi ích của cấu hình này

✅ **Session độc lập**: Mỗi frontend có port riêng nên cookies và session không bị xung đột
✅ **Đăng nhập đồng thời**: Có thể đăng nhập user trên port 3000 và admin trên port 3001 cùng lúc
✅ **Dễ phát triển**: Có thể restart từng service mà không ảnh hưởng các service khác

## Lưu ý

- Đảm bảo không có service nào khác đang chạy trên các port 3000, 3001, 3002
- File `.env.local` và `.env` không được commit lên Git (đã có trong .gitignore)
- Nhớ thay đổi `NEXTAUTH_SECRET` thành một chuỗi bí mật khi deploy production

