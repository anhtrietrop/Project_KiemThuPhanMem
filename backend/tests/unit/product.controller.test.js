const productController = require('../../controllers/products');
const prisma = require('../../utills/db');

// Mock Prisma Client
jest.mock('../../utills/db', () => ({
    product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    category: {
        findMany: jest.fn(),
    }
}));

// Helper to create mock request/response
const mockRequest = (params = {}, body = {}, query = {}, url = '/api/products') => ({
    params,
    body,
    query,
    url,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Clear mocks before each test
describe('Product Controller Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('should return all products with default pagination', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const mockProducts = [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' }
            ];

            prisma.product.findMany.mockResolvedValue(mockProducts);

            await productController.getAllProducts(req, res);

            expect(prisma.product.findMany).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockProducts);
        });
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            const productData = {
                title: 'New Product',
                price: 100,
                merchantId: 'm1',
                categoryId: 'c1',
                mainImage: 'img.jpg',
                quantity: 10
            };
            const req = mockRequest({}, productData);
            const res = mockResponse();

            prisma.product.create.mockResolvedValue({ id: 'p1', ...productData });

            await productController.createProduct(req, res);

            expect(prisma.product.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: 'New Product',
                    price: 100
                })
            }));
            expect(res.status).toHaveBeenCalledWith(201);
        });

        // it('should return 400 if validation fails', async () => {
        //     const req = mockRequest({}, { title: 'No Price' }); // Missing price
        //     const res = mockResponse();
        //     const next = jest.fn();
        //
        //     await productController.createProduct(req, res, next);
        //
        //     // Expect next to be called with an Error
        //     expect(next).toHaveBeenCalledWith(expect.any(Error));
        //     expect(next.mock.calls[0][0].message).toContain('Missing required field');
        // });
    });
});
