# 📝 HƯỚNG DẪN CONFIG RAILWAY VARIABLES

## 🎯 Dựa vào ảnh Railway của bạn:

**Railway Project Info:**

- Project ID: `329a2abb-c203-4b45-8369-f46a200e70c1`
- Environment: `production`
- Service: `Project_KiemThuPhanMem`

---

## 🔧 BƯỚC 1: Config Railway Variables cho Backend

Vào Railway Dashboard → Project → **Variables** tab → Add các biến sau:

### ✅ Database Connection

```
DATABASE_URL=mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway
```

### ✅ Environment

```
NODE_ENV=production
PORT=3002
```

### ✅ Generate JWT & Auth Secrets

**Chạy lệnh này trong PowerShell để generate:**

```powershell
# Generate JWT_SECRET
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# Generate NEXTAUTH_SECRET (chạy lại lệnh trên để có secret khác)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

**Sau đó add vào Railway:**

```
JWT_SECRET=<output_từ_lệnh_trên>
NEXTAUTH_SECRET=<output_từ_lệnh_thứ_2>
```

### ✅ Frontend URLs (tạm thời để localhost, sẽ update sau)

```
FRONTEND_USER_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3001
```

### ✅ MoMo Payment

```
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ENVIRONMENT=sandbox
MOMO_RETURN_URL=http://localhost:3000/payment/success
MOMO_NOTIFY_URL=http://localhost:3002/api/payment/momo/callback
```

---

## 🚀 BƯỚC 2: Deploy Backend lên Railway

### 2.1. Cấu hình Build Settings

Vào Railway → **Settings** tab:

**Root Directory:**

```
backend
```

**Build Command:**

```
npm install && npx prisma generate
```

**Start Command:**

```
npx prisma migrate deploy && node app.js
```

**Watch Paths:**

```
backend/**
```

### 2.2. Deploy

1. Click **"Deploy"** hoặc push code lên GitHub
2. Railway sẽ tự động build
3. Đợi ~2-5 phút
4. Lấy URL: `https://project-kiemthuphanmem-production.up.railway.app`

### 2.3. Test Backend API

```powershell
# Test health check
curl https://your-backend.up.railway.app/

# Test products API
curl https://your-backend.up.railway.app/api/products
```

---

## ☁️ BƯỚC 3: Deploy Frontend User lên Vercel

### 3.1. Import Project

1. Truy cập: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Chọn: `anhtrietrop/Project_KiemThuPhanMem`
4. **Root Directory:** `frontend-user`
5. **Framework Preset:** Next.js

### 3.2. Environment Variables

Add các variables sau vào Vercel:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
NEXTAUTH_URL=https://your-frontend-user.vercel.app
NEXTAUTH_SECRET=<COPY_TỪ_RAILWAY_JWT_SECRET>
DATABASE_URL=mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway
NODE_ENV=production
```

**⚠️ LƯU Ý:**

- `NEXTAUTH_URL` phải khớp với domain Vercel deploy ra
- `NEXTAUTH_SECRET` phải GIỐNG với backend

### 3.3. Deploy

1. Click **"Deploy"**
2. Đợi ~2-3 phút
3. Lấy URL: `https://project-user-xxx.vercel.app`

---

## 🎛️ BƯỚC 4: Deploy Frontend Admin lên Vercel

### 4.1. Add New Project

1. Vercel Dashboard → **"Add New Project"**
2. Import lại cùng repo: `anhtrietrop/Project_KiemThuPhanMem`
3. **Root Directory:** `frontend-admin`
4. **Framework Preset:** Next.js

### 4.2. Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
NEXTAUTH_URL=https://your-frontend-admin.vercel.app
NEXTAUTH_SECRET=<COPY_TỪ_RAILWAY_JWT_SECRET>
DATABASE_URL=mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway
NODE_ENV=production
```

### 4.3. Deploy

1. Click **"Deploy"**
2. Đợi ~2-3 phút
3. Lấy URL: `https://project-admin-xxx.vercel.app`

---

## 🔄 BƯỚC 5: Update URLs sau khi deploy

Sau khi có URLs từ Railway và Vercel, cần update lại:

### 5.1. Update Railway Variables

Vào Railway → Variables → Edit:

```
FRONTEND_USER_URL=https://project-user-xxx.vercel.app
FRONTEND_ADMIN_URL=https://project-admin-xxx.vercel.app
MOMO_RETURN_URL=https://project-user-xxx.vercel.app/payment/success
MOMO_NOTIFY_URL=https://your-backend.up.railway.app/api/payment/momo/callback
```

Click **Save** → Railway sẽ tự động redeploy

### 5.2. Update Vercel Environment Variables

**Frontend User:**

```
NEXTAUTH_URL=https://project-user-xxx.vercel.app
```

**Frontend Admin:**

```
NEXTAUTH_URL=https://project-admin-xxx.vercel.app
```

Click **Save** → Vercel sẽ tự động redeploy

---

## 🔐 BƯỚC 6: Cấu hình CORS trong Backend

Cần update file `backend/app.js` để cho phép Vercel domains:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://project-user-xxx.vercel.app",
      "https://project-admin-xxx.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);
```

Sau đó push code:

```powershell
git add .
git commit -m "Update CORS for production"
git push origin main
```

---

## 🗄️ BƯỚC 7: Run Database Migration

### 7.1. Từ Railway Terminal

1. Railway Dashboard → Deployment → Click **"View Logs"**
2. Mở **Terminal** tab
3. Chạy:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 7.2. Hoặc từ Local (khuyên dùng)

```powershell
cd backend

# Set DATABASE_URL tạm thời cho Railway
$env:DATABASE_URL="mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway"

# Run migration
npx prisma migrate deploy

# Seed data
npm run db:seed

# Hoặc
node prisma/seed.js
```

---

## ✅ BƯỚC 8: Kiểm tra hoạt động

### 8.1. Test Backend

```powershell
# Health check
curl https://your-backend.up.railway.app/

# API endpoints
curl https://your-backend.up.railway.app/api/products
curl https://your-backend.up.railway.app/api/categories
```

### 8.2. Test Frontend User

1. Truy cập: `https://project-user-xxx.vercel.app`
2. Thử đăng ký/đăng nhập
3. Xem danh sách sản phẩm
4. Thử thêm vào giỏ hàng

### 8.3. Test Frontend Admin

1. Truy cập: `https://project-admin-xxx.vercel.app`
2. Đăng nhập admin
3. Quản lý sản phẩm, đơn hàng

### 8.4. Test Database

```powershell
# Kết nối Prisma Studio
cd backend
$env:DATABASE_URL="mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway"
npx prisma studio
```

---

## 🔍 Troubleshooting

### ❌ Lỗi: "Cannot connect to database"

**Giải pháp:**

1. Check DATABASE_URL đúng format
2. Test connection:

```powershell
npx prisma db pull
```

### ❌ Lỗi: "CORS policy blocked"

**Giải pháp:**

1. Update `app.js` với Vercel URLs
2. Redeploy backend

### ❌ Lỗi: "NextAuth NEXTAUTH_URL mismatch"

**Giải pháp:**

1. Đảm bảo `NEXTAUTH_URL` khớp với domain deploy
2. Không có trailing slash `/` cuối URL
3. Redeploy frontend

### ❌ Lỗi: "Prisma Client not generated"

**Giải pháp:**

1. Railway Build Command phải có: `npx prisma generate`
2. Check logs trong Railway

---

## 📋 Checklist Deploy

- [ ] Railway backend deployed
- [ ] Railway variables configured
- [ ] JWT_SECRET & NEXTAUTH_SECRET generated
- [ ] Database migration completed
- [ ] Database seeded with initial data
- [ ] Frontend User deployed on Vercel
- [ ] Frontend Admin deployed on Vercel
- [ ] All environment variables set correctly
- [ ] CORS configured with production URLs
- [ ] URLs updated in all services
- [ ] Test API endpoints working
- [ ] Test frontend login/register
- [ ] Test CRUD operations
- [ ] Test payment flow (MoMo sandbox)

---

## 🎯 Final URLs

Sau khi hoàn tất, bạn sẽ có:

```
Backend API:     https://project-kiemthuphanmem-production.up.railway.app
Frontend User:   https://project-user-xxx.vercel.app
Frontend Admin:  https://project-admin-xxx.vercel.app
Database:        Railway MySQL (internal)
```

---

## 🔒 Security Checklist

- [ ] `.env` files KHÔNG được commit vào Git
- [ ] JWT secrets đủ mạnh (32+ chars)
- [ ] CORS chỉ cho phép trusted domains
- [ ] Database password đủ mạnh
- [ ] HTTPS enabled cho tất cả services
- [ ] Rate limiting enabled (production)

---

**✨ Deploy thành công! 🚀**
