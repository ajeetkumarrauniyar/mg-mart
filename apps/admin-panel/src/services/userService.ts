import { api } from "./apiService";
import { config } from "../config";

// User types
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    isActive: boolean;
    role: "customer" | "admin";
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    orderCount: number;
    totalSpent: number;
}

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
}

export interface UserFilters {
    role?: "customer" | "admin";
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
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