# 🛡️ Hướng Dẫn Cấu Hình Branch Protection Rules

## Tổng Quan

Để đảm bảo code được kiểm duyệt trước khi merge vào `main`, bạn cần cấu hình **Branch Protection Rules** trên GitHub.

## 📋 Các Bước Cấu Hình

### Bước 1: Truy cập Settings

1. Vào repository trên GitHub
2. Click **Settings** (tab ở góc phải)
3. Trong sidebar, chọn **Branches** (dưới mục "Code and automation")

### Bước 2: Thêm Branch Protection Rule

1. Click nút **Add branch protection rule**
2. Trong **Branch name pattern**, nhập: `main`

### Bước 3: Cấu Hình Các Quy Tắc Bảo Vệ

✅ **Bật các tùy chọn sau:**

#### Require a pull request before merging
- [x] **Require a pull request before merging**
  - [x] Require approvals: `1` (hoặc nhiều hơn tùy team)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require approval of the most recent reviewable push

#### Require status checks to pass before merging
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  
  **Status checks bắt buộc phải pass:**
  - `Test Backend (Unit & Integration)` 
  - `Test Frontend Admin (Lint & Build)`
  - `Test Frontend User (Lint & Build)`
  - `CI Status Check`

#### Các tùy chọn khác (tùy chọn)
- [x] Require conversation resolution before merging
- [x] Require signed commits (nếu team sử dụng GPG)
- [x] Do not allow bypassing the above settings

### Bước 4: Lưu Cấu Hình

1. Click **Create** hoặc **Save changes**

---

## 🔄 Workflow Hoạt Động

```
Developer push code
        ↓
    Tạo Pull Request → main
        ↓
    GitHub Actions chạy CI
        ↓
    ┌─────────────────────────────────────┐
    │           CI Results                │
    ├─────────────────────────────────────┤
    │ ✅ Pass → Có thể merge              │
    │ ❌ Fail → Không thể merge           │
    │           ↓                         │
    │     Tự động tạo Issue               │
    │     với chi tiết lỗi                │
    └─────────────────────────────────────┘
```

---

## 📌 Các Status Checks Trong Project

| Check Name | Mô Tả |
|------------|-------|
| `Test Backend (Unit & Integration)` | Chạy unit tests, integration tests cho backend |
| `Test Frontend Admin (Lint & Build)` | Lint + Build frontend admin |
| `Test Frontend User (Lint & Build)` | Lint + Build frontend user |
| `CI Status Check` | Tổng hợp kết quả tất cả checks |

---

## 🚨 Khi CI Fail

Khi CI fail, hệ thống sẽ tự động:

1. **Tạo GitHub Issue** với:
   - Tiêu đề: `🔴 CI Failed on PR #X: [Component Name]`
   - Chi tiết component nào fail
   - Link đến CI logs
   - Hướng dẫn fix
   - Checklist theo dõi tiến độ
   - Labels: `ci-failure`, `bug`, `automated`
   - Assign cho người push code

2. **Comment trên PR** với thông báo lỗi

3. **Block merge** cho đến khi tất cả checks pass

---

## 🛠️ Xử Lý Khi CI Fail

### 1. Xem Logs

```bash
# Click link trong Issue hoặc PR để xem logs
# Hoặc: GitHub Actions → Workflow Run → View Logs
```

### 2. Chạy Test Local

```bash
# Backend
cd backend
npm run test

# Frontend Admin
cd frontend-admin
npm run lint:check
npm run build

# Frontend User
cd frontend-user
npm run lint:check
npm run build
```

### 3. Fix và Push Lại

```bash
git add .
git commit -m "fix: resolve CI failures"
git push
```

### 4. Đóng Issue

Sau khi CI pass, đóng issue liên quan.

---

## ⚙️ Cấu Hình Labels (Tùy Chọn)

Để issue tự động được gắn label, tạo các labels sau trong repository:

| Label | Màu | Mô Tả |
|-------|-----|-------|
| `ci-failure` | `#d73a4a` (đỏ) | CI build failed |
| `bug` | `#d73a4a` (đỏ) | Something isn't working |
| `automated` | `#0e8a16` (xanh) | Auto-generated |

### Tạo Labels:

1. GitHub → Issues → Labels → New label
2. Thêm 3 labels trên

---

## 🔐 Permissions

Đảm bảo GitHub Actions có quyền tạo Issues:

1. Settings → Actions → General
2. Workflow permissions: **Read and write permissions**
3. ✅ Allow GitHub Actions to create and approve pull requests

---

## 📝 Ví Dụ Issue Tự Động

```markdown
## 🚨 CI Pipeline Failed

**Triggered by:** @developer-name
**Branch:** `feature/new-feature`
**Commit:** `abc1234`
**Workflow Run:** [View Details](link)

---

### 📊 CI Results Summary

| Component | Status |
|-----------|--------|
| **Backend Tests** | ❌ failure |
| **Frontend Admin** | ✅ success |
| **Frontend User** | ✅ success |

---

### ❌ Failed Components

- **Backend Tests**

---

### 🔍 How to Fix

1. Check the workflow run logs để xem chi tiết lỗi
2. Chạy test locally: `cd backend && npm run test`
3. Fix lỗi và push lại code
4. Đóng issue này khi CI pass
```

---

## ❓ FAQ

### Q: Làm sao bypass branch protection?
A: Chỉ admin có thể bypass. Không khuyến khích trừ trường hợp khẩn cấp.

### Q: CI pass nhưng vẫn không merge được?
A: Kiểm tra xem branch có up-to-date với main không. Pull latest main và resolve conflicts.

### Q: Issue duplicate?
A: Hệ thống tự động check và comment vào issue cũ thay vì tạo mới.
