/**
 * Cart Controller for MG Mart grocery application
 *
 * Extended with delivery zone validation for checkout.
 * Stock is READ-ONLY - validation only, no modifications.
 *
 * @author MG Mart Development Team
 * @version 2.0.0
 */

import { Request, Response, NextFunction } from "express";
import { CartRepository } from "../repositories/CartRepository.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { deliveryService } from "../services/deliveryService.js";
import {
  validateRequired,
  validatePositiveNumber,
} from "../utils/validation.js";
import { ApiError } from "../utils/errorHandler.js";
import { AddToCartInput, UpdateCartItemInput } from "../models/Cart.js";

export class CartController {
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  /**
   * Get user's current cart with all items and totals
   */
  getCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const cart = await this.cartRepository.getCart(userId);
      if (!cart) {
        res.json({
          success: true,
          data: {
            cartId: null,
            userId,
            items: [],
            totalAmount: 0,
            totalItems: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
        return;
      }

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add item to cart or update quantity if item already exists
   * Does NOT validate stock - optimistic add for fast UX
   */
  addItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { productId, quantity } = req.body;

      validateRequired(productId, "productId");
      validateRequired(quantity, "quantity");
      validatePositiveNumber(quantity, "Quantity");

      // Verify product exists (but don't block on stock)
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new ApiError("Product not found", 404);
      }

      // Check if product is active
      if (product.isActive === false) {
        throw new ApiError("Product is not available", 400);
      }

      // Optional: Warn if quantity exceeds stock (but still allow add)
      const stock = product.stockQty ?? product.stock;
      const maxQty = product.maxOrderQty || 10;

      if (parseInt(quantity, 10) > maxQty) {
        throw new ApiError(`Maximum ${maxQty} ${product.unit} allowed per order`, 400);
      }

      const addItemInput = {
        productId,
        quantity: parseInt(quantity, 10),
      };

      await this.cartRepository.addItem(userId, addItemInput);
      const updatedCart = await this.cartRepository.getCart(userId);

      res.json({
        success: true,
        message: "Item added to cart successfully",
        data: updatedCart,
        // Include stock warning if applicable
        ...(stock < parseInt(quantity, 10) && {
          warning: `Only ${stock} ${product.unit} available in stock`,
        }),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update item quantity in cart
   */
  updateItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      validateRequired(quantity, "quantity");
      validatePositiveNumber(quantity, "Quantity");

      const cart = await this.cartRepository.getCart(userId);
      if (!cart) {
        throw new ApiError("Cart not found", 404);
      }

      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );
      if (!existingItem) {
        throw new ApiError("Item not found in cart", 404);
      }

      // Check max order quantity
      const product = await this.productRepository.findById(productId!);
      if (product) {
        const maxQty = product.maxOrderQty || 10;
        if (parseInt(quantity, 10) > maxQty) {
          throw new ApiError(`Maximum ${maxQty} ${product.unit} allowed per order`, 400);
        }
      }

      const updateInput: UpdateCartItemInput = {
        quantity: parseInt(quantity, 10),
      };

      await this.cartRepository.updateItem(userId, productId!, updateInput);
      const updatedCart = await this.cartRepository.getCart(userId);

      res.json({
        success: true,
        message: "Cart item updated successfully",
        data: updatedCart,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove item from cart
   */
  removeItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { productId } = req.params;

      if (!productId) {
        throw new ApiError("Product ID is required", 400);
      }

      const cart = await this.cartRepository.getCart(userId);
      if (!cart) {
        throw new ApiError("Cart not found", 404);
      }

      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );
      if (!existingItem) {
        throw new ApiError("Item not found in cart", 404);
      }

      await this.cartRepository.removeItem(userId, productId!);
      const updatedCart = await this.cartRepository.getCart(userId);

      res.json({
        success: true,
        message: "Item removed from cart successfully",
        data: updatedCart,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clear all items from cart
   */
  clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const cart = await this.cartRepository.getCart(userId);
      if (!cart) {
        throw new ApiError("Cart not found", 404);
      }

      await this.cartRepository.clearCart(userId);
      const clearedCart = await this.cartRepository.getCart(userId);

      res.json({
        success: true,
        message: "Cart cleared successfully",
        data: clearedCart,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get cart item count for user
   */
  getCartItemCount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const cart = await this.cartRepository.getCart(userId);
      const itemCount = cart ? cart.totalItems : 0;

      res.json({
        success: true,
        data: {
          itemCount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate cart items before checkout (original - backward compatible)
   */
  validateCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const cart = await this.cartRepository.getCart(userId);
      if (!cart || cart.items.length === 0) {
        throw new ApiError("Cart is empty", 400);
      }

      const validationErrors: string[] = [];
      const validatedItems = [];

      for (const item of cart.items) {
        const product = await this.productRepository.findById(item.productId);

        if (!product) {
          validationErrors.push(
            `Product ${item.productId} is no longer available`
          );
          continue;
        }

        const stock = product.stockQty ?? product.stock;

        if (stock < item.quantity) {
          validationErrors.push(
            `Insufficient stock for ${product.name}. Available: ${stock}, Requested: ${item.quantity}`
          );
          continue;
        }

        validatedItems.push({
          ...item,
          product: {
            name: product.name,
            price: product.sellingPrice || product.price,
            stock: stock,
          },
        });
      }

      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Cart validation failed",
          errors: validationErrors,
        });
        return;
      }

      res.json({
        success: true,
        message: "Cart is valid for checkout",
        data: {
          items: validatedItems,
          totalAmount: cart.totalAmount,
          totalItems: cart.totalItems,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * NEW: Validate cart for checkout with delivery zone check
   * POST /api/cart/validate-checkout
   */
  validateCartForCheckout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { deliveryAddress } = req.body;

      // Get cart with full validation
      const cartValidation = await this.cartRepository.getCartWithValidation(userId);

      if (cartValidation.items.length === 0) {
        throw new ApiError("Cart is empty", 400);
      }

      // Validate delivery zone if coordinates provided
      let deliveryValidation = {
        isServiceable: true,
        distance: 0,
        estimatedTime: "30-45 mins",
        deliveryFee: 0,
        message: undefined as string | undefined,
      };

      if (deliveryAddress?.coordinates) {
        const zoneValidation = await deliveryService.validateDeliveryZone({
          latitude: deliveryAddress.coordinates.latitude,
          longitude: deliveryAddress.coordinates.longitude,
        });

        deliveryValidation = {
          isServiceable: zoneValidation.isServiceable,
          distance: zoneValidation.distance || 0,
          estimatedTime: zoneValidation.estimatedTime || "30-45 mins",
          deliveryFee: zoneValidation.deliveryFee || 0,
          message: zoneValidation.message,
        };

        // Add delivery zone issue if not serviceable
        if (!zoneValidation.isServiceable) {
          cartValidation.validation.issues.push({
            productId: "",
            productName: "",
            type: "product_unavailable",
            message: zoneValidation.message || "Delivery not available in your area",
          });
          cartValidation.validation.isValid = false;
        }
      }

      // Validate minimum order amount
      const storeConfig = await deliveryService.getStoreConfig();
      if (cartValidation.summary.subtotal < storeConfig.delivery.minOrderAmount) {
        cartValidation.validation.issues.push({
          productId: "",
          productName: "",
          type: "product_unavailable",
          message: `Minimum order amount is ₹${storeConfig.delivery.minOrderAmount}`,
        });
        cartValidation.validation.isValid = false;
      }

      // Calculate final delivery fee (free delivery threshold)
      let finalDeliveryFee = deliveryValidation.deliveryFee;
      if (
        storeConfig.delivery.freeDeliveryAbove &&
        cartValidation.summary.subtotal >= storeConfig.delivery.freeDeliveryAbove
      ) {
        finalDeliveryFee = 0;
      }

      const packagingFee = storeConfig.delivery.packagingFee || 0;
      const total = cartValidation.summary.subtotal + finalDeliveryFee + packagingFee;

      res.json({
        success: true,
        data: {
          isValid: cartValidation.validation.isValid && deliveryValidation.isServiceable,
          cart: cartValidation,
          delivery: {
            ...deliveryValidation,
            deliveryFee: finalDeliveryFee,
          },
          pricing: {
            subtotal: cartValidation.summary.subtotal,
            deliveryFee: finalDeliveryFee,
            packagingFee,
            discount: 0,
            total,
            freeDeliveryThreshold: storeConfig.delivery.freeDeliveryAbove,
            amountForFreeDelivery: storeConfig.delivery.freeDeliveryAbove
              ? Math.max(0, storeConfig.delivery.freeDeliveryAbove - cartValidation.summary.subtotal)
              : null,
          },
          issues: cartValidation.validation.issues,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
