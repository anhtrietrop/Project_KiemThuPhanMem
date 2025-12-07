# QA_PLAYBOOK - Code Examples, Troubleshooting, Performance

**Mục tiêu:** Gom nhanh các mẫu code, checklist khắc phục sự cố, và hướng dẫn test hiệu năng cho toàn bộ modules (Users/Auth, Products, Orders, Cart/Payment, Wishlist/Reviews, Admin Analytics, Notifications).

---

## 1) Code Examples Nhanh

### Products

- Controller mẫu: `docs/testing/fundamentals/02_PRODUCTS_MODULE.md` (phần 6.1) — pagination, search/filter/sort, soft-delete.
- Jest integration: phần 6.2 — GET/POST/PUT/DELETE products, price filter assertions.

### Orders + Payment

- Service mẫu: `03_ORDERS_MODULE.md` phần 6.1 — transaction create order + reduce stock + payment record.
- Webhook MoMo: `03_ORDERS_MODULE.md` phần 6.1/5.4 — callback cập nhật paymentStatus.
- Jest: `03_ORDERS_MODULE.md` phần 6.2 — confirm order, MoMo callback.

### Cart + Payment

- Cart controller: `04_CART_PAYMENT_MODULES.md` phần 7.1 — add/update/remove with stock check.
- Payment service: `04_CART_PAYMENT_MODULES.md` phần 7.2 — MoMo signature/URL generation + verify callback.

### Wishlist + Reviews

- Wishlist controller: `05_WISHLIST_REVIEWS_MODULE.md` phần 7.1 — upsert wishlist, dedupe.
- Review controller: phần 7.2 — purchase check, unique review per user/product.

### Admin Analytics

- Query builder: `06_ADMIN_ANALYTICS_MODULE.md` phần 6.1 — groupBy, merchant scope filters.
- Jest perf check: phần 6.3 — timing assertion <400ms.

### Notifications

- Worker: `07_NOTIFICATION_MODULE.md` phần 6.1 — queue consume, idempotency log.
- Jest with provider mock: phần 6.2 — ensure send called, idempotency by requestId.

---

## 2) Troubleshooting Cheat Sheet

| Module        | Triệu chứng                  | Nguyên nhân thường gặp                   | Cách xử lý nhanh                                        |
| ------------- | ---------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Products      | Lọc giá trả rỗng             | minPrice > maxPrice hoặc parseFloat fail | Swap min/max hoặc validate 400                          |
| Products      | Deleted product vẫn hiển thị | Chưa filter deletedAt                    | Thêm `where: { deletedAt: null }`                       |
| Orders        | Confirm không được           | Sai role/merchant scope                  | Kiểm tra token + merchantId filter                      |
| Orders        | Payment MoMo 400             | Sai signature/requestId                  | Log raw payload, so khớp signature HMAC                 |
| Cart          | Stock không trừ              | Transaction không quấn reduce stock      | Dùng prisma transaction bao add order + decrement stock |
| Cart          | Discount không áp            | Code hết hạn/maxUses                     | Validate expiry, maxUses trước apply                    |
| Wishlist      | Trùng sản phẩm               | Thiếu UNIQUE(userId, productId)          | Thêm constraint + check exists trước insert             |
| Reviews       | Review không cho tạo         | Chưa mua sản phẩm                        | Seed orderItem cho user trước khi test                  |
| Analytics     | Số liệu lệch                 | Thiếu merchant filter hoặc timezone      | Bổ sung merchantId vào where; chuẩn hoá UTC             |
| Notifications | Gửi trùng                    | Thiếu requestId/idempotency              | Lưu log với unique requestId, skip nếu đã tồn tại       |
| Notifications | OTP không hết hạn            | Cache không TTL                          | Dùng Redis TTL, xoá sau verify                          |

---

## 3) Performance Testing Quickstart

### Mục tiêu gợi ý

- Products list: <200ms (page 1, limit 20) với 10k sản phẩm, index name/price/createdAt.
- Orders analytics: <400ms với 10k-50k orders, index createdAt, status, merchantId.
- Notifications queue: latency <1s/job, retry backoff không vượt 3 lần.

### Dữ liệu seed

- Products: 10k rows, nhiều category, giá và createdAt phân bố đều.
- Orders: 10k+ với đủ status, payment methods, refunds.
- Cart: nhiều cart đồng thời, variant stock đủ lớn.

### Kịch bản k6 mẫu

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "1m",
  thresholds: {
    http_req_duration: ["p(95)<400"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE = "http://localhost:3000";

export default function () {
  const res = http.get(
    `${BASE}/api/products?page=1&limit=20&sortBy=price&order=asc`
  );
  check(res, {
    "status 200": (r) => r.status === 200,
    "p95<400ms": () => res.timings.duration < 400,
  });
  sleep(1);
}
```

### Jest timing assertion (nhẹ)

```javascript
const start = Date.now();
const res = await request(app)
  .get("/api/admin/analytics/revenue")
  .set("Authorization", `Bearer ${adminToken}`);
const duration = Date.now() - start;
expect(duration).toBeLessThan(400);
```

### Tips tối ưu

- Thêm index: `(createdAt)`, `(merchantId, createdAt)`, `(status)`, `(price)`, `(name text index)`.
- Dùng `select`/`include` tối thiểu, tránh N+1.
- Dùng aggregate thay vì load toàn bộ.
- Cache tạm thời (Redis) cho dashboard đọc nhiều.

---

**Phiên Bản:** 1.0  
**Cập Nhật:** 7/12/2025  
**Trạng Thái:** ✅ Ready for use
