// Debugging and development tools configuration
import { debugConfig, initializeDebugging as initDebugConfig } from "./debug";

// Initialize debugging tools using centralized configuration
export const initializeDebugger = () => {
  if (!debugConfig.ENABLE_DEBUG_MODE) return;

  // Enable console logging for Zustand stores
  if (debugConfig.ENABLE_ZUSTAND_DEVTOOLS) {
    // This would integrate with Redux DevTools if available
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
export const setupGlobalErrorHandler = () => {
  if (!debugConfig.ENABLE_DEBUG_MODE) return;

  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log errors with more context in development
    console.log("🚨 Error caught:", ...args);
    originalConsoleError(...args);
  };
};

// Initialize all debugging features using centralized configuration
export const initializeDebugging = () => {
  // Use the debug configuration initialization
  initDebugConfig();

  // Setup additional debugger features
  initializeDebugger();
  setupGlobalErrorHandler();
};
