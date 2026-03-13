/**
 * ERP Sync types for MG Mart
 * 
 * Handles order queue and sync status for BUSY ERP integration.
 * 
 * @author MG Mart Development Team
 * @version 1.0.0
 */

/**
 * ERP sync queue item type
 */
export type ERPSyncItemType = 'order' | 'inventory_update' | 'product_update';

/**
 * ERP sync queue status
 */
export type ERPSyncQueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * ERP sync error entry
 */
export interface ERPSyncError {
    timestamp: string;
    error: string;
    details?: string;
}

/**
 * ERP Sync Queue Item
 * 
 * Firestore Collection: erpSyncQueue/{queueId}
 */
export interface ERPSyncQueueItem {
    /** Queue item ID */
    queueId: string;
    
    /** Type of sync */
    type: ERPSyncItemType;
    
    /** Reference to order (if type is 'order') */
    orderId?: string;
    
    /** Reference to product (if type is 'product_update' or 'inventory_update') */
    productId?: string;
    
    /** Priority (1 = highest) */
    priority: number;
    
    /** Current status */
    status: ERPSyncQueueStatus;
    
    /** Number of sync attempts */
    attempts: number;
    
    /** Maximum retry attempts */
    maxAttempts: number;
    
    /** Created timestamp */
    createdAt: string;
    
    /** Scheduled processing time */
    scheduledAt: string;
    
    /** Actual processing timestamp */
    processedAt?: string;
    
    /** Next retry timestamp */
    nextRetryAt?: string;
    
    /** Last error message */
    lastError?: string;
    
    /** Error history */
    errorHistory?: ERPSyncError[];
}

/**
 * ERP Order payload structure (for sync)
 */
export interface ERPOrderPayload {
    /** Order date YYYY-MM-DD */
    orderDate: string;
    
    /** Cloud order number */
    orderNumber: string;
    
    /** Customer name */
    customerName: string;
    
    /** Customer phone */
    customerPhone: string;
    
    /** Full delivery address */
    customerAddress: string;
    
    /** Order line items */
    items: ERPLineItem[];
    
    /** Subtotal */
    subtotal: number;
    
    /** Delivery charges */
    deliveryCharges: number;
    
    /** Discount amount */
    discount: number;
    
    /** Total amount */
    totalAmount: number;
    
    /** Payment mode (CASH, ONLINE) */
    paymentMode: string;
    
    /** Payment status (PAID, PENDING) */
    paymentStatus: string;
    
    /** Firestore order ID reference */
    cloudOrderId: string;
}

/**
 * ERP line item structure
 */
export interface ERPLineItem {
    /** ERP item code */
    itemCode: string;
    
    /** SKU */
    sku: string;
    
    /** Item description */
    description: string;
    
    /** Quantity */
    quantity: number;
    
    /** Unit */
    unit: string;
    
    /** Unit rate/price */
    rate: number;
    
    /** Line amount (quantity * rate) */
    amount: number;
}

/**
 * ERP sync result
 */
export interface ERPSyncResult {
    success: boolean;
    erpOrderId?: string;
    erpInvoiceNumber?: string;
    error?: string;
}
