# 📚 Cấu Trúc Tài Liệu - Trung Tâm Điều Hướng Toàn Diện

**Cập nhật lần cuối:** 7/12/2025  
**Trạng thái:** 🟢 Chỉ Mục Tài Liệu Chính (Trung Tâm)

---

## 🎯 Điều Hướng Nhanh

> **Lần đầu tới đây?** Bắt đầu với [Bắt Đầu](#-bắt-đầu-từ-đây)
>
> **Biết cần tìm gì?** Sử dụng [Chỉ Mục Theo Chủ Đề](#-tài-liệu-theo-chủ-đề) dưới đây

---

## 📍 Bắt Đầu Từ Đây!

### **Cho Thành Viên Mới:**

| Thứ Tự | Đọc File Này                                     | Mục Đích                              | Thời Gian |
| ------ | ------------------------------------------------ | ------------------------------------- | --------- |
| 1️⃣     | 📄 `docs/getting-started/IMPLEMENTATION_PLAN.md` | Hiểu lộ trình & kiến trúc dự án       | 15 phút   |
| 2️⃣     | 📄 `docs/architecture/UC_ANALYSIS.md`            | Tìm hiểu 4 use cases chính (UC1-UC4)  | 20 phút   |
| 3️⃣     | 📄 `docs/guides/GIT_WORKFLOW_GUIDE.md`           | Thiết lập Git branches & workflow     | 10 phút   |
| 4️⃣     | 📄 `docs/deployment/DOCKER_SETUP_GUIDE.md`       | Chạy dự án trên máy cục bộ với Docker | 20 phút   |
| 5️⃣     | 📄 `docs/testing/README.md`                      | Tổng quan cấu trúc kiểm thử           | 10 phút   |

**Tổng Cộng:** ~75 phút để có thể làm việc hiệu quả

### **Khởi Động Nhanh (5 phút):**

```bash
# 1. Clone & cài đặt
git clone <repo>
cd Project_KiemThuPhanMem

# 2. Đọc hướng dẫn nhanh
cat docs/getting-started/QUICK_START.md

# 3. Chạy Docker
docker compose up --build

# 4. Truy cập ứng dụng
# Admin: http://localhost:3001
# Cửa hàng: http://localhost:3000
```

---

## 🗂️ Tài Liệu Theo Chủ Đề

### **1. 📍 BẮT ĐẦU** (`docs/getting-started/`)

**Mục Đích:** Hướng dẫn bắt đầu & Tổng quan Dự án

| File                     | Mô Tả                                                    | Đọc Khi Nào                 |
| ------------------------ | -------------------------------------------------------- | --------------------------- |
| `README.md`              | Chỉ mục của thư mục này                                  | Điều hướng phần bắt đầu     |
| `IMPLEMENTATION_PLAN.md` | **TÀI LIỆU CHÍNH** - Lộ trình, tech stack, các giai đoạn | Ngày đầu tiên trong dự án   |
| `QUICK_START.md`         | Hướng dẫn cài đặt nhanh 5 phút                           | Cần chạy dự án ngay lập tức |
| `PROJECT_OVERVIEW.md`    | Tổng quan hệ thống cấp cao (tính năng, modules)          | Hiểu phạm vi dự án          |

**Điều Hướng Chính:**

- Bắt đầu từ đây → Đọc IMPLEMENTATION_PLAN.md
- Sau đó → Chọn hướng đi dựa trên vai trò của bạn:
  - **Lập trình viên?** → Đi tới [Triển khai/Docker](#4-📍-triển-khai)
  - **Người Kiểm Thử?** → Đi tới [Kiểm Thử/Cơ Bản](#3-📍-kiểm-thử)
  - **DevOps?** → Đi tới [Triển khai/CI-CD](#4-📍-triển-khai)

---

### **2. 📍 KIẾN TRÚC** (`docs/architecture/`)

**Mục Đích:** Hiểu Thiết Kế Hệ Thống & Mô Hình Dữ Liệu

| File                        | Mô Tả                                                       | Đọc Khi Nào                         |
| --------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| `README.md`                 | Chỉ mục của thư mục này                                     | Điều hướng phần kiến trúc           |
| `UC_ANALYSIS.md`            | 4 Use Cases (UC1-UC4) + phân tích tính năng + bảng kiểm tra | Trước khi triển khai từng tính năng |
| `DATABASE_SYNC_STRATEGY.md` | Đồng bộ cơ sở dữ liệu giữa các môi trường                   | Quản lý cơ sở dữ liệu đa môi trường |
| `SYSTEM_ARCHITECTURE.md`    | Sơ đồ cấp cao (frontend, backend, database)                 | Hiểu các tầng hệ thống              |

**Sơ Đồ Chính:**

- Sơ đồ Use Case (UC1-UC4)
- Sơ đồ Luồng Dữ Liệu
- Kiến Trúc Hệ Thống (3 tầng)

---

### **3. 📍 KIỂM THỬ** (`docs/testing/`)

**Mục Đích:** Kế hoạch Kiểm thử, Thực Hành Tốt Nhất, Cơ Bản & Thực Thi

#### **3.1 Nền Tảng Kiểm Thử** (`docs/testing/fundamentals/`)

**PHẦN MỚI** - Hướng dẫn kiểm thử từng bước với sơ đồ PlantUML & ví dụ mã

| File                         | Module                | Nội Dung                                                     | Liên Kết                                                                                                                           |
| ---------------------------- | --------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                  | Chỉ mục               | Điều hướng cho 4 modules                                     | -                                                                                                                                  |
| `01_USERS_AUTH_MODULE.md`    | Users/Auth            | Yêu cầu → Thiết kế Test → Test Cases → Ví dụ Code            | [Tests](../../backend/tests/unit/auth.logic.test.js)                                                                               |
| `02_PRODUCTS_MODULE.md`      | Products              | Kiểm thử CRUD, xác thực, các trường hợp lỗi                  | [Tests](../../backend/tests/unit/product.logic.test.js)                                                                            |
| `03_ORDERS_MODULE.md`        | Orders                | Quy trình làm việc, theo dõi trạng thái, tương tác người bán | [Tests](../../backend/tests/unit/order.logic.test.js) + [Integration](../../backend/tests/integration/order-merchant-flow.test.js) |
| `04_CART_PAYMENT_MODULES.md` | Giỏ Hàng & Thanh Toán | Các phép toán giỏ hàng, tích hợp thanh toán MoMo             | [Tests](../../backend/tests/unit/cart.logic.test.js)                                                                               |

**Lộ Trình Đọc:**

```
BẮT ĐẦU → docs/testing/fundamentals/README.md
  ├─→ 01_USERS_AUTH_MODULE.md (Lý Thuyết + Mã)
  ├─→ 02_PRODUCTS_MODULE.md (Lý Thuyết + Mã)
  ├─→ 03_ORDERS_MODULE.md (Lý Thuyết + Tích Hợp)
  └─→ 04_CART_PAYMENT_MODULES.md (Lý Thuyết + Mã)
```

#### **3.2 Tài Liệu Tham Khảo Kiểm Thử** (`docs/testing/`)

**Mục Đích:** Kế hoạch kiểm thử chính thức & thực hành tốt nhất

| File                     | Mô Tả                                                              | Mức Chi Tiết            |
| ------------------------ | ------------------------------------------------------------------ | ----------------------- |
| `README.md`              | Chỉ mục tài liệu kiểm thử                                          | Điều hướng              |
| `TEST_PLAN.md`           | 📋 **CONSOLIDATED** - Kế hoạch kiểm thử toàn diện (107 test cases) | ⭐⭐⭐⭐⭐ Rất Chi Tiết |
| `TEST_BEST_PRACTICES.md` | Jest, mô hình kiểm thử, các tình huống thường gặp                  | ⭐⭐⭐⭐ Tham Khảo      |

**Trạng Thái Kiểm Thử Hiện Tại:**

- ✅ **88 / 107 tests implemented** (82% pass rate)
- 📊 Phạm vi: Auth, Products, Orders, Cart, Wishlist, Review, Payment
- 🧪 Kiểm thử tích hợp: Quy trình Order-Merchant
- ⏭️ 19 tests skipped do missing features (Product Variants, Addresses, Analytics)

**Ghi Chú Consolidation:**

- ✅ TEST_PLAN.md (3 files merged): TEST_PLAN.md + Official_Test_Plan.md + TEST_PLAN_SUMMARY.md
- ✅ DATABASE_SYNC_GUIDE.md (3 files merged): DATABASE_SYNC_README + DATABASE_SYNC_GUIDE + HOW_TO_SYNC_DATABASE

---

### **4. 📍 TRIỂN KHAI** (`docs/deployment/`)

**Mục Đích:** Docker, Triển khai Đám Mây, Di chuyển, CI/CD

| File                          | Mô Tả                                                             | Đọc Khi Nào                         |
| ----------------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| `README.md`                   | Chỉ mục của thư mục này                                           | Điều hướng phần triển khai          |
| `DOCKER_SETUP_GUIDE.md`       | Cài đặt Docker cho phát triển cục bộ                              | Cài đặt dự án ban đầu               |
| `DOCKER_QUICKSTART.md`        | Khởi động nhanh Docker (5 phút)                                   | Chạy dự án ngay                     |
| `DEPLOYMENT_GUIDE.md`         | Đường ống triển khai toàn diện (Railway + Vercel)                 | Triển khai vào sản xuất             |
| `RAILWAY_VERCEL_CONFIG.md`    | Cấu hình nền tảng đám mây                                         | Thiết lập triển khai tự động        |
| `DATABASE_SYNC_GUIDE.md`      | 📋 **CONSOLIDATED** - Di chuyển, đồng bộ, khôi phục cơ sở dữ liệu | Sửa đổi lược đồ, đồng bộ môi trường |
| `DATABASE_MIGRATION_GUIDE.md` | Di chuyển Prisma, dữ liệu seed                                    | Quản lý lược đồ cơ sở dữ liệu       |
| `CI_CD_SETUP_GUIDE.md`        | GitHub Actions, triển khai tự động                                | Thiết lập đường ống CI/CD           |
| `DEVOPS_SETUP.md`             | Thực hành tốt nhất DevOps & giám sát                              | Hoạt động sản xuất                  |

**Luồng Triển Khai:**

```
Phát Triển Cục Bộ (Docker)
    ↓
Git Push
    ↓
GitHub Actions (Xác Thực)
    ↓
Railway Auto-Deploy (Backend + Di chuyển)
    ↓
Vercel Auto-Deploy (Frontends)
    ↓
Sản Xuất Trực Tiếp
```

---

### **5. 📍 HƯỚNG DẪN** (`docs/guides/`)

**Mục Đích:** Hướng dẫn thực tế cho các tác vụ thường gặp

| File                        | Mô Tả                                                             | Dùng Cho                            |
| --------------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| `README.md`                 | Chỉ mục của thư mục này                                           | Điều hướng phần hướng dẫn           |
| `GIT_WORKFLOW_GUIDE.md`     | Chiến lược nhánh Git, quy trình PR, hợp nhất                      | Quản lý mã                          |
| `MOMO_INTEGRATION_GUIDE.md` | Cài đặt tích hợp thanh toán MoMo                                  | Tính năng thanh toán                |
| `DATABASE_SYNC_GUIDE.md`    | 📋 **CONSOLIDATED** - Đồng bộ, di chuyển, khôi phục cơ sở dữ liệu | Quản lý cơ sở dữ liệu đa môi trường |

---

### **6. 📍 ĐÁNH GIÁ** (`docs/assessments/`)

**Mục Đích:** Báo cáo hoàn thành, tiêu chí đánh giá, kết quả kiểm thử

| File                           | Mô Tả                                   | Mục Đích                              |
| ------------------------------ | --------------------------------------- | ------------------------------------- |
| `README.md`                    | Chỉ mục của thư mục này                 | Điều hướng phần đánh giá              |
| `PROJECT_COMPLETION_REPORT.md` | Báo cáo hoàn thành dự án (86/100 điểm)  | Tổng kết dự án & tiến độ              |
| `TEST_SUMMARY_REPORT.md`       | Tóm tắt kết quả kiểm thử (88/107 cases) | Chất lượng phần mềm & độ bao phủ code |

**Trạng Thái Dự Án:**

- ✅ **Hoàn Thành: 86/100** (tính năng lõi hoàn chỉnh)
- ✅ **Test Pass: 88/107** (82% - 19 cases skip do missing features)
- ✅ **Code Coverage: ~80%** (đạt mục tiêu)

---

## 📊 Bản Đồ Tổ Chức Tệp

### **Vị Trí Hiện Tại → Vị Trí Mới**

#### **Tệp Cần Di Chuyển (Root → docs/)**

| Vị Trí Hiện Tại             | Vị Trí Mới           | Lý Do                |
| --------------------------- | -------------------- | -------------------- |
| `README.md`                 | Giữ ở root           | Điểm vào chính       |
| `DOCKER_QUICKSTART.md`      | → `docs/deployment/` | Tham khảo Docker     |
| `DEPLOYMENT_GUIDE.md`       | → `docs/deployment/` | Hướng dẫn triển khai |
| `MOMO_INTEGRATION_GUIDE.md` | → `docs/guides/`     | Hướng dẫn tích hợp   |
| `RAILWAY_VERCEL_CONFIG.md`  | → `docs/deployment/` | Cấu hình triển khai  |

#### **Tệp Cần Gộp (Xóa Sau Khi Gộp)**

| Tệp                              | Gộp Vào                                 | Lý Do                           |
| -------------------------------- | --------------------------------------- | ------------------------------- |
| `DATABASE_SYNC_README.md`        | `docs/guides/DATABASE_SYNC_GUIDE.md`    | Mục đích trùng lặp              |
| `HOW_TO_SYNC_DATABASE.md`        | `docs/guides/DATABASE_SYNC_GUIDE.md`    | Phiên bản cũ                    |
| `DOCUMENTATION_SUMMARY.md`       | `DOCUMENTATION_STRUCTURE.md` (file này) | Thay thế bằng chỉ mục toàn diện |
| `scripts/DOCUMENTATION_INDEX.md` | `DOCUMENTATION_STRUCTURE.md`            | Thay thế bằng chỉ mục toàn diện |

#### **Tệp Cần Di Chuyển (docs/ → docs/deployment/)**

| Hiện Tại                           | Vị Trí Mới         | Lý Do                           |
| ---------------------------------- | ------------------ | ------------------------------- |
| `docs/DOCKER_SETUP_GUIDE.md`       | `docs/deployment/` | Docker là công cụ triển khai    |
| `docs/DEPLOYMENT_GUIDE.md`         | `docs/deployment/` | Chủ đề triển khai               |
| `docs/DATABASE_MIGRATION_GUIDE.md` | `docs/deployment/` | Di chuyển là bước triển khai    |
| `docs/CI_CD_SETUP_GUIDE.md`        | `docs/deployment/` | CI/CD là tự động hóa triển khai |
| `docs/DEVOPS_SETUP.md`             | `docs/deployment/` | DevOps là hoạt động triển khai  |

#### **Tệp Cần Di Chuyển (docs/ → docs/architecture/)**

| Hiện Tại                         | Vị Trí Mới           | Lý Do                |
| -------------------------------- | -------------------- | -------------------- |
| `docs/UC_ANALYSIS.md`            | `docs/architecture/` | Kiến trúc & thiết kế |
| `docs/DATABASE_SYNC_STRATEGY.md` | `docs/architecture/` | Chiến lược kiến trúc |

#### **Tệp Cần Di Chuyển (docs/ → docs/guides/)**

| Hiện Tại                     | Vị Trí Mới     | Lý Do             |
| ---------------------------- | -------------- | ----------------- |
| `docs/GIT_WORKFLOW_GUIDE.md` | `docs/guides/` | Hướng dẫn thực tế |

#### **Tệp Cần Di Chuyển (backend/docs/ → docs/testing/)**

| Hiện Tại                              | Vị Trí Mới                | Lý Do              |
| ------------------------------------- | ------------------------- | ------------------ |
| `backend/docs/TEST_PLAN.md`           | `docs/testing/reference/` | Tham khảo kiểm thử |
| `backend/docs/Official_Test_Plan.md`  | `docs/testing/reference/` | Tham khảo kiểm thử |
| `backend/docs/TEST_SUMMARY_REPORT.md` | `docs/testing/reference/` | Tham khảo kiểm thử |
| `backend/docs/TEST_BEST_PRACTICES.md` | `docs/testing/reference/` | Tham khảo kiểm thử |
| `backend/TEST_DATABASE_SETUP.md`      | `docs/testing/execution/` | Thực thi kiểm thử  |

#### **Tệp Giữ Ở Root**

| Tệp                          | Lý Do                           |
| ---------------------------- | ------------------------------- |
| `README.md`                  | Điểm vào chính                  |
| `DOCUMENTATION_STRUCTURE.md` | Trung tâm điều hướng (file này) |

---

## 🔗 Bản Đồ Tham Chiếu Chéo

### **Lộ Trình Đọc Theo Vai Trò:**

#### **👨‍💻 Nhà Phát Triển Phần Mềm**

```
1. IMPLEMENTATION_PLAN.md (hiểu dự án)
2. UC_ANALYSIS.md (cần xây dựng gì)
3. GIT_WORKFLOW_GUIDE.md (cách mã hóa)
4. DOCKER_SETUP_GUIDE.md (chạy cục bộ)
5. SYSTEM_ARCHITECTURE.md (hiểu codebase)
6. DATABASE_MIGRATION_GUIDE.md (nếu sửa đổi cơ sở dữ liệu)
```

#### **🧪 Kỹ Sư QA / Kiểm Thử**

```
1. IMPLEMENTATION_PLAN.md (hiểu dự án)
2. UC_ANALYSIS.md (cần kiểm thử gì)
3. TEST_PLAN.md (chiến lược kiểm thử)
4. 01_USERS_AUTH_MODULE.md (nền tảng kiểm thử)
5. 02_PRODUCTS_MODULE.md (áp dụng khái niệm)
6. 03_ORDERS_MODULE.md (kiểm thử tích hợp)
7. HOW_TO_RUN_TESTS.md (thực thi kiểm thử)
8. DEBUGGING_GUIDE.md (khắc phục sự cố)
```

#### **🚀 DevOps / Triển Khai**

```
1. IMPLEMENTATION_PLAN.md (hiểu dự án)
2. DOCKER_SETUP_GUIDE.md (môi trường cục bộ)
3. DEPLOYMENT_GUIDE.md (triển khai sản xuất)
4. RAILWAY_VERCEL_CONFIG.md (cấu hình đám mây)
5. CI_CD_SETUP_GUIDE.md (tự động hóa)
6. DEVOPS_SETUP.md (giám sát & hoạt động)
```

#### **👔 Quản Lý Dự Án / Người Đánh Giá**

```
1. IMPLEMENTATION_PLAN.md (lộ trình & phạm vi)
2. UC_ANALYSIS.md (tính năng & yêu cầu)
3. PROJECT_COMPLETION_REPORT.md (đánh giá & tiến độ)
4. TEST_SUMMARY_REPORT.md (số liệu chất lượng)
```

---

## 📑 Các Tệp Mới Cần Tạo (Nền Tảng Kiểm Thử)

Những tệp này sẽ được tạo trong `docs/testing/fundamentals/`:

| Tệp                          | Nội Dung                                                | Kích Thước        | Trạng Thái   |
| ---------------------------- | ------------------------------------------------------- | ----------------- | ------------ |
| `01_USERS_AUTH_MODULE.md`    | Hướng dẫn kiểm thử module Users/Auth với sơ đồ PlantUML | 📄 2000-3000 dòng | 🟡 Chờ Xử Lý |
| `02_PRODUCTS_MODULE.md`      | Hướng dẫn kiểm thử module Products                      | 📄 1500-2000 dòng | 🟡 Chờ Xử Lý |
| `03_ORDERS_MODULE.md`        | Hướng dẫn kiểm thử module Orders + kiểm thử tích hợp    | 📄 2000-2500 dòng | 🟡 Chờ Xử Lý |
| `04_CART_PAYMENT_MODULES.md` | Hướng dẫn kiểm thử module Giỏ Hàng & Thanh Toán         | 📄 1500-2000 dòng | 🟡 Chờ Xử Lý |

**Cấu Trúc Nội Dung Cho Mỗi:**

```
1. Tổng Quan Module (mục đích, thành phần chính)
2. Phân Tích Yêu Cầu (chức năng + phi chức năng)
3. Chiến Lược Kiểm Thử (unit vs tích hợp)
4. Sơ Đồ Kiến Trúc PlantUML
5. Thiết Kế Kiểm Thử (các trường hợp kiểm thử, dữ liệu kiểm thử)
6. Các Trường Hợp Kiểm Thử (chi tiết từng bước)
7. Ví Dụ Mã (từ các tệp kiểm thử thực tế)
8. Hướng Dẫn Thực Thi (cách chạy)
9. Các Vấn Đề Thường Gặp & Gỡ Lỗi (khắc phục sự cố)
10. Liên Kết Tệp Liên Quan (tham chiếu chéo)
```

---

## ✅ Kế Hoạch Hành Động (Sẽ Được Thực Thi)

### **Giai Đoạn 1: Tạo Cấu Trúc Thư Mục**

- [ ] Tạo `docs/getting-started/`
- [ ] Tạo `docs/architecture/`
- [ ] Tạo `docs/testing/` với các thư mục con (fundamentals, reference, execution)
- [ ] Tạo `docs/deployment/`
- [ ] Tạo `docs/guides/`
- [ ] Tạo `docs/assessments/`

### **Giai Đoạn 2: Tạo README.md Cho Mỗi Thư Mục**

- [ ] `docs/getting-started/README.md`
- [ ] `docs/architecture/README.md`
- [ ] `docs/testing/README.md`
- [ ] `docs/testing/fundamentals/README.md`
- [ ] `docs/testing/reference/README.md`
- [ ] `docs/testing/execution/README.md`
- [ ] `docs/deployment/README.md`
- [ ] `docs/guides/README.md`
- [ ] `docs/assessments/README.md`

### **Giai Đoạn 3: Tạo Hướng Dẫn Kiểm Thử Nền Tảng Mới**

- [ ] `docs/testing/fundamentals/01_USERS_AUTH_MODULE.md`
- [ ] `docs/testing/fundamentals/02_PRODUCTS_MODULE.md`
- [ ] `docs/testing/fundamentals/03_ORDERS_MODULE.md`
- [ ] `docs/testing/fundamentals/04_CART_PAYMENT_MODULES.md`

### **Giai Đoạn 4: Di Chuyển Các Tệp Hiện Có**

- [ ] Di chuyển tệp từ root sang các thư mục `docs/` thích hợp
- [ ] Di chuyển tệp từ `docs/` sang các thư mục con thích hợp
- [ ] Di chuyển tệp từ `backend/docs/` sang `docs/testing/`
- [ ] Tạo DATABASE_SYNC_GUIDE.md hợp nhất
- [ ] Xóa các tệp trùng lặp cũ

### **Giai Đoạn 5: Cập Nhật Tất Cả Tham Chiếu Chéo**

- [ ] Cập nhật liên kết trong README.md
- [ ] Cập nhật liên kết trong tất cả tệp đã di chuyển
- [ ] Xác thực không có liên kết bị hỏng
- [ ] Cập nhật tham chiếu tệp nội bộ

### **Giai Đoạn 6: Dọn Dẹp Cuối Cùng**

- [ ] Xem xét nội dung trùng lặp
- [ ] Đảm bảo định dạng nhất quán
- [ ] Cập nhật git và cam kết thay đổi

---

## 🔍 Cách Sử Dụng Tệp Này

1. **Để Điều Hướng:** Tìm chủ đề của bạn trong [📋 Tài Liệu Theo Chủ Đề](#-tài-liệu-theo-chủ-đề)
2. **Cho Vai Trò Của Bạn:** Làm theo đường dẫn trong [🔗 Bản Đồ Tham Chiếu Chéo](#-bản-đồ-tham-chiếu-chéo)
3. **Cho Vị Trí Tệp:** Kiểm tra [📊 Bản Đồ Tổ Chức Tệp](#-bản-đồ-tổ-chức-tệp)
4. **Cho Tiến Độ:** Theo dõi [✅ Kế Hoạch Hành Động](#-kế-hoạch-hành-động-sẽ-được-thực-thi)

---

## 📞 Có Câu Hỏi?

- **Không thể tìm thấy những gì bạn tìm kiếm?** Kiểm tra mục lục ở trên
- **Cần câu trả lời nhanh?** Hãy thử phần [Điều Hướng Nhanh](#-điều-hướng-nhanh)
- **Đang học để kiểm thử?** Bắt đầu với [Nền Tảng Kiểm Thử](#31-nền-tảng-kiểm-thử-docstestingfundamentals)
- **Triển khai vào sản xuất?** Đi tới [Triển Khai](#4-📍-triển-khai)

---

**Trạng Thái Tài Liệu:** 🟢 Hoàn Chỉnh & Sẵn Sàng Để Xem Xét  
**Cập Nhật Lần Cuối:** 2025-12-07  
**Phiên Bản:** 1.0
