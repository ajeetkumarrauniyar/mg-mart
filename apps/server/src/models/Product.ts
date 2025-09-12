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
  imageUrl: string;
  stock: number;
  unit: ProductUnit;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
