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

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  // True once an admin has manually set/changed this product's category
  // via the admin panel. When true, the BUSY sync script must NOT
  // silently overwrite category on the next sync — it must queue the
  // BUSY-side value for review instead. See working-sync.js.
  categoryManuallySet?: boolean;
  imageUrl: string;
  stock: number;
  unit: ProductUnit;
  isFeatured: boolean;
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
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  categoryManuallySet?: boolean;
  imageUrl?: string;
  stock?: number;
  unit?: ProductUnit;
  isFeatured?: boolean;
}

export interface ProductResponse {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  categoryManuallySet?: boolean;
  imageUrl: string;
  stock: number;
  unit: ProductUnit;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}