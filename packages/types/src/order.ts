/**
 * Shared order types for MG Mart grocery application
 * 
 * Orders are prepared for ERP sync. Stock is validated at checkout
 * but never modified by the app (ERP controls inventory).
 * 
 * @author MG Mart Development Team
 * @version 2.0.0
 */

import { Address } from './user.js';

/**
 * Order status for tracking order lifecycle
 */
export type OrderStatus =
    | 'pending'           // Order placed, awaiting confirmation
    | 'confirmed'         // Order confirmed by store
    | 'processing'        // Order being packed
    | 'ready'             // Ready for dispatch
    | 'out_for_delivery'  // With delivery person
    | 'delivered'         // Successfully delivered
    | 'cancelled'         // Cancelled
    | 'failed';           // System error

/**
 * Payment method options
 */
export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'WALLET' | 'NETBANKING';

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * ERP sync status for order
 */
export type ERPSyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'manual';

/**
 * Notification type for order updates
 */
export type OrderNotificationType =
    | 'order_placed'
    | 'order_confirmed'
    | 'order_processing'
    | 'order_ready'
    | 'order_out_for_delivery'
    | 'order_delivered'
    | 'order_cancelled';

/**
 * Individual item in an order (snapshot at order time)
 */
export interface OrderItem {
    /** Product ID reference */
    productId: string;
    
    /** ERP SKU */
    sku: string;
    
    /** Product name (snapshot) */
    name: string;
    
    /** Product image URL (snapshot) */
    imageUrl: string;
    
    /** Product unit */
    unit: string;
    
    /** Quantity ordered */
    quantity: number;
    
    /** Unit price at order time */
    unitPrice: number;
    
    /** Line item total (quantity * unitPrice) */
    totalPrice: number;
    
    /** ERP item code (for sync) */
    erpItemCode?: string;
}

/**
 * Delivery address for order
 */
export interface DeliveryAddress {
    /** Reference to saved address (optional) */
    addressId?: string;
    
    /** Recipient full name */
    fullName: string;
    
    /** Contact phone */
    phone: string;
    
    /** Address line 1 */
    addressLine1: string;
    
    /** Address line 2 (optional) */
    addressLine2?: string;
    
    /** Landmark */
    landmark?: string;
    
    /** City */
    city: string;
    
    /** State */
    state: string;
    
    /** Pincode */
    pincode: string;
    
    /** GPS coordinates */
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

/**
 * Delivery slot selection
 */
export interface DeliverySlot {
    /** Slot ID */
    id: string;
    
    /** Date in YYYY-MM-DD format */
    date: string;
    
    /** Start time HH:mm */
    startTime: string;
    
    /** End time HH:mm */
    endTime: string;
    
    /** Display label (e.g., "10 AM - 12 PM") */
    label: string;
}

/**
 * Payment details for order
 */
export interface PaymentDetails {
    /** Payment method used */
    paymentMethod: PaymentMethod;
    
    /** Payment status */
    paymentStatus: PaymentStatus;
    
    /** Transaction ID for online payments */
    transactionId?: string;
    
    /** Payment gateway name */
    paymentGateway?: string;
    
    /** Payment timestamp */
    paidAt?: string;
    
    /** Refund timestamp (if refunded) */
    refundedAt?: string;
    
    /** Refund amount */
    refundAmount?: number;
}

/**
 * Status history entry for audit trail
 */
export interface StatusHistoryEntry {
    /** New status */
    status: OrderStatus;
    
    /** Timestamp of change */
    timestamp: string;
    
    /** User who made the change (userId or 'system') */
    updatedBy: string;
    
    /** Optional note */
    note?: string;
}

/**
 * Notification log entry
 */
export interface NotificationLogEntry {
    /** Notification type */
    type: OrderNotificationType;
    
    /** Sent timestamp */
    sentAt: string;
    
    /** Whether notification was successful */
    success: boolean;
    
    /** Error message if failed */
    error?: string;
}

/**
 * Complete Order data structure
 * 
 * Firestore Collection: orders/{orderId}
 */
export interface Order {
    /** Unique order ID (Firestore doc ID) */
    orderId: string;
    
    /** Human-readable order number (e.g., "MG-20260115-0001") */
    orderNumber: string;
    
    // Customer info
    /** User ID who placed the order */
    userId: string;
    
    /** Customer name */
    customerName: string;
    
    /** Customer phone */
    customerPhone: string;
    
    /** Customer email (optional) */
    customerEmail?: string;
    
    // Order items (snapshot)
    /** Array of order items */
    items: OrderItem[];
    
    // Pricing
    /** Subtotal (sum of item totals) */
    subtotal: number;
    
    /** Delivery fee */
    deliveryFee: number;
    
    /** Packaging fee (if any) */
    packagingFee?: number;
    
    /** Discount amount */
    discount?: number;
    
    /** Coupon code used */
    couponCode?: string;
    
    /** Final total amount */
    totalAmount: number;
    
    // Delivery
    /** Delivery address */
    deliveryAddress: DeliveryAddress;
    
    /** Selected delivery slot */
    deliverySlot?: DeliverySlot;
    
    /** Delivery instructions */
    deliveryInstructions?: string;
    
    /** Distance from store (km) */
    deliveryDistance?: number;
    
    // Payment
    /** Payment details */
    paymentDetails: PaymentDetails;
    
    // Order lifecycle
    /** Current order status */
    status: OrderStatus;
    
    /** Status change history */
    statusHistory: StatusHistoryEntry[];
    
    // ERP Sync
    /** ERP sync status */
    erpSyncStatus: ERPSyncStatus;
    
    /** ERP order/invoice ID after sync */
    erpOrderId?: string;
    
    /** ERP invoice number */
    erpInvoiceNumber?: string;
    
    /** Number of sync attempts */
    erpSyncAttempts: number;
    
    /** Last sync attempt timestamp */
    erpLastSyncAt?: string;
    
    /** Last sync error message */
    erpSyncError?: string;
    
    // Notifications
    /** Customer's FCM token for notifications */
    fcmToken?: string;
    
    /** Notification history */
    notificationsSent: NotificationLogEntry[];
    
    // Idempotency
    /** Client-generated key for duplicate prevention */
    idempotencyKey?: string;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
    confirmedAt?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
}

/**
 * Order list item (reduced payload for listings)
 */
export interface OrderListItem {
    orderId: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    itemCount: number;
    createdAt: string;
    deliveryAddress: {
        city: string;
        pincode: string;
    };
}

/**
 * Request payload for creating new orders
 */
export interface CreateOrderRequest {
    /** Delivery address */
    deliveryAddress: DeliveryAddress;
    
    /** Selected delivery slot (optional) */
    deliverySlot?: DeliverySlot;
    
    /** Delivery instructions */
    deliveryInstructions?: string;
    
    /** Payment method */
    paymentMethod: PaymentMethod;
    
    /** Coupon code (optional) */
    couponCode?: string;
    
    /** Client-generated UUID for duplicate prevention */
    idempotencyKey: string;
}

/**
 * Request payload for updating order status (admin)
 */
export interface UpdateOrderStatusRequest {
    status: OrderStatus;
    note?: string;
}

/**
 * Filter parameters for order listing
 */
export interface OrderFilters {
    status?: OrderStatus;
    userId?: string;
    startDate?: string;
    endDate?: string;
    erpSyncStatus?: ERPSyncStatus;
}

/**
 * Order statistics (for admin dashboard)
 */
export interface OrderStats {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    ready: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
}
