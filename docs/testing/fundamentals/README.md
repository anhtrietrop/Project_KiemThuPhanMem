# 📍 KIỂM THỬ - NỀN TẢNG

**Thư mục:** `docs/testing/fundamentals/`

---

## 🎯 Mục Đích

Phần này **dạy bạn kiểm thử từ đầu** bằng cách **phân tích 4 modules tiêu biểu** của dự án:

1. **Users/Auth** - Quản lý người dùng & xác thực
2. **Products** - Quản lý sản phẩm (CRUD)
3. **Orders** - Quy trình đặt hàng & thanh toán
4. **Cart & Payment** - Giỏ hàng & tích hợp MoMo

Mỗi module bạn sẽ học:

- ✅ Yêu cầu là gì?
- ✅ Cách thiết kế test
- ✅ Các trường hợp kiểm thử cụ thể
- ✅ Code ví dụ từ project thực tế
- ✅ Cách chạy & gỡ lỗi

---

## 📚 7 Modules Tiêu Biểu

| #   | Module                 | Tệp                             | Độ Khó          | Khi Nào            |
| --- | ---------------------- | ------------------------------- | --------------- | ------------------ |
| 1️⃣  | **Users/Auth**         | `01_USERS_AUTH_MODULE.md`       | ⭐ Dễ           | Đọc đầu tiên       |
| 2️⃣  | **Products**           | `02_PRODUCTS_MODULE.md`         | ⭐⭐ Trung Bình | Sau Users/Auth     |
| 3️⃣  | **Orders**             | `03_ORDERS_MODULE.md`           | ⭐⭐⭐ Khó      | Hiểu tích hợp      |
| 4️⃣  | **Cart & Payment**     | `04_CART_PAYMENT_MODULES.md`    | ⭐⭐⭐ Khó      | Cuối cùng nhóm UC1 |
| 5️⃣  | **Wishlist & Reviews** | `05_WISHLIST_REVIEWS_MODULE.md` | ⭐⭐ Trung Bình | Sau Cart/Products  |
| 6️⃣  | **Admin Analytics**    | `06_ADMIN_ANALYTICS_MODULE.md`  | ⭐⭐⭐ Khó      | Khi cần số liệu    |
| 7️⃣  | **Notifications**      | `07_NOTIFICATION_MODULE.md`     | ⭐⭐ Trung Bình | Queue/OTP/Push     |

---

## 🎓 Cấu Trúc Mỗi Module

Mỗi tệp sẽ bao gồm:

```
1. 📌 Tổng Quan Module
   - Mục đích module
   - Các thành phần chính
   - Liên kết với module khác

2. 📋 Phân Tích Yêu Cầu
   - Yêu cầu chức năng (FR)
   - Yêu cầu phi chức năng (NFR)

3. 🎯 Chiến Lược Kiểm Thử
   - Unit tests (kiểm thử đơn vị)
   - Integration tests (kiểm thử tích hợp)
   - Test data cần thiết

4. 🌳 Sơ Đồ Kiến Trúc (PlantUML)
   - Cấu trúc dữ liệu
   - Luồng nghiệp vụ
   - Dependencies

5. 🧪 Thiết Kế Kiểm Thử
   - Các trường hợp kiểm thử (Test Cases)
   - Dữ liệu kiểm thử (Test Data)
   - Mục đích của mỗi test

6. 📝 Các Trường Hợp Kiểm Thử Chi Tiết
   - Mô tả từng bước
   - Kết quả kỳ vọng
   - Các trường hợp lỗi

7. 💻 Ví Dụ Code
   - Code từ project thực tế
   - Cách viết test
   - Các pattern tốt

8. 🛠️ Hướng Dẫn Thực Thi
   - Cách chạy test module này
   - Các lệnh cụ thể
   - Kỳ vọng output

9. 🐛 Gỡ Lỗi & Vấn Đề Thường Gặp
   - Lỗi phổ biến
   - Cách khắc phục
   - Debugging tips

10. 🔗 Liên Kết Tệp
    - Liên kết tới test files
    - Liên kết tới code chính
    - Liên kết tới modules khác
```

---

## ⏱️ Lộ Trình Học (Khuyến Nghị)

### **Ngày 1: Cơ Bản**

```
Sáng: 01_USERS_AUTH_MODULE.md (2 giờ)
  ↓
Chiều: 02_PRODUCTS_MODULE.md (2 giờ)
```

### **Ngày 2: Nâng Cao**

```
Sáng: 03_ORDERS_MODULE.md (2.5 giờ)
  ↓
Chiều: 04_CART_PAYMENT_MODULES.md (2 giờ)
```

### **Ngày 3: Thực Hành**

```
Thực hành: Chạy tất cả tests
  ↓
Viết test mới cho module khác
  ↓
Gỡ lỗi khi test fail
```

---

## 🔗 Liên Kết Nhanh

| Module         | Tệp                          | Test Code                                              | Bắt Đầu     |
| -------------- | ---------------------------- | ------------------------------------------------------ | ----------- |
| Users/Auth     | `01_USERS_AUTH_MODULE.md`    | `backend/tests/unit/auth.logic.test.js`                | ✅ Đơn giản |
| Products       | `02_PRODUCTS_MODULE.md`      | `backend/tests/unit/product.logic.test.js`             | ✅ Tiếp tục |
| Orders         | `03_ORDERS_MODULE.md`        | `backend/tests/unit/order.logic.test.js` + Integration | ⚠️ Phức tạp |
| Cart & Payment | `04_CART_PAYMENT_MODULES.md` | `backend/tests/unit/cart.logic.test.js`                | ⚠️ Phức tạp |

---

## 💡 Mẹo Sử Dụng

✅ **Đọc theo thứ tự:** 01 → 02 → 03 → 04 (từ dễ đến khó)

✅ **Chạy code khi đọc:** Mở terminal & chạy test từng cái

✅ **Xem sơ đồ PlantUML:** Bạn có thể copy & paste vào PlantUML Online để visualize

✅ **So sánh với code thực tế:** Mở file test code song song với tài liệu

✅ **Thực hành:** Viết test riêng cho module khác sau khi hoàn thành 4 modules

---

## 🎯 Mục Tiêu Sau Khi Hoàn Thành

Sau khi đọc xong 4 modules, bạn sẽ:

- ✅ Hiểu cách kiểm thử từng loại (unit, integration)
- ✅ Biết cách thiết kế test cases hiệu quả
- ✅ Có thể viết test cho module mới
- ✅ Biết cách gỡ lỗi khi test fail
- ✅ Hiểu các pattern & best practices

---

## 📞 Cần Giúp Đỡ?

- **Test fail?** → Xem phần "Gỡ Lỗi" trong module đó
- **Không hiểu khái niệm?** → Quay lại ngắn gọn "Tổng Quan Module"
- **Cần chạy test?** → Đi tới `docs/testing/execution/HOW_TO_RUN_TESTS.md`
- **Cần tham khảo chính thức?** → Đi tới `docs/testing/reference/TEST_PLAN.md`
