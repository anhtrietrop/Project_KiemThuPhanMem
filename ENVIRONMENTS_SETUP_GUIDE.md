# Hướng Dẫn Thiết Lập Môi Trường Development và Production

Tài liệu này đề xuất phương pháp chia tách dự án thành 2 môi trường riêng biệt: **Development (Dev)** và **Production (Prod)** dựa trên cấu trúc hiện tại của đồ án.

## 1. Chiến Lược Nhánh (Git Branching Strategy)

Sử dụng mô hình **Git Flow** đơn giản hóa:

- **`main`**: Chứa mã nguồn ổn định, sẵn sàng cho sản phẩm thực tế.
  - **Môi trường:** Production.
  - **Dữ liệu:** Database thật (Production DB).
  - **Deploy:** Tự động deploy khi có commit mới vào `main`.
- **`develop`** (Cần tạo mới): Nhánh trung gian để tích hợp các tính năng mới.
  - **Môi trường:** Development / Staging.
  - **Dữ liệu:** Database thử nghiệm (Dev DB).
  - **Deploy:** Tự động deploy khi có commit mới vào `develop`.
- **`feature/*`**: Các nhánh tính năng (ví dụ: `feature/login`, `feature/cart`).
  - Merge vào `develop` khi hoàn thành.

### Cách thực hiện:

```bash
# Tạo nhánh develop từ main
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop
```

---

## 2. Cấu Hình Database

Bạn cần 2 cơ sở dữ liệu riêng biệt để tránh việc test làm hỏng dữ liệu thật.

- **Production DB**: Database đã được deploy trên Render/Railway.
- **Development DB**: Database local trên máy dev đặt trên docker container hoặc dump local thông qua mysql sử dụng connection string.

---

## 3. Cấu Hình Frontend (Vercel)

Vercel hỗ trợ rất tốt việc này thông qua cơ chế **Environment Variables per Environment**.

### Bước 1: Cấu hình Biến Môi Trường trên Vercel

Vào **Settings** > **Environment Variables** của dự án Frontend (User & Admin).

Thêm biến `NEXT_PUBLIC_API_BASE_URL`:

1.  **Production Environment**:

    - Value: `https://backend-ecommerce-prod.onrender.com` (URL của Backend Prod)
    - Select: **Production** only.

2.  **Preview / Development Environment**:
    - Value: `https://backend-ecommerce-dev.onrender.com` (URL của Backend Dev)
    - Select: **Preview** và **Development**.

### Bước 2: Deploy

- Khi push code vào `main` -> Vercel build Prod, dùng API Prod.
- Khi push code vào `develop` -> Vercel build Preview, dùng API Dev.

---

## 5. Quy Trình Làm Việc (Workflow)

1.  **Code mới**: Dev tạo nhánh `feature/abc` từ `develop`.
2.  **Test Local**: Chạy docker-compose local để code.
3.  **Merge vào Develop**:
    - Tạo Pull Request (PR) từ `feature/abc` -> `develop`.
    - Review code, merge.
    - Tạo test mới nếu cần và rebuild CI.
    - CI/CD chạy test.
    - Render deploy `backend-dev`.
    - Vercel deploy `frontend-dev`.
    - Team vào test trên môi trường Dev.
4.  **Release**:
    - Khi `develop` đã ổn định, tạo PR từ `develop` -> `main`.
    - Merge vào `main`.
    - Hệ thống tự động deploy ra Production.

## 6. Tổng kết

- Môi trường Dev và Prod được tách biệt hoàn toàn.
- Quy trình làm việc rõ ràng, giúp kiểm soát chất lượng code tốt hơn.
- Đã thực hiện thành công trên dự án mẫu.
