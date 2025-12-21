import { api } from "./apiService";
import type { Order } from "@mg-mart/types";

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
    // Create a new order from user's cart
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        const response = await api.post<Order>("/orders", orderData);
        return response;
    },

    // Get all orders for the current user
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

    // Track order status (placeholder - not implemented on server yet)
    trackOrder: async (orderId: string): Promise<{
        order: Order;
        tracking: {
            status: string;
            statusHistory: Array<{
                status: string;
                timestamp: string;
                message: string;
            }>;
        };
    }> => {
        // For now, just return the order with basic tracking info
        const order = await orderService.getOrder(orderId);
        return {
            order,
            tracking: {
                status: order.status,
                statusHistory: [
                    {
                        status: order.status,
                        timestamp: order.updatedAt,
                        message: `Order is ${order.status}`,
                    },
                ],
            },
        };
    },
};

export default orderService;