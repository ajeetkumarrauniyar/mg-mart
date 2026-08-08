import axios, { AxiosInstance, AxiosResponse, AxiosError, CancelTokenSource } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config, getApiTimeout, getTokenKey, isFeatureEnabled } from "@/config";

export type UnauthorizedCallback = () => void;
let onUnauthorizedCallback: UnauthorizedCallback | null = null;
export const setUnauthorizedCallback = (cb: UnauthorizedCallback) => {
  onUnauthorizedCallback = cb;
};

// Global state to manage API calls after logout
let isLoggedOut = false;
let pendingRequests: CancelTokenSource[] = [];

// Function to cancel all pending requests
const cancelAllPendingRequests = () => {
  console.log(`🚫 Cancelling ${pendingRequests.length} pending requests`);
  pendingRequests.forEach((source) => {
    try {
      source.cancel('Request cancelled due to logout');
    } catch (error) {
      // Ignore cancellation errors
    }
  });
  pendingRequests = [];
};
// Function to set logout state and cancel requests
export const setLogoutState = (loggedOut: boolean) => {
  isLoggedOut = loggedOut;
  if (loggedOut) {
    cancelAllPendingRequests();
  }
};

export const getDefaultHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

// API configuration using centralized config
export const getApiConfig = () => ({
  baseURL: config.environment.API_BASE_URL,
  timeout: getApiTimeout(),
  retryAttempts: config.api.RETRY_ATTEMPTS,
  retryDelay: config.api.RETRY_DELAY,
  enableLogging: isFeatureEnabled("ENABLE_API_LOGGING"),
});

const apiConfig = getApiConfig();

// Create axios instance with centralized configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (requestConfig) => {
    // Prevent API calls after logout
    if (isLoggedOut) {
      console.log('🚫 Blocking API call after logout:', requestConfig.url);
      throw new axios.Cancel('Request blocked - user logged out');
    }

    try {
      const token = await AsyncStorage.getItem(getTokenKey());
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Create cancel token for this request
      const cancelSource = axios.CancelToken.source();
      requestConfig.cancelToken = cancelSource.token;
      pendingRequests.push(cancelSource);

      // Log API calls if logging is enabled
      if (apiConfig.enableLogging) {
        console.log(
          `🌐 API ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`
        );
        if (requestConfig.data) {
          console.log("📤 Request data:", requestConfig.data);
        }
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Remove completed request from pending list
    const requestConfig = response.config;
    if (requestConfig.cancelToken) {
      pendingRequests = pendingRequests.filter(source =>
        source.token !== requestConfig.cancelToken
      );
    }

    // Log successful responses if logging is enabled
    if (apiConfig.enableLogging) {
      console.log(`✅ API Response ${response.status}:`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Handle cancelled requests
    if (axios.isCancel(error)) {
      console.log('🚫 Request cancelled:', error.message);
      return Promise.reject(error);
    }

    // Remove failed request from pending list
    const originalRequest = error.config;
    if (originalRequest?.cancelToken) {
      pendingRequests = pendingRequests.filter(source =>
        source.token !== originalRequest.cancelToken
      );
    }

    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && originalRequest && !isLoggedOut) {
      console.log('🚨 401 Unauthorized - Token expired or invalid');

      // Set logout state to prevent further API calls
      isLoggedOut = true;

      try {
        await AsyncStorage.removeItem(getTokenKey());

        // Clear auth state in store
        try {
          if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
          }
          console.log('✅ Auth state cleared due to 401 error');
        } catch (storeError) {
          console.error('Error clearing auth store:', storeError);
        }
      } catch (storageError) {
        console.error("Error removing auth token:", storageError);
      }

      // Cancel all pending requests
      cancelAllPendingRequests();
    }

    // Transform error for consistent handling
    const errorMessage =
      (error.response?.data as ApiError)?.message ||
      error.message ||
      "An error occurred";
    const transformedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(transformedError);
  }
);

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Generic API methods
export const api = {
  // GET request
  get: async <T>(url: string): Promise<T> => {
    const response = await apiClient.get(url);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post(url, data);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put(url, data);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete(url);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },
};

// Token management utilities using centralized configuration
export const tokenManager = {
  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(getTokenKey(), token);
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(getTokenKey());
  },

  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(getTokenKey());
  },
};

export default apiClient;
