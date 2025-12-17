// Environment configuration - App-level settings and environment variables
import type { EnvironmentConfig } from "./types";

// Validate required environment variables
const validateEnvironmentVariables = (): void => {
    const requiredVars = ["VITE_API_BASE_URL"];
    const missingVars = requiredVars.filter((varName) => !import.meta.env[varName]);

    if (missingVars.length > 0) {
        console.warn(
            `⚠️  Missing environment variables: ${missingVars.join(", ")}`
        );
        console.warn("📋 Using default values for missing variables");
    }
};

// Initialize validation
validateEnvironmentVariables();

// Get current environment from env vars
const currentEnv = import.meta.env.VITE_ENVIRONMENT || "production";

// Debug: Log environment configuration
console.log("🔧 Environment Configuration:");
console.log(`  📍 Current Environment: ${currentEnv.toUpperCase()}`);
console.log("  🌐 API Base URL:", import.meta.env.VITE_API_BASE_URL);
console.log("  📱 App Name:", import.meta.env.VITE_APP_NAME);

// Environment configuration object
export const environmentConfig: EnvironmentConfig = {
    // App Information
    APP_NAME: import.meta.env.VITE_APP_NAME || "MG Mart Admin Panel",
    APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

    // API Configuration
    API_BASE_URL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://mg-mart-server.onrender.com/api/v1",

    // Authentication
    TOKEN_KEY:
        import.meta.env.VITE_TOKEN_KEY ||
        "admin_JyFvcGFYRaQSZQeMFMqc6PTtMJtJYGQqp6VTqp38tOa3TycHs00HJp9PFSQA0THc",
};

// Environment helpers
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Helper to get environment-specific values with type safety
export const getEnvironmentValue = <K extends keyof EnvironmentConfig>(
    key: K
): EnvironmentConfig[K] => {
    return environmentConfig[key];
};

// Validate environment configuration
export const validateEnvironmentConfig = (
    config: EnvironmentConfig
): boolean => {
    const requiredFields: (keyof EnvironmentConfig)[] = [
        "APP_NAME",
        "APP_VERSION",
        "API_BASE_URL",
        "TOKEN_KEY",
    ];

    for (const field of requiredFields) {
        if (!config[field] || config[field].trim() === "") {
            throw new Error(
                `Environment configuration error: ${field} is required but not provided`
            );
        }
    }

    // Validate API_BASE_URL format
    try {
        new URL(config.API_BASE_URL);
    } catch {
        throw new Error(
            `Environment configuration error: API_BASE_URL must be a valid URL`
        );
    }

    return true;
};

// Initialize validation on module load
validateEnvironmentConfig(environmentConfig);

export default environmentConfig;