/**
 * Cart model for MG Mart grocery application
 * 
 * Extended with price tracking for checkout validation.
 * Cart uses subcollection under users for efficient access.
 * 
 * @author MG Mart Development Team
 * @version 2.0.0
 */

import { Timestamp } from "firebase-admin/firestore";

/**
 * Cart item stored in Firestore subcollection
 * Extended with price tracking fields
 */
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Timestamp;
  // NEW: Price tracking for checkout validation
  priceAtAdd?: number;             // Price when item was added
  sku?: string;                    // Product SKU for quick reference
}

/**
 * Cart item with product details (for API responses)
 */
export interface CartItemWithProduct {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  addedAt: Timestamp;
  // NEW: Price comparison fields
  priceAtAdd?: number;
  currentPrice?: number;
  sku?: string;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartItemResponse {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  addedAt: string;
  // NEW: Validation fields
  sku?: string;
  priceAtAdd?: number;
  currentPrice?: number;
  priceChanged?: boolean;
  subtotal?: number;
}

/**
 * Cart response (original format maintained)
 */
export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
}

/**
 * NEW: Enhanced cart response with validation
 */
export interface CartResponseWithValidation {
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
 * NEW: Cart item with validation info
 */
export interface CartItemWithValidation {
  productId: string;
  sku?: string;
  name: string;
  imageUrl: string;
  unit: string;
  quantity: number;
  price: number;
  priceAtAdd?: number;
  subtotal: number;
  addedAt: string;
  validation: {
    isAvailable: boolean;
    hasStockIssue: boolean;
    hasPriceChange: boolean;
    availableQty: number;
    message?: string;
  };
}

/**
 * NEW: Cart validation issue
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
 * NEW: Checkout validation request
 */
export interface ValidateCartForCheckoutRequest {
  deliveryAddress: {
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    pincode: string;
  };
}

/**
 * NEW: Checkout validation response
 */
export interface ValidateCartForCheckoutResponse {
  isValid: boolean;
  cart: CartResponseWithValidation;
  delivery: {
    isServiceable: boolean;
    distance?: number;
    estimatedTime?: string;
    deliveryFee: number;
    message?: string;
  };
  pricing: {
    subtotal: number;
    deliveryFee: number;
    packagingFee: number;
    discount: number;
    total: number;
  };
  issues: CartValidationIssue[];
}
