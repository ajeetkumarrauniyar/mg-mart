import { Timestamp } from "firebase-admin/firestore";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export type UserRole = "customer" | "admin";

export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  name: string;
  phoneNumber: string;
  address: Address;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  address: Address;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  phoneNumber?: string;
  address?: Address;
}

export interface UserResponse {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
  address: Address;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
