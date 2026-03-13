/**
 * Shared product types for MG Mart grocery application
 * 
 * ERP-centric design: Products are synced from BUSY ERP.
 * Stock and pricing are READ-ONLY in Firestore.
 * 
 * @author MG Mart Development Team
 * @version 2.0.0
 */

/**
 * Product category enumeration for organizing the grocery catalog
 */
export type ProductCategory =
    | 'Fruits & Vegetables'
    | 'Dairy & Eggs'
    | 'Bakery'
    | 'Meat & Seafood'
    | 'Pantry'
    | 'Beverages'
    | 'Snacks'
    | 'Frozen'
    | 'Personal Care'
    | 'Household';

/**
 * Product unit enumeration for different measurement types
 */
export type ProductUnit = 'kg' | 'liter' | 'piece' | 'gram' | 'ml' | 'dozen' | 'pack';

/**
 * Product data structure - ERP synced, READ-ONLY stock
 * 
 * Firestore Collection: products/{productId}
 */
export interface Product {
    /** Unique identifier (Firestore doc ID) */
    productId: string;
    
    /** ERP Stock Keeping Unit - unique identifier from BUSY */
    sku: string;
    
    /** Product display name */
    name: string;
    
    /** Detailed product description */
    description: string;
    
    // Pricing (from ERP - READ-ONLY)
    /** Maximum Retail Price */
    mrp: number;
    
    /** Actual selling price */
    sellingPrice: number;
    
    /** Discount percentage (calculated) */
    discountPercent?: number;
    
    // Inventory (synced from ERP - READ-ONLY by app)
    /** Available quantity - synced from ERP */
    stockQty: number;
    
    /** Unit of measurement */
    unit: ProductUnit;
    
    /** Minimum quantity per order (default: 1) */
    minOrderQty: number;
    
    /** Maximum quantity per order (default: 10) */
    maxOrderQty: number;
    
    // Classification
    /** Product category */
    category: ProductCategory;
    
    /** Subcategory (optional) */
    subcategory?: string;
    
    /** Brand name */
    brand?: string;
    
    /** Search tags */
    tags?: string[];
    
    // Media
    /** Primary image URL */
    imageUrl: string;
    
    /** Additional images */
    images?: string[];
    
    // Status
    /** Available for ordering */
    isActive: boolean;
    
    /** In stock (stockQty > 0) */
    isAvailable: boolean;
    
    /** Featured on homepage */
    isFeatured: boolean;
    
    // ERP Sync Metadata
    /** Last sync timestamp from ERP */
    erpLastSyncAt?: string;
    
    /** ERP internal item code */
    erpItemCode?: string;
    
    // Timestamps (ISO strings for client)
    createdAt: string;
    updatedAt: string;
}

/**
 * Lightweight product for listings (reduced payload)
 */
export interface ProductListItem {
    productId: string;
    sku: string;
    name: string;
    mrp: number;
    sellingPrice: number;
    discountPercent?: number;
    stockQty: number;
    unit: ProductUnit;
    category: ProductCategory;
    imageUrl: string;
    isActive: boolean;
    isAvailable: boolean;
    isFeatured: boolean;
}

/**
 * Filter parameters for product search and listing
 */
export interface ProductFilters {
    category?: ProductCategory;
    isFeatured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
}

/**
 * Request payload for creating new products (admin only)
 */
export interface CreateProductRequest {
    sku: string;
    name: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    stockQty: number;
    unit: ProductUnit;
    minOrderQty?: number;
    maxOrderQty?: number;
    category: ProductCategory;
    subcategory?: string;
    brand?: string;
    tags?: string[];
    imageUrl: string;
    images?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    erpItemCode?: string;
}

/**
 * Request payload for updating existing products (admin only)
 */
export interface UpdateProductRequest {
    name?: string;
    description?: string;
    mrp?: number;
    sellingPrice?: number;
    stockQty?: number;
    unit?: ProductUnit;
    minOrderQty?: number;
    maxOrderQty?: number;
    category?: ProductCategory;
    subcategory?: string;
    brand?: string;
    tags?: string[];
    imageUrl?: string;
    images?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
}
