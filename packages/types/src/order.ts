/**
 * Shared order types for MG Mart grocery application
 * 
 * This module defines client-side order types used across all frontend applications
 * for order placement, tracking, and management. These types represent the order
 * data structure as received from API responses.
 * 
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Address } from './user.js';

/**
 * Order status enumeration for tracking order lifecycle
 * Used for displaying order progress and status updates to users
 */
export type OrderStatus =
    | 'pending'      // Order placed, awaiting processing
    | 'processing'   // Order being prepared/packed
    | 'shipped'      // Order dispatched for delivery
    | 'delivered'    // Order successfully delivered
    | 'cancelled';   // Order cancelled by customer or admin

/**
 * Payment method enumeration for supported payment options
 * Used in checkout flow and order display
 */
export type PaymentMethod =
    | 'COD'          // Cash on Delivery
    | 'Online';      // Online payment (credit card, digital wallet, etc.)

/**
 * Individual item within an order
 * Contains product information snapshot at the time of order placement
 */
export interface OrderItem {
    /** Reference to the product ID */
    productId: string;
    /** Product name (snapshot at time of order) */
    name: string;
    /** Product price (snapshot at time of order) */
    price: number;
    /** Quantity ordered */
    quantity: number;
}

/**
 * Payment details for the order
 * Contains payment method and transaction information
 */
export interface PaymentDetails {
    /** Method used for payment */
    paymentMethod: PaymentMethod;
    /** Transaction ID for online payments (optional for COD) */
    transactionId?: string;
}

/**
 * Order data structure as received from API responses
 * Contains complete order information for display in client applications
 */
export interface Order {
    /** Unique identifier for the order */
    orderId: string;
    /** ID of the user who placed the order */
    userId: string;
    /** Array of items in the order */
    items: OrderItem[];
    /** Total amount for the order */
    totalAmount: number;
    /** Current status of the order */
    status: OrderStatus;
    /** Delivery address for the order */
    shippingAddress: Address;
    /** Payment information for the order */
    paymentDetails: PaymentDetails;
    /** Order creation timestamp as ISO string */
    createdAt: string;
    /** Last update timestamp as ISO string */
    updatedAt: string;
}

/**
 * Request payload for creating new orders
 * Contains all required information for order placement
 */
export interface CreateOrderRequest {
    /** Array of items to order */
    items: OrderItem[];
    /** Delivery address */
    shippingAddress: Address;
    /** Payment information */
    paymentDetails: PaymentDetails;
}

/**
 * Request payload for updating existing orders (admin only)
 * Typically used for status updates and payment confirmation
 */
export interface UpdateOrderRequest {
    /** Updated order status */
    status?: OrderStatus;
    /** Updated payment details (for payment confirmation) */
    paymentDetails?: PaymentDetails;
}

/**
 * Filter parameters for order listing and search
 * Used in order history and admin order management pages
 */
export interface OrderFilters {
    /** Filter by order status */
    status?: OrderStatus;
    /** Filter by user ID (admin only) */
    userId?: string;
    /** Filter by start date (ISO string) */
    startDate?: string;
    /** Filter by end date (ISO string) */
    endDate?: string;
}