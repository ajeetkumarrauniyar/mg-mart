/**
 * Shared cart types for MG Mart grocery application
 * 
 * Cart is user-specific and supports fast operations with
 * optimistic updates. Stock validation happens at checkout.
 * 
 * @author MG Mart Development Team
 * @version 2.0.0
 */

/**
 * Cart item with product snapshot
 * 
 * Price is captured at add time for comparison during checkout
 */
export interface CartItem {
    /** Reference to product ID */
    productId: string;
    
    /** ERP SKU for quick reference */
    sku: string;
    
    /** Product name (cached for display) */
    name: string;
    
    /** Product image URL (cached) */
    imageUrl: string;
    
    /** Product unit (cached) */
    unit: string;
    
    /** Quantity in cart */
    quantity: number;
    
    /** Selling price when added to cart */
    priceAtAdd: number;
    
    /** Current selling price (updated on cart fetch) */
    currentPrice: number;
    
    /** Timestamp when added (ISO string) */
    addedAt: string;
    
    /** Last update timestamp (ISO string) */
    updatedAt: string;
}

/**
 * Cart item with validation info (returned from cart fetch)
 */
export interface CartItemWithValidation extends CartItem {
    /** Line item subtotal (quantity * currentPrice) */
    subtotal: number;
    
    /** Validation status */
    validation: {
        /** Product is still available */
        isAvailable: boolean;
        
        /** Stock issue detected */
        hasStockIssue: boolean;
        
        /** Price changed since added */
        hasPriceChange: boolean;
        
        /** Available quantity in stock */
        availableQty: number;
        
        /** Validation message if any */
        message?: string;
    };
}

/**
 * Complete cart data structure
 * 
 * Firestore Collection: carts/{userId}
 */
export interface Cart {
    /** User ID (same as document ID) */
    userId: string;
    
    /** Cart items */
    items: CartItem[];
    
    /** Total number of distinct items */
    itemCount: number;
    
    /** Sum of all quantities */
    totalQty: number;
    
    /** Subtotal (sum of sellingPrice * qty) */
    subtotal: number;
    
    /** Cart creation timestamp */
    createdAt: string;
    
    /** Last update timestamp */
    updatedAt: string;
    
    /** Last activity timestamp (for abandonment tracking) */
    lastActivityAt: string;
}

/**
 * Cart response with validation (returned from API)
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
 * Request payload for adding items to cart
 */
export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

/**
 * Request payload for updating cart item
 */
export interface UpdateCartItemRequest {
    quantity: number;
}

/**
 * Cart validation request (pre-checkout)
 */
export interface ValidateCartRequest {
    deliveryAddress: {
        coordinates: {
            latitude: number;
            longitude: number;
        };
        pincode: string;
    };
}

/**
 * Cart validation response (pre-checkout)
 */
export interface ValidateCartResponse {
    isValid: boolean;
    cart: CartResponse;
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
