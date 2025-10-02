import { api } from "./api";
import type { Cart, CartItem } from "@mg-mart/types";

// Cart request types
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  productId: string;
}

export interface CartResponse {
  cart: Cart;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

// Cart service
export const cartService = {
  // Get current user's cart
  getCart: async (): Promise<Cart> => {
    const response = await api.get<CartResponse>("/cart");
    return response.cart;
  },

  // Add item to cart
  addToCart: async (item: AddToCartRequest): Promise<Cart> => {
    const response = await api.post<CartResponse>("/cart/add", item);
    return response.cart;
  },

  // Update cart item quantity
  updateCartItem: async (update: UpdateCartItemRequest): Promise<Cart> => {
    const response = await api.put<CartResponse>("/cart/update", update);
    return response.cart;
  },

  // Remove item from cart
  removeFromCart: async (item: RemoveFromCartRequest): Promise<Cart> => {
    const response = await api.delete<CartResponse>(
      `/cart/remove/${item.productId}`
    );
    return response.cart;
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    await api.delete("/cart/clear");
  },

  //TODO: Get cart summary (totals, counts, etc.)
  getCartSummary: async (): Promise<CartSummary> => {
    return await api.get<CartSummary>("/cart/summary");
  },

  //TODO: Sync local cart with server (useful after login)
  syncCart: async (localCartItems: CartItem[]): Promise<Cart> => {
    const response = await api.post<CartResponse>("/cart/sync", {
      items: localCartItems,
    });
    return response.cart;
  },

  //TODO: Validate cart items (check availability, prices, etc.)
  validateCart: async (): Promise<{
    valid: boolean;
    issues: Array<{
      productId: string;
      issue: "out_of_stock" | "price_changed" | "not_available";
      message: string;
    }>;
  }> => {
    return await api.get("/cart/validate");
  },

  //TODO: Apply coupon/discount code
  applyCoupon: async (couponCode: string): Promise<Cart> => {
    const response = await api.post<CartResponse>("/cart/coupon", {
      code: couponCode,
    });
    return response.cart;
  },

  //TODO: Remove applied coupon
  removeCoupon: async (): Promise<Cart> => {
    const response = await api.delete<CartResponse>("/cart/coupon");
    return response.cart;
  },

  //TODO: Estimate shipping for cart
  estimateShipping: async (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<{
    options: Array<{
      id: string;
      name: string;
      cost: number;
      estimatedDays: number;
    }>;
  }> => {
    return await api.post("/cart/shipping-estimate", { address });
  },
};

export default cartService;
