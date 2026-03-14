import { create } from "zustand";
import { Product } from "@mg-mart/types";
import { productService, ProductQueryParams } from "../services/productsService";

const PAGE_SIZE = 20;
const FEATURED_LIMIT = 10;

export interface ProductStore {
  // ─── Catalog list (paginated) ────────────────────────────────────────────
  products: Product[];
  hasMore: boolean;
  offset: number;
  isFetchingMore: boolean;
  /** Active filters/search applied to the catalog. */
  activeParams: Omit<ProductQueryParams, "limit" | "offset">;

  // ─── Featured (home screen only) ─────────────────────────────────────────
  featuredProducts: Product[];

  // ─── Shared ───────────────────────────────────────────────────────────────
  isLoading: boolean;
  error: string | null;

  // ─── Actions ─────────────────────────────────────────────────────────────
  /**
   * Fetches the first page. Pass params to apply server-side
   * category/search/featured filters. Always resets the product list.
   */
  fetchProducts: (params?: Omit<ProductQueryParams, "limit" | "offset">) => Promise<void>;

  /**
   * Appends the next page to the existing product list.
   * No-ops when isLoading, isFetchingMore, or !hasMore.
   */
  loadMoreProducts: () => Promise<void>;

  /**
   * Fetches featured products independently (home screen).
   * Does NOT touch the main products[] list.
   */
  fetchFeaturedProducts: () => Promise<void>;

  clearError: () => void;
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  // ─── Initial state ────────────────────────────────────────────────────────
  products: [],
  hasMore: true,
  offset: 0,
  isFetchingMore: false,
  activeParams: {},

  featuredProducts: [],

  isLoading: false,
  error: null,

  // ─── Actions ──────────────────────────────────────────────────────────────
  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null, activeParams: params });
    try {
      const response = await productService.getProducts({
        ...params,
        limit: PAGE_SIZE,
        offset: 0,
      });

      set({
        products: response.products,
        hasMore: response.pagination.hasMore,
        offset: response.products.length,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch products",
      });
    }
  },

  loadMoreProducts: async () => {
    const { isLoading, isFetchingMore, hasMore, offset, activeParams } = get();

    // Guard: nothing to do if already loading or no more pages
    if (isLoading || isFetchingMore || !hasMore) return;

    set({ isFetchingMore: true });
    try {
      const response = await productService.getProducts({
        ...activeParams,
        limit: PAGE_SIZE,
        offset,
      });

      set((state) => ({
        products: [...state.products, ...response.products],
        hasMore: response.pagination.hasMore,
        offset: state.offset + response.products.length,
        isFetchingMore: false,
      }));
    } catch (error: any) {
      set({
        isFetchingMore: false,
        error: error.message || "Failed to load more products",
      });
    }
  },

  fetchFeaturedProducts: async () => {
    // Does not set global isLoading — runs independently of the catalog list
    try {
      const response = await productService.getProducts({
        featured: true,
        limit: FEATURED_LIMIT,
        offset: 0,
      });
      set({ featuredProducts: response.products });
    } catch (error: any) {
      // Non-critical — home screen degrades gracefully if this fails
      console.warn("⚠️ Failed to fetch featured products:", error.message);
    }
  },

  clearError: () => set({ error: null }),
}));
