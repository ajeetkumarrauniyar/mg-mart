/**
 * User Controller for MG Mart grocery application
 *
 * Handles user registration, authentication, profile management,
 * and user-related operations with proper validation and error handling.
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
// Import the auth middleware to get the Request type extension
import "../middleware/auth.js";
import { UserRepository } from "../repositories/UserRepository.js";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePhoneNumber,
} from "../utils/validation.js";
import { ApiError } from "../utils/errorHandler.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
} from "../models/User.js";

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user account
   * Validates input, checks for existing email, hashes password, and creates user
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone, address } = req.body;

      // Validate required fields
      validateRequired(email, "email");
      validateRequired(password, "password");
      validateRequired(firstName, "firstName");
      validateRequired(lastName, "lastName");

      if (!validateEmail(email)) {
        throw new ApiError("Invalid email format", 400);
      }
      validatePassword(password);

      // Validate phone number if provided
      if (phone && !validatePhoneNumber(phone)) {
        throw new ApiError("Invalid phone number format", 400);
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ApiError("User with this email already exists", 409);
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user input
      const createUserInput: CreateUserInput = {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        phoneNumber: phone,
        ...(address && { address }), // Only include address if provided
      };

      // Create user
      const user = await this.userRepository.create(createUserInput);

      // Generate JWT token
      const token = this.generateToken(user.userId);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Authenticate user login
   * Validates credentials and returns JWT token
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate input
      validateRequired(email, "email");
      validateRequired(password, "password");
      validateEmail(email);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new ApiError("Invalid email or password", 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new ApiError("Invalid email or password", 401);
      }

      // Generate JWT token
      const token = this.generateToken(user.userId);

      // Remove password from response
      const { passwordHash: _, ...userResponse } = user;

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user
   * In a stateless JWT system, logout is handled client-side by removing the token
   * This endpoint can be used for logging purposes or future token blacklisting
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // In a stateless JWT system, logout is primarily handled client-side
      // This endpoint can be used for audit logging or future token blacklisting
      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh JWT token
   * Generates a new token for the authenticated user
   */
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        throw new ApiError("Access token required", 401);
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new ApiError("JWT secret not configured", 500);
      }

      // Verify the current token (even if expired, we can still decode it)
      let decoded;
      try {
        decoded = jwt.verify(token, secret) as any;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          // Allow refresh of expired tokens
          decoded = jwt.decode(token) as any;
        } else {
          throw new ApiError("Invalid token", 401);
        }
      }

      if (!decoded || !decoded.userId) {
        throw new ApiError("Invalid token", 401);
      }

      // Verify user still exists
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new ApiError("User not found", 401);
      }

      // Generate new token
      const newToken = this.generateToken(decoded.userId);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   * Returns authenticated user's profile information
   */
  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError("User not found", 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * Get user by ID
   */
  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        throw new ApiError("User ID is required", 400);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError("User not found", 404);
      }

      res.json({
        success: true,
        message: "User fetched successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * Update user profile
   * Allows partial updates to user information
   */
  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { email, firstName, lastName, phone, address } = req.body;

      // Validate email if provided
      if (email) {
        if (!validateEmail(email)) {
          throw new ApiError("Invalid email format", 400);
        }

        // Check if email is already taken by another user
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser && existingUser.userId !== userId) {
          throw new ApiError("Email is already taken", 409);
        }
      }

      // Validate phone number if provided
      if (phone && !validatePhoneNumber(phone)) {
        throw new ApiError("Invalid phone number format", 400);
      }

      const updateData: UpdateUserInput = {
        ...(email && { email }),
        ...((firstName || lastName) && {
          name:
            firstName && lastName
              ? `${firstName} ${lastName}`
              : firstName || lastName,
        }),
        ...(phone && { phoneNumber: phone }),
        ...(address && { address }),
      };

      const updatedUser = await this.userRepository.update(userId, updateData);
      if (!updatedUser) {
        throw new ApiError("User not found", 404);
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change user password
   * Validates current password and updates to new password
   */
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const { currentPassword, newPassword } = req.body;

      // Validate input
      validateRequired(currentPassword, "currentPassword");
      validateRequired(newPassword, "newPassword");
      validatePassword(newPassword);

      // Get user with password
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError("User not found", 404);
      }

      // For now, we'll need to get user by email to access passwordHash
      // This is a limitation of the current repository design
      const userWithPassword = await this.userRepository.findByEmail(
        user.email
      );
      if (!userWithPassword) {
        throw new ApiError("User not found", 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        userWithPassword.passwordHash
      );
      if (!isCurrentPasswordValid) {
        throw new ApiError("Current password is incorrect", 400);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password hash in the database
      const passwordUpdated = await this.userRepository.updatePassword(userId, hashedNewPassword);

      if (!passwordUpdated) {
        throw new ApiError("Failed to update password", 500);
      }

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user account
   * Permanently removes user account and associated data
   */
  deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("User not authenticated", 401);
      }

      const deleted = await this.userRepository.delete(userId);
      if (!deleted) {
        throw new ApiError("User not found", 404);
      }

      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Forgot password - sends reset email
   * Generates a password reset token and sends it via email
   */
  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;

      validateRequired(email, "email");
      if (!validateEmail(email)) {
        throw new ApiError("Invalid email format", 400);
      }

      // Check if user exists
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        res.json({
          success: true,
          message: "If the email exists, a password reset link has been sent",
        });
        return;
      }

      // Generate reset token (in production, implement proper token generation and email sending)
      const resetToken = jwt.sign(
        { userId: user.userId, type: "password-reset" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      // TODO: Send email with reset token
      // For now, just return success (in production, implement email service)

      res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password using reset token
   * Validates reset token and updates user password
   */
  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      validateRequired(token, "token");
      validateRequired(newPassword, "newPassword");
      validatePassword(newPassword);

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      if (decoded.type !== "password-reset") {
        throw new ApiError("Invalid reset token", 400);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const passwordUpdated = await this.userRepository.updatePassword(
        decoded.userId,
        hashedPassword
      );

      if (!passwordUpdated) {
        throw new ApiError("User not found", 404);
      }

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError("Invalid or expired reset token", 400));
      } else {
        next(error);
      }
    }
  };

  /**
   * Generate JWT token for user authentication
   */
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new ApiError("JWT secret not configured", 500);
    }

    return jwt.sign({ userId }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    } as jwt.SignOptions);
  }
}
