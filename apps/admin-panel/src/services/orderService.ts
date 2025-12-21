import { api } from "./apiService";
import { config } from "../config";

// Order types
export interface Order {
    orderId: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: Address;
    paymentDetails: {
        paymentMethod: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
}

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

export interface OrderListResponse {
    orders: Order[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface OrderFilters {
    status?: OrderStatus;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface OrderAnalytics {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: { status: OrderStatus; count: number }[];
    revenueByMonth: { month: string; revenue: number }[];
}

export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    statusBreakdown: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    averageOrderValue: number;
}

// Order service
export const orderService = {
    // Get all orders with filters
    getOrders: async (filters: OrderFilters = {}): Promise<OrderListResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const url = `${config.api.ENDPOINTS.ORDERS.LIST}?${params.toString()}`;
        return await api.get<OrderListResponse>(url);
    },

    // Get single order
    getOrder: async (orderId: string): Promise<Order> => {
        return await api.get<Order>(
            config.api.ENDPOINTS.ORDERS.DETAIL(orderId)
        );
    },

    // Update order status
    updateOrderStatus: async (
        orderId: string,
        status: OrderStatus
    ): Promise<Order> => {
        return await api.put<Order>(
            config.api.ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
            { status }
        );
    },

    // Get order analytics
    getAnalytics: async (period: "7d" | "30d" | "90d" = "30d"): Promise<OrderAnalytics> => {
        return await api.get<OrderAnalytics>(
            `${config.api.ENDPOINTS.ORDERS.ANALYTICS}?period=${period}`
        );
    },

    // Get order statistics (optional - gracefully handle if not available)
    getOrderStats: async (): Promise<OrderStats | null> => {
        try {
            return await api.get<OrderStats>(
                `${config.api.ENDPOINTS.ORDERS.LIST}/stats`
            );
        } catch (error) {
            console.warn('Order stats endpoint not available:', error);
            return null;
        }
    },

    // Bulk update order status (optional - gracefully handle if not available)
    bulkUpdateStatus: async (
        orderIds: string[],
        status: OrderStatus
    ): Promise<{ success: number; failed: number; errors: string[] } | null> => {
        try {
            return await api.put<{ success: number; failed: number; errors: string[] }>(
                `${config.api.ENDPOINTS.ORDERS.LIST}/bulk-status`,
                { orderIds, status }
            );
        } catch (error) {
            console.warn('Bulk update endpoint not available:', error);
            return null;
        }
    },

    // Export orders to CSV (optional - gracefully handle if not available)
    exportOrders: async (filters: OrderFilters = {}): Promise<Blob | null> => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });

            const url = `${config.api.ENDPOINTS.ORDERS.LIST}/export?${params.toString()}`;
            return await api.getBlob(url);
        } catch (error) {
            console.warn('Export endpoint not available:', error);
            return null;
        }
    },
};