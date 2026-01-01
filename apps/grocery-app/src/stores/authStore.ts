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
  setUser: (user: User) => void;
  loadStoredAuth: () => Promise<void>;
  refreshToken: () => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true until rehydration completes
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
          useCartStore.getState().clearCart(true); // Skip API call
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
          // If data is a complete User object (from API response), use it directly
          // Otherwise, make API call to update profile
          let updatedUser: User;
          if (data.userId && data.name && data.email) {
            // This is already a complete User object from API response
            updatedUser = data as User;
          } else {
            // This is partial data, make API call
            updatedUser = await authService.updateProfile(data);
          }

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

      setUser: (user: User) => {
        console.log('🔄 Setting user in auth store:', user);
        set({ user });
        console.log('✅ User set in auth store successfully');

        // Force persist to storage immediately
        try {
          const state = get();
          console.log('💾 Current auth state after setUser:', { user: state.user, isAuthenticated: state.isAuthenticated });
        } catch (error) {
          console.error('❌ Error checking auth state:', error);
        }
      },

      loadStoredAuth: async () => {
        console.log('🔄 Loading stored auth...');
        set({ isLoading: true });

        const { token, user } = get();
        console.log('📊 Stored auth data:', { hasToken: !!token, hasUser: !!user });

        if (token && user) {
          console.log('✅ Found stored auth data, setting authenticated state');
          // We have stored auth data, set as authenticated immediately
          set({ isAuthenticated: true, isLoading: false });

          // Note: Token verification will happen automatically on API calls
          // No need to verify here since /auth/verify endpoint doesn't exist
        } else {
          console.log('❌ No stored auth data found');
          set({ isAuthenticated: false, isLoading: false });
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
        // Don't persist isAuthenticated - it will be set by loadStoredAuth
      }),
      onRehydrateStorage: () => (state) => {
        return (state: any, error: any) => {
          if (error) {
            console.error('❌ Auth store rehydration error:', error);
            return;
          }

          console.log('🔄 Auth store rehydrated:', {
            hasUser: !!state?.user,
            hasToken: !!state?.token
          });

          // Call loadStoredAuth after rehydration to set isAuthenticated
          if (state) {
            state.loadStoredAuth();
          }
        };
      },
    }
  )
);
