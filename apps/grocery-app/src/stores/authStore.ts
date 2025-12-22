import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@mg-mart/types";
import {
  authService,
  type LoginRequest,
  type RegisterRequest,
} from "@/services";

export interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        console.log('🔐 Starting login process...');
        set({ isLoading: true, error: null });
        try {
          console.log('📡 Calling auth service...');
          const response = await authService.login(credentials);
          console.log('✅ Login successful, setting auth state...');
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log('🎉 Auth state updated, user is now authenticated');

          // Clear wishlist for new user session
          try {
            const { useWishlistStore } = await import('./wishlistStore');
            useWishlistStore.getState().setUserId(response.user.userId);
          } catch (error) {
            console.warn('Failed to set wishlist user ID on login:', error);
          }

          // Sync cart after successful login
          try {
            const { useCartStore } = await import('./cartStore');
            await useCartStore.getState().syncWithServer();
          } catch (syncError) {
            console.warn('Cart sync failed after login:', syncError);
          }
        } catch (error: any) {
          console.error('❌ Login failed:', error);
          set({
            isLoading: false,
            error: error.message || "Login failed",
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Clear wishlist for new user
          try {
            const { useWishlistStore } = await import('./wishlistStore');
            useWishlistStore.getState().setUserId(response.user.userId);
          } catch (error) {
            console.warn('Failed to set wishlist user ID on registration:', error);
          }

          // Sync cart after successful registration
          try {
            const { useCartStore } = await import('./cartStore');
            await useCartStore.getState().syncWithServer();
          } catch (syncError) {
            console.warn('Cart sync failed after registration:', syncError);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Registration failed",
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear cart on logout
        try {
          const { useCartStore } = require('./cartStore');
          useCartStore.getState().clearCart();
        } catch (error) {
          console.warn('Failed to clear cart on logout:', error);
        }

        // Clear wishlist on logout
        try {
          const { useWishlistStore } = require('./wishlistStore');
          useWishlistStore.getState().setUserId(null);
        } catch (error) {
          console.warn('Failed to clear wishlist on logout:', error);
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error("No user logged in");

        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authService.updateProfile(data);
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Profile update failed",
          });
          throw error;
        }
      },

      loadStoredAuth: async () => {
        // This will be called automatically by the persist middleware
        // Additional logic can be added here if needed
        const { token } = get();
        if (token) {
          try {
            // Verify token is still valid
            await authService.verifyToken();
          } catch (error) {
            // Token is invalid, clear auth state
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          }
        }
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) throw new Error("No token to refresh");

        set({ isLoading: true, error: null });
        try {
          const response = await authService.refreshToken();
          set({
            token: response.token,
            user: response.user || get().user,
            isLoading: false,
            error: null,
          });
          return response.token;
        } catch (error: any) {
          // Refresh failed, logout user
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || "Token refresh failed",
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword({ currentPassword, newPassword });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Password change failed",
          });
          throw error;
        }
      },

      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.deleteAccount();
          // Clear all user data after successful deletion
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Account deletion failed",
          });
          throw error;
        }
      },

      refreshProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authService.refreshProfile();
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Failed to refresh profile",
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
