# ✅ Checklist - Setup & Run

## 📋 Pre-setup Checklist

Trước khi bắt đầu, đảm bảo bạn đã có:

- [ ] **Node.js** (v18 trở lên) - [Download](https://nodejs.org/)
- [ ] **MySQL** (v8.0 trở lên) - [Download](https://dev.mysql.com/downloads/installer/)
- [ ] **Git** (optional) - [Download](https://git-scm.com/)
- [ ] **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

## 🔧 Setup Checklist

### 1️⃣ Database Setup
- [ ] MySQL server đã chạy
- [ ] Tạo database: `CREATE DATABASE singitronic_nextjs;`
- [ ] Biết MySQL username và password

### 2️⃣ Backend Setup
- [ ] `cd backend`
- [ ] Copy `env-template.txt` thành `.env`
- [ ] Sửa database credentials trong `.env`
- [ ] Run `npm install`
- [ ] Run `npx prisma migrate dev`
- [ ] Run `cd utills && node insertDemoData.js`
- [ ] Test: `node app.js` → Should see "Server running on port 3002"

### 3️⃣ Frontend User Setup
- [ ] `cd frontend-user`
- [ ] Copy `env-template.txt` thành `.env`
- [ ] Sửa database credentials trong `.env`
- [ ] Run `npm install`
- [ ] Test: `npm run dev` → Should see "ready on http://localhost:3000"

### 4️⃣ Frontend Admin Setup
- [ ] `cd frontend-admin`
- [ ] Copy `env-template.txt` thành `.env`
- [ ] Sửa database credentials trong `.env`
- [ ] Run `npm install`
- [ ] Test: `npm run dev -- -p 3001` → Should see "ready on http://localhost:3001"

## 🚀 Running Checklist

### Automatic (Windows)
- [ ] Run `setup-all.bat` (first time only)
- [ ] Create `.env` files in all 3 folders
- [ ] Run database setup (step 2️⃣)
- [ ] Run `start-all.bat`
- [ ] Verify all services are running

### Manual
- [ ] Terminal 1: `cd backend && node app.js`
- [ ] Terminal 2: `cd frontend-user && npm run dev`
- [ ] Terminal 3: `cd frontend-admin && npm run dev -- -p 3001`
- [ ] Keep all terminals open

## ✓ Verification Checklist

### Backend (Port 3002)
- [ ] Visit: http://localhost:3002/health
- [ ] Should see: `{"status":"OK",...}`
- [ ] No errors in terminal

### Frontend User (Port 3000)
- [ ] Visit: http://localhost:3000
- [ ] Homepage loads với products
- [ ] Can navigate to /shop
- [ ] Can navigate to /login
- [ ] No console errors (F12)

### Frontend Admin (Port 3001)
- [ ] Visit: http://localhost:3001
- [ ] Redirects to /admin
- [ ] Can navigate to /login
- [ ] Login form visible
- [ ] No console errors (F12)

## 🧪 Testing Checklist

### User Flow
- [ ] Register new account at /register
- [ ] Login with new account
- [ ] Browse products at /shop
- [ ] View product detail
- [ ] Add to cart
- [ ] View cart
- [ ] Add to wishlist
- [ ] Search products

### Admin Flow
- [ ] Login with admin account
- [ ] View dashboard at /admin
- [ ] View products list
- [ ] Create new product
- [ ] Edit existing product
- [ ] Delete product
- [ ] View categories list
- [ ] Create new category
- [ ] Edit category
- [ ] Delete category

## 🐛 Troubleshooting Checklist

### Port Issues
- [ ] Port 3000 available? → `netstat -ano | findstr :3000`
- [ ] Port 3001 available? → `netstat -ano | findstr :3001`
- [ ] Port 3002 available? → `netstat -ano | findstr :3002`
- [ ] Kill process if needed: `taskkill /PID <PID> /F`

### Database Issues
- [ ] MySQL service running? → Check Services (Win+R → services.msc)
- [ ] Database exists? → `SHOW DATABASES;`
- [ ] Correct credentials in .env?
- [ ] Can connect? → `mysql -u username -p`

### Dependencies Issues
- [ ] node_modules exists in backend?
- [ ] node_modules exists in frontend-user?
- [ ] node_modules exists in frontend-admin?
- [ ] Run `npm install` if missing
- [ ] Delete node_modules and reinstall if corrupted

### Environment Issues
- [ ] .env exists in backend?
- [ ] .env exists in frontend-user?
- [ ] .env exists in frontend-admin?
- [ ] DATABASE_URL correct format?
- [ ] NEXTAUTH_SECRET set?
- [ ] NEXT_PUBLIC_API_BASE_URL set?

## 📊 Success Criteria

Tất cả điều sau đây phải đúng:

✅ **Backend**
- Chạy không có lỗi
- Health endpoint returns OK
- Logs visible trong terminal
- Database connection successful

✅ **Frontend User**
- Homepage loads
- Products visible
- Images load
- Navigation works
- Can register/login

✅ **Frontend Admin**
- Redirects to /admin
- Login page accessible
- Can login as admin
- Dashboard loads
- Can CRUD products/categories

✅ **Database**
- Tables created
- Demo data inserted
- Queries working
- No connection errors

## 🎉 Completion

Khi tất cả checkboxes đã tick:
- ✨ Setup hoàn tất!
- 🚀 Ready to develop!
- 💻 Happy coding!

## 📚 Next Steps

- [ ] Read STRUCTURE.md để hiểu architecture
- [ ] Explore codebase
- [ ] Try modifying a component
- [ ] Add new feature
- [ ] Write tests
- [ ] Setup Docker (future)
- [ ] Setup CI/CD (future)

---

**💡 TIP**: Save checklist này và dùng lại khi setup trên máy khác hoặc cho team members!

---

*Checklist Version: 1.0*
*Last Updated: October 2025*

