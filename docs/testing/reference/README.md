# 📍 KIỂM THỬ - TÀI LIỆU THAM KHẢO

**Thư mục:** `docs/testing/reference/`

---

## 🎯 Mục Đích

Phần này chứa **tài liệu kiểm thử chính thức & tham khảo** của dự án.

Dành cho những ai cần:

- 📋 Kế hoạch kiểm thử chi tiết
- 📊 Kết quả thực thi hiện tại
- 🏆 Thực hành tốt nhất & quy tắc

---

## 📚 Các Tệp Trong Thư Mục Này

| Tệp                      | Mô Tả                                                               | Mục Đích            | Khi Nào                 |
| ------------------------ | ------------------------------------------------------------------- | ------------------- | ----------------------- |
| `TEST_PLAN.md`           | **Kế hoạch kiểm thử toàn diện** (751 dòng) - Unit, Integration, E2E | Tài liệu chính thức | Khi cần chi tiết đầy đủ |
| `Official_Test_Plan.md`  | Kế hoạch kiểm thử chính thức (định dạng formal)                     | Tài liệu tham khảo  | Báo cáo, tài liệu dự án |
| `TEST_SUMMARY_REPORT.md` | Báo cáo kết quả thực thi (119 passed / 121 total)                   | Số liệu hiện tại    | Theo dõi tiến độ        |
| `TEST_BEST_PRACTICES.md` | Quy tắc & thực hành tốt nhất (Jest, patterns, pitfalls)             | Hướng dẫn viết test | Khi viết test mới       |

---

## 📊 Trạng Thái Kiểm Thử Hiện Tại

```
✅ Tổng Tests:      121
✅ Passed:          119
❌ Failed:          2
📊 Pass Rate:       98.3%

🧪 Coverage:
   - Auth (Login, Register, Password)
   - Products (CRUD, Validation)
   - Orders (Create, Update, Status)
   - Cart (Add, Remove, Update Quantity)
   - Wishlist (Add, Remove)
   - Review (Create, Update)
```

---

## 🔍 Lộ Trình Đọc Theo Mục Đích

### **📋 Tôi Cần Xem Kế Hoạch Kiểm Thử Chi Tiết**

```
1. TEST_PLAN.md (đầy đủ nhất)
   - Kiến trúc test
   - Test cases cho từng module
   - Test data & fixtures
   - Acceptance criteria

2. Official_Test_Plan.md (định dạng formal)
   - Dùng cho báo cáo
   - Định dạng chính thức

3. TEST_BEST_PRACTICES.md (cách viết)
   - Quy tắc Jest
   - Các pattern tốt
   - Tránh các pitfalls
```

### **📊 Tôi Muốn Xem Kết Quả Hiện Tại**

```
1. TEST_SUMMARY_REPORT.md (báo cáo mới nhất)
   - Số liệu pass/fail
   - Coverage metrics
   - Từng module kết quả nào
```

### **🏆 Tôi Muốn Hiểu Thực Hành Tốt Nhất**

```
1. TEST_BEST_PRACTICES.md (quy tắc & tips)
   - Cách organize tests
   - Naming conventions
   - Async/await patterns
   - Error handling
   - Mocking best practices

2. TEST_PLAN.md (xem ví dụ)
   - Cách các tests được thiết kế
```

---

## 🔗 Liên Kết Với Các Phần Khác

| Cần Gì?                   | Đi Tới Đâu                      |
| ------------------------- | ------------------------------- |
| **Học kiểm thử từ đầu**   | `fundamentals/README.md`        |
| **Chạy kiểm thử**         | `execution/HOW_TO_RUN_TESTS.md` |
| **Gỡ lỗi test fail**      | `execution/DEBUGGING_GUIDE.md`  |
| **Xem kế hoạch chi tiết** | `TEST_PLAN.md` (file này)       |

---

## 📈 Thống Kê Test Theo Module

### Từ TEST_SUMMARY_REPORT.md:

| Module      | Tests | Status          | Ghi Chú                  |
| ----------- | ----- | --------------- | ------------------------ |
| Auth        | 15    | ✅ Pass         | Login, Register, JWT     |
| Products    | 18    | ✅ Pass         | CRUD, Validation         |
| Orders      | 22    | ✅ Pass (20/22) | 2 failed (xem DEBUGGING) |
| Cart        | 16    | ✅ Pass         | Add, Remove, Update      |
| Wishlist    | 12    | ✅ Pass         | Add, Remove              |
| Review      | 10    | ✅ Pass         | Create, Rating           |
| Integration | 18    | ✅ Pass         | Order workflow           |

---

## 💡 Mẹo Sử Dụng

✅ **Đọc TEST_PLAN.md trước** nếu muốn hiểu toàn diện

✅ **Kiểm tra TEST_SUMMARY_REPORT.md** trước khi làm việc (để biết tình trạng)

✅ **Tham khảo TEST_BEST_PRACTICES.md** khi viết test mới

✅ **Dùng Official_Test_Plan.md** cho báo cáo & tài liệu

---

## 📞 Cần Giúp Đỡ?

- **2 tests fail là gì?** → `execution/DEBUGGING_GUIDE.md`
- **Cách viết test tốt?** → `TEST_BEST_PRACTICES.md`
- **Kiểm thử module mới?** → `fundamentals/` (xem ví dụ)
- **Cần chạy lại?** → `execution/HOW_TO_RUN_TESTS.md`
