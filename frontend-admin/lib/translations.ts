// Vietnamese translations for frontend-admin
export const translations = {
    // Navigation & Menu
    dashboard: "Bảng điều khiển",
    products: "Sản phẩm",
    categories: "Danh mục",
    orders: "Đơn hàng",
    users: "Người dùng",
    settings: "Cài đặt",
    profile: "Hồ sơ",
    logout: "Đăng xuất",

    // Page Titles
    adminDashboard: "Bảng điều khiển quản trị",
    manageProducts: "Quản lý sản phẩm",
    manageCategories: "Quản lý danh mục",
    manageOrders: "Quản lý đơn hàng",
    manageUsers: "Quản lý người dùng",

    // Buttons
    addNew: "Thêm mới",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    save: "Lưu",
    cancel: "Hủy",
    confirm: "Xác nhận",
    submit: "Gửi",
    search: "Tìm kiếm",
    filter: "Lọc",
    reset: "Đặt lại",
    export: "Xuất",
    import: "Nhập",

    // Table Headers
    id: "ID",
    name: "Tên",
    title: "Tiêu đề",
    description: "Mô tả",
    price: "Giá",
    category: "Danh mục",
    status: "Trạng thái",
    stock: "Tồn kho",
    image: "Hình ảnh",
    actions: "Hành động",
    createdAt: "Ngày tạo",
    updatedAt: "Ngày cập nhật",

    // Form Labels
    productName: "Tên sản phẩm",
    productTitle: "Tiêu đề sản phẩm",
    productDescription: "Mô tả sản phẩm",
    productPrice: "Giá sản phẩm",
    productCategory: "Danh mục sản phẩm",
    productStock: "Số lượng tồn kho",
    productImage: "Hình ảnh sản phẩm",
    categoryName: "Tên danh mục",
    categoryDescription: "Mô tả danh mục",

    // Status
    active: "Hoạt động",
    inactive: "Không hoạt động",
    pending: "Đang chờ",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
    inStock: "Còn hàng",
    outOfStock: "Hết hàng",

    // Messages
    success: "Thành công",
    error: "Lỗi",
    warning: "Cảnh báo",
    info: "Thông tin",
    loading: "Đang tải...",
    noData: "Không có dữ liệu",
    confirmDelete: "Bạn có chắc chắn muốn xóa?",
    itemDeleted: "Đã xóa thành công",
    itemSaved: "Đã lưu thành công",
    itemUpdated: "Đã cập nhật thành công",

    // Categories
    smartPhones: "Điện thoại thông minh",
    tablets: "Máy tính bảng",
    mouses: "Chuột",
    cameras: "Máy ảnh",
    smartWatches: "Đồng hồ thông minh",
    laptops: "Máy tính xách tay",
    pcs: "Máy tính để bàn",
    printers: "Máy in",
    earbuds: "Tai nghe không dây",
    headphones: "Tai nghe",

    // General
    yes: "Có",
    no: "Không",
    close: "Đóng",
    back: "Quay lại",
    next: "Tiếp theo",
    previous: "Trước đó",
    show: "Hiển thị",
    hide: "Ẩn",
    all: "Tất cả",
    none: "Không có",
    select: "Chọn",
    selected: "Đã chọn",
    total: "Tổng cộng",
    quantity: "Số lượng",
    currency: "VNĐ",
} as const;

export type TranslationKey = keyof typeof translations;
