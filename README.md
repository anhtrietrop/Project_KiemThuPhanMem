Môn Kiểm thử phần mêm
Thành viên nhóm:
-Đỗ Anh Triết 3122411223
-Nguyễn Võ Minh Thư 3122411201
-Trần Nguyễn Phúc Mạnh 3112241121

# Electronics eCommerce - Tách Admin và User

Dự án này đã được tách thành 3 phần riêng biệt:

- **Frontend User**: Giao diện người dùng (shop, product, cart, checkout, wishlist)
- **Frontend Admin**: Giao diện quản trị (CRUD products, categories)
- **Backend**: API Server (Node.js + Express + Prisma + MySQL)

## 📁 Cấu trúc thư mục

```
web-electronic/
├── frontend-user/          # Next.js User Frontend (Port 3000)
├── frontend-admin/         # Next.js Admin Frontend (Port 3001)
├── backend/               # Node.js API Server (Port 3002)
└── README.md             # File này
```

## 🚀 Hướng dẫn cài đặt và chạy

### Cách nhanh (Windows)

1. Double-click: `setup-all.bat` để cài dependencies.
2. Tạo file .env trong backend, frontend-user, frontend-admin (sử dụng env-template.txt làm mẫu, sửa username/password MySQL).
3. cd backend && npx prisma migrate dev
4. cd backend/utills && node insertDemoData.js
5. Double-click: `start-all.bat` để chạy tất cả services.
6. Mở browser:
   - User: http://localhost:3000
   - Admin: http://localhost:3001

> 💡 **Chi tiết**: Xem các bước dưới đây hoặc [QUICK-START.md](./QUICK-START.md) để sử dụng scripts tự động

### Yêu cầu hệ thống

- Node.js (v18 trở lên)
- npm hoặc yarn
- MySQL (v8.0 trở lên) hoặc PostgreSQL

### 🎯 Cấu hình Port (Đã tách riêng)

- **Backend**: Port 3002
- **Frontend User**: Port 3000
- **Frontend Admin**: Port 3001

**✅ Lợi ích:** Session độc lập, có thể đăng nhập User và Admin đồng thời trên các tab khác nhau

### Bước 1: Cài đặt MySQL và tạo database

1. Tải và cài đặt MySQL: https://dev.mysql.com/downloads/installer/
2. Mở MySQL và tạo database:

```sql
CREATE DATABASE singitronic_nextjs_db;
```

### Bước 2: Tạo file cấu hình môi trường

**Cách 1: Tự động (Khuyến nghị)**

```bash
# Chạy script này để tạo tất cả file .env cần thiết
create-env-files.bat
```

**Cách 2: Thủ công**
**Thay thế user name(thường là root) và password của bạn**
Tạo file `backend/.env`:

```env
NODE_ENV=development
DATABASE_URL="mysql://username:password@localhost:3306/singitronic_nextjs_db"
PORT=3002
FRONTEND_USER_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3001
```

Tạo file `frontend-user/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
DATABASE_URL="mysql://root:password@localhost:3306/singitronic_nextjs_db"
NODE_ENV=development
```

Tạo file `frontend-admin/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
DATABASE_URL="mysql://root:password@localhost:3306/singitronic_nextjs_db"
NODE_ENV=development
```

### Bước 3: Cấu hình Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Chạy Prisma migration
npx prisma migrate dev

# Insert demo data
cd utills
node insertDemoData.js
node insertAdminUser.js
cd ..

# Chạy backend server
npm start
```

Backend sẽ chạy tại: **http://localhost:3002**

### Bước 4: Cấu hình và chạy Frontends

**Terminal 2 - Frontend User:**

```bash
cd frontend-user
npm install
npx prisma generate
npm run dev
```

Frontend User sẽ chạy tại: **http://localhost:3000**

**Terminal 3 - Frontend Admin:**

```bash
cd frontend-admin
npm install
npx prisma generate
npm run dev
```

Frontend Admin sẽ chạy tại: **http://localhost:3001**

## 🛠️ Scripts tiện ích

| Script                 | Mô tả                                    |
| ---------------------- | ---------------------------------------- |
| `create-env-files.bat` | Tạo tất cả file cấu hình môi trường      |
| `setup-all.bat`        | Cài đặt dependencies cho tất cả projects |
| `start-all.bat`        | Chạy tất cả services cùng lúc            |
| `stop-all.bat`         | Dừng tất cả services                     |
| `check-ports.bat`      | Kiểm tra ports có bị chiếm không         |

## 📝 Thông tin đăng nhập

Sau khi chạy `insertDemoData.js`, bạn sẽ có sẵn các tài khoản:

### Admin Account

- **URL**: http://localhost:3001/login (Trang đăng nhập riêng dành cho admin với giao diện nền xanh đậm)
- **Email**: admin@example.com
- **Password**: admin123
- **⚠️ LƯU Ý**: Chỉ tài khoản có `role='admin'` mới đăng nhập được vào Admin Panel. Script insertAdminUser.js tạo user này; thay đổi password trong production.

### User Account

- **URL**: http://localhost:3000/login
- **Email**: user@example.com (hoặc tạo mới)
- **Password**: (tạo khi register)
- **⚠️ LƯU Ý**: Tài khoản user KHÔNG thể đăng nhập vào Admin Panel

## 🔧 Chức năng theo vai trò

### User (Frontend User - Port 3000)

- ✅ Đăng nhập / Đăng ký (Email/Password)
- ✅ Xem danh sách sản phẩm (không cần đăng nhập)
- ✅ Xem chi tiết sản phẩm (không cần đăng nhập)
- ✅ Tìm kiếm sản phẩm (không cần đăng nhập)
- ✅ Thêm vào giỏ hàng (không cần đăng nhập)
- ✅ **Thanh toán (BẮT BUỘC đăng nhập)** 🔒
- ✅ Wishlist (yêu cầu đăng nhập)
- ✅ Xem danh mục (không cần đăng nhập)

### Admin (Frontend Admin - Port 3001)

- ✅ Đăng nhập (Email/Password - **CHỈ ADMIN**)
- ✅ CRUD Products (Thêm, Sửa, Xóa sản phẩm)
- ✅ CRUD Categories (Thêm, Sửa, Xóa danh mục)
- ✅ Quản lý Orders
- ✅ Quản lý Users
- ✅ Quản lý Merchants

## 🐛 Troubleshooting

### Lỗi kết nối database

- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong file .env
- Kiểm tra database đã được tạo chưa

### Lỗi port đã được sử dụng

- Đảm bảo mỗi service chạy trên port khác nhau:
  - Backend: 3002
  - Frontend User: 3000
  - Frontend Admin: 3001

### Lỗi không tìm thấy module

- Chạy `npm install` trong từng thư mục

### Lỗi "@prisma/client did not initialize yet"

- Chạy lệnh sau trong thư mục gặp lỗi:

```bash
npx prisma generate
```

### Lỗi "Access denied. Admin account required"

- Admin Panel chỉ cho phép tài khoản có `role='admin'`
- Kiểm tra database xem user có `role='admin'` chưa
- Tài khoản user thường KHÔNG thể đăng nhập vào Admin Panel

### Lỗi "Vui lòng đăng nhập để tiếp tục thanh toán"

- Đây là tính năng bảo mật mới
- Người dùng PHẢI đăng nhập trước khi checkout
- Có thể thêm vào giỏ hàng không cần đăng nhập, nhưng thanh toán bắt buộc đăng nhập

## 📦 Scripts hữu ích

### Backend

```bash
npm run start              # Chạy server
npm run logs              # Xem logs
npx prisma studio         # Mở Prisma Studio để xem database
```

### Frontend

```bash
npm run dev               # Chạy development mode
npm run build             # Build production
npm run start             # Chạy production
npm run lint              # Kiểm tra lỗi
```

## 🎯 Testing

Dự án này đã được tách riêng để dễ dàng:

- Unit testing cho từng component
- Integration testing cho API
- E2E testing cho user flows
- Docker containerization
- CI/CD với GitHub Actions (sẽ setup sau)

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra logs trong terminal
2. Kiểm tra database connection
3. Đảm bảo tất cả dependencies đã được cài đặt
4. Kiểm tra file .env đã được tạo đúng chưa

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
