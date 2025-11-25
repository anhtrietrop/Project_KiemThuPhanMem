/**
 * Unit Tests: Cart Logic
 * Tests cho các logic giỏ hàng - không cần DB
 */

describe('Cart Logic Unit Tests', () => {
    describe('UC2.1-UC2.4: Cart Operations', () => {
        // Simulate cart operations
        class Cart {
            constructor() {
                this.items = [];
            }

            addItem(productId, quantity, price) {
                const existingItem = this.items.find(i => i.productId === productId);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    this.items.push({ productId, quantity, price });
                }
            }

            updateQuantity(productId, quantity) {
                const item = this.items.find(i => i.productId === productId);
                if (item) {
                    item.quantity = quantity;
                }
            }

            removeItem(productId) {
                this.items = this.items.filter(i => i.productId !== productId);
            }

            clear() {
                this.items = [];
            }

            getTotal() {
                return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }

            getTotalQuantity() {
                return this.items.reduce((sum, item) => sum + item.quantity, 0);
            }
        }

        test('UC2.1: Thêm sản phẩm vào giỏ', () => {
            const cart = new Cart();
            cart.addItem('p1', 2, 100000);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].quantity).toBe(2);
        });

        test('UC2.1: Thêm sản phẩm đã có - tăng số lượng', () => {
            const cart = new Cart();
            cart.addItem('p1', 2, 100000);
            cart.addItem('p1', 3, 100000);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].quantity).toBe(5);
        });

        test('UC2.2: Cập nhật số lượng', () => {
            const cart = new Cart();
            cart.addItem('p1', 2, 100000);
            cart.updateQuantity('p1', 5);

            expect(cart.items[0].quantity).toBe(5);
        });

        test('UC2.3: Xóa sản phẩm khỏi giỏ', () => {
            const cart = new Cart();
            cart.addItem('p1', 2, 100000);
            cart.addItem('p2', 1, 50000);
            cart.removeItem('p1');

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].productId).toBe('p2');
        });

        test('UC2.4: Xóa toàn bộ giỏ hàng', () => {
            const cart = new Cart();
            cart.addItem('p1', 2, 100000);
            cart.addItem('p2', 1, 50000);
            cart.clear();

            expect(cart.items).toHaveLength(0);
        });
    });

    describe('UC2.5: Stock Validation', () => {
        const validateAddToCart = (requestedQty, availableStock, currentCartQty = 0) => {
            const totalQty = currentCartQty + requestedQty;
            if (totalQty > availableStock) {
                return { valid: false, message: 'Not enough stock', maxAvailable: availableStock - currentCartQty };
            }
            return { valid: true };
        };

        test('Thêm được khi đủ hàng', () => {
            const result = validateAddToCart(5, 100, 0);
            expect(result.valid).toBe(true);
        });

        test('Không thêm được khi vượt stock', () => {
            const result = validateAddToCart(10, 5, 0);
            expect(result.valid).toBe(false);
            expect(result.maxAvailable).toBe(5);
        });

        test('Tính cả số lượng đã có trong giỏ', () => {
            const result = validateAddToCart(5, 10, 8);
            expect(result.valid).toBe(false);
            expect(result.maxAvailable).toBe(2);
        });
    });

    describe('UC2.6-UC2.7: Cart Calculations', () => {
        const calculateCartTotal = (items) => {
            return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        };

        const calculateTotalQuantity = (items) => {
            return items.reduce((sum, item) => sum + item.quantity, 0);
        };

        test('UC2.6: Tính tổng tiền giỏ hàng', () => {
            const items = [
                { productId: 'p1', quantity: 2, price: 100000 },
                { productId: 'p2', quantity: 1, price: 50000 },
            ];

            expect(calculateCartTotal(items)).toBe(250000);
        });

        test('UC2.7: Tính tổng số lượng', () => {
            const items = [
                { productId: 'p1', quantity: 2, price: 100000 },
                { productId: 'p2', quantity: 3, price: 50000 },
            ];

            expect(calculateTotalQuantity(items)).toBe(5);
        });

        test('Giỏ hàng trống', () => {
            expect(calculateCartTotal([])).toBe(0);
            expect(calculateTotalQuantity([])).toBe(0);
        });
    });

    describe('UC2.8: Price Update', () => {
        const updateCartPrices = (cartItems, products) => {
            return cartItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    return { ...item, price: product.price };
                }
                return item;
            });
        };

        test('Cập nhật giá khi sản phẩm thay đổi giá', () => {
            const cartItems = [
                { productId: 'p1', quantity: 2, price: 100000 }, // Giá cũ
            ];
            const products = [
                { id: 'p1', price: 120000 }, // Giá mới
            ];

            const updated = updateCartPrices(cartItems, products);
            expect(updated[0].price).toBe(120000);
        });

        test('Giữ nguyên nếu sản phẩm không tìm thấy', () => {
            const cartItems = [
                { productId: 'p1', quantity: 2, price: 100000 },
            ];
            const products = []; // Không có sản phẩm

            const updated = updateCartPrices(cartItems, products);
            expect(updated[0].price).toBe(100000);
        });
    });

    describe('Cart Sync (Guest to User)', () => {
        const mergeGuestCart = (guestItems, userItems) => {
            const merged = [...userItems];

            guestItems.forEach(guestItem => {
                const existingItem = merged.find(i => i.productId === guestItem.productId);
                if (existingItem) {
                    existingItem.quantity += guestItem.quantity;
                } else {
                    merged.push({ ...guestItem });
                }
            });

            return merged;
        };

        test('Merge giỏ hàng guest vào user', () => {
            const guestItems = [
                { productId: 'p1', quantity: 2, price: 100000 },
            ];
            const userItems = [
                { productId: 'p2', quantity: 1, price: 50000 },
            ];

            const merged = mergeGuestCart(guestItems, userItems);
            expect(merged).toHaveLength(2);
        });

        test('Cộng dồn số lượng nếu trùng sản phẩm', () => {
            const guestItems = [
                { productId: 'p1', quantity: 2, price: 100000 },
            ];
            const userItems = [
                { productId: 'p1', quantity: 3, price: 100000 },
            ];

            const merged = mergeGuestCart(guestItems, userItems);
            expect(merged).toHaveLength(1);
            expect(merged[0].quantity).toBe(5);
        });

        test('Guest cart rỗng', () => {
            const guestItems = [];
            const userItems = [
                { productId: 'p1', quantity: 1, price: 100000 },
            ];

            const merged = mergeGuestCart(guestItems, userItems);
            expect(merged).toHaveLength(1);
        });
    });
});
