import { api, tokenManager } from "./api";
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
    return await api.get<User>("/auth/me");
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return await api.put<User>("/auth/profile", userData);
  },

  // Change password
  changePassword: async (
    passwordData: ChangePasswordRequest
  ): Promise<void> => {
    await api.post("/auth/change-password", passwordData);
  },

  // Forgot password - request reset
  forgotPassword: async (email: ForgotPasswordRequest): Promise<void> => {
    await api.post("/auth/forgot-password", email);
  },

  // Reset password with token
  resetPassword: async (resetData: ResetPasswordRequest): Promise<void> => {
    await api.post("/auth/reset-password", resetData);
  },

  // Refresh token
  refreshToken: async (): Promise<string> => {
    const response = await api.post<{ token: string }>("/auth/refresh");
    await tokenManager.setToken(response.token);
    return response.token;
  },

  // Verify if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await tokenManager.getToken();
    if (!token) return false;

    try {
      // Verify token with server
      await api.get("/auth/verify");
      return true;
    } catch (error) {
      // Token is invalid, remove it
      await tokenManager.removeToken();
      return false;
    }
  },
};

export default authService;
