/**
 * Store configuration and delivery types for MG Mart
 * 
 * Handles store settings, delivery zones, and serviceability validation.
 * 
 * @author MG Mart Development Team
 * @version 1.0.0
 */

/**
 * Store location coordinates
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
    /** Slot ID */
    id: string;
    
    /** Display label (e.g., "10 AM - 12 PM") */
    label: string;
    
    /** Start time HH:mm */
    startTime: string;
    
    /** End time HH:mm */
    endTime: string;
    
    /** Maximum orders per slot */
    maxOrders: number;
    
    /** Whether slot is active */
    isActive: boolean;
}

/**
 * Delivery settings for the store
 */
export interface DeliverySettings {
    /** Delivery radius in kilometers */
    radiusKm: number;
    
    /** Minimum order amount for delivery */
    minOrderAmount: number;
    
    /** Standard delivery fee */
    deliveryFee: number;
    
    /** Free delivery threshold (optional) */
    freeDeliveryAbove?: number;
    
    /** Packaging fee (optional) */
    packagingFee?: number;
    
    /** Operating hours */
    operatingHours: {
        start: string;  // "08:00"
        end: string;    // "21:00"
    };
    
    /** Available delivery slots */
    slots: DeliverySlotConfig[];
}

/**
 * Store configuration
 * 
 * Firestore Collection: storeConfig/{storeId}
 */
export interface StoreConfig {
    /** Store ID */
    storeId: string;
    
    /** Store display name */
    storeName: string;
    
    /** Store location */
    location: StoreLocation;
    
    /** Delivery settings */
    delivery: DeliverySettings;
    
    /** Store is operational */
    isActive: boolean;
    
    /** Currently accepting orders */
    isAcceptingOrders: boolean;
    
    /** Store contact phone */
    contactPhone?: string;
    
    /** Store email */
    contactEmail?: string;
    
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Customer coordinates for delivery validation
 */
export interface CustomerCoordinates {
    latitude: number;
    longitude: number;
}

/**
 * Delivery validation result
 */
export interface DeliveryValidation {
    /** Whether delivery is possible */
    isServiceable: boolean;
    
    /** Reason if not serviceable */
    reason?: 'OUT_OF_DELIVERY_ZONE' | 'STORE_CLOSED' | 'OUTSIDE_HOURS' | 'MIN_ORDER_NOT_MET';
    
    /** Human-readable message */
    message?: string;
    
    /** Distance from store in km */
    distance?: number;
    
    /** Maximum delivery radius */
    maxRadius?: number;
    
    /** Calculated delivery fee */
    deliveryFee?: number;
    
    /** Estimated delivery time */
    estimatedTime?: string;
}

/**
 * Store status response (for app to check serviceability)
 */
export interface StoreStatusResponse {
    /** Store is accepting orders */
    isOpen: boolean;
    
    /** Status message */
    message: string;
    
    /** Operating hours */
    operatingHours?: {
        start: string;
        end: string;
    };
    
    /** Delivery radius in km */
    deliveryRadiusKm: number;
    
    /** Minimum order amount */
    minOrderAmount: number;
}
