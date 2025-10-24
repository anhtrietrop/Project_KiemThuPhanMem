const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                mainImage: true,
                quantity: true
              }
            }
          }
        }
      }
    });

    // Nếu chưa có cart thì tạo mới
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  mainImage: true,
                  quantity: true
                }
              }
            }
          }
        }
      });
    }

    // Tính tổng tiền và số lượng
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const allQuantity = cart.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        cart,
        total,
        allQuantity
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy giỏ hàng',
      error: error.message
    });
  }
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    // Kiểm tra số lượng tồn kho
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng sản phẩm không đủ'
      });
    }

    // Tìm hoặc tạo cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Kiểm tra sản phẩm đã có trong cart chưa
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      }
    });

    let cartItem;
    if (existingItem) {
      // Cập nhật số lượng
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng sản phẩm không đủ'
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              mainImage: true,
              quantity: true
            }
          }
        }
      });
    } else {
      // Tạo mới cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              mainImage: true,
              quantity: true
            }
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
      data: cartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm sản phẩm vào giỏ hàng',
      error: error.message
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0'
      });
    }

    // Tìm cart của user
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }

    // Kiểm tra sản phẩm có trong cart không
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không có trong giỏ hàng'
      });
    }

    // Kiểm tra số lượng tồn kho
    if (cartItem.product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng sản phẩm không đủ'
      });
    }

    // Cập nhật số lượng
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            mainImage: true,
            quantity: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Cập nhật số lượng thành công',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật số lượng',
      error: error.message
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Tìm cart của user
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }

    // Xóa sản phẩm khỏi cart
    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: productId
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không có trong giỏ hàng'
      });
    }

    res.json({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng',
      error: error.message
    });
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm cart của user
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }

    // Xóa tất cả items trong cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    res.json({
      success: true,
      message: 'Xóa toàn bộ giỏ hàng thành công'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa giỏ hàng',
      error: error.message
    });
  }
};

// Đồng bộ giỏ hàng từ localStorage lên database khi user đăng nhập
const syncCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { localCartItems } = req.body; // Array of items from localStorage

    if (!localCartItems || !Array.isArray(localCartItems)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu giỏ hàng không hợp lệ'
      });
    }

    // Tìm hoặc tạo cart cho user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    }

    // Đồng bộ từng item từ localStorage
    for (const localItem of localCartItems) {
      const { id: productId, amount: quantity } = localItem;

      // Kiểm tra sản phẩm có tồn tại không
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        console.log(`Product ${productId} not found, skipping...`);
        continue;
      }

      // Kiểm tra item đã có trong database cart chưa
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId
          }
        }
      });

      if (existingItem) {
        // Cộng dồn số lượng (localStorage + database)
        const newQuantity = existingItem.quantity + quantity;

        // Kiểm tra tồn kho
        if (product.quantity >= newQuantity) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity }
          });
        } else {
          // Nếu không đủ tồn kho, lấy max có thể
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: product.quantity }
          });
        }
      } else {
        // Tạo mới cart item
        const finalQuantity = Math.min(quantity, product.quantity);
        if (finalQuantity > 0) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: productId,
              quantity: finalQuantity
            }
          });
        }
      }
    }

    // Lấy lại cart sau khi đồng bộ
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                mainImage: true,
                quantity: true
              }
            }
          }
        }
      }
    });

    // Tính tổng tiền và số lượng
    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const allQuantity = updatedCart.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    res.json({
      success: true,
      message: 'Đồng bộ giỏ hàng thành công',
      data: {
        cart: updatedCart,
        total,
        allQuantity
      }
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đồng bộ giỏ hàng',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};
