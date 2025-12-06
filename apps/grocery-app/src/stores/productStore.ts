import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@mg-mart/types";
import { productService } from "../services";

export interface ProductStore {
  // State
  products: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      // Initial state
      products: [],
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
