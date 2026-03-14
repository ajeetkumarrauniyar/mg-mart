import { api } from "./apiService";
import type { Product } from "@mg-mart/types";

// ─── Query params ─────────────────────────────────────────────────────────────
export interface ProductQueryParams {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}

// ─── Response shape ───────────────────────────────────────────────────────────
export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ─── Product service ──────────────────────────────────────────────────────────
export const productService = {
  /**
   * Fetches a paginated, server-filtered slice of the product catalog.
   * Never fetches all products; relies on backend query params.
   */
  getProducts: async (params: ProductQueryParams = {}): Promise<ProductsResponse> => {
    const query = new URLSearchParams();
    if (params.limit !== undefined) query.append("limit", String(params.limit));
    if (params.offset !== undefined) query.append("offset", String(params.offset));
    if (params.category) query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    if (params.featured) query.append("featured", "true");

    const qs = query.toString();
    return await api.get<ProductsResponse>(`/products${qs ? `?${qs}` : ""}`);
  },
};

export default productService;
