/**
 * Delivery Service for MG Mart
 * 
 * Handles delivery zone validation using Haversine formula.
 */

import { db } from "./firebase.js";
import { 
  StoreConfig, 
  DeliveryValidation, 
  CustomerCoordinates 
} from "../models/StoreConfig.js";

// Default store ID (single store for now)
const DEFAULT_STORE_ID = "mg-mart-main";

export class DeliveryService {
  private storeConfigCache: StoreConfig | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get store configuration (with caching)
   */
  async getStoreConfig(): Promise<StoreConfig> {
    const now = Date.now();
    
    if (this.storeConfigCache && now < this.cacheExpiry) {
      return this.storeConfigCache;
    }

    const doc = await db.collection("storeConfig").doc(DEFAULT_STORE_ID).get();
    
    if (!doc.exists) {
      // Return default config if not set up yet
      return this.getDefaultStoreConfig();
    }

    this.storeConfigCache = doc.data() as StoreConfig;
    this.cacheExpiry = now + this.CACHE_TTL;
    
    return this.storeConfigCache;
  }

  /**
   * Default store configuration (used when not configured)
   */
  private getDefaultStoreConfig(): StoreConfig {
    return {
      storeId: DEFAULT_STORE_ID,
      storeName: "MG Mart",
      location: {
        latitude: 25.5941, // Default: Patna, Bihar (example)
        longitude: 85.1376,
        address: "Main Store",
        city: "Patna",
        state: "Bihar",
        pincode: "800001"
      },
      delivery: {
        radiusKm: 5,
        minOrderAmount: 100,
        deliveryFee: 30,
        freeDeliveryAbove: 500,
        packagingFee: 0,
        operatingHours: {
          start: "08:00",
          end: "21:00"
        },
        slots: [
          { id: "slot-1", label: "8 AM - 10 AM", startTime: "08:00", endTime: "10:00", maxOrders: 20, isActive: true },
          { id: "slot-2", label: "10 AM - 12 PM", startTime: "10:00", endTime: "12:00", maxOrders: 20, isActive: true },
          { id: "slot-3", label: "12 PM - 2 PM", startTime: "12:00", endTime: "14:00", maxOrders: 20, isActive: true },
          { id: "slot-4", label: "2 PM - 4 PM", startTime: "14:00", endTime: "16:00", maxOrders: 20, isActive: true },
          { id: "slot-5", label: "4 PM - 6 PM", startTime: "16:00", endTime: "18:00", maxOrders: 20, isActive: true },
          { id: "slot-6", label: "6 PM - 8 PM", startTime: "18:00", endTime: "20:00", maxOrders: 20, isActive: true },
        ]
      },
      isActive: true,
      isAcceptingOrders: true,
      updatedAt: new Date() as any
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if store is currently open
   */
  private isStoreOpen(config: StoreConfig): boolean {
    if (!config.isActive || !config.isAcceptingOrders) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    const { start, end } = config.delivery.operatingHours;
    return currentTime >= start && currentTime <= end;
  }

  /**
   * Validate if delivery address is within service area
   */
  async validateDeliveryZone(
    customerCoordinates: CustomerCoordinates
  ): Promise<DeliveryValidation> {
    const config = await this.getStoreConfig();

    // Check if store is active
    if (!config.isActive) {
      return {
        isServiceable: false,
        reason: "STORE_CLOSED",
        message: "Store is currently not operational"
      };
    }

    // Check if accepting orders
    if (!config.isAcceptingOrders) {
      return {
        isServiceable: false,
        reason: "STORE_CLOSED",
        message: "Store is not accepting orders at the moment"
      };
    }

    // Check operating hours
    if (!this.isStoreOpen(config)) {
      return {
        isServiceable: false,
        reason: "OUTSIDE_HOURS",
        message: `Store operates between ${config.delivery.operatingHours.start} - ${config.delivery.operatingHours.end}`
      };
    }

    // Calculate distance
    const distance = this.calculateDistance(
      config.location.latitude,
      config.location.longitude,
      customerCoordinates.latitude,
      customerCoordinates.longitude
    );

    // Check if within delivery radius
    if (distance > config.delivery.radiusKm) {
      return {
        isServiceable: false,
        reason: "OUT_OF_DELIVERY_ZONE",
        message: `Delivery not available in your area. You are ${distance.toFixed(1)} km away. We deliver within ${config.delivery.radiusKm} km.`,
        distance: Math.round(distance * 10) / 10,
        maxRadius: config.delivery.radiusKm
      };
    }

    // Calculate delivery fee
    const deliveryFee = this.calculateDeliveryFee(distance, config);

    return {
      isServiceable: true,
      distance: Math.round(distance * 10) / 10,
      deliveryFee,
      estimatedTime: this.estimateDeliveryTime(distance)
    };
  }

  /**
   * Validate minimum order amount
   */
  async validateMinOrderAmount(subtotal: number): Promise<DeliveryValidation> {
    const config = await this.getStoreConfig();

    if (subtotal < config.delivery.minOrderAmount) {
      return {
        isServiceable: false,
        reason: "MIN_ORDER_NOT_MET",
        message: `Minimum order amount is ₹${config.delivery.minOrderAmount}. Please add ₹${(config.delivery.minOrderAmount - subtotal).toFixed(2)} more.`
      };
    }

    return { isServiceable: true };
  }

  /**
   * Calculate delivery fee based on distance and order value
   */
  private calculateDeliveryFee(distance: number, config: StoreConfig): number {
    // Could implement distance-based pricing here
    // For now, using flat fee with free delivery threshold
    return config.delivery.deliveryFee;
  }

  /**
   * Check if order qualifies for free delivery
   */
  async getFreeDeliveryThreshold(): Promise<number | undefined> {
    const config = await this.getStoreConfig();
    return config.delivery.freeDeliveryAbove;
  }

  /**
   * Get actual delivery fee considering free delivery threshold
   */
  async getDeliveryFeeForOrder(subtotal: number, distance: number): Promise<number> {
    const config = await this.getStoreConfig();
    
    if (config.delivery.freeDeliveryAbove && subtotal >= config.delivery.freeDeliveryAbove) {
      return 0;
    }
    
    return this.calculateDeliveryFee(distance, config);
  }

  /**
   * Get packaging fee
   */
  async getPackagingFee(): Promise<number> {
    const config = await this.getStoreConfig();
    return config.delivery.packagingFee || 0;
  }

  /**
   * Estimate delivery time based on distance
   */
  private estimateDeliveryTime(distance: number): string {
    const baseTime = 15; // Base preparation time in minutes
    const timePerKm = 3; // Minutes per km
    const totalMinutes = baseTime + Math.ceil(distance * timePerKm);
    return `${totalMinutes}-${totalMinutes + 15} mins`;
  }

  /**
   * Get available delivery slots for a date
   */
  async getAvailableSlots(date: string): Promise<Array<{ id: string; label: string; available: boolean }>> {
    const config = await this.getStoreConfig();
    
    // For MVP, return all active slots
    // TODO: Implement slot capacity tracking
    return config.delivery.slots
      .filter(slot => slot.isActive)
      .map(slot => ({
        id: slot.id,
        label: slot.label,
        available: true
      }));
  }
}

// Singleton instance
export const deliveryService = new DeliveryService();
