# 📁 Cấu trúc dự án đã tách

## Tổng quan

Dự án gốc đã được tách thành 3 phần độc lập:

```
web-electronic/
├── backend/              # Node.js + Express API Server
├── frontend-user/        # Next.js User Interface  
├── frontend-admin/       # Next.js Admin Interface
├── README.md            # Hướng dẫn chi tiết
├── QUICK-START.md       # Hướng dẫn nhanh
├── setup-all.bat        # Script cài đặt tất cả
└── start-all.bat        # Script khởi động tất cả
```

## 🔧 Backend (Port 3002)

**Chức năng**: API Server cho cả User và Admin

**Thư mục**: `backend/`

**Nội dung**:
- ✅ Express server với CORS
- ✅ Prisma ORM + MySQL
- ✅ Controllers cho Products, Categories, Orders, Users, etc.
- ✅ Rate limiting và request logging
- ✅ Error handling
- ✅ Middleware authentication

**API Endpoints**:
- `/api/products` - Quản lý sản phẩm
- `/api/categories` - Quản lý danh mục
- `/api/users` - Quản lý người dùng
- `/api/orders` - Quản lý đơn hàng
- `/api/wishlist` - Wishlist
- `/api/search` - Tìm kiếm
- `/api/notifications` - Thông báo
- `/api/merchants` - Quản lý merchants

**File quan trọng**:
- `app.js` - Entry point
- `prisma/schema.prisma` - Database schema
- `utills/insertDemoData.js` - Demo data script

## 👥 Frontend User (Port 3000)

**Chức năng**: Giao diện cho người dùng cuối

**Thư mục**: `frontend-user/`

**Pages**:
- ✅ `/` - Trang chủ
- ✅ `/login` - Đăng nhập
- ✅ `/register` - Đăng ký
- ✅ `/shop` - Danh sách sản phẩm
- ✅ `/product/[slug]` - Chi tiết sản phẩm
- ✅ `/search` - Tìm kiếm
- ✅ `/cart` - Giỏ hàng
- ✅ `/checkout` - Thanh toán
- ✅ `/wishlist` - Danh sách yêu thích
- ✅ `/notifications` - Thông báo

**Components**:
- Header, Footer
- ProductItem, Products
- CartElement, WishItem
- Filters, SearchInput
- CategoryMenu
- và nhiều components khác...

**State Management**:
- Zustand stores (cart, wishlist, pagination, sort, notification)

## 🔐 Frontend Admin (Port 3001)

**Chức năng**: Giao diện quản trị

**Thư mục**: `frontend-admin/`

**Pages**:
- ✅ `/` - Redirect to /admin
- ✅ `/login` - Đăng nhập admin
- ✅ `/admin` - Dashboard chính
- ✅ `/admin/products` - Quản lý sản phẩm (List, Create, Edit, Delete)
- ✅ `/admin/categories` - Quản lý danh mục (List, Create, Edit, Delete)
- ✅ `/admin/orders` - Quản lý đơn hàng
- ✅ `/admin/users` - Quản lý người dùng
- ✅ `/admin/merchant` - Quản lý merchants

**Bảo mật**:
- Middleware kiểm tra role='admin'
- Protected routes
- NextAuth.js authentication

**Components**:
- DashboardSidebar
- DashboardProductTable
- AdminOrders
- StatsElement
- và tất cả components từ user (shared)

## 🔄 Shared Resources

### Components
Cả User và Admin đều share components từ `/components`:
- UI components (Button, Input, Modal, etc.)
- Business components (ProductItem, CategoryItem, etc.)

### Utils & Helpers
- `/utils` - Utility functions (auth, validation, db, etc.)
- `/helpers` - Helper functions
- `/hooks` - Custom React hooks
- `/lib` - Libraries và configs

### Prisma Schema
Cả 3 projects đều dùng chung schema nhưng mỗi project có prisma client riêng.

## 🗄️ Database Structure

**Models**:
- User (với role: 'user' | 'admin')
- Product
- Category
- Customer_order
- Wishlist
- Notification
- Merchant
- Image

## 🚦 Ports

| Service | Port | URL |
|---------|------|-----|
| Backend | 3002 | http://localhost:3002 |
| Frontend User | 3000 | http://localhost:3000 |
| Frontend Admin | 3001 | http://localhost:3001 |

## 🔑 Authentication Flow

### User Flow:
1. User truy cập http://localhost:3000
2. Register/Login qua NextAuth
3. Token được lưu trong session
4. Gọi API tới backend:3002

### Admin Flow:
1. Admin truy cập http://localhost:3001
2. Login với account có role='admin'
3. Middleware check admin role
4. Nếu không phải admin → redirect về home
5. Admin có quyền CRUD products/categories

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
DATABASE_URL=mysql://...
PORT=3002
```

### Frontend User (.env)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
DATABASE_URL=mysql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

### Frontend Admin (.env)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
DATABASE_URL=mysql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3001
```

## 🎯 Lợi ích của việc tách

### 1. **Separation of Concerns**
- User và Admin logic hoàn toàn tách biệt
- Dễ maintain và scale

### 2. **Security**
- Admin routes không expose cho users
- Có thể deploy Admin riêng với security cao hơn
- Rate limiting riêng cho từng service

### 3. **Testing**
- Có thể test User và Admin độc lập
- Unit test, Integration test dễ dàng hơn
- E2E test rõ ràng hơn

### 4. **Deployment**
- Deploy riêng từng service
- Scale độc lập (User nhiều traffic hơn Admin)
- CI/CD dễ dàng với Docker

### 5. **Team Collaboration**
- Team Frontend User làm riêng
- Team Frontend Admin làm riêng
- Team Backend support cả 2

## 🔮 Next Steps (Tương lai)

- [ ] Docker containers cho mỗi service
- [ ] docker-compose.yml để chạy tất cả
- [ ] GitHub Actions CI/CD
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests (Playwright/Cypress)
- [ ] API documentation (Swagger)
- [ ] Environment-based configs (dev, staging, prod)

## 📚 Documentation

- `README.md` - Hướng dẫn chi tiết cài đặt
- `QUICK-START.md` - Hướng dẫn nhanh
- `STRUCTURE.md` - File này, giải thích cấu trúc

## 🤝 Contributing

Khi thêm tính năng mới:
1. Backend: Thêm API endpoint trong `backend/`
2. User: Thêm page/component trong `frontend-user/`
3. Admin: Thêm page/component trong `frontend-admin/`
4. Update documentation

## 📞 Support

Nếu có vấn đề:
1. Check logs trong terminal
2. Check database connection
3. Check .env files
4. Check README.md Troubleshooting section

