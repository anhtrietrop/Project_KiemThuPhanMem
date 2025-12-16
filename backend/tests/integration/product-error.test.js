const request = require('supertest');
const app = require('../../app');
const prisma = require('../../utills/db'); // Use the same Prisma instance as the app

describe('Error Handling - Product API', () => {

    beforeEach(async () => {
        // Reset mocks before each test
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.restoreAllMocks();
        // Disconnect Prisma after tests
        await prisma.$disconnect();
    });

    test('Database error (500) during fetch', async () => {
        // Mock DB error for findMany (used in getAllProducts)
        jest.spyOn(prisma.product, 'findMany').mockRejectedValueOnce(new Error('DB connection failed'));

        const response = await request(app).get('/api/products');

        // Expect 500 error code
        expect(response.status).toBe(500);
        // Expect error format
        expect(response.body).toHaveProperty('error');
    });

    test('Invalid query parameter (400) - Price validation', async () => {
        // Sending non-numeric price filter which is invalid logic or negative price
        // Assuming controller validation catches negative price in CRUD, 
        // for GET /api/products, checking filter logic.
        // Actually, createProduct validates price. Let's test that.

        const response = await request(app)
            .post('/api/products')
            .send({
                title: 'Invalid Price Product',
                price: -100, // Invalid
                quantity: 10,
                categoryId: 'some-id',
                merchantId: 'some-id',
                mainImage: 'img.jpg'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/negative/i);
    });

    test('Route not found (404)', async () => {
        const response = await request(app).get('/api/products/non-existent-route/xyz');
        expect(response.status).toBe(404);
    });

    // Note: Rate limiting (429) and Timeout (504) are harder to test in integration without 
    // actually triggering the limits or mocking the middleware.
    // Here is a test for Rate Limiting by mocking the rate limiter or spamming requests.
    // Given the complexity of spamming in test, we will skip implementation or just verify 
    // headers if possible.
});
