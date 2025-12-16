/**
 * Integration Tests: Product Filter API
 * Tests cho API lọc sản phẩm - chạy trên DB thực (Test Environment)
 */

require('../setup'); // Load env vars first
const request = require('supertest');
const app = require('../../app');
const {
    cleanTestDatabase
} = require('../setup');
const {
    TestDatabaseHelper,
    TestDataFactory
} = require('../helpers');

describe('Product Filter API Integration Tests', () => {
    // Lưu trữ IDs để assert
    let categoryPhones, categoryLaptops, categoryAccessories;
    let merchant;

    // Chạy trước tất cả các test trong suite này
    beforeAll(async () => {
        // Đảm bảo DB sạch sẽ
        await cleanTestDatabase();

        // 1. Tạo dữ liệu nền (Merchant & Categories)
        merchant = await TestDatabaseHelper.createMerchant({ name: 'Test Merchant' });

        categoryPhones = await TestDatabaseHelper.createCategory({ name: 'Phones' });
        categoryLaptops = await TestDatabaseHelper.createCategory({ name: 'Laptops' });
        categoryAccessories = await TestDatabaseHelper.createCategory({ name: 'Accessories' });

        // 2. Tạo Products mẫu với các thuộc tính khác nhau để test filter
        const commonData = { merchantId: merchant.id, rating: 0 };

        // Phone 1: High price, In stock, High rating
        await TestDatabaseHelper.createProduct({
            ...commonData,
            title: 'iPhone 15 Pro Max',
            price: 30000000,
            categoryId: categoryPhones.id,
            quantity: 10,
            rating: 5.0,
        });

        // Phone 2: Mid price, In stock, Mid rating
        await TestDatabaseHelper.createProduct({
            ...commonData,
            title: 'Samsung Galaxy S24',
            price: 20000000,
            categoryId: categoryPhones.id,
            quantity: 5,
            rating: 4.0,
        });

        // Laptop 1: Very High price, Out of stock
        await TestDatabaseHelper.createProduct({
            ...commonData,
            title: 'MacBook Pro M3',
            price: 50000000,
            categoryId: categoryLaptops.id,
            quantity: 0,
            rating: 4.8,
        });

        // Laptop 2: High price, In stock
        await TestDatabaseHelper.createProduct({
            ...commonData,
            title: 'Dell XPS 15',
            price: 35000000,
            categoryId: categoryLaptops.id,
            quantity: 3,
            rating: 4.2,
        });

        // Accessory 1: Low price, In stock
        await TestDatabaseHelper.createProduct({
            ...commonData,
            title: 'AirPods Pro',
            price: 5000000,
            categoryId: categoryAccessories.id,
            quantity: 20,
            rating: 4.5,
        });
    });

    // Sau khi test xong toàn bộ, clean lại DB
    afterAll(async () => {
        await cleanTestDatabase();
    });

    describe('GET /api/products - Filter by Category', () => {
        test('TC3.01 - Lọc theo Category "Phones"', async () => {
            const response = await request(app)
                .get('/api/products?filters=category$equals=Phones');  // ✅ Correct URL

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);  // iPhone + Samsung
        });

        test('Lọc theo Category "Laptops"', async () => {
            const response = await request(app)
                .get('/api/products?filters=category$equals=Laptops');

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);  // MacBook + Dell
        });
    });

    describe('GET /api/products - Filter by Price', () => {  // ✅ SEPARATE
        test('TC3.02 - Lọc giá từ 10M đến 30M', async () => {
            const response = await request(app)
                .get('/api/products?filters=price$gte=10000000&filters=price$lte=30000000');

            expect(response.status).toBe(200);
            response.body.forEach(p => {
                expect(p.price).toBeGreaterThanOrEqual(10000000);
                expect(p.price).toBeLessThanOrEqual(30000000);
            });
        });

        test('Lọc giá >= 30M', async () => {
            const response = await request(app)
                .get('/api/products?filters=price$gte=30000000');

            expect(response.status).toBe(200);
        });
    });

    describe('GET /api/products - Filter by Stock', () => {  // ✅ SEPARATE
        test('Lọc sản phẩm còn hàng', async () => {
            const response = await request(app)
                .get('/api/products?filters=quantity$gt=0');

            expect(response.status).toBe(200);
        });
    });

});
