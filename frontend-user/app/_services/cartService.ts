const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';
const API_URL = `${API_BASE_URL}/api`;

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    mainImage: string;
    quantity: number;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data?: {
    cart: Cart;
    total: number;
    allQuantity: number;
  };
  error?: string;
}

export interface ProductInCart {
  id: string;
  title: string;
  price: number;
  image: string;
  amount: number;
  quantity: number;
}

class CartService {
  // Lấy giỏ hàng của user
  async getCart(userId: string): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItem(userId: string, productId: string, quantity: number): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}/item/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(userId: string, productId: string): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}/item/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Xóa toàn bộ giỏ hàng
  async clearCart(userId: string): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Đồng bộ giỏ hàng từ localStorage lên database
  async syncCart(userId: string, localCartItems: ProductInCart[]): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localCartItems
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Chuyển đổi từ Cart API response sang ProductInCart format cho Zustand
  convertCartToProducts(cart: Cart): ProductInCart[] {
    return cart.items.map(item => ({
      id: item.product.id,
      title: item.product.title,
      price: item.product.price,
      image: item.product.mainImage,
      amount: item.quantity,
      quantity: item.product.quantity // Số lượng tồn kho
    }));
  }
}

export const cartService = new CartService();
