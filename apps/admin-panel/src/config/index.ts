// Main configuration - Single entry point for all application configuration
import type { AppConfig, DebugFeature } from "./types";
import { environmentConfig, isDevelopment, isProduction } from "./environment";
import { apiConfig } from "./api";
import { debugConfig } from "./debug";

// Unified application configuration
export const config: AppConfig = {
    environment: environmentConfig,
    api: apiConfig,
    debug: debugConfig,
    isDevelopment,
    isProduction,
};

// Convenience helper functions for common configuration access patterns

/**
 * Build a complete API URL by combining base URL with endpoint
 */
export const getApiUrl = (endpoint: string): string => {
    const baseUrl = config.environment.API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Check if a debug feature is enabled
 */
export const isFeatureEnabled = (feature: DebugFeature): boolean => {
    return config.debug[feature];
};

/**
 * Get environment-specific API timeout
 */
export const getApiTimeout = (): number => {
    return config.isDevelopment ? 5000 : config.api.TIMEOUT;
};

/**
 * Get the authentication token key for storage
 */
export const getTokenKey = (): string => {
    return config.environment.TOKEN_KEY;
};

/**
 * Get app information
 */
export const getAppInfo = () => ({
    name: config.environment.APP_NAME,
    version: config.environment.APP_VERSION,
});

/**
 * Get retry configuration for API calls
 */
export const getRetryConfig = () => ({
    attempts: config.api.RETRY_ATTEMPTS,
    delay: config.api.RETRY_DELAY,
});

// Export individual configurations for specific use cases
export { environmentConfig } from "./environment";
export { apiConfig } from "./api";
export { debugConfig } from "./debug";

// Export types for external use
export type {
    AppConfig,
    EnvironmentConfig,
    ApiConfig,
    DebugConfig,
} from "./types";

// Default export
export default config;