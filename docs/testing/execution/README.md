# 📍 KIỂM THỬ - THỰC THI

**Thư mục:** `docs/testing/execution/`

---

## 🎯 Mục Đích

Phần này hướng dẫn bạn **chạy kiểm thử thực tế trên máy của bạn**.

Bao gồm:

- 🛠️ Cài đặt môi trường kiểm thử
- 📝 Cách chạy tests
- 🐛 Gỡ lỗi khi test fail

---

## 📚 Các Tệp Trong Thư Mục Này

| Tệp                      | Mô Tả                                          | Khi Nào Đọc       |
| ------------------------ | ---------------------------------------------- | ----------------- |
| `TEST_DATABASE_SETUP.md` | Cài đặt cơ sở dữ liệu kiểm thử & fixtures      | Lần đầu chạy test |
| `HOW_TO_RUN_TESTS.md`    | Từng bước chạy unit, integration, tất cả tests | Muốn chạy test    |
| `DEBUGGING_GUIDE.md`     | Gỡ lỗi khi test fail, các vấn đề phổ biến      | Khi test fail     |

---

## ⚡ Bắt Đầu Nhanh (3 Bước)

### **Bước 1: Chuẩn Bị Database**

```bash
cd backend
npm run test:setup
```

Xem chi tiết → `TEST_DATABASE_SETUP.md`

### **Bước 2: Chạy Tests**

```bash
npm test
```

Xem chi tiết → `HOW_TO_RUN_TESTS.md`

### **Bước 3: Nếu Fail**

Xem `DEBUGGING_GUIDE.md` để khắc phục

---

## 🔗 Liên Kết Nhanh

| Cần Gì?               | Đi Tới Đâu               |
| --------------------- | ------------------------ |
| **Lần đầu chạy test** | `TEST_DATABASE_SETUP.md` |
| **Chạy test**         | `HOW_TO_RUN_TESTS.md`    |
| **Test fail**         | `DEBUGGING_GUIDE.md`     |
| **Hiểu cách chạy**    | `HOW_TO_RUN_TESTS.md`    |

---

## 📊 Các Lệnh Thường Dùng

```bash
# Chạy tất cả tests
npm test

# Chạy test file cụ thể
npm test -- auth.logic.test.js

# Chạy với coverage report
npm test -- --coverage

# Chạy watch mode (tự động khi sửa)
npm test -- --watch

# Chạy debug mode
node --inspect-brk ./node_modules/jest/bin/jest.js

# Chạy test cụ thể (by name)
npm test -- --testNamePattern="should login"
```

Xem thêm → `HOW_TO_RUN_TESTS.md`

---

## 🔍 Lộ Trình Gỡ Lỗi

```
Test fail?
  ↓
1. Xem lỗi message
  ↓
2. Kiểm tra TEST_DATABASE_SETUP (database chưa setup?)
  ↓
3. Xem DEBUGGING_GUIDE (lỗi phổ biến)
  ↓
4. Debug mode
  ↓
5. Xem code test & fundamentals/
```

Xem chi tiết → `DEBUGGING_GUIDE.md`

---

## 💡 Mẹo

✅ **Lần đầu?** → Đọc theo thứ tự: TEST_DATABASE_SETUP → HOW_TO_RUN_TESTS → DEBUGGING_GUIDE

✅ **Chạy nhanh?** → Copy lệnh từ HOW_TO_RUN_TESTS.md

✅ **Test fail?** → Chạy với `--verbose` flag để xem chi tiết

✅ **Cần debug?** → Dùng Node debugger (hướng dẫn trong DEBUGGING_GUIDE.md)

---

## 📞 Cần Giúp Đỡ?

- **Database error?** → `TEST_DATABASE_SETUP.md`
- **Lệnh test nào?** → `HOW_TO_RUN_TESTS.md`
- **Test fail, lỗi gì?** → `DEBUGGING_GUIDE.md`
- **Cần hiểu test?** → `docs/testing/fundamentals/`
- **Kế hoạch kiểm thử?** → `docs/testing/reference/TEST_PLAN.md`
