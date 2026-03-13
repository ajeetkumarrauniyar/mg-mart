/**
 * Order model for MG Mart (ERP-ready)
 * 
 * Orders are prepared for BUSY ERP sync.
 * Stock is validated but never modified by the app.
 */

import { Timestamp } from "firebase-admin/firestore";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "failed";

export type PaymentMethod = "COD" | "UPI" | "CARD" | "WALLET" | "NETBANKING";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ERPSyncStatus = "pending" | "syncing" | "synced" | "failed" | "manual";

/**
 * Delivery address
 */
export interface DeliveryAddress {
  addressId?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Delivery slot
 */
export interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
}

/**
 * Order item (snapshot at order time)
 */
export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  imageUrl: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  erpItemCode?: string;
}

/**
 * Payment details
 */
export interface PaymentDetails {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paymentGateway?: string;
  paidAt?: Timestamp;
  refundedAt?: Timestamp;
  refundAmount?: number;
}

/**
 * Status history entry
 */
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Timestamp;
  updatedBy: string;
  note?: string;
}

/**
 * Notification log entry
 */
export interface NotificationLogEntry {
  type: string;
  sentAt: Timestamp;
  success: boolean;
  error?: string;
}

/**
 * Order document in Firestore
 * Collection: orders/{orderId}
 */
export interface Order {
  orderId: string;
  orderNumber: string;
  
  // Customer
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  deliveryFee: number;
  packagingFee?: number;
  discount?: number;
  couponCode?: string;
  totalAmount: number;
  
  // Delivery
  deliveryAddress: DeliveryAddress;
  deliverySlot?: DeliverySlot;
  deliveryInstructions?: string;
  deliveryDistance?: number;
  
  // Payment
  paymentDetails: PaymentDetails;
  
  // Status
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  
  // ERP Sync
  erpSyncStatus: ERPSyncStatus;
  erpOrderId?: string;
  erpInvoiceNumber?: string;
  erpSyncAttempts: number;
  erpLastSyncAt?: Timestamp;
  erpSyncError?: string;
  
  // Notifications
  fcmToken?: string;
  notificationsSent: NotificationLogEntry[];
  
  // Idempotency
  idempotencyKey?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  dispatchedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
}

/**
 * Create order input
 */
export interface CreateOrderInput {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  packagingFee?: number;
  discount?: number;
  couponCode?: string;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  deliverySlot?: DeliverySlot;
  deliveryInstructions?: string;
  deliveryDistance?: number;
  paymentMethod: PaymentMethod;
  fcmToken?: string;
  idempotencyKey?: string;
}

/**
 * Order response (API)
 */
export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    imageUrl: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  packagingFee?: number;
  discount?: number;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  deliverySlot?: DeliverySlot;
  status: OrderStatus;
  paymentDetails: {
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
  };
  erpSyncStatus: ERPSyncStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order list item (reduced payload)
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
