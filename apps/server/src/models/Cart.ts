/**
 * Cart model for MG Mart
 * 
 * Cart is user-specific with optimistic updates.
 * Stock validation happens at checkout, not at cart add.
 */

import { Timestamp } from "firebase-admin/firestore";

/**
 * Cart item stored in Firestore
 */
export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  imageUrl: string;
  unit: string;
  quantity: number;
  priceAtAdd: number;         // Price when added
  currentPrice: number;       // Latest price (updated on fetch)
  addedAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Cart document in Firestore
 * Collection: carts/{userId}
 */
export interface Cart {
  userId: string;
  items: CartItem[];
  itemCount: number;
  totalQty: number;
  subtotal: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivityAt: Timestamp;
}

/**
 * Cart item with validation info (for API response)
 */
export interface CartItemWithValidation {
  productId: string;
  sku: string;
  name: string;
  imageUrl: string;
  unit: string;
  quantity: number;
  priceAtAdd: number;
  currentPrice: number;
  subtotal: number;
  addedAt: string;
  updatedAt: string;
  validation: {
    isAvailable: boolean;
    hasStockIssue: boolean;
    hasPriceChange: boolean;
    availableQty: number;
    message?: string;
  };
}

/**
 * Cart validation issue
 */
export interface CartValidationIssue {
  productId: string;
  productName: string;
  type: 'out_of_stock' | 'insufficient_stock' | 'price_changed' | 'product_unavailable';
  message: string;
  suggestedQty?: number;
  priceDifference?: number;
}

/**
 * Cart response (API)
 */
export interface CartResponse {
  items: CartItemWithValidation[];
  summary: {
    itemCount: number;
    totalQty: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  validation: {
    isValid: boolean;
    issues: CartValidationIssue[];
  };
}

/**
 * Add to cart input
 */
export interface AddToCartInput {
  productId: string;
  quantity: number;
}

/**
 * Update cart item input
 */
export interface UpdateCartItemInput {
  quantity: number;
}
