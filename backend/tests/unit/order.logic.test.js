/**
 * Unit Tests: Order Logic
 * Tests cho các logic đơn hàng - không cần DB
 */

describe('Order Logic Unit Tests', () => {
    describe('UC3.3: Order Total Calculation', () => {
        const calculateOrderTotal = (items, shippingFee = 0, discount = 0) => {
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return subtotal + shippingFee - discount;
        };

        test('Tính tổng tiền đơn hàng đúng', () => {
            const items = [
                { productId: 'p1', price: 100000, quantity: 2 },
                { productId: 'p2', price: 50000, quantity: 1 },
            ];

            const total = calculateOrderTotal(items);
            expect(total).toBe(250000); // 2*100000 + 1*50000
        });

        test('Tính tổng tiền với phí ship', () => {
            const items = [{ productId: 'p1', price: 100000, quantity: 1 }];
            const shippingFee = 30000;

            const total = calculateOrderTotal(items, shippingFee);
            expect(total).toBe(130000);
        });

        test('Tính tổng tiền với giảm giá', () => {
            const items = [{ productId: 'p1', price: 100000, quantity: 1 }];
            const discount = 10000;

            const total = calculateOrderTotal(items, 0, discount);
            expect(total).toBe(90000);
        });

        test('Tính tổng tiền với ship và giảm giá', () => {
            const items = [{ productId: 'p1', price: 100000, quantity: 2 }];
            const shippingFee = 30000;
            const discount = 20000;

            const total = calculateOrderTotal(items, shippingFee, discount);
            expect(total).toBe(210000); // 200000 + 30000 - 20000
        });

        test('Giỏ hàng trống = 0', () => {
            const total = calculateOrderTotal([]);
            expect(total).toBe(0);
        });
    });

    describe('Order Status Transitions', () => {
        const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];

        const isValidTransition = (from, to) => {
            const transitions = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['processing', 'cancelled'],
                'processing': ['shipping', 'cancelled'],
                'shipping': ['delivered'],
                'delivered': [],
                'cancelled': [],
            };
            return transitions[from]?.includes(to) || false;
        };

        test('pending -> confirmed: hợp lệ', () => {
            expect(isValidTransition('pending', 'confirmed')).toBe(true);
        });

        test('pending -> cancelled: hợp lệ', () => {
            expect(isValidTransition('pending', 'cancelled')).toBe(true);
        });

        test('confirmed -> processing: hợp lệ', () => {
            expect(isValidTransition('confirmed', 'processing')).toBe(true);
        });

        test('shipping -> delivered: hợp lệ', () => {
            expect(isValidTransition('shipping', 'delivered')).toBe(true);
        });

        test('delivered -> cancelled: không hợp lệ', () => {
            expect(isValidTransition('delivered', 'cancelled')).toBe(false);
        });

        test('cancelled -> pending: không hợp lệ', () => {
            expect(isValidTransition('cancelled', 'pending')).toBe(false);
        });

        test('pending -> delivered: không hợp lệ (skip steps)', () => {
            expect(isValidTransition('pending', 'delivered')).toBe(false);
        });
    });

    describe('Order Validation', () => {
        const validateOrderData = (data) => {
            const errors = [];

            if (!data.name || data.name.trim() === '') {
                errors.push('Name is required');
            }
            if (!data.phone || !/^0\d{9,10}$/.test(data.phone)) {
                errors.push('Valid phone number is required');
            }
            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.push('Valid email is required');
            }
            if (!data.address || data.address.trim() === '') {
                errors.push('Address is required');
            }
            if (!data.city || data.city.trim() === '') {
                errors.push('City is required');
            }

            return { isValid: errors.length === 0, errors };
        };

        test('Dữ liệu hợp lệ', () => {
            const data = {
                name: 'Nguyen Van A',
                phone: '0123456789',
                email: 'test@example.com',
                address: '123 Test St',
                city: 'Hanoi',
            };

            const result = validateOrderData(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('Thiếu tên', () => {
            const data = {
                name: '',
                phone: '0123456789',
                email: 'test@example.com',
                address: '123 Test St',
                city: 'Hanoi',
            };

            const result = validateOrderData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Name is required');
        });

        test('Phone không hợp lệ', () => {
            const data = {
                name: 'Test',
                phone: '123', // Quá ngắn
                email: 'test@example.com',
                address: '123 Test St',
                city: 'Hanoi',
            };

            const result = validateOrderData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Valid phone number is required');
        });

        test('Email không hợp lệ', () => {
            const data = {
                name: 'Test',
                phone: '0123456789',
                email: 'invalid-email',
                address: '123 Test St',
                city: 'Hanoi',
            };

            const result = validateOrderData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Valid email is required');
        });

        test('Nhiều lỗi cùng lúc', () => {
            const data = {
                name: '',
                phone: '123',
                email: 'invalid',
                address: '',
                city: '',
            };

            const result = validateOrderData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });

    describe('Payment Method Validation', () => {
        const VALID_PAYMENT_METHODS = ['COD', 'MOMO', 'BANK_TRANSFER'];

        const isValidPaymentMethod = (method) => {
            return VALID_PAYMENT_METHODS.includes(method);
        };

        test('COD hợp lệ', () => {
            expect(isValidPaymentMethod('COD')).toBe(true);
        });

        test('MOMO hợp lệ', () => {
            expect(isValidPaymentMethod('MOMO')).toBe(true);
        });

        test('BANK_TRANSFER hợp lệ', () => {
            expect(isValidPaymentMethod('BANK_TRANSFER')).toBe(true);
        });

        test('INVALID không hợp lệ', () => {
            expect(isValidPaymentMethod('INVALID')).toBe(false);
        });

        test('Empty không hợp lệ', () => {
            expect(isValidPaymentMethod('')).toBe(false);
        });
    });
});
