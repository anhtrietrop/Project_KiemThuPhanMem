/**
 * Integration Tests: Review API
 * Tests cho API đánh giá sản phẩm
 */

const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock data
const mockUsers = [
    { id: 'user1', email: 'buyer@test.com', role: 'user' },
    { id: 'user2', email: 'nonbuyer@test.com', role: 'user' },
    { id: 'admin1', email: 'admin@test.com', role: 'admin' },
];

const mockProducts = [
    { id: 'prod1', title: 'iPhone 15', price: 25000000, rating: 0 },
    { id: 'prod2', title: 'Samsung S24', price: 20000000, rating: 4 },
];

const mockOrders = [
    { id: 'order1', userId: 'user1', productId: 'prod1', status: 'delivered' },
    { id: 'order2', userId: 'user1', productId: 'prod2', status: 'pending' },
];

let mockReviews = [];
let reviewIdCounter = 1;

// Helper functions
const hasPurchased = (userId, productId) => {
    return mockOrders.some(o => 
        o.userId === userId && 
        o.productId === productId && 
        ['delivered', 'completed'].includes(o.status.toLowerCase())
    );
};

const hasReviewed = (userId, productId) => {
    return mockReviews.some(r => r.userId === userId && r.productId === productId);
};

const calculateAvgRating = (productId) => {
    const productReviews = mockReviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / productReviews.length) * 10) / 10;
};

// Mock auth middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = authHeader.split(' ')[1];
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
};

// API Routes

// Check if user can review
app.get('/api/reviews/can-review/:productId', authenticate, (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ canReview: false, reason: 'Product not found' });
    }

    if (!hasPurchased(userId, productId)) {
        return res.json({ canReview: false, reason: 'Must purchase product first' });
    }

    if (hasReviewed(userId, productId)) {
        return res.json({ canReview: false, reason: 'Already reviewed' });
    }

    return res.json({ canReview: true });
});

// Create review
app.post('/api/reviews', authenticate, (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validation
    if (!productId || !rating) {
        return res.status(400).json({ error: 'Product ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    if (!hasPurchased(userId, productId)) {
        return res.status(403).json({ error: 'You can only review products you have purchased' });
    }

    if (hasReviewed(userId, productId)) {
        return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    const review = {
        id: `review${reviewIdCounter++}`,
        productId,
        userId,
        rating,
        comment: comment || '',
        createdAt: new Date().toISOString(),
        user: mockUsers.find(u => u.id === userId),
    };

    mockReviews.push(review);

    // Update product rating
    product.rating = calculateAvgRating(productId);

    return res.status(201).json(review);
});

// Get product reviews
app.get('/api/reviews/product/:productId', (req, res) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const productReviews = mockReviews.filter(r => r.productId === productId);
    const total = productReviews.length;
    const paginatedReviews = productReviews.slice((page - 1) * limit, page * limit);

    return res.json({
        reviews: paginatedReviews,
        total,
        averageRating: calculateAvgRating(productId),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// Update review
app.put('/api/reviews/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const reviewIndex = mockReviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found' });
    }

    if (mockReviews[reviewIndex].userId !== userId) {
        return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (rating) mockReviews[reviewIndex].rating = rating;
    if (comment !== undefined) mockReviews[reviewIndex].comment = comment;

    // Update product rating
    const productId = mockReviews[reviewIndex].productId;
    const product = mockProducts.find(p => p.id === productId);
    if (product) product.rating = calculateAvgRating(productId);

    return res.json(mockReviews[reviewIndex]);
});

// Delete review
app.delete('/api/reviews/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const reviewIndex = mockReviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found' });
    }

    const review = mockReviews[reviewIndex];
    if (review.userId !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    const productId = review.productId;
    mockReviews.splice(reviewIndex, 1);

    // Update product rating
    const product = mockProducts.find(p => p.id === productId);
    if (product) product.rating = calculateAvgRating(productId);

    return res.status(204).send();
});

// Get review stats
app.get('/api/reviews/product/:productId/stats', (req, res) => {
    const { productId } = req.params;
    const productReviews = mockReviews.filter(r => r.productId === productId);

    if (productReviews.length === 0) {
        return res.json({
            average: 0,
            total: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    productReviews.forEach(r => distribution[r.rating]++);

    return res.json({
        average: calculateAvgRating(productId),
        total: productReviews.length,
        distribution,
    });
});

// Tests
describe('Review API Integration Tests', () => {

    beforeEach(() => {
        // Reset reviews before each test
        mockReviews = [];
        reviewIdCounter = 1;
        mockProducts[0].rating = 0;
        mockProducts[1].rating = 4;
    });

    describe('UC2.13: Check Review Eligibility (canReview)', () => {
        test('User đã mua và nhận hàng → canReview = true', async () => {
            const response = await request(app)
                .get('/api/reviews/can-review/prod1')
                .set('Authorization', 'Bearer user1');

            expect(response.status).toBe(200);
            expect(response.body.canReview).toBe(true);
        });

        test('User chưa mua hàng → canReview = false', async () => {
            const response = await request(app)
                .get('/api/reviews/can-review/prod1')
                .set('Authorization', 'Bearer user2');

            expect(response.status).toBe(200);
            expect(response.body.canReview).toBe(false);
            expect(response.body.reason).toContain('purchase');
        });

        test('User đã mua nhưng order chưa delivered → canReview = false', async () => {
            const response = await request(app)
                .get('/api/reviews/can-review/prod2')
                .set('Authorization', 'Bearer user1');

            expect(response.status).toBe(200);
            expect(response.body.canReview).toBe(false);
        });

        test('Không có auth → 401', async () => {
            const response = await request(app)
                .get('/api/reviews/can-review/prod1');

            expect(response.status).toBe(401);
        });

        test('Product không tồn tại → 404', async () => {
            const response = await request(app)
                .get('/api/reviews/can-review/nonexistent')
                .set('Authorization', 'Bearer user1');

            expect(response.status).toBe(404);
        });
    });

    describe('UC2.14: Create Review', () => {
        test('Tạo review thành công với rating và comment', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({
                    productId: 'prod1',
                    rating: 5,
                    comment: 'Sản phẩm rất tốt!',
                });

            expect(response.status).toBe(201);
            expect(response.body.rating).toBe(5);
            expect(response.body.comment).toBe('Sản phẩm rất tốt!');
            expect(response.body.userId).toBe('user1');
        });

        test('Tạo review chỉ với rating (không có comment)', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({
                    productId: 'prod1',
                    rating: 4,
                });

            expect(response.status).toBe(201);
            expect(response.body.rating).toBe(4);
            expect(response.body.comment).toBe('');
        });

        test('Thiếu rating → 400', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({
                    productId: 'prod1',
                    comment: 'Test comment',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('rating');
        });

        test('Rating không hợp lệ (< 1) → 400', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({
                    productId: 'prod1',
                    rating: 0,
                });

            expect(response.status).toBe(400);
        });

        test('Rating không hợp lệ (> 5) → 400', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({
                    productId: 'prod1',
                    rating: 6,
                });

            expect(response.status).toBe(400);
        });

        test('User chưa mua sản phẩm → 403', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user2')
                .send({
                    productId: 'prod1',
                    rating: 5,
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('purchased');
        });

        test('User đã review sản phẩm này → 409', async () => {
            // Create first review
            await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({ productId: 'prod1', rating: 5 });

            // Try to create second review
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({ productId: 'prod1', rating: 4 });

            expect(response.status).toBe(409);
            expect(response.body.error).toContain('already reviewed');
        });

        test('Product không tồn tại → 404', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({
                    productId: 'nonexistent',
                    rating: 5,
                });

            expect(response.status).toBe(404);
        });
    });

    describe('UC2.15: Get Product Reviews', () => {
        beforeEach(async () => {
            // Add some test reviews
            mockReviews = [
                { id: 'r1', productId: 'prod1', userId: 'user1', rating: 5, comment: 'Great!', createdAt: new Date().toISOString() },
                { id: 'r2', productId: 'prod1', userId: 'user2', rating: 4, comment: 'Good', createdAt: new Date().toISOString() },
            ];
        });

        test('Lấy danh sách reviews cho product', async () => {
            const response = await request(app)
                .get('/api/reviews/product/prod1');

            expect(response.status).toBe(200);
            expect(response.body.reviews).toHaveLength(2);
            expect(response.body.total).toBe(2);
            expect(response.body.averageRating).toBe(4.5);
        });

        test('Product không có review → empty array', async () => {
            mockReviews = [];
            const response = await request(app)
                .get('/api/reviews/product/prod2');

            expect(response.status).toBe(200);
            expect(response.body.reviews).toHaveLength(0);
            expect(response.body.total).toBe(0);
            expect(response.body.averageRating).toBe(0);
        });

        test('Pagination hoạt động đúng', async () => {
            const response = await request(app)
                .get('/api/reviews/product/prod1?page=1&limit=1');

            expect(response.status).toBe(200);
            expect(response.body.reviews).toHaveLength(1);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.totalPages).toBe(2);
        });
    });

    describe('UC2.16: Update Review', () => {
        beforeEach(() => {
            mockReviews = [
                { id: 'r1', productId: 'prod1', userId: 'user1', rating: 5, comment: 'Great!' },
            ];
        });

        test('Cập nhật review thành công', async () => {
            const response = await request(app)
                .put('/api/reviews/r1')
                .set('Authorization', 'Bearer user1')
                .send({ rating: 4, comment: 'Updated comment' });

            expect(response.status).toBe(200);
            expect(response.body.rating).toBe(4);
            expect(response.body.comment).toBe('Updated comment');
        });

        test('Chỉ cập nhật rating', async () => {
            const response = await request(app)
                .put('/api/reviews/r1')
                .set('Authorization', 'Bearer user1')
                .send({ rating: 3 });

            expect(response.status).toBe(200);
            expect(response.body.rating).toBe(3);
            expect(response.body.comment).toBe('Great!'); // unchanged
        });

        test('User khác không thể cập nhật → 403', async () => {
            const response = await request(app)
                .put('/api/reviews/r1')
                .set('Authorization', 'Bearer user2')
                .send({ rating: 1 });

            expect(response.status).toBe(403);
        });

        test('Review không tồn tại → 404', async () => {
            const response = await request(app)
                .put('/api/reviews/nonexistent')
                .set('Authorization', 'Bearer user1')
                .send({ rating: 4 });

            expect(response.status).toBe(404);
        });

        test('Rating không hợp lệ → 400', async () => {
            const response = await request(app)
                .put('/api/reviews/r1')
                .set('Authorization', 'Bearer user1')
                .send({ rating: 10 });

            expect(response.status).toBe(400);
        });
    });

    describe('UC2.17: Delete Review', () => {
        beforeEach(() => {
            mockReviews = [
                { id: 'r1', productId: 'prod1', userId: 'user1', rating: 5, comment: 'Great!' },
            ];
        });

        test('User xóa review của mình → 204', async () => {
            const response = await request(app)
                .delete('/api/reviews/r1')
                .set('Authorization', 'Bearer user1');

            expect(response.status).toBe(204);
            expect(mockReviews).toHaveLength(0);
        });

        test('Admin có thể xóa review của người khác → 204', async () => {
            const response = await request(app)
                .delete('/api/reviews/r1')
                .set('Authorization', 'Bearer admin1');

            expect(response.status).toBe(204);
        });

        test('User khác không thể xóa → 403', async () => {
            const response = await request(app)
                .delete('/api/reviews/r1')
                .set('Authorization', 'Bearer user2');

            expect(response.status).toBe(403);
        });

        test('Review không tồn tại → 404', async () => {
            const response = await request(app)
                .delete('/api/reviews/nonexistent')
                .set('Authorization', 'Bearer user1');

            expect(response.status).toBe(404);
        });
    });

    describe('UC2.18: Review Statistics', () => {
        beforeEach(() => {
            mockReviews = [
                { id: 'r1', productId: 'prod1', userId: 'u1', rating: 5 },
                { id: 'r2', productId: 'prod1', userId: 'u2', rating: 4 },
                { id: 'r3', productId: 'prod1', userId: 'u3', rating: 5 },
                { id: 'r4', productId: 'prod1', userId: 'u4', rating: 3 },
            ];
        });

        test('Lấy thống kê reviews', async () => {
            const response = await request(app)
                .get('/api/reviews/product/prod1/stats');

            expect(response.status).toBe(200);
            expect(response.body.total).toBe(4);
            expect(response.body.average).toBe(4.3);
            expect(response.body.distribution['5']).toBe(2);
            expect(response.body.distribution['4']).toBe(1);
            expect(response.body.distribution['3']).toBe(1);
        });

        test('Product không có review → stats mặc định', async () => {
            mockReviews = [];
            const response = await request(app)
                .get('/api/reviews/product/prod2/stats');

            expect(response.status).toBe(200);
            expect(response.body.total).toBe(0);
            expect(response.body.average).toBe(0);
        });
    });

    describe('Average Rating Update', () => {
        test('Rating sản phẩm được cập nhật khi tạo review', async () => {
            expect(mockProducts[0].rating).toBe(0);

            await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({ productId: 'prod1', rating: 5 });

            expect(mockProducts[0].rating).toBe(5);
        });

        test('Rating sản phẩm được tính trung bình từ nhiều reviews', async () => {
            mockReviews = [
                { id: 'r1', productId: 'prod1', userId: 'other', rating: 4 },
            ];
            mockProducts[0].rating = 4;

            await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer user1')
                .send({ productId: 'prod1', rating: 5 });

            // Average of 4 and 5 = 4.5
            expect(mockProducts[0].rating).toBe(4.5);
        });
    });
});
