import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@mg-mart/types";
import { productService } from "../services";

export interface ProductStore {
  // State
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      // Initial state
      products: [],
      featuredProducts: [],
      isLoading: false,
      error: null,

      // Actions
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await productService.getProducts();
          set({
            products: response.products,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Failed to fetch products",
          });
        }
      },

      fetchFeaturedProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await productService.getProducts();
          // Filter featured products from all products
          const featured = response.products?.filter(product => product.isFeatured) || [];
          set({
            featuredProducts: featured,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Failed to fetch featured products",
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "product-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
