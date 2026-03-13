/**
 * Product model for MG Mart (ERP-centric)
 * 
 * Stock and pricing are synced from BUSY ERP.
 * App/backend must NEVER modify stock directly.
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
 * Product document in Firestore (ERP-synced)
 */
export interface Product {
  productId: string;
  sku: string;                    // ERP SKU
  name: string;
  description: string;
  
  // Pricing (from ERP)
  mrp: number;
  sellingPrice: number;
  discountPercent?: number;
  
  // Inventory (READ-ONLY - synced from ERP)
  stockQty: number;
  unit: ProductUnit;
  minOrderQty: number;
  maxOrderQty: number;
  
  // Classification
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  
  // Media
  imageUrl: string;
  images?: string[];
  
  // Status
  isActive: boolean;
  isAvailable: boolean;           // stockQty > 0
  isFeatured: boolean;
  
  // ERP Sync Metadata
  erpLastSyncAt?: Timestamp;
  erpItemCode?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateProductInput {
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

export interface UpdateProductInput {
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

export interface ProductResponse {
  productId: string;
  sku: string;
  name: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  discountPercent?: number;
  stockQty: number;
  unit: ProductUnit;
  minOrderQty: number;
  maxOrderQty: number;
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  imageUrl: string;
  images?: string[];
  isActive: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  erpItemCode?: string;
  createdAt: string;
  updatedAt: string;
}
