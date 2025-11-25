const cartController = require('../../controllers/cart');
const prisma = require('../../prisma/prismaClient');
const { randomUUID } = require('crypto');

// Mock toàn bộ prisma client
jest.mock('../../prisma/prismaClient', () => ({
  cart: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  cartitem: { // Lưu ý: Prisma thường generate tên model là lowercase hoặc camelCase tùy schema
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  }, // Đôi khi là cartItem (camelCase), check lại schema.prisma của bạn nếu lỗi
  cartItem: { // Mock dự phòng cả 2 case
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
  },
}));

// Helper để tạo mock req, res
const mockRequest = (params = {}, body = {}, user = {}) => ({
  params,
  body,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Fix tên model cho đúng với code của bạn (trong code bạn dùng 'cartitem' viết thường)
const db = prisma;
// Trong code controller bạn dùng: prisma.cartitem (lowercase)
// Nên ta sẽ spy vào db.cartitem

describe('Cart Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case cho getCart
   */
  describe('getCart', () => {
    it('should return existing cart with total calculation', async () => {
      const req = mockRequest({ userId: 'user-123' });
      const res = mockResponse();

      // Giả lập DB trả về cart có item
      const mockCart = {
        id: 'cart-1',
        userId: 'user-123',
        cartitem: [
          {
            quantity: 2,
            product: { price: 100000, title: 'Product A', id: 'p1' }
          }
        ]
      };

      db.cart.findUnique.mockResolvedValue(mockCart);

      await cartController.getCart(req, res);

      // Assert logic tính toán
      expect(res.json).toHaveBeenCalledWith({
        items: mockCart.cartitem,
        total: 200000 // 2 * 100000
      });
    });

    it('should create new cart if not found', async () => {
      const req = mockRequest({ userId: 'user-new' });
      const res = mockResponse();

      db.cart.findUnique.mockResolvedValue(null); // Không tìm thấy
      db.cart.create.mockResolvedValue({
        id: 'new-cart',
        userId: 'user-new',
        cartitem: []
      });

      await cartController.getCart(req, res);

      expect(db.cart.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        items: [],
        total: 0
      });
    });

    it('should handle errors (500)', async () => {
      const req = mockRequest({ userId: 'user-error' });
      const res = mockResponse();

      // Giả lập lỗi DB -> Cover dòng catch(error)
      db.cart.findUnique.mockRejectedValue(new Error('DB Connection Failed'));

      await cartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Lỗi khi lấy giỏ hàng'
      }));
    });
  });

  /**
   * Test Case cho addToCart (Logic phức tạp nhất)
   */
  describe('addToCart', () => {
    it('should return 404 if product not found', async () => {
      const req = mockRequest({ userId: 'u1' }, { productId: 'p-not-found', quantity: 1 });
      const res = mockResponse();

      db.product.findUnique.mockResolvedValue(null);

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if out of stock', async () => {
      const req = mockRequest({ userId: 'u1' }, { productId: 'p1', quantity: 10 });
      const res = mockResponse();

      db.product.findUnique.mockResolvedValue({ id: 'p1', quantity: 5 }); // Stock < Request

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Not enough stock available'
      }));
    });

    it('should create new cartItem if product not in cart', async () => {
      const req = mockRequest({ userId: 'u1' }, { productId: 'p1', quantity: 1 });
      const res = mockResponse();

      // Mock Product OK
      db.product.findUnique.mockResolvedValue({ id: 'p1', quantity: 100 });
      // Mock Cart Exists
      db.cart.findUnique.mockResolvedValue({ id: 'c1' });
      // Mock Item Not In Cart
      db.cartitem.findUnique.mockResolvedValue(null);
      // Mock Create Item
      db.cartitem.create.mockResolvedValue({
        id: 'item-new',
        productId: 'p1',
        quantity: 1,
        product: { title: 'Test' }
      });

      await cartController.addToCart(req, res);

      expect(db.cartitem.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should update quantity if product already in cart', async () => {
      const req = mockRequest({ userId: 'u1' }, { productId: 'p1', quantity: 2 });
      const res = mockResponse();

      db.product.findUnique.mockResolvedValue({ id: 'p1', quantity: 10 });
      db.cart.findUnique.mockResolvedValue({ id: 'c1' });

      // Item đã có 1 cái
      db.cartitem.findUnique.mockResolvedValue({ id: 'item-1', quantity: 1 });

      // Mock Update
      db.cartitem.update.mockResolvedValue({
        id: 'item-1',
        productId: 'p1',
        quantity: 3, // 1 + 2
        product: { title: 'Test' }
      });

      await cartController.addToCart(req, res);

      expect(db.cartitem.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle DB error in addToCart', async () => {
      const req = mockRequest({ userId: 'u1' }, { productId: 'p1' });
      const res = mockResponse();
      db.product.findUnique.mockRejectedValue(new Error('Crash'));

      await cartController.addToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  /**
   * Test Case cho updateCartItem
   */
  describe('updateCartItem', () => {
    it('should return 400 if quantity <= 0', async () => {
      const req = mockRequest({ userId: 'u1', productId: 'p1' }, { quantity: 0 });
      const res = mockResponse();
      await cartController.updateCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if cart not found', async () => {
      const req = mockRequest({ userId: 'u1' }, { quantity: 1 });
      const res = mockResponse();
      db.cart.findUnique.mockResolvedValue(null);
      await cartController.updateCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 if item not in cart', async () => {
      const req = mockRequest({ userId: 'u1', productId: 'p1' }, { quantity: 1 });
      const res = mockResponse();
      db.cart.findUnique.mockResolvedValue({ id: 'c1' });
      db.cartitem.findUnique.mockResolvedValue(null);
      await cartController.updateCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if not enough stock during update', async () => {
      const req = mockRequest({ userId: 'u1' }, { quantity: 100 });
      const res = mockResponse();

      db.cart.findUnique.mockResolvedValue({ id: 'c1' });
      db.cartitem.findUnique.mockResolvedValue({
        product: { quantity: 50 } // Stock 50 < Request 100
      });

      await cartController.updateCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should update successfully', async () => {
      const req = mockRequest({ userId: 'u1' }, { quantity: 5 });
      const res = mockResponse();

      db.cart.findUnique.mockResolvedValue({ id: 'c1' });
      db.cartitem.findUnique.mockResolvedValue({
        id: 'item-1',
        product: { quantity: 100 }
      });
      db.cartitem.update.mockResolvedValue({ id: 'item-1', quantity: 5 });

      await cartController.updateCartItem(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });
  });

  /**
   * Test Case cho removeFromCart
   */
  describe('removeFromCart', () => {
    it('should handle removing item successfully', async () => {
      const req = mockRequest({ userId: 'u1', productId: 'p1' });
      const res = mockResponse();

      db.cart.findUnique.mockResolvedValue({ id: 'c1' });
      db.cartitem.deleteMany.mockResolvedValue({ count: 1 });

      await cartController.removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('should return 404 if item was not in cart', async () => {
      const req = mockRequest({ userId: 'u1', productId: 'p1' });
      const res = mockResponse();

      db.cart.findUnique.mockResolvedValue({ id: 'c1' });
      db.cartitem.deleteMany.mockResolvedValue({ count: 0 }); // Không xóa được cái nào

      await cartController.removeFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  /**
   * Test Case cho syncCart
   */
  describe('syncCart', () => {
    it('should sync local items to database', async () => {
      const req = mockRequest(
        { userId: 'u1' },
        { localCartItems: [{ id: 'p1', amount: 2 }] }
      );
      const res = mockResponse();

      // Mock Cart
      db.cart.findUnique
        .mockResolvedValueOnce({ id: 'c1' }) // Lần gọi đầu tìm cart
        .mockResolvedValueOnce({ // Lần gọi cuối return kết quả
          id: 'c1',
          cartitem: [{ quantity: 2, product: { price: 100, quantity: 10 } }]
        });

      // Mock Product exists
      db.product.findUnique.mockResolvedValue({ id: 'p1', quantity: 10 });
      // Mock Item not in db yet
      db.cartitem.findUnique.mockResolvedValue(null);

      await cartController.syncCart(req, res);

      expect(db.cartitem.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('should handle invalid input', async () => {
      const req = mockRequest({ userId: 'u1' }, {}); // Thiếu localCartItems
      const res = mockResponse();
      await cartController.syncCart(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should skip items if product not found during sync', async () => {
      const req = mockRequest(
        { userId: 'u1' },
        { localCartItems: [{ id: 'p-missing', amount: 1 }] }
      );
      const res = mockResponse();

      // Mock Cart (find twice)
      db.cart.findUnique
        .mockResolvedValueOnce({ id: 'c1' })
        .mockResolvedValueOnce({
          id: 'c1',
          cartitem: []
        });

      // Mock Product NOT found
      db.product.findUnique.mockResolvedValue(null);

      await cartController.syncCart(req, res);

      // Expect cartitem.create/update NOT called
      expect(db.cartitem.create).not.toHaveBeenCalled();
      expect(db.cartitem.update).not.toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Đồng bộ giỏ hàng thành công'
      }));
    });
  });
});