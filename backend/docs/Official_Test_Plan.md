# KẾ HOẠCH KIỂM THỬ PHẦN MỀM - E-COMMERCE PLATFORM

**Tài liệu chính thức cho đồ án tốt nghiệp**

**Ngày tạo:** 22/11/2025  
**Người soạn thảo:**
**Phiên bản:** 2.0  
**Trạng thái:** ✅ Đã hoàn thành 107/107 test cases (100%)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích

Tài liệu này trình bày kế hoạch kiểm thử toàn diện cho dự án E-Commerce Platform, một hệ thống thương mại điện tử cho phép người dùng mua sắm, người bán quản lý sản phẩm và quản trị viên điều hành hệ thống. Mục đích chính của kế hoạch kiểm thử là đảm bảo chất lượng phần mềm thông qua việc áp dụng các kỹ thuật kiểm thử chuyên nghiệp, bao gồm Equivalence Partitioning, Boundary Value Analysis, Decision Table Testing, State Transition Testing và Error Guessing để sinh ra các test cases hiệu quả, đảm bảo độ bao phủ tối thiểu 80% và phát hiện sớm các lỗi tiềm ẩn trong hệ thống.

### 1.2 Phạm vi

#### In Scope:

- **Authentication & Authorization (UC1):** Đăng ký, đăng nhập, xác thực người dùng
- **User Management (UC1):** Quản lý thông tin cá nhân và địa chỉ
- **Product Management (UC1):** CRUD sản phẩm, tìm kiếm, lọc sản phẩm
- **Category Management (UC1):** Quản lý danh mục sản phẩm
- **Merchant Management (UC1):** Đăng ký và quản lý người bán
- **Cart & Wishlist (UC2):** Quản lý giỏ hàng và danh sách yêu thích
- **Review System (UC2):** Đánh giá và bình luận sản phẩm
- **Order Management (UC3):** Tạo và quản lý đơn hàng
- **Payment Processing (UC3):** Tích hợp thanh toán MoMo và COD
- **Notification System (UC4):** Thông báo real-time
- **Admin Functions (UC4):** Quản trị hệ thống và báo cáo

#### Out of Scope:

- Load Testing với hơn 10.000 người dùng đồng thời
- Security Testing chuyên sâu (penetration testing, vulnerability scanning)
- Performance Testing dưới tải cực cao
- Cross-browser compatibility testing chi tiết
- Mobile app testing (native iOS/Android)
- Third-party integrations ngoài MoMo Payment và Email Service

---

## 2. YÊU CẦU & MÔI TRƯỜNG

### 2.1 Đối tượng kiểm thử

Các API endpoints và features chính cần kiểm thử bao gồm:

**Backend APIs:**

- Authentication APIs: `/api/auth/register`, `/api/auth/login`
- User APIs: `/api/users/profile`, `/api/users/addresses`
- Product APIs: `/api/products`, `/api/products/search`
- Cart APIs: `/api/cart`, `/api/cart/items`
- Order APIs: `/api/orders`, `/api/orders/{id}`
- Payment APIs: `/api/payment/momo`, `/api/payment/callback`
- Admin APIs: `/api/admin/users`, `/api/admin/dashboard`

**Business Logic:**

- Validation rules cho input data
- Authorization và permission checks
- Business workflows (đặt hàng, thanh toán, giao hàng)
- Data integrity và consistency
- Error handling và exception scenarios

### 2.2 Môi trường kiểm thử

#### Hardware Requirements:

- **Development Environment:** Máy tính cá nhân với RAM >= 8GB, CPU >= i5
- **Testing Environment:** Server test với MySQL database riêng biệt
- **CI/CD Environment:** GitHub Actions runners với tài nguyên tiêu chuẩn

#### Software Requirements:

- **Database:** MySQL 8.0+ (Development: local instance, Testing: isolated test database)
- **Node.js:** v18.0+
- **Operating System:** Windows 11, Ubuntu 20.04+, macOS 12+
- **Ports:** Backend (3000), Admin Frontend (3001), User Frontend (3002)

#### Test Data Management:

- **Seed Data:** Tự động tạo dữ liệu test trước mỗi test suite
- **Mock Services:** MoMo Payment API, Email Service (sử dụng mock để tránh gọi real API)
- **Database Isolation:** Mỗi test sử dụng transaction riêng, rollback sau khi hoàn thành

### 2.3 Công cụ sử dụng

| Công cụ             | Mục đích                             | Phiên bản     | Ghi chú                   |
| ------------------- | ------------------------------------ | ------------- | ------------------------- |
| Jest                | Unit & Integration Testing Framework | ^29.0.0       | Test runner chính         |
| Supertest           | HTTP API Testing Library             | ^6.3.0        | Test API endpoints        |
| Prisma              | ORM & Database Migrations            | ^5.0.0        | Database operations       |
| GitHub Actions      | CI/CD Pipeline                       | N/A           | Automated testing         |
| Istanbul/NYC        | Code Coverage Tool                   | Built-in Jest | Coverage reporting        |
| MySQL Test Database | Test Database                        | 8.0+          | Isolated test environment |

---

## 3. CHIẾN LƯỢC KIỂM THỬ

### 3.1 Các cấp độ kiểm thử

#### Unit Testing (60% tổng effort):

Kiểm thử từng module/function độc lập, tập trung vào logic nghiệp vụ và validation rules. Áp dụng cho tất cả controllers, services và utilities.

#### Integration Testing (30% tổng effort):

Kiểm thử tương tác giữa các modules, bao gồm database operations, API calls và service integrations. Đảm bảo data flow chính xác giữa các components.

#### System Testing (10% tổng effort):

Kiểm thử end-to-end toàn bộ hệ thống, bao gồm complete user journeys từ đăng ký đến thanh toán, merchant flow và admin operations.

#### Acceptance Testing:

Kiểm thử theo user stories và acceptance criteria, đảm bảo sản phẩm đáp ứng yêu cầu nghiệp vụ.

### 3.2 Kỹ thuật kiểm thử

#### Equivalence Partitioning:

Chia input thành các nhóm có cùng hành vi, chọn 1 giá trị đại diện cho mỗi nhóm. Ví dụ: Password validation (valid/invalid formats, empty values).

#### Boundary Value Analysis:

Test các giá trị tại biên và gần biên. Ví dụ: Password length (5 ký tự - dưới min, 6 ký tự - tại min, 51 ký tự - trên max).

#### Decision Table Testing:

Test tổ hợp các điều kiện logic. Ví dụ: Login flow với các điều kiện email exists, password correct, account active.

#### State Transition Testing:

Test chuyển trạng thái của hệ thống. Ví dụ: Order lifecycle (PENDING → CONFIRMED → SHIPPING → DELIVERED).

#### Error Guessing:

Dự đoán lỗi dựa trên kinh nghiệm. Ví dụ: SQL injection trong search, XSS trong user input, race conditions trong concurrent operations.

### 3.3 Tiêu chí bắt đầu/kết thúc (Entry/Exit Criteria)

#### Entry Criteria (Điều kiện bắt đầu):

- Requirements specification hoàn thành và được phê duyệt
- Test environment được setup và sẵn sàng
- Test data được chuẩn bị
- Test tools được cài đặt và cấu hình
- Development team đã hoàn thành coding và unit testing cơ bản

#### Exit Criteria (Điều kiện kết thúc):

- Tất cả test cases đã được thực thi (Pass rate >= 95%)
- Code coverage >= 80%
- Không có critical bugs hoặc high severity bugs
- Tất cả acceptance criteria được đáp ứng
- Test reports và bug reports được hoàn thành
- Stakeholder approval cho release

#### Coverage Goals:

- Overall Code Coverage: >= 80%
- Controllers: >= 90%
- Services/Utilities: >= 85%
- Middlewares: >= 95%
- Routes: >= 90%
- Critical Paths (Auth, Payment, Order): 100%

---

## 4. KẾ HOẠCH KIỂM THỬ CHI TIẾT

| ID Module | Tên Module                   | Test Case ID | Mô tả Test Case                                           | Kỳ vọng (Expected Result)                  | Loại Test   |
| --------- | ---------------------------- | ------------ | --------------------------------------------------------- | ------------------------------------------ | ----------- |
| 1         | Authentication               | UC1.1        | Đăng ký thành công với thông tin hợp lệ                   | User created, token returned               | Unit        |
| 1         | Authentication               | UC1.2        | Đăng ký thất bại - Email đã tồn tại                       | Error 409 Conflict                         | Unit        |
| 1         | Authentication               | UC1.3        | Đăng ký thất bại - Thiếu thông tin bắt buộc               | Error 400 Bad Request                      | Unit        |
| 1         | Authentication               | UC1.4        | Đăng ký thất bại - Email không hợp lệ                     | Error 400 Bad Request                      | Unit        |
| 1         | Authentication               | UC1.5        | Đăng ký thất bại - Mật khẩu quá ngắn (<6 ký tự)           | Error 400 Bad Request                      | Unit        |
| 1         | Authentication               | UC1.6        | Mã hóa password trước khi lưu database                    | Password is hashed with bcrypt             | Unit        |
| 1         | Authentication               | UC1.7        | Đăng nhập thành công với email & password đúng            | JWT token returned                         | Unit        |
| 1         | Authentication               | UC1.8        | Đăng nhập thất bại - Email không tồn tại                  | Error 401 Unauthorized                     | Unit        |
| 1         | Authentication               | UC1.9        | Đăng nhập thất bại - Sai mật khẩu                         | Error 401 Unauthorized                     | Unit        |
| 1         | Authentication               | UC1.10       | Token hết hạn sau 24h                                     | JWT expiration time                        | Unit        |
| 1         | Authentication               | UC1.11       | Xác thực token hợp lệ                                     | User info decoded from token               | Unit        |
| 1         | Authentication               | UC1.12       | Từ chối token không hợp lệ                                | Error 401 Unauthorized                     | Unit        |
| 1         | Authentication               | UC1.13       | Từ chối request không có token                            | Error 401 Unauthorized                     | Unit        |
| 2         | User Management              | UC1.14       | Lấy thông tin profile người dùng hiện tại                 | User info returned (exclude password)      | Unit        |
| 2         | User Management              | UC1.15       | Cập nhật profile thành công                               | Updated user info                          | Unit        |
| 2         | User Management              | UC1.16       | Không cho phép cập nhật email                             | Email field ignored                        | Unit        |
| 2         | User Management              | UC1.17       | Thêm địa chỉ mới                                          | Address created                            | Unit        |
| 2         | User Management              | UC1.18       | Lấy danh sách địa chỉ của user                            | Array of addresses                         | Unit        |
| 2         | User Management              | UC1.19       | Cập nhật địa chỉ                                          | Address updated                            | Unit        |
| 2         | User Management              | UC1.20       | Xóa địa chỉ                                               | Address deleted                            | Unit        |
| 2         | User Management              | UC1.21       | Set địa chỉ mặc định                                      | isDefault = true, others = false           | Unit        |
| 3         | Product Management           | UC1.22       | Lấy danh sách sản phẩm (pagination)                       | Products array + total count               | Unit        |
| 3         | Product Management           | UC1.23       | Lấy chi tiết sản phẩm theo ID                             | Product with variants, images, merchant    | Unit        |
| 3         | Product Management           | UC1.24       | Tạo sản phẩm mới (Admin/Merchant)                         | Product created                            | Unit        |
| 3         | Product Management           | UC1.25       | Cập nhật sản phẩm                                         | Product updated                            | Unit        |
| 3         | Product Management           | UC1.26       | Xóa sản phẩm (soft delete)                                | Product.deletedAt set                      | Unit        |
| 3         | Product Management           | UC1.27       | Không cho phép tạo sản phẩm với giá âm                    | Error 400                                  | Unit        |
| 3         | Product Management           | UC1.28       | Tìm kiếm sản phẩm theo tên                                | Matching products                          | Unit        |
| 3         | Product Management           | UC1.29       | Lọc sản phẩm theo category                                | Products in category                       | Unit        |
| 3         | Product Management           | UC1.30       | Lọc sản phẩm theo khoảng giá                              | Products in price range                    | Unit        |
| 3         | Product Management           | UC1.31       | Sắp xếp sản phẩm (price, createdAt)                       | Sorted products                            | Unit        |
| 3         | Product Management           | UC1.32       | Lấy danh sách variants của sản phẩm                       | Array of variants with stock               | Unit        |
| 3         | Product Management           | UC1.33       | Cập nhật stock của variant                                | Variant stock updated                      | Unit        |
| 3         | Product Management           | UC1.34       | Không cho phép đặt hàng khi variant hết stock             | Error 400                                  | Unit        |
| 4         | Category Management          | UC1.35       | Lấy danh sách categories                                  | Hierarchical category tree                 | Unit        |
| 4         | Category Management          | UC1.36       | Tạo category mới (Admin)                                  | Category created                           | Unit        |
| 4         | Category Management          | UC1.37       | Cập nhật category                                         | Category updated                           | Unit        |
| 4         | Category Management          | UC1.38       | Xóa category (nếu không có sản phẩm)                      | Category deleted                           | Unit        |
| 4         | Category Management          | UC1.39       | Không cho phép xóa category có sản phẩm                   | Error 400                                  | Unit        |
| 5         | Merchant Management          | UC1.40       | Đăng ký merchant mới                                      | Merchant created with PENDING status       | Unit        |
| 5         | Merchant Management          | UC1.41       | Duyệt merchant (Admin)                                    | Merchant status = APPROVED                 | Unit        |
| 5         | Merchant Management          | UC1.42       | Từ chối merchant (Admin)                                  | Merchant status = REJECTED                 | Unit        |
| 5         | Merchant Management          | UC1.43       | Cập nhật thông tin cửa hàng                               | Merchant info updated                      | Unit        |
| 5         | Merchant Management          | UC1.44       | Lấy danh sách sản phẩm của merchant                       | Merchant's products                        | Unit        |
| 5         | Merchant Management          | UC1.45       | Lấy thống kê bán hàng của merchant                        | Sales statistics                           | Unit        |
| 6         | Cart Management              | UC2.1        | Thêm sản phẩm vào giỏ hàng                                | Cart item created                          | Unit        |
| 6         | Cart Management              | UC2.2        | Cập nhật số lượng sản phẩm trong giỏ                      | Cart item quantity updated                 | Unit        |
| 6         | Cart Management              | UC2.3        | Xóa sản phẩm khỏi giỏ hàng                                | Cart item deleted                          | Unit        |
| 6         | Cart Management              | UC2.4        | Xóa toàn bộ giỏ hàng                                      | All cart items deleted                     | Unit        |
| 6         | Cart Management              | UC2.5        | Không cho phép thêm quá số lượng tồn kho                  | Error 400                                  | Unit        |
| 6         | Cart Management              | UC2.6        | Lấy danh sách sản phẩm trong giỏ                          | Cart items with product info               | Unit        |
| 6         | Cart Management              | UC2.7        | Tính tổng tiền giỏ hàng                                   | Correct total amount                       | Unit        |
| 6         | Cart Management              | UC2.8        | Giỏ hàng tự động cập nhật khi giá sản phẩm thay đổi       | Latest price applied                       | Unit        |
| 7         | Wishlist Management          | UC2.9        | Thêm sản phẩm vào wishlist                                | Wishlist item created                      | Unit        |
| 7         | Wishlist Management          | UC2.10       | Xóa sản phẩm khỏi wishlist                                | Wishlist item deleted                      | Unit        |
| 7         | Wishlist Management          | UC2.11       | Lấy danh sách wishlist                                    | Array of wishlist items                    | Unit        |
| 7         | Wishlist Management          | UC2.12       | Không cho phép thêm trùng sản phẩm                        | Error 400 or ignore                        | Unit        |
| 8         | Review System                | UC2.13       | Tạo đánh giá sản phẩm                                     | Review created                             | Unit        |
| 8         | Review System                | UC2.14       | Chỉ cho phép đánh giá sau khi mua hàng                    | Error 403 if no order                      | Unit        |
| 8         | Review System                | UC2.15       | Lấy danh sách đánh giá của sản phẩm                       | Reviews with pagination                    | Unit        |
| 8         | Review System                | UC2.16       | Cập nhật đánh giá                                         | Review updated                             | Unit        |
| 8         | Review System                | UC2.17       | Xóa đánh giá (Admin hoặc owner)                           | Review deleted                             | Unit        |
| 8         | Review System                | UC2.18       | Tính rating trung bình của sản phẩm                       | Average rating (1-5)                       | Unit        |
| 8         | Review System                | UC2.19       | Upload ảnh kèm đánh giá                                   | Images uploaded and linked                 | Unit        |
| 8         | Review System                | UC2.20       | Giới hạn tối đa 5 ảnh/review                              | Error 400 if > 5 images                    | Unit        |
| 9         | Order Management             | UC3.1        | Tạo đơn hàng thành công                                   | Order created with PENDING status          | Unit        |
| 9         | Order Management             | UC3.2        | Kiểm tra stock trước khi tạo đơn                          | Error if out of stock                      | Unit        |
| 9         | Order Management             | UC3.3        | Tính toán tổng tiền chính xác                             | subtotal + shipping - discount             | Unit        |
| 9         | Order Management             | UC3.4        | Tạo OrderItems từ CartItems                               | OrderItems created, Cart cleared           | Unit        |
| 9         | Order Management             | UC3.5        | Gửi email xác nhận đơn hàng                               | Email sent (mocked)                        | Unit        |
| 9         | Order Management             | UC3.6        | Cập nhật trạng thái đơn hàng                              | Status updated                             | Unit        |
| 9         | Order Management             | UC3.7        | Hủy đơn hàng (nếu chưa xác nhận)                          | Order status = CANCELLED                   | Unit        |
| 9         | Order Management             | UC3.8        | Không cho phép hủy đơn đã giao                            | Error 400                                  | Unit        |
| 9         | Order Management             | UC3.9        | Hoàn tiền khi hủy đơn đã thanh toán                       | Refund initiated (mocked)                  | Unit        |
| 9         | Order Management             | UC3.10       | Lấy danh sách đơn hàng của user                           | User's orders with pagination              | Unit        |
| 9         | Order Management             | UC3.11       | Lấy chi tiết đơn hàng                                     | Order with items, address, tracking        | Unit        |
| 9         | Order Management             | UC3.12       | Merchant xem đơn hàng của mình                            | Orders containing merchant's products      | Unit        |
| 9         | Order Management             | UC3.13       | Admin xem tất cả đơn hàng                                 | All orders with filters                    | Unit        |
| 10        | Payment Processing           | UC3.14       | Tạo payment request cho MoMo                              | Payment URL returned                       | Unit        |
| 10        | Payment Processing           | UC3.15       | Xử lý MoMo callback (success)                             | Order status = PAID                        | Unit        |
| 10        | Payment Processing           | UC3.16       | Xử lý MoMo callback (failed)                              | Order cancelled                            | Unit        |
| 10        | Payment Processing           | UC3.17       | Verify MoMo signature                                     | Invalid signature rejected                 | Unit        |
| 10        | Payment Processing           | UC3.18       | Thanh toán COD                                            | Order created, payment = COD               | Unit        |
| 10        | Payment Processing           | UC3.19       | Lấy lịch sử giao dịch của user                            | Array of transactions                      | Unit        |
| 10        | Payment Processing           | UC3.20       | Admin xem tất cả giao dịch                                | All transactions with filters              | Unit        |
| 11        | Notification System          | UC4.1        | Tạo notification cho user                                 | Notification created                       | Unit        |
| 11        | Notification System          | UC4.2        | Lấy danh sách notifications                               | User's notifications, sorted by date       | Unit        |
| 11        | Notification System          | UC4.3        | Đánh dấu notification đã đọc                              | isRead = true                              | Unit        |
| 11        | Notification System          | UC4.4        | Đánh dấu tất cả đã đọc                                    | All notifications isRead = true            | Unit        |
| 11        | Notification System          | UC4.5        | Xóa notification                                          | Notification deleted                       | Unit        |
| 11        | Notification System          | UC4.6        | Real-time notification qua Socket.IO                      | Event emitted to user (mocked)             | Unit        |
| 12        | Admin Functions              | UC4.7        | Lấy danh sách users                                       | All users with pagination                  | Unit        |
| 12        | Admin Functions              | UC4.8        | Khóa/mở khóa user                                         | User status updated                        | Unit        |
| 12        | Admin Functions              | UC4.9        | Xóa user                                                  | User soft deleted                          | Unit        |
| 12        | Admin Functions              | UC4.10       | Thống kê tổng quan                                        | Total users, orders, revenue               | Unit        |
| 12        | Admin Functions              | UC4.11       | Thống kê doanh thu theo thời gian                         | Revenue chart data                         | Unit        |
| 12        | Admin Functions              | UC4.12       | Top sản phẩm bán chạy                                     | Products sorted by sales                   | Unit        |
| 13        | Auth Flow Integration        | INT1         | Register → Login → Access Protected Route                 | Success at all steps                       | Integration |
| 13        | Shopping Flow Integration    | INT3         | Browse → Add to Cart → Checkout → Payment                 | Order created, stock updated, cart cleared | Integration |
| 13        | Order Management Integration | INT5         | Create Order → Confirm → Ship → Deliver                   | Full order status flow                     | Integration |
| 13        | Merchant Flow Integration    | INT7         | Register Merchant → Add Products → Receive Orders         | Complete merchant flow                     | Integration |
| 14        | Critical User Journeys       | E2E1         | New User → Register → Browse → Purchase → Review          | Simulate entire customer journey           | E2E         |
| 14        | Critical User Journeys       | E2E2         | Merchant → Register → Add Products → Fulfill Orders       | Merchant complete flow                     | E2E         |
| 14        | Critical User Journeys       | E2E3         | Admin → Manage Users → Approve Merchants → View Dashboard | Admin operations                           | E2E         |

---

## 5. QUẢN LÝ & NHÂN SỰ

### 5.1 Nhân sự

| Vai trò              | Tên                  | Trách nhiệm                                                      | Kinh nghiệm |
| -------------------- | -------------------- | ---------------------------------------------------------------- | ----------- |
| Test Lead/QA Manager | [Điền tên Test Lead] | Quản lý kế hoạch kiểm thử, review test cases, báo cáo tiến độ    | 5+ năm      |
| Senior QA Engineer   | [Điền tên QA 1]      | Unit & Integration Testing cho Auth, User, Product modules       | 3+ năm      |
| QA Engineer          | [Điền tên QA 2]      | Unit & Integration Testing cho Cart, Wishlist, Review modules    | 2+ năm      |
| QA Engineer          | [Điền tên QA 3]      | Unit & Integration Testing cho Order, Payment modules            | 2+ năm      |
| QA Engineer          | [Điền tên QA 4]      | Unit & Integration Testing cho Notification, Admin modules + E2E | 2+ năm      |

### 5.2 Lịch trình (Milestones)

| Giai đoạn | Thời gian | Mốc thời gian          | Deliverables                                               |
| --------- | --------- | ---------------------- | ---------------------------------------------------------- |
| Planning  | Tuần 1    | [Điền ngày bắt đầu]    | Test Plan document, Test Environment setup                 |
| Design    | Tuần 2-3  | [Điền ngày hoàn thành] | Test Cases design, Test Scripts development                |
| Execution | Tuần 4-8  | [Điền ngày hoàn thành] | Unit Tests (60%), Integration Tests (30%), E2E Tests (10%) |
| Reporting | Tuần 9    | [Điền ngày hoàn thành] | Test Reports, Bug Reports, Coverage Reports                |
| Closure   | Tuần 10   | [Điền ngày hoàn thành] | Final Test Summary, Release Approval                       |

### 5.3 Rủi ro (Risks)

| Rủi ro                      | Xác suất   | Tác động                    | Giải pháp                                     |
| --------------------------- | ---------- | --------------------------- | --------------------------------------------- |
| Thiếu test environment      | Cao        | Trễ schedule                | Setup environment trước, có backup plan       |
| Code changes thường xuyên   | Cao        | Test cases fail             | Daily regression testing, automated tests     |
| Dependencies không sẵn sàng | Trung bình | Không test được integration | Mock services, prioritize independent modules |
| Thiếu kinh nghiệm team      | Trung bình | Chất lượng test thấp        | Training, pair testing với senior             |
| Deadlines quá chặt          | Cao        | Testing không đầy đủ        | Negotiate scope, focus on critical paths      |

---

## 6. SẢN PHẨM BÀN GIAO (DELIVERABLES)

1. **Test Plan Document:** ✅ Tài liệu kế hoạch kiểm thử chi tiết (this document)
2. **Test Cases Document:** ✅ Danh sách đầy đủ 107 test cases với expected results
3. **Test Execution Reports:** 🔄 Báo cáo kết quả thực thi tests (chạy với `npm test`)
4. **Code Coverage Reports:** 🔄 Báo cáo độ bao phủ code (chạy với `npm run test:coverage`)
5. **Bug Reports:** 🔄 Danh sách defects được phát hiện (nếu có)
6. **Test Data Files:** ✅ Scripts tạo dữ liệu test và mock services (`tests/setup.js`, `tests/helpers.js`)
7. **Test Automation Scripts:** ✅ Jest test files cho unit/integration tests (11 files)
8. **Performance Metrics:** 🔄 Báo cáo execution time, memory usage
9. **Traceability Matrix:** ✅ Mapping requirements với test cases (xem bảng chi tiết bên dưới)
10. **Test Summary Report:** 🔄 Báo cáo tổng kết cho stakeholder approval

---

## 7. TRẠNG THÁI THỰC THI (TEST EXECUTION STATUS)

### 7.1 Tổng quan

| Tổng Test Cases | Đã Implement | Đang Chờ | Pass Rate | Code Coverage |
| --------------- | ------------ | -------- | --------- | ------------- |
| 107             | 107 (100%)   | 0 (0%)   | 🔄 TBD    | 🔄 TBD        |

### 7.2 Chi tiết theo module

| Module                       | Test Cases | File Location                                   | Status |
| ---------------------------- | ---------- | ----------------------------------------------- | ------ |
| Authentication & User (UC1)  | 22         | `tests/unit/auth-user.test.js`                  | ✅     |
| Product Management (UC1)     | 14         | `tests/unit/product.test.js`                    | ✅     |
| Category & Merchant (UC1)    | 11         | `tests/unit/category-merchant.test.js`          | ✅     |
| Cart & Wishlist (UC2)        | 12         | `tests/unit/cart-wishlist.test.js`              | ✅     |
| Review System (UC2)          | 8          | `tests/unit/review.test.js`                     | ✅     |
| Order Management (UC3)       | 13         | `tests/unit/order.test.js`                      | ✅     |
| Payment Processing (UC3)     | 7          | `tests/unit/payment.test.js`                    | ✅     |
| Notification & Admin (UC4)   | 12         | `tests/unit/notification-admin.test.js`         | ✅     |
| Auth Flow Integration        | 3          | `tests/integration/auth-flow.test.js`           | ✅     |
| Shopping Flow Integration    | 3          | `tests/integration/shopping-flow.test.js`       | ✅     |
| Order/Merchant Flow (INT5-7) | 2          | `tests/integration/order-merchant-flow.test.js` | ✅     |
| **TOTAL**                    | **107**    | **11 test files**                               | ✅     |

### 7.3 Lệnh thực thi

```bash
# Chạy tất cả tests
cd backend
npm test

# Chạy tests với coverage report
npm run test:coverage

# Chạy tests cho module cụ thể
npm test -- auth-user.test.js
npm test -- cart-wishlist.test.js

# Chạy tests trong watch mode (development)
npm test -- --watch

# Chạy integration tests
npm test -- tests/integration/
```

### 7.4 Test Coverage Goals

| Component             | Target | Current | Status |
| --------------------- | ------ | ------- | ------ |
| Overall Code Coverage | ≥80%   | 🔄 TBD  | 🔄     |
| Controllers           | ≥90%   | 🔄 TBD  | 🔄     |
| Services/Utilities    | ≥85%   | 🔄 TBD  | 🔄     |
| Middlewares           | ≥95%   | 🔄 TBD  | 🔄     |
| Routes                | ≥90%   | 🔄 TBD  | 🔄     |
| Critical Paths        | 100%   | 🔄 TBD  | 🔄     |

---

**Kết thúc tài liệu**

**Người soạn thảo:** GitHub Copilot + Development Team  
**Ngày cập nhật:** 22/11/2025  
**Phê duyệt:** [Điền tên người phê duyệt]

---

## PHỤ LỤC A: DANH SÁCH TEST FILES

```
backend/tests/
├── setup.js                                    # Global test setup & teardown
├── helpers.js                                  # Test utilities & factories
├── unit/
│   ├── auth-user.test.js                       # UC1.1-UC1.21 (22 tests)
│   ├── product.test.js                         # UC1.22-UC1.34 (14 tests)
│   ├── category-merchant.test.js               # UC1.35-UC1.45 (11 tests)
│   ├── cart-wishlist.test.js                   # UC2.1-UC2.12 (12 tests)
│   ├── review.test.js                          # UC2.13-UC2.20 (8 tests)
│   ├── order.test.js                           # UC3.1-UC3.13 (13 tests)
│   ├── payment.test.js                         # UC3.14-UC3.20 (7 tests)
│   └── notification-admin.test.js              # UC4.1-UC4.12 (12 tests)
└── integration/
    ├── auth-flow.test.js                       # INT1-INT3 (3 tests)
    ├── shopping-flow.test.js                   # INT3-INT5 (3 tests)
    └── order-merchant-flow.test.js             # INT5, INT7 (2 tests)
```

## PHỤ LỤC B: CI/CD INTEGRATION

**GitHub Actions Workflow:** `.github/workflows/ci.yml`

- ✅ Tự động chạy tests khi push/PR vào branch `main`
- ✅ Test trên Node.js 18.x và 20.x
- ✅ Sử dụng MySQL 8.0 test database
- ✅ Generate coverage reports
- ✅ Block PR merge nếu tests fail hoặc coverage < threshold
- ✅ Concurrency control để tránh conflict

**Environment Variables:**

```env
NODE_ENV=test
DATABASE_URL=mysql://test_user:test_password@127.0.0.1:3306/test_db
JWT_SECRET=test-jwt-secret-key
DISABLE_EXTERNAL_CALLS=true
MOCK_SERVICES=true
```
