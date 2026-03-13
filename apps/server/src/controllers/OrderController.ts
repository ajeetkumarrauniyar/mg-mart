/**
 * Order Controller for MG Mart grocery application
 *
 * ERP-centric design: Stock is READ-ONLY.
 * Orders are queued for ERP sync, notifications via FCM.
 *
 * @author MG Mart Development Team
 * @version 2.0.0
 */

import { Request, Response, NextFunction } from "express";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { CartRepository } from "../repositories/CartRepository.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { deliveryService } from "../services/deliveryService.js";
import { erpSyncService } from "../services/erpSyncService.js";
import { notificationService } from "../services/notificationService.js";
import { validateRequired } from "../utils/validation.js";
import { ApiError } from "../utils/errorHandler.js";
import {
  CreateOrderInput,
  OrderStatus,
  PaymentMethod,
  ORDER_STATUS_TRANSITIONS,
} from "../models/Order.js";

export class OrderController {
  private orderRepository: OrderRepository;
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  /**
   * Create a new order from user's cart
   * IMPORTANT: Does NOT modify product stock (ERP controls inventory)
   */
  createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const {
        paymentMethod,
        shippingAddress,
        deliveryAddress,
        deliverySlot,
        deliveryInstructions,
        idempotencyKey,
        fcmToken,
        notes,
      } = req.body;

      // Check idempotency (prevent duplicate orders)
      if (idempotencyKey) {
        const existingOrder = await this.orderRepository.findByIdempotencyKey(idempotencyKey);
        if (existingOrder) {
          res.json({
            success: true,
            message: "Order already exists",
            data: existingOrder,
          });
          return;
        }
      }

      // Validate required fields
      validateRequired(paymentMethod, "paymentMethod");
      
      // Accept either shippingAddress (legacy) or deliveryAddress (new)
      const address = deliveryAddress || shippingAddress;
      if (!address) {
        throw new ApiError("Delivery address is required", 400);
      }

      // Validate address fields
      if (!address.city || !address.state) {
        throw new ApiError("Complete delivery address is required", 400);
      }

      // Validate payment method
      const validPaymentMethods: PaymentMethod[] = ["COD", "Online", "UPI", "CARD", "WALLET", "NETBANKING"];
      if (!validPaymentMethods.includes(paymentMethod)) {
        throw new ApiError("Invalid payment method", 400);
      }

      // Get cart with validation
      const cartValidation = await this.cartRepository.getCartWithValidation(userId);
      
      if (cartValidation.items.length === 0) {
        throw new ApiError("Cart is empty", 400);
      }

      // Check for blocking validation issues (not price changes)
      const blockingIssues = cartValidation.validation.issues.filter(
        (i) => i.type !== "price_changed"
      );

      if (blockingIssues.length > 0) {
        res.status(409).json({
          success: false,
          error: "CART_VALIDATION_FAILED",
          message: "Some items in your cart have issues",
          data: {
            issues: blockingIssues,
            cart: cartValidation,
          },
        });
        return;
      }

      // Validate delivery zone if coordinates provided
      let deliveryFee = 0;
      let deliveryDistance = 0;

      if (address.coordinates) {
        const zoneValidation = await deliveryService.validateDeliveryZone({
          latitude: address.coordinates.latitude,
          longitude: address.coordinates.longitude,
        });

        if (!zoneValidation.isServiceable) {
          throw new ApiError(
            zoneValidation.message || "Delivery not available in your area",
            400
          );
        }

        deliveryDistance = zoneValidation.distance || 0;
        deliveryFee = await deliveryService.getDeliveryFeeForOrder(
          cartValidation.summary.subtotal,
          deliveryDistance
        );
      }

      // Get packaging fee
      const packagingFee = await deliveryService.getPackagingFee();

      // Build order items from validated cart
      const orderItems = cartValidation.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        imageUrl: item.imageUrl,
        unit: item.unit,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.price,
        totalPrice: item.subtotal,
      }));

      const totalAmount = cartValidation.summary.subtotal + deliveryFee + packagingFee;

      // Get user details for order
      const userName = req.user?.name || address.fullName || "Customer";
      const userPhone = req.user?.phoneNumber || address.phone || "";

      // Create order input
      const createOrderInput: CreateOrderInput = {
        userId,
        customerName: userName,
        customerPhone: userPhone,
        customerEmail: req.user?.email,
        items: orderItems,
        shippingAddress: address,
        deliveryAddress: address,
        deliverySlot,
        deliveryInstructions,
        deliveryDistance,
        deliveryFee,
        packagingFee,
        paymentDetails: {
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus: paymentMethod === "COD" ? "pending" : "pending",
        },
        fcmToken,
        idempotencyKey,
      };

      // Create order (NO stock modification)
      const order = await this.orderRepository.create(createOrderInput);

      // Clear user's cart
      await this.cartRepository.clearCart(userId);

      // Queue for ERP sync
      try {
        await erpSyncService.queueOrderForSync(order.orderId);
      } catch (syncError) {
        console.error("Failed to queue order for ERP sync:", syncError);
        // Don't fail the order, just log
      }

      // Send notification
      try {
        if (fcmToken) {
          await notificationService.sendOrderPlaced(order as any);
        }
      } catch (notifError) {
        console.error("Failed to send order notification:", notifError);
        // Don't fail the order, just log
      }

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's order history with pagination
   */
  getOrderHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { limit = "10", offset = "0", status } = req.query;

      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        throw new ApiError("Limit must be between 1 and 50", 400);
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new ApiError("Offset must be a non-negative number", 400);
      }

      let orders = await this.orderRepository.list({
        userId: userId,
        limit: limitNum,
        offset: offsetNum,
      });

      // Filter by status if provided
      if (status) {
        const validStatuses: OrderStatus[] = [
          "pending",
          "confirmed",
          "processing",
          "ready",
          "shipped",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ];
        if (!validStatuses.includes(status as OrderStatus)) {
          throw new ApiError("Invalid order status", 400);
        }

        const allUserOrders = await this.orderRepository.list({ userId: userId });
        orders = allUserOrders.filter((order) => order.status === status);

        const total = orders.length;
        orders = orders.slice(offsetNum, offsetNum + limitNum);

        res.json({
          success: true,
          data: {
            orders,
            pagination: {
              total,
              limit: limitNum,
              offset: offsetNum,
              hasMore: offsetNum + limitNum < total,
            },
          },
        });
        return;
      }

      const allUserOrders = await this.orderRepository.list({ userId: userId });
      const total = allUserOrders.length;

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific order by ID
   */
  getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { orderId } = req.params;

      if (!orderId) {
        throw new ApiError("Order ID is required", 400);
      }

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new ApiError("Order not found", 404);
      }

      // Ensure user can only access their own orders (unless admin)
      if (order.userId !== userId && req.user?.role !== "admin") {
        throw new ApiError("Access denied", 403);
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel an order (only if status allows)
   * IMPORTANT: Does NOT restore stock (ERP controls inventory)
   */
  cancelOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { orderId } = req.params;
      const { reason } = req.body;

      if (!orderId) {
        throw new ApiError("Order ID is required", 400);
      }

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new ApiError("Order not found", 404);
      }

      if (order.userId !== userId) {
        throw new ApiError("Access denied", 403);
      }

      // Check if order can be cancelled
      const cancellableStatuses: OrderStatus[] = ["pending", "confirmed", "processing"];
      if (!cancellableStatuses.includes(order.status)) {
        throw new ApiError(
          `Order cannot be cancelled. Current status: ${order.status}`,
          400
        );
      }

      // Update order status (NO stock restoration - ERP handles inventory)
      const updatedOrder = await this.orderRepository.updateStatus(
        orderId,
        "cancelled",
        userId,
        reason || "Cancelled by customer"
      );

      // Send cancellation notification
      try {
        await notificationService.sendOrderCancelled(updatedOrder as any, reason);
      } catch (notifError) {
        console.error("Failed to send cancellation notification:", notifError);
      }

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status (Admin only)
   * Triggers FCM notifications based on status
   */
  updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { status, note } = req.body;

      if (!orderId) {
        throw new ApiError("Order ID is required", 400);
      }

      validateRequired(status, "status");

      // Validate status
      const validStatuses: OrderStatus[] = [
        "pending",
        "confirmed",
        "processing",
        "ready",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new ApiError("Invalid order status", 400);
      }

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new ApiError("Order not found", 404);
      }

      // Validate status transition
      if (!this.orderRepository.isValidStatusTransition(order.status, status)) {
        throw new ApiError(
          `Cannot change status from ${order.status} to ${status}`,
          400
        );
      }

      const adminUserId = req.user?.userId || "admin";
      const updatedOrder = await this.orderRepository.updateStatus(
        orderId,
        status,
        adminUserId,
        note
      );

      // Send FCM notification for status change
      try {
        await notificationService.sendOrderStatusUpdate(updatedOrder as any, status, note);
      } catch (notifError) {
        console.error("Failed to send status notification:", notifError);
      }

      // Prioritize ERP sync if order is confirmed
      if (status === "confirmed") {
        try {
          await erpSyncService.prioritizeOrder(orderId);
        } catch (syncError) {
          console.error("Failed to prioritize ERP sync:", syncError);
        }
      }

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all orders (Admin only) with filtering and pagination
   */
  getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        limit = "20",
        offset,
        page,
        status,
        userId: filterUserId,
        erpSyncStatus,
      } = req.query;

      const limitNum = parseInt(limit as string, 10);

      let offsetNum: number;
      if (page !== undefined) {
        const pageNum = parseInt(page as string, 10);
        if (isNaN(pageNum) || pageNum < 1) {
          throw new ApiError("Page must be a positive number", 400);
        }
        offsetNum = (pageNum - 1) * limitNum;
      } else if (offset !== undefined) {
        offsetNum = parseInt(offset as string, 10);
      } else {
        offsetNum = 0;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new ApiError("Limit must be between 1 and 100", 400);
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new ApiError("Offset must be a non-negative number", 400);
      }

      let orders = await this.orderRepository.list({});

      // Apply filters
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }

      if (filterUserId) {
        orders = orders.filter((order) => order.userId === filterUserId);
      }

      if (erpSyncStatus) {
        orders = orders.filter((order) => order.erpSyncStatus === erpSyncStatus);
      }

      // Sort by creation date (newest first)
      orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const total = orders.length;
      const paginatedOrders = orders.slice(offsetNum, offsetNum + limitNum);

      res.json({
        success: true,
        data: {
          orders: paginatedOrders,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order statistics (Admin only)
   */
  getOrderStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.orderRepository.getOrderStats();

      // Get ERP sync stats
      let erpStats = { pending: 0, processing: 0, failed: 0, completed: 0 };
      try {
        erpStats = await erpSyncService.getQueueStats();
      } catch (e) {
        console.error("Failed to get ERP sync stats:", e);
      }

      res.json({
        success: true,
        data: {
          ...stats,
          erpSync: erpStats,
          // Legacy field mapping for backward compatibility
          statusBreakdown: {
            pending: stats.pending,
            processing: stats.processing,
            shipped: stats.shipped,
            delivered: stats.delivered,
            cancelled: stats.cancelled,
          },
          averageOrderValue:
            stats.total > 0 ? stats.totalRevenue / stats.delivered : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * NEW: Trigger manual ERP sync for an order (Admin only)
   */
  triggerERPSync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        throw new ApiError("Order ID is required", 400);
      }

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new ApiError("Order not found", 404);
      }

      // Queue for immediate sync
      await erpSyncService.prioritizeOrder(orderId);

      res.json({
        success: true,
        message: "Order queued for ERP sync",
        data: {
          orderId,
          erpSyncStatus: "pending",
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
