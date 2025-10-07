// Debug configuration - Development and debugging settings
import { DebugConfig } from "./types";

// Debug configuration object - with safe __DEV__ handling
const isDevMode =
  typeof __DEV__ !== "undefined"
    ? __DEV__
    : process.env.NODE_ENV === "development";

export const debugConfig: DebugConfig = {
  // Core debugging features
  ENABLE_DEBUG_MODE: isDevMode,
  ENABLE_API_LOGGING: isDevMode,
  ENABLE_PERFORMANCE_MONITORING: isDevMode,

  // Development tools
  ENABLE_ZUSTAND_DEVTOOLS: isDevMode,
  ENABLE_NETWORK_INSPECTOR: isDevMode,

  // Error reporting (enabled in all environments)
  ENABLE_ERROR_REPORTING: true,
};

// Feature-specific debug flags
export const debugFlags = {
  AUTH: __DEV__,
  PRODUCTS: __DEV__,
  CART: __DEV__,
  NAVIGATION: __DEV__,
  PERSISTENCE: __DEV__,
  API: __DEV__,
  STORE: __DEV__,
} as const;

// Development utilities
export const devUtils = {
  // Log store state changes in development
  logStoreChanges: (
    storeName: string,
    prevState: any,
    nextState: any
  ): void => {
    if (!debugConfig.ENABLE_DEBUG_MODE) return;

    console.group(`🏪 ${storeName} State Change`);
    console.log("Previous:", prevState);
    console.log("Next:", nextState);
    console.groupEnd();
  },

  // Log API calls in development
  logApiCall: (method: string, url: string, data?: any): void => {
    if (!debugConfig.ENABLE_API_LOGGING) return;

    console.group(`🌐 API ${method.toUpperCase()} ${url}`);
    if (data) console.log("Data:", data);
    console.groupEnd();
  },

  // Performance timing utility
  timeFunction: <T>(name: string, fn: () => T): T => {
    if (!debugConfig.ENABLE_PERFORMANCE_MONITORING) {
      return fn();
    }

    console.time(name);
    const result = fn();
    console.timeEnd(name);
    return result;
  },

  // Log feature-specific debug messages
  logFeature: (
    feature: keyof typeof debugFlags,
    message: string,
    ...args: any[]
  ): void => {
    if (!debugFlags[feature]) return;

    console.log(`🔍 [${feature}]`, message, ...args);
  },

  // Log errors with enhanced context
  logError: (error: Error, context?: string): void => {
    if (!debugConfig.ENABLE_DEBUG_MODE) return;

    console.group(`🚨 Error${context ? ` in ${context}` : ""}`);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.groupEnd();
  },
};

// Debug initialization functions
export const initializeDebugger = (): void => {
  if (!debugConfig.ENABLE_DEBUG_MODE) return;

  // Enable console logging for Zustand stores
  if (debugConfig.ENABLE_ZUSTAND_DEVTOOLS) {
    console.log("🔧 Zustand DevTools enabled");
  }

  // Enable network request logging
  if (debugConfig.ENABLE_API_LOGGING) {
    console.log("🌐 API request logging enabled");
  }

  // Enable performance monitoring
  if (debugConfig.ENABLE_PERFORMANCE_MONITORING) {
    console.log("⚡ Performance monitoring enabled");
  }

  console.log("🐛 Debug mode initialized for MG-MART");
};

// Global error handler for development
export const setupGlobalErrorHandler = (): void => {
  if (!debugConfig.ENABLE_DEBUG_MODE) return;

  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log errors with more context in development
    console.log("🚨 Error caught:", ...args);
    originalConsoleError(...args);
  };
};

// Initialize all debugging features
export const initializeDebugging = (): void => {
  initializeDebugger();
  setupGlobalErrorHandler();
};

// Helper functions for debug configuration
export const isDebugEnabled = (feature?: keyof typeof debugFlags): boolean => {
  if (!feature) {
    return debugConfig.ENABLE_DEBUG_MODE;
  }
  return debugFlags[feature];
};

export const isFeatureEnabled = (feature: keyof DebugConfig): boolean => {
  return debugConfig[feature];
};

// Debug configuration validation
export const validateDebugConfig = (config: DebugConfig): boolean => {
  // Ensure all debug flags are boolean values
  const configKeys = Object.keys(config) as (keyof DebugConfig)[];

  for (const key of configKeys) {
    if (typeof config[key] !== "boolean") {
      throw new Error(
        `Debug configuration error: ${key} must be a boolean value`
      );
    }
  }

  return true;
};

// Initialize validation on module load
validateDebugConfig(debugConfig);

export default debugConfig;
