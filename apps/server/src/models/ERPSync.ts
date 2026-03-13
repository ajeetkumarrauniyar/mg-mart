/**
 * ERP Sync Queue model
 * 
 * Queue for syncing orders to BUSY ERP.
 */

import { Timestamp } from "firebase-admin/firestore";

export type ERPSyncItemType = 'order' | 'inventory_update' | 'product_update';
export type ERPSyncQueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Sync error entry
 */
export interface ERPSyncError {
  timestamp: Timestamp;
  error: string;
  details?: string;
}

/**
 * ERP Sync Queue Item
 * Collection: erpSyncQueue/{queueId}
 */
export interface ERPSyncQueueItem {
  queueId: string;
  type: ERPSyncItemType;
  orderId?: string;
  productId?: string;
  priority: number;
  status: ERPSyncQueueStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Timestamp;
  scheduledAt: Timestamp;
  processedAt?: Timestamp;
  nextRetryAt?: Timestamp;
  lastError?: string;
  errorHistory?: ERPSyncError[];
}

/**
 * ERP Order Payload (for sync)
 */
export interface ERPOrderPayload {
  orderDate: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: ERPLineItem[];
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: string;
  cloudOrderId: string;
}

/**
 * ERP Line Item
 */
export interface ERPLineItem {
  itemCode: string;
  sku: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}
