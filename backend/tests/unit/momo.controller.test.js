const request = require('supertest');
const axios = require('axios');

// Mock axios
jest.mock('axios');

// Mock Prisma - must match the path used in controllers
const mockPrisma = {
    momopayment: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn()
    },
    customer_order: {
        findUnique: jest.fn(),
        update: jest.fn()
    }
};

jest.mock('../../utills/db', () => mockPrisma);

// Import app after mocking
const app = require('../../app');

describe('Momo Payment Controller Unit Tests', () => {
    const testOrder = {
        id: 'order-123',
        total: 50000,
        email: 'test@example.com',
        status: 'PENDING'
    };

    const testPayment = {
        id: 'payment-123',
        orderId: 'order-123',
        requestId: 'req-123',
        amount: 50000,
        resultCode: -1
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/payments/momo/create', () => {
        it('should create payment request successfully', async () => {
            // Mock DB responses
            mockPrisma.customer_order.findUnique.mockResolvedValue(testOrder);
            mockPrisma.momopayment.findFirst.mockResolvedValue(null); // No existing payment
            mockPrisma.momopayment.create.mockResolvedValue(testPayment);
            mockPrisma.momopayment.update.mockResolvedValue({ ...testPayment, payUrl: 'http://momo.url' });

            // Mock Axios response
            axios.post.mockResolvedValue({
                data: {
                    resultCode: 0,
                    payUrl: 'http://momo.url',
                    deeplink: 'momo://pay',
                    qrCodeUrl: 'http://qr.url',
                    message: 'Success'
                }
            });

            const res = await request(app)
                .post('/api/payments/momo/create')
                .send({
                    orderId: 'order-123',
                    amount: 50000,
                    orderInfo: 'Test Payment'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.payUrl).toBe('http://momo.url');
            expect(mockPrisma.momopayment.create).toHaveBeenCalled();
        });

        it('should return 404 if order not found', async () => {
            mockPrisma.customer_order.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/payments/momo/create')
                .send({
                    orderId: 'non-existent',
                    amount: 50000,
                    orderInfo: 'Test'
                });

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/payments/momo/status/:orderId', () => {
        it('should return payment status from local DB', async () => {
            mockPrisma.momopayment.findFirst.mockResolvedValue({
                ...testPayment,
                resultCode: 0,
                message: 'Success',
                transId: 'trans-123'
            });

            const res = await request(app)
                .get('/api/payments/momo/status/order-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('SUCCESS');
        });

        it('should return 404 if payment not found', async () => {
            mockPrisma.momopayment.findFirst.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/payments/momo/status/order-123');

            expect(res.status).toBe(404);
        });
    });
});
