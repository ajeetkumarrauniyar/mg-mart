// Configuration validation and error handling
import { AppConfig, ConfigValidationResult } from "./types";

// Configuration validation errors
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly errors: string[]
  ) {
    super(message);
    this.name = "ConfigurationError";
  }
}

// Detailed configuration validation
export const validateConfiguration = (
  config: AppConfig
): ConfigValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Environment configuration validation
  validateEnvironmentConfig(config, errors, warnings);

  // API configuration validation
  validateApiConfig(config, errors, warnings);

  // Debug configuration validation
  validateDebugConfig(config, errors, warnings);

  // Cross-configuration validation
  validateCrossConfiguration(config, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Environment configuration validation
const validateEnvironmentConfig = (
  config: AppConfig,
  errors: string[],
  warnings: string[]
): void => {
  const env = config.environment;

  // Required fields validation
  if (!env.APP_NAME?.trim()) {
    errors.push("Environment: APP_NAME is required and cannot be empty");
  }

  if (!env.APP_VERSION?.trim()) {
    errors.push("Environment: APP_VERSION is required and cannot be empty");
  } else if (!/^\d+\.\d+\.\d+$/.test(env.APP_VERSION)) {
    warnings.push(
      "Environment: APP_VERSION should follow semantic versioning (e.g., 1.0.0)"
    );
  }

  if (!env.API_BASE_URL?.trim()) {
    errors.push("Environment: API_BASE_URL is required and cannot be empty");
  } else {
    try {
      const url = new URL(env.API_BASE_URL);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.push(
          "Environment: API_BASE_URL must use HTTP or HTTPS protocol"
        );
      }
    } catch {
      errors.push("Environment: API_BASE_URL must be a valid URL");
    }
  }

  if (!env.TOKEN_KEY?.trim()) {
    errors.push("Environment: TOKEN_KEY is required and cannot be empty");
  } else if (env.TOKEN_KEY.length < 5) {
    warnings.push(
      "Environment: TOKEN_KEY should be at least 5 characters long for security"
    );
  }

  // URL validation for external resources
  if (env.POSTMAN_COLLECTION_URL && env.POSTMAN_COLLECTION_URL.trim()) {
    try {
      new URL(env.POSTMAN_COLLECTION_URL);
    } catch {
      warnings.push(
        "Environment: POSTMAN_COLLECTION_URL should be a valid URL if provided"
      );
    }
  }
};

// API configuration validation
const validateApiConfig = (
  config: AppConfig,
  errors: string[],
  warnings: string[]
): void => {
  const api = config.api;

  // Timeout validation
  if (typeof api.TIMEOUT !== "number" || api.TIMEOUT <= 0) {
    errors.push("API: TIMEOUT must be a positive number");
  } else if (api.TIMEOUT < 1000) {
    warnings.push(
      "API: TIMEOUT is very low (< 1 second), this may cause frequent timeouts"
    );
  } else if (api.TIMEOUT > 60000) {
    warnings.push(
      "API: TIMEOUT is very high (> 60 seconds), this may cause poor user experience"
    );
  }

  // Retry configuration validation
  if (typeof api.RETRY_ATTEMPTS !== "number" || api.RETRY_ATTEMPTS < 0) {
    errors.push("API: RETRY_ATTEMPTS must be a non-negative number");
  } else if (api.RETRY_ATTEMPTS > 5) {
    warnings.push(
      "API: RETRY_ATTEMPTS is high (> 5), this may cause long delays on failures"
    );
  }

  if (typeof api.RETRY_DELAY !== "number" || api.RETRY_DELAY < 0) {
    errors.push("API: RETRY_DELAY must be a non-negative number");
  } else if (api.RETRY_DELAY > 5000) {
    warnings.push(
      "API: RETRY_DELAY is high (> 5 seconds), this may cause long delays"
    );
  }

  // Endpoints validation
  const requiredEndpointCategories = [
    "AUTH",
    "PRODUCTS",
    "CART",
    "ORDERS",
    "USER",
  ] as const;

  for (const category of requiredEndpointCategories) {
    if (!api.ENDPOINTS[category]) {
      errors.push(`API: Missing endpoint category '${category}'`);
      continue;
    }

    // Validate specific endpoints for each category
    validateEndpointCategory(
      category,
      api.ENDPOINTS[category],
      errors,
      warnings
    );
  }
};

// Validate specific endpoint categories
const validateEndpointCategory = (
  category: string,
  endpoints: any,
  errors: string[],
  warnings: string[]
): void => {
  const requiredEndpoints: Record<string, string[]> = {
    AUTH: ["LOGIN", "REGISTER", "LOGOUT"],
    PRODUCTS: [
      "CREATE_PRODUCT",
      "LIST",
      "DETAIL",
      "UPDATE_PRODUCT",
      "DELETE_PRODUCT",
    ],
    CART: ["GET", "ADD_ITEM", "UPDATE_ITEM", "REMOVE_ITEM", "CLEAR"],
    ORDERS: ["CREATE", "LIST", "DETAIL", "CANCEL"],
    USER: ["PROFILE", "UPDATE_PROFILE", "CHANGE_PASSWORD", "DELETE_ACCOUNT"],
  };

  const required = requiredEndpoints[category] || [];

  for (const endpoint of required) {
    if (!endpoints[endpoint]) {
      errors.push(
        `API: Missing endpoint '${endpoint}' in category '${category}'`
      );
    } else {
      const value = endpoints[endpoint];
      if (typeof value === "string") {
        if (!value.startsWith("/")) {
          warnings.push(
            `API: Endpoint '${category}.${endpoint}' should start with '/'`
          );
        }
      } else if (typeof value !== "function") {
        errors.push(
          `API: Endpoint '${category}.${endpoint}' must be a string or function`
        );
      }
    }
  }
};

// Debug configuration validation
const validateDebugConfig = (
  config: AppConfig,
  errors: string[],
  warnings: string[]
): void => {
  const debug = config.debug;
  const debugKeys = Object.keys(debug) as (keyof typeof debug)[];

  for (const key of debugKeys) {
    if (typeof debug[key] !== "boolean") {
      errors.push(`Debug: ${key} must be a boolean value`);
    }
  }

  // Environment-specific warnings
  if (config.isProduction && debug.ENABLE_DEBUG_MODE) {
    warnings.push(
      "Debug: ENABLE_DEBUG_MODE is enabled in production environment"
    );
  }

  if (config.isProduction && debug.ENABLE_API_LOGGING) {
    warnings.push(
      "Debug: ENABLE_API_LOGGING is enabled in production environment"
    );
  }

  if (config.isDevelopment && !debug.ENABLE_DEBUG_MODE) {
    warnings.push(
      "Debug: ENABLE_DEBUG_MODE is disabled in development environment"
    );
  }
};

// Cross-configuration validation
const validateCrossConfiguration = (
  config: AppConfig,
  errors: string[],
  warnings: string[]
): void => {
  // Validate environment consistency
  if (config.isDevelopment === config.isProduction) {
    errors.push(
      "Configuration: isDevelopment and isProduction cannot have the same value"
    );
  }

  // Validate API timeout vs retry configuration
  const totalRetryTime = config.api.RETRY_ATTEMPTS * config.api.RETRY_DELAY;
  if (totalRetryTime > config.api.TIMEOUT) {
    warnings.push(
      "API: Total retry time exceeds timeout, some retries may not execute"
    );
  }
};

// Configuration health check with detailed reporting
export const performHealthCheck = (config: AppConfig): void => {
  const validation = validateConfiguration(config);

  if (!validation.isValid) {
    console.error("❌ Configuration validation failed:");
    validation.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });

    // In React Native, log the error but don't throw to prevent app crashes
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.error(
        "Configuration errors detected. Please fix the above issues."
      );
    } else {
      // Only throw in non-React Native environments or production
      throw new ConfigurationError(
        `Configuration validation failed with ${validation.errors.length} error(s)`,
        validation.errors
      );
    }
    return; // Exit early if validation failed
  }

  if (validation.warnings.length > 0) {
    console.warn("⚠️ Configuration warnings:");
    validation.warnings.forEach((warning, index) => {
      console.warn(`  ${index + 1}. ${warning}`);
    });
  }

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    if (validation.warnings.length === 0) {
      console.log("✅ Configuration validation passed with no warnings");
    } else {
      console.log(
        `✅ Configuration validation passed with ${validation.warnings.length} warning(s)`
      );
    }
  }
};

// Runtime configuration monitoring
export const createConfigurationMonitor = (config: AppConfig) => {
  return {
    // Check if configuration is still valid
    isValid: (): boolean => {
      try {
        const validation = validateConfiguration(config);
        return validation.isValid;
      } catch {
        return false;
      }
    },

    // Get current validation status
    getValidationStatus: (): ConfigValidationResult => {
      return validateConfiguration(config);
    },

    // Validate specific configuration section
    validateSection: (section: "environment" | "api" | "debug"): string[] => {
      const errors: string[] = [];
      const warnings: string[] = [];

      switch (section) {
        case "environment":
          validateEnvironmentConfig(config, errors, warnings);
          break;
        case "api":
          validateApiConfig(config, errors, warnings);
          break;
        case "debug":
          validateDebugConfig(config, errors, warnings);
          break;
      }

      return [...errors, ...warnings];
    },
  };
};
