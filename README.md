# 🛍️ E-Commerce System - Project_KiemThuPhanMem

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![Tests](https://img.shields.io/badge/tests-197%20passed-brightgreen.svg)](./full_test_report.md)

**Team Members:**
- Đỗ Anh Triết - 3122411223
- Nguyễn Võ Minh Thư - 3122411201
- Trần Nguyễn Phúc Mạnh - 3112241121

---

## 📚 Overview

**E-Commerce System** is an end-to-end full-stack application designed for electronic commerce with a focus on scalability, maintainability, and rigorous testing. This project demonstrates a complete Software Testing Life Cycle (STLC) implementation with comprehensive Unit Testing, Integration Testing, and CI/CD automation.

The platform goes beyond basic CRUD functionality — it showcases a professional development workflow with separated frontend applications for Users and Admins, a unified Node.js/Express backend, and automated quality assurance through GitHub Actions pipelines.

This system is built for the **Software Testing Course** (Môn Kiểm thử phần mềm) and demonstrates best practices in modern web development and quality assurance.

---

## 🧩 Architecture

The system follows a microservice-like architecture with three distinct components:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Frontend User  │      │ Frontend Admin  │      │    Backend API  │
│   (Next.js)     │◄────►│   (Next.js)     │◄────►│  (Express.js)   │
│   Port 3000     │      │   Port 3001     │      │   Port 3002     │
└─────────────────┘      └─────────────────┘      └────────┬────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  MySQL Database │
                                                   │  (Prisma ORM)   │
                                                   └─────────────────┘
```

**Key Features:**
- **Independent Sessions:** User and Admin can be logged in simultaneously on different ports
- **API-First Design:** All business logic centralized in the backend
- **Database Abstraction:** Prisma ORM provides type-safe database access

---

## 🧱 Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (User)** | Next.js 14, React, TailwindCSS | Customer-facing e-commerce interface |
| **Frontend (Admin)** | Next.js 14, React, TailwindCSS | Admin dashboard for management |
| **Backend API** | Node.js, Express.js, Prisma | RESTful API server with business logic |
| **Database** | MySQL 8.0 | Relational data storage |
| **Authentication** | JWT, bcryptjs, NextAuth | Secure user authentication |
| **Testing** | Jest, Supertest | Unit and Integration testing |
| **DevOps** | Docker, GitHub Actions | Containerization and CI/CD |

---

## 📁 Table of Contents

- [📚 Overview](#-overview)
- [🧩 Architecture](#-architecture)
- [🧱 Stack Overview](#-stack-overview)
- [⚙️ Environment Setup](#️-environment-setup)
- [🧪 Local Development](#-local-development)
- [🎯 Testing Strategy](#-testing-strategy)
- [📦 Features by Role](#-features-by-role)
- [🛠️ Useful Scripts](#️-useful-scripts)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 Documentation](#-documentation)
- [📞 Support](#-support)
- [📄 License](#-license)

---

## ⚙️ Environment Setup

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- **Git**
- **npm** or **yarn**

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/Project_KiemThuPhanMem.git
cd Project_KiemThuPhanMem
```

### 3. Configure Environment Variables

**Option 1: Automated (Recommended)**
```bash
# Windows
create-env-files.bat
```

**Option 2: Manual Configuration**

Create `backend/.env`:
```env
NODE_ENV=development
DATABASE_URL="mysql://username:password@localhost:3306/singitronic_nextjs_db"
PORT=3002
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
```

Create `frontend-user/.env.local` and `frontend-admin/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3000  # or 3001 for admin
NEXTAUTH_SECRET="your-secret-key"
DATABASE_URL="mysql://username:password@localhost:3306/singitronic_nextjs_db"
```

---

## 🧪 Local Development

You can start the project using Docker (recommended) or run services manually.

### 1. Quick Start with Docker

```bash
# Start all services (MySQL, Backend, Frontends)
docker-manager start

# Initialize database schema and seed data
db init

# View logs
docker-manager logs backend

# Check service status
docker-manager check
```

**Access Points:**
- 🛒 **User Store:** http://localhost:3000
- 🔧 **Admin Panel:** http://localhost:3001
- 🔌 **Backend API:** http://localhost:3002

### 2. Manual Setup

**Step 1: Setup Database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE singitronic_nextjs_db;
```

**Step 2: Backend**
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate

# Seed demo data
cd utills
node insertDemoData.js
node insertAdminUser.js
cd ..

# Start server
npm start
```

**Step 3: Frontend User (Terminal 2)**
```bash
cd frontend-user
npm install
npx prisma generate
npm run dev
```

**Step 4: Frontend Admin (Terminal 3)**
```bash
cd frontend-admin
npm install
npx prisma generate
npm run dev
```

### 3. Verify Installation

After setup, you should see:
- ✅ Backend running on port 3002
- ✅ Frontend User on port 3000
- ✅ Frontend Admin on port 3001
- ✅ Database populated with demo data

---

## 🎯 Testing Strategy

This project emphasizes **Quality Assurance** with a comprehensive testing suite.

> 📊 **Current Status:** **197 Tests Passed** (100% Success Rate)  
> 📄 **Full Report:** [View Test Report](./full_test_report.md)

### 1. Unit Testing
**Scope:** Business logic validation (Price, Quantity, Slug generation, JWT tokens)  
**Tools:** Jest  
**Coverage:** 60%+ target  
**Command:**
```bash
cd backend
npm run test:unit
```

**Example Tests:**
- ✅ Password hashing with bcrypt
- ✅ JWT token generation and validation
- ✅ Email and password format validation
- ✅ Product slug generation

### 2. Integration Testing
**Scope:** API endpoints with real database interactions  
**Tools:** Jest + Supertest + MySQL Test Database  
**Coverage:** All critical API flows  
**Command:**
```bash
cd backend
npm run test:integration
```

**Example Tests:**
- ✅ User registration and authentication
- ✅ Product CRUD operations
- ✅ Product filtering and search
- ✅ Protected route access control

### 3. CI/CD Pipelines
**Platform:** GitHub Actions  
**Workflows:**
- **CI Pipeline:** Runs on every PR (Lint → Unit Tests → Integration Tests → Coverage Check)
- **CD Pipeline:** Deploys to production on merge to `main`
- **Database Migration Check:** Validates Prisma schema changes

See [CI/CD Architecture Diagram](./full_test_report.md#7-cicd--devops-pipeline-architecture) for details.

---

## 📦 Features by Role

### User Features (Port 3000)
- ✅ User registration and authentication
- ✅ Browse products (no login required)
- ✅ Product search and filtering
- ✅ Shopping cart management
- ✅ Checkout (requires login)
- ✅ Wishlist management
- ✅ Order history

### Admin Features (Port 3001)
- ✅ Admin-only authentication
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Order management
- ✅ User management
- ✅ Merchant management

**Credentials (Demo Data):**
```
Admin:
  URL: http://localhost:3001/login
  Email: admin@example.com
  Password: admin123

User:
  URL: http://localhost:3000/login
  Email: user@example.com
  Password: (create on registration)
```

---

## 🛠️ Useful Scripts

### Database Scripts
```bash
db status              # Check migration status
db studio              # Open Prisma Studio (Database GUI)
db init                # Initialize and seed database
db dev                 # Create new migration
```

### Docker Scripts
```bash
docker-manager start   # Start all containers
docker-manager stop    # Stop all containers
docker-manager logs    # View service logs
docker-manager check   # Check port availability
docker-manager restart # Restart services
```

### Development Scripts
```bash
# Backend
npm start              # Start server
npm run test           # Run all tests
npm run test:coverage  # Run tests with coverage

# Frontend
npm run dev            # Development mode
npm run build          # Build for production
npm run lint           # Code linting
```

---

## 🐛 Troubleshooting

### Database Connection Errors
- ✅ Verify MySQL service is running
- ✅ Check username/password in `.env` files
- ✅ Ensure database `singitronic_nextjs_db` exists

### Port Already in Use
- ✅ Check if services are running: `check-ports.bat`
- ✅ Kill process using port: `npx kill-port 3002`

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Admin Login Fails
- ✅ Only accounts with `role='admin'` can access Admin Panel
- ✅ Verify user role in database: `npx prisma studio`

---

## 📄 Documentation

- 📊 [Full Test Report](./full_test_report.md) - Complete testing documentation
- 🗂️ [Documentation Structure](./DOCUMENTATION_STRUCTURE.md) - Project documentation index
- 🔄 [Database Sync Guide](./DATABASE_SYNC_README.md) - Database migration guide
- 📝 [Scripts Guide](./scripts/README.md) - Automated scripts documentation

---

## 📞 Support

If you encounter issues:

1. Check logs in terminal
2. Verify database connection
3. Ensure all dependencies are installed
4. Check `.env` files are created correctly

<<<<<<< Updated upstream
```bash
npm run dev               # Chạy development mode
npm run build             # Build production
npm run start             # Chạy production
npm run lint              # Kiểm tra lỗi
```

### Deploy

```bash
docker compose up -d
Get-Content database_backup\data_import.sql | docker compose exec -T db mysql -u root -prootpassword123 singitronic_nextjs_db
docker compose exec backend npx prisma generate
docker compose restart backend
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
=======
---
>>>>>>> Stashed changes

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Made with ❤️ for Software Testing Course**
