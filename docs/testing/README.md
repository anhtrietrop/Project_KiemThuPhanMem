# 📍 KIỂM THỬ - Kế Hoạch, Thực Hành & Nền Tảng

**Thư mục:** `docs/testing/`

---

## 🎯 Mục Đích

Phần này có **tất cả** những gì bạn cần để **viết, chạy, gỡ lỗi các kiểm thử**.

Bao gồm:

- 📖 Nền tảng kiểm thử (cho người mới học)
- 📋 Tài liệu tham khảo chính thức
- 🛠️ Hướng dẫn thực thi (cách chạy)

---

## 📁 Cấu Trúc Thư Mục

```
docs/testing/
├── README.md (file này)
├── fundamentals/          ← HỌC KIỂM THỬ CÓ HƯỚNG DẪN
│   ├── 01_USERS_AUTH_MODULE.md
│   ├── 02_PRODUCTS_MODULE.md
│   ├── 03_ORDERS_MODULE.md
│   ├── 04_CART_PAYMENT_MODULES.md
│   └── README.md
├── reference/            ← TÀI LIỆU THAM KHẢO CHÍNH THỨC
│   ├── TEST_PLAN.md
│   ├── Official_Test_Plan.md
│   ├── TEST_SUMMARY_REPORT.md
│   ├── TEST_BEST_PRACTICES.md
│   └── README.md
└── execution/            ← HƯỚNG DẪN CHẠY KIỂM THỬ
    ├── TEST_DATABASE_SETUP.md
    ├── HOW_TO_RUN_TESTS.md
    ├── DEBUGGING_GUIDE.md
    └── README.md
```

---

## 📚 Lộ Trình Đọc Theo Mục Đích

### **🆕 Tôi Là Người Mới Học Kiểm Thử**

```
1. fundamentals/README.md (tổng quan)
   ↓
2. fundamentals/01_USERS_AUTH_MODULE.md (ví dụ đơn giản)
   ↓
3. fundamentals/02_PRODUCTS_MODULE.md (áp dụng)
   ↓
4. execution/HOW_TO_RUN_TESTS.md (chạy thực tế)
   ↓
5. execution/DEBUGGING_GUIDE.md (gỡ lỗi)
```

**Thời gian:** ~3-4 giờ để hiểu cơ bản

### **📋 Tôi Cần Xem Kế Hoạch Kiểm Thử Chính Thức**

```
1. reference/TEST_PLAN.md (kế hoạch toàn diện)
2. reference/TEST_BEST_PRACTICES.md (thực hành tốt)
3. reference/TEST_SUMMARY_REPORT.md (kết quả hiện tại)
```

### **🚀 Tôi Muốn Chạy Kiểm Thử Ngay**

```
1. execution/TEST_DATABASE_SETUP.md (chuẩn bị)
2. execution/HOW_TO_RUN_TESTS.md (chạy)
3. execution/DEBUGGING_GUIDE.md (nếu có lỗi)
```

### **🔍 Kiểm Thử Thất Bại, Cần Gỡ Lỗi**

```
1. execution/DEBUGGING_GUIDE.md (các vấn đề phổ biến)
2. Xem code test thực tế → `backend/tests/`
3. Liên hệ với fundamentals/01-04 (ví dụ)
```

---

## 🔗 Liên Kết Nhanh

| Cần Gì?                   | Đi Đến Đâu                             |
| ------------------------- | -------------------------------------- |
| **Học kiểm thử từ đầu**   | `fundamentals/README.md`               |
| **Xem kế hoạch kiểm thử** | `reference/TEST_PLAN.md`               |
| **Chạy kiểm thử**         | `execution/HOW_TO_RUN_TESTS.md`        |
| **Gỡ lỗi test fail**      | `execution/DEBUGGING_GUIDE.md`         |
| **Xem ví dụ code**        | `fundamentals/01_USERS_AUTH_MODULE.md` |
| **Thực hành tốt nhất**    | `reference/TEST_BEST_PRACTICES.md`     |

---

## 📊 Trạng Thái Kiểm Thử Hiện Tại

- ✅ **119 / 121 tests passing** (98.3%)
- 📊 Bao gồm: Auth, Products, Orders, Cart, Wishlist, Review
- 🧪 Tích hợp: Order-Merchant workflow
- ⏱️ Thời gian chạy: ~30 giây cho tất cả tests

---

## 💡 Mẹo Sử Dụng

- **Lần đầu?** → Bắt đầu với `fundamentals/` (có hướng dẫn chi tiết)
- **Đã biết kiểm thử?** → Đi thẳng `reference/` (tài liệu chính thức)
- **Cần chạy ngay?** → Đi `execution/HOW_TO_RUN_TESTS.md`
- **Test fail?** → `execution/DEBUGGING_GUIDE.md` trước, sau đó `fundamentals/`
