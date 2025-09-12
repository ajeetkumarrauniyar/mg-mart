import { Timestamp } from "firebase-admin/firestore";

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Timestamp;
}

export interface CartItemWithProduct {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  addedAt: Timestamp;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartItemResponse {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  addedAt: string;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
}
