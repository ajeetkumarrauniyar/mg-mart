// Configuration type definitions for the MG Mart Admin Panel

// API Endpoints structure
export interface AuthEndpoints {
    LOGIN: string;
    LOGOUT: string;
    REFRESH: string;
}

export interface ProductEndpoints {
    LIST: string;
    CREATE: string;
    DETAIL: (id: string) => string;
    UPDATE: (productId: string) => string;
    DELETE: (productId: string) => string;
}

export interface OrderEndpoints {
    LIST: string;
    DETAIL: (orderId: string) => string;
    UPDATE_STATUS: (orderId: string) => string;
    ANALYTICS: string;
}

export interface UserEndpoints {
    LIST: string;
    DETAIL: (userId: string) => string;
    UPDATE: (userId: string) => string;
    DELETE: (userId: string) => string;
}

export interface AdminEndpoints {
    DASHBOARD_STATS: string;
    ANALYTICS: string;
    SETTINGS: string;
}

export interface ApiEndpoints {
    AUTH: AuthEndpoints;
    PRODUCTS: ProductEndpoints;
    ORDERS: OrderEndpoints;
    USERS: UserEndpoints;
    ADMIN: AdminEndpoints;
}

// Environment configuration interface
export interface EnvironmentConfig {
    APP_NAME: string;
    APP_VERSION: string;
    API_BASE_URL: string;
    TOKEN_KEY: string;
}

// API configuration interface
export interface ApiConfig {
    TIMEOUT: number;
    RETRY_ATTEMPTS: number;
    RETRY_DELAY: number;
    ENDPOINTS: ApiEndpoints;
}

// Debug configuration interface
export interface DebugConfig {
    ENABLE_API_LOGGING: boolean;
    ENABLE_DEBUG_MODE: boolean;
    ENABLE_PERFORMANCE_MONITORING: boolean;
    ENABLE_ERROR_REPORTING: boolean;
}

// Main application configuration interface
export interface AppConfig {
    environment: EnvironmentConfig;
    api: ApiConfig;
    debug: DebugConfig;
    isDevelopment: boolean;
    isProduction: boolean;
}

// Configuration validation result
export interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// Helper types for configuration access
export type DebugFeature = keyof DebugConfig;
export type EnvironmentKey = keyof EnvironmentConfig;
export type ApiConfigKey = keyof ApiConfig;

// Configuration getter function types
export type ConfigGetter<T> = () => T;
export type FeatureChecker = (feature: DebugFeature) => boolean;
export type UrlBuilder = (endpoint: string) => string;