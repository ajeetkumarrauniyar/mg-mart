import { api } from "./api";
import type { Product } from "@mg-mart/types";

// Product query parameters
export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "name" | "price" | "rating" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CategoryResponse {
  categories: string[];
}

export interface FeaturedProductsResponse {
  featured: Product[];
  onSale: Product[];
  newArrivals: Product[];
}

// Product service
export const productService = {
  // Get all products with filtering and pagination
  getProducts: async (
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : "/products";

    return await api.get<ProductsResponse>(url);
  },

  // Get single product by ID
  getProduct: async (productId: string): Promise<Product> => {
    return await api.get<Product>(`/products/${productId}`);
  },

  // Search products
  searchProducts: async (
    query: string,
    filters: Omit<ProductFilters, "search"> = {}
  ): Promise<ProductsResponse> => {
    return await productService.getProducts({ ...filters, search: query });
  },

  //TODO:x Get products by category
  getProductsByCategory: async (
    category: string,
    filters: Omit<ProductFilters, "category"> = {}
  ): Promise<ProductsResponse> => {
    return await productService.getProducts({ ...filters, category });
  },

  //TODO: Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<CategoryResponse>("/products/categories");
    return response.categories;
  },

  //TODO: Get featured products, on sale items, and new arrivals
  getFeaturedProducts: async (): Promise<FeaturedProductsResponse> => {
    return await api.get<FeaturedProductsResponse>("/products/featured");
  },

  //TODO: Get products on sale
  getSaleProducts: async (
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> => {
    // This could be implemented as a special filter or separate endpoint
    return await api.get<ProductsResponse>("/products/on-sale");
  },

  //TODO: Get new arrival products
  getNewArrivals: async (
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> => {
    return await api.get<ProductsResponse>("/products/new-arrivals");
  },

  //TODO: Get related products
  getRelatedProducts: async (
    productId: string,
    limit: number = 4
  ): Promise<Product[]> => {
    return await api.get<Product[]>(
      `/products/${productId}/related?limit=${limit}`
    );
  },

  //TODO: Check product availability
  checkAvailability: async (
    productId: string,
    quantity: number = 1
  ): Promise<{ available: boolean; stock: number }> => {
    return await api.get<{ available: boolean; stock: number }>(
      `/products/${productId}/availability?quantity=${quantity}`
    );
  },
};

export default productService;
