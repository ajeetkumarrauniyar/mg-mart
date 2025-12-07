import { api, tokenManager } from "./apiService";
import type { User } from "@mg-mart/types";

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Authentication service
export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);

    // Store token after successful login
    await tokenManager.setToken(response.token);

    return response;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);

    // Store token after successful registration
    await tokenManager.setToken(response.token);

    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post("/auth/logout");
    } catch (error) {
      // Continue with local logout even if server request fails
      console.error("Server logout failed:", error);
    } finally {
      // Always remove local token
      await tokenManager.removeToken();
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    return await api.get<User>("/users/profile");
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return await api.put<User>("/users/profile", userData);
  },

  // Change password
  changePassword: async (
    passwordData: ChangePasswordRequest
  ): Promise<void> => {
    await api.put("/users/change-password", passwordData);
  },

  // Delete account
  deleteAccount: async (): Promise<void> => {
    await api.delete("/users/account");
  },

  // Refresh profile
  refreshProfile: async (): Promise<User> => {
    return await api.get<User>("/users/profile");
  },
};

export default authService;
