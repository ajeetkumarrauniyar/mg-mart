import { api, tokenManager } from "./apiService";
import { config } from "../config";

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: AdminUser;
}

export interface AdminUser {
    userId: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: "admin" | "customer" | "super_admin";
    createdAt: string | { _seconds: number; _nanoseconds: number };
    updatedAt: string | { _seconds: number; _nanoseconds: number };
}

// Auth service
export const authService = {
    // Admin login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            config.api.ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        // Store token after successful login
        if (response.token) {
            tokenManager.setToken(response.token);
        }

        return response;
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await api.post(config.api.ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            // Even if logout fails on server, remove local token
            console.warn("Logout request failed, but removing local token");
        } finally {
            tokenManager.removeToken();
        }
    },

    // Refresh token
    refreshToken: async (): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            config.api.ENDPOINTS.AUTH.REFRESH
        );

        if (response.token) {
            tokenManager.setToken(response.token);
        }

        return response;
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return tokenManager.isAuthenticated();
    },

    // Get current token
    getToken: (): string | null => {
        return tokenManager.getToken();
    },
};