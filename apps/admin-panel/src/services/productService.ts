import { api } from "./apiService";
import { config } from "../config";

// Product types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    stock: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    stock: number;
    isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
}

export interface ProductFilters {
    category?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

// Product service
export const productService = {
    // Get all products with filters
    getProducts: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const url = `${config.api.ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
        return await api.get<ProductListResponse>(url);
    },

    // Get single product
    getProduct: async (productId: string): Promise<Product> => {
        return await api.get<Product>(
            config.api.ENDPOINTS.PRODUCTS.DETAIL(productId)
        );
    },

    // Create new product
    createProduct: async (productData: CreateProductData): Promise<Product> => {
        return await api.post<Product>(
            config.api.ENDPOINTS.PRODUCTS.CREATE,
            productData
        );
    },

    // Update product
    updateProduct: async (
        productId: string,
        productData: UpdateProductData
    ): Promise<Product> => {
        return await api.put<Product>(
            config.api.ENDPOINTS.PRODUCTS.UPDATE(productId),
            productData
        );
    },

    // Delete product
    deleteProduct: async (productId: string): Promise<void> => {
        await api.delete(config.api.ENDPOINTS.PRODUCTS.DELETE(productId));
    },

    // Toggle product active status
    toggleProductStatus: async (productId: string): Promise<Product> => {
        return await api.patch<Product>(
            config.api.ENDPOINTS.PRODUCTS.UPDATE(productId),
            { isActive: undefined } // Server will toggle the status
        );
    },
};