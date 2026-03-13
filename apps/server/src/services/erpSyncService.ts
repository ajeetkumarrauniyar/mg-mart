/**
 * ERP Sync Service for MG Mart
 * 
 * Handles queueing orders for BUSY ERP sync.
 * Actual sync will be done by Busy Sync Bridge (separate service).
 */

import { db } from "./firebase.js";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { 
  ERPSyncQueueItem, 
  ERPSyncItemType, 
  ERPSyncQueueStatus,
  ERPOrderPayload,
  ERPLineItem 
} from "../models/ERPSync.js";
import { Order, DeliveryAddress } from "../models/Order.js";

export class ERPSyncService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly COLLECTION = "erpSyncQueue";

  /**
   * Queue an order for ERP sync
   */
  async queueOrderForSync(orderId: string, priority: number = 1): Promise<string> {
    const queueId = `order-${orderId}-${Date.now()}`;
    const now = Timestamp.now();

    const queueItem: Omit<ERPSyncQueueItem, "queueId"> = {
      type: "order",
      orderId,
      priority,
      status: "pending",
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      createdAt: now,
      scheduledAt: now,
    } as any;

    await db.collection(this.COLLECTION).doc(queueId).set({
      ...queueItem,
      queueId,
    });

    return queueId;
  }

  /**
   * Prepare order payload for ERP sync
   */
  prepareERPPayload(order: Order): ERPOrderPayload {
    const items: ERPLineItem[] = order.items.map((item) => ({
      itemCode: item.erpItemCode || item.sku,
      sku: item.sku,
      description: item.name,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.unitPrice,
      amount: item.totalPrice,
    }));

    const address = this.formatAddress(order.deliveryAddress);

    return {
      orderDate: new Date(order.createdAt.toDate()).toISOString().split("T")[0],
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: address,
      items,
      subtotal: order.subtotal,
      deliveryCharges: order.deliveryFee,
      discount: order.discount || 0,
      totalAmount: order.totalAmount,
      paymentMode: order.paymentDetails.paymentMethod === "COD" ? "CASH" : "ONLINE",
      paymentStatus: order.paymentDetails.paymentStatus === "paid" ? "PAID" : "PENDING",
      cloudOrderId: order.orderId,
    };
  }

  /**
   * Format delivery address for ERP
   */
  private formatAddress(address: DeliveryAddress): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ].filter(Boolean);

    return parts.join(", ");
  }

  /**
   * Update sync status for an order
   */
  async updateOrderSyncStatus(
    orderId: string,
    status: "pending" | "syncing" | "synced" | "failed" | "manual",
    erpDetails?: {
      erpOrderId?: string;
      erpInvoiceNumber?: string;
      error?: string;
    }
  ): Promise<void> {
    const updateData: any = {
      erpSyncStatus: status,
      erpLastSyncAt: Timestamp.now(),
    };

    if (erpDetails?.erpOrderId) {
      updateData.erpOrderId = erpDetails.erpOrderId;
    }
    if (erpDetails?.erpInvoiceNumber) {
      updateData.erpInvoiceNumber = erpDetails.erpInvoiceNumber;
    }
    if (erpDetails?.error) {
      updateData.erpSyncError = erpDetails.error;
      updateData.erpSyncAttempts = FieldValue.increment(1);
    }

    await db.collection("orders").doc(orderId).update(updateData);
  }

  /**
   * Get pending sync items (for Sync Bridge to process)
   */
  async getPendingSyncItems(limit: number = 10): Promise<ERPSyncQueueItem[]> {
    const snapshot = await db
      .collection(this.COLLECTION)
      .where("status", "==", "pending")
      .where("scheduledAt", "<=", Timestamp.now())
      .orderBy("scheduledAt")
      .orderBy("priority")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as ERPSyncQueueItem);
  }

  /**
   * Mark queue item as processing
   */
  async markAsProcessing(queueId: string): Promise<void> {
    await db.collection(this.COLLECTION).doc(queueId).update({
      status: "processing",
    });
  }

  /**
   * Mark queue item as completed
   */
  async markAsCompleted(queueId: string): Promise<void> {
    await db.collection(this.COLLECTION).doc(queueId).update({
      status: "completed",
      processedAt: Timestamp.now(),
    });
  }

  /**
   * Handle sync failure with retry logic
   */
  async handleSyncFailure(
    queueId: string,
    error: string
  ): Promise<void> {
    const doc = await db.collection(this.COLLECTION).doc(queueId).get();
    
    if (!doc.exists) return;

    const item = doc.data() as ERPSyncQueueItem;
    const attempts = item.attempts + 1;

    if (attempts >= this.MAX_ATTEMPTS) {
      // Mark as failed, requires manual intervention
      await db.collection(this.COLLECTION).doc(queueId).update({
        status: "failed",
        attempts,
        lastError: error,
        errorHistory: FieldValue.arrayUnion({
          timestamp: Timestamp.now(),
          error,
        }),
      });

      // Update order to manual status
      if (item.orderId) {
        await this.updateOrderSyncStatus(item.orderId, "manual", { error });
      }
    } else {
      // Schedule retry with exponential backoff
      const nextRetryDelay = this.getRetryDelay(attempts);
      const nextRetryAt = new Date(Date.now() + nextRetryDelay);

      await db.collection(this.COLLECTION).doc(queueId).update({
        status: "pending",
        attempts,
        lastError: error,
        nextRetryAt: Timestamp.fromDate(nextRetryAt),
        scheduledAt: Timestamp.fromDate(nextRetryAt),
        errorHistory: FieldValue.arrayUnion({
          timestamp: Timestamp.now(),
          error,
        }),
      });
    }
  }

  /**
   * Get retry delay with exponential backoff
   */
  private getRetryDelay(attempt: number): number {
    const baseDelay = 60000; // 1 minute
    const maxDelay = 3600000; // 1 hour
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    return delay;
  }

  /**
   * Prioritize a specific order in the queue
   */
  async prioritizeOrder(orderId: string): Promise<void> {
    const snapshot = await db
      .collection(this.COLLECTION)
      .where("orderId", "==", orderId)
      .where("status", "in", ["pending", "failed"])
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        priority: 0, // Highest priority
        scheduledAt: Timestamp.now(),
        status: "pending",
      });
    }
  }

  /**
   * Get sync queue stats (for admin dashboard)
   */
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    failed: number;
    completed: number;
  }> {
    const [pending, processing, failed, completed] = await Promise.all([
      db.collection(this.COLLECTION).where("status", "==", "pending").count().get(),
      db.collection(this.COLLECTION).where("status", "==", "processing").count().get(),
      db.collection(this.COLLECTION).where("status", "==", "failed").count().get(),
      db.collection(this.COLLECTION).where("status", "==", "completed").count().get(),
    ]);

    return {
      pending: pending.data().count,
      processing: processing.data().count,
      failed: failed.data().count,
      completed: completed.data().count,
    };
  }
}

// Singleton instance
export const erpSyncService = new ERPSyncService();
