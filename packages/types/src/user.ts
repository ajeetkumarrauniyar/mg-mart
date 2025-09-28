/**
 * Shared user types for MG Mart grocery application
 *
 * This module defines client-side user types used across all frontend applications
 * including mobile app, web app, and admin panel. These types represent the
 * user data structure as received from API responses.
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

/**
 * Address structure for user shipping and billing information
 * Used consistently across all client applications
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * User role enumeration for client-side access control
 * Determines UI features and permissions available to the user
 */
export type UserRole = "customer" | "admin";

/**
 * User data structure as received from API responses
 * Contains all user information excluding sensitive data like passwords
 */
export interface User {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
  address?: Address;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for user registration
 * Contains all required information for creating a new user account
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  address?: Address;
  role?: UserRole;
}

/**
 * Request payload for updating user profile
 * All fields are optional to support partial updates
 */
export interface UpdateUserRequest {
  name?: string;
  phoneNumber?: string;
  address?: Address;
}

/**
 * Request payload for user authentication
 * Contains credentials for login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response payload for successful authentication
 * Contains user data and authentication token
 */
export interface AuthResponse {
  user: User;
  token: string;
}
