/**
 * Cart Repository for MG Mart grocery application
 *
 * Extended for ERP-centric design with price tracking and validation.
 * Stock is READ-ONLY - validation only at checkout.
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
  CartItem,
  CartItemWithProduct,
  AddToCartInput,
  UpdateCartItemInput,
  CartResponse,
  CartItemWithValidation,
  CartResponseWithValidation,
  CartValidationIssue,
} from "../models/Cart.js";
import { ProductRepository } from "./ProductRepository.js";

/**
 * Repository class for shopping cart operations
 */
export class CartRepository {
  private db = getDb();
  private productRepository = new ProductRepository();

  /**
   * Gets the cart subcollection reference for a specific user
   */
  private getCartCollection(userId: string) {
    return this.db
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.CART);
  }

  /**
   * Adds an item to the user's cart or updates quantity if exists
   * Now captures price at add time for checkout comparison
   */
  async addItem(userId: string, itemData: AddToCartInput): Promise<boolean> {
    const cartCollection = this.getCartCollection(userId);
    const itemRef = cartCollection.doc(itemData.productId);

    // Get product to capture current price
    const product = await this.productRepository.findById(itemData.productId);
    const currentPrice = product?.sellingPrice || product?.price || 0;
    const sku = product?.sku;

    const existingItem = await itemRef.get();

    if (existingItem.exists) {
      const currentData = existingItem.data() as CartItem;
      await itemRef.update({
        quantity: currentData.quantity + itemData.quantity,
        addedAt: createTimestamp(),
      });
    } else {
      const cartItem: CartItem = {
        productId: itemData.productId,
        quantity: itemData.quantity,
        addedAt: createTimestamp(),
        priceAtAdd: currentPrice,
        sku: sku,
      };
      await itemRef.set(cartItem);
    }

    return true;
  }

  /**
   * Updates the quantity of an existing cart item
   */
  async updateItem(
    userId: string,
    productId: string,
    updateData: UpdateCartItemInput
  ): Promise<boolean> {
    const cartCollection = this.getCartCollection(userId);
    const itemRef = cartCollection.doc(productId);

    const doc = await itemRef.get();
    if (!doc.exists) {
      return false;
    }

    if (updateData.quantity <= 0) {
      await itemRef.delete();
    } else {
      await itemRef.update({
        quantity: updateData.quantity,
        addedAt: createTimestamp(),
      });
    }

    return true;
  }

  /**
   * Removes a specific item from the user's cart
   */
  async removeItem(userId: string, productId: string): Promise<boolean> {
    const cartCollection = this.getCartCollection(userId);
    const itemRef = cartCollection.doc(productId);

    const doc = await itemRef.get();
    if (!doc.exists) {
      return false;
    }

    await itemRef.delete();
    return true;
  }

  /**
   * Retrieves the complete cart for a user (original format)
   * Maintains backward compatibility
   */
  async getCart(userId: string): Promise<CartResponse> {
    const cartCollection = this.getCartCollection(userId);
    const snapshot = await cartCollection.get();

    if (snapshot.empty) {
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
    }

    const cartItems: CartItem[] = snapshot.docs.map(
      (doc) =>
        ({
          productId: doc.id,
          ...doc.data(),
        }) as CartItem
    );

    const itemsWithProducts: CartItemWithProduct[] = [];
    let totalAmount = 0;
    let totalItems = 0;

    for (const cartItem of cartItems) {
      const product = await this.productRepository.findById(cartItem.productId);

      // Include items even if stock is low (validation at checkout)
      if (product) {
        const currentPrice = product.sellingPrice || product.price;
        const itemWithProduct: CartItemWithProduct = {
          productId: cartItem.productId,
          name: product.name,
          price: currentPrice,
          imageUrl: product.imageUrl,
          unit: product.unit,
          quantity: cartItem.quantity,
          addedAt: cartItem.addedAt,
          priceAtAdd: cartItem.priceAtAdd,
          currentPrice: currentPrice,
          sku: cartItem.sku || product.sku,
        };

        itemsWithProducts.push(itemWithProduct);
        totalAmount += currentPrice * cartItem.quantity;
        totalItems += cartItem.quantity;
      }
    }

    return {
      items: itemsWithProducts.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        unit: item.unit,
        quantity: item.quantity,
        addedAt: timestampToString(item.addedAt),
        sku: item.sku,
        priceAtAdd: item.priceAtAdd,
        currentPrice: item.currentPrice,
        priceChanged: item.priceAtAdd !== undefined && item.priceAtAdd !== item.currentPrice,
        subtotal: item.price * item.quantity,
      })),
      totalItems,
      totalAmount,
    };
  }

  /**
   * NEW: Get cart with full validation for checkout
   * Checks stock availability and price changes
   */
  async getCartWithValidation(userId: string): Promise<CartResponseWithValidation> {
    const cartCollection = this.getCartCollection(userId);
    const snapshot = await cartCollection.get();

    if (snapshot.empty) {
      return {
        items: [],
        summary: {
          itemCount: 0,
          totalQty: 0,
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
        },
        validation: {
          isValid: true,
          issues: [],
        },
      };
    }

    const cartItems: CartItem[] = snapshot.docs.map(
      (doc) =>
        ({
          productId: doc.id,
          ...doc.data(),
        }) as CartItem
    );

    const validatedItems: CartItemWithValidation[] = [];
    const issues: CartValidationIssue[] = [];
    let subtotal = 0;
    let totalQty = 0;

    for (const cartItem of cartItems) {
      const product = await this.productRepository.findById(cartItem.productId);

      if (!product) {
        issues.push({
          productId: cartItem.productId,
          productName: "Unknown Product",
          type: "product_unavailable",
          message: "This product is no longer available",
        });
        continue;
      }

      const currentPrice = product.sellingPrice || product.price;
      const stock = product.stockQty ?? product.stock;
      const isActive = product.isActive !== false;
      const isAvailable = stock > 0 && isActive;
      const hasStockIssue = cartItem.quantity > stock;
      const hasPriceChange = cartItem.priceAtAdd !== undefined && 
                            cartItem.priceAtAdd !== currentPrice;

      // Add validation issues
      if (!isActive) {
        issues.push({
          productId: cartItem.productId,
          productName: product.name,
          type: "product_unavailable",
          message: `${product.name} is currently unavailable`,
        });
      } else if (stock <= 0) {
        issues.push({
          productId: cartItem.productId,
          productName: product.name,
          type: "out_of_stock",
          message: `${product.name} is out of stock`,
          suggestedQty: 0,
        });
      } else if (hasStockIssue) {
        issues.push({
          productId: cartItem.productId,
          productName: product.name,
          type: "insufficient_stock",
          message: `Only ${stock} ${product.unit} of ${product.name} available`,
          suggestedQty: stock,
        });
      }

      if (hasPriceChange && isAvailable) {
        const priceDiff = currentPrice - (cartItem.priceAtAdd || 0);
        issues.push({
          productId: cartItem.productId,
          productName: product.name,
          type: "price_changed",
          message: `Price of ${product.name} has ${priceDiff > 0 ? "increased" : "decreased"} by ₹${Math.abs(priceDiff).toFixed(2)}`,
          priceDifference: priceDiff,
        });
      }

      const itemSubtotal = currentPrice * cartItem.quantity;
      subtotal += itemSubtotal;
      totalQty += cartItem.quantity;

      validatedItems.push({
        productId: cartItem.productId,
        sku: cartItem.sku || product.sku,
        name: product.name,
        imageUrl: product.imageUrl,
        unit: product.unit,
        quantity: cartItem.quantity,
        price: currentPrice,
        priceAtAdd: cartItem.priceAtAdd,
        subtotal: itemSubtotal,
        addedAt: timestampToString(cartItem.addedAt),
        validation: {
          isAvailable,
          hasStockIssue,
          hasPriceChange,
          availableQty: stock,
          message: hasStockIssue ? `Only ${stock} available` : undefined,
        },
      });
    }

    // Filter out non-blocking issues (price changes are warnings, not blockers)
    const blockingIssues = issues.filter(
      (i) => i.type !== "price_changed"
    );

    return {
      items: validatedItems,
      summary: {
        itemCount: validatedItems.length,
        totalQty,
        subtotal,
        deliveryFee: 0, // Will be set by controller
        total: subtotal,
      },
      validation: {
        isValid: blockingIssues.length === 0,
        issues,
      },
    };
  }

  /**
   * Clears all items from the user's cart
   */
  async clearCart(userId: string): Promise<boolean> {
    const cartCollection = this.getCartCollection(userId);
    const snapshot = await cartCollection.get();

    const batch = this.db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return true;
  }

  /**
   * Gets the total number of items in the user's cart
   */
  async getItemCount(userId: string): Promise<number> {
    const cartCollection = this.getCartCollection(userId);
    const snapshot = await cartCollection.get();

    let totalItems = 0;
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as CartItem;
      totalItems += data.quantity;
    });

    return totalItems;
  }

  /**
   * Health check for the repository
   */
  async healthCheck(userId: string): Promise<boolean> {
    try {
      await this.getCartCollection(userId).limit(1).get();
      return true;
    } catch (error) {
      console.error("Repository health check failed:", error);
      return false;
    }
  }
}
