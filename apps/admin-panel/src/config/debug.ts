// Debug configuration - Development and debugging settings
import type { DebugConfig } from "./types";

// Debug configuration object
export const debugConfig: DebugConfig = {
    // API and network debugging
    ENABLE_API_LOGGING: import.meta.env.DEV || import.meta.env.VITE_ENABLE_API_LOGGING === "true",

    // General debug mode
    ENABLE_DEBUG_MODE: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_MODE === "true",

    // Performance monitoring
    ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === "true",

    // Error reporting
    ENABLE_ERROR_REPORTING: import.meta.env.PROD || import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true",
};

// Helper functions for debug configuration
export const isDebugEnabled = (feature: keyof DebugConfig): boolean => {
    return debugConfig[feature];
};

// Log debug configuration in development
if (import.meta.env.DEV) {
    console.log("🐛 Debug Configuration:");
    Object.entries(debugConfig).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
}

export default debugConfig;