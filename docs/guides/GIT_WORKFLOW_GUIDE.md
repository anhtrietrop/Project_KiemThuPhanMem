# HƯỚNG DẪN GIT WORKFLOW & CI/CD

> **Mục đích:** Hướng dẫn branching strategy, PR workflow, và GitHub Actions setup cho iterative development

## 📋 MỤC LỤC

1. [Git Branching Strategy](#1-git-branching-strategy)
2. [Pull Request Workflow](#2-pull-request-workflow)
3. [GitHub Actions CI/CD](#3-github-actions-cicd)
4. [Release Management](#4-release-management)

---

## 1. GIT BRANCHING STRATEGY

### 1.1 Tổng quan

Dự án sử dụng **Feature Branch Workflow** kết hợp **Iterative UC Branches**:

```
main (production)
 ├── uc1 (Core Features)
 ├── uc2 (Shopping Experience) - branch từ uc1
 ├── uc3 (Order & Payment) - branch từ uc2
 └── uc4 (Advanced Features) - branch từ uc3
```

### 1.2 Branch structure

#### **main** - Production branch

- Code ổn định, đã test kỹ
- Mỗi commit trên main = 1 release
- Protected: không push trực tiếp, chỉ merge qua PR
- Auto-deploy (nếu setup CD)

#### **uc1** - Core Features

- Branch từ `main`
- Chứa: Auth, Products, Categories, Search, Merchant
- Merge vào `main` khi UC1 hoàn thành

#### **uc2** - Shopping Experience

- Branch từ `uc1` (kế thừa tất cả features của UC1)
- Thêm: Cart, Wishlist, Reviews
- Merge vào `main` sau khi merge `uc1`

#### **uc3** - Order & Payment

- Branch từ `uc2`
- Thêm: Orders, Checkout, MoMo Payment
- Merge vào `main` sau khi merge `uc2`

#### **uc4** - Advanced Features

- Branch từ `uc3`
- Thêm: Notifications, Security, Logging, Performance
- Merge vào `main` cuối cùng

#### **feature/** - Feature branches

- Branch từ UC branch tương ứng
- Format: `feature/uc1-user-authentication`, `feature/uc2-cart`
- Merge vào UC branch qua PR

#### **bugfix/** - Bug fix branches

- Branch từ branch có bug
- Format: `bugfix/fix-login-error`
- Merge vào branch gốc qua PR

#### **hotfix/** - Urgent fixes

- Branch từ `main`
- Format: `hotfix/security-patch`
- Merge vào `main` và backport vào các UC branches

---

### 1.3 Workflow chi tiết

#### **Bước 1: Tạo UC branch**

```powershell
# Bắt đầu UC1 - branch từ main
git checkout main
git pull origin main
git checkout -b uc1
git push -u origin uc1

# UC2 - branch từ uc1
git checkout uc1
git pull origin uc1
git checkout -b uc2
git push -u origin uc2

# Tương tự cho uc3, uc4
```

#### **Bước 2: Làm việc trên feature branch**

```powershell
# Ví dụ: implement user authentication cho UC1
git checkout uc1
git pull origin uc1
git checkout -b feature/uc1-user-authentication

# Code, test, commit
git add .
git commit -m "feat(auth): implement user registration and login"

# Push lên remote
git push -u origin feature/uc1-user-authentication
```

#### **Bước 3: Tạo Pull Request**

1. Vào GitHub repo: https://github.com/anhtrietrop/Project_KiemThuPhanMem
2. Click "Pull requests" → "New pull request"
3. Base: `uc1`, Compare: `feature/uc1-user-authentication`
4. Điền thông tin PR (xem template bên dưới)
5. Request review từ team members
6. Đợi CI pass và review approve
7. Merge PR (squash and merge recommended)

#### **Bước 4: Merge UC branch vào main**

```powershell
# Khi UC1 hoàn thành và đã test kỹ:
# 1. Tạo PR: uc1 -> main
# 2. Review kỹ toàn bộ changes
# 3. Merge PR
# 4. Tag release
git checkout main
git pull origin main
git tag -a v1.0.0-uc1 -m "Release UC1: Core Features"
git push origin v1.0.0-uc1
```

---

## 2. PULL REQUEST WORKFLOW

### 2.1 PR Template

Tạo file: `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## 📝 Description

<!-- Mô tả ngắn gọn thay đổi trong PR này -->

Closes #[issue number]

## 🎯 Use Case

- [ ] UC1 - Core Features
- [ ] UC2 - Shopping Experience
- [ ] UC3 - Order & Payment
- [ ] UC4 - Advanced Features

## ✅ Checklist

### Code Quality

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] No console.log or debug code left

### Testing

- [ ] Manual testing completed
- [ ] All test cases pass
- [ ] New tests added (if applicable)

### Database

- [ ] Migration files included (if DB changes)
- [ ] Seed data updated (if needed)
- [ ] Database changes documented

### Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated
- [ ] Comments added for public APIs

## 🧪 Testing Steps

<!-- Hướng dẫn reviewer test PR này -->

1. Checkout branch: `git checkout feature/...`
2. Install dependencies: `npm install`
3. Run migrations: `npx prisma migrate dev`
4. Start dev server: `npm run dev`
5. Test scenarios:
   - [ ] Scenario 1: ...
   - [ ] Scenario 2: ...

## 📸 Screenshots (if applicable)

<!-- Attach screenshots for UI changes -->

## 🔗 Related PRs

<!-- Link to related PRs -->

## ⚠️ Breaking Changes

<!-- List any breaking changes -->

- None

## 📌 Notes for Reviewer

<!-- Additional context for reviewer -->
```

### 2.2 PR Review Guidelines

#### **Reviewer checklist:**

**Code Quality:**

- [ ] Code dễ đọc, dễ maintain
- [ ] Không có duplicate code
- [ ] Error handling đầy đủ
- [ ] Security best practices (no SQL injection, XSS, etc.)

**Functionality:**

- [ ] Feature hoạt động đúng theo requirements
- [ ] Edge cases được xử lý
- [ ] Performance acceptable (no N+1 queries, etc.)

**Testing:**

- [ ] Manual test các scenarios
- [ ] Check logs không có errors
- [ ] Responsive (nếu có UI changes)

**Database:**

- [ ] Migration files valid
- [ ] Indexes đầy đủ
- [ ] Foreign keys đúng

#### **Review comments format:**

```
✅ Approved - LGTM (Looks Good To Me)
💡 Suggestion: Consider using async/await instead of .then()
❌ Request changes: Missing error handling in line 42
❓ Question: Why did you choose this approach?
```

---

## 3. GITHUB ACTIONS CI/CD

### 3.1 Workflow Overview

```
Push/PR → Trigger CI → Run Tests → Build → Deploy (optional)
```

### 3.2 CI Workflow (Continuous Integration)

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, uc1, uc2, uc3, uc4]
  pull_request:
    branches: [main, uc1, uc2, uc3, uc4]

jobs:
  # Backend tests
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: testpass
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run Prisma migrations
        working-directory: ./backend
        env:
          DATABASE_URL: mysql://root:testpass@127.0.0.1:3306/test_db
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: mysql://root:testpass@127.0.0.1:3306/test_db
        run: npm test

      - name: Lint
        working-directory: ./backend
        run: npm run lint || echo "No lint script"

  # Frontend User tests
  frontend-user-test:
    name: Frontend User Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "yarn"
          cache-dependency-path: frontend-user/yarn.lock

      - name: Install dependencies
        working-directory: ./frontend-user
        run: yarn install --frozen-lockfile

      - name: Type check
        working-directory: ./frontend-user
        run: yarn type-check

      - name: Build
        working-directory: ./frontend-user
        env:
          NEXT_PUBLIC_API_BASE_URL: http://localhost:3002
        run: yarn build

      - name: Run tests
        working-directory: ./frontend-user
        run: yarn test || echo "No tests yet"

  # Frontend Admin tests
  frontend-admin-test:
    name: Frontend Admin Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "yarn"
          cache-dependency-path: frontend-admin/yarn.lock

      - name: Install dependencies
        working-directory: ./frontend-admin
        run: yarn install --frozen-lockfile

      - name: Type check
        working-directory: ./frontend-admin
        run: yarn type-check

      - name: Build
        working-directory: ./frontend-admin
        env:
          NEXT_PUBLIC_API_BASE_URL: http://localhost:3002
        run: yarn build

  # Docker build test
  docker-build:
    name: Docker Build Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: ecommerce-backend:test

      - name: Build frontend-user image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend-user
          push: false
          tags: ecommerce-frontend-user:test

      - name: Build frontend-admin image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend-admin
          push: false
          tags: ecommerce-frontend-admin:test
```

### 3.3 CD Workflow - Manual Deploy (Local)

**File:** `.github/workflows/deploy-local.yml`

```yaml
name: Deploy to Local (Manual)

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to deploy"
        required: true
        type: choice
        options:
          - uc1
          - uc2
          - uc3
          - production

jobs:
  deploy:
    name: Deploy to Local Server
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build and push to GitHub Container Registry
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo $GITHUB_TOKEN | docker login ghcr.io -u ${{ github.actor }} --password-stdin

          # Build images
          docker build -t ghcr.io/${{ github.repository }}/backend:${{ github.event.inputs.environment }} ./backend
          docker build -t ghcr.io/${{ github.repository }}/frontend-user:${{ github.event.inputs.environment }} ./frontend-user
          docker build -t ghcr.io/${{ github.repository }}/frontend-admin:${{ github.event.inputs.environment }} ./frontend-admin

          # Push images
          docker push ghcr.io/${{ github.repository }}/backend:${{ github.event.inputs.environment }}
          docker push ghcr.io/${{ github.repository }}/frontend-user:${{ github.event.inputs.environment }}
          docker push ghcr.io/${{ github.repository }}/frontend-admin:${{ github.event.inputs.environment }}

      - name: Deployment Instructions
        run: |
          echo "✅ Docker images pushed to GitHub Container Registry"
          echo ""
          echo "📦 Images:"
          echo "  - ghcr.io/${{ github.repository }}/backend:${{ github.event.inputs.environment }}"
          echo "  - ghcr.io/${{ github.repository }}/frontend-user:${{ github.event.inputs.environment }}"
          echo "  - ghcr.io/${{ github.repository }}/frontend-admin:${{ github.event.inputs.environment }}"
          echo ""
          echo "🚀 To deploy on local server:"
          echo "  1. SSH to local server"
          echo "  2. docker login ghcr.io"
          echo "  3. docker compose pull"
          echo "  4. docker compose up -d"
```

### 3.4 Cách sử dụng GitHub Actions

#### **Setup GitHub Actions:**

1. Tạo thư mục `.github/workflows/` trong repo
2. Tạo file `ci.yml` với nội dung ở trên
3. Push lên GitHub
4. Vào repo → Actions tab để xem workflows

#### **Trigger CI:**

CI tự động chạy khi:

- Push code lên branches: main, uc1, uc2, uc3, uc4
- Tạo Pull Request vào các branches trên

#### **Trigger CD (Manual):**

1. Vào GitHub repo → Actions tab
2. Chọn workflow "Deploy to Local (Manual)"
3. Click "Run workflow"
4. Chọn environment (uc1/uc2/uc3/production)
5. Click "Run workflow"

#### **View logs:**

- GitHub repo → Actions → click vào workflow run
- Xem logs từng job
- Download artifacts (nếu có)

---

## 4. RELEASE MANAGEMENT

### 4.1 Versioning Strategy

Sử dụng **Semantic Versioning**: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features, backward-compatible (v1.1.0)
- **PATCH**: Bug fixes (v1.0.1)

**UC-based versioning:**

- UC1 release: `v1.0.0-uc1` hoặc `v1.0.0`
- UC2 release: `v1.1.0-uc2` hoặc `v1.1.0`
- UC3 release: `v1.2.0-uc3` hoặc `v1.2.0`
- UC4 release: `v2.0.0` (full features)

### 4.2 Release Process

#### **Tạo release khi merge UC vào main:**

```powershell
# Sau khi merge uc1 -> main
git checkout main
git pull origin main

# Create tag
git tag -a v1.0.0 -m "Release v1.0.0 - UC1: Core Features

Features:
- User authentication (register, login, session)
- Product management (CRUD)
- Category management
- Product images
- Search and filter
- Merchant management

Database migrations: see backend/prisma/migrations/
"

# Push tag
git push origin v1.0.0
```

#### **Tạo GitHub Release:**

1. GitHub repo → Releases → "Draft a new release"
2. Choose tag: `v1.0.0`
3. Title: `v1.0.0 - UC1: Core Features`
4. Description:

   ````markdown
   ## ✨ Features

   ### UC1 - Core Features

   - ✅ User Authentication
   - ✅ Product Management
   - ✅ Category Management
   - ✅ Search & Filter

   ## 🗄️ Database

   - Run migrations: `npx prisma migrate deploy`
   - Seed data: `node scripts/create-test-data.js`

   ## 🐛 Bug Fixes

   - None

   ## 📦 Docker

   ```bash
   docker compose -f docker-compose.uc1.yml up -d
   ```
   ````

   ## 📚 Documentation

   - See `docs/UC_ANALYSIS.md` for feature checklist
   - See `docs/DOCKER_SETUP_GUIDE.md` for deployment

   ```

   ```

5. Attach assets (nếu có): build artifacts, documentation PDFs
6. Publish release

### 4.3 Changelog

Tạo file `CHANGELOG.md` tại root:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.2.0] - 2025-11-XX - UC3: Order & Payment

### Added

- Order management system
- MoMo payment integration
- Order status workflow
- Payment callback handling

### Changed

- Updated database schema for orders
- Enhanced security middleware

## [1.1.0] - 2025-11-XX - UC2: Shopping Experience

### Added

- Shopping cart functionality
- Wishlist feature
- Product reviews (optional)

### Fixed

- Cart persistence issue
- Wishlist duplicate entries

## [1.0.0] - 2025-11-03 - UC1: Core Features

### Added

- User authentication and authorization
- Product CRUD operations
- Category management
- Product image management
- Search and filter
- Merchant management
- Initial database schema
- Docker setup
```

### 4.4 Hotfix Process

Nếu có bug nghiêm trọng trên production:

```powershell
# 1. Branch từ main
git checkout main
git pull origin main
git checkout -b hotfix/fix-security-issue

# 2. Fix bug, test kỹ
git add .
git commit -m "fix(security): patch SQL injection vulnerability"

# 3. PR vào main
git push -u origin hotfix/fix-security-issue
# Tạo PR, review, merge

# 4. Tag hotfix release
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix v1.0.1 - Security patch"
git push origin v1.0.1

# 5. Backport vào UC branches (nếu cần)
git checkout uc2
git cherry-pick <commit-hash>
git push origin uc2
```

---

## 5. COMMIT MESSAGE CONVENTIONS

Sử dụng **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Build, configs, dependencies

### Examples:

```bash
# Feature
git commit -m "feat(auth): implement user registration with email verification"

# Bug fix
git commit -m "fix(cart): resolve cart item duplication issue

- Added unique constraint on cartId + productId
- Update cart API to handle duplicates

Closes #123"

# Documentation
git commit -m "docs: add Docker setup guide"

# Refactor
git commit -m "refactor(products): optimize database queries

- Implement eager loading for categories
- Add database indexes for faster search
- Reduce N+1 queries in product list API"
```

---

## 6. BRANCH PROTECTION RULES

### Setup trên GitHub:

1. Repo Settings → Branches → Add rule

#### **For `main` branch:**

- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass
  - ✅ CI - Backend Tests
  - ✅ CI - Frontend User Tests
  - ✅ CI - Frontend Admin Tests
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings
- ❌ Allow force pushes (NEVER!)
- ❌ Allow deletions

#### **For UC branches (uc1, uc2, uc3, uc4):**

- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass
- ❌ Allow force pushes (only for UC branches, use with caution)

---

## 7. TEAM COLLABORATION

### 7.1 Code Review Best Practices

**Reviewer:**

- Review trong 24h
- Test code locally nếu có thể
- Constructive feedback
- Approve khi satisfied

**Author:**

- Self-review trước khi request
- Respond to comments trong 24h
- Resolve conversations
- Re-request review sau khi fix

### 7.2 Communication

- **GitHub Issues**: Track bugs, features
- **PR Comments**: Technical discussions
- **Discord/Slack**: Quick questions, sync
- **Weekly meeting**: Review progress, plan sprint

---

## 8. QUICK REFERENCE

### Common Commands

```powershell
# Start working on UC1
git checkout uc1
git pull origin uc1
git checkout -b feature/my-feature
# ... code ...
git add .
git commit -m "feat(scope): description"
git push -u origin feature/my-feature

# Update feature branch with latest UC1
git checkout uc1
git pull origin uc1
git checkout feature/my-feature
git merge uc1
# resolve conflicts
git push

# Squash commits before merge
git rebase -i HEAD~3
# pick, squash, squash
git push -f

# Merge UC1 into main
# Via GitHub PR UI (preferred)
# Or manually:
git checkout main
git pull origin main
git merge --no-ff uc1
git push origin main
git tag -a v1.0.0 -m "UC1 release"
git push origin v1.0.0
```

---

## 9. NEXT STEPS

✅ **Đã setup:**

- Branching strategy
- PR workflow
- GitHub Actions CI/CD
- Release process

📚 **Đọc tiếp:**

- `DATABASE_MIGRATION_GUIDE.md` - Migration strategy
- `UC_ANALYSIS.md` - Feature checklist
- `DOCKER_SETUP_GUIDE.md` - Local deployment

🚀 **Action items:**

1. Tạo UC branches
2. Setup branch protection
3. Tạo `.github/workflows/ci.yml`
4. Test CI pipeline
5. Bắt đầu develop features
