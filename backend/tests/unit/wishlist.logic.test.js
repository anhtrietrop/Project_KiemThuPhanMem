/**
 * Unit Tests: Wishlist Logic
 * Tests cho các logic wishlist - không cần DB
 */

describe('Wishlist Logic Unit Tests', () => {
    describe('UC2.9-UC2.12: Wishlist Operations', () => {
        class Wishlist {
            constructor() {
                this.items = [];
            }

            addItem(productId) {
                if (this.items.includes(productId)) {
                    return { success: false, message: 'Product already in wishlist' };
                }
                this.items.push(productId);
                return { success: true };
            }

            removeItem(productId) {
                const index = this.items.indexOf(productId);
                if (index === -1) {
                    return { success: false, message: 'Product not in wishlist' };
                }
                this.items.splice(index, 1);
                return { success: true };
            }

            hasItem(productId) {
                return this.items.includes(productId);
            }

            getAll() {
                return [...this.items];
            }
        }

        test('UC2.9: Thêm sản phẩm vào wishlist', () => {
            const wishlist = new Wishlist();
            const result = wishlist.addItem('p1');

            expect(result.success).toBe(true);
            expect(wishlist.items).toHaveLength(1);
        });

        test('UC2.10: Xóa sản phẩm khỏi wishlist', () => {
            const wishlist = new Wishlist();
            wishlist.addItem('p1');
            wishlist.addItem('p2');

            const result = wishlist.removeItem('p1');

            expect(result.success).toBe(true);
            expect(wishlist.items).toHaveLength(1);
            expect(wishlist.items[0]).toBe('p2');
        });

        test('UC2.11: Lấy danh sách wishlist', () => {
            const wishlist = new Wishlist();
            wishlist.addItem('p1');
            wishlist.addItem('p2');
            wishlist.addItem('p3');

            const items = wishlist.getAll();
            expect(items).toHaveLength(3);
            expect(items).toContain('p1');
            expect(items).toContain('p2');
            expect(items).toContain('p3');
        });

        test('UC2.12: Không cho phép thêm trùng sản phẩm', () => {
            const wishlist = new Wishlist();
            wishlist.addItem('p1');

            const result = wishlist.addItem('p1');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Product already in wishlist');
            expect(wishlist.items).toHaveLength(1);
        });

        test('Kiểm tra sản phẩm có trong wishlist', () => {
            const wishlist = new Wishlist();
            wishlist.addItem('p1');

            expect(wishlist.hasItem('p1')).toBe(true);
            expect(wishlist.hasItem('p2')).toBe(false);
        });

        test('Xóa sản phẩm không tồn tại', () => {
            const wishlist = new Wishlist();

            const result = wishlist.removeItem('p1');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Product not in wishlist');
        });
    });
});
