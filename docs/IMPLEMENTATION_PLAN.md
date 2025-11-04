# 🚀 E-COMMERCE PROJECT - IMPLEMENTATION ROADMAP

> **Dự án:** Website thương mại điện tử (E-Commerce)  
> **Team:** Nhóm Do Anh Triet  
> **Tech Stack:** Next.js 15, Node.js, MySQL, Prisma, Docker  
> **Deployment:** Local (Docker) → Cloud (optional)

---

## 📚 TÀI LIỆU HƯỚNG DẪN

Tất cả tài liệu được tổ chức trong thư mục `docs/`:

### 1️⃣ **[UC_ANALYSIS.md](docs/UC_ANALYSIS.md)**

📊 Phân tích Use Cases và Checklist Verification

**Nội dung:**

- ✅ UC1: Core Features (Auth, Products, Categories, Search)
- ✅ UC2: Shopping Experience (Cart, Wishlist)
- ✅ UC3: Order & Payment (Orders, MoMo)
- ✅ UC4: Advanced Features (Notifications, Security)
- 📝 Checklist từng feature để verify implementation
- 🧪 Manual testing steps với PowerShell commands

**Đọc khi nào:**

- Bắt đầu dự án (để hiểu scope)
- Trước khi implement mỗi UC
- Khi cần verify feature đã hoàn thành chưa

---

### 2️⃣ **[DOCKER_SETUP_GUIDE.md](docs/DOCKER_SETUP_GUIDE.md)**

🐳 Hướng dẫn Setup Docker Local Deployment

**Nội dung:**

- Cách tạo Dockerfile cho backend, frontend-user, frontend-admin
- Cách tạo docker-compose.yml (full) và docker-compose.uc1.yml
- Environment variables configuration (.env.docker)
- Commands để build, run, stop containers
- Troubleshooting common issues (port conflicts, network, etc.)

**Đọc khi nào:**

- Lần đầu setup local development với Docker
- Khi gặp lỗi Docker
- Khi muốn deploy UC-specific environment

---

### 3️⃣ **[GIT_WORKFLOW_GUIDE.md](docs/GIT_WORKFLOW_GUIDE.md)**

🌳 Git Branching Strategy & CI/CD với GitHub Actions

**Nội dung:**

- Branch structure: main, uc1, uc2, uc3, uc4, feature/_, bugfix/_
- Pull Request workflow và template
- Commit message conventions (Conventional Commits)
- GitHub Actions CI/CD workflows (ci.yml, deploy-local.yml)
- Release management và versioning
- Branch protection rules

**Đọc khi nào:**

- Trước khi bắt đầu code (setup branches)
- Khi tạo Pull Request
- Khi setup GitHub Actions
- Khi merge UC vào main

---

### 4️⃣ **[DATABASE_MIGRATION_GUIDE.md](docs/DATABASE_MIGRATION_GUIDE.md)**

🗄️ Database Migration & Seed Data Management

**Nội dung:**

- Prisma migration workflow
- Schema changes cho từng UC
- Migration commands (migrate dev, deploy, reset)
- Seed scripts cho test data (seed-uc1.js, seed-uc2.js, etc.)
- Troubleshooting migration conflicts
- Best practices

**Đọc khi nào:**

- Khi thay đổi database schema
- Khi cần seed test data
- Khi gặp lỗi migration
- Trước khi deploy lên môi trường mới

---

## 🗺️ IMPLEMENTATION ROADMAP

### **Phase 1: Setup & UC1 (Week 1-2)**

```powershell
# 1. Clone và setup
git clone https://github.com/anhtrietrop/Project_KiemThuPhanMem.git
cd Project_KiemThuPhanMem

# 2. Đọc tài liệu
# - UC_ANALYSIS.md (hiểu UC1 requirements)
# - GIT_WORKFLOW_GUIDE.md (setup branches)

# 3. Tạo UC1 branch
git checkout -b uc1
git push -u origin uc1

# 4. Setup database
cd backend
npx prisma migrate dev --name uc1_core_features
node scripts/seed-uc1.js

# 5. Test UC1 features
# - Follow checklist trong UC_ANALYSIS.md
# - Manual test auth, products, categories

# 6. Merge UC1 vào main
# - Tạo PR: uc1 -> main
# - Review, test, merge
# - Tag release: v1.0.0
```

---

### **Phase 2: UC2 (Week 3)**

```powershell
# 1. Branch từ uc1
git checkout uc1
git pull origin uc1
git checkout -b uc2
git push -u origin uc2

# 2. Implement cart & wishlist
# - Update schema.prisma (Cart, CartItem, Wishlist models)
# - Create migration
npx prisma migrate dev --name uc2_shopping_cart_wishlist

# 3. Seed data
node scripts/seed-uc2.js

# 4. Test UC2 features
# - Follow UC_ANALYSIS.md checklist

# 5. Merge vào main
# - PR: uc2 -> main
# - Tag: v1.1.0
```

---

### **Phase 3: UC3 (Week 4)**

```powershell
# 1. Branch từ uc2
git checkout -b uc3

# 2. Implement orders & payment
npx prisma migrate dev --name uc3_orders_payment
node scripts/seed-uc3.js

# 3. Test payment integration
# - MoMo sandbox credentials
# - Test order flow

# 4. Merge và release v1.2.0
```

---

### **Phase 4: UC4 (Week 5)**

```powershell
# 1. Branch từ uc3
git checkout -b uc4

# 2. Implement notifications & security
npx prisma migrate dev --name uc4_notifications_security
node scripts/seed-uc4.js

# 3. Test advanced features

# 4. Final release v2.0.0
```

---

### **Phase 5: Docker & CI/CD (Week 6)**

```powershell
# 1. Đọc DOCKER_SETUP_GUIDE.md

# 2. Tạo Dockerfiles (theo guide)
# - backend/Dockerfile
# - frontend-user/Dockerfile
# - frontend-admin/Dockerfile

# 3. Tạo docker-compose files
# - docker-compose.yml (full)
# - docker-compose.uc1.yml

# 4. Test local deployment
docker compose up --build

# 5. Setup GitHub Actions (theo GIT_WORKFLOW_GUIDE.md)
# - Tạo .github/workflows/ci.yml
# - Test CI pipeline
```

---

## 🎯 QUICK START (Lần đầu chạy project)

### **Option 1: Local Development (Không dùng Docker)**

```powershell
# 1. Install dependencies
cd backend
npm install
cd ../frontend-user
yarn install
cd ../frontend-admin
yarn install
cd ..

# 2. Setup MySQL (MySQL Workbench hoặc XAMPP)
# - Tạo database: singitronic_nextjs_db
# - User: devuser, Pass: devpass123

# 3. Configure .env
# backend/.env:
DATABASE_URL="mysql://devuser:devpass123@localhost:3306/singitronic_nextjs_db"

# 4. Run migrations
cd backend
npx prisma migrate deploy
npx prisma generate

# 5. Seed data
node scripts/seed-all.js

# 6. Start services (3 terminals)
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend User
cd frontend-user
yarn dev

# Terminal 3 - Frontend Admin
cd frontend-admin
yarn dev

# 7. Access
# - User frontend: http://localhost:3000
# - Admin frontend: http://localhost:3001
# - Backend API: http://localhost:3002
```

---

### **Option 2: Docker Development (Recommended)**

```powershell
# 1. Đọc DOCKER_SETUP_GUIDE.md trước

# 2. Tạo .env.docker
# (Copy nội dung từ DOCKER_SETUP_GUIDE.md)

# 3. Tạo Dockerfiles và docker-compose.yml
# (Follow DOCKER_SETUP_GUIDE.md step-by-step)

# 4. Build và start
docker compose --env-file .env.docker up --build -d

# 5. Run migrations trong container
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node scripts/seed-all.js

# 6. Access
# - User: http://localhost:3000
# - Admin: http://localhost:3001
# - API: http://localhost:3002
```

---

## 📖 CÁCH ĐỌC TÀI LIỆU

### **Workflow Đề Xuất:**

```
Bắt đầu dự án
    ↓
1. Đọc file này (IMPLEMENTATION_PLAN.md)
    ↓
2. Đọc UC_ANALYSIS.md
   → Hiểu 4 Use Cases và scope của dự án
    ↓
3. Đọc GIT_WORKFLOW_GUIDE.md
   → Setup branches (uc1, uc2, uc3, uc4)
    ↓
4. Implement UC1
   ├─ Đọc DATABASE_MIGRATION_GUIDE.md
   │  → Create migration, seed data
   └─ Follow checklist trong UC_ANALYSIS.md
      → Verify features
    ↓
5. Deploy UC1 Local
   └─ Đọc DOCKER_SETUP_GUIDE.md
      → Test Docker deployment
    ↓
6. Merge UC1 → main
   └─ Follow GIT_WORKFLOW_GUIDE.md
      → Create PR, review, merge, tag release
    ↓
7. Repeat for UC2, UC3, UC4
    ↓
8. Setup CI/CD
   └─ GIT_WORKFLOW_GUIDE.md section 3
      → GitHub Actions
```

---

## ✅ CHECKLIST TỔNG THỂ

### **Setup Initial (Chỉ làm 1 lần)**

- [ ] Clone repository
- [ ] Đọc hết 4 tài liệu trong `docs/`
- [ ] Install Docker Desktop (Windows)
- [ ] Install Node.js 18+
- [ ] Install MySQL 8.0 hoặc dùng Docker
- [ ] Setup Git branches (main, uc1, uc2, uc3, uc4)
- [ ] Setup branch protection rules trên GitHub

### **UC1 Implementation**

- [ ] Create uc1 branch
- [ ] Implement features (xem UC_ANALYSIS.md)
- [ ] Create database migration
- [ ] Run seed script
- [ ] Manual test all UC1 features
- [ ] Create PR: uc1 -> main
- [ ] Review & merge
- [ ] Tag release: v1.0.0

### **UC2 Implementation**

- [ ] Create uc2 branch (từ uc1)
- [ ] Implement cart & wishlist
- [ ] Create migration
- [ ] Seed data
- [ ] Test features
- [ ] PR & merge
- [ ] Tag: v1.1.0

### **UC3 Implementation**

- [ ] Create uc3 branch
- [ ] Implement orders & payment
- [ ] Migration & seed
- [ ] Test MoMo integration
- [ ] PR & merge
- [ ] Tag: v1.2.0

### **UC4 Implementation**

- [ ] Create uc4 branch
- [ ] Implement notifications & security
- [ ] Migration & seed
- [ ] Test all advanced features
- [ ] PR & merge
- [ ] Tag: v2.0.0

### **Docker & CI/CD**

- [ ] Create all Dockerfiles
- [ ] Create docker-compose.yml files
- [ ] Test local Docker deployment
- [ ] Create .github/workflows/ci.yml
- [ ] Test GitHub Actions CI
- [ ] (Optional) Setup CD to cloud

---

## 🆘 KHI GẶP VẤN ĐỀ

| Vấn đề                           | Xem tài liệu                                        |
| -------------------------------- | --------------------------------------------------- |
| Không hiểu UC là gì?             | `UC_ANALYSIS.md` section 1                          |
| Lỗi Docker build/run             | `DOCKER_SETUP_GUIDE.md` section 5 (Troubleshooting) |
| Migration conflict               | `DATABASE_MIGRATION_GUIDE.md` section 5.4           |
| Không biết branch nào để code?   | `GIT_WORKFLOW_GUIDE.md` section 1.3                 |
| CI failed trên GitHub            | `GIT_WORKFLOW_GUIDE.md` section 3.2                 |
| Port đã được sử dụng             | `DOCKER_SETUP_GUIDE.md` section 5.3                 |
| Seed script lỗi                  | `DATABASE_MIGRATION_GUIDE.md` section 5.3           |
| Không biết commit message format | `GIT_WORKFLOW_GUIDE.md` section 5                   |

---

## 📊 TIẾN ĐỘ DỰ ÁN

**Current Status:** ✅ Code đã có UC1, UC2, UC3, UC4 (cần verify theo checklist)

**Next Steps:**

1. Đọc `UC_ANALYSIS.md` → verify UC1 và UC2 đã implement đúng chưa
2. Tạo seed scripts mới theo `DATABASE_MIGRATION_GUIDE.md`
3. Setup Docker theo `DOCKER_SETUP_GUIDE.md`
4. Setup Git workflow theo `GIT_WORKFLOW_GUIDE.md`

---

## 👥 TEAM COLLABORATION

### **Roles:**

- **Developer:** Implement features, write code
- **Reviewer:** Review PRs, test features
- **DevOps:** Setup Docker, CI/CD
- **QA:** Manual testing, verify checklists

### **Communication:**

- **GitHub Issues:** Bug reports, feature requests
- **Pull Requests:** Code review, technical discussion
- **README này:** Source of truth cho workflow

---

## 🎓 HỌC GÌ TỪ DỰ ÁN NÀY?

✅ **Technical Skills:**

- Next.js 15 (App Router, Server Components)
- Node.js + Express API
- Prisma ORM + MySQL
- Docker & Docker Compose
- GitHub Actions CI/CD
- Git branching strategies

✅ **Software Engineering:**

- Use Case driven development
- Database migration management
- API design (RESTful)
- Security best practices (rate limiting, logging)
- Testing strategies (manual, automated)

✅ **Project Management:**

- Agile development (iterative UCs)
- Git workflow (feature branches, PRs)
- Documentation practices
- Release management

---

## 📞 HỖ TRỢ

Nếu có câu hỏi:

1. Đọc lại tài liệu liên quan
2. Check troubleshooting sections
3. Search trong GitHub Issues
4. Hỏi team qua Discord/Slack
5. Tạo GitHub Issue mới

---

## 🚀 LET'S BUILD!

Chúc bạn implementation thành công! 🎉

**Bắt đầu từ đây:**

1. Đọc `docs/UC_ANALYSIS.md`
2. Follow roadmap ở trên
3. Code, test, commit, push, PR, merge
4. Repeat cho tất cả UCs

**Remember:** Làm từng bước một, test kỹ, document rõ ràng! 💪
