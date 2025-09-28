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
    /** Street address including house number and street name */
    street: string;
    /** City name */
    city: string;
    /** State or province */
    state: string;
    /** Postal/ZIP code */
    zipCode: string;
}

/**
 * User role enumeration for client-side access control
 * Determines UI features and permissions available to the user
 */
export type UserRole = 'customer' | 'admin';

/**
 * User data structure as received from API responses
 * Contains all user information excluding sensitive data like passwords
 */
export interface User {
    /** Unique identifier for the user */
    userId: string;
    /** User's email address */
    email: string;
    /** User's full name */
    name: string;
    /** Contact phone number */
    phoneNumber: string;
    /** Complete address information */
    address: Address;
    /** User's role in the system */
    role: UserRole;
    /** Account creation timestamp as ISO string */
    createdAt: string;
    /** Last update timestamp as ISO string */
    updatedAt: string;
}

/**
 * Request payload for user registration
 * Contains all required information for creating a new user account
 */
export interface CreateUserRequest {
    /** User's email address */
    email: string;
    /** Plain text password */
    password: string;
    /** User's full name */
    name: string;
    /** Contact phone number */
    phoneNumber: string;
    /** Complete address information */
    address: Address;
    /** Optional role assignment (defaults to 'customer') */
    role?: UserRole;
}

/**
 * Request payload for updating user profile
 * All fields are optional to support partial updates
 */
export interface UpdateUserRequest {
    /** Updated full name */
    name?: string;
    /** Updated phone number */
    phoneNumber?: string;
    /** Updated address information */
    address?: Address;
}

/**
 * Request payload for user authentication
 * Contains credentials for login
 */
export interface LoginRequest {
    /** User's email address */
    email: string;
    /** User's password */
    password: string;
}

/**
 * Response payload for successful authentication
 * Contains user data and authentication token
 */
export interface AuthResponse {
    /** User information */
    user: User;
    /** JWT token for authenticated requests */
    token: string;
}