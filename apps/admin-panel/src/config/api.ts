// API configuration - Endpoints, timeouts, and network settings
import type { ApiConfig, ApiEndpoints } from "./types";

// API Endpoints organized by feature area
const apiEndpoints: ApiEndpoints = {
    // Authentication endpoints
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
    },

    // Product management endpoints
    PRODUCTS: {
        LIST: "/products",
        CREATE: "/products",
        DETAIL: (productId: string) => `/products/${productId}`,
        UPDATE: (productId: string) => `/products/${productId}`,
        DELETE: (productId: string) => `/products/${productId}`,
    },

    // Order management endpoints
    ORDERS: {
        LIST: "/admin/orders",
        DETAIL: (orderId: string) => `/admin/orders/${orderId}`,
        UPDATE_STATUS: (orderId: string) => `/admin/orders/${orderId}/status`,
        ANALYTICS: "/admin/orders/analytics",
    },

    // User management endpoints
    USERS: {
        LIST: "/admin/users",
        DETAIL: (userId: string) => `/admin/users/${userId}`,
        UPDATE: (userId: string) => `/admin/users/${userId}`,
        DELETE: (userId: string) => `/admin/users/${userId}`,
    },

    // Admin-specific endpoints
    ADMIN: {
        DASHBOARD_STATS: "/admin/dashboard",
        ANALYTICS: "/admin/analytics",
        SETTINGS: "/admin/settings",
    },
};

// API configuration object
export const apiConfig: ApiConfig = {
    // Network timeouts and retry settings
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second

    // API endpoints
    ENDPOINTS: apiEndpoints,
};

// Helper functions for API configuration
export const getEndpoint = (
    category: keyof ApiEndpoints,
    endpoint: string
): string => {
    const categoryEndpoints = apiConfig.ENDPOINTS[category];
    if (!categoryEndpoints) {
        throw new Error(`API category '${category}' not found`);
    }

    const endpointValue = (categoryEndpoints as any)[endpoint];
    if (!endpointValue) {
        throw new Error(
            `Endpoint '${endpoint}' not found in category '${category}'`
        );
    }

    return typeof endpointValue === "function" ? endpointValue : endpointValue;
};

// Get timeout configuration based on environment
export const getApiTimeout = (): number => {
    // Shorter timeout in development for faster feedback
    return import.meta.env.DEV ? 5000 : apiConfig.TIMEOUT;
};

// Get retry configuration
export const getRetryConfig = () => ({
    attempts: apiConfig.RETRY_ATTEMPTS,
    delay: apiConfig.RETRY_DELAY,
});

// Validate API configuration
export const validateApiConfig = (config: ApiConfig): boolean => {
    // Validate timeout values
    if (config.TIMEOUT <= 0) {
        throw new Error("API configuration error: TIMEOUT must be greater than 0");
    }

    if (config.RETRY_ATTEMPTS < 0) {
        throw new Error(
            "API configuration error: RETRY_ATTEMPTS must be non-negative"
        );
    }

    if (config.RETRY_DELAY < 0) {
        throw new Error(
            "API configuration error: RETRY_DELAY must be non-negative"
        );
    }

    // Validate endpoints structure
    const requiredCategories: (keyof ApiEndpoints)[] = [
        "AUTH",
        "PRODUCTS",
        "ORDERS",
        "USERS",
        "ADMIN",
    ];

    for (const category of requiredCategories) {
        if (!config.ENDPOINTS[category]) {
            throw new Error(
                `API configuration error: Missing endpoint category '${category}'`
            );
        }
    }

    return true;
};

// Initialize validation on module load
validateApiConfig(apiConfig);

export default apiConfig;