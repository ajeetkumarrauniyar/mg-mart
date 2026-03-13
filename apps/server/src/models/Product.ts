/**
 * Product model for MG Mart grocery application
 * 
 * Extended for ERP-centric design while maintaining backward compatibility.
 * Stock and pricing are synced from BUSY ERP - READ-ONLY by app.
 * 
 * @author MG Mart Development Team
 * @version 2.0.0
 */

import { Timestamp } from "firebase-admin/firestore";

export type ProductCategory =
  | "Fruits & Vegetables"
  | "Dairy & Eggs"
  | "Bakery"
  | "Meat & Seafood"
  | "Pantry"
  | "Beverages"
  | "Snacks"
  | "Frozen"
  | "Personal Care"
  | "Household";

export type ProductUnit =
  | "kg"
  | "liter"
  | "piece"
  | "gram"
  | "ml"
  | "dozen"
  | "pack";

/**
 * Product document in Firestore
 * Extended with ERP fields while keeping original fields
 */
export interface Product {
  productId: string;
  name: string;
  description: string;
  
  // Original pricing field (kept for backward compatibility)
  price: number;
  
  // NEW: ERP pricing fields
  sku?: string;                    // ERP Stock Keeping Unit
  mrp?: number;                    // Maximum Retail Price
  sellingPrice?: number;           // Actual selling price (defaults to price)
  discountPercent?: number;        // Calculated discount
  
  category: ProductCategory;
  imageUrl: string;
  images?: string[];               // NEW: Additional images
  
  // Original stock field (kept for backward compatibility)
  stock: number;
  
  // NEW: Enhanced inventory fields
  stockQty?: number;               // Alias for stock (ERP terminology)
  minOrderQty?: number;            // Minimum order quantity (default: 1)
  maxOrderQty?: number;            // Maximum order quantity (default: 10)
  
  unit: ProductUnit;
  isFeatured: boolean;
  
  // NEW: Status fields
  isActive?: boolean;              // Available for ordering (default: true)
  isAvailable?: boolean;           // In stock (stock > 0)
  
  // NEW: Classification
  subcategory?: string;
  brand?: string;
  tags?: string[];
  
  // NEW: ERP Sync Metadata
  erpItemCode?: string;            // ERP internal item code
  erpLastSyncAt?: Timestamp;       // Last sync from ERP
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  unit: ProductUnit;
  isFeatured?: boolean;
  // NEW optional fields
  sku?: string;
  mrp?: number;
  sellingPrice?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  isActive?: boolean;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  erpItemCode?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  imageUrl?: string;
  stock?: number;
  unit?: ProductUnit;
  isFeatured?: boolean;
  // NEW optional fields
  sku?: string;
  mrp?: number;
  sellingPrice?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  isActive?: boolean;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  images?: string[];
}

export interface ProductResponse {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  unit: ProductUnit;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // NEW optional fields in response
  sku?: string;
  mrp?: number;
  sellingPrice?: number;
  discountPercent?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  erpItemCode?: string;
}
