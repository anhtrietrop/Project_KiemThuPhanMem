# 🚀 Hướng dẫn Deploy lên Railway & Vercel

## 📋 Tổng quan

- **Backend API:** Railway (Node.js + Express)
- **Database:** Railway MySQL (đã setup)
- **Frontend User:** Vercel (Next.js)
- **Frontend Admin:** Vercel (Next.js)

---

## 🛤️ BƯỚC 1: Deploy Backend lên Railway

### 1.1. Chuẩn bị Repository

```bash
# Đảm bảo code đã commit
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 1.2. Tạo Project trên Railway

1. Truy cập: https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Chọn repository: `Project_KiemThuPhanMem`
4. Railway sẽ tự động detect Node.js project

### 1.3. Cấu hình Environment Variables

Vào **Settings** → **Variables** và thêm:

```env
NODE_ENV=production
DATABASE_URL=mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway
PORT=3002
FRONTEND_USER_URL=https://your-app-user.vercel.app
FRONTEND_ADMIN_URL=https://your-app-admin.vercel.app
JWT_SECRET=<generate_random_string>
NEXTAUTH_SECRET=<generate_random_string>
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ENVIRONMENT=sandbox
```

**Generate JWT_SECRET & NEXTAUTH_SECRET:**
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

### 1.4. Cấu hình Build Settings

1. **Root Directory:** `backend`
2. **Build Command:** `npm install && npx prisma generate`
3. **Start Command:** `npx prisma migrate deploy && npm start`

### 1.5. Deploy

1. Click **"Deploy"**
2. Đợi build hoàn tất (~3-5 phút)
3. Lấy URL backend: `https://your-backend.up.railway.app`

### 1.6. Test Backend API

```bash
curl https://your-backend.up.railway.app/api/products
```

---

## ☁️ BƯỚC 2: Deploy Frontend User lên Vercel

### 2.1. Import Project

1. Truy cập: https://vercel.com
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Chọn repository: `Project_KiemThuPhanMem`
4. **Root Directory:** `frontend-user`

### 2.2. Cấu hình Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 2.3. Environment Variables

Thêm các biến môi trường:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NEXTAUTH_URL=https://your-app-user.vercel.app
NEXTAUTH_SECRET=<same_as_backend>
DATABASE_URL=mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway
```

### 2.4. Deploy

1. Click **"Deploy"**
2. Đợi build (~2-4 phút)
3. URL: `https://your-app-user.vercel.app`

---

## 🎛️ BƯỚC 3: Deploy Frontend Admin lên Vercel

### 3.1. Thêm Project mới

1. Vercel Dashboard → **"Add New Project"**
2. Chọn cùng repository: `Project_KiemThuPhanMem`
3. **Root Directory:** `frontend-admin`

### 3.2. Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 3.3. Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NEXTAUTH_URL=https://your-app-admin.vercel.app
NEXTAUTH_SECRET=<same_as_backend>
DATABASE_URL=mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway
```

### 3.4. Deploy

1. Click **"Deploy"**
2. URL: `https://your-app-admin.vercel.app`

---

## 🔄 BƯỚC 4: Cập nhật CORS & URLs

### 4.1. Update Backend CORS

Sửa file `backend/app.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-app-user.vercel.app',
    'https://your-app-admin.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
```

### 4.2. Update Railway Environment

Quay lại Railway → Variables → Update:

```env
FRONTEND_USER_URL=https://your-app-user.vercel.app
FRONTEND_ADMIN_URL=https://your-app-admin.vercel.app
MOMO_RETURN_URL=https://your-app-user.vercel.app/payment/success
MOMO_NOTIFY_URL=https://your-backend.up.railway.app/api/payment/momo/callback
```

### 4.3. Redeploy

```bash
git add .
git commit -m "Update CORS and URLs for production"
git push origin main
```

Railway sẽ tự động redeploy.

---

## 🗄️ BƯỚC 5: Setup Database Migration

### 5.1. Run Migration lần đầu

Trên Railway dashboard:

1. Vào **Deployments** → Click vào deployment đang chạy
2. Mở **Terminal**
3. Chạy:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5.2. Hoặc chạy từ Local

```bash
# Set DATABASE_URL tạm thời
$env:DATABASE_URL="mysql://root:IiqZKswybcdsWzVAlDuzCZXBMfVjOjuH@hinkansen.proxy.rlwy.net:30513/railway"

# Run migration
cd backend
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

---

## ✅ BƯỚC 6: Kiểm tra & Test

### 6.1. Test Backend

```bash
curl https://your-backend.up.railway.app/api/products
curl https://your-backend.up.railway.app/api/categories
```

### 6.2. Test Frontend User

Truy cập: `https://your-app-user.vercel.app`

### 6.3. Test Frontend Admin

Truy cập: `https://your-app-admin.vercel.app`

### 6.4. Test Database Connection

```bash
# Prisma Studio
npx prisma studio
```

---

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to database"

**Giải pháp:**
```bash
# Kiểm tra DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Lỗi: "CORS blocked"

**Giải pháp:** Kiểm tra `app.js` đã thêm Vercel URLs vào CORS origin

### Lỗi: "Build failed on Vercel"

**Giải pháp:**
1. Check logs trên Vercel dashboard
2. Đảm bảo `package.json` có đầy đủ dependencies
3. Thử build local: `npm run build`

### Lỗi: "Prisma Client not generated"

**Giải pháp:**
```bash
# Railway Settings → Build Command
npm install && npx prisma generate && npx prisma migrate deploy
```

---

## 📊 Monitoring & Logs

### Railway Logs

```bash
# View logs
railway logs
```

### Vercel Logs

Dashboard → Project → Deployments → View Function Logs

---

## 🎯 Checklist Deploy

- [ ] Backend deployed lên Railway
- [ ] MySQL database đã setup trên Railway
- [ ] Prisma migration đã chạy
- [ ] Frontend User deployed lên Vercel
- [ ] Frontend Admin deployed lên Vercel
- [ ] Environment variables đã cập nhật đầy đủ
- [ ] CORS đã cấu hình đúng
- [ ] Test API endpoints hoạt động
- [ ] Test login/register
- [ ] Test CRUD operations
- [ ] Test MoMo payment (sandbox)

---

## 🔐 Security Notes

**QUAN TRỌNG:**
- ❌ KHÔNG commit file `.env` lên Git
- ✅ Sử dụng Railway/Vercel Environment Variables
- ✅ Generate JWT_SECRET mạnh (32+ characters)
- ✅ Bật HTTPS cho tất cả endpoints
- ✅ Giới hạn rate limiting trên production

---

## 📞 Support

Nếu gặp lỗi, check:
1. Railway deployment logs
2. Vercel function logs
3. Browser console (F12)
4. Network tab (API requests)

---

**Completed! 🎉**

URLs sau khi deploy:
- Backend: `https://your-backend.up.railway.app`
- Frontend User: `https://your-app-user.vercel.app`
- Frontend Admin: `https://your-app-admin.vercel.app`
