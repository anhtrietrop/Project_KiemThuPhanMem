# 📚 DOCUMENTATION - E-COMMERCE PROJECT

> Tất cả tài liệu hướng dẫn cho dự án E-Commerce được tổ chức tại đây

---

## 🗂️ CẤU TRÚC TÀI LIỆU

### **📖 Tài liệu Hướng dẫn (Guides)**

| File                                                           | Mô tả                                                       | Đọc khi nào                    |
| -------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)**           | 🗺️ **BẮT ĐẦU TỪ ĐÂY** - Roadmap tổng thể, quick start guide | Lần đầu vào dự án              |
| **[UC_ANALYSIS.md](UC_ANALYSIS.md)**                           | 📊 Phân tích 4 Use Cases + Checklist verification           | Trước khi implement mỗi UC     |
| **[DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)**             | 🐳 Setup Docker local deployment từng bước                  | Setup môi trường development   |
| **[GIT_WORKFLOW_GUIDE.md](GIT_WORKFLOW_GUIDE.md)**             | 🌳 Git branching strategy + CI/CD với GitHub Actions        | Trước khi code, tạo PR, merge  |
| **[DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)** | 🗄️ Database migration + seed data management                | Khi thay đổi schema, seed data |

### **📁 Tài liệu Dự án (Project Files)**

| File                                                      | Mô tả                                   |
| --------------------------------------------------------- | --------------------------------------- |
| `DeTai_GiaiDoan1_DoAnhTriet_3122411223.docx`              | Đề tài giai đoạn 1                      |
| `DeTai_GiaiDoan1_DoAnhTriet_3122411223.pptx`              | Slide thuyết trình                      |
| `DeTai_GiaiDoan1_DoAnhTriet_3122411223.xlsx`              | Dữ liệu dự án                           |
| `DeTai_GiaiDoan1_FocusUsecase_DoAnhTriet_3122411223.xlsx` | Focus Use Cases                         |
| `DeTai_GiaiDoan1_DoAnhTriet_3122411223.drawio`            | Diagram kiến trúc                       |
| `order-statechart.puml`                                   | PlantUML state chart cho order workflow |

---

## 🚀 QUICK START - ĐỌC GÌ TRƯỚC?

### **Lần đầu vào dự án:**

```
1. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
   → Hiểu tổng quan project, roadmap

2. [UC_ANALYSIS.md](UC_ANALYSIS.md)
   → Biết dự án có những features gì (UC1-UC4)

3. [GIT_WORKFLOW_GUIDE.md](GIT_WORKFLOW_GUIDE.md)
   → Setup Git branches

4. [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
   hoặc Quick Start trong IMPLEMENTATION_PLAN.md
   → Chạy project lần đầu
```

### **Khi develop feature:**

```
1. Check UC_ANALYSIS.md
   → Xem feature nằm trong UC nào

2. Check DATABASE_MIGRATION_GUIDE.md
   → Nếu cần thay đổi database

3. Follow GIT_WORKFLOW_GUIDE.md
   → Branch naming, commit messages, PR workflow
```

---

## 📋 TÀI LIỆU CHI TIẾT

### 1️⃣ **IMPLEMENTATION_PLAN.md** - Master Document

**Nội dung:**

- 🗺️ Roadmap 5 phases (Setup → UC1 → UC2 → UC3 → UC4 → Docker/CI)
- 🎯 Quick start cho lần đầu chạy project (2 options: Local vs Docker)
- ✅ Checklist tổng thể implementation
- 🆘 Troubleshooting quick reference
- 📊 Tiến độ dự án

**Đọc để:**

- Hiểu tổng quan project flow
- Biết bắt đầu từ đâu
- Follow roadmap implementation

---

### 2️⃣ **UC_ANALYSIS.md** - Use Cases Breakdown

**Nội dung:**

- **UC1:** User Auth, Products, Categories, Search, Merchant (✅ Đã có)
- **UC2:** Shopping Cart, Wishlist (✅ Đã có)
- **UC3:** Orders, MoMo Payment (✅ Đã có)
- **UC4:** Notifications, Security Logging (✅ Đã có)
- 📝 Checklist verification từng feature
- 🧪 PowerShell commands để test

**Đọc để:**

- Verify feature đã implement đúng chưa
- Biết test như thế nào
- Checklist trước khi merge PR

**Example:**

```powershell
# Test product API
curl http://localhost:3002/api/products

# Test search
curl "http://localhost:3002/api/search?q=laptop"
```

---

### 3️⃣ **DOCKER_SETUP_GUIDE.md** - Local Deployment

**Nội dung:**

- 🐳 Cách tạo Dockerfile (backend, frontend-user, frontend-admin)
- 📦 Cách tạo docker-compose.yml
- ⚙️ Environment variables (.env.docker)
- 🚀 Commands: build, run, stop, logs
- 🔧 Troubleshooting: port conflicts, network issues, etc.

**Đọc để:**

- Setup Docker lần đầu
- Deploy local development environment
- Fix Docker errors

**Example:**

```powershell
# Start all services
docker compose --env-file .env.docker up -d

# View logs
docker compose logs -f backend

# Stop
docker compose down
```

---

### 4️⃣ **GIT_WORKFLOW_GUIDE.md** - Branching & CI/CD

**Nội dung:**

- 🌳 Branch structure: main, uc1, uc2, uc3, uc4, feature/_, bugfix/_
- 📝 PR workflow + template
- ✍️ Commit message conventions (Conventional Commits)
- 🤖 GitHub Actions: CI (test/build) + CD (deploy)
- 🏷️ Release management (versioning, tagging)
- 🛡️ Branch protection rules

**Đọc để:**

- Biết branch nào để code
- Tạo PR đúng format
- Setup GitHub Actions
- Merge và release

**Example:**

```powershell
# Start UC1 feature
git checkout uc1
git checkout -b feature/uc1-user-authentication
# ... code ...
git commit -m "feat(auth): implement user registration"
git push -u origin feature/uc1-user-authentication
# Create PR on GitHub
```

---

### 5️⃣ **DATABASE_MIGRATION_GUIDE.md** - Schema Management

**Nội dung:**

- 🔄 Prisma migration workflow
- 📊 Schema cho từng UC (UC1: Users/Products, UC2: Cart, UC3: Orders, UC4: Notifications)
- 🌱 Seed scripts (seed-uc1.js, seed-uc2.js, etc.)
- ⚙️ Commands: migrate dev, deploy, reset, generate
- 🔧 Troubleshooting: conflicts, constraints, etc.

**Đọc để:**

- Thay đổi database schema
- Tạo seed data cho testing
- Fix migration errors

**Example:**

```powershell
# Create migration
npx prisma migrate dev --name add_cart_feature

# Run migration
npx prisma migrate deploy

# Seed data
node scripts/seed-uc1.js
```

---

## 🎯 USE CASES OVERVIEW

Dự án được chia thành 4 Use Cases (iterative development):

```
UC1: Core Features (Week 1-2)
├─ User Authentication
├─ Product Management
├─ Category Management
├─ Search & Filter
└─ Merchant Management

UC2: Shopping Experience (Week 3)
├─ Shopping Cart
├─ Wishlist
└─ Product Reviews (optional)

UC3: Order & Payment (Week 4)
├─ Order Management
├─ Checkout Process
├─ MoMo Payment Integration
└─ Order Status Workflow

UC4: Advanced Features (Week 5)
├─ Notification System
├─ Security Logging
├─ Rate Limiting
└─ Performance Monitoring
```

Chi tiết xem [UC_ANALYSIS.md](UC_ANALYSIS.md)

---

## 🔗 WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│  1. Đọc IMPLEMENTATION_PLAN.md (Master doc)             │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  2. Setup Git Branches (GIT_WORKFLOW_GUIDE.md)          │
│     git checkout -b uc1                                 │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  3. Implement UC1 Features (UC_ANALYSIS.md)             │
│     - Auth, Products, Categories                        │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Database Migration (DATABASE_MIGRATION_GUIDE.md)    │
│     npx prisma migrate dev --name uc1_core              │
│     node scripts/seed-uc1.js                            │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  5. Test Locally (UC_ANALYSIS.md checklist)             │
│     Manual test all features                            │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  6. Docker Deploy (DOCKER_SETUP_GUIDE.md)               │
│     docker compose up --build                           │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  7. Create PR (GIT_WORKFLOW_GUIDE.md)                   │
│     uc1 -> main                                         │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  8. Merge & Release (GIT_WORKFLOW_GUIDE.md)             │
│     git tag v1.0.0                                      │
└─────────────────────────────────────────────────────────┘
                         ↓
        Repeat for UC2, UC3, UC4
```

---

## 📖 READING ORDER

### **New Team Member:**

1. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) (30 min)
2. [UC_ANALYSIS.md](UC_ANALYSIS.md) (1 hour)
3. [GIT_WORKFLOW_GUIDE.md](GIT_WORKFLOW_GUIDE.md) (45 min)
4. Quick start trong IMPLEMENTATION_PLAN.md hoặc [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md) (1 hour)

**Total:** ~3-4 giờ để hiểu hết project

### **Experienced Developer:**

1. Skim IMPLEMENTATION_PLAN.md (10 min)
2. Deep dive UC_ANALYSIS.md cho UC đang làm (20 min)
3. Setup theo DOCKER_SETUP_GUIDE.md hoặc local (30 min)
4. Start coding!

---

## 🆘 TROUBLESHOOTING

| Vấn đề                    | Xem file                    | Section         |
| ------------------------- | --------------------------- | --------------- |
| Không biết bắt đầu từ đâu | IMPLEMENTATION_PLAN.md      | Quick Start     |
| Feature X thuộc UC nào?   | UC_ANALYSIS.md              | UC sections 1-4 |
| Lỗi Docker build          | DOCKER_SETUP_GUIDE.md       | Section 5       |
| Lỗi migration             | DATABASE_MIGRATION_GUIDE.md | Section 5       |
| Branch nào để code?       | GIT_WORKFLOW_GUIDE.md       | Section 1.3     |
| Format commit message     | GIT_WORKFLOW_GUIDE.md       | Section 5       |
| CI failed                 | GIT_WORKFLOW_GUIDE.md       | Section 3.2     |
| Seed script lỗi           | DATABASE_MIGRATION_GUIDE.md | Section 5.3     |

---

## ✅ CHECKLIST TRƯỚC KHI BẮT ĐẦU CODE

- [ ] Đã đọc IMPLEMENTATION_PLAN.md
- [ ] Đã đọc UC_ANALYSIS.md (ít nhất UC đang làm)
- [ ] Đã setup Git branches (GIT_WORKFLOW_GUIDE.md)
- [ ] Đã chạy được project local (IMPLEMENTATION_PLAN.md Quick Start)
- [ ] Đã test database connection
- [ ] Đã có seed data (DATABASE_MIGRATION_GUIDE.md)
- [ ] Hiểu PR workflow (GIT_WORKFLOW_GUIDE.md)

---

## 🎓 TÀI LIỆU BỔ SUNG

### **External Resources:**

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Docker Docs](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)

### **Project Diagrams:**

- `order-statechart.puml` - Order workflow state machine (open with PlantUML)
- `DeTai_GiaiDoan1_DoAnhTriet_3122411223.drawio` - System architecture

---

## 📞 SUPPORT

Nếu có câu hỏi không có trong docs:

1. ✅ Search trong 5 files guides
2. ✅ Check troubleshooting sections
3. ✅ Google error messages
4. ✅ Ask team
5. ✅ Create GitHub Issue

---

## 🚀 LET'S GO!

**Start here:** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
