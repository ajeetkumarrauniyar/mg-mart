import { api } from "./apiService";
import type { User } from "@mg-mart/types";

// User profile types
export interface UpdateProfileRequest {
    name?: string | undefined;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export const userService = {
    // Get current user profile
    getProfile: async (): Promise<User> => {
        return await api.get<User>("/users/profile");
    },

    // Update user profile
    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        return await api.put<User>("/users/profile", data);
    },

    // Change password
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await api.put("/users/change-password", data);
    },

    // Delete account
    deleteAccount: async (): Promise<void> => {
        await api.delete("/users/account");
    },
};

export default userService;
