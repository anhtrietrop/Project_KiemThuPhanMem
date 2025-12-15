import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartService } from "../_services/cartService";

export type ProductInCart = {
  id: string;
  title: string;
  price: number;
  image: string;
  mainImage?: string;
  amount: number;
  quantity: number;
};

export type State = {
  products: ProductInCart[];
  allQuantity: number;
  total: number;
  isLoggedIn: boolean;
  userId: string | null;
  isLoading: boolean;
};

export type Actions = {
  addToCart: (newProduct: ProductInCart) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartAmount: (id: string, quantity: number) => Promise<void>;
  calculateTotals: () => void;
  clearCart: () => Promise<void>;
  setUser: (userId: string | null) => Promise<void>;
  syncCartOnLogin: (userId: string) => Promise<void>;
  loadCartFromAPI: (userId: string) => Promise<void>;
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      products: [],
      allQuantity: 0,
      total: 0,
      isLoggedIn: false,
      userId: null,
      isLoading: false,

      // Thiết lập user (gọi khi đăng nhập/đăng xuất)
      setUser: async (userId: string | null) => {
        set({ isLoggedIn: !!userId, userId, isLoading: true });

        if (userId) {
          // User đăng nhập - load giỏ hàng từ API
          await get().loadCartFromAPI(userId);
        } else {
          // User đăng xuất - giữ giỏ hàng local
          set({ isLoading: false });
        }
      },

      // Load giỏ hàng từ API (cho user đã đăng nhập)
      loadCartFromAPI: async (userId: string) => {
        try {
          set({ isLoading: true });
          const response = await cartService.getCart(userId);

          if (response.success && response.data) {
            const products = cartService.convertCartToProducts(response.data.cart);
            set({
              products,
              allQuantity: response.data.allQuantity,
              total: response.data.total,
              isLoading: false
            });
          } else {
            console.error('Failed to load cart:', response.error);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          set({ isLoading: false });
        }
      },

      // Đồng bộ giỏ hàng khi đăng nhập
      syncCartOnLogin: async (userId: string) => {
        try {
          set({ isLoading: true });
          const currentProducts = get().products;

          if (currentProducts.length > 0) {
            // Có sản phẩm trong localStorage, đồng bộ lên server
            const response = await cartService.syncCart(userId, currentProducts);

            if (response.success && response.data) {
              const products = cartService.convertCartToProducts(response.data.cart);
              set({
                products,
                allQuantity: response.data.allQuantity,
                total: response.data.total,
                isLoggedIn: true,
                userId,
                isLoading: false
              });
            } else {
              console.error('Failed to sync cart:', response.error);
              set({ isLoggedIn: true, userId, isLoading: false });
            }
          } else {
            // Không có sản phẩm local, load từ server
            await get().loadCartFromAPI(userId);
            set({ isLoggedIn: true, userId });
          }
        } catch (error) {
          console.error('Error syncing cart:', error);
          set({ isLoggedIn: true, userId, isLoading: false });
        }
      },

      addToCart: async (newProduct: ProductInCart) => {
        const { isLoggedIn, userId } = get();

        if (isLoggedIn && userId) {
          // User đã đăng nhập - gọi API
          try {
            set({ isLoading: true });
            const response = await cartService.addToCart(userId, newProduct.id, newProduct.amount);

            if (response.success) {
              // Reload cart từ server để đảm bảo đồng bộ
              await get().loadCartFromAPI(userId);
            } else {
              console.error('Failed to add to cart:', response.error);
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Error adding to cart:', error);
            set({ isLoading: false });
          }
        } else {
          // User chưa đăng nhập - lưu local
          set((state) => {
            const cartItem = state.products.find(
              (item) => item.id === newProduct.id
            );
            if (!cartItem) {
              return { products: [...state.products, newProduct] };
            } else {
              const updatedProducts = state.products.map((product) => {
                if (product.id === cartItem.id) {
                  return { ...product, amount: product.amount + newProduct.amount };
                }
                return product;
              });
              return { products: updatedProducts };
            }
          });
          get().calculateTotals();
        }
      },

      removeFromCart: async (id: string) => {
        const { isLoggedIn, userId } = get();

        if (isLoggedIn && userId) {
          // User đã đăng nhập - gọi API
          try {
            set({ isLoading: true });
            const response = await cartService.removeFromCart(userId, id);

            if (response.success) {
              // Reload cart từ server
              await get().loadCartFromAPI(userId);
            } else {
              console.error('Failed to remove from cart:', response.error);
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Error removing from cart:', error);
            set({ isLoading: false });
          }
        } else {
          // User chưa đăng nhập - xử lý local
          set((state) => {
            const filteredProducts = state.products.filter(
              (product: ProductInCart) => product.id !== id
            );
            return { products: filteredProducts };
          });
          get().calculateTotals();
        }
      },

      updateCartAmount: async (id: string, amount: number) => {
        const { isLoggedIn, userId } = get();

        if (isLoggedIn && userId) {
          // User đã đăng nhập - gọi API
          try {
            set({ isLoading: true });
            const response = await cartService.updateCartItem(userId, id, amount);

            if (response.success) {
              // Reload cart từ server
              await get().loadCartFromAPI(userId);
            } else {
              console.error('Failed to update cart:', response.error);
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Error updating cart:', error);
            set({ isLoading: false });
          }
        } else {
          // User chưa đăng nhập - xử lý local
          set((state) => {
            const updatedProducts = state.products.map((product) => {
              if (product.id === id) {
                return { ...product, amount };
              }
              return product;
            });
            return { products: updatedProducts };
          });
          get().calculateTotals();
        }
      },

      clearCart: async () => {
        const { isLoggedIn, userId } = get();

        if (isLoggedIn && userId) {
          // User đã đăng nhập - gọi API
          try {
            set({ isLoading: true });
            const response = await cartService.clearCart(userId);

            if (response.success) {
              set({
                products: [],
                allQuantity: 0,
                total: 0,
                isLoading: false
              });
            } else {
              console.error('Failed to clear cart:', response.error);
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Error clearing cart:', error);
            set({ isLoading: false });
          }
        } else {
          // User chưa đăng nhập - xóa local
          set({
            products: [],
            allQuantity: 0,
            total: 0,
          });
        }
      },

      calculateTotals: () => {
        set((state) => {
          let amount = 0;
          let total = 0;
          state.products.forEach((item) => {
            amount += item.amount;
            total += item.amount * item.price;
          });

          return {
            allQuantity: amount,
            total: total,
          };
        });
      },
    }),
    {
      name: "products-storage",
      storage: createJSONStorage(() => localStorage), // Đổi từ sessionStorage sang localStorage
      // Chỉ persist các field cần thiết cho user chưa đăng nhập
      partialize: (state) => ({
        products: state.isLoggedIn ? [] : state.products, // Chỉ lưu products khi chưa đăng nhập
        allQuantity: state.isLoggedIn ? 0 : state.allQuantity,
        total: state.isLoggedIn ? 0 : state.total,
      }),
    }
  )
);
