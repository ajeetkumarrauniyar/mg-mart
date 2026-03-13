/**
 * Store configuration model for MG Mart
 * 
 * Handles store settings, delivery zones, and serviceability.
 */

import { Timestamp } from "firebase-admin/firestore";

/**
 * Store location
 */
export interface StoreLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

/**
 * Delivery slot configuration
 */
export interface DeliverySlotConfig {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  isActive: boolean;
}

/**
 * Delivery settings
 */
export interface DeliverySettings {
  radiusKm: number;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryAbove?: number;
  packagingFee?: number;
  operatingHours: {
    start: string;
    end: string;
  };
  slots: DeliverySlotConfig[];
}

/**
 * Store configuration document
 * Collection: storeConfig/{storeId}
 */
export interface StoreConfig {
  storeId: string;
  storeName: string;
  location: StoreLocation;
  delivery: DeliverySettings;
  isActive: boolean;
  isAcceptingOrders: boolean;
  contactPhone?: string;
  contactEmail?: string;
  updatedAt: Timestamp;
}

/**
 * Store config response (API)
 */
export interface StoreConfigResponse {
  storeId: string;
  storeName: string;
  location: StoreLocation;
  delivery: {
    radiusKm: number;
    minOrderAmount: number;
    deliveryFee: number;
    freeDeliveryAbove?: number;
    packagingFee?: number;
    operatingHours: {
      start: string;
      end: string;
    };
  };
  isActive: boolean;
  isAcceptingOrders: boolean;
}

/**
 * Delivery validation result
 */
export interface DeliveryValidation {
  isServiceable: boolean;
  reason?: 'OUT_OF_DELIVERY_ZONE' | 'STORE_CLOSED' | 'OUTSIDE_HOURS' | 'MIN_ORDER_NOT_MET';
  message?: string;
  distance?: number;
  maxRadius?: number;
  deliveryFee?: number;
  estimatedTime?: string;
}

/**
 * Customer coordinates input
 */
export interface CustomerCoordinates {
  latitude: number;
  longitude: number;
}
