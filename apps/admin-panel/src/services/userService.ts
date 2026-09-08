import { api } from "./apiService";
import { config } from "../config";

// User types with additional customer fields
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

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: "customer" | "admin";
}

// User service
export const userService = {
    // Get all users
    getUsers: async (): Promise<UserListResponse> => {
        try {
            const response = await api.get<UserListResponse>(config.api.ENDPOINTS.USERS.LIST);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Update user
    updateUser: async (
        userId: string,
        userData: UpdateUserData
    ): Promise<User> => {
        console.log('🔄 Updating user:', userId, userData);

        try {
            const response = await api.put<User>(
                config.api.ENDPOINTS.USERS.PROFILE_UPDATE,
                {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone
                }
            );
            console.log('✅ User updated successfully:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Update user error:', error);
            throw error;
        }
    },

    // Get User by Id
    getUserById: async (userId: string): Promise<User> => {
        return await api.get<User>(
            config.api.ENDPOINTS.USERS.DETAIL(userId)
        );
    },
};