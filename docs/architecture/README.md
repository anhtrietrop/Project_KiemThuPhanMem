# 📍 KIẾN TRÚC - Thiết Kế & Mô Hình Hệ Thống

**Thư mục:** `docs/architecture/`

---

## 🎯 Mục Đích

Phần này giúp bạn **hiểu cấu trúc hệ thống, các use cases, chiến lược đồng bộ dữ liệu**.

Dành cho những ai cần hiểu "**Hệ thống này được xây dựng như thế nào?**"

---

## 📚 Các Tệp Trong Thư Mục Này

| Tệp                         | Mô Tả                                                     | Đọc Bao Lâu | Khi Nào                              |
| --------------------------- | --------------------------------------------------------- | ----------- | ------------------------------------ |
| `UC_ANALYSIS.md`            | 4 Use Cases (UC1-UC4): Tính năng, các bước, bảng kiểm tra | 25 phút     | Trước khi code tính năng mới         |
| `DATABASE_SYNC_STRATEGY.md` | Chiến lược đồng bộ cơ sở dữ liệu giữa các môi trường      | 15 phút     | Khi làm việc với nhiều cơ sở dữ liệu |
| `SYSTEM_ARCHITECTURE.md`    | Sơ đồ kiến trúc: Frontend → Backend → Database            | 10 phút     | Hiểu tổng quan hệ thống              |

---

## 🔗 Mối Liên Kết Với Các Phần Khác

- **Từ Getting Started?** ← Đọc phần này sau IMPLEMENTATION_PLAN.md
- **Đi tới Testing?** → `docs/testing/README.md` (để kiểm thử từng UC)
- **Đi tới Deployment?** → `docs/deployment/README.md` (để deploy hệ thống)

---

## 📋 Lộ Trình Đọc Theo Vai Trò

### **👨‍💻 Lập Trình Viên**

```
1. UC_ANALYSIS.md (biết tính năng nào cần xây dựng)
2. SYSTEM_ARCHITECTURE.md (hiểu codebase)
3. DATABASE_SYNC_STRATEGY.md (nếu sửa đổi DB)
```

### **🧪 Người Kiểm Thử**

```
1. UC_ANALYSIS.md (biết cần kiểm thử gì)
2. SYSTEM_ARCHITECTURE.md (hiểu quy trình)
3. DATABASE_SYNC_STRATEGY.md (hiểu test data)
```

### **👔 Quản Lý Dự Án**

```
1. UC_ANALYSIS.md (biết dự án có những tính năng gì)
2. SYSTEM_ARCHITECTURE.md (báo cáo về kiến trúc)
```

---

## 🎨 Sơ Đồ Chính Trong Thư Mục

- **Sơ đồ Use Case** (UC1-UC4)
- **Sơ đồ Kiến Trúc Hệ Thống** (3 tầng)
- **Sơ đồ Luồng Dữ Liệu**
- **Sơ đồ Đồng Bộ Cơ Sở Dữ Liệu**

---

## 💡 Mẹo Sử Dụng

- Đọc **UC_ANALYSIS.md** khi bắt đầu tính năng mới
- Xem **SYSTEM_ARCHITECTURE.md** khi cần hiểu "code nằm ở đâu?"
- Tham khảo **DATABASE_SYNC_STRATEGY.md** khi làm việc với migration
