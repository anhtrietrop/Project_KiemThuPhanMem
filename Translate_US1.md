# Kế hoạch Việt hóa giao diện Admin và User - US1

## Thông tin thu thập được

Sau khi phân tích toàn bộ dự án, tôi đã xác định được các file và component cần dịch từ tiếng Anh sang tiếng Việt. Dự án bao gồm:

### Frontend Admin:
- **Components chính**: DashboardSidebar, SectionTitle, Heading, CustomButton
- **Pages**: Admin dashboard, Categories management, Products management
- **Văn bản cần dịch**: Sidebar menu, page titles, button texts, table headers, error messages

### Frontend User:
- **Components chính**: Hero, IntroducingSection, CategoryMenu, Header, Footer, SearchInput, Filters, SortBy, Pagination, ProductItem, WishlistModule, Newsletter, Breadcrumb, SectionTitle, Heading, CustomButton
- **Pages**: Home, Shop, Search, Login, Register, Wishlist
- **Văn bản cần dịch**: Navigation, product info, form labels, buttons, error messages, category names, incentives, footer links

### Các chuỗi văn bản chính cần dịch:
1. **Navigation & Menu**: Dashboard, Products, Categories, Login, Register, Logout, etc.
2. **Form Labels**: Email, Password, Name, Lastname, etc.
3. **Buttons**: Sign in, Sign up, Add new, Search, View product, etc.
4. **Messages**: Error messages, success messages, validation messages
5. **Product Info**: Category names, stock status, ratings, etc.
6. **Page Titles**: All products, Search Page, Wishlist, etc.

## Kế hoạch thực hiện

### Phase 1: Tạo hệ thống i18n cơ bản
- Tạo file translations cho tiếng Việt
- Thiết lập context cho đa ngôn ngữ
- Cập nhật các component để sử dụng translations

### Phase 2: Việt hóa Frontend Admin
- Dashboard sidebar và menu
- Page titles và headers
- Form labels và buttons
- Table headers và messages
- Error/success messages

### Phase 3: Việt hóa Frontend User
- Hero section và introducing text
- Navigation và header
- Category menu và product info
- Forms (login, register, search)
- Filters, sorting, pagination
- Wishlist và product details
- Footer và newsletter

### Phase 4: Testing và refinement
- Kiểm tra tất cả text đã được dịch
- Đảm bảo responsive design
- Test functionality sau khi dịch

## Các file sẽ được chỉnh sửa

### Frontend Admin:
- `frontend-admin/components/DashboardSidebar.tsx`
- `frontend-admin/components/SectionTitle.tsx`
- `frontend-admin/components/Heading.tsx`
- `frontend-admin/components/CustomButton.tsx`
- `frontend-admin/app/(dashboard)/admin/page.tsx`
- `frontend-admin/app/(dashboard)/admin/categories/page.tsx`
- `frontend-admin/app/(dashboard)/admin/products/page.tsx`

### Frontend User:
- `frontend-user/components/Hero.tsx`
- `frontend-user/components/IntroducingSection.tsx`
- `frontend-user/components/CategoryMenu.tsx`
- `frontend-user/components/Header.tsx`
- `frontend-user/components/HeaderTop.tsx`
- `frontend-user/components/SearchInput.tsx`
- `frontend-user/components/Filters.tsx`
- `frontend-user/components/SortBy.tsx`
- `frontend-user/components/Pagination.tsx`
- `frontend-user/components/ProductItem.tsx`
- `frontend-user/components/SectionTitle.tsx`
- `frontend-user/components/Heading.tsx`
- `frontend-user/components/CustomButton.tsx`
- `frontend-user/components/Footer.tsx`
- `frontend-user/components/Newsletter.tsx`
- `frontend-user/components/Breadcrumb.tsx`
- `frontend-user/components/AddToWishlistBtn.tsx`
- `frontend-user/components/WishItem.tsx`
- `frontend-user/components/modules/wishlist/index.tsx`
- `frontend-user/app/shop/[[...slug]]/page.tsx`
- `frontend-user/app/search/page.tsx`
- `frontend-user/app/login/page.tsx`
- `frontend-user/app/register/page.tsx`
- `frontend-user/app/wishlist/page.tsx`
- `frontend-user/lib/utils.ts` (category names, incentives, navigation)

## Các bước thực hiện

1. **Tạo hệ thống translations cơ bản**
2. **Dịch từng component theo thứ tự ưu tiên**
3. **Test từng phần sau khi dịch**
4. **Refinement và optimization**

## Ưu tiên dịch

1. **High Priority**: Navigation, login/register forms, main page content
2. **Medium Priority**: Product details, filters, sorting
3. **Low Priority**: Admin panels, error messages

## Phong cách dịch

- **Kỹ thuật**: Giữ nguyên các thuật ngữ kỹ thuật phổ biến (email, password, login, etc.)
- **Tự nhiên**: Dịch các cụm từ thông thường thành tiếng Việt tự nhiên
- **Nhất quán**: Sử dụng cùng một từ cho cùng một khái niệm

## Lưu ý kỹ thuật

- Sử dụng Next.js i18n hoặc custom translation system
- Đảm bảo không ảnh hưởng đến functionality
- Maintain responsive design
- Test trên multiple devices/browsers
