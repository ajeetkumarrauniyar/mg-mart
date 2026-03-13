/**
 * Order model for MG Mart grocery application
 * 
 * Extended for hyper-local delivery and ERP sync.
 * Maintains backward compatibility with existing API.
 * 
 * @author MG Mart Development Team
 * @version 2.0.0
 */

import { Timestamp } from "firebase-admin/firestore";
import { Address } from "./User.js";

/**
 * Order status - Extended for hyper-local workflow
 * Original: pending, processing, shipped, delivered, cancelled
 * New: confirmed, ready, out_for_delivery added
 */
export type OrderStatus =
  | "pending"           // Order placed, awaiting confirmation
  | "confirmed"         // NEW: Order confirmed by store
  | "processing"        // Order being packed
  | "ready"             // NEW: Ready for dispatch
  | "shipped"           // Legacy (mapped to out_for_delivery)
  | "out_for_delivery"  // NEW: With delivery person
  | "delivered"         // Successfully delivered
  | "cancelled"         // Cancelled
  | "failed";           // NEW: System error

/**
 * Payment method - Extended
 */
export type PaymentMethod = "COD" | "Online" | "UPI" | "CARD" | "WALLET" | "NETBANKING";

/**
 * Payment status
 */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/**
 * ERP sync status
 */
export type ERPSyncStatus = "pending" | "syncing" | "synced" | "failed" | "manual";

/**
 * Order item - Extended with ERP fields
 */
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  // NEW: ERP fields
  sku?: string;
  imageUrl?: string;
  unit?: string;
  unitPrice?: number;      // Alias for price
  totalPrice?: number;     // quantity * price
  erpItemCode?: string;
}

/**
 * Payment details - Extended
 */
export interface PaymentDetails {
  paymentMethod: PaymentMethod;
  transactionId?: string;
  // NEW fields
  paymentStatus?: PaymentStatus;
  paymentGateway?: string;
  paidAt?: Timestamp;
  refundedAt?: Timestamp;
  refundAmount?: number;
}

/**
 * NEW: Delivery address with coordinates
 */
export interface DeliveryAddress {
  // Original Address fields (backward compatible)
  street?: string;
  city: string;
  state: string;
  zipCode?: string;
  // NEW: Extended address fields
  addressId?: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  pincode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * NEW: Delivery slot
 */
export interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
}

/**
 * NEW: Status history entry for audit trail
 */
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Timestamp;
  updatedBy: string;
  note?: string;
}

/**
 * NEW: Notification log entry
 */
export interface NotificationLogEntry {
  type: string;
  sentAt: Timestamp;
  success: boolean;
  error?: string;
}

/**
 * Order document - Extended while maintaining backward compatibility
 */
export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  
  // Original field (kept for backward compatibility)
  shippingAddress: Address | DeliveryAddress;
  
  paymentDetails: PaymentDetails;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // NEW: Human-readable order number
  orderNumber?: string;
  
  // NEW: Customer info snapshot
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // NEW: Pricing breakdown
  subtotal?: number;
  deliveryFee?: number;
  packagingFee?: number;
  discount?: number;
  couponCode?: string;
  
  // NEW: Delivery details
  deliveryAddress?: DeliveryAddress;
  deliverySlot?: DeliverySlot;
  deliveryInstructions?: string;
  deliveryDistance?: number;
  
  // NEW: Status audit trail
  statusHistory?: StatusHistoryEntry[];
  
  // NEW: ERP Sync fields
  erpSyncStatus?: ERPSyncStatus;
  erpOrderId?: string;
  erpInvoiceNumber?: string;
  erpSyncAttempts?: number;
  erpLastSyncAt?: Timestamp;
  erpSyncError?: string;
  
  // NEW: Notification tracking
  fcmToken?: string;
  notificationsSent?: NotificationLogEntry[];
  
  // NEW: Idempotency
  idempotencyKey?: string;
  
  // NEW: Additional timestamps
  confirmedAt?: Timestamp;
  dispatchedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
}

/**
 * Create order input - Extended
 */
export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  shippingAddress: Address | DeliveryAddress;
  paymentDetails: PaymentDetails;
  // NEW optional fields
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: DeliveryAddress;
  deliverySlot?: DeliverySlot;
  deliveryInstructions?: string;
  deliveryDistance?: number;
  deliveryFee?: number;
  packagingFee?: number;
  discount?: number;
  couponCode?: string;
  fcmToken?: string;
  idempotencyKey?: string;
}

/**
 * Update order input - Extended
 */
export interface UpdateOrderInput {
  status?: OrderStatus;
  paymentDetails?: PaymentDetails;
  // NEW fields
  erpSyncStatus?: ERPSyncStatus;
  erpOrderId?: string;
  erpInvoiceNumber?: string;
  erpSyncError?: string;
  statusHistory?: StatusHistoryEntry[];
  confirmedAt?: Timestamp;
  dispatchedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
}

/**
 * Order response - Extended
 */
export interface OrderResponse {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address | DeliveryAddress;
  paymentDetails: PaymentDetails;
  createdAt: string;
  updatedAt: string;
  // NEW optional fields
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  subtotal?: number;
  deliveryFee?: number;
  packagingFee?: number;
  discount?: number;
  deliveryAddress?: DeliveryAddress;
  deliverySlot?: DeliverySlot;
  deliveryDistance?: number;
  erpSyncStatus?: ERPSyncStatus;
  erpOrderId?: string;
  statusHistory?: Array<{
    status: OrderStatus;
    timestamp: string;
    updatedBy: string;
    note?: string;
  }>;
}

/**
 * NEW: Order list item (reduced payload)
 */
export interface OrderListItem {
  orderId: string;
  orderNumber?: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  customerName?: string;
  deliveryAddress?: {
    city: string;
    pincode?: string;
  };
}

/**
 * Valid status transitions for hyper-local workflow
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],           // Legacy support
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  failed: ["pending"],                           // Allow retry
};

/**
 * Generate human-readable order number
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `MG-${dateStr}-${random}`;
}
