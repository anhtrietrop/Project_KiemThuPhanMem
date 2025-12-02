# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL - CHI TIẾT

## ✅ KIỂM TRA TRƯỚC KHI DEPLOY:

✔️ **package.json ĐÃ CÓ Next.js** - KHÔNG CẦN SỬA GÌ!
```json
{
  "dependencies": {
    "next": "^15.5.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

---

## 📦 DEPLOY FRONTEND USER

### **BƯỚC 1: Import Project vào Vercel**

1. Truy cập: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Chọn: `anhtrietrop/Project_KiemThuPhanMem`
4. Click **"Import"**

### **BƯỚC 2: Configure Project Settings**

**⚠️ QUAN TRỌNG:**

- **Project Name:** `project-user` (hoặc tên bạn muốn)
- **Framework Preset:** `Next.js` (tự động detect)
- **Root Directory:** `frontend-user` ← **PHẢI SET ĐÚNG!**
- **Build Command:** `npm run build` (mặc định OK)
- **Output Directory:** `.next` (mặc định OK)
- **Install Command:** `npm install` (mặc định OK)

### **BƯỚC 3: Environment Variables**

Click **"Environment Variables"** → Add:

```env
NEXT_PUBLIC_API_BASE_URL=https://project-kiemthuphanmem-production.up.railway.app
NEXTAUTH_URL=https://your-project-user.vercel.app
NEXTAUTH_SECRET=MTdjNDIxNTMtNzA4Ni00NzM0LWIyY2ItODc5MDA3YzUwNGI2
DATABASE_URL=mysql://root:xxx@ballast.proxy.rlwy.net:39074/railway
NODE_ENV=production
```

**⚠️ LƯU Ý:**
- `NEXTAUTH_URL` sẽ là URL Vercel tạo ra (vd: `https://project-user-abc123.vercel.app`)
- Copy `DATABASE_URL` từ Railway MySQL Variables
- `NEXTAUTH_SECRET` dùng cùng với Backend

### **BƯỚC 4: Deploy**

Click **"Deploy"** → Đợi ~2-3 phút

### **BƯỚC 5: Lấy URL và Update lại NEXTAUTH_URL**

1. Sau khi deploy xong, copy URL (vd: `https://project-user-abc123.vercel.app`)
2. Vào **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` → Paste URL vừa copy
4. Click **"Save"**
5. Vào **Deployments** → Click **"Redeploy"**

---

## 📦 DEPLOY FRONTEND ADMIN

### **BƯỚC 1: Add New Project**

1. Vercel Dashboard → Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Chọn lại: `anhtrietrop/Project_KiemThuPhanMem`
4. Click **"Import"**

### **BƯỚC 2: Configure Project Settings**

**⚠️ QUAN TRỌNG:**

- **Project Name:** `project-admin`
- **Framework Preset:** `Next.js`
- **Root Directory:** `frontend-admin` ← **KHÁC VỚI USER!**
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### **BƯỚC 3: Environment Variables**

```env
NEXT_PUBLIC_API_BASE_URL=https://project-kiemthuphanmem-production.up.railway.app
NEXTAUTH_URL=https://your-project-admin.vercel.app
NEXTAUTH_SECRET=MTdjNDIxNTMtNzA4Ni00NzM0LWIyY2ItODc5MDA3YzUwNGI2
DATABASE_URL=mysql://root:xxx@ballast.proxy.rlwy.net:39074/railway
NODE_ENV=production
```

### **BƯỚC 4: Deploy & Update URL**

Tương tự như Frontend User

---

## 🔄 UPDATE RAILWAY BACKEND URLS

Sau khi có URLs từ Vercel:

1. Vào Railway → Service **"Project_KiemThuPhanMem"**
2. Tab **"Variables"**
3. Update:

```env
FRONTEND_USER_URL=https://project-user-abc123.vercel.app
FRONTEND_ADMIN_URL=https://project-admin-xyz456.vercel.app
MOMO_RETURN_URL=https://project-user-abc123.vercel.app/payment/success
MOMO_NOTIFY_URL=https://project-kiemthuphanmem-production.up.railway.app/api/payment/momo/callback
```

4. Railway sẽ tự động redeploy

---

## 🔧 TROUBLESHOOTING

### ❌ Lỗi: "No Next.js version could be detected"

**Nguyên nhân:** Root Directory chưa set

**Giải pháp:**
1. Vercel → Project Settings → General
2. **Root Directory:** `frontend-user` (hoặc `frontend-admin`)
3. Save → Redeploy

### ❌ Lỗi: "Module not found"

**Nguyên nhân:** Dependencies chưa cài

**Giải pháp:**
```bash
cd frontend-user  # hoặc frontend-admin
npm install
git add package-lock.json
git commit -m "Update package-lock"
git push origin main
```

### ❌ Lỗi: "NEXTAUTH_URL mismatch"

**Nguyên nhân:** NEXTAUTH_URL không khớp với domain

**Giải pháp:**
1. Copy chính xác URL từ Vercel
2. KHÔNG có trailing slash `/`
3. Redeploy

---

## 📋 CHECKLIST DEPLOY

**Frontend User:**
- [ ] Root Directory = `frontend-user`
- [ ] Framework = Next.js
- [ ] NEXTAUTH_URL = Vercel URL của User
- [ ] NEXT_PUBLIC_API_BASE_URL = Railway backend URL
- [ ] Deploy thành công

**Frontend Admin:**
- [ ] Root Directory = `frontend-admin`
- [ ] Framework = Next.js
- [ ] NEXTAUTH_URL = Vercel URL của Admin
- [ ] NEXT_PUBLIC_API_BASE_URL = Railway backend URL
- [ ] Deploy thành công

**Backend (Railway):**
- [ ] DATABASE_URL connected
- [ ] FRONTEND_USER_URL updated
- [ ] FRONTEND_ADMIN_URL updated
- [ ] Deploy thành công

---

## 🎯 KẾT QUẢ CUỐI CÙNG:

```
✅ Backend:  https://project-kiemthuphanmem-production.up.railway.app
✅ Frontend User:  https://project-user-abc123.vercel.app
✅ Frontend Admin: https://project-admin-xyz456.vercel.app
✅ Database: Railway MySQL (internal)
```

---

## 🚀 BẮT ĐẦU DEPLOY:

**Bước đầu tiên:** Truy cập https://vercel.com/new và làm theo hướng dẫn trên!

**Lưu ý:** Mỗi lần import repository, **BẮT BUỘC phải set Root Directory!**
