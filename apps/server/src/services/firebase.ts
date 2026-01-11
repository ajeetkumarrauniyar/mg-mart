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
import { readFileSync, existsSync } from "fs";
import { join } from "path";
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
    let serviceAccount: any = {};

    // Try to load service account from environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('Firebase: Using service account from environment variable');
      } catch (error) {
        console.error('Firebase: Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
      }
    } else {
      // Try to load from file
      try {
        let keyPath = join(process.cwd(), 'firebase-service-account.json');
        if (!existsSync(keyPath)) {
          // Try alternative filename
          keyPath = join(process.cwd(), 'key.json');
        }

        if (existsSync(keyPath)) {
          const keyContent = readFileSync(keyPath, 'utf8');
          serviceAccount = JSON.parse(keyContent);
          console.log(`Firebase: Using service account from file: ${keyPath}`);
        } else {
          console.warn('Firebase: No service account key found (environment or file)');
        }
      } catch (error) {
        console.warn('Firebase: Could not load service account from file');
      }
    }

    // Validate required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;

    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is required");
    }

    // Initialize Firebase Admin SDK with credentials
    const initConfig: any = { projectId };

    // Only add credentials if we have a valid service account
    if (serviceAccount.private_key && serviceAccount.client_email) {
      initConfig.credential = cert(serviceAccount);
    } else {
      console.warn('Firebase: No valid service account credentials found, using default credentials');
    }

    initializeApp(initConfig);
  }

  // Initialize and cache Firestore database instance
  db = getFirestore();
  return db;
};

// Initialize Firebase immediately when this module is loaded
initializeFirebase();

// Export the db instance for direct access
export { db };

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
