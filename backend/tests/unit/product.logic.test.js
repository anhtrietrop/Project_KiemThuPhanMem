/**
 * Unit Tests: Product Logic
 * Tests cho các logic sản phẩm - không cần DB
 */

describe('Product Logic Unit Tests', () => {
    describe('UC1.27: Price Validation', () => {
        const isValidPrice = (price) => {
            return typeof price === 'number' && price >= 0 && !isNaN(price);
        };

        test('Giá dương hợp lệ', () => {
            expect(isValidPrice(100000)).toBe(true);
            expect(isValidPrice(0)).toBe(true);
            expect(isValidPrice(0.01)).toBe(true);
        });

        test('Giá âm không hợp lệ', () => {
            expect(isValidPrice(-100)).toBe(false);
            expect(isValidPrice(-0.01)).toBe(false);
        });

        test('Giá không phải số không hợp lệ', () => {
            expect(isValidPrice('100000')).toBe(false);
            expect(isValidPrice(null)).toBe(false);
            expect(isValidPrice(undefined)).toBe(false);
            expect(isValidPrice(NaN)).toBe(false);
        });
    });

    describe('UC1.28: Product Search', () => {
        const searchProducts = (products, query) => {
            if (!query) return products;
            const lowerQuery = query.toLowerCase();
            return products.filter(p =>
                p.title.toLowerCase().includes(lowerQuery) ||
                p.description?.toLowerCase().includes(lowerQuery)
            );
        };

        const testProducts = [
            { id: 'p1', title: 'iPhone 15 Pro', description: 'Apple smartphone' },
            { id: 'p2', title: 'Samsung Galaxy S24', description: 'Android phone' },
            { id: 'p3', title: 'MacBook Pro', description: 'Apple laptop' },
        ];

        test('Tìm theo tên sản phẩm', () => {
            const results = searchProducts(testProducts, 'iPhone');
            expect(results).toHaveLength(1);
            expect(results[0].id).toBe('p1');
        });

        test('Tìm theo description', () => {
            const results = searchProducts(testProducts, 'Apple');
            expect(results).toHaveLength(2);
        });

        test('Tìm không phân biệt hoa thường', () => {
            const results = searchProducts(testProducts, 'IPHONE');
            expect(results).toHaveLength(1);
        });

        test('Không tìm thấy', () => {
            const results = searchProducts(testProducts, 'Nokia');
            expect(results).toHaveLength(0);
        });

        test('Query rỗng trả về tất cả', () => {
            const results = searchProducts(testProducts, '');
            expect(results).toHaveLength(3);
        });
    });

    describe('UC1.29: Filter by Category', () => {
        const filterByCategory = (products, categoryId) => {
            if (!categoryId) return products;
            return products.filter(p => p.categoryId === categoryId);
        };

        const testProducts = [
            { id: 'p1', title: 'iPhone', categoryId: 'phones' },
            { id: 'p2', title: 'Samsung', categoryId: 'phones' },
            { id: 'p3', title: 'MacBook', categoryId: 'laptops' },
        ];

        test('Lọc theo category', () => {
            const results = filterByCategory(testProducts, 'phones');
            expect(results).toHaveLength(2);
        });

        test('Category không tồn tại', () => {
            const results = filterByCategory(testProducts, 'tablets');
            expect(results).toHaveLength(0);
        });

        test('Không có filter trả về tất cả', () => {
            const results = filterByCategory(testProducts, null);
            expect(results).toHaveLength(3);
        });
    });

    describe('UC1.30: Filter by Price Range', () => {
        const filterByPriceRange = (products, minPrice, maxPrice) => {
            return products.filter(p => {
                if (minPrice && p.price < minPrice) return false;
                if (maxPrice && p.price > maxPrice) return false;
                return true;
            });
        };

        const testProducts = [
            { id: 'p1', title: 'Cheap', price: 100000 },
            { id: 'p2', title: 'Medium', price: 500000 },
            { id: 'p3', title: 'Expensive', price: 1000000 },
        ];

        test('Lọc theo min price', () => {
            const results = filterByPriceRange(testProducts, 200000, null);
            expect(results).toHaveLength(2);
        });

        test('Lọc theo max price', () => {
            const results = filterByPriceRange(testProducts, null, 600000);
            expect(results).toHaveLength(2);
        });

        test('Lọc theo khoảng giá', () => {
            const results = filterByPriceRange(testProducts, 200000, 800000);
            expect(results).toHaveLength(1);
            expect(results[0].id).toBe('p2');
        });

        test('Không có sản phẩm trong khoảng', () => {
            const results = filterByPriceRange(testProducts, 2000000, 3000000);
            expect(results).toHaveLength(0);
        });
    });

    describe('UC1.31: Sort Products', () => {
        const sortProducts = (products, sortBy, order = 'asc') => {
            return [...products].sort((a, b) => {
                if (order === 'asc') {
                    return a[sortBy] > b[sortBy] ? 1 : -1;
                }
                return a[sortBy] < b[sortBy] ? 1 : -1;
            });
        };

        const testProducts = [
            { id: 'p1', title: 'B Product', price: 200000, createdAt: new Date('2024-01-02') },
            { id: 'p2', title: 'A Product', price: 100000, createdAt: new Date('2024-01-01') },
            { id: 'p3', title: 'C Product', price: 300000, createdAt: new Date('2024-01-03') },
        ];

        test('Sắp xếp theo giá tăng dần', () => {
            const results = sortProducts(testProducts, 'price', 'asc');
            expect(results[0].price).toBe(100000);
            expect(results[2].price).toBe(300000);
        });

        test('Sắp xếp theo giá giảm dần', () => {
            const results = sortProducts(testProducts, 'price', 'desc');
            expect(results[0].price).toBe(300000);
            expect(results[2].price).toBe(100000);
        });

        test('Sắp xếp theo tên', () => {
            const results = sortProducts(testProducts, 'title', 'asc');
            expect(results[0].title).toBe('A Product');
            expect(results[2].title).toBe('C Product');
        });
    });

    describe('UC1.32-UC1.34: Stock Management', () => {
        const checkStock = (product, requestedQuantity) => {
            if (!product) return { available: false, message: 'Product not found' };
            if (product.quantity < requestedQuantity) {
                return { available: false, message: 'Not enough stock', currentStock: product.quantity };
            }
            return { available: true, currentStock: product.quantity };
        };

        test('Đủ hàng', () => {
            const product = { id: 'p1', quantity: 100 };
            const result = checkStock(product, 10);
            expect(result.available).toBe(true);
        });

        test('Không đủ hàng', () => {
            const product = { id: 'p1', quantity: 5 };
            const result = checkStock(product, 10);
            expect(result.available).toBe(false);
            expect(result.message).toBe('Not enough stock');
        });

        test('Hết hàng', () => {
            const product = { id: 'p1', quantity: 0 };
            const result = checkStock(product, 1);
            expect(result.available).toBe(false);
        });

        test('Sản phẩm không tồn tại', () => {
            const result = checkStock(null, 1);
            expect(result.available).toBe(false);
            expect(result.message).toBe('Product not found');
        });

        test('Số lượng bằng stock', () => {
            const product = { id: 'p1', quantity: 10 };
            const result = checkStock(product, 10);
            expect(result.available).toBe(true);
        });
    });

    describe('Slug Generation', () => {
        const generateSlug = (title) => {
            return title
                .toLowerCase()
                .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
                .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
                .replace(/[ìíịỉĩ]/g, 'i')
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
                .replace(/[ùúụủũưừứựửữ]/g, 'u')
                .replace(/[ỳýỵỷỹ]/g, 'y')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        test('Tạo slug từ tiếng Anh', () => {
            expect(generateSlug('iPhone 15 Pro Max')).toBe('iphone-15-pro-max');
        });

        test('Tạo slug từ tiếng Việt', () => {
            expect(generateSlug('Điện thoại thông minh')).toBe('dien-thoai-thong-minh');
        });

        test('Xử lý ký tự đặc biệt', () => {
            expect(generateSlug('Product @#$% Name!')).toBe('product-name');
        });

        test('Xử lý nhiều khoảng trắng', () => {
            expect(generateSlug('Product   Name')).toBe('product-name');
        });
    });
});
