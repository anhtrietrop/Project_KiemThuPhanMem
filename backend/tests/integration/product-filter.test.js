/**
 * Integration Tests: Product Filter API
 * Tests cho API lọc sản phẩm - cần kết nối DB
 */

const request = require('supertest');

// Mock app for testing
const express = require('express');
const app = express();

// Mock product data
const mockProducts = [
    { id: '1', title: 'iPhone 15', price: 25000000, categoryId: 'phones', quantity: 10, rating: 4.5 },
    { id: '2', title: 'Samsung S24', price: 20000000, categoryId: 'phones', quantity: 5, rating: 4.2 },
    { id: '3', title: 'MacBook Pro', price: 50000000, categoryId: 'laptops', quantity: 3, rating: 4.8 },
    { id: '4', title: 'Dell XPS', price: 35000000, categoryId: 'laptops', quantity: 0, rating: 4.0 },
    { id: '5', title: 'AirPods Pro', price: 5000000, categoryId: 'accessories', quantity: 20, rating: 4.6 },
];

// Filter logic
const filterProducts = (products, filters) => {
    return products.filter(p => {
        // Price filter
        if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
        
        // Category filter
        if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
        
        // Stock filter
        if (filters.inStock === true && filters.outOfStock === false && p.quantity <= 0) return false;
        if (filters.inStock === false && filters.outOfStock === true && p.quantity > 0) return false;
        if (filters.inStock === false && filters.outOfStock === false) return false;
        
        // Rating filter
        if (filters.minRating !== undefined && p.rating < filters.minRating) return false;
        
        return true;
    });
};

// Mock API endpoint
app.get('/api/products', (req, res) => {
    const filters = {
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        categoryId: req.query.category || undefined,
        inStock: req.query.inStock === 'true',
        outOfStock: req.query.outOfStock === 'true',
        minRating: req.query.rating ? Number(req.query.rating) : undefined,
    };
    
    // Validate price range
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        if (filters.minPrice > filters.maxPrice) {
            return res.status(400).json({ error: 'minPrice cannot exceed maxPrice' });
        }
    }
    if (filters.minPrice !== undefined && filters.minPrice < 0) {
        return res.status(400).json({ error: 'minPrice must be >= 0' });
    }
    
    const results = filterProducts(mockProducts, filters);
    res.json(results);
});

describe('Product Filter API Integration Tests', () => {
    
    describe('UC1.29: Filter by Category', () => {
        test('Lọc theo category "phones" → 2 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?category=phones&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body.every(p => p.categoryId === 'phones')).toBe(true);
        });

        test('Lọc theo category "laptops" → 2 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?category=laptops&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        test('Category không tồn tại → 0 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?category=tablets&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });

        test('Không có category filter → tất cả sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(5);
        });
    });

    describe('UC1.30: Filter by Price Range', () => {
        test('Lọc minPrice=20000000 → 4 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=20000000&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(4); // iPhone 25tr, Samsung 20tr, MacBook 50tr, Dell 35tr
            expect(response.body.every(p => p.price >= 20000000)).toBe(true);
        });

        test('Lọc maxPrice=10000000 → 1 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?maxPrice=10000000&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('AirPods Pro');
        });

        test('Lọc khoảng giá 20tr-40tr → 3 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=20000000&maxPrice=40000000&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
        });

        test('Không có maxPrice (unlimited) → lọc từ minPrice trở lên', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=40000000&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('MacBook Pro');
        });

        test('minPrice=0 (từ 0đ) → tất cả sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=0&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(5);
        });

        test('minPrice > maxPrice → Error 400', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=50000000&maxPrice=10000000');
            
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('minPrice cannot exceed maxPrice');
        });

        test('minPrice < 0 → Error 400', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=-1000');
            
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('minPrice must be >= 0');
        });
    });

    describe('Filter by Stock Availability', () => {
        test('Chỉ còn hàng (inStock=true, outOfStock=false) → 4 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?inStock=true&outOfStock=false');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(4);
            expect(response.body.every(p => p.quantity > 0)).toBe(true);
        });

        test('Chỉ hết hàng (inStock=false, outOfStock=true) → 1 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?inStock=false&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Dell XPS');
        });

        test('Cả hai (inStock=true, outOfStock=true) → 5 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(5);
        });

        test('Không chọn gì (inStock=false, outOfStock=false) → 0 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?inStock=false&outOfStock=false');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('Filter by Rating', () => {
        test('Rating >= 4.5 → 3 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?rating=4.5&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
            expect(response.body.every(p => p.rating >= 4.5)).toBe(true);
        });

        test('Rating >= 4.0 → 5 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?rating=4.0&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(5);
        });

        test('Rating >= 5.0 → 0 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?rating=5.0&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('Combined Filters', () => {
        test('Category + Price Range', async () => {
            const response = await request(app)
                .get('/api/products?category=phones&minPrice=20000000&maxPrice=30000000&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        test('Category + InStock + Rating', async () => {
            const response = await request(app)
                .get('/api/products?category=laptops&inStock=true&outOfStock=false&rating=4.5');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('MacBook Pro');
        });

        test('Price Range + Category + Rating + InStock', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=1000000&maxPrice=30000000&category=phones&rating=4.0&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        test('Unlimited maxPrice + Category', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=30000000&category=laptops&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2); // MacBook Pro 50tr, Dell XPS 35tr
        });
    });

    describe('Edge Cases', () => {
        test('Giá chính xác biên (exact boundary)', async () => {
            // AirPods Pro có giá đúng 5000000
            const response = await request(app)
                .get('/api/products?minPrice=5000000&maxPrice=5000000&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('AirPods Pro');
        });

        test('Khoảng giá rất lớn (không giới hạn thực tế)', async () => {
            const response = await request(app)
                .get('/api/products?minPrice=0&maxPrice=999999999999&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(5);
        });

        test('Nhiều filters không match → 0 sản phẩm', async () => {
            const response = await request(app)
                .get('/api/products?category=phones&minPrice=100000000&inStock=true&outOfStock=true');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });
});
