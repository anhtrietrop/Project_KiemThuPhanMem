const request = require('supertest');
const app = require('../../app'); // Ensure app.js exports the express app
const { cleanTestDatabase, prisma } = require('../setup'); // Use centralized setup

describe('Auth API Integration Tests', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        // Ensure clean state before starting
        await cleanTestDatabase();
    });

    afterAll(async () => {
        // Final cleanup
        await cleanTestDatabase();
        await prisma.$disconnect();
    });

    describe('POST /api/users (Registration)', () => {
        test('UC1.1: Should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123',
                    name: 'New User'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email', 'newuser@example.com');
            expect(res.body).not.toHaveProperty('password'); // Password should act be returned

            userId = res.body.id; // Save for later checks
        });

        test('UC1.2: Should fail to register with existing email', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    email: 'newuser@example.com', // Duplicate
                    password: 'password123',
                    name: 'Duplicate User'
                });

            expect(res.statusCode).toBe(409); // Conflict (handled by errorHandler P2002)
        });

        test('UC1.3: Should fail with invalid email format', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
        });

        test('UC1.4: Should fail with weak password', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    email: 'weakpass@example.com',
                    password: '123'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/users/login (Login)', () => {
        test('UC1.5: Should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'newuser@example.com');

            authToken = res.body.token; // Save token for protected routes
        });

        test('UC1.6: Should fail login with wrong password', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'newuser@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });

        test('UC1.7: Should fail login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'ghost@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/users/profile (Protected Route)', () => {
        test('UC1.8: Should access profile with valid token', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('email', 'newuser@example.com');
            expect(res.body).toHaveProperty('id', userId);
        });

        test('UC1.9: Should deny access without token', async () => {
            const res = await request(app)
                .get('/api/users/profile');

            expect(res.statusCode).toBe(401);
        });

        test('UC1.9b: Should deny access with invalid token', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer invalid_token_string');

            expect(res.statusCode).toBe(401); // Or 500 depending on middleware
        });
    });
});
