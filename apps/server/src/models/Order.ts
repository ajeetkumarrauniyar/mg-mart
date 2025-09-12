import { Timestamp } from "firebase-admin/firestore";
import { Address } from "./User.js";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "COD" | "Online";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentDetails {
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentDetails: PaymentDetails;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentDetails: PaymentDetails;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  paymentDetails?: PaymentDetails;
}

export interface OrderResponse {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentDetails: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}
