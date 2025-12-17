import { api } from "./apiService";
import { config } from "../config";

// Order types
export interface Order {
    id: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    shippingAddress: Address;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
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
    total: number;
    page: number;
    limit: number;
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
        return await api.patch<Order>(
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
};