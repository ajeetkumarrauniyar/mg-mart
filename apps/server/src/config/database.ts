import admin, { ServiceAccount } from "firebase-admin";
import firebaseKeyCredentials from "../../key.json" with { type: "json" };

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(firebaseKeyCredentials as ServiceAccount),
});

// Export the Firestore database instance for CRUD operations
// This will be used throughout the app for database queries, writes, and transactions
export const db = admin.firestore();

// Export the admin instance for additional Firebase services
// This provides access to auth, storage, messaging, and other Firebase Admin SDK features
export { admin };
