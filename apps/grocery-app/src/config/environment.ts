// Environment configuration - App-level settings and environment variables
import { EnvironmentConfig } from "./types";

// Validate required environment variables
const validateEnvironmentVariables = (): void => {
  const requiredVars = ["EXPO_PUBLIC_API_BASE_URL"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

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
const currentEnv = process.env.EXPO_PUBLIC_ENVIRONMENT || "production";

// Debug: Log environment configuration
console.log("🔧 Environment Configuration:");
console.log(`  📍 Current Environment: ${currentEnv.toUpperCase()}`);
console.log("  🌐 API Base URL:", process.env.EXPO_PUBLIC_API_BASE_URL);
console.log("  📱 App Name:", process.env.EXPO_PUBLIC_APP_NAME);
console.log("  ⏱️  Timeout:", process.env.EXPO_PUBLIC_API_TIMEOUT);

// Environment configuration object
export const environmentConfig: EnvironmentConfig = {
  // App Information
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || "MG Mart",
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",

  // API Configuration
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "https://mg-mart-server.onrender.com/api/v1",

  // Authentication
  TOKEN_KEY:
    process.env.EXPO_PUBLIC_TOKEN_KEY ||
    "JyFvcGFYRaQSZQeMFMqc6PTtMJtJYGQqp6VTqp38tOa3TycHs00HJp9PFSQA0THc",

  // External Resources
  POSTMAN_COLLECTION_URL:
    "https://www.postman.com/workspace/My-Workspace~c6b1a252-477e-401b-8588-4a6ee0641f9c/collection/29232448-ad68b495-12f5-41f3-8ec5-14b0d4f15fc0?action=share&creator=29232448&active-environment=29232448-a7ce7b0f-85c5-4d4b-931b-2739bf640577",
};

// Environment helpers - with fallback for cases where __DEV__ is not defined
export const isDevelopment =
  typeof __DEV__ !== "undefined"
    ? __DEV__
    : process.env.NODE_ENV === "development";
export const isProduction =
  typeof __DEV__ !== "undefined"
    ? !__DEV__
    : process.env.NODE_ENV === "production";

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
