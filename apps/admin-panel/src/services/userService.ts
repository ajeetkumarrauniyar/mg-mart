import { api } from "./apiService";
import { config } from "../config";

// User types based on actual API response with additional customer fields
export interface User {
    userId: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: "customer" | "admin" | "super_admin";
    createdAt: string | { _seconds: number; _nanoseconds: number };
    updatedAt: string | { _seconds: number; _nanoseconds: number };
    // Additional customer fields
    orderCount?: number;
    totalSpent?: number;
    lastOrderDate?: string;
    lastOrderId?: string;
}

export interface UserListResponse {
    users: User[];
    pagination?: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface UserFilters {
    role?: "customer" | "admin";
    search?: string;
    page?: number;
    limit?: number;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: "customer" | "admin";
}

// User service
export const userService = {
    // Get all users with filters
    getUsers: async (filters: UserFilters = {}): Promise<UserListResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const url = `${config.api.ENDPOINTS.USERS.LIST}?${params.toString()}`;
        return await api.get<UserListResponse>(url);
    },

    // Get single user
    getUser: async (userId: string): Promise<User> => {
        return await api.get<User>(
            config.api.ENDPOINTS.USERS.DETAIL(userId)
        );
    },

    // Update user
    updateUser: async (
        userId: string,
        userData: UpdateUserData
    ): Promise<User> => {
        return await api.put<User>(
            config.api.ENDPOINTS.USERS.UPDATE(userId),
            userData
        );
    },

    // Delete user
    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(config.api.ENDPOINTS.USERS.DELETE(userId));
    },

    // Toggle user active status
    toggleUserStatus: async (userId: string): Promise<User> => {
        return await api.patch<User>(
            config.api.ENDPOINTS.USERS.UPDATE(userId),
            { isActive: undefined } // Server will toggle the status
        );
    },
};