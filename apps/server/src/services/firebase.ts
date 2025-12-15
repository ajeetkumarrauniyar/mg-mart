/**
 * Firebase Admin SDK service for MG Mart grocery application
 *
 * This module handles Firebase initialization, database connections, and provides
 * utility functions for Firestore operations. It manages the Firebase Admin SDK
 * configuration and provides a centralized way to access Firebase services.
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore";
import { getAuth as getAuthService } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Global Firestore database instance
let db: Firestore;

/**
 * Initializes Firebase Admin SDK with service account credentials
 * Uses environment variables for configuration or falls back to local key file
 * Implements singleton pattern to prevent multiple initializations
 *
 * @returns Firestore database instance
 * @throws Error if FIREBASE_PROJECT_ID is not provided
 */
export const initializeFirebase = () => {
  // Check if Firebase is already initialized to prevent duplicate initialization
  if (getApps().length === 0) {
    // Load service account credentials from environment or local file
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : firebaseKeyCredentials;

    // Validate required environment variables
    const projectId =
      process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;

    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is required");
    }

    // Initialize Firebase Admin SDK with credentials
    initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }

  // Initialize and cache Firestore database instance
  db = getFirestore();
  return db;
};

// Initialize Firebase immediately when this module is loaded
initializeFirebase();

/**
 * Returns the initialized Firestore database instance
 * Ensures Firebase is properly initialized before returning the database
 *
 * @returns Firestore database instance
 * @throws Error if Firebase hasn't been initialized
 */
export const getDb = (): Firestore => {
  if (!db) {
    throw new Error(
      "Firebase not initialized. Call initializeFirebase() first."
    );
  }
  return db;
};

/**
 * Firebase Auth instance for user authentication operations
 * Used for verifying JWT tokens and managing user authentication
 *
 * @returns Firebase Auth instance
 * @throws Error if Firebase hasn't been initialized
 */
export const getAuth = () => {
  if (getApps().length === 0) {
    throw new Error(
      "Firebase not initialized. Call initializeFirebase() first."
    );
  }
  return getAuthService();
};

/**
 * Creates a new Firestore Timestamp for the current moment
 * Used for setting createdAt and updatedAt fields in documents
 *
 * @returns Current timestamp as Firestore Timestamp
 */
export const createTimestamp = () => Timestamp.now();

/**
 * Converts Firestore Timestamp to ISO string format
 * Used for API responses where timestamps need to be serialized to JSON
 *
 * @param timestamp - Firestore Timestamp to convert
 * @returns ISO string representation of the timestamp
 */
export const timestampToString = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString();
};

/**
 * Converts ISO date string to Firestore Timestamp
 * Used when receiving date strings from API requests that need to be stored
 *
 * @param dateString - ISO date string to convert
 * @returns Firestore Timestamp object
 */
export const stringToTimestamp = (dateString: string): Timestamp => {
  return Timestamp.fromDate(new Date(dateString));
};

/**
 * Centralized collection names for consistent database structure
 * Using const assertion to ensure type safety and prevent typos
 * These names correspond to the Firestore collections in the database
 */
export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  CART: "cart",
} as const;
