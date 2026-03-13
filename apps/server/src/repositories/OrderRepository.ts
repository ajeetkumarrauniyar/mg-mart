/**
 * Order Repository for MG Mart grocery application
 *
 * Extended for ERP sync, status history, and hyper-local delivery.
 * Stock is READ-ONLY - NO stock modifications in this repository.
 *
 * @author MG Mart Development Team
 * @version 2.0.0
 */

import {
  getDb,
  COLLECTIONS,
  createTimestamp,
  timestampToString,
} from "../services/firebase.js";
import {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderResponse,
  OrderStatus,
  StatusHistoryEntry,
  generateOrderNumber,
  ORDER_STATUS_TRANSITIONS,
} from "../models/Order.js";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Repository class for order management operations
 */
export class OrderRepository {
  private db = getDb();
  private collection = this.db.collection(COLLECTIONS.ORDERS);

  /**
   * Creates a new order in the system
   * IMPORTANT: Does NOT modify product stock (ERP controls inventory)
   */
  async create(orderData: CreateOrderInput): Promise<OrderResponse> {
    const orderId = this.collection.doc().id;
    const now = createTimestamp();

    // Calculate total amount from order items
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + (item.price || item.unitPrice || 0) * item.quantity,
      0
    );

    // Generate human-readable order number
    const orderNumber = generateOrderNumber();

    // Initialize status history
    const statusHistory: StatusHistoryEntry[] = [
      {
        status: "pending",
        timestamp: now,
        updatedBy: orderData.userId,
        note: "Order placed",
      },
    ];

    // Build order document with extended fields
    const order: Order = {
      orderId,
      orderNumber,
      userId: orderData.userId,
      items: orderData.items.map((item) => ({
        ...item,
        unitPrice: item.price || item.unitPrice,
        totalPrice: (item.price || item.unitPrice || 0) * item.quantity,
      })),
      totalAmount,
      subtotal: totalAmount,
      status: "pending",
      shippingAddress: orderData.shippingAddress,
      paymentDetails: {
        ...orderData.paymentDetails,
        paymentStatus: orderData.paymentDetails.paymentMethod === "COD" ? "pending" : "pending",
      },
      createdAt: now,
      updatedAt: now,
      // Extended fields
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      deliveryAddress: orderData.deliveryAddress,
      deliverySlot: orderData.deliverySlot,
      deliveryInstructions: orderData.deliveryInstructions,
      deliveryDistance: orderData.deliveryDistance,
      deliveryFee: orderData.deliveryFee || 0,
      packagingFee: orderData.packagingFee || 0,
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode,
      fcmToken: orderData.fcmToken,
      idempotencyKey: orderData.idempotencyKey,
      statusHistory,
      // ERP sync defaults
      erpSyncStatus: "pending",
      erpSyncAttempts: 0,
      notificationsSent: [],
    };

    await this.collection.doc(orderId).set(order);
    return this.toResponse(order);
  }

  /**
   * Find order by ID
   */
  async findById(orderId: string): Promise<OrderResponse | null> {
    const doc = await this.collection.doc(orderId).get();
    if (!doc.exists) {
      return null;
    }
    return this.toResponse(doc.data() as Order);
  }

  /**
   * Find order by idempotency key (for duplicate prevention)
   */
  async findByIdempotencyKey(idempotencyKey: string): Promise<OrderResponse | null> {
    const snapshot = await this.collection
      .where("idempotencyKey", "==", idempotencyKey)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return this.toResponse(snapshot.docs[0].data() as Order);
  }

  /**
   * Update order
   */
  async update(
    orderId: string,
    updateData: UpdateOrderInput
  ): Promise<OrderResponse | null> {
    const orderRef = this.collection.doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return null;
    }

    const updatedData = {
      ...updateData,
      updatedAt: createTimestamp(),
    };

    await orderRef.update(updatedData);
    const updatedDoc = await orderRef.get();
    return this.toResponse(updatedDoc.data() as Order);
  }

  /**
   * Update order status with history tracking
   */
  async updateStatus(
    orderId: string,
    status: OrderStatus,
    updatedBy: string = "system",
    note?: string
  ): Promise<OrderResponse | null> {
    const orderRef = this.collection.doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return null;
    }

    const order = doc.data() as Order;
    const now = createTimestamp();

    // Build status history entry
    const historyEntry: StatusHistoryEntry = {
      status,
      timestamp: now,
      updatedBy,
      note,
    };

    // Prepare update with timestamps
    const updateData: any = {
      status,
      updatedAt: now,
      statusHistory: [...(order.statusHistory || []), historyEntry],
    };

    // Add timestamp for specific status changes
    switch (status) {
      case "confirmed":
        updateData.confirmedAt = now;
        break;
      case "out_for_delivery":
      case "shipped":
        updateData.dispatchedAt = now;
        break;
      case "delivered":
        updateData.deliveredAt = now;
        break;
      case "cancelled":
        updateData.cancelledAt = now;
        break;
    }

    await orderRef.update(updateData);
    const updatedDoc = await orderRef.get();
    return this.toResponse(updatedDoc.data() as Order);
  }

  /**
   * Validate status transition
   */
  isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    return validTransitions.includes(newStatus);
  }

  /**
   * Update ERP sync status
   */
  async updateERPSyncStatus(
    orderId: string,
    syncStatus: "pending" | "syncing" | "synced" | "failed" | "manual",
    details?: {
      erpOrderId?: string;
      erpInvoiceNumber?: string;
      error?: string;
    }
  ): Promise<void> {
    const updateData: any = {
      erpSyncStatus: syncStatus,
      erpLastSyncAt: createTimestamp(),
      updatedAt: createTimestamp(),
    };

    if (details?.erpOrderId) {
      updateData.erpOrderId = details.erpOrderId;
    }
    if (details?.erpInvoiceNumber) {
      updateData.erpInvoiceNumber = details.erpInvoiceNumber;
    }
    if (details?.error) {
      updateData.erpSyncError = details.error;
    }
    if (syncStatus === "failed") {
      // Increment attempt counter would need FieldValue.increment
      const doc = await this.collection.doc(orderId).get();
      if (doc.exists) {
        const order = doc.data() as Order;
        updateData.erpSyncAttempts = (order.erpSyncAttempts || 0) + 1;
      }
    }

    await this.collection.doc(orderId).update(updateData);
  }

  /**
   * List orders with filtering and pagination
   */
  async list(
    options: {
      limit?: number;
      offset?: number;
      status?: OrderStatus;
      userId?: string;
      erpSyncStatus?: string;
    } = {}
  ): Promise<OrderResponse[]> {
    let query = this.collection.orderBy("createdAt", "desc");

    if (options.status) {
      query = query.where("status", "==", options.status);
    }

    if (options.userId) {
      query = query.where("userId", "==", options.userId);
    }

    if (options.erpSyncStatus) {
      query = query.where("erpSyncStatus", "==", options.erpSyncStatus);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => this.toResponse(doc.data() as Order));
  }

  /**
   * Get orders pending ERP sync
   */
  async getOrdersPendingSync(limit: number = 10): Promise<OrderResponse[]> {
    const snapshot = await this.collection
      .where("erpSyncStatus", "in", ["pending", "failed"])
      .where("status", "in", ["confirmed", "processing", "ready", "out_for_delivery", "delivered"])
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => this.toResponse(doc.data() as Order));
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId?: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    ready: number;
    outForDelivery: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    let baseQuery = this.collection;
    
    if (userId) {
      baseQuery = baseQuery.where("userId", "==", userId) as any;
    }

    const [total, pending, confirmed, processing, ready, outForDelivery, shipped, delivered, cancelled] =
      await Promise.all([
        userId ? baseQuery.get() : this.collection.get(),
        this.collection.where("status", "==", "pending").get(),
        this.collection.where("status", "==", "confirmed").get(),
        this.collection.where("status", "==", "processing").get(),
        this.collection.where("status", "==", "ready").get(),
        this.collection.where("status", "==", "out_for_delivery").get(),
        this.collection.where("status", "==", "shipped").get(),
        this.collection.where("status", "==", "delivered").get(),
        this.collection.where("status", "==", "cancelled").get(),
      ]);

    // Calculate total revenue from delivered orders
    let totalRevenue = 0;
    delivered.docs.forEach((doc) => {
      const order = doc.data() as Order;
      totalRevenue += order.totalAmount || 0;
    });

    return {
      total: total.size,
      pending: pending.size,
      confirmed: confirmed.size,
      processing: processing.size,
      ready: ready.size,
      outForDelivery: outForDelivery.size,
      shipped: shipped.size,
      delivered: delivered.size,
      cancelled: cancelled.size,
      totalRevenue,
    };
  }

  /**
   * Convert internal Order to OrderResponse
   */
  private toResponse(order: Order): OrderResponse {
    return {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentDetails: order.paymentDetails,
      createdAt: timestampToString(order.createdAt),
      updatedAt: timestampToString(order.updatedAt),
      // Extended fields
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      packagingFee: order.packagingFee,
      discount: order.discount,
      deliveryAddress: order.deliveryAddress,
      deliverySlot: order.deliverySlot,
      deliveryDistance: order.deliveryDistance,
      erpSyncStatus: order.erpSyncStatus,
      erpOrderId: order.erpOrderId,
      statusHistory: order.statusHistory?.map((h) => ({
        status: h.status,
        timestamp: timestampToString(h.timestamp),
        updatedBy: h.updatedBy,
        note: h.note,
      })),
    };
  }

  /**
   * Health check
   */
  async healthCheck(userId: string): Promise<boolean> {
    try {
      await this.collection.where("userId", "==", userId).limit(1).get();
      return true;
    } catch (error) {
      console.error("Repository health check failed:", error);
      return false;
    }
  }
}
