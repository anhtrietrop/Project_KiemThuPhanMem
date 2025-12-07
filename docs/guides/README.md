# 📍 HƯỚNG DẪN - Các Tác Vụ Thường Gặp

**Thư mục:** `docs/guides/`

---

## 🎯 Mục Đích

Phần này chứa **hướng dẫn thực tế** cho các tác vụ hàng ngày:

- 🌳 Git workflow & branching
- 💰 Tích hợp thanh toán MoMo
- 🗄️ Đồng bộ cơ sở dữ liệu
- 🛠️ Các tập lệnh tiện ích

---

## 📚 Các Tệp Trong Thư Mục Này

| Tệp                         | Mô Tả                                 | Khi Nào                     |
| --------------------------- | ------------------------------------- | --------------------------- |
| `GIT_WORKFLOW_GUIDE.md`     | Chiến lược nhánh, quy trình PR, merge | Trước khi code              |
| `MOMO_INTEGRATION_GUIDE.md` | Cài đặt & test thanh toán MoMo        | Làm tính năng thanh toán    |
| `DATABASE_SYNC_GUIDE.md`    | Đồng bộ DB giữa các môi trường        | Làm việc với nhiều DB       |
| `SCRIPTS_GUIDE.md`          | Các tập lệnh tiện ích sẵn có          | Khi cần chạy helper scripts |

---

## 🔗 Liên Kết Nhanh

| Tác Vụ             | Hướng Dẫn                   |
| ------------------ | --------------------------- |
| **Bắt đầu coding** | `GIT_WORKFLOW_GUIDE.md`     |
| **Làm thanh toán** | `MOMO_INTEGRATION_GUIDE.md` |
| **Sync database**  | `DATABASE_SYNC_GUIDE.md`    |
| **Chạy scripts**   | `SCRIPTS_GUIDE.md`          |

---

## 📋 Lộ Trình Theo Vai Trò

### **👨‍💻 Developer**

```
1. GIT_WORKFLOW_GUIDE.md (trước khi code)
2. SCRIPTS_GUIDE.md (chạy helper scripts)
3. MOMO_INTEGRATION_GUIDE.md (nếu làm payment)
4. DATABASE_SYNC_GUIDE.md (nếu sửa DB)
```

### **💰 Người Làm Feature Thanh Toán**

```
1. MOMO_INTEGRATION_GUIDE.md (cài đặt)
2. DATABASE_SYNC_GUIDE.md (quản lý test data)
3. GIT_WORKFLOW_GUIDE.md (commit & push)
```

### **🗄️ Người Quản Lý Database**

```
1. DATABASE_SYNC_GUIDE.md (đồng bộ)
2. GIT_WORKFLOW_GUIDE.md (commit migrations)
```

---

## 🔍 Lộ Trình Hàng Ngày

### **Sáng: Bắt Đầu Công Việc**

```
1. Kiểm tra GIT_WORKFLOW_GUIDE.md
   - Branch nào để code?
   - Tạo feature branch

2. Chạy SCRIPTS_GUIDE.md
   - npm install (nếu cần)
   - docker compose up
```

### **Trong Ngày: Code & Commit**

```
1. Làm theo GIT_WORKFLOW_GUIDE.md
   - Commit messages
   - Push to feature branch

2. Nếu cần database
   - DATABASE_SYNC_GUIDE.md

3. Nếu làm thanh toán
   - MOMO_INTEGRATION_GUIDE.md
```

### **Tối: Tạo PR & Merge**

```
1. GIT_WORKFLOW_GUIDE.md
   - Tạo Pull Request
   - Merge to main
```

---

## 💡 Mẹo

✅ **Lần đầu?** → Đọc GIT_WORKFLOW_GUIDE.md trước coding

✅ **Cần script gì?** → Xem SCRIPTS_GUIDE.md

✅ **Database issue?** → DATABASE_SYNC_GUIDE.md

✅ **Thanh toán?** → MOMO_INTEGRATION_GUIDE.md

---

## 📞 Cần Giúp Đỡ?

- **Cách code?** → `GIT_WORKFLOW_GUIDE.md`
- **Cần scripts?** → `SCRIPTS_GUIDE.md`
- **Thanh toán MoMo?** → `MOMO_INTEGRATION_GUIDE.md`
- **Database sync?** → `DATABASE_SYNC_GUIDE.md`
