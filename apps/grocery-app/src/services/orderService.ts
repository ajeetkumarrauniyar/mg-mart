import { api } from "./apiService";
import { locationService } from "./location";
import type { Order } from "@mg-mart/types";
import type { LocationValidationResult } from "./location";

// Order request/response types
export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface CreateOrderRequest {
    paymentMethod: 'COD' | 'Online';
    shippingAddress: ShippingAddress;
    notes?: string;
    locationValidation?: LocationValidationResult; // Optional location validation data
}

export interface OrdersListResponse {
    orders: Order[];
    pagination?: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

// Order service
export const orderService = {
    // Validates location before order creation
    validateLocationForOrder: async (): Promise<LocationValidationResult> => {
        try {
            return await locationService.validateOrderLocation();
        } catch (error) {
            console.error('Location validation failed:', error);
            throw new Error(`Location validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Create a new order from user's cart with location validation
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        try {
            // If location validation is already provided (from checkout screen), use it
            let locationValidation = orderData.locationValidation;

            // Only validate location if not already provided
            if (!locationValidation) {
                locationValidation = await orderService.validateLocationForOrder();

                // If location validation fails, throw error
                if (!locationValidation.isValid) {
                    throw new Error(`Order cannot be placed: ${locationValidation.message}`);
                }
            }

            // Include location validation in order data
            const orderWithLocation = {
                ...orderData,
                locationValidation
            };

            const response = await api.post<Order>("/orders", orderWithLocation);
            return response;
        } catch (error) {
            console.error('Order creation failed:', error);
            throw error;
        }
    },

    // Get all orders for the current user (server-side filtered)
    getOrders: async (limit = 20, offset = 0): Promise<OrdersListResponse> => {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
        queryParams.append('offset', offset.toString());

        const response = await api.get<OrdersListResponse>(`/orders?${queryParams.toString()}`);
        return response;
    },

    // Get a specific order by ID
    getOrder: async (orderId: string): Promise<Order> => {
        const response = await api.get<Order>(`/orders/${orderId}`);
        return response;
    },

    // Cancel an order
    cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
        const response = await api.put<Order>(`/orders/${orderId}/cancel`, { reason });
        return response;
    },
};

export default orderService;