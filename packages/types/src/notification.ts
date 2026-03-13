/**
 * Notification types for MG Mart
 * 
 * FCM notification handling for order updates.
 * 
 * @author MG Mart Development Team
 * @version 1.0.0
 */

/**
 * FCM token info for a device
 */
export interface FCMToken {
    /** FCM token string */
    token: string;
    
    /** Unique device identifier */
    deviceId: string;
    
    /** Platform (ios, android, web) */
    platform: 'ios' | 'android' | 'web';
    
    /** Token creation timestamp */
    createdAt: string;
    
    /** Last time token was used */
    lastUsedAt: string;
}

/**
 * User FCM tokens collection
 * 
 * Firestore Collection: userTokens/{userId}
 */
export interface UserFCMTokens {
    /** User ID */
    userId: string;
    
    /** Array of device tokens */
    tokens: FCMToken[];
    
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Request to register FCM token
 */
export interface RegisterFCMTokenRequest {
    /** FCM token */
    token: string;
    
    /** Device identifier */
    deviceId: string;
    
    /** Platform */
    platform: 'ios' | 'android' | 'web';
}

/**
 * Notification payload structure
 */
export interface NotificationPayload {
    /** Notification title */
    title: string;
    
    /** Notification body */
    body: string;
    
    /** Image URL (optional) */
    imageUrl?: string;
    
    /** Badge count (optional) */
    badge?: number;
    
    /** Custom data payload */
    data?: Record<string, string>;
}

/**
 * Order notification types
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
 * Notification templates for orders
 */
export const ORDER_NOTIFICATION_TEMPLATES: Record<OrderNotificationType, {
    title: string;
    bodyTemplate: string;
}> = {
    order_placed: {
        title: '🎉 Order Placed Successfully!',
        bodyTemplate: 'Your order #{orderNumber} has been placed. Total: ₹{totalAmount}'
    },
    order_confirmed: {
        title: '✅ Order Confirmed',
        bodyTemplate: 'Your order #{orderNumber} is confirmed and being prepared.'
    },
    order_processing: {
        title: '📦 Order Being Packed',
        bodyTemplate: 'Your order #{orderNumber} is being packed.'
    },
    order_ready: {
        title: '✨ Order Ready',
        bodyTemplate: 'Your order #{orderNumber} is ready for dispatch.'
    },
    order_out_for_delivery: {
        title: '🚗 Out for Delivery',
        bodyTemplate: 'Your order #{orderNumber} is on its way! Estimated: {estimatedTime}'
    },
    order_delivered: {
        title: '📦 Order Delivered',
        bodyTemplate: 'Your order #{orderNumber} has been delivered. Enjoy!'
    },
    order_cancelled: {
        title: '❌ Order Cancelled',
        bodyTemplate: 'Your order #{orderNumber} has been cancelled.'
    }
};
