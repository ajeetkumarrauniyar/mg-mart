import { api } from "./apiService";
import { config } from "../config";

// Dashboard types
export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    recentOrders: RecentOrder[];
    topProducts: TopProduct[];
}

export interface RecentOrder {
    id: string;
    customerName: string;
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
}

export interface TopProduct {
    id: string;
    name: string;
    sales: number;
    revenue: number;
}

export interface AnalyticsData {
    salesOverTime: SalesDataPoint[];
    ordersByStatus: OrderStatusCount[];
    topCategories: CategorySales[];
}

export interface SalesDataPoint {
    date: string;
    sales: number;
    orders: number;
}

export interface OrderStatusCount {
    status: string;
    count: number;
}

export interface CategorySales {
    category: string;
    sales: number;
    percentage: number;
}

// Dashboard service
export const dashboardService = {
    // Get dashboard statistics
    getStats: async (): Promise<DashboardStats> => {
        return await api.get<DashboardStats>(
            config.api.ENDPOINTS.ADMIN.DASHBOARD_STATS
        );
    },

    // Get analytics data
    getAnalytics: async (period: "7d" | "30d" | "90d" = "30d"): Promise<AnalyticsData> => {
        return await api.get<AnalyticsData>(
            `${config.api.ENDPOINTS.ADMIN.ANALYTICS}?period=${period}`
        );
    },
};