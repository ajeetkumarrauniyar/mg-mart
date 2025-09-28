/**
 * User Repository for MG Mart grocery application
 *
 * This repository handles all database operations related to user management
 * including CRUD operations, authentication support, and user profile management.
 * Implements the repository pattern for clean separation of data access logic.
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import {
  getDb,
  COLLECTIONS,
  createTimestamp,
  timestampToString,
} from "../services/firebase.js";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
} from "../models/User.js";

/**
 * Repository class for user data operations
 * Provides methods for creating, reading, updating, and deleting user records
 */
export class UserRepository {
  /** Firestore database instance */
  private db = getDb();
  /** Reference to the users collection */
  private collection = this.db.collection(COLLECTIONS.USERS);

  /**
   * Creates a new user account in the database
   * Generates a unique user ID and sets creation timestamps
   *
   * @param userData - User data for account creation
   * @returns Promise resolving to the created user response
   * @throws Error if user creation fails
   */
  async create(userData: CreateUserInput): Promise<UserResponse> {
    // Generate unique user ID
    const userId = this.db.collection(COLLECTIONS.USERS).doc().id;
    const now = createTimestamp();

    // Create user document with all required fields
    const user: User = {
      userId,
      email: userData.email,
      passwordHash: userData.password, // Note: Password should be hashed before calling this method
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      ...(userData.address && { address: userData.address }), // Only include address if provided
      role: userData.role || "customer", // Default to customer role
      createdAt: now,
      updatedAt: now,
    };

    // Save user to Firestore
    await this.collection.doc(userId).set(user);
    return this.toResponse(user);
  }

  /**
   * Retrieves a user by their unique ID
   *
   * @param userId - Unique identifier for the user
   * @returns Promise resolving to user response or null if not found
   */
  async findById(userId: string): Promise<UserResponse | null> {
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    return this.toResponse(doc.data() as User);
  }

  /**
   * Finds a user by their email address
   * Used for authentication and duplicate email checking
   *
   * @param email - Email address to search for
   * @returns Promise resolving to user data or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return null;
    }
    const userData = snapshot.docs[0]?.data();
    return userData ? (userData as User) : null;
  }

  /**
   * Updates an existing user's profile information
   * Only updates provided fields, leaving others unchanged
   *
   * @param userId - ID of the user to update
   * @param updateData - Partial user data to update
   * @returns Promise resolving to updated user response or null if user not found
   */
  async update(
    userId: string,
    updateData: UpdateUserInput
  ): Promise<UserResponse | null> {
    const userRef = this.collection.doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return null;
    }

    // Prepare update data with timestamp
    const updatedData = {
      ...updateData,
      updatedAt: createTimestamp(),
    };

    // Apply updates to the document
    await userRef.update(updatedData);

    // Return updated user data
    const updatedDoc = await userRef.get();
    return this.toResponse(updatedDoc.data() as User);
  }

  /**
   * Deletes a user account from the database
   *
   * @param userId - ID of the user to delete
   * @returns Promise resolving to true if deleted, false if user not found
   */
  async delete(userId: string): Promise<boolean> {
    const userRef = this.collection.doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return false;
    }

    await userRef.delete();
    return true;
  }

  /**
   * Retrieves a paginated list of users
   * Ordered by creation date (newest first)
   *
   * @param limit - Maximum number of users to return (default: 10)
   * @param offset - Number of users to skip (default: 0)
   * @returns Promise resolving to array of user responses
   */
  async list(limit: number = 10, offset: number = 0): Promise<UserResponse[]> {
    const snapshot = await this.collection
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    return snapshot.docs.map((doc) => this.toResponse(doc.data() as User));
  }

  /**
   * Converts internal User model to UserResponse for API responses
   * Removes sensitive information and converts timestamps to strings
   *
   * @param user - Internal user model
   * @returns User response object safe for API responses
   */
  private toResponse(user: User): UserResponse {
    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      // Only include address if it's provided
      ...(user.address && { address: user.address }),
      role: user.role,
      createdAt: timestampToString(user.createdAt),
      updatedAt: timestampToString(user.updatedAt),
    };
  }

  /**
   * Checks the health of the repository by attempting to get a sample document
   * Used for monitoring and debugging purposes
   *
   * @returns Promise resolving to true if health check succeeds, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    try {
      // For UserRepository
      await this.collection.orderBy("createdAt", "desc").limit(1).get();
      return true;
    } catch (error) {
      console.error("Repository health check failed:", error);
      return false;
    }
  }
}
