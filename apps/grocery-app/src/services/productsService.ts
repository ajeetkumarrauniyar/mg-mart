import { api } from "./apiService";
import type { Product } from "@mg-mart/types";

export interface ProductsResponse {
  products: Product[];
}

// Product service
export const productService = {
  // Get all products
  getProducts: async (): Promise<ProductsResponse> => {
    return await api.get<ProductsResponse>("/products");
  },
};

export default productService;
