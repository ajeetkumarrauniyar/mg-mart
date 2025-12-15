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
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

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
export const initializeFirebase = async () => {
  // Check if Firebase is already initialized to prevent duplicate initialization
  if (getApps().length === 0) {
    // Load service account credentials from environment variables or file
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (error) {
        throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format - must be valid JSON");
      }
    } else {
      // Fallback to key.json file for local development
      try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const keyPath = path.resolve(__dirname, "../../key.json");
        const keyContent = fs.readFileSync(keyPath, "utf8");
        serviceAccount = JSON.parse(keyContent);
      } catch (error) {
        throw new Error("Firebase service account credentials not found - please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable or ensure key.json file exists");
      }
    }

    // Validate required environment variables
    const projectId =
      process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;

    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is required");
    }

    try {
      // Initialize Firebase Admin SDK with credentials
      initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      throw error;
    }
  }

  // Initialize and cache Firestore database instance
  db = getFirestore();
  return db;
};

// Initialize Firebase immediately when this module is loaded
(async () => {
  try {
    await initializeFirebase();
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    process.exit(1);
  }
})();

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
