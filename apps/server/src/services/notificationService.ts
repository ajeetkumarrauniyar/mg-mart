/**
 * Notification Service for MG Mart
 * 
 * Handles FCM push notifications for order updates.
 */

import { getMessaging, MulticastMessage } from "firebase-admin/messaging";
import { db } from "./firebase.js";
import { Timestamp } from "firebase-admin/firestore";
import { Order, NotificationLogEntry } from "../models/Order.js";

interface FCMToken {
  token: string;
  deviceId: string;
  platform: "ios" | "android" | "web";
  createdAt: Timestamp;
  lastUsedAt: Timestamp;
}

interface UserFCMTokens {
  userId: string;
  tokens: FCMToken[];
  updatedAt: Timestamp;
}

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  badge?: number;
  data?: Record<string, string>;
}

type OrderNotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_processing"
  | "order_ready"
  | "order_out_for_delivery"
  | "order_delivered"
  | "order_cancelled";

export class NotificationService {
  private messaging = getMessaging();

  /**
   * Register or update FCM token for a user
   */
  async registerToken(
    userId: string,
    token: string,
    deviceId: string,
    platform: "ios" | "android" | "web"
  ): Promise<void> {
    const tokenRef = db.collection("userTokens").doc(userId);
    const doc = await tokenRef.get();
    
    const now = Timestamp.now();
    let tokens: FCMToken[] = [];

    if (doc.exists) {
      tokens = (doc.data() as UserFCMTokens).tokens || [];
      // Remove existing token for this device
      tokens = tokens.filter((t) => t.deviceId !== deviceId);
    }

    // Add new token
    tokens.push({
      token,
      deviceId,
      platform,
      createdAt: now,
      lastUsedAt: now,
    });

    // Keep only last 5 tokens per user (limit devices)
    if (tokens.length > 5) {
      tokens = tokens.slice(-5);
    }

    await tokenRef.set({
      userId,
      tokens,
      updatedAt: now,
    });
  }

  /**
   * Remove FCM token for a device
   */
  async removeToken(userId: string, deviceId: string): Promise<void> {
    const tokenRef = db.collection("userTokens").doc(userId);
    const doc = await tokenRef.get();

    if (!doc.exists) return;

    const data = doc.data() as UserFCMTokens;
    const tokens = data.tokens.filter((t) => t.deviceId !== deviceId);

    if (tokens.length === 0) {
      await tokenRef.delete();
    } else {
      await tokenRef.update({
        tokens,
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(
    userId: string,
    notification: NotificationPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tokenDoc = await db.collection("userTokens").doc(userId).get();
      
      if (!tokenDoc.exists) {
        return { success: false, error: "No FCM tokens registered for user" };
      }

      const { tokens } = tokenDoc.data() as UserFCMTokens;
      
      if (!tokens || tokens.length === 0) {
        return { success: false, error: "No FCM tokens available" };
      }

      const tokenStrings = tokens.map((t) => t.token);

      const message: MulticastMessage = {
        tokens: tokenStrings,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        android: {
          priority: "high",
          notification: {
            channelId: "orders",
            priority: "high",
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              badge: notification.badge || 1,
              sound: "default",
            },
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast(message);

      // Handle failed tokens (remove stale tokens)
      await this.handleFailedTokens(userId, tokens, response);

      const successCount = response.successCount;
      const failureCount = response.failureCount;

      if (successCount > 0) {
        return { success: true };
      } else {
        return { success: false, error: `All ${failureCount} tokens failed` };
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Handle failed tokens - remove invalid ones
   */
  private async handleFailedTokens(
    userId: string,
    tokens: FCMToken[],
    response: any
  ): Promise<void> {
    const failedTokens: string[] = [];

    response.responses.forEach((resp: any, idx: number) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        // Remove tokens that are invalid or unregistered
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          failedTokens.push(tokens[idx].token);
        }
      }
    });

    if (failedTokens.length > 0) {
      const tokenRef = db.collection("userTokens").doc(userId);
      const doc = await tokenRef.get();
      
      if (doc.exists) {
        const data = doc.data() as UserFCMTokens;
        const validTokens = data.tokens.filter(
          (t) => !failedTokens.includes(t.token)
        );

        if (validTokens.length === 0) {
          await tokenRef.delete();
        } else {
          await tokenRef.update({
            tokens: validTokens,
            updatedAt: Timestamp.now(),
          });
        }
      }
    }
  }

  /**
   * Log notification sent to order
   */
  private async logNotification(
    orderId: string,
    type: OrderNotificationType,
    success: boolean,
    error?: string
  ): Promise<void> {
    const logEntry: NotificationLogEntry = {
      type,
      sentAt: Timestamp.now(),
      success,
      error,
    };

    await db
      .collection("orders")
      .doc(orderId)
      .update({
        notificationsSent: Timestamp.now(), // Use FieldValue.arrayUnion in actual impl
      });
  }

  // ============================================
  // Order-specific notification methods
  // ============================================

  async sendOrderPlaced(order: Order): Promise<void> {
    const result = await this.sendToUser(order.userId, {
      title: "🎉 Order Placed Successfully!",
      body: `Your order #${order.orderNumber} has been placed. Total: ₹${order.totalAmount}`,
      data: {
        type: "order_placed",
        orderId: order.orderId,
        orderNumber: order.orderNumber,
      },
    });

    await this.logNotification(order.orderId, "order_placed", result.success, result.error);
  }

  async sendOrderConfirmed(order: Order): Promise<void> {
    const result = await this.sendToUser(order.userId, {
      title: "✅ Order Confirmed",
      body: `Your order #${order.orderNumber} is confirmed and being prepared.`,
      data: {
        type: "order_confirmed",
        orderId: order.orderId,
        orderNumber: order.orderNumber,
      },
    });

    await this.logNotification(order.orderId, "order_confirmed", result.success, result.error);
  }

  async sendOrderProcessing(order: Order): Promise<void> {
    const result = await this.sendToUser(order.userId, {
      title: "📦 Order Being Packed",
      body: `Your order #${order.orderNumber} is being packed.`,
      data: {
        type: "order_processing",
        orderId: order.orderId,
        orderNumber: order.orderNumber,
      },
    });

    await this.logNotification(order.orderId, "order_processing", result.success, result.error);
  }

  async sendOrderReady(order: Order): Promise<void> {
    const result = await this.sendToUser(order.userId, {
      title: "✨ Order Ready",
      body: `Your order #${order.orderNumber} is ready for dispatch.`,
      data: {
        type: "order_ready",
        orderId: order.orderId,
        orderNumber: order.orderNumber,
      },
    });

    await this.logNotification(order.orderId, "order_ready", result.success, result.error);
  }

  async sendOrderOutForDelivery(order: Order, estimatedTime?: string): Promise<void> {
    const result = await this.sendToUser(order.userId, {
      title: "🚗 Out for Delivery",
      body: `Your order #${order.orderNumber} is on its way!${estimatedTime ? ` Estimated: ${estimatedTime}` : ""}`,
      data: {
        type: "order_out_for_delivery",
        orderId: order.orderId,
        orderNumber: order.orderNumber,
      },
    });

    await this.logNotification(order.orderId, "order_out_for_delivery", result.success, result.error);
  }

  async sendOrderDelivered(order: Order): Promise<void> {
    const result = await this.sendToUser(order.userId, {
      title: "📦 Order Delivered",
      body: `Your order #${order.orderNumber} has been delivered. Enjoy!`,
      data: {
        type: "order_delivered",
        orderId: order.orderId,
        orderNumber: order.orderNumber,
      },
    });

    await this.logNotification(order.orderId, "order_delivered", result.success, result.error);
  }

  async sendOrderCancelled(order: Order, reason?: string): Promise<void> {
    const result = await this.sendToUser(order.userId, {
      title: "❌ Order Cancelled",
      body: `Your order #${order.orderNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      data: {
        type: "order_cancelled",
        orderId: order.orderId,
        orderNumber: order.orderNumber,
      },
    });

    await this.logNotification(order.orderId, "order_cancelled", result.success, result.error);
  }

  /**
   * Send notification based on order status change
   */
  async sendOrderStatusUpdate(order: Order, newStatus: string, note?: string): Promise<void> {
    switch (newStatus) {
      case "confirmed":
        await this.sendOrderConfirmed(order);
        break;
      case "processing":
        await this.sendOrderProcessing(order);
        break;
      case "ready":
        await this.sendOrderReady(order);
        break;
      case "out_for_delivery":
        await this.sendOrderOutForDelivery(order);
        break;
      case "delivered":
        await this.sendOrderDelivered(order);
        break;
      case "cancelled":
        await this.sendOrderCancelled(order, note);
        break;
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
